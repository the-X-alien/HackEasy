import os
import json
import hashlib
import httpx
from typing import Optional
from .cache import HackEasyCache

class AIClient:
    def __init__(self, cache: Optional[HackEasyCache] = None):
        self.base_url = os.getenv("AI_API_BASE", "https://ai.hackclub.com/proxy/v1")
        self.api_key = os.getenv("AI_API_KEY", "")
        self.fallbacks = json.loads(os.getenv(
            "AI_MODEL_FALLBACKS",
            '["openai/gpt-4o-mini","mistralai/mistral-nemo","meta-llama/llama-3.1-8b-instruct","qwen/qwen-2.5-7b-instruct"]'
        ))
        self.cache = cache or HackEasyCache()
        self.client = httpx.Client(timeout=120.0)

    def _prompt_hash(self, model: str, system: str, prompt: str) -> str:
        raw = f"{model}|{system}|{prompt}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def chat(self, model: str, system: str, prompt: str, temperature: float = 0.7) -> str:
        cache_key = self._prompt_hash(model, system, prompt)
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        models_to_try = [model] + [m for m in self.fallbacks if m != model]

        for attempt_model in models_to_try:
            try:
                payload = {
                    "model": attempt_model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": temperature,
                }
                resp = self.client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if resp.status_code == 200:
                    result = resp.json()["choices"][0]["message"]["content"]
                    self.cache.set(cache_key, result)
                    return result
            except Exception:
                continue

        raise RuntimeError(f"All {len(models_to_try)} models failed for prompt")

    def chat_structured(self, model: str, system: str, prompt: str, schema: dict, temperature: float = 0.3) -> dict:
        cache_key = self._prompt_hash(f"{model}_json", system + json.dumps(schema), prompt)
        cached = self.cache.get(cache_key)
        if cached is not None:
            return json.loads(cached)

        raw = self.chat(model, system + "\nRespond ONLY with valid JSON matching this schema: " + json.dumps(schema), prompt, temperature)
        raw_clean = raw.strip().removeprefix("```json").removesuffix("```").strip()
        result = json.loads(raw_clean)
        self.cache.set(cache_key, raw_clean)
        return result

    def count_tokens(self, text: str) -> int:
        return len(text) // 4

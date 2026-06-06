import os
import json
import time
import hashlib
import threading
from pathlib import Path

class HackEasyCache:
    def __init__(self, cache_dir: str = None, ttl_seconds: int = 86400):
        self.cache_dir = Path(cache_dir or os.getenv("CACHE_DIR", ".hackeasy_cache"))
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl = ttl_seconds
        self._memory_cache: dict[str, tuple[str, float]] = {}
        self._lock = threading.Lock()

    def _key_to_path(self, key: str) -> Path:
        h = hashlib.sha256(key.encode()).hexdigest()
        return self.cache_dir / f"{h}.json"

    def get(self, key: str) -> str | None:
        with self._lock:
            if key in self._memory_cache:
                value, expiry = self._memory_cache[key]
                if time.time() < expiry:
                    return value
                del self._memory_cache[key]

        path = self._key_to_path(key)
        if not path.exists():
            return None
        try:
            data = json.loads(path.read_text())
            if time.time() < data["expiry"]:
                with self._lock:
                    self._memory_cache[key] = (data["value"], data["expiry"])
                return data["value"]
            path.unlink(missing_ok=True)
        except Exception:
            pass
        return None

    def set(self, key: str, value: str) -> None:
        expiry = time.time() + self.ttl
        with self._lock:
            self._memory_cache[key] = (value, expiry)
        path = self._key_to_path(key)
        path.write_text(json.dumps({"value": value, "expiry": expiry, "created": time.time()}))

    def clear(self) -> None:
        with self._lock:
            self._memory_cache.clear()
        for f in self.cache_dir.glob("*.json"):
            f.unlink(missing_ok=True)

    def prune(self) -> int:
        now = time.time()
        count = 0
        for f in self.cache_dir.glob("*.json"):
            try:
                data = json.loads(f.read_text())
                if now >= data["expiry"]:
                    f.unlink(missing_ok=True)
                    count += 1
            except Exception:
                f.unlink(missing_ok=True)
                count += 1
        with self._lock:
            self._memory_cache = {k: v for k, v in self._memory_cache.items() if v[1] > now}
        return count

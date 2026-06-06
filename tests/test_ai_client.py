import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from ai_client import AIClient


@pytest.fixture
def client():
    return AIClient(provider="hackclub")


class TestAIClient:
    @pytest.mark.asyncio
    async def test_generate_success(self, client):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json = MagicMock(return_value={
            "choices": [{"message": {"content": "Hello, world!"}}]
        })

        with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_response)):
            result = await client.generate("Say hello")
            assert result == "Hello, world!"

    @pytest.mark.asyncio
    async def test_generate_retry_on_500(self, client):
        mock_fail = MagicMock()
        mock_fail.status_code = 500
        mock_success = MagicMock()
        mock_success.status_code = 200
        mock_success.json = MagicMock(return_value={
            "choices": [{"message": {"content": "Recovered"}}]
        })

        mock_post = AsyncMock(side_effect=[mock_fail, mock_success])

        with patch("httpx.AsyncClient.post", new=mock_post):
            result = await client.generate("Try again")
            assert result == "Recovered"
            assert mock_post.call_count == 2

    @pytest.mark.asyncio
    async def test_generate_raises_on_max_retries(self, client):
        mock_fail = MagicMock()
        mock_fail.status_code = 503

        mock_post = AsyncMock(return_value=mock_fail)

        with patch("httpx.AsyncClient.post", new=mock_post):
            with pytest.raises(RuntimeError, match="AI provider failed after"):
                await client.generate("Will fail")

    @pytest.mark.asyncio
    async def test_generate_with_rubric(self, client):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json = MagicMock(return_value={
            "choices": [{"message": {"content": "Optimized code"}}]
        })

        with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_response)):
            result = await client.generate(
                "Build a login page",
                rubric={"security": 0.4, "ux": 0.3, "performance": 0.3}
            )
            assert result == "Optimized code"

    @pytest.mark.asyncio
    async def test_count_tokens(self, client):
        text = "hello world"
        count = client.count_tokens(text)
        assert count > 0
        assert isinstance(count, int)

    @pytest.mark.asyncio
    async def test_ollama_provider(self):
        c = AIClient(provider="ollama", model="llama3")
        assert c.provider == "ollama"
        assert c.model == "llama3"

    @pytest.mark.asyncio
    async def test_openai_provider(self):
        c = AIClient(provider="openai", api_key="sk-test")
        assert c.provider == "openai"

    @pytest.mark.asyncio
    async def test_generate_empty_prompt(self, client):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json = MagicMock(return_value={
            "choices": [{"message": {"content": ""}}]
        })

        with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_response)):
            result = await client.generate("")
            assert result == ""

    @pytest.mark.asyncio
    async def test_timeout(self, client):
        with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=TimeoutError("timeout"))):
            with pytest.raises(RuntimeError, match="AI request timed out"):
                await client.generate("Slow request", timeout=0.001)

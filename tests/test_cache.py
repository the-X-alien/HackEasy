import pytest
from unittest.mock import patch, MagicMock
from cache import Cache


@pytest.fixture
def cache(tmp_path):
    return Cache(str(tmp_path))


class TestCache:
    def test_set_and_get(self, cache):
        cache.set("key1", {"data": "hello"})
        assert cache.get("key1") == {"data": "hello"}

    def test_get_missing_key(self, cache):
        assert cache.get("nonexistent") is None

    def test_overwrite(self, cache):
        cache.set("key1", "value1")
        cache.set("key1", "value2")
        assert cache.get("key1") == "value2"

    def test_delete(self, cache):
        cache.set("key1", "value1")
        cache.delete("key1")
        assert cache.get("key1") is None

    def test_clear(self, cache):
        cache.set("a", 1)
        cache.set("b", 2)
        cache.clear()
        assert cache.get("a") is None
        assert cache.get("b") is None

    def test_has_key(self, cache):
        cache.set("key1", "value1")
        assert cache.has("key1") is True
        assert cache.has("missing") is False

    def test_expiry(self, cache):
        cache.set("key1", "value1", ttl_seconds=0)
        assert cache.get("key1") is None

    def test_persistence_across_instances(self, tmp_path):
        c1 = Cache(str(tmp_path))
        c1.set("persist", "data")
        c2 = Cache(str(tmp_path))
        assert c2.get("persist") == "data"

    @patch("cache.Cache._read_file")
    def test_corrupted_file(self, mock_read, cache):
        mock_read.side_effect = ValueError("corrupt")
        assert cache.get("anything") is None

    def test_large_values(self, cache):
        large = "x" * 100_000
        cache.set("large", large)
        assert cache.get("large") == large

    def test_many_keys(self, cache):
        for i in range(100):
            cache.set(f"key{i}", i)
        for i in range(100):
            assert cache.get(f"key{i}") == i

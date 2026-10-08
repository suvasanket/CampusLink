import hashlib
import json
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("campuslink.ai.cache")

CACHE_DIR = os.path.join(os.path.dirname(__file__), ".cache")
_memory_cache: Dict[str, Dict[str, Any]] = {}

def _get_hash(content: str) -> str:
    """Compute SHA-256 digest of document content."""
    return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()

def get_cached_result(content: str, doc_type: str = "jd") -> Optional[Dict[str, Any]]:
    """Check memory and disk cache for previously extracted document JSON."""
    key = f"{doc_type}_{_get_hash(content)}"

    # 1. Memory Cache
    if key in _memory_cache:
        logger.info(f"AI Cache Hit (memory): {key[:12]}...")
        return _memory_cache[key]

    # 2. Disk Cache
    cache_file = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            _memory_cache[key] = data
            logger.info(f"AI Cache Hit (disk): {key[:12]}...")
            return data
        except Exception as exc:
            logger.warning(f"Failed to read disk cache: {exc}")

    return None

def set_cached_result(content: str, data: Dict[str, Any], doc_type: str = "jd"):
    """Persist extraction JSON to memory and disk cache."""
    key = f"{doc_type}_{_get_hash(content)}"
    _memory_cache[key] = data

    try:
        os.makedirs(CACHE_DIR, exist_ok=True)
        cache_file = os.path.join(CACHE_DIR, f"{key}.json")
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        logger.info(f"AI Extraction cached to disk: {key[:12]}...")
    except Exception as exc:
        logger.warning(f"Failed to write disk cache: {exc}")

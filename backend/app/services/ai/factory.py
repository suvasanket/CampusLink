import logging
from app.services.ai.base import AIProvider
from app.services.ai.fixture_provider import FixtureFallbackProvider
from app.services.ai.groq_provider import GroqProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.core.config import settings

logger = logging.getLogger("campuslink.ai.factory")

_active_provider = None

def get_ai_provider() -> AIProvider:
    """Return configured AI Provider based on settings with automatic fallback."""
    global _active_provider
    if _active_provider is not None:
        return _active_provider

    provider_name = (settings.AI_PROVIDER or "fixture").lower()

    if provider_name == "groq" and settings.GROQ_API_KEY:
        logger.info("Initializing GroqProvider (LLaMA 3.3)...")
        _active_provider = GroqProvider()
    elif provider_name == "gemini" and settings.GEMINI_API_KEY:
        logger.info("Initializing GeminiProvider (Google Gemini)...")
        _active_provider = GeminiProvider()
    else:
        logger.info("Initializing FixtureFallbackProvider (zero-token offline mode)...")
        _active_provider = FixtureFallbackProvider()

    return _active_provider

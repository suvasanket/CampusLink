import json
import logging
from app.services.ai.base import AIProvider
from app.services.ai.cache import get_cached_result, set_cached_result
from app.services.ai.fixture_provider import FixtureFallbackProvider
from app.schemas.entities import JobRequirements, StudentProfile
from app.core.config import settings

logger = logging.getLogger("campuslink.ai.gemini")

class GeminiProvider(AIProvider):
    """
    Google Gemini free-tier provider adapter (gemini-1.5-flash / gemini-2.0-flash).
    Integrated with SHA-256 disk caching to minimize token usage.
    """

    def __init__(self):
        self.fallback = FixtureFallbackProvider()
        self.api_key = settings.GEMINI_API_KEY

    def parse_job_description(self, raw_text: str, company_name: str = "Company") -> JobRequirements:
        # 1. Check SHA-256 Cache
        cached = get_cached_result(raw_text, doc_type="jd")
        if cached:
            return JobRequirements(**cached)

        if not self.api_key:
            logger.info("GEMINI_API_KEY not set. Using zero-token fixture provider.")
            return self.fallback.parse_job_description(raw_text, company_name)

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            prompt = f"""
            Extract structured job requirements into JSON matching this schema:
            {{
              "id": "JOB_PARSED",
              "company": "{company_name}",
              "title": "<title>",
              "description": "<desc>",
              "minimum_cgpa": 7.0,
              "eligible_branches": ["CSE", "IT"],
              "max_backlogs": 0,
              "required_skills": ["Python"],
              "preferred_skills": ["SQL"],
              "experience_level": "Fresher"
            }}

            Text:
            \"\"\"{raw_text[:2000]}\"\"\"
            """
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            parsed_data = json.loads(text.strip())
            set_cached_result(raw_text, parsed_data, doc_type="jd")
            return JobRequirements(**parsed_data)
        except Exception as exc:
            logger.warning(f"Gemini JD extraction failed ({exc}). Falling back to fixture provider.")
            return self.fallback.parse_job_description(raw_text, company_name)

    def parse_resume(self, raw_text: str) -> StudentProfile:
        cached = get_cached_result(raw_text, doc_type="resume")
        if cached:
            return StudentProfile(**cached)

        if not self.api_key:
            return self.fallback.parse_resume(raw_text)

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            prompt = f"""
            Extract resume into valid JSON matching this schema:
            {{
              "id": "STU_PARSED",
              "name": "<name>",
              "branch": "CSE",
              "graduation_year": 2027,
              "cgpa": 8.0,
              "backlogs": 0,
              "skills": [{{"name": "<skill>", "level": 0.8}}],
              "projects": [{{"title": "<title>", "description": "<desc>", "technologies": ["Python"]}}],
              "assessment": {{"technical": 80.0, "aptitude": 80.0, "communication": 80.0}}
            }}

            Text:
            \"\"\"{raw_text[:2500]}\"\"\"
            """
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            parsed_data = json.loads(text.strip())
            set_cached_result(raw_text, parsed_data, doc_type="resume")
            return StudentProfile(**parsed_data)
        except Exception as exc:
            logger.warning(f"Gemini resume extraction failed ({exc}). Falling back to fixture.")
            return self.fallback.parse_resume(raw_text)

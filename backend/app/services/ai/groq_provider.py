import json
import logging
from app.services.ai.base import AIProvider
from app.services.ai.cache import get_cached_result, set_cached_result
from app.services.ai.fixture_provider import FixtureFallbackProvider
from app.schemas.entities import JobRequirements, StudentProfile
from app.core.config import settings

logger = logging.getLogger("campuslink.ai.groq")

class GroqProvider(AIProvider):
    """
    Groq Cloud free-tier provider utilizing LLaMA 3.3 for high-speed structured extraction.
    Integrated with SHA-256 disk caching to minimize token usage.
    """

    def __init__(self):
        self.fallback = FixtureFallbackProvider()
        self.api_key = settings.GROQ_API_KEY

    def parse_job_description(self, raw_text: str, company_name: str = "Company") -> JobRequirements:
        # 1. Check SHA-256 Cache
        cached = get_cached_result(raw_text, doc_type="jd")
        if cached:
            return JobRequirements(**cached)

        # 2. Check API key presence
        if not self.api_key:
            logger.info("GROQ_API_KEY not set. Using zero-token fixture provider.")
            return self.fallback.parse_job_description(raw_text, company_name)

        try:
            from groq import Groq
            client = Groq(api_key=self.api_key)
            prompt = f"""
            Extract structured campus job requirements from this text into valid JSON matching this schema:
            {{
              "id": "JOB_PARSED",
              "company": "{company_name}",
              "title": "<role title>",
              "description": "<summary>",
              "minimum_cgpa": <float 0-10>,
              "eligible_branches": ["<branch1>", "<branch2>"],
              "max_backlogs": <int>,
              "required_skills": ["<skill1>", "<skill2>"],
              "preferred_skills": ["<skill1>", "<skill2>"],
              "experience_level": "Fresher"
            }}

            Raw Text:
            \"\"\"{raw_text[:2000]}\"\"\"
            """

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a recruitment extraction parser. Output only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            content = response.choices[0].message.content
            parsed_data = json.loads(content)
            parsed_data["company"] = company_name or parsed_data.get("company", "Company")
            
            # Cache output
            set_cached_result(raw_text, parsed_data, doc_type="jd")
            return JobRequirements(**parsed_data)
        except Exception as exc:
            logger.warning(f"Groq API extraction failed ({exc}). Falling back to fixture provider.")
            return self.fallback.parse_job_description(raw_text, company_name)

    def parse_resume(self, raw_text: str) -> StudentProfile:
        cached = get_cached_result(raw_text, doc_type="resume")
        if cached:
            return StudentProfile(**cached)

        if not self.api_key:
            return self.fallback.parse_resume(raw_text)

        try:
            from groq import Groq
            client = Groq(api_key=self.api_key)
            prompt = f"""
            Extract candidate resume into valid JSON matching this schema:
            {{
              "id": "STU_PARSED",
              "name": "<candidate name>",
              "branch": "<CSE/IT/ECE/MECH>",
              "graduation_year": 2027,
              "cgpa": <float>,
              "backlogs": <int>,
              "skills": [{{"name": "<skill>", "level": <0.0-1.0>}}],
              "projects": [{{"title": "<title>", "description": "<desc>", "technologies": ["<tech>"]}}],
              "assessment": {{"technical": 80.0, "aptitude": 80.0, "communication": 80.0}}
            }}

            Resume Text:
            \"\"\"{raw_text[:2500]}\"\"\"
            """

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an ATS resume parser. Output only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            content = response.choices[0].message.content
            parsed_data = json.loads(content)
            set_cached_result(raw_text, parsed_data, doc_type="resume")
            return StudentProfile(**parsed_data)
        except Exception as exc:
            logger.warning(f"Groq resume extraction failed ({exc}). Falling back to fixture.")
            return self.fallback.parse_resume(raw_text)

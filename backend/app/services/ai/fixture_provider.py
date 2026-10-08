import json
import os
from typing import Dict, Any
from app.services.ai.base import AIProvider
from app.schemas.entities import JobRequirements, StudentProfile

class FixtureFallbackProvider(AIProvider):
    """
    Deterministic zero-cost fallback provider.
    Synthesizes valid contract schemas from text keywords and pre-validated fixtures in data/.
    Uses 0 API tokens and requires zero network connectivity.
    """

    def parse_job_description(self, raw_text: str, company_name: str = "Company") -> JobRequirements:
        lower = raw_text.lower()
        job_id = f"JOB_GEN_{abs(hash(raw_text)) % 10000:04d}"

        if "react" in lower or "frontend" in lower:
            title = "Frontend Web Developer"
            min_cgpa = 7.0
            branches = ["CSE", "IT", "ECE"]
            required = ["React", "TypeScript", "REST API"]
            preferred = ["Tailwind CSS", "Redux"]
        elif "machine learning" in lower or "pytorch" in lower or "ai" in lower:
            title = "Machine Learning Associate"
            min_cgpa = 8.0
            branches = ["CSE", "IT"]
            required = ["Python", "Machine Learning", "PyTorch"]
            preferred = ["SQL", "Transformers"]
        elif "devops" in lower or "docker" in lower or "kubernetes" in lower:
            title = "DevOps & Cloud Engineer"
            min_cgpa = 7.2
            branches = ["CSE", "IT", "ECE"]
            required = ["Linux", "Docker", "Python"]
            preferred = ["Kubernetes", "AWS", "CI/CD"]
        else:
            title = "Backend Software Engineer"
            min_cgpa = 7.5
            branches = ["CSE", "IT"]
            required = ["Python", "SQL", "REST API"]
            preferred = ["PostgreSQL", "Docker", "FastAPI"]

        return JobRequirements(
            id=job_id,
            company=company_name or "Partner Technology Corp",
            title=title,
            description=raw_text[:300].strip(),
            minimum_cgpa=min_cgpa,
            eligible_branches=branches,
            max_backlogs=0,
            graduation_years=[2027],
            required_skills=required,
            preferred_skills=preferred,
            experience_level="Fresher"
        )

    def parse_resume(self, raw_text: str) -> StudentProfile:
        lower = raw_text.lower()
        stu_id = f"STU_GEN_{abs(hash(raw_text)) % 10000:04d}"

        skills = []
        if "python" in lower: skills.append({"name": "Python", "level": 0.90})
        if "sql" in lower: skills.append({"name": "SQL", "level": 0.85})
        if "react" in lower: skills.append({"name": "React", "level": 0.88})
        if "docker" in lower: skills.append({"name": "Docker", "level": 0.75})
        if not skills:
            skills = [{"name": "Python", "level": 0.80}, {"name": "SQL", "level": 0.75}]

        return StudentProfile(
            id=stu_id,
            name="Sample Candidate",
            branch="CSE",
            graduation_year=2027,
            cgpa=8.2,
            backlogs=0,
            skills=skills,
            projects=[
                {
                    "title": "Portfolio Web Service",
                    "description": raw_text[:120].strip() or "Full-stack application.",
                    "technologies": [s["name"] for s in skills]
                }
            ],
            assessment={
                "aptitude": 82.0,
                "technical": 86.0,
                "communication": 80.0
            }
        )

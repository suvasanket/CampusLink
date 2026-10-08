import pytest
from app.models.entities import Student, Job
from app.services.scoring import calculate_composite_score, classify_category

def test_scoring_weights_and_factors():
    student = Student(
        id="STU_SCORE1",
        name="Scoring Student",
        branch="CSE",
        cgpa=9.0,
        backlogs=0,
        skills=[
            {"name": "Python", "level": 0.95},
            {"name": "SQL", "level": 0.90},
            {"name": "REST API", "level": 0.85},
            {"name": "PostgreSQL", "level": 0.88}
        ],
        projects=[
            {
                "title": "Backend Microservice",
                "description": "Built asynchronous REST APIs with Python and PostgreSQL.",
                "technologies": ["Python", "PostgreSQL", "REST API"]
            }
        ],
        certifications=[
            {"title": "AWS Cloud Practitioner", "issuer": "AWS", "year": 2024}
        ],
        assessment={
            "technical": 92.0,
            "aptitude": 88.0,
            "communication": 85.0
        }
    )
    job = Job(
        id="JOB_SCORE1",
        company="TechCorp",
        title="Backend Software Engineer",
        description="Experience developing backend REST APIs using Python and SQL.",
        minimum_cgpa=7.0,
        eligible_branches=["CSE"],
        max_backlogs=0,
        required_skills=["Python", "SQL", "REST API"],
        preferred_skills=["PostgreSQL"]
    )
    score, breakdown, matched_req, missing_req, matched_pref, missing_pref = calculate_composite_score(student, job)
    
    assert 0.0 <= score <= 100.0
    assert score >= 80.0  # Strong alignment
    assert breakdown.skills >= 85.0
    assert breakdown.academics == 90.0
    assert len(missing_req) == 0
    assert "PostgreSQL" in matched_pref

    cat = classify_category(score, is_eligible=True)
    assert cat == "Suitable"

def test_ineligible_categorization():
    cat = classify_category(92.0, is_eligible=False)
    assert cat == "Ineligible"

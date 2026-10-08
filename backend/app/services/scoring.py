from typing import Dict, List, Tuple
from app.models.entities import Student, Job
from app.schemas.entities import ScoreBreakdown
from app.core.config import settings
from app.services.embeddings import compute_project_job_similarity

# Normalized skill alias map
SKILL_ALIASES = {
    "reactjs": "react",
    "react.js": "react",
    "postgres": "postgresql",
    "postgre sql": "postgresql",
    "nodejs": "node.js",
    "node js": "node.js",
    "fast api": "fastapi",
    "aws cloud": "aws",
    "amazon web services": "aws",
    "k8s": "kubernetes",
    "ml": "machine learning",
    "deep learning": "machine learning",
    "restful api": "rest api",
    "restful apis": "rest api",
    "rest apis": "rest api",
}

def normalize_skill(name: str) -> str:
    """Normalize skill name string to lower-case canonical form."""
    cleaned = name.strip().lower()
    return SKILL_ALIASES.get(cleaned, cleaned)

def calculate_skill_subscore(student: Student, job: Job) -> Tuple[float, List[str], List[str], List[str], List[str]]:
    """
    Computes skill score s1 (0-100) and returns:
    (score, matched_required, missing_required, matched_preferred, missing_preferred)
    """
    student_skills_map = {
        normalize_skill(s.get("name", "")): float(s.get("level", 0.8))
        for s in (student.skills or [])
    }

    matched_required = []
    missing_required = []
    req_levels = []

    required_skills = job.required_skills or []
    for req in required_skills:
        norm_req = normalize_skill(req)
        if norm_req in student_skills_map:
            matched_required.append(req)
            req_levels.append(student_skills_map[norm_req])
        else:
            missing_required.append(req)
            req_levels.append(0.0)

    # Base required score (scaled to 100)
    if required_skills:
        avg_req_level = sum(req_levels) / len(required_skills)
        base_skill_score = avg_req_level * 100.0
    else:
        base_skill_score = 80.0

    # Preferred skills bonus (up to +10%)
    matched_preferred = []
    missing_preferred = []
    preferred_skills = job.preferred_skills or []
    for pref in preferred_skills:
        norm_pref = normalize_skill(pref)
        if norm_pref in student_skills_map:
            matched_preferred.append(pref)
        else:
            missing_preferred.append(pref)

    preferred_bonus = 0.0
    if preferred_skills:
        pref_ratio = len(matched_preferred) / len(preferred_skills)
        preferred_bonus = pref_ratio * 10.0

    final_skill_score = min(100.0, max(0.0, base_skill_score + preferred_bonus))
    return (
        round(final_skill_score, 1),
        matched_required,
        missing_required,
        matched_preferred,
        missing_preferred
    )

def calculate_composite_score(student: Student, job: Job) -> Tuple[float, ScoreBreakdown, List[str], List[str], List[str], List[str]]:
    """
    Computes composite score S in [0, 100] across 6 weighted factors.
    Returns:
        (composite_score, ScoreBreakdown, matched_req, missing_req, matched_pref, missing_pref)
    """
    # 1. Skill Similarity (40%)
    s1, matched_req, missing_req, matched_pref, missing_pref = calculate_skill_subscore(student, job)

    # 2. Project Relevance (20%)
    s2 = compute_project_job_similarity(
        student.projects or [],
        job.description or "",
        job.title or ""
    )

    # 3. Academic Profile (15%)
    s3 = min(100.0, max(0.0, (student.cgpa / 10.0) * 100.0))

    # 4. Assessment Score (10%)
    assess = student.assessment or {}
    tech = float(assess.get("technical", 70.0))
    apt = float(assess.get("aptitude", 70.0))
    s4 = 0.6 * tech + 0.4 * apt

    # 5. Certifications Relevance (10%)
    cert_count = len(student.certifications or [])
    if cert_count == 0:
        s5 = 50.0
    elif cert_count == 1:
        s5 = 78.0
    elif cert_count == 2:
        s5 = 90.0
    else:
        s5 = 98.0

    # 6. Communication (5%)
    comm = float(assess.get("communication", 70.0))
    s6 = comm

    weights = settings.SCORING_WEIGHTS
    composite = (
        weights["skills"] * s1 +
        weights["projects"] * s2 +
        weights["academics"] * s3 +
        weights["assessment"] * s4 +
        weights["certifications"] * s5 +
        weights["communication"] * s6
    )

    composite = round(min(100.0, max(0.0, composite)), 1)

    breakdown = ScoreBreakdown(
        skills=round(s1, 1),
        projects=round(s2, 1),
        academics=round(s3, 1),
        assessment=round(s4, 1),
        certifications=round(s5, 1),
        communication=round(s6, 1)
    )

    return composite, breakdown, matched_req, missing_req, matched_pref, missing_pref

def classify_category(score: float, is_eligible: bool) -> str:
    """Classify candidate match tier based on contract thresholds."""
    if not is_eligible:
        return "Ineligible"
    if score >= 85.0:
        return "Highly Suitable"
    if score >= 70.0:
        return "Suitable"
    if score >= 50.0:
        return "Potential Fit"
    return "Not Recommended"

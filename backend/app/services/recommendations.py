from typing import List, Tuple
from app.models.entities import Student, Job
from app.schemas.entities import (
    StudentReadinessResponse,
    ReadinessFactorScores,
    SkillGapResponse
)
from app.services.scoring import normalize_skill

def compute_student_readiness(student: Student) -> StudentReadinessResponse:
    """
    Evaluates general employability readiness independently of a single job.
    Formula:
    Readiness = 0.35 * Tech + 0.25 * Projects + 0.20 * Academics + 0.15 * Assess + 0.05 * Comm
    """
    assess = student.assessment or {}
    tech_score = float(assess.get("technical", 70.0))
    apt_score = float(assess.get("aptitude", 70.0))
    comm_score = float(assess.get("communication", 70.0))

    # Academic score (0-100)
    acad_score = min(100.0, max(0.0, (student.cgpa / 10.0) * 100.0))

    # Project depth score (0-100) based on project count and technology breadth
    projects = student.projects or []
    proj_depth = min(100.0, len(projects) * 45.0)

    # Assessments score (0-100)
    assessments_combined = 0.6 * tech_score + 0.4 * apt_score

    factor_scores = ReadinessFactorScores(
        technical_skills=round(tech_score, 1),
        project_depth=round(proj_depth, 1),
        academics=round(acad_score, 1),
        assessments=round(assessments_combined, 1),
        communication=round(comm_score, 1)
    )

    readiness = (
        0.35 * tech_score +
        0.25 * proj_depth +
        0.20 * acad_score +
        0.15 * assessments_combined +
        0.05 * comm_score
    )
    readiness = round(min(100.0, max(0.0, readiness)), 1)

    if readiness >= 80.0:
        tier = "Highly Employable"
    elif readiness >= 65.0:
        tier = "Ready"
    elif readiness >= 50.0:
        tier = "Developing"
    else:
        tier = "Not Ready"

    recommendations: List[str] = []
    if proj_depth < 70.0:
        recommendations.append("Build a production-ready portfolio project featuring database persistence and containerized deployment.")
    if tech_score < 80.0:
        recommendations.append("Strengthen core data structures, algorithms, and asynchronous programming fundamentals.")
    if comm_score < 75.0:
        recommendations.append("Participate in mock technical interviews to refine professional articulation and behavioral delivery.")
    if not student.certifications:
        recommendations.append("Earn an industry-standard cloud certification (e.g., AWS Cloud Practitioner or Docker Certified Associate).")
    if not recommendations:
        recommendations.append("Maintain strong competitive programming cadence and rehearse system design architectural trade-offs.")

    return StudentReadinessResponse(
        student_id=student.id,
        student_name=student.name,
        readiness_score=readiness,
        tier=tier,
        factor_scores=factor_scores,
        recommendations=recommendations
    )

def compute_skill_gaps(student: Student, job: Job) -> SkillGapResponse:
    """
    Computes exact skill coverage and categorized gaps (Required vs Preferred) for a target role.
    """
    student_skills_map = {
        normalize_skill(s.get("name", "")): float(s.get("level", 0.8))
        for s in (student.skills or [])
    }

    matched_required = []
    missing_required = []
    for req in (job.required_skills or []):
        if normalize_skill(req) in student_skills_map:
            matched_required.append(req)
        else:
            missing_required.append(req)

    matched_preferred = []
    missing_preferred = []
    for pref in (job.preferred_skills or []):
        if normalize_skill(pref) in student_skills_map:
            matched_preferred.append(pref)
        else:
            missing_preferred.append(pref)

    total_requirements = len(job.required_skills or []) + len(job.preferred_skills or [])
    total_matched = len(matched_required) + len(matched_preferred)
    coverage = round((total_matched / total_requirements * 100.0) if total_requirements > 0 else 100.0, 1)

    actionable_steps: List[str] = []
    for missing in missing_required:
        actionable_steps.append(f"Priority 1 (Mandatory): Complete hands-on tutorial and build a sample project using {missing}.")
    for missing in missing_preferred:
        actionable_steps.append(f"Priority 2 (Bonus): Familiarize with {missing} fundamentals to improve interview edge.")

    if not actionable_steps:
        actionable_steps.append("Complete alignment achieved! Review company-specific interview archives and system design case studies.")

    return SkillGapResponse(
        student_id=student.id,
        job_id=job.id,
        matched_required_skills=matched_required,
        missing_required_skills=missing_required,
        matched_preferred_skills=matched_preferred,
        missing_preferred_skills=missing_preferred,
        coverage_percentage=coverage,
        actionable_next_steps=actionable_steps
    )

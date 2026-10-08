from typing import List
from app.models.entities import Student, Job
from app.schemas.entities import ScoreBreakdown

def generate_grounded_explanation(
    student: Student,
    job: Job,
    is_eligible: bool,
    breakdown: ScoreBreakdown,
    matched_required: List[str],
    missing_required: List[str],
    matched_preferred: List[str],
    missing_preferred: List[str],
    ineligibility_reasons: List[str]
) -> tuple[List[str], str]:
    """
    Produces deterministic, fact-grounded strengths and explanation paragraph.
    Never relies on hallucinated assumptions or unverified traits.
    Returns:
        (strengths: List[str], explanation: str)
    """
    strengths: List[str] = []

    if not is_eligible:
        reason_summary = "; ".join(ineligibility_reasons)
        explanation = f"Candidate disqualified from consideration due to mandatory eligibility constraints: {reason_summary}."
        return strengths, explanation

    # 1. Evaluate Skill Overlap
    if matched_required:
        matched_str = ", ".join(matched_required[:3])
        strengths.append(f"Strong verified proficiency in required skills: {matched_str}")

    # 2. Evaluate Projects
    if breakdown.projects >= 75.0 and student.projects:
        top_proj = student.projects[0].get("title", "Portfolio project")
        strengths.append(f"Relevant practical project implementation: '{top_proj}'")

    # 3. Evaluate Academics
    if student.cgpa >= job.minimum_cgpa + 0.5:
        strengths.append(f"Exceeds minimum CGPA cutoff ({student.cgpa:.1f} vs required {job.minimum_cgpa:.1f})")

    # 4. Evaluate Assessments
    assess = student.assessment or {}
    tech = assess.get("technical", 0)
    if tech >= 85:
        strengths.append(f"Exceptional technical assessment benchmark ({tech}th percentile/score)")

    # 5. Evaluate Certifications
    if student.certifications:
        top_cert = student.certifications[0].get("title", "")
        if top_cert:
            strengths.append(f"Holds industry accreditation: {top_cert}")

    # Synthesize grounded explanation summary
    explanation_parts = []
    if breakdown.skills >= 85.0:
        explanation_parts.append(f"High technical alignment with {job.title} requirements")
    elif breakdown.skills >= 70.0:
        explanation_parts.append(f"Moderate alignment with core {job.title} stack")
    else:
        explanation_parts.append(f"Partial technical overlap with {job.title} stack")

    if not missing_required:
        explanation_parts.append("complete coverage of mandatory skills")
    else:
        missing_str = ", ".join(missing_required)
        explanation_parts.append(f"notable gap in required skills ({missing_str})")

    if missing_preferred:
        pref_str = ", ".join(missing_preferred[:2])
        explanation_parts.append(f"desirable additions: {pref_str}")

    explanation = ". ".join(s.capitalize() for s in explanation_parts) + "."
    return strengths, explanation

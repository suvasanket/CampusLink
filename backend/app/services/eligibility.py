from typing import List, Tuple
from app.models.entities import Student, Job

def evaluate_eligibility(student: Student, job: Job) -> Tuple[bool, List[str], List[str]]:
    """
    Evaluates hard eligibility deterministically without any LLM calls.
    Returns:
        (is_eligible, passing_reasons, failed_requirements)
    """
    passing_reasons: List[str] = []
    failed_requirements: List[str] = []

    # 1. CGPA Criterion
    if student.cgpa >= job.minimum_cgpa:
        passing_reasons.append(
            f"CGPA {student.cgpa:.1f} satisfies minimum requirement ({job.minimum_cgpa:.1f})"
        )
    else:
        failed_requirements.append(
            f"CGPA {student.cgpa:.1f} is below cutoff threshold of {job.minimum_cgpa:.1f}"
        )

    # 2. Discipline / Branch Whitelist
    eligible_branches_upper = [b.strip().upper() for b in (job.eligible_branches or [])]
    if not eligible_branches_upper or student.branch.strip().upper() in eligible_branches_upper:
        passing_reasons.append(f"Branch '{student.branch}' is eligible")
    else:
        allowed_str = ", ".join(job.eligible_branches)
        failed_requirements.append(
            f"Branch '{student.branch}' is not in eligible disciplines ({allowed_str})"
        )

    # 3. Active Backlogs Criterion
    if student.backlogs <= job.max_backlogs:
        if student.backlogs == 0:
            passing_reasons.append("Zero active backlogs")
        else:
            passing_reasons.append(
                f"Active backlogs ({student.backlogs}) within tolerated limit ({job.max_backlogs})"
            )
    else:
        failed_requirements.append(
            f"Active backlogs ({student.backlogs}) exceeds maximum allowed ({job.max_backlogs})"
        )

    # 4. Graduation Year (if specified)
    if job.graduation_years and student.graduation_year:
        if student.graduation_year in job.graduation_years:
            passing_reasons.append(f"Graduation batch {student.graduation_year} eligible")
        else:
            batches_str = ", ".join(map(str, job.graduation_years))
            failed_requirements.append(
                f"Graduation batch {student.graduation_year} does not match target ({batches_str})"
            )

    is_eligible = len(failed_requirements) == 0
    return is_eligible, passing_reasons, failed_requirements

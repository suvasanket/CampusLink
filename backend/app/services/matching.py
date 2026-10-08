from typing import List
from app.models.entities import Student, Job
from app.schemas.entities import CandidateMatchItem, JobMatchResult, ScoreBreakdown
from app.services.eligibility import evaluate_eligibility
from app.services.scoring import calculate_composite_score, classify_category
from app.services.explanations import generate_grounded_explanation

def match_candidates_for_job(
    job: Job,
    students: List[Student],
    include_ineligible: bool = True,
    limit: int = 50
) -> JobMatchResult:
    """
    Orchestrates candidate matching pipeline:
    1. Deterministic eligibility filtering
    2. Multi-factor weighted scoring & vector alignment
    3. Ground-truth explainability & skill gap audit
    4. Deterministic rank ordering
    """
    eligible_matches: List[CandidateMatchItem] = []
    ineligible_matches: List[CandidateMatchItem] = []

    for student in students:
        is_eligible, pass_reasons, ineligibility_reasons = evaluate_eligibility(student, job)
        
        score, breakdown, matched_req, missing_req, matched_pref, missing_pref = calculate_composite_score(student, job)
        category = classify_category(score, is_eligible)

        strengths, explanation = generate_grounded_explanation(
            student=student,
            job=job,
            is_eligible=is_eligible,
            breakdown=breakdown,
            matched_required=matched_req,
            missing_required=missing_req,
            matched_preferred=matched_pref,
            missing_preferred=missing_pref,
            ineligibility_reasons=ineligibility_reasons
        )

        match_item = CandidateMatchItem(
            student_id=student.id,
            student_name=student.name,
            branch=student.branch,
            cgpa=student.cgpa,
            rank=1,  # Initialized and reassigned after sorting
            eligible=is_eligible,
            match_score=score if is_eligible else 0.0,
            category=category,
            breakdown=breakdown,
            strengths=strengths,
            skill_gaps=missing_req,
            preferred_skill_gaps=missing_pref,
            explanation=explanation,
            ineligibility_reasons=ineligibility_reasons if not is_eligible else []
        )

        if is_eligible:
            eligible_matches.append(match_item)
        else:
            ineligible_matches.append(match_item)

    # Deterministic Rank Sorting: Eligible candidates strictly descending by match_score
    eligible_matches.sort(key=lambda item: item.match_score, reverse=True)
    for idx, item in enumerate(eligible_matches, start=1):
        item.rank = idx

    # If requested, append ineligible candidates ranked after all eligible candidates
    if include_ineligible:
        start_rank = len(eligible_matches) + 1
        for idx, item in enumerate(ineligible_matches, start=start_rank):
            item.rank = idx
        all_matches = eligible_matches + ineligible_matches
    else:
        all_matches = eligible_matches

    # Apply pagination limit
    all_matches = all_matches[:limit]

    return JobMatchResult(
        job_id=job.id,
        job_title=job.title,
        company=job.company,
        total_evaluated=len(students),
        total_eligible=len(eligible_matches),
        matches=all_matches
    )

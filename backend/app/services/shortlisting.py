from typing import List, Set, Optional, Tuple, Dict
from sqlalchemy.orm import Session

from app.models.entities import Student, Job, Application
from app.schemas.entities import (
    AutoShortlistCriteria,
    AutoShortlistCandidatePreview,
    AutoShortlistPreviewResponse,
    AutoShortlistExecuteResponse,
    CandidateMatchItem
)
from app.services.matching import match_candidates_for_job

def filter_candidates_by_criteria(
    matches: List[CandidateMatchItem],
    criteria: AutoShortlistCriteria
) -> List[CandidateMatchItem]:
    """
    Deterministic rule engine filtering candidates based on the specified auto-shortlist strategy.
    Disqualified (ineligible) candidates are strictly excluded.
    """
    eligible = [m for m in matches if m.eligible]

    if criteria.strategy == "top_n":
        limit_n = criteria.top_n if criteria.top_n is not None else 10
        return eligible[:limit_n]

    elif criteria.strategy == "min_score":
        cutoff = criteria.min_score if criteria.min_score is not None else 70.0
        return [m for m in eligible if m.match_score >= cutoff]

    elif criteria.strategy == "category":
        target_cats = set(criteria.categories or ["Highly Suitable", "Suitable"])
        return [m for m in eligible if m.category in target_cats]

    elif criteria.strategy == "custom":
        qualified = eligible
        if criteria.min_score is not None:
            qualified = [m for m in qualified if m.match_score >= criteria.min_score]
        if criteria.branches:
            branch_set = {b.strip().upper() for b in criteria.branches if b.strip()}
            if branch_set and "ALL" not in branch_set:
                qualified = [m for m in qualified if (m.branch or "").strip().upper() in branch_set]
        if criteria.min_cgpa is not None:
            qualified = [m for m in qualified if (m.cgpa or 0.0) >= criteria.min_cgpa]
        if criteria.must_have_all_required_skills:
            qualified = [m for m in qualified if len(m.skill_gaps or []) == 0]
        if criteria.top_n is not None and criteria.top_n > 0:
            qualified = qualified[:criteria.top_n]
        return qualified

    # Fallback to Top 10
    limit_n = criteria.top_n if criteria.top_n is not None else 10
    return eligible[:limit_n]

def compute_auto_shortlist_preview(
    job: Job,
    students: List[Student],
    criteria: AutoShortlistCriteria,
    existing_shortlisted_ids: Set[str]
) -> AutoShortlistPreviewResponse:
    """
    Evaluates students for a job and simulates auto-shortlisting telemetry
    without writing or modifying any records in the database.
    """
    if not students:
        return AutoShortlistPreviewResponse(
            job_id=job.id,
            job_title=job.title,
            company=job.company,
            total_evaluated=0,
            total_qualified=0,
            already_shortlisted_count=0,
            newly_shortlisted_count=0,
            avg_match_score=0.0,
            candidates=[]
        )

    # Compute matches for full cohort
    match_result = match_candidates_for_job(
        job=job,
        students=students,
        include_ineligible=False,
        limit=len(students)
    )

    qualified_matches = filter_candidates_by_criteria(match_result.matches, criteria)

    previews: List[AutoShortlistCandidatePreview] = []
    for item in qualified_matches:
        previews.append(AutoShortlistCandidatePreview(
            student_id=item.student_id,
            student_name=item.student_name,
            branch=item.branch or "",
            cgpa=item.cgpa or 0.0,
            rank=item.rank,
            match_score=item.match_score,
            category=item.category,
            already_shortlisted=(item.student_id in existing_shortlisted_ids)
        ))

    already_count = sum(1 for p in previews if p.already_shortlisted)
    new_count = len(previews) - already_count
    avg_score = round(sum(p.match_score for p in previews) / len(previews), 1) if previews else 0.0

    return AutoShortlistPreviewResponse(
        job_id=job.id,
        job_title=job.title,
        company=job.company,
        total_evaluated=len(students),
        total_qualified=len(previews),
        already_shortlisted_count=already_count,
        newly_shortlisted_count=new_count,
        avg_match_score=avg_score,
        candidates=previews
    )

def execute_auto_shortlist(
    db: Session,
    job: Job,
    students: List[Student],
    criteria: AutoShortlistCriteria
) -> AutoShortlistExecuteResponse:
    """
    Executes auto-shortlisting and commits applications idempotently.
    Existing shortlisted candidates are preserved without duplicate records.
    """
    # 1. Fetch current applications for this job
    existing_apps = db.query(Application).filter(Application.job_id == job.id).all()
    existing_map: Dict[str, Application] = {app.student_id: app for app in existing_apps}

    # 2. Compute matches
    match_result = match_candidates_for_job(
        job=job,
        students=students,
        include_ineligible=False,
        limit=len(students)
    )

    qualified_matches = filter_candidates_by_criteria(match_result.matches, criteria)

    new_apps_count = 0
    already_count = 0
    created_app_ids: List[int] = []

    for item in qualified_matches:
        if item.student_id in existing_map:
            already_count += 1
            created_app_ids.append(existing_map[item.student_id].id)
        else:
            note_text = criteria.notes or f"Auto-shortlisted ({criteria.strategy}, Rank #{item.rank})"
            new_app = Application(
                job_id=job.id,
                student_id=item.student_id,
                status="Shortlisted",
                match_score=item.match_score,
                notes=note_text
            )
            db.add(new_app)
            db.flush()  # populate new_app.id
            created_app_ids.append(new_app.id)
            new_apps_count += 1

    db.commit()

    total_count = len(qualified_matches)
    msg = f"Successfully auto-shortlisted {new_apps_count} candidates ({already_count} were already shortlisted)."

    return AutoShortlistExecuteResponse(
        job_id=job.id,
        total_shortlisted=total_count,
        newly_shortlisted_count=new_apps_count,
        already_shortlisted_count=already_count,
        message=msg,
        application_ids=created_app_ids
    )

def bulk_shortlist_students(
    db: Session,
    job: Job,
    student_ids: List[str],
    notes: Optional[str] = "Bulk shortlisted"
) -> Tuple[int, int, List[int]]:
    """
    Shortlists an explicit list of student IDs (e.g. from table or checkbox selection).
    Returns (total_shortlisted, newly_added_count, app_ids).
    """
    existing_apps = db.query(Application).filter(Application.job_id == job.id).all()
    existing_map: Dict[str, Application] = {app.student_id: app for app in existing_apps}

    new_count = 0
    app_ids: List[int] = []

    # Get student scores if available
    students = db.query(Student).filter(Student.id.in_(student_ids)).all()
    match_result = match_candidates_for_job(job=job, students=students, include_ineligible=True, limit=len(students))
    score_map = {m.student_id: m.match_score for m in match_result.matches}

    for sid in student_ids:
        if sid in existing_map:
            app_ids.append(existing_map[sid].id)
        else:
            new_app = Application(
                job_id=job.id,
                student_id=sid,
                status="Shortlisted",
                match_score=score_map.get(sid, 75.0),
                notes=notes
            )
            db.add(new_app)
            db.flush()
            app_ids.append(new_app.id)
            new_count += 1

    db.commit()
    return len(student_ids), new_count, app_ids

def clear_job_shortlists(
    db: Session,
    job_id: str,
    student_ids: Optional[List[str]] = None
) -> int:
    """
    Clears shortlisted applications for a job. If student_ids is provided,
    only clears those specific students; otherwise clears all applications for the job.
    Returns the number of deleted records.
    """
    query = db.query(Application).filter(Application.job_id == job_id)
    if student_ids is not None:
        query = query.filter(Application.student_id.in_(student_ids))

    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return deleted_count

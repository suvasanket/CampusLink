from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.db.session import get_db, active_db_type
from app.core.config import settings
from app.models.entities import Student, Job, MatchRecord, Institution, Company, Application
from app.schemas.entities import (
    StudentProfile,
    JobRequirements,
    JobParseRequest,
    JobMatchResult,
    StudentReadinessResponse,
    SkillGapResponse,
    ResumeParseRequest,
    ApplicationCreate,
    ApplicationResponse
)
from app.services.matching import match_candidates_for_job
from app.services.recommendations import compute_student_readiness, compute_skill_gaps

logger = logging.getLogger("campuslink.api")
router = APIRouter()

# --- System Health ---
@router.get("/health", tags=["Health"])
def health_check():
    """System health and database connectivity probe."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": active_db_type,
        "ai_provider": settings.AI_PROVIDER
    }

# --- Jobs Endpoints ---
@router.get("/jobs", response_model=List[JobRequirements], tags=["Jobs"])
def list_jobs(db: Session = Depends(get_db)):
    """Retrieve all available job postings."""
    jobs = db.query(Job).all()
    return jobs

@router.get("/jobs/{job_id}", response_model=JobRequirements, tags=["Jobs"])
def get_job(job_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with id '{job_id}' not found."
        )
    return job

@router.post("/jobs", response_model=JobRequirements, status_code=status.HTTP_201_CREATED, tags=["Jobs"])
def create_job(job_in: JobRequirements, db: Session = Depends(get_db)):
    """Create or ingest a structured job requirement."""
    existing = db.query(Job).filter(Job.id == job_in.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Job with ID '{job_in.id}' already exists."
        )
    job = Job(**job_in.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.post("/jobs/parse", response_model=JobRequirements, tags=["Jobs"])
def parse_job(request: JobParseRequest):
    """Parse unstructured JD text into structured JobRequirements using active AI provider."""
    from app.services.ai.factory import get_ai_provider
    provider = get_ai_provider()
    return provider.parse_job_description(request.raw_text, request.company_name or "Company")

# --- Candidate Matching Engine Endpoint ---
@router.get("/jobs/{job_id}/matches", response_model=JobMatchResult, tags=["Matching"])
def get_job_matches(
    job_id: str,
    include_ineligible: bool = Query(True, description="Include candidates failing hard eligibility at bottom"),
    limit: int = Query(50, ge=1, le=100, description="Max candidates to return"),
    db: Session = Depends(get_db)
):
    """
    Core Intelligence Pipeline:
    Evaluates all students against the specified job, applying deterministic eligibility filtering,
    6-factor weighted scoring, local zero-token vector matching, and factual grounded explainability.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with id '{job_id}' not found."
        )
    
    students = db.query(Student).all()
    if not students:
        return JobMatchResult(
            job_id=job.id,
            job_title=job.title,
            company=job.company,
            total_evaluated=0,
            total_eligible=0,
            matches=[]
        )

    match_result = match_candidates_for_job(
        job=job,
        students=students,
        include_ineligible=include_ineligible,
        limit=limit
    )
    return match_result

# --- Students Endpoints ---
@router.get("/students", response_model=List[StudentProfile], tags=["Students"])
def list_students(
    branch: Optional[str] = Query(None, description="Filter by discipline (CSE, IT, ECE, etc.)"),
    min_cgpa: Optional[float] = Query(None, ge=0.0, le=10.0),
    db: Session = Depends(get_db)
):
    """Retrieve students with optional discipline and CGPA filters."""
    query = db.query(Student)
    if branch:
        query = query.filter(Student.branch.ilike(branch.strip()))
    if min_cgpa is not None:
        query = query.filter(Student.cgpa >= min_cgpa)
    return query.all()

@router.get("/students/{student_id}", response_model=StudentProfile, tags=["Students"])
def get_student(student_id: str, db: Session = Depends(get_db)):
    """Retrieve profile for an individual student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id '{student_id}' not found."
        )
    return student

@router.post("/students", response_model=StudentProfile, status_code=status.HTTP_201_CREATED, tags=["Students"])
def create_student(student_in: StudentProfile, db: Session = Depends(get_db)):
    """Ingest a new student profile."""
    existing = db.query(Student).filter(Student.id == student_in.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student with ID '{student_in.id}' already exists."
        )
    student = Student(**student_in.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

# --- Student Readiness & Diagnostics Endpoints ---
@router.get("/students/{student_id}/readiness", response_model=StudentReadinessResponse, tags=["Diagnostics"])
def get_student_readiness(student_id: str, db: Session = Depends(get_db)):
    """Compute overall employability readiness score and tier classification."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id '{student_id}' not found."
        )
    return compute_student_readiness(student)

@router.get("/students/{student_id}/skill-gaps/{job_id}", response_model=SkillGapResponse, tags=["Diagnostics"])
def get_student_skill_gaps(student_id: str, job_id: str, db: Session = Depends(get_db)):
    """Analyze exact skill gaps and actionable recommendations for a specific job."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{student_id}' not found.")
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job '{job_id}' not found.")
    return compute_skill_gaps(student, job)

@router.post("/students/parse-resume", response_model=StudentProfile, tags=["Students"])
def parse_resume(
    request: ResumeParseRequest,
    save: bool = Query(False, description="Persist parsed student to database"),
    db: Session = Depends(get_db)
):
    """Parse candidate resume into structured StudentProfile using active AI provider."""
    from app.services.ai.factory import get_ai_provider
    provider = get_ai_provider()
    profile = provider.parse_resume(request.raw_text)
    
    if save:
        existing = db.query(Student).filter(Student.id == profile.id).first()
        if existing:
            for k, v in profile.model_dump().items():
                setattr(existing, k, v)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_stu = Student(**profile.model_dump())
            db.add(new_stu)
            db.commit()
            db.refresh(new_stu)
            return new_stu

    return profile

# --- Applications & Shortlists Endpoints ---
@router.get("/applications", response_model=List[ApplicationResponse], tags=["Applications"])
def list_applications(
    job_id: Optional[str] = Query(None, description="Filter by job ID"),
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    status: Optional[str] = Query(None, description="Filter by status (Shortlisted, Interview, Offered, Rejected)"),
    db: Session = Depends(get_db)
):
    """Retrieve recruitment applications and shortlists across jobs and candidates."""
    query = db.query(Application)
    if job_id:
        query = query.filter(Application.job_id == job_id)
    if student_id:
        query = query.filter(Application.student_id == student_id)
    if status:
        query = query.filter(Application.status == status)

    apps = query.order_by(Application.created_at.desc()).all()
    results = []
    for app in apps:
        stu = db.query(Student).filter(Student.id == app.student_id).first()
        job = db.query(Job).filter(Job.id == app.job_id).first()
        results.append(ApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            student_id=app.student_id,
            student_name=stu.name if stu else "Unknown Candidate",
            job_title=job.title if job else "Unknown Job",
            company=job.company if job else "Unknown Company",
            status=app.status,
            match_score=app.match_score,
            notes=app.notes,
            created_at=app.created_at.isoformat() if app.created_at else None
        ))
    return results

@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED, tags=["Applications"])
def create_or_update_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    """Shortlist a candidate or update an existing application's status."""
    existing = db.query(Application).filter(
        Application.job_id == app_in.job_id,
        Application.student_id == app_in.student_id
    ).first()

    stu = db.query(Student).filter(Student.id == app_in.student_id).first()
    job = db.query(Job).filter(Job.id == app_in.job_id).first()

    if existing:
        existing.status = app_in.status or existing.status
        if app_in.match_score is not None:
            existing.match_score = app_in.match_score
        if app_in.notes is not None:
            existing.notes = app_in.notes
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        new_app = Application(
            job_id=app_in.job_id,
            student_id=app_in.student_id,
            status=app_in.status or "Shortlisted",
            match_score=app_in.match_score,
            notes=app_in.notes
        )
        db.add(new_app)
        db.commit()
        db.refresh(new_app)
        target = new_app

    return ApplicationResponse(
        id=target.id,
        job_id=target.job_id,
        student_id=target.student_id,
        student_name=stu.name if stu else "Unknown Candidate",
        job_title=job.title if job else "Unknown Job",
        company=job.company if job else "Unknown Company",
        status=target.status,
        match_score=target.match_score,
        notes=target.notes,
        created_at=target.created_at.isoformat() if target.created_at else None
    )

@router.delete("/applications/{app_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Applications"])
def delete_application(app_id: int, db: Session = Depends(get_db)):
    """Remove an application or shortlist."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
    db.delete(app)
    db.commit()
    return None

# --- Institution Portal Statistics ---
@router.get("/institution/stats", tags=["Institution"])
def get_institution_stats(db: Session = Depends(get_db)):
    """Return cohort-level readiness distribution, application counts, and branch summary."""
    students = db.query(Student).all()
    jobs = db.query(Job).all()
    total_shortlists = db.query(Application).filter(Application.status == "Shortlisted").count()
    total_interviews = db.query(Application).filter(Application.status == "Interview").count()
    total_offers = db.query(Application).filter(Application.status == "Offered").count()

    tier_counts = {
        "Highly Employable": 0,
        "Ready": 0,
        "Developing": 0,
        "Not Ready": 0
    }
    branch_counts = {}

    for s in students:
        readiness_resp = compute_student_readiness(s)
        tier = readiness_resp.tier
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
        
        b = s.branch.upper()
        if b not in branch_counts:
            branch_counts[b] = {"total": 0, "avg_cgpa": 0.0, "total_cgpa": 0.0}
        branch_counts[b]["total"] += 1
        branch_counts[b]["total_cgpa"] += s.cgpa

    for b, data in branch_counts.items():
        if data["total"] > 0:
            data["avg_cgpa"] = round(data["total_cgpa"] / data["total"], 2)
        del data["total_cgpa"]

    return {
        "total_students": len(students),
        "total_jobs": len(jobs),
        "total_shortlists": total_shortlists,
        "total_interviews": total_interviews,
        "total_offers": total_offers,
        "readiness_distribution": tier_counts,
        "branch_summary": branch_counts
    }


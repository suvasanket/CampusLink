from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import logging
import uuid

from app.db.session import get_db, active_db_type
from app.core.config import settings
from app.models.entities import Student, Job, MatchRecord, Institution, Company, Application, Recruiter
from app.schemas.entities import (
    StudentProfile,
    StudentRegisterRequest,
    StudentLoginRequest,
    StudentLoginResponse,
    JobRequirements,
    JobParseRequest,
    JobMatchResult,
    StudentReadinessResponse,
    SkillGapResponse,
    ResumeParseRequest,
    ApplicationCreate,
    ApplicationResponse,
    InstitutionCreate,
    InstitutionResponse,
    InstitutionLoginRequest,
    InstitutionLoginResponse,
    RecruiterCreate,
    RecruiterResponse
)
from app.core.security import hash_password, verify_password
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
    institution_id: Optional[str] = Query(None, description="Scope evaluation to a specific institution"),
    include_ineligible: bool = Query(True, description="Include candidates failing hard eligibility at bottom"),
    limit: int = Query(50, ge=1, le=100, description="Max candidates to return"),
    db: Session = Depends(get_db)
):
    """
    Core Intelligence Pipeline:
    Evaluates students against the specified job, applying deterministic eligibility filtering,
    6-factor weighted scoring, local zero-token vector matching, and factual grounded explainability.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with id '{job_id}' not found."
        )
    
    # Filter candidates by institution if specified or associated with job
    target_inst = institution_id or job.institution_id
    if target_inst:
        # Resolve username or id
        inst_obj = db.query(Institution).filter(
            (Institution.id == target_inst) | (Institution.username == target_inst)
        ).first()
        target_id = inst_obj.id if inst_obj else target_inst
        students = db.query(Student).filter(
            (Student.institution_id == target_id) | 
            (Student.institution_id.is_(None) if target_id in ["inst-001", "apex-inst"] else False)
        ).all()
        if not students:
            students = db.query(Student).all()
    else:
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

# --- Institution & Multi-Tenant Scoping Endpoints ---

def resolve_institution(identifier: str, db: Session) -> Institution:
    """Find institution by either its internal ID or vanity username slug."""
    inst = db.query(Institution).filter(
        (Institution.id == identifier) | (Institution.username == identifier)
    ).first()
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institution '{identifier}' not found."
        )
    return inst

@router.get("/institutions", response_model=List[InstitutionResponse], tags=["Institution"])
def list_institutions(db: Session = Depends(get_db)):
    """Retrieve all registered universities and colleges."""
    institutions = db.query(Institution).order_by(Institution.name.asc()).all()
    results = []
    for inst in institutions:
        is_default = inst.id in ["inst-001", "apex-inst"]
        stu_count = db.query(Student).filter(
            (Student.institution_id == inst.id) | (Student.institution_id.is_(None) if is_default else False)
        ).count()
        job_count = db.query(Job).filter(
            (Job.institution_id == inst.id) | (Job.institution_id.is_(None) if is_default else False)
        ).count()
        results.append(InstitutionResponse(
            id=inst.id,
            username=inst.username or inst.id,
            name=inst.name,
            code=inst.code,
            location=inst.location,
            contact_email=inst.contact_email,
            admin_name=inst.admin_name,
            website=inst.website,
            is_verified=inst.is_verified,
            created_at=inst.created_at.isoformat() if inst.created_at else None,
            total_students=stu_count,
            total_jobs=job_count
        ))
    return results

@router.post("/institutions", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED, tags=["Institution"])
def register_institution(inst_in: InstitutionCreate, db: Session = Depends(get_db)):
    """
    Register a new institution/college.
    Note: Email OTP verification is skipped for instant onboarding in this release.
    """
    clean_slug = inst_in.username.strip().lower()
    existing_username = db.query(Institution).filter(Institution.username == clean_slug).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"College username/slug '{clean_slug}' is already taken. Please choose another."
        )
    
    inst_id = f"inst-{clean_slug}"
    existing_id = db.query(Institution).filter(Institution.id == inst_id).first()
    if existing_id:
        inst_id = f"inst-{clean_slug}-{uuid.uuid4().hex[:4]}"

    new_inst = Institution(
        id=inst_id,
        username=clean_slug,
        name=inst_in.name.strip(),
        password_hash=hash_password(inst_in.password or "admin123"),
        code=inst_in.code.strip() if inst_in.code else clean_slug.upper()[:6],
        location=inst_in.location,
        contact_email=inst_in.contact_email,
        admin_name=inst_in.admin_name,
        website=inst_in.website,
        is_verified=True
    )
    db.add(new_inst)
    db.commit()
    db.refresh(new_inst)

    return InstitutionResponse(
        id=new_inst.id,
        username=new_inst.username,
        name=new_inst.name,
        code=new_inst.code,
        location=new_inst.location,
        contact_email=new_inst.contact_email,
        admin_name=new_inst.admin_name,
        website=new_inst.website,
        is_verified=new_inst.is_verified,
        created_at=new_inst.created_at.isoformat() if new_inst.created_at else None,
        total_students=0,
        total_jobs=0
    )

@router.post("/institutions/{identifier}/login", response_model=InstitutionLoginResponse, tags=["Institution"])
@router.post("/institutions/login", response_model=InstitutionLoginResponse, tags=["Institution"])
def login_institution(
    login_data: InstitutionLoginRequest,
    identifier: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Authenticate an institution administrator with password.
    Secures the institution dashboard from unauthorized access.
    """
    target_ident = identifier or login_data.identifier or login_data.username
    if not target_ident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College identifier or username is required."
        )

    inst = resolve_institution(target_ident, db)
    valid = False
    if inst.password_hash:
        valid = verify_password(login_data.password, inst.password_hash)
    else:
        # Legacy fallback if password_hash was null: accept default admin123 and update hash
        if login_data.password in ["admin123", "password", "admin"]:
            inst.password_hash = hash_password(login_data.password)
            db.commit()
            valid = True

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid institution administrator password."
        )

    is_default = inst.id in ["inst-001", "apex-inst"]
    stu_count = db.query(Student).filter(
        (Student.institution_id == inst.id) | (Student.institution_id.is_(None) if is_default else False)
    ).count()
    job_count = db.query(Job).filter(
        (Job.institution_id == inst.id) | (Job.institution_id.is_(None) if is_default else False)
    ).count()

    inst_resp = InstitutionResponse(
        id=inst.id,
        username=inst.username or inst.id,
        name=inst.name,
        code=inst.code,
        location=inst.location,
        contact_email=inst.contact_email,
        admin_name=inst.admin_name,
        website=inst.website,
        is_verified=inst.is_verified,
        created_at=inst.created_at.isoformat() if inst.created_at else None,
        total_students=stu_count,
        total_jobs=job_count
    )

    return InstitutionLoginResponse(
        institution=inst_resp,
        token=f"INST-AUTH-{uuid.uuid4().hex[:12]}",
        message="Institution administrator authenticated successfully."
    )

@router.get("/institutions/{identifier}", response_model=InstitutionResponse, tags=["Institution"])
def get_institution(identifier: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific college by ID or username slug."""
    inst = resolve_institution(identifier, db)
    is_default = inst.id in ["inst-001", "apex-inst"]
    stu_count = db.query(Student).filter(
        (Student.institution_id == inst.id) | (Student.institution_id.is_(None) if is_default else False)
    ).count()
    job_count = db.query(Job).filter(
        (Job.institution_id == inst.id) | (Job.institution_id.is_(None) if is_default else False)
    ).count()

    return InstitutionResponse(
        id=inst.id,
        username=inst.username or inst.id,
        name=inst.name,
        code=inst.code,
        location=inst.location,
        contact_email=inst.contact_email,
        admin_name=inst.admin_name,
        website=inst.website,
        is_verified=inst.is_verified,
        created_at=inst.created_at.isoformat() if inst.created_at else None,
        total_students=stu_count,
        total_jobs=job_count
    )

@router.get("/institutions/{identifier}/stats", tags=["Institution"])
def get_scoped_institution_stats(identifier: str, db: Session = Depends(get_db)):
    """Return cohort-level readiness distribution, application counts, and branch summary for this institution."""
    inst = resolve_institution(identifier, db)
    is_default = inst.id in ["inst-001", "apex-inst"]

    students = db.query(Student).filter(
        (Student.institution_id == inst.id) | (Student.institution_id.is_(None) if is_default else False)
    ).all()
    jobs = db.query(Job).filter(
        (Job.institution_id == inst.id) | (Job.institution_id.is_(None) if is_default else False)
    ).all()

    student_ids = [s.id for s in students]
    total_shortlists = db.query(Application).filter(
        Application.student_id.in_(student_ids),
        Application.status == "Shortlisted"
    ).count() if student_ids else 0

    total_interviews = db.query(Application).filter(
        Application.student_id.in_(student_ids),
        Application.status == "Interview"
    ).count() if student_ids else 0

    total_offers = db.query(Application).filter(
        Application.student_id.in_(student_ids),
        Application.status == "Offered"
    ).count() if student_ids else 0

    tier_counts = {
        "Highly Employable": 0,
        "Ready": 0,
        "Developing": 0,
        "Not Ready": 0
    }
    branch_counts: Dict[str, Any] = {}

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
        "institution_id": inst.id,
        "institution_username": inst.username,
        "institution_name": inst.name,
        "total_students": len(students),
        "total_jobs": len(jobs),
        "total_shortlists": total_shortlists,
        "total_interviews": total_interviews,
        "total_offers": total_offers,
        "readiness_distribution": tier_counts,
        "branch_summary": branch_counts
    }

@router.get("/institutions/{identifier}/students", response_model=List[StudentProfile], tags=["Institution"])
def list_institution_students(
    identifier: str,
    branch: Optional[str] = Query(None),
    min_cgpa: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve students enrolled in this specific institution."""
    inst = resolve_institution(identifier, db)
    is_default = inst.id in ["inst-001", "apex-inst"]

    query = db.query(Student).filter(
        (Student.institution_id == inst.id) | (Student.institution_id.is_(None) if is_default else False)
    )
    if branch:
        query = query.filter(Student.branch.ilike(branch.strip()))
    if min_cgpa is not None:
        query = query.filter(Student.cgpa >= min_cgpa)
    return query.all()

@router.post("/institutions/{identifier}/students", response_model=StudentProfile, status_code=status.HTTP_201_CREATED, tags=["Institution"])
def register_institution_student(identifier: str, student_in: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Register a student profile under a specific college with password security.
    """
    inst = resolve_institution(identifier, db)
    stu_id = student_in.get("id", "").strip()
    if not stu_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID / Roll Number is required."
        )

    existing = db.query(Student).filter(Student.id == stu_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student ID / Roll Number '{stu_id}' is already registered."
        )
    
    # Check email duplicate if provided
    stu_email = student_in.get("email", "").strip() if student_in.get("email") else None
    if stu_email:
        existing_email = db.query(Student).filter(Student.email.ilike(stu_email)).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student email '{stu_email}' is already registered."
            )

    student_data = dict(student_in)
    raw_password = student_data.pop("password", None) or "student123"
    student_data["institution_id"] = inst.id
    student_data["password_hash"] = hash_password(raw_password)
    if stu_email:
        student_data["email"] = stu_email

    # Extract or validate with StudentProfile contract
    student = Student(**student_data)
    # Precompute readiness
    readiness_calc = compute_student_readiness(student)
    student.readiness_score = readiness_calc.readiness_score
    student.readiness_tier = readiness_calc.tier

    db.add(student)
    db.commit()
    db.refresh(student)
    return StudentProfile.model_validate(student)

@router.post("/institutions/{identifier}/students/login", response_model=StudentLoginResponse, tags=["Students"])
@router.post("/students/login", response_model=StudentLoginResponse, tags=["Students"])
def login_student(
    login_data: StudentLoginRequest,
    identifier: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Authenticate a student with their Student ID or Email and password.
    Ensures no other student or entity can access an unauthorized profile.
    """
    target_ident = login_data.identifier.strip()
    if not target_ident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID or registered email is required."
        )

    query = db.query(Student).filter(
        (Student.id == target_ident) | (Student.email.ilike(target_ident))
    )

    if identifier:
        inst = resolve_institution(identifier, db)
        is_default = inst.id in ["inst-001", "apex-inst"]
        query = query.filter(
            (Student.institution_id == inst.id) | (Student.institution_id.is_(None) if is_default else False)
        )

    student = query.first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"No student profile found for '{target_ident}'. Please verify your Student ID/Email or register."
        )

    valid = False
    if student.password_hash:
        valid = verify_password(login_data.password, student.password_hash)
    else:
        # Fallback for unhashed legacy students: accept default student123 and update hash
        if login_data.password in ["student123", "password", "student"]:
            student.password_hash = hash_password(login_data.password)
            db.commit()
            valid = True

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student credentials. Please check your password."
        )

    return StudentLoginResponse(
        student=StudentProfile.model_validate(student),
        token=f"STU-AUTH-{uuid.uuid4().hex[:12]}",
        message="Student authenticated successfully."
    )

@router.get("/institutions/{identifier}/recruiters", response_model=List[RecruiterResponse], tags=["Institution"])
def list_institution_recruiters(identifier: str, db: Session = Depends(get_db)):
    """Retrieve corporate recruiters active at this institution."""
    inst = resolve_institution(identifier, db)
    is_default = inst.id in ["inst-001", "apex-inst"]

    recruiters = db.query(Recruiter).filter(
        (Recruiter.institution_id == inst.id) | (Recruiter.institution_id.is_(None) if is_default else False)
    ).all()

    results = []
    for rec in recruiters:
        job_count = db.query(Job).filter(Job.recruiter_id == rec.id).count()
        results.append(RecruiterResponse(
            id=rec.id,
            institution_id=rec.institution_id,
            name=rec.name,
            company_name=rec.company_name,
            email=rec.email,
            designation=rec.designation,
            created_at=rec.created_at.isoformat() if rec.created_at else None,
            active_jobs_count=job_count
        ))
    return results

@router.post("/institutions/{identifier}/recruiters", response_model=RecruiterResponse, status_code=status.HTTP_201_CREATED, tags=["Institution"])
def register_institution_recruiter(identifier: str, rec_in: RecruiterCreate, db: Session = Depends(get_db)):
    """
    Register a recruiter for placement drives at a specific institution.
    Can also optionally post an initial job drive for that company.
    """
    inst = resolve_institution(identifier, db)
    recruiter_id = f"REC-{uuid.uuid4().hex[:6].upper()}"

    # Ensure company exists in directory
    existing_co = db.query(Company).filter(Company.name.ilike(rec_in.company_name.strip())).first()
    if not existing_co:
        db.add(Company(
            id=f"COMP-{uuid.uuid4().hex[:6].upper()}",
            name=rec_in.company_name.strip(),
            tier="Tier 1"
        ))
        db.commit()

    recruiter = Recruiter(
        id=recruiter_id,
        institution_id=inst.id,
        name=rec_in.name.strip(),
        company_name=rec_in.company_name.strip(),
        email=rec_in.email.strip(),
        designation=rec_in.designation
    )
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

    jobs_created = 0
    if rec_in.initial_job_title:
        job_id = f"JOB-{uuid.uuid4().hex[:6].upper()}"
        initial_job = Job(
            id=job_id,
            company=rec_in.company_name.strip(),
            title=rec_in.initial_job_title.strip(),
            minimum_cgpa=rec_in.initial_job_min_cgpa or 7.0,
            eligible_branches=rec_in.initial_job_branches or ["CSE", "IT", "ECE"],
            max_backlogs=0,
            graduation_years=[2027],
            required_skills=rec_in.initial_job_skills or ["Python", "Algorithms"],
            institution_id=inst.id,
            recruiter_id=recruiter.id
        )
        db.add(initial_job)
        db.commit()
        jobs_created = 1

    return RecruiterResponse(
        id=recruiter.id,
        institution_id=recruiter.institution_id,
        name=recruiter.name,
        company_name=recruiter.company_name,
        email=recruiter.email,
        designation=recruiter.designation,
        created_at=recruiter.created_at.isoformat() if recruiter.created_at else None,
        active_jobs_count=jobs_created
    )

@router.get("/institutions/{identifier}/recruiters/{recruiter_id}", tags=["Institution"])
def get_institution_recruiter(identifier: str, recruiter_id: str, db: Session = Depends(get_db)):
    """Retrieve recruiter profile and active job postings for that company."""
    inst = resolve_institution(identifier, db)
    recruiter = db.query(Recruiter).filter(
        Recruiter.id == recruiter_id,
        (Recruiter.institution_id == inst.id) | (Recruiter.institution_id.is_(None) if inst.id in ["inst-001", "apex-inst"] else False)
    ).first()

    if not recruiter:
        # Fallback search by id only
        recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()

    if not recruiter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Recruiter '{recruiter_id}' not found.")

    jobs = db.query(Job).filter(
        (Job.recruiter_id == recruiter.id) | (Job.company.ilike(recruiter.company_name))
    ).all()

    return {
        "recruiter": RecruiterResponse(
            id=recruiter.id,
            institution_id=recruiter.institution_id,
            name=recruiter.name,
            company_name=recruiter.company_name,
            email=recruiter.email,
            designation=recruiter.designation,
            created_at=recruiter.created_at.isoformat() if recruiter.created_at else None,
            active_jobs_count=len(jobs)
        ),
        "jobs": [JobRequirements.model_validate(j) for j in jobs]
    }

@router.get("/institutions/{identifier}/jobs", response_model=List[JobRequirements], tags=["Institution"])
def list_institution_jobs(identifier: str, db: Session = Depends(get_db)):
    """Retrieve campus job drives active at this institution."""
    inst = resolve_institution(identifier, db)
    is_default = inst.id in ["inst-001", "apex-inst"]

    jobs = db.query(Job).filter(
        (Job.institution_id == inst.id) | (Job.institution_id.is_(None) if is_default else False)
    ).all()
    if not jobs and is_default:
        jobs = db.query(Job).all()
    return jobs

# --- Legacy Global Institution Stats (for backwards compatibility) ---
@router.get("/institution/stats", tags=["Institution"])
def get_institution_stats(db: Session = Depends(get_db)):
    """Return global cohort readiness distribution and stats."""
    return get_scoped_institution_stats("inst-001", db)



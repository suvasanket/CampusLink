from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict

# --- Student Sub-Schemas ---
class SkillItem(BaseModel):
    name: str
    level: float = Field(..., ge=0.0, le=1.0)

class ProjectItem(BaseModel):
    title: str
    description: str
    technologies: List[str] = Field(default_factory=list)

class CertificationItem(BaseModel):
    title: str
    issuer: str
    year: Optional[int] = None

class AssessmentData(BaseModel):
    aptitude: float = Field(..., ge=0.0, le=100.0)
    technical: float = Field(..., ge=0.0, le=100.0)
    communication: float = Field(..., ge=0.0, le=100.0)

class StudentProfile(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    branch: str
    graduation_year: Optional[int] = 2027
    cgpa: float = Field(..., ge=0.0, le=10.0)
    backlogs: int = Field(default=0, ge=0)
    skills: List[SkillItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: Optional[List[CertificationItem]] = Field(default_factory=list)
    assessment: AssessmentData
    readiness_score: Optional[float] = None
    readiness_tier: Optional[str] = None
    institution_id: Optional[str] = "inst-001"

    model_config = ConfigDict(from_attributes=True)

class StudentRegisterRequest(StudentProfile):
    password: str = Field(..., min_length=4, max_length=100)

class StudentLoginRequest(BaseModel):
    identifier: str = Field(..., description="Student ID or registered email")
    password: str = Field(..., min_length=1)

class StudentLoginResponse(BaseModel):
    student: StudentProfile
    token: str
    message: str = "Student authenticated successfully"

# --- Job Sub-Schemas ---
class JobRequirements(BaseModel):
    id: str
    company: str
    title: str
    description: Optional[str] = ""
    minimum_cgpa: float = Field(..., ge=0.0, le=10.0)
    eligible_branches: List[str] = Field(default_factory=list)
    max_backlogs: int = Field(default=0, ge=0)
    graduation_years: Optional[List[int]] = Field(default_factory=lambda: [2027])
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: Optional[List[str]] = Field(default_factory=list)
    responsibilities: Optional[List[str]] = Field(default_factory=list)
    experience_level: Optional[str] = "Fresher"
    institution_id: Optional[str] = "inst-001"
    recruiter_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class JobParseRequest(BaseModel):
    raw_text: str
    company_name: Optional[str] = "Company"

# --- Matching Contracts ---
class ScoreBreakdown(BaseModel):
    skills: float = Field(..., ge=0.0, le=100.0)
    projects: float = Field(..., ge=0.0, le=100.0)
    academics: float = Field(..., ge=0.0, le=100.0)
    assessment: float = Field(..., ge=0.0, le=100.0)
    certifications: float = Field(..., ge=0.0, le=100.0)
    communication: float = Field(..., ge=0.0, le=100.0)

class CandidateMatchItem(BaseModel):
    student_id: str
    student_name: str
    branch: Optional[str] = ""
    cgpa: Optional[float] = 0.0
    rank: int = Field(..., ge=1)
    eligible: bool
    match_score: float = Field(..., ge=0.0, le=100.0)
    category: str  # "Highly Suitable", "Suitable", "Potential Fit", "Not Recommended", "Ineligible"
    breakdown: ScoreBreakdown
    strengths: List[str] = Field(default_factory=list)
    skill_gaps: List[str] = Field(default_factory=list)  # missing required skills
    preferred_skill_gaps: List[str] = Field(default_factory=list)  # missing preferred skills
    explanation: str
    ineligibility_reasons: Optional[List[str]] = Field(default_factory=list)

class JobMatchResult(BaseModel):
    job_id: str
    job_title: Optional[str] = ""
    company: Optional[str] = ""
    total_evaluated: int
    total_eligible: int
    matches: List[CandidateMatchItem]

# --- Readiness & Skill Gap Contracts ---
class ReadinessFactorScores(BaseModel):
    technical_skills: float
    project_depth: float
    academics: float
    assessments: float
    communication: float

class StudentReadinessResponse(BaseModel):
    student_id: str
    student_name: str
    readiness_score: float
    tier: str  # "Highly Employable", "Ready", "Developing", "Not Ready"
    factor_scores: ReadinessFactorScores
    recommendations: List[str]

class SkillGapResponse(BaseModel):
    student_id: str
    job_id: str
    matched_required_skills: List[str]
    missing_required_skills: List[str]
    matched_preferred_skills: List[str]
    missing_preferred_skills: List[str]
    coverage_percentage: float
    actionable_next_steps: List[str]

class ResumeParseRequest(BaseModel):
    raw_text: str

class ApplicationCreate(BaseModel):
    job_id: str
    student_id: str
    status: Optional[str] = "Shortlisted"
    match_score: Optional[float] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: str
    student_id: str
    student_name: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    status: str
    match_score: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Institution Schemas ---
class InstitutionCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    username: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(default="admin123", min_length=4, max_length=100)
    code: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    admin_name: Optional[str] = None
    website: Optional[str] = None

class InstitutionLoginRequest(BaseModel):
    identifier: Optional[str] = None
    username: Optional[str] = None
    password: str = Field(..., min_length=1)

class InstitutionLoginResponse(BaseModel):
    institution: "InstitutionResponse"
    token: str
    message: str = "Institution administrator authenticated successfully"

class InstitutionResponse(BaseModel):
    id: str
    username: str
    name: str
    code: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    admin_name: Optional[str] = None
    website: Optional[str] = None
    is_verified: bool = True
    created_at: Optional[str] = None
    total_students: Optional[int] = 0
    total_jobs: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

# --- Recruiter Schemas ---
class RecruiterCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    company_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    designation: Optional[str] = "University Talent Lead"
    # Optional initial role to post during registration
    initial_job_title: Optional[str] = None
    initial_job_min_cgpa: Optional[float] = 7.0
    initial_job_branches: Optional[List[str]] = Field(default_factory=lambda: ["CSE", "IT", "ECE"])
    initial_job_skills: Optional[List[str]] = Field(default_factory=list)

class RecruiterResponse(BaseModel):
    id: str
    institution_id: str
    name: str
    company_name: str
    email: str
    designation: Optional[str] = None
    created_at: Optional[str] = None
    active_jobs_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


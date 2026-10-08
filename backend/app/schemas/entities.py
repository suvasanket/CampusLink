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

    model_config = ConfigDict(from_attributes=True)

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

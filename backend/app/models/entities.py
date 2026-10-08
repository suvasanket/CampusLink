from sqlalchemy import Column, String, Integer, Float, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    branch = Column(String(20), nullable=False, index=True)
    graduation_year = Column(Integer, default=2027)
    cgpa = Column(Float, nullable=False)
    backlogs = Column(Integer, default=0)
    
    # Nested structured attributes stored as JSON
    skills = Column(JSON, nullable=False, default=list)  # list of {name, level}
    projects = Column(JSON, nullable=False, default=list)  # list of {title, description, technologies}
    certifications = Column(JSON, nullable=True, default=list)  # list of {title, issuer, year}
    assessment = Column(JSON, nullable=False, default=dict)  # {aptitude, technical, communication}
    
    # Precomputed / cached readiness metrics
    readiness_score = Column(Float, nullable=True)
    readiness_tier = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(50), primary_key=True, index=True)
    company = Column(String(100), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    minimum_cgpa = Column(Float, nullable=False)
    eligible_branches = Column(JSON, nullable=False, default=list)  # list of str e.g. ["CSE", "IT"]
    max_backlogs = Column(Integer, default=0)
    graduation_years = Column(JSON, nullable=True, default=lambda: [2027])
    
    # Skill requirements
    required_skills = Column(JSON, nullable=False, default=list)  # list of str
    preferred_skills = Column(JSON, nullable=True, default=list)  # list of str
    responsibilities = Column(JSON, nullable=True, default=list)  # list of str
    experience_level = Column(String(50), default="Fresher")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(20), nullable=True)
    location = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Company(Base):
    __tablename__ = "companies"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)
    industry = Column(String(100), nullable=True)
    tier = Column(String(20), default="Tier 1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MatchRecord(Base):
    __tablename__ = "match_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False, index=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False, index=True)
    rank = Column(Integer, nullable=False)
    eligible = Column(Boolean, nullable=False)
    match_score = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    
    # Detailed score breakdown & diagnostic audit
    breakdown = Column(JSON, nullable=False)  # {skills, projects, academics, assessment, certifications, communication}
    strengths = Column(JSON, default=list)
    skill_gaps = Column(JSON, default=list)
    preferred_skill_gaps = Column(JSON, default=list)
    explanation = Column(Text, nullable=True)
    ineligibility_reasons = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False, index=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False, index=True)
    status = Column(String(50), default="Shortlisted", index=True)  # "Shortlisted", "Interview", "Offered", "Rejected"
    match_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

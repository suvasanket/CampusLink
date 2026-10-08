from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Dict, List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusLink"
    VERSION: str = "0.1.0"
    
    # Database Settings: PostgreSQL primary, SQLite resilient fallback
    DATABASE_URL: str = "postgresql+psycopg2://localhost:5432/campuslink"
    FALLBACK_DATABASE_URL: str = "sqlite:///./campuslink.db"
    
    # AI Provider Settings
    AI_PROVIDER: str = "fixture"  # "gemini", "groq", or "fixture"
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Local Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Server & Security
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["*"]
    
    # Matching Weights (from new_plan.md & codebase_idx)
    SCORING_WEIGHTS: Dict[str, float] = {
        "skills": 0.40,
        "projects": 0.20,
        "academics": 0.15,
        "assessment": 0.10,
        "certifications": 0.10,
        "communication": 0.05,
    }
    
    # Student Overall Employability Readiness Weights
    READINESS_WEIGHTS: Dict[str, float] = {
        "technical_skills": 0.35,
        "project_depth": 0.25,
        "academics": 0.20,
        "assessments": 0.15,
        "communication": 0.05,
    }

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        extra="allow"
    )

settings = Settings()

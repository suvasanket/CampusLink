from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusLink"
    VERSION: str = "0.1.0"
    DATABASE_URL: str = "sqlite:///./campuslink.db"
    GEMINI_API_KEY: str = ""
    
    # Matching Weights
    SCORING_WEIGHTS: Dict[str, float] = {
        "skills": 0.40,
        "projects": 0.20,
        "academics": 0.15,
        "assessment": 0.10,
        "certifications": 0.10,
        "communication": 0.05,
    }

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

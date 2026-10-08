from abc import ABC, abstractmethod
from typing import Dict, Any
from app.schemas.entities import JobRequirements, StudentProfile

class AIProvider(ABC):
    """Abstract interface for pluggable AI extraction providers."""

    @abstractmethod
    def parse_job_description(self, raw_text: str, company_name: str = "Company") -> JobRequirements:
        """Parse unstructured JD text into structured JobRequirements schema."""
        pass

    @abstractmethod
    def parse_resume(self, raw_text: str) -> StudentProfile:
        """Parse unstructured resume text into structured StudentProfile schema."""
        pass

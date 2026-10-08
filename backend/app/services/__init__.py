from app.services.eligibility import evaluate_eligibility
from app.services.embeddings import compute_project_job_similarity, get_text_embedding
from app.services.scoring import calculate_composite_score, classify_category, normalize_skill
from app.services.recommendations import compute_student_readiness, compute_skill_gaps
from app.services.explanations import generate_grounded_explanation
from app.services.matching import match_candidates_for_job

__all__ = [
    "evaluate_eligibility",
    "compute_project_job_similarity",
    "get_text_embedding",
    "calculate_composite_score",
    "classify_category",
    "normalize_skill",
    "compute_student_readiness",
    "compute_skill_gaps",
    "generate_grounded_explanation",
    "match_candidates_for_job",
]

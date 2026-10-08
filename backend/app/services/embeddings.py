import logging
from typing import List, Optional
import numpy as np

logger = logging.getLogger("campuslink.embeddings")

_model = None
_model_failed = False
_embedding_cache = {}

def get_sentence_transformer():
    """Lazily load local SentenceTransformer model, with fallback flag if unavailable."""
    global _model, _model_failed
    if _model is not None:
        return _model
    if _model_failed:
        return None
    try:
        from sentence_transformers import SentenceTransformer
        # Check if model is already downloaded locally first
        try:
            _model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
            logger.info("Loaded local cached SentenceTransformer model ('all-MiniLM-L6-v2').")
            return _model
        except Exception:
            # Fall back to TF-IDF directly for instant zero-token offline execution
            logger.info("Local SentenceTransformer weights not cached. Using TF-IDF/sklearn cosine similarity.")
            _model_failed = True
            return None
    except Exception as exc:
        logger.warning(
            f"SentenceTransformer not loaded ({exc}). Using TF-IDF/sklearn fallback."
        )
        _model_failed = True
        return None

def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Compute cosine similarity between two 1D vectors."""
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))

def get_text_embedding(text: str) -> Optional[np.ndarray]:
    """Get embedding vector for a string with in-memory caching."""
    if not text.strip():
        return None
    if text in _embedding_cache:
        return _embedding_cache[text]

    model = get_sentence_transformer()
    if model is not None:
        try:
            vec = model.encode(text, convert_to_numpy=True)
            _embedding_cache[text] = vec
            return vec
        except Exception as exc:
            logger.warning(f"Embedding encoding error: {exc}")

    return None

def compute_tfidf_similarity(text_a: str, text_b: str) -> float:
    """Fallback cosine similarity using scikit-learn TF-IDF."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(sim)
    except Exception:
        # Ultimate fallback: Token Jaccard overlap
        set_a = set(text_a.lower().split())
        set_b = set(text_b.lower().split())
        if not set_a or not set_b:
            return 0.0
        return float(len(set_a & set_b) / len(set_a | set_b))

def compute_project_job_similarity(projects: List[dict], job_description: str, job_title: str) -> float:
    """
    Computes max semantic project alignment score (0-100 scale) between candidate projects
    and job requirements text.
    """
    if not projects or (not job_description and not job_title):
        return 50.0  # Baseline neutral score if no projects

    job_text = f"{job_title}. {job_description}".strip()
    job_emb = get_text_embedding(job_text)

    similarities = []
    for proj in projects:
        proj_text = f"{proj.get('title', '')}: {proj.get('description', '')} Technologies: {', '.join(proj.get('technologies', []))}".strip()
        if not proj_text:
            continue

        if job_emb is not None:
            proj_emb = get_text_embedding(proj_text)
            if proj_emb is not None:
                sim = compute_cosine_similarity(proj_emb, job_emb)
                # Normalize cosine similarity from [-1, 1] to [0, 1]
                norm_sim = max(0.0, min(1.0, (sim + 1.0) / 2.0))
                similarities.append(norm_sim)
                continue

        # Use TF-IDF fallback with scaled semantic relevance
        sim = compute_tfidf_similarity(proj_text, job_text)
        scaled_sim = min(1.0, sim * 2.2)
        similarities.append(scaled_sim)

    if not similarities:
        return 50.0

    # Best project relevance with diminishing bonus for multiple projects
    max_sim = max(similarities)
    multi_bonus = min(0.10, (len(similarities) - 1) * 0.04)
    final_score = min(100.0, (max_sim + multi_bonus) * 100.0)
    return round(final_score, 1)

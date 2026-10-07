# CampusLink — REST API Specification (`codebase_idx/api_spec.md`)

This document defines the REST endpoints exposed by the FastAPI backend (`backend/app/main.py`), including query parameters, request bodies, status codes, and response payloads.

---

## 1. Base URL & Protocol
- **Default Local Host:** `http://localhost:8000`
- **Documentation (Interactive Swagger):** `http://localhost:8000/docs`
- **OpenAPI Schema (JSON):** `http://localhost:8000/openapi.json`

---

## 2. Endpoints Overview

| Method | Path | Description | Access Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | System health and database connectivity probe | All |
| `GET` | `/jobs` | Retrieve all job listings | Recruiter / Admin |
| `POST` | `/jobs` | Create/ingest a structured job posting | Recruiter / Dev 3 |
| `GET` | `/jobs/{job_id}` | Retrieve specific job details | All |
| `POST` | `/jobs/parse` | Ingest raw JD (text or uploaded PDF) and return parsed Job JSON | Dev 3 / Recruiter |
| `GET` | `/jobs/{job_id}/matches` | Compute and retrieve ranked matching candidates for a job | Recruiter |
| `GET` | `/students` | Retrieve student profiles (paginated / filtered) | Placement Cell |
| `POST` | `/students` | Ingest a structured student profile | Dev 3 / Admin |
| `GET` | `/students/{student_id}` | Retrieve individual student profile | All |
| `GET` | `/students/{student_id}/readiness` | Retrieve overall employability readiness score and tier | Student / Officer |
| `GET` | `/students/{student_id}/skill-gaps/{job_id}` | Retrieve detailed skill gap analysis against a job | Student / Recruiter |

---

## 3. Endpoint Details

### 3.1. `GET /health`
- **Response 200 OK:**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "0.1.0"
}
```

### 3.2. `GET /jobs/{job_id}/matches`
- **Query Parameters:**
  - `include_ineligible` (bool, optional, default: `false`): Whether to include students who failed hard eligibility.
  - `limit` (int, optional, default: `20`): Max number of candidates to return.
- **Response 200 OK:** Conforms to [`docs/contracts/match.schema.json`](file:///Users/suvasanketrout/developer/CampusLink/docs/contracts/match.schema.json).

### 3.3. `POST /jobs/parse`
- **Request Body (JSON):**
```json
{
  "raw_text": "We are hiring Backend Software Engineers with proficiency in Python, PostgreSQL...",
  "company_name": "Nexus Innovations"
}
```
- **Response 200 OK:** Structured Job JSON complying with [`docs/contracts/job.schema.json`](file:///Users/suvasanketrout/developer/CampusLink/docs/contracts/job.schema.json).

### 3.4. `GET /students/{student_id}/readiness`
- **Response 200 OK:**
```json
{
  "student_id": "STU001",
  "readiness_score": 88.5,
  "tier": "Highly Employable",
  "factor_scores": {
    "technical_skills": 92.0,
    "project_depth": 88.0,
    "academics": 87.0,
    "assessments": 88.0,
    "communication": 82.0
  },
  "recommendations": ["Practice system design questions."]
}
```

### 3.5. `GET /students/{student_id}/skill-gaps/{job_id}`
- **Response 200 OK:**
```json
{
  "student_id": "STU001",
  "job_id": "JOB001",
  "matched_required_skills": ["Python", "SQL", "REST API"],
  "missing_required_skills": [],
  "matched_preferred_skills": ["FastAPI", "Docker"],
  "missing_preferred_skills": ["PostgreSQL"],
  "coverage_percentage": 90.0,
  "actionable_next_steps": [
    "Complete hands-on tutorial on PostgreSQL query optimization."
  ]
}
```

# CampusLink — Data Contracts & JSON Schemas (`codebase_idx/contracts.md`)

This document is the authoritative specification for all data exchanged between agents, services, and external integrations.

Formal JSON Schema files reside in [`docs/contracts/`](file:///Users/suvasanketrout/developer/CampusLink/docs/contracts).

---

## 1. Student Profile Contract (`docs/contracts/student.schema.json`)

Represents a single candidate record extracted from a resume or loaded from the database.

### 1.1. Schema Model
```json
{
  "id": "STU001",
  "name": "Aarav Sharma",
  "branch": "CSE",
  "cgpa": 8.7,
  "backlogs": 0,
  "skills": [
    { "name": "Python", "level": 0.95 },
    { "name": "SQL", "level": 0.88 },
    { "name": "FastAPI", "level": 0.90 }
  ],
  "projects": [
    {
      "title": "Campus Placement Matching Engine",
      "description": "Built an intelligent matching system for college recruitment using FastAPI, vector embeddings, and PostgreSQL.",
      "technologies": ["Python", "FastAPI", "PostgreSQL", "Docker"]
    }
  ],
  "certifications": [
    {
      "title": "AWS Certified Cloud Practitioner",
      "issuer": "Amazon Web Services",
      "year": 2025
    }
  ],
  "assessment": {
    "aptitude": 88,
    "technical": 94,
    "communication": 82
  }
}
```

### 1.2. Field Descriptions
- `id` (string, required): Unique identifier (e.g. `STU001`).
- `name` (string, required): Full name.
- `branch` (string, required): Discipline (e.g., `CSE`, `IT`, `ECE`, `MECH`, `EEE`, `CIVIL`).
- `cgpa` (float, required): 0.0 to 10.0 scale.
- `backlogs` (int, required): Active backlog count (0 indicates clear academic record).
- `skills` (list[object], required): List of skills with normalized `name` (string) and proficiency `level` ($0.0 \dots 1.0$).
- `projects` (list[object], required): Portfolio projects with `title`, `description`, and `technologies`.
- `certifications` (list[object], optional): Professional accreditations.
- `assessment` (object, required): Scores ($0 \dots 100$) across `aptitude`, `technical`, and `communication`.

---

## 2. Job Specification Contract (`docs/contracts/job.schema.json`)

Represents structured job requirements extracted from a recruiter JD or recruiter input form.

### 2.1. Schema Model
```json
{
  "id": "JOB001",
  "company": "Nexus Innovations",
  "title": "Backend Software Engineer",
  "description": "Looking for entry-level backend engineers experienced in building asynchronous REST APIs with Python...",
  "minimum_cgpa": 7.5,
  "eligible_branches": ["CSE", "IT"],
  "max_backlogs": 0,
  "required_skills": ["Python", "SQL", "REST API"],
  "preferred_skills": ["FastAPI", "PostgreSQL", "Docker"],
  "experience_level": "Fresher"
}
```

### 2.2. Field Descriptions
- `id` (string, required): Job identifier (e.g., `JOB001`).
- `company` (string, required): Name of recruiter organization.
- `title` (string, required): Job designation.
- `minimum_cgpa` (float, required): Hard cutoff CGPA.
- `eligible_branches` (list[string], required): Allowed degree branches.
- `max_backlogs` (int, required): Maximum allowed active backlogs (usually 0).
- `required_skills` (list[string], required): Mandatory skills; missing any of these counts as a required skill gap.
- `preferred_skills` (list[string], optional): Desirable skills; missing these counts as preferred gaps.

---

## 3. Match Result Contract (`docs/contracts/match.schema.json`)

Returned by `GET /jobs/{job_id}/matches`. This is the core integration payload consumed by the frontend.

### 3.1. Schema Model
```json
{
  "job_id": "JOB001",
  "total_evaluated": 25,
  "total_eligible": 18,
  "matches": [
    {
      "student_id": "STU001",
      "student_name": "Aarav Sharma",
      "rank": 1,
      "eligible": true,
      "match_score": 93.4,
      "category": "Highly Suitable",
      "breakdown": {
        "skills": 96.0,
        "projects": 92.5,
        "academics": 87.0,
        "assessment": 91.3,
        "certifications": 90.0,
        "communication": 82.0
      },
      "strengths": [
        "Strong Python and REST API proficiency",
        "Directly relevant backend portfolio project",
        "Meets academic criteria with 8.7 CGPA"
      ],
      "skill_gaps": [],
      "preferred_skill_gaps": ["PostgreSQL"],
      "explanation": "Exceptional backend alignment with complete coverage of required skills and top technical assessment scores."
    }
  ]
}
```

### 3.2. Categorization Rules
- **Score $\ge 85$:** `Highly Suitable`
- **Score $70 \le s < 85$:** `Suitable`
- **Score $50 \le s < 70$:** `Potential Fit`
- **Score $< 50$:** `Not Recommended`
- **Eligibility Failed:** `Ineligible` (score zeroed or suppressed)

---

## 4. Student Readiness Contract (`GET /students/{id}/readiness`)

Independent metric assessing a student's baseline career readiness across the whole placement season.

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
  "recommendations": [
    "Add production deployment metrics to distributed task queue project.",
    "Practice system design architectural questions."
  ]
}
```

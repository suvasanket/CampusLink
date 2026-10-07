# CAMPUSLINK — Developer 1 Root Reference
## Main Developer / Architecture / Backend / Matching Intelligence

**Role:** Main Developer
**Primary ownership:** System architecture, backend, database, eligibility engine, matching engine, scoring, integration
**Priority:** Make the core intelligence reliable before adding breadth.

---

# 1. Mission

You own the technical backbone of the CAMPUSLINK prototype.

The five-day prototype must prove one complete intelligent placement workflow:

> Recruiter JD → JD requirements → eligibility filtering → semantic candidate matching → explainable ranking → skill gaps/readiness

Your job is to make the intelligence layer deterministic where it should be deterministic, AI-assisted where interpretation is needed, and easy for Developers 2 and 3 to consume.

Do NOT attempt to build the entire placement-management platform.

---

# 2. MVP Boundary

Build only this core:

```text
                    RECRUITER JD
                         |
                         v
                  JD STRUCTURING
                         |
                         v
               HARD ELIGIBILITY FILTER
                         |
                         v
                 SEMANTIC MATCHING
                         |
                         v
                  WEIGHTED SCORING
                         |
                         v
                  CANDIDATE RANKING
                         |
                         v
                 EXPLAINABLE RESULT
                         |
                         v
                    SKILL GAPS
                         |
                         v
              PREPARATION RECOMMENDATION
```

Future capabilities such as scheduling, notifications, offers, mobile apps and multi-campus analytics are OUT OF SCOPE for this five-day prototype.

---

# 3. Recommended Stack

- Python
- FastAPI
- PostgreSQL
- pgvector if available
- SQLAlchemy
- Pydantic
- scikit-learn where useful
- embedding model/API for semantic similarity
- LLM only for extraction/explanation/recommendation
- PyMuPDF for PDF text extraction

Keep the backend as a modular monolith. Do NOT create microservices.

---

# 4. Repository Ownership

Recommended structure:

```text
campuslink/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── eligibility.py
│   │   │   ├── matching.py
│   │   │   ├── scoring.py
│   │   │   ├── embeddings.py
│   │   │   ├── explanations.py
│   │   │   └── recommendations.py
│   │   └── main.py
│   └── tests/
├── frontend/                 # Developer 2
├── ai_pipeline/              # Developer 3
├── data/                     # shared seed/demo data
├── docs/
└── README.md
```

You own `backend/`.

Do not modify Developer 2's frontend implementation unless required for integration.

Do not modify Developer 3's extraction implementation unless the shared contract is broken.

---

# 5. Core Data Model

Keep the initial model compact.

## Student

```json
{
  "id": "STU001",
  "name": "Example Student",
  "branch": "CSE",
  "cgpa": 8.4,
  "backlogs": 0,
  "skills": [
    {"name": "Python", "level": 0.92},
    {"name": "SQL", "level": 0.81}
  ],
  "projects": [
    {
      "title": "Placement Analytics",
      "description": "...",
      "technologies": ["Python", "PostgreSQL"]
    }
  ],
  "certifications": [],
  "assessment": {
    "aptitude": 84,
    "technical": 79,
    "communication": 72
  }
}
```

## Job

```json
{
  "id": "JOB001",
  "company": "Example Corp",
  "title": "Software Engineer",
  "minimum_cgpa": 7.0,
  "eligible_branches": ["CSE", "IT"],
  "max_backlogs": 0,
  "required_skills": ["Python", "SQL", "REST API"],
  "preferred_skills": ["React", "Docker"]
}
```

---

# 6. Hard Eligibility Engine

Eligibility is NOT an LLM task.

Implement normal deterministic rules:

```text
CGPA >= minimum_cgpa
AND branch in eligible_branches
AND backlogs <= max_backlogs
AND other mandatory requirements pass
```

Return:

```json
{
  "eligible": true,
  "reasons": [
    "CGPA requirement satisfied",
    "Eligible branch",
    "No active backlogs"
  ]
}
```

If the student fails mandatory eligibility, they should not receive a high semantic match score.

Distinguish:

> Eligibility = "Can this student be considered?"

from:

> Match = "How well does this eligible student fit?"

---

# 7. Matching Engine

After eligibility filtering:

1. Normalize skills.
2. Compare required skills to student skills.
3. Use embeddings for semantic similarity where keyword matching is insufficient.
4. Compare project relevance.
5. Calculate academic/assessment components.
6. Produce a weighted score.
7. Rank candidates.

Initial scoring:

```text
Skill similarity       40%
Project relevance      20%
Academic profile       15%
Assessment             10%
Certification relevance 10%
Communication           5%
```

These are prototype weights. Keep them configurable.

Example:

```python
WEIGHTS = {
    "skills": 0.40,
    "projects": 0.20,
    "academics": 0.15,
    "assessment": 0.10,
    "certifications": 0.10,
    "communication": 0.05,
}
```

---

# 8. Match Result Contract

This is the most important contract between your backend and Developer 2.

`GET /jobs/{job_id}/matches`

Return approximately:

```json
{
  "job_id": "JOB001",
  "matches": [
    {
      "student_id": "STU001",
      "rank": 1,
      "eligible": true,
      "match_score": 94,
      "category": "Highly Suitable",
      "breakdown": {
        "skills": 96,
        "projects": 92,
        "academics": 94,
        "assessment": 88,
        "certifications": 90,
        "communication": 84
      },
      "strengths": [
        "Strong Python experience",
        "Relevant backend project",
        "Meets academic criteria"
      ],
      "skill_gaps": [
        "React",
        "AWS"
      ],
      "explanation": "Strong backend alignment with the role, with minor gaps in React and AWS."
    }
  ]
}
```

Developer 2 must be able to build the candidate UI entirely from this contract.

---

# 9. AI Boundary

Use AI for:

- JD interpretation
- resume/profile interpretation
- semantic similarity
- project relevance
- natural-language explanations
- preparation recommendations

Do NOT use AI for:

- CGPA comparison
- branch eligibility
- backlog eligibility
- sorting when a numeric score already exists
- basic arithmetic

This hybrid architecture makes the system easier to explain and trust.

---

# 10. Readiness Score

Implement a simple prototype readiness score:

```text
Technical skills
Projects
Academics
Assessment
Communication
```

Example:

```text
0–49   Not Ready
50–64  Developing
65–79  Ready
80–100 Highly Employable
```

Keep the thresholds configurable.

The readiness score should be independent from a specific recruiter match.

---

# 11. Skill Gap Engine

For an eligible student/job pair:

```text
Required skills
        -
Student demonstrated skills
        =
Potential skill gaps
```

Use semantic normalization so:

```text
ReactJS → React
Postgres → PostgreSQL
FastAPI → Python backend ecosystem
```

Do not blindly classify every missing preferred skill as a critical gap.

Separate:

```text
required gaps
preferred gaps
```

---

# 12. API Contract

Minimum endpoints:

```text
GET  /health
GET  /students
GET  /students/{student_id}
GET  /jobs
GET  /jobs/{job_id}
POST /jobs/parse
POST /jobs/{job_id}/match
GET  /jobs/{job_id}/matches
GET  /students/{student_id}/readiness
GET  /students/{student_id}/skill-gaps/{job_id}
```

You may simplify these if time becomes tight.

The critical endpoint is:

```text
POST/GET job matching
```

---

# 13. Integration Plan

## Day 1 — NO full integration

Build your backend independently using manually created JSON fixtures.

At the end of Day 1:

```text
backend boots
database works
student schema works
job schema works
API conventions documented
```

Developer 2 uses mocked JSON.
Developer 3 uses the agreed JSON schema.

---

## Day 2 — Contract integration

Connect Developer 3's parsed JD JSON into your backend.

Connection point:

```text
Developer 3
JD parser
   |
   | structured JSON
   v
Developer 1
Job ingestion service
```

Do NOT connect directly from Dev 3's code to your internal services.

Use the JSON contract.

---

## Day 3 — Core system integration

This is the PRIMARY integration checkpoint.

Connect:

```text
Dev 3:
JD parsing
     |
     v
Dev 1:
Eligibility + Matching + Scoring
     |
     v
Dev 2:
Candidate ranking UI
```

By the end of Day 3, this must work end-to-end.

---

## Day 4 — Presentation integration

Connect:

```text
Backend explanation
       ↓
Candidate details UI

Backend skill gaps
       ↓
Skill-gap UI

Backend readiness
       ↓
Readiness dashboard
```

No architectural changes unless absolutely necessary.

---

## Day 5 — Freeze

No new major features.

Only:

- bugs
- API failures
- loading states
- error handling
- UI polish
- test data
- demo reliability

---

# 14. Git Rules

Use:

```text
main
dev/backend
dev/frontend
dev/ai
```

Never push unfinished experimental work directly to `main`.

Merge stable work into `main`.

Every shared contract change must be documented.

Commit style:

```text
feat: add eligibility engine
feat: add match scoring
fix: normalize skill names
feat: expose candidate ranking API
```

---

# 15. Definition of Done

You are done when:

- backend starts reliably
- seed data loads
- JD can be represented as structured requirements
- eligibility filtering works
- candidates receive deterministic scores
- semantic matching works
- ranking works
- explanation is generated
- skill gaps are returned
- frontend can consume the match endpoint
- the complete demo works from one user action

Do not optimize prematurely.

---

# 16. Your priority hierarchy

If time is running out:

```text
1. Matching works
2. Eligibility works
3. API contract works
4. Frontend integration works
5. Explainability works
6. Skill gaps work
7. Readiness works
8. Polish
```

Never sacrifice the matching engine to add another feature.


---

# SHARED TEAM INTEGRATION CONTRACT

## One system, three ownership zones

```text
┌───────────────────────┐
│ DEV 3                 │
│ AI / DATA INGESTION   │
│                       │
│ Resume → Student JSON │
│ JD → Job JSON         │
│ Skill normalization   │
└──────────┬────────────┘
           │
           │ validated JSON
           ▼
┌───────────────────────┐
│ DEV 1                 │
│ BACKEND / INTELLIGENCE│
│                       │
│ Eligibility           │
│ Embeddings            │
│ Matching              │
│ Scoring               │
│ Explainability        │
└──────────┬────────────┘
           │
           │ REST API JSON
           ▼
┌───────────────────────┐
│ DEV 2                 │
│ FRONTEND              │
│                       │
│ Dashboard             │
│ Job view              │
│ Candidate ranking     │
│ Candidate details     │
└───────────────────────┘
```

## Integration checkpoints

### Checkpoint 0 — Day 1
No full integration.

Everyone works against agreed schemas.

### Checkpoint 1 — Day 2
Developer 3 → Developer 1.

Validated Job JSON and Student JSON are accepted by the backend.

### Checkpoint 2 — Day 3
Developer 1 → Developer 2.

Real matching API feeds the real candidate ranking UI.

This is the **critical end-to-end milestone**.

### Checkpoint 3 — Day 4
Developer 1 → Developer 2.

Readiness, explanation and skill-gap fields are connected.

### Checkpoint 4 — Day 5
Everything is frozen.

Only fixes and polish.

## Dependency rule

Never create:

```text
Dev 2 → Dev 3
Dev 3 → Dev 2
Dev 2 → Dev 1 internal Python modules
```

Use the contracts:

```text
Dev 3 → JSON contract → Dev 1 → REST API → Dev 2
```

## Shared source of truth

Keep:

```text
docs/contracts/
├── student.schema.json
├── job.schema.json
└── match.schema.json
```

Any contract change must be communicated to all three developers.

## Demo fallback

Every integration must have a fixture fallback.

If an AI API fails:

```text
AI parser
   ↓ failure
validated fixture
   ↓
backend
```

If backend fails:

```text
frontend
   ↓
same-shape local fixture
```

This ensures the prototype remains demoable.

## Daily synchronization

At the beginning of each day:

- 10-minute stand-up
- confirm contracts
- identify blockers

At the end of Day 2 and Day 3:

- perform a live integration test together

Do not wait until Day 5 to discover incompatible outputs.

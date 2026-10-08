# CAMPUSLINK — MASTER PROJECT ROOT REFERENCE

## AI-Powered Campus-to-Corporate Placement Intelligence Platform

**Purpose:** This is the single root specification for the entire CAMPUSLINK codebase and the AI coding editor working on it.

**Current state:** The project has already been initialized from the previous Developer 1 specification. Do not rebuild it. Audit the existing implementation and continue from its current state.

---

# 1. PROJECT MISSION

CAMPUSLINK is an AI-assisted placement intelligence platform.

The first complete vertical slice is:

```text
Recruiter JD
    ↓
JD understanding
    ↓
Hard eligibility filtering
    ↓
Semantic candidate matching
    ↓
Weighted scoring
    ↓
Candidate ranking
    ↓
Explainable recommendation
    ↓
Skill-gap analysis
    ↓
Student readiness
    ↓
Actionable preparation
```

The goal for the current prototype is not to implement every placement-cell feature. The goal is to make this one flow reliable, polished, explainable and demo-ready.

---

# 2. CORE PRODUCT PRINCIPLE

CAMPUSLINK must be more than a CRUD placement database.

It should:

```text
UNDERSTAND → DECIDE → ACT → LEARN
```

Understand:
- student profiles
- resumes
- recruiter JDs
- eligibility rules

Decide:
- who is eligible
- who matches
- why they match
- what skills are missing
- how ready the student is

Act:
- shortlist
- recommend preparation
- eventually schedule drives and track offers

Learn:
- placement conversion
- recruiter performance
- student risk
- historical outcomes

---

# 3. CURRENT MVP BOUNDARY

## P0 — must work

1. Institution/tenant context
2. Student profile data
3. JD input/upload
4. JD structured extraction
5. Hard eligibility
6. Semantic matching
7. Weighted scoring
8. Candidate ranking
9. Explainable match result

The three portal shells should exist as product contexts:

```text
Institution
Student
Company / Recruiter
```

but they should share one backend and one intelligence layer.

## P1 — should work

9. Skill-gap analysis
10. Readiness score
11. Candidate detail page
12. Preparation recommendations

## P2 — only after P0/P1 are stable

13. Dashboard analytics
14. Basic recruiter management
15. Offer tracking

## Future

- conflict-aware scheduling
- notifications
- placement copilot
- predictive at-risk students
- advanced mock interviews
- mobile app
- blockchain
- LinkedIn integrations
- multi-campus analytics

Do not allow future features to destabilize the core vertical slice.

---

# 4. ARCHITECTURE

Use a modular monolith.

```text
┌─────────────────────────────────────────┐
│ FRONTEND                                │
│ Next.js + TypeScript                    │
│ Dashboard / Jobs / Matches / Students  │
└───────────────────┬─────────────────────┘
                    │ REST
                    ▼
┌─────────────────────────────────────────┐
│ FASTAPI                                 │
│ API + validation + orchestration        │
└───────────────────┬─────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│ APPLICATION CORE                        │
│                                         │
│ AI extraction                           │
│ Skill normalization                     │
│ Eligibility                             │
│ Embeddings                              │
│ Matching                                │
│ Scoring                                 │
│ Explainability                          │
│ Readiness                               │
│ Recommendations                         │
│ Analytics                               │
└───────────────────┬─────────────────────┘
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
┌──────────────────┐  ┌───────────────────┐
│ PostgreSQL       │  │ AI provider       │
│ + pgvector       │  │ LLM + embeddings  │
└──────────────────┘  └───────────────────┘
```

Do not introduce microservices for the prototype.

---

# 5. TECHNOLOGY

Recommended:

```text
Frontend:
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Recharts/ECharts

Backend:
Python
FastAPI
Pydantic
SQLAlchemy
Alembic

Database:
PostgreSQL
pgvector

AI:
provider-agnostic LLM adapter
embedding adapter

Documents:
PyMuPDF

Algorithms:
cosine similarity
scikit-learn where useful
OR-Tools later for scheduling
```

Use the existing project's stack if it already differs and is working. Do not rewrite working infrastructure just to match this list.

---

# 6. REPOSITORY ORGANIZATION

Target organization:

```text
campuslink/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │       ├── ai/
│   │       ├── eligibility/
│   │       ├── matching/
│   │       ├── readiness/
│   │       ├── recommendations/
│   │       └── analytics/
│   ├── migrations/
│   └── tests/
│
├── data/
│   ├── seed/
│   ├── resumes/
│   └── jobs/
│
├── docs/
│   ├── contracts/
│   ├── architecture/
│   └── demo/
│
├── scripts/
├── .env.example
└── README.md
```

Existing repository structure takes precedence. Reorganize only when it improves the current implementation.

---

# 7. DOMAIN MODEL

Core entities:


```text
Student
StudentSkill
StudentProject
StudentCertification
StudentAssessment

Recruiter
Job
JobRequirement

Match
MatchReason
SkillGap

PlacementDrive
Application
Offer
Document
PlacementOutcome
```


For the multi-tenant product model, also represent:

```text
Institution
InstitutionUser
Company
CompanyUser / Recruiter
```

Relationship concept:

```text
Institution
    │
    ├── Institution Users
    ├── Students
    └── Placement Jobs / Drives
             │
             ├── Applications
             ├── Matches
             └── Offers

Company
    │
    └── Recruiter Users
             │
             └── Jobs / Hiring Activity
```

For the current five-day MVP, these organization/user entities can be implemented minimally. Do not let authentication/role management delay the matching vertical slice.

For the current MVP, prioritize:

```text
students
student_skills
student_projects
student_assessments
jobs
job_requirements
matches
skill_gaps
```

---

# 8. STUDENT CONTRACT

```json
{
  "id": "STU001",
  "name": "Example Student",
  "branch": "CSE",
  "graduation_year": 2027,
  "cgpa": 8.4,
  "backlogs": 0,
  "skills": [
    {"name": "Python", "level": 0.92},
    {"name": "SQL", "level": 0.81}
  ],
  "projects": [
    {
      "title": "Placement Analytics",
      "description": "Built a placement analytics platform.",
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

---

# 9. JOB CONTRACT

```json
{
  "id": "JOB001",
  "company": "Example Corp",
  "title": "Software Engineer",
  "minimum_cgpa": 7.0,
  "eligible_branches": ["CSE", "IT"],
  "max_backlogs": 0,
  "graduation_years": [2027],
  "required_skills": ["Python", "SQL", "REST API"],
  "preferred_skills": ["React", "Docker"],
  "responsibilities": ["Develop backend APIs"]
}
```

---

# 10. AI EXTRACTION

Resume:

```text
PDF
 ↓
text extraction
 ↓
LLM structured extraction
 ↓
schema validation
 ↓
skill normalization
 ↓
student profile
```

JD:

```text
PDF/text
 ↓
LLM structured extraction
 ↓
schema validation
 ↓
requirement normalization
 ↓
job profile
```

Raw LLM output must never enter business logic.

Missing information must remain missing. Never hallucinate.

---

# 11. SKILL NORMALIZATION

Canonicalize obvious aliases:

```text
ReactJS → React
React.js → React
Postgres → PostgreSQL
Postgre SQL → PostgreSQL
NodeJS → Node.js
PYTHON → Python
```

Use semantic similarity for non-obvious relationships.

Do not equate unrelated technologies solely because an embedding is close.

---

# 12. ELIGIBILITY ENGINE

Eligibility is deterministic.

```text
CGPA >= minimum_cgpa
AND branch ∈ eligible_branches
AND backlogs <= max_backlogs
AND graduation year satisfies requirement
```

Example response:

```json
{
  "eligible": true,
  "reasons": [
    "CGPA requirement satisfied",
    "Eligible branch",
    "No active backlogs"
  ],
  "failed_requirements": []
}
```

For failure:

```json
{
  "eligible": false,
  "reasons": [],
  "failed_requirements": [
    "CGPA 6.8 is below required 7.0"
  ]
}
```

Eligibility and matching must remain separate.

---

# 13. MATCHING ENGINE

Only eligible students enter normal ranking.

Pipeline:

```text
Eligible candidates
      ↓
Skill similarity
      ↓
Project relevance
      ↓
Academic score
      ↓
Assessment score
      ↓
Certification relevance
      ↓
Communication
      ↓
Weighted final score
      ↓
Ranking
```

Initial weights:

```text
Skills           40%
Projects         20%
Academics        15%
Assessment       10%
Certifications   10%
Communication     5%
```

Configuration:

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

Keep all component scores on a 0–100 scale before weighting.

---

# 14. SEMANTIC MATCHING

Use embeddings when lexical matching is insufficient.

Example:

```text
Student:
"Built REST APIs using FastAPI and PostgreSQL."

Job:
"Experience developing backend APIs using Python."
```

This should receive meaningful semantic similarity.

Do not make embeddings the only source of truth.

Use:

```text
canonical skills
+
aliases
+
semantic similarity
+
structured evidence
```

---

# 15. PROJECT RELEVANCE

Evaluate:

- technologies
- description
- target role
- responsibilities
- required skills

Do not simply count the number of matching technologies.

A project with one highly relevant implementation can be more valuable than a project containing many unrelated technologies.

---

# 16. MATCH RESULT CONTRACT

The frontend should consume:

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
        {
          "skill": "React",
          "type": "preferred",
          "priority": "medium"
        },
        {
          "skill": "AWS",
          "type": "required",
          "priority": "high"
        }
      ],
      "explanation": "Strong backend alignment with the role, with minor gaps in React and AWS."
    }
  ]
}
```

Keep this stable because it is the primary frontend/backend boundary.

---

# 17. EXPLAINABILITY

Explanations must be generated from facts already present in the structured result.

Good:

```text
Strong Python and SQL alignment.
Relevant backend project experience.
CGPA satisfies the recruiter threshold.
React is a preferred skill that is currently weak.
```

Bad:

```text
This candidate seems like an amazing person who will definitely succeed.
```

The explanation must explain the decision, not invent personality traits.

---

# 18. SKILL GAPS

Compute:

```text
Target requirements
      -
Demonstrated capabilities
      =
Potential skill gaps
```

Separate:

```text
required gaps
preferred gaps
```

Example:

```text
Required:
Python ✓
SQL ✓
REST API ✓
AWS ✗

Preferred:
React ⚠
Docker ✗
```

Prioritize required gaps.

---

# 19. READINESS ENGINE

Readiness is independent from a specific recruiter.

Suggested inputs:

```text
Technical skills
Projects
Academics
Assessment
Communication
```

Categories:

```text
0–49    Not Ready
50–64   Developing
65–79   Ready
80–100  Highly Employable
```

Example:

```json
{
  "score": 84,
  "category": "Highly Employable",
  "breakdown": {
    "technical": 88,
    "projects": 91,
    "academics": 84,
    "assessment": 77,
    "communication": 73
  }
}
```

---

# 20. RECOMMENDATIONS

Recommendations must derive from real gaps.

Example:

```text
Gap:
Docker

Reason:
Required by target role.

Recommendation:
Learn Docker fundamentals and containerize one existing backend project.
```

Avoid generic motivational output.

---

# 21. API SURFACE

Current:

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

Future:

```text
GET/POST /recruiters
GET/POST /drives
GET/POST /applications
GET/POST /offers
GET /analytics
POST /copilot/query
```

Do not build future APIs prematurely.

---


# 21.5. THREE-PORTAL UI MODEL

The product should feel like one platform with three role-aware experiences.

## Institution Portal

Primary customer experience.

Current MVP screens:

```text
Institution Dashboard
Students
Jobs / Drives
Candidate Matching
```

Future:

```text
Scheduling
Offers
Analytics
Recruiter Management
```

## Student Portal

Current MVP screens:

```text
My Profile
My Readiness
Recommended Roles / Opportunities
Skill Gaps
```

Future:

```text
Applications
Interview status
Offers
Documents
```

## Company / Recruiter Portal

Current MVP screens:

```text
Company Dashboard
Create / Upload Job
Candidate Matches
Candidate Details
```

Future:

```text
Interview pipeline
Drive management
Offer workflow
```

All three portals must reuse shared components where appropriate and consume the same API contracts.

Do not create separate business logic for each portal.

# 22. FRONTEND

Target navigation:

```text
Dashboard
Students
Recruiters
Jobs / Drives
Matches
Analytics
Offers
```

For the current prototype, the most important screens are:

```text
Dashboard
Job Details
Candidate Ranking
Candidate Details
Student Readiness
```

The candidate ranking/detail experience is more important than decorative dashboard elements.

---

# 23. PRIMARY DEMO

The demo must be:

```text
Open CAMPUSLINK
      ↓
Select job / upload JD
      ↓
Show extracted requirements
      ↓
Find Candidates
      ↓
Eligibility filtering
      ↓
Semantic matching
      ↓
Ranked candidates
      ↓
Open candidate
      ↓
Match breakdown
      ↓
Why this candidate?
      ↓
Skill gaps
      ↓
Readiness
      ↓
Recommended actions
```

The judge should understand the entire value proposition through this flow.

---

# 24. DEMO DATA

Create realistic synthetic data:

```text
30–50 students
5–8 jobs
3–5 companies
```

Include:

- excellent technical candidate
- strong academics / weak skills
- strong project candidate
- weak communication candidate
- partial match
- ineligible candidate
- required skill gaps
- preferred skill gaps

Prepare at least:

```text
Backend Engineer
Frontend Engineer
Data/ML Engineer
```

The same students should rank differently for different roles.

---

# 25. DATABASE

Start with:

```text
students
student_skills
student_projects
student_certifications
student_assessments

recruiters
jobs
job_requirements

matches
match_reasons
skill_gaps
```

Later:

```text
placement_drives
applications
offers
documents
placement_outcomes
```

Do not create tables with no corresponding feature.

---

# 26. VECTOR STORAGE

If pgvector is used, store embeddings for relevant objects such as:

```text
student skill/profile embeddings
project embeddings
job requirement embeddings
```

Do not introduce a separate vector database unless there is a demonstrated need.

---

# 27. AI PROVIDER ABSTRACTION

Never scatter provider-specific SDK calls through the application.

Use a service interface such as:

```text
AIProvider
├── extract_student_profile()
├── extract_job_requirements()
├── generate_explanation()
├── generate_recommendation()
└── embed()
```

The matching engine should depend on this abstraction, not directly on a vendor SDK.

---

# 28. ENVIRONMENT

Use:

```text
DATABASE_URL=
AI_API_KEY=
AI_MODEL=
EMBEDDING_MODEL=
NEXT_PUBLIC_API_URL=
```

Provide `.env.example`.

Never commit:

```text
.env
API keys
tokens
credentials
```

---

# 29. ERROR HANDLING AND FALLBACKS

Expect:

- AI failure
- PDF extraction failure
- invalid JSON
- missing fields
- database failure
- network timeout

Use graceful fallbacks.

For the hackathon, deterministic validated fixtures are acceptable if an external AI request fails.

Never silently invent data.

Frontend operations must have:

```text
loading
success
empty
error
```

states.

---

# 30. TESTING

At minimum:

## Eligibility

```text
CGPA pass/fail
branch pass/fail
backlog pass/fail
graduation-year pass/fail
```

## Matching

```text
perfect match
partial match
poor match
semantic match
```

## Extraction

```text
valid PDF
missing section
malformed input
empty field
```

## API

```text
valid request
invalid ID
empty dataset
AI failure
database failure
```

Critical integration test:

```text
Job
 ↓
Eligibility
 ↓
Matching
 ↓
Ranking
 ↓
API
 ↓
Frontend
```

---

# 31. FIVE-DAY PLAN

## DAY 1 — FOUNDATION

Goal:

> Everything exists, boots, and has the correct product boundaries.

Audit existing implementation first.

Then complete missing:

- frontend shell
- backend
- database
- schemas
- tenant/institution context
- role/portal routing foundation
- seed data
- API conventions
- AI abstraction

The three portal contexts should be structurally possible from Day 1, but their advanced features are not yet required.

Do not rewrite working infrastructure.

## DAY 2 — INPUT INTELLIGENCE

Goal:

> Raw JD/resume becomes structured data.

Complete:

- PDF extraction
- JD parsing
- resume parsing
- schema validation
- skill normalization
- persistence

## DAY 3 — CORE INTELLIGENCE

Goal:

> A recruiter gets a real ranked candidate list.

Complete:

- eligibility
- semantic matching
- project relevance
- weighted scoring
- ranking
- match API
- frontend integration

**Critical milestone:**

```text
JD → Candidates → Ranked Results
```

must work end-to-end.

## DAY 4 — EXPLAINABILITY + READINESS

Complete:

- match breakdown
- reasons
- skill gaps
- readiness
- recommendations
- candidate detail page
- student portal readiness/profile view
- recruiter/company candidate view
- institution matching view

Keep all three views on the same backend contracts.

## DAY 5 — FREEZE + DEMO

Only:

- integration tests
- bug fixing
- UI polish
- loading/error states
- demo data
- performance checks
- rehearsal

No major new features.

---

# 32. PRIORITY ORDER

If time becomes constrained:

```text
P0
1. JD input
2. Student data
3. Eligibility
4. Matching
5. Ranking
6. Explanation

P1
7. Skill gaps
8. Readiness
9. Candidate details
10. Recommendations

P2
11. Analytics
12. Offer tracking
13. Recruiter management

P3
14. Scheduling
15. Notifications
16. Copilot
17. Predictive risk
18. Multi-campus
19. Mobile
20. Blockchain
```

Never sacrifice matching correctness to add a new feature.

---

# 33. MODULE CONNECTIONS

This is one unified project.

```text
INPUT
Resume / JD / Student Records
        ↓
AI EXTRACTION
Resume parser / JD parser / normalization
        ↓
DOMAIN CORE
Eligibility → Matching → Scoring
Readiness → Skill gaps
        ↓
PRESENTATION
Dashboard / Ranking / Explanation
        ↓
FUTURE
Scheduling / Offers / Analytics / Copilot
```

Use typed schemas and service boundaries.

Avoid circular dependencies.

---

# 34. CODING RULES FOR THE AI EDITOR

Before modifying anything:

1. Inspect the repository.
2. Find the existing implementation.
3. Identify the module that owns the behavior.
4. Reuse existing utilities.
5. Avoid duplicate services.
6. Preserve stable API contracts.
7. Change schemas only when necessary.
8. Add tests for important rules.
9. Keep secrets in environment variables.
10. Run tests/type checks after meaningful changes.

Implementation workflow:

```text
Understand
 ↓
Inspect
 ↓
Locate owner
 ↓
Plan smallest safe change
 ↓
Implement
 ↓
Test
 ↓
Integrate
```

Do not rebuild working sections without a concrete reason.

---

# 35. CODE QUALITY

Prefer:

```text
small modules
typed schemas
clear service boundaries
pure scoring functions
deterministic rules
central configuration
reusable UI components
```

Avoid:

```text
giant files
duplicated logic
hardcoded URLs
hardcoded secrets
LLM calls inside DB models
LLM calls inside scoring arithmetic
frontend-only business logic
unnecessary abstractions
```

---

# 36. PERFORMANCE

For the prototype:

- batch embeddings where practical
- cache repeated AI extraction
- avoid an LLM call for every candidate
- calculate deterministic components locally
- persist reusable match results
- avoid recomputing unchanged embeddings
- paginate candidate lists

Do not prematurely optimize.

---

# 37. SECURITY

Even for the prototype:

- never commit secrets
- validate uploads
- restrict file types
- limit upload size
- sanitize extracted content
- validate API input
- hide internal errors
- validate every structured AI response
- never trust raw LLM output

Production will eventually need RBAC, audit logs, stronger privacy controls and encryption.

---

# 38. FUTURE ARCHITECTURE

Once the MVP is stable:

```text
                    CAMPUSLINK
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   Student AI      Recruiter AI       Placement Ops
        │               │                │
        ▼               ▼                ▼
   Readiness         Matching        Scheduling
   Skill gaps        Ranking         Conflicts
   Preparation       Explainability  Notifications
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                 Outcome Analytics
                        │
                        ▼
              Predictive Intelligence
```

The matching engine remains the central intelligence layer.

---

# 39. SUCCESS CRITERIA

A judge should be able to understand:

```text
"We upload a recruiter JD."
        ↓
"CAMPUSLINK understands the requirements."
        ↓
"It removes candidates who are not eligible."
        ↓
"It semantically compares eligible students."
        ↓
"It ranks the best candidates."
        ↓
"It explains why each candidate received that score."
        ↓
"It identifies the student's gaps."
        ↓
"It tells the student what to improve."
```

That is the current product story.

---


# 39.5. IMPORTANT — DO NOT TURN PORTALS INTO SEPARATE PROJECTS

The three portals are a **product architecture decision**, not a reason to create three repositories, three APIs, or three independent applications.

Use:

```text
One repository
One backend
One database
One shared intelligence layer
Three route/role contexts
```

The same student/job/match entities are reused across the portal experiences.

When implementing a new feature, first ask:

> Is this shared domain logic, or merely a different view of the same data?

If it is domain logic, implement it once in the backend/core.

If it is presentation, adapt it in the relevant portal.


# 40. CURRENT WORK MODE

The project has already been initialized from the earlier Developer 1 specification.

Therefore:

> **DO NOT recreate the project from scratch.**

The first task is an implementation audit:

```text
1. Inspect repository tree.
2. Inspect package/dependency files.
3. Inspect environment configuration.
4. Inspect frontend entry points.
5. Inspect backend entry points.
6. Inspect database configuration.
7. Inspect models/schemas.
8. Inspect API routes.
9. Inspect existing AI integrations.
10. Inspect seed/demo data.
11. Inspect tests.
```

Then classify:

```text
CURRENTLY WORKING
ALREADY IMPLEMENTED
MISSING P0
BROKEN / CONFLICTING
NEXT 3 IMPLEMENTATION STEPS
```

Only after that should implementation continue.

Do not delete working code simply because its structure differs from this document.

**Repository = implementation.  
This document = architectural contract.**

---

# 41. IMMEDIATE NEXT ACTION

Start from the existing codebase.

Do not write new code until the implementation audit has been completed.

After the audit, implement the highest-priority missing P0 component.

The project must always remain runnable and demoable.

---

# 42. FINAL ENGINEERING RULE

> **Do not build more features at the cost of making the core intelligence less reliable.**

A polished:

```text
JD → Eligibility → Matching → Explanation → Skill Gap
```

is more valuable for this prototype than a half-built:

```text
JD → Matching → Scheduling → WhatsApp → Offers → Blockchain → Mobile
```

Build the intelligence layer first. Expand only after the core works reliably.

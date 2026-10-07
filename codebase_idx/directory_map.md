# CampusLink — Directory Map & Component Ownership (`codebase_idx/directory_map.md`)

This document maps all directories and key files across the repository, identifying which agent/developer owns each module and its exact role in the system.

---

## 1. Top-Level Repository Map

```text
/Users/suvasanketrout/developer/CampusLink/
├── init.md                             # Specification & MVP blueprint (Read-only reference)
├── agents.md                           # Multi-agent collaboration protocol & system rules
├── codebase_idx.md                     # Codebase index quick entrypoint
├── codebase_idx/                       # Master Codebase Knowledge Base
│   ├── README.md                       # Master index table & navigation
│   ├── architecture.md                 # System layers, data flow & modular design
│   ├── directory_map.md                # File taxonomy & ownership guide (this file)
│   ├── contracts.md                    # Data schemas & contract specifications
│   ├── api_spec.md                     # REST API endpoints & schemas
│   ├── intelligence_engine.md          # Eligibility, scoring, embeddings & readiness
│   └── data_fixtures.md                # Seed dataset catalog & fallback policy
├── backend/                            # Agent 1 (Backend & Intelligence Lead)
│   ├── app/
│   │   ├── api/                        # Route handlers (/health, /jobs, /students)
│   │   ├── core/                       # App settings, logging, configurations
│   │   ├── db/                         # SQLAlchemy session & base models
│   │   ├── models/                     # Database entity models
│   │   ├── schemas/                    # Pydantic request/response validation
│   │   ├── services/                   # Business logic (matching, scoring, etc.)
│   │   └── main.py                     # FastAPI application bootstrap
│   ├── tests/                          # Backend unit & integration test suites
│   ├── requirements.txt                # Python backend dependencies
│   └── seed_db.py                      # Database seeder from data/ fixtures
├── frontend/                           # Agent 2 (Frontend & UX Lead)
│   ├── src/
│   │   ├── components/                 # UI components (CandidateCard, BreakdownModal)
│   │   ├── pages/                      # Main views (RecruiterDashboard, JobDetail)
│   │   ├── services/                   # API client adapters with fallback mocks
│   │   ├── App.jsx                     # Top-level React router/app root
│   │   └── index.css                   # Tailwind CSS styling
│   ├── package.json                    # Node dependencies
│   └── vite.config.js                  # Vite bundler configuration
├── ai_pipeline/                        # Agent 3 (AI & Data Ingestion Lead)
│   ├── parsers/                        # PyMuPDF + LLM text extractors
│   │   ├── resume_parser.py            # Extracts student profile JSON from PDF
│   │   └── jd_parser.py                # Extracts job requirements JSON from PDF
│   ├── normalizers/                    # Skill alias & taxonomy normalization
│   │   └── skill_normalizer.py         # ReactJS -> React, Postgres -> PostgreSQL
│   ├── prompts/                        # LLM prompt templates (Gemini)
│   └── requirements.txt                # AI pipeline Python dependencies
├── data/                               # Shared Seed Data & Fixtures
│   ├── students.json                   # Verified seed student profiles (STU001 - STU005)
│   ├── jobs.json                       # Verified seed job postings (JOB001 - JOB003)
│   ├── sample_jds/                     # Sample raw JD PDFs and text files
│   └── sample_resumes/                 # Sample raw resume PDFs
└── docs/
    └── contracts/                      # Formal JSON Schemas
        ├── student.schema.json         # Authoritative Student JSON schema
        ├── job.schema.json             # Authoritative Job JSON schema
        └── match.schema.json           # Authoritative Match Response schema
```

---

## 2. Ownership & Permissions Matrix

| Directory / File | Owning Agent | Permitted Operations | Restricted Operations |
| :--- | :--- | :--- | :--- |
| `backend/` | **Agent 1** (Backend Lead) | Create/modify API, models, services, scoring logic, DB migrations. | Do not alter `frontend/` or `ai_pipeline/` files. |
| `frontend/` | **Agent 2** (Frontend Lead) | Create/modify UI components, styling, API client services, client mocks. | Do not import backend Python modules. Rely only on HTTP API. |
| `ai_pipeline/` | **Agent 3** (AI Lead) | Create/modify parsers, prompt templates, skill taxonomy, PDF extractors. | Do not handle DB persistence or candidate match scoring. |
| `docs/contracts/` | **All Agents** (Consensus) | Define data schemas. | No unilateral modifications without cross-agent agreement. |
| `data/` | **All Agents** | Read and provide fallback fixtures. | Keep test fixtures compliant with `docs/contracts/`. |
| `codebase_idx/` | **System Architect** | Update architecture documentation, index maps, and guides. | Keep aligned with current code state. |

---

## 3. Backend Service Map (`backend/app/services/`)

Each service inside `backend/app/services/` has a focused single responsibility:

| File | Primary Responsibility |
| :--- | :--- |
| `eligibility.py` | Deterministic evaluator: checks CGPA, active backlogs, and branch whitelist. Returns pass/fail and reasons list. |
| `embeddings.py` | Generates text embeddings (local SentenceTransformer / Gemini) and computes cosine similarities. |
| `matching.py` | High-level match orchestrator: filters pool via `eligibility.py`, scores via `scoring.py`, ranks candidates. |
| `scoring.py` | Computes weighted multi-factor scores ($0.40 \times \text{skills} + 0.20 \times \text{projects} + \dots$). |
| `explanations.py` | Generates natural language match summary and candidate strengths based on ground-truth score breakdown. |
| `recommendations.py`| Computes candidate readiness score and categorizes missing skills into required vs preferred gaps. |

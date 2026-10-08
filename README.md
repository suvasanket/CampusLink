# CampusLink 🎓

> **Intelligent, Explainable Campus Placement Recommendation Engine**

CampusLink bridges university placement cells, students, and corporate recruiters by providing transparent, multi-factor candidate matching and automated skill gap analysis.

---

## ⚡ Quick Links & Navigation

- **Multi-Agent Protocol:** [`agents.md`](file:///Users/suvasanketrout/developer/CampusLink/agents.md) — Team roles, boundaries, and collaboration rules.
- **Codebase Index:** [`codebase_idx/README.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/README.md) — Authoritative knowledge base for agents and developers.
- **Initial Spec:** [`init.md`](file:///Users/suvasanketrout/developer/CampusLink/init.md) — Original prototype specification.
- **Data Contracts:** [`docs/contracts/`](file:///Users/suvasanketrout/developer/CampusLink/docs/contracts/) — Formal JSON schemas (`student`, `job`, `match`).

---

## 🏛️ Architecture Overview

CampusLink follows a **modular monolith** backend paired with a high-clarity React interface:

```text
Recruiter JD ──▶ Hard Eligibility Filter ──▶ Semantic Matching ──▶ Weighted Scoring ──▶ Explainable Ranking ──▶ Skill Gaps
```

1. **Deterministic Eligibility:** Strict rules for CGPA cutoff, permitted branches, and active backlogs. (No LLM hallucinations in eligibility).
2. **Semantic Matching:** Vector embeddings comparing student projects and skill proficiencies against job descriptions.
3. **Multi-Factor Weighted Scoring:**
   - Skills: **40%**
   - Projects: **20%**
   - Academics: **15%**
   - Assessment: **10%**
   - Certifications: **10%**
   - Communication: **5%**
4. **Explainability & Skill Gaps:** Returns strengths, required skill gaps, preferred skill gaps, and an overall Readiness Tier.

---

## 🚀 Getting Started (Native Local Setup)

> **Note:** Docker is completely optional. CampusLink runs natively on macOS and Linux with zero external container dependencies.

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and npm

### 2. Setup And Run
Look at `makefile`

---

## 📂 Repository Layout

```text
CampusLink/
├── backend/            # FastAPI backend & matching engine (Agent 1)
├── frontend/           # React + Vite recruiter dashboard (Agent 2)
├── ai_pipeline/        # PyMuPDF + LLM extraction & normalizer (Agent 3)
├── codebase_idx/       # Comprehensive codebase knowledge base
├── data/               # Seed datasets & sample resumes/JDs
├── docs/contracts/     # JSON schema specifications
├── agents.md           # Multi-agent collaboration protocol
└── README.md           # Project documentation
```

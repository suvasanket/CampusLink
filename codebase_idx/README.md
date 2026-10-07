# CampusLink — Codebase Master Index (`codebase_idx`)

Welcome to the **CampusLink Codebase Index**. This directory is the single source of truth for repository structure, domain architecture, contract specifications, API routes, intelligence logic, and test fixtures.

AI agents and human developers should use this index to retrieve precise context without searching the entire filesystem.

---

## 1. Quick Navigation Matrix

| Topic | Document Reference | Key Concepts Covered |
| :--- | :--- | :--- |
| **System Architecture** | [`codebase_idx/architecture.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/architecture.md) | Modular monolith, system layers, data flow diagrams, technology stack rationale. |
| **Directory Map & Ownership** | [`codebase_idx/directory_map.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/directory_map.md) | File trees, folder responsibilities, ownership boundaries for Agents 1, 2, and 3. |
| **Data Contracts & Schemas** | [`codebase_idx/contracts.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/contracts.md) | Schema definitions for Student, Job, Match Result, Eligibility, and Readiness. |
| **REST API Specification** | [`codebase_idx/api_spec.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/api_spec.md) | Endpoint catalog (`/health`, `/jobs`, `/students`, `/matches`), status codes, payloads. |
| **Intelligence Engine** | [`codebase_idx/intelligence_engine.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/intelligence_engine.md) | Deterministic eligibility, vector embedding matcher, multi-factor weighting, skill gaps. |
| **Data Fixtures & Fallbacks** | [`codebase_idx/data_fixtures.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/data_fixtures.md) | Seed datasets (`students.json`, `jobs.json`), mock fallback policies, demo test cases. |
| **Multi-Agent Protocol** | [`agents.md`](file:///Users/suvasanketrout/developer/CampusLink/agents.md) | System roles, operational boundaries, Day 1–5 gates, deterministic vs AI rules. |
| **Product Specification** | [`init.md`](file:///Users/suvasanketrout/developer/CampusLink/init.md) | Original 5-day prototype vision and MVP functional boundaries. |

---

## 2. Core Operational Principles for Agents

1. **Deterministic Filter Before AI Scoring:** Never compute semantic scores or LLM summaries for a candidate who has failed hard eligibility (CGPA, branch, backlogs).
2. **Contract-First Communication:** Agent 3 produces validated JSON matching schemas in [`docs/contracts/`](file:///Users/suvasanketrout/developer/CampusLink/docs/contracts). Agent 1 consumes that JSON and serves REST API responses to Agent 2. No direct code imports across agent domains.
3. **Zero-Blocker Local Execution:** The codebase must execute natively on macOS/Linux using Python 3.12 (`venv`) and Node.js (`npm`). Docker is completely optional. SQLite is the default local store with optional PostgreSQL.
4. **Mandatory Offline Fallbacks:** If external LLM or vector APIs fail or hit rate limits, the system must gracefully fall back to local rule-based matchers and static fixtures in [`data/`](file:///Users/suvasanketrout/developer/CampusLink/data).

---

## 3. How to Use this Index During Development

- **When adding or modifying an API endpoint:** Verify the contract in [`codebase_idx/contracts.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/contracts.md) and [`codebase_idx/api_spec.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/api_spec.md).
- **When tweaking scoring or eligibility rules:** Consult [`codebase_idx/intelligence_engine.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/intelligence_engine.md) to preserve the 6-factor mathematical weighting.
- **When checking file placement:** Consult [`codebase_idx/directory_map.md`](file:///Users/suvasanketrout/developer/CampusLink/codebase_idx/directory_map.md).

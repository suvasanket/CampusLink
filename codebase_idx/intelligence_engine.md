# CampusLink — Intelligence & Matching Engine (`codebase_idx/intelligence_engine.md`)

This document specifies the exact algorithms, mathematical formulas, and business rules governing candidate eligibility, semantic matching, weighted scoring, and skill gap diagnostics.

---

## 1. Engine Architecture & Flow

```mermaid
flowchart TD
    STUDENT[Candidate Profile] --> ELIG_CHECK{Hard Eligibility Check}
    JOB[Job Requirements] --> ELIG_CHECK
    
    ELIG_CHECK -->|Fail| INELIGIBLE[Ineligible Bucket<br/>Score = 0 / Suppressed<br/>Audit Reasons Logged]
    ELIG_CHECK -->|Pass| SEMANTIC[Semantic Feature Extraction]
    
    SEMANTIC --> S_SKILL[1. Skill Similarity (40%)]
    SEMANTIC --> S_PROJ[2. Project Relevance (20%)]
    SEMANTIC --> S_ACAD[3. Academic Profile (15%)]
    SEMANTIC --> S_ASSESS[4. Assessment Score (10%)]
    SEMANTIC --> S_CERT[5. Certification Relevance (10%)]
    SEMANTIC --> S_COMM[6. Communication (5%)]
    
    S_SKILL --> DOT[Weighted Dot-Product Combination]
    S_PROJ --> DOT
    S_ACAD --> DOT
    S_ASSESS --> DOT
    S_CERT --> DOT
    S_COMM --> DOT
    
    DOT --> FINAL[Final Match Score 0-100]
    FINAL --> SORT[Deterministic Rank Sorting]
    SORT --> EXPLAIN[Grounded Natural Language Explainer]
    SORT --> GAPS[Skill Gap & Readiness Breakdown]
```

---

## 2. Hard Eligibility Engine (`eligibility.py`)

Eligibility is **purely deterministic**. It never involves LLM calls.

### 2.1. Rule Definitions
A candidate is marked `eligible = True` if and only if **all three conditions hold**:
1. **CGPA Criterion:** `student.cgpa >= job.minimum_cgpa`
2. **Discipline Criterion:** `student.branch in job.eligible_branches` (case-insensitive)
3. **Backlog Criterion:** `student.backlogs <= job.max_backlogs`

### 2.2. Audit Reasons Output
When evaluated, the engine returns an audit trail:
```python
reasons = []
if student.cgpa >= job.minimum_cgpa:
    reasons.append(f"CGPA {student.cgpa} meets minimum requirement of {job.minimum_cgpa}")
else:
    reasons.append(f"CGPA {student.cgpa} below required threshold of {job.minimum_cgpa}")

if student.branch.upper() in [b.upper() for b in job.eligible_branches]:
    reasons.append(f"Branch '{student.branch}' is eligible")
else:
    reasons.append(f"Branch '{student.branch}' is not in eligible list ({job.eligible_branches})")

if student.backlogs <= job.max_backlogs:
    reasons.append(f"Active backlogs ({student.backlogs}) within limit ({job.max_backlogs})")
else:
    reasons.append(f"Active backlogs ({student.backlogs}) exceeds limit ({job.max_backlogs})")
```

---

## 3. Weighted Scoring Engine (`scoring.py`)

Once a candidate passes eligibility, their composite score ($S \in [0, 100]$) is computed:

$$S = \sum_{i=1}^{6} w_i \cdot s_i$$

### 3.1. Standard Weight Configuration
```python
WEIGHTS = {
    "skills": 0.40,          # w1: Technical skill overlap & proficiency
    "projects": 0.20,        # w2: Semantic project alignment
    "academics": 0.15,       # w3: Normalized academic performance
    "assessment": 0.10,      # w4: Technical/aptitude test result
    "certifications": 0.10,  # w5: Domain certification alignment
    "communication": 0.05,   # w6: Communication proficiency
}
```

### 3.2. Sub-Score Formulas
1. **Skill Similarity ($s_1 \in [0, 100]$):**
   - Exact and normalized match against `required_skills`:
     $$s_{\text{req}} = \frac{1}{|R|} \sum_{r \in R} \text{proficiency}(r)$$
   - Bonus for `preferred_skills` up to $+10\%$.
2. **Project Relevance ($s_2 \in [0, 100]$):**
   - Cosine similarity between student project descriptions and job requirements text using sentence embeddings:
     $$\text{sim}(u, v) = \frac{u \cdot v}{\|u\| \|v\|}$$
     $$s_2 = \max(\text{sim}(P_j, J)) \times 100$$
3. **Academic Profile ($s_3 \in [0, 100]$):**
   - Linearly scaled CGPA:
     $$s_3 = \min\left(100, \frac{\text{student.cgpa}}{10.0} \times 100\right)$$
4. **Assessment Score ($s_4 \in [0, 100]$):**
   - $$s_4 = 0.6 \times \text{assessment.technical} + 0.4 \times \text{assessment.aptitude}$$
5. **Certifications ($s_5 \in [0, 100]$):**
   - Scaled based on relevance and count ($1 \text{ cert} = 75, 2+ \text{ certs} = 90-100$).
6. **Communication ($s_6 \in [0, 100]$):**
   - Direct value from `student.assessment.communication`.

---

## 4. Skill Gap Diagnostics (`recommendations.py`)

For an eligible student and target job:
1. **Missing Required Skills:**
   $$\text{Gap}_{\text{req}} = \{r \in \text{Job.required\_skills} \mid \text{normalize}(r) \notin \text{Student.skills}\}$$
2. **Missing Preferred Skills:**
   $$\text{Gap}_{\text{pref}} = \{p \in \text{Job.preferred\_skills} \mid \text{normalize}(p) \notin \text{Student.skills}\}$$

---

## 5. Employability Readiness Score

Evaluates a student's holistic preparation independently of any single job:
$$\text{Readiness} = 0.35 \times \text{Skills} + 0.25 \times \text{Projects} + 0.20 \times \text{Academics} + 0.15 \times \text{Technical Assessment} + 0.05 \times \text{Communication}$$

### Tiers:
- **80 – 100:** *Highly Employable*
- **65 – 79:** *Ready*
- **50 – 64:** *Developing*
- **0 – 49:** *Not Ready*

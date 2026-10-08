import pytest
import uuid
from fastapi.testclient import TestClient
from app.api.routes import router
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

TEST_SLUG = f"stanford-{uuid.uuid4().hex[:6]}"
STUDENT_ID = f"STAN_STU_{uuid.uuid4().hex[:4]}"

def test_institution_registration_and_lookup():
    # Register new college
    inst_payload = {
        "name": "Stanford Indian Campus",
        "username": TEST_SLUG,
        "code": "STAN-IN",
        "location": "Hyderabad, Telangana",
        "contact_email": "placements@stanford-in.edu",
        "admin_name": "Dr. Eleanor Vance",
        "website": "https://stanford-in.edu"
    }
    res = client.post("/institutions", json=inst_payload)
    assert res.status_code == 201
    created = res.json()
    assert created["username"] == TEST_SLUG
    assert created["id"] == f"inst-{TEST_SLUG}"
    assert created["name"] == "Stanford Indian Campus"
    assert created["is_verified"] is True

    # Lookup by username slug
    res_slug = client.get(f"/institutions/{TEST_SLUG}")
    assert res_slug.status_code == 200
    assert res_slug.json()["name"] == "Stanford Indian Campus"

    # Lookup by ID
    res_id = client.get(f"/institutions/{created['id']}")
    assert res_id.status_code == 200
    assert res_id.json()["username"] == TEST_SLUG

    # Scoped stats for new institution
    res_stats = client.get(f"/institutions/{TEST_SLUG}/stats")
    assert res_stats.status_code == 200
    assert res_stats.json()["total_students"] == 0

def test_student_registration_under_institution():
    # Register a student under the test institution
    student_payload = {
        "id": STUDENT_ID,
        "name": "Kavya Sundaram",
        "branch": "CSE",
        "graduation_year": 2027,
        "cgpa": 9.4,
        "backlogs": 0,
        "skills": [
            {"name": "Python", "level": 0.95},
            {"name": "FastAPI", "level": 0.9},
            {"name": "PostgreSQL", "level": 0.85}
        ],
        "projects": [
            {
                "title": "Autonomous Matching Mesh",
                "description": "Distributed placement matching mesh",
                "technologies": ["Python", "FastAPI", "Redis"]
            }
        ],
        "certifications": [
            {"title": "AWS Certified Developer", "issuer": "Amazon", "year": 2026}
        ],
        "assessment": {
            "aptitude": 92.0,
            "technical": 96.0,
            "communication": 90.0
        }
    }
    res = client.post(f"/institutions/{TEST_SLUG}/students", json=student_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] == STUDENT_ID
    assert data["institution_id"] == f"inst-{TEST_SLUG}"
    assert data["readiness_score"] is not None
    assert data["readiness_score"] >= 80.0
    assert data["readiness_tier"] == "Highly Employable"

    # Verify student is in institution directory
    res_list = client.get(f"/institutions/{TEST_SLUG}/students")
    assert res_list.status_code == 200
    students = res_list.json()
    assert any(s["id"] == STUDENT_ID for s in students)

    # Verify stats updated
    res_stats = client.get(f"/institutions/{TEST_SLUG}/stats")
    assert res_stats.status_code == 200
    assert res_stats.json()["total_students"] == 1
    assert res_stats.json()["readiness_distribution"]["Highly Employable"] == 1

def test_recruiter_registration_and_portal_access():
    # Register recruiter under test institution with initial job
    rec_payload = {
        "name": "Marcus Aurelius",
        "company_name": f"Datadog Cloud {uuid.uuid4().hex[:4]}",
        "email": "marcus.aurelius@datadog.com",
        "designation": "Director of University Talent",
        "initial_job_title": "Site Reliability Engineer",
        "initial_job_min_cgpa": 8.0,
        "initial_job_branches": ["CSE", "IT", "ECE"],
        "initial_job_skills": ["Python", "Linux", "Docker"]
    }
    res = client.post(f"/institutions/{TEST_SLUG}/recruiters", json=rec_payload)
    assert res.status_code == 201
    created_rec = res.json()
    assert created_rec["name"] == "Marcus Aurelius"
    assert created_rec["institution_id"] == f"inst-{TEST_SLUG}"
    assert created_rec["active_jobs_count"] == 1
    recruiter_id = created_rec["id"]

    # Access recruiter dashboard data
    res_profile = client.get(f"/institutions/{TEST_SLUG}/recruiters/{recruiter_id}")
    assert res_profile.status_code == 200
    data = res_profile.json()
    assert data["recruiter"]["id"] == recruiter_id
    assert len(data["jobs"]) >= 1
    job = data["jobs"][0]
    assert job["title"] == "Site Reliability Engineer"

    # Match candidates from test institution for this job
    match_res = client.get(f"/jobs/{job['id']}/matches?institution_id={TEST_SLUG}")
    assert match_res.status_code == 200
    matches = match_res.json()["matches"]
    assert len(matches) >= 1
    assert matches[0]["student_id"] == STUDENT_ID
    assert matches[0]["eligible"] is True


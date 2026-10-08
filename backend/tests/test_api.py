from fastapi.testclient import TestClient
from app.main import app
from app.db.session import init_db

init_db()
client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "version" in data

def test_list_jobs():
    response = client.get("/jobs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_get_job_matches():
    # Test matching for seeded job JOB001
    response = client.get("/jobs/JOB001/matches")
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == "JOB001"
    assert "matches" in data
    assert len(data["matches"]) > 0

    # Ensure candidates are ranked in order
    ranks = [m["rank"] for m in data["matches"]]
    assert ranks == list(range(1, len(ranks) + 1))

    # Check top candidate conforms to schema
    top_candidate = data["matches"][0]
    assert "match_score" in top_candidate
    assert "breakdown" in top_candidate
    assert "explanation" in top_candidate

def test_student_readiness():
    response = client.get("/students/STU001/readiness")
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == "STU001"
    assert 0.0 <= data["readiness_score"] <= 100.0
    assert data["tier"] in ["Highly Employable", "Ready", "Developing", "Not Ready"]
    assert "factor_scores" in data
    assert "recommendations" in data

def test_institution_stats():
    response = client.get("/institution/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_students" in data
    assert "total_jobs" in data
    assert "readiness_distribution" in data
    assert "branch_summary" in data

def test_parse_job():
    payload = {
        "raw_text": "We are seeking Backend Software Engineers with proficiency in Python, PostgreSQL, and Docker.",
        "company_name": "Nexus Innovations"
    }
    response = client.post("/jobs/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "title" in data
    assert "minimum_cgpa" in data
    assert len(data["required_skills"]) > 0

def test_parse_resume():
    payload = {
        "raw_text": "Ananya Sharma, B.Tech CSE 2027. Proficient in Python, SQL, and Docker. Built a high-concurrency microservice."
    }
    response = client.post("/students/parse-resume?save=false", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert len(data["skills"]) > 0
    assert any(s["name"] == "Python" for s in data["skills"])

def test_application_lifecycle():
    # 1. Create / Shortlist
    app_data = {
        "job_id": "JOB001",
        "student_id": "STU001",
        "status": "Shortlisted",
        "match_score": 92.5,
        "notes": "Excellent candidate profile"
    }
    create_resp = client.post("/applications", json=app_data)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["job_id"] == "JOB001"
    assert created["student_id"] == "STU001"
    assert created["status"] == "Shortlisted"
    app_id = created["id"]

    # 2. List Applications
    list_resp = client.get("/applications?job_id=JOB001")
    assert list_resp.status_code == 200
    apps = list_resp.json()
    assert any(a["id"] == app_id for a in apps)

    # 3. Delete Application
    del_resp = client.delete(f"/applications/{app_id}")
    assert del_resp.status_code == 204


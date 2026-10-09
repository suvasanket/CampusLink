import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.entities import Application, Job, Student

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup_applications():
    """Ensure clean application state for JOB001 before and after each test."""
    db = SessionLocal()
    db.query(Application).filter(Application.job_id == "JOB001").delete()
    db.commit()
    db.close()
    yield
    db = SessionLocal()
    db.query(Application).filter(Application.job_id == "JOB001").delete()
    db.commit()
    db.close()

def test_auto_shortlist_preview_top_x():
    """Verify preview returns simulated Top X candidates without modifying database."""
    # Test Top 5 preview
    resp = client.post(
        "/jobs/JOB001/auto-shortlist/preview",
        json={"strategy": "top_n", "top_n": 5}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["job_id"] == "JOB001"
    assert data["total_qualified"] == 5
    assert len(data["candidates"]) == 5
    assert data["already_shortlisted_count"] == 0
    assert data["newly_shortlisted_count"] == 5
    assert data["avg_match_score"] > 0
    for cand in data["candidates"]:
        assert cand["already_shortlisted"] is False
        assert cand["match_score"] > 0

    # Verify no database records were created
    db = SessionLocal()
    count = db.query(Application).filter(Application.job_id == "JOB001").count()
    db.close()
    assert count == 0

def test_auto_shortlist_execution_top_x():
    """Verify executing auto-shortlist commits Top X candidates to the database."""
    resp = client.post(
        "/jobs/JOB001/auto-shortlist",
        json={"strategy": "top_n", "top_n": 7, "notes": "Automated Top 7 shortlist test"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_shortlisted"] == 7
    assert data["newly_shortlisted_count"] == 7
    assert data["already_shortlisted_count"] == 0
    assert len(data["application_ids"]) == 7

    # Verify in DB
    db = SessionLocal()
    count = db.query(Application).filter(Application.job_id == "JOB001").count()
    db.close()
    assert count == 7

def test_auto_shortlist_idempotency():
    """Verify running auto-shortlist again does not create duplicate records."""
    # First run: Top 5
    client.post("/jobs/JOB001/auto-shortlist", json={"strategy": "top_n", "top_n": 5})

    # Second run: Top 5 again
    resp2 = client.post("/jobs/JOB001/auto-shortlist", json={"strategy": "top_n", "top_n": 5})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["total_shortlisted"] == 5
    assert data2["newly_shortlisted_count"] == 0
    assert data2["already_shortlisted_count"] == 5

    # Third run: Top 8 (should add only 3 new)
    resp3 = client.post("/jobs/JOB001/auto-shortlist", json={"strategy": "top_n", "top_n": 8})
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert data3["total_shortlisted"] == 8
    assert data3["newly_shortlisted_count"] == 3
    assert data3["already_shortlisted_count"] == 5

    # Verify total DB count is exactly 8
    db = SessionLocal()
    count = db.query(Application).filter(Application.job_id == "JOB001").count()
    db.close()
    assert count == 8

def test_auto_shortlist_min_score():
    """Verify auto-shortlisting by minimum match score cutoff."""
    resp = client.post(
        "/jobs/JOB001/auto-shortlist",
        json={"strategy": "min_score", "min_score": 70.0}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_shortlisted"] > 0

    # Check that all created applications have match_score >= 70.0
    db = SessionLocal()
    apps = db.query(Application).filter(Application.job_id == "JOB001").all()
    for app in apps:
        assert app.match_score >= 70.0
    db.close()

def test_auto_shortlist_category():
    """Verify auto-shortlisting by category tier."""
    resp = client.post(
        "/jobs/JOB001/auto-shortlist",
        json={"strategy": "category", "categories": ["Suitable"]}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_shortlisted"] > 0

    db = SessionLocal()
    apps = db.query(Application).filter(Application.job_id == "JOB001").all()
    assert len(apps) == data["total_shortlisted"]
    db.close()

def test_bulk_shortlist_and_clear():
    """Verify manual batch student shortlisting and 1-click clear."""
    # Bulk shortlist 3 specific students
    resp = client.post(
        "/jobs/JOB001/bulk-shortlist",
        json={"job_id": "JOB001", "student_ids": ["STU001", "STU002", "STU003"], "notes": "Bulk manual test"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_shortlisted"] == 3
    assert data["newly_shortlisted_count"] == 3

    # Clear shortlist for JOB001
    clear_resp = client.post("/jobs/JOB001/clear-shortlist", json={"job_id": "JOB001"})
    assert clear_resp.status_code == 200
    assert clear_resp.json()["deleted_count"] == 3

    # Verify 0 applications remaining
    db = SessionLocal()
    count = db.query(Application).filter(Application.job_id == "JOB001").count()
    db.close()
    assert count == 0


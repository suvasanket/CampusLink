import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_institution_admin_login_success():
    """Verify that institution admin can authenticate with correct password."""
    resp = client.post(
        "/institutions/apex-inst/login",
        json={"password": "admin123"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["institution"]["username"] == "apex-inst"

def test_institution_admin_login_failure():
    """Verify that invalid password returns 401 Unauthorized."""
    resp = client.post(
        "/institutions/apex-inst/login",
        json={"password": "wrong_password_999"}
    )
    assert resp.status_code == 401
    assert "Invalid institution administrator password" in resp.json()["detail"]

def test_student_login_success():
    """Verify that student can authenticate with student ID and password."""
    resp = client.post(
        "/institutions/apex-inst/students/login",
        json={"identifier": "STU001", "password": "student123"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["student"]["id"] == "STU001"

def test_student_login_failure():
    """Verify that student login fails with incorrect password."""
    resp = client.post(
        "/institutions/apex-inst/students/login",
        json={"identifier": "STU001", "password": "invalid_student_pw"}
    )
    assert resp.status_code == 401
    assert "Invalid student credentials" in resp.json()["detail"]

def test_student_registration_with_custom_password_and_login():
    """Register a new student with custom password and verify login."""
    unique_id = "STU_SEC_TEST_99"
    reg_payload = {
        "id": unique_id,
        "name": "Security Test Candidate",
        "email": "sectest@apex.edu",
        "password": "MySecretPass!2026",
        "branch": "CSE",
        "graduation_year": 2027,
        "cgpa": 9.2,
        "backlogs": 0,
        "skills": [{"name": "Python", "level": 0.9}],
        "projects": [{"title": "SecApp", "description": "Auth testing", "technologies": ["Python"]}],
        "assessment": {"aptitude": 90, "technical": 95, "communication": 85}
    }
    reg_resp = client.post("/institutions/apex-inst/students", json=reg_payload)
    assert reg_resp.status_code in [201, 400]

    # Now login with the newly created password
    login_resp = client.post(
        "/institutions/apex-inst/students/login",
        json={"identifier": unique_id, "password": "MySecretPass!2026"}
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["student"]["id"] == unique_id

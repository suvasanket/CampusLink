import pytest
from app.models.entities import Student, Job
from app.services.eligibility import evaluate_eligibility

def test_eligible_candidate():
    student = Student(
        id="STU_TEST1",
        name="Eligible Student",
        branch="CSE",
        cgpa=8.5,
        backlogs=0,
        graduation_year=2027
    )
    job = Job(
        id="JOB_TEST1",
        company="TestCorp",
        title="Software Engineer",
        minimum_cgpa=7.5,
        eligible_branches=["CSE", "IT"],
        max_backlogs=0,
        graduation_years=[2027]
    )
    is_eligible, pass_reasons, failed_reqs = evaluate_eligibility(student, job)
    assert is_eligible is True
    assert len(failed_reqs) == 0
    assert len(pass_reasons) >= 3

def test_cgpa_cutoff_failure():
    student = Student(
        id="STU_TEST2",
        name="Low CGPA Student",
        branch="CSE",
        cgpa=6.8,
        backlogs=0,
        graduation_year=2027
    )
    job = Job(
        id="JOB_TEST1",
        company="TestCorp",
        title="Software Engineer",
        minimum_cgpa=7.5,
        eligible_branches=["CSE", "IT"],
        max_backlogs=0
    )
    is_eligible, pass_reasons, failed_reqs = evaluate_eligibility(student, job)
    assert is_eligible is False
    assert any("below cutoff" in r for r in failed_reqs)

def test_branch_whitelist_failure():
    student = Student(
        id="STU_TEST3",
        name="Mech Student",
        branch="MECH",
        cgpa=8.0,
        backlogs=0,
        graduation_year=2027
    )
    job = Job(
        id="JOB_TEST1",
        company="TestCorp",
        title="Software Engineer",
        minimum_cgpa=7.0,
        eligible_branches=["CSE", "IT"],
        max_backlogs=0
    )
    is_eligible, pass_reasons, failed_reqs = evaluate_eligibility(student, job)
    assert is_eligible is False
    assert any("not in eligible disciplines" in r for r in failed_reqs)

def test_backlog_failure():
    student = Student(
        id="STU_TEST4",
        name="Backlog Student",
        branch="CSE",
        cgpa=8.2,
        backlogs=2,
        graduation_year=2027
    )
    job = Job(
        id="JOB_TEST1",
        company="TestCorp",
        title="Software Engineer",
        minimum_cgpa=7.0,
        eligible_branches=["CSE"],
        max_backlogs=0
    )
    is_eligible, pass_reasons, failed_reqs = evaluate_eligibility(student, job)
    assert is_eligible is False
    assert any("exceeds maximum allowed" in r for r in failed_reqs)

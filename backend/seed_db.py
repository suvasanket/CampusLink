import json
import os
import sys
import logging

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import init_db, SessionLocal, active_db_type
from app.models.entities import Student, Job, Institution, Company, Recruiter
from app.core.security import hash_password

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("campuslink.seed")

def seed_database():
    """Seed the active database (PostgreSQL or SQLite) from JSON fixtures."""
    logger.info(f"Initializing database schema on {active_db_type}...")
    init_db()

    data_dir = os.path.abspath(os.path.join(backend_dir, "..", "data"))
    students_file = os.path.join(data_dir, "students.json")
    jobs_file = os.path.join(data_dir, "jobs.json")

    db = SessionLocal()
    try:
        # 1. Seed Institution Multi-Tenant Profiles
        default_admin_hash = hash_password("admin123")
        institutions_to_seed = [
            {
                "id": "inst-001",
                "username": "apex-inst",
                "name": "Apex Institute of Technology",
                "code": "AIT",
                "location": "Bengaluru, Karnataka",
                "contact_email": "placements@apex.edu",
                "admin_name": "Dr. K. S. Sharma",
                "website": "https://apex.edu",
                "password_hash": default_admin_hash,
                "is_verified": True
            },
            {
                "id": "inst-002",
                "username": "national-tech",
                "name": "National Institute of Technology",
                "code": "NIT",
                "location": "Surathkal, Karnataka",
                "contact_email": "placements@nit.edu",
                "admin_name": "Prof. Anand Rao",
                "website": "https://nitk.ac.in",
                "password_hash": default_admin_hash,
                "is_verified": True
            }
        ]

        for inst_data in institutions_to_seed:
            existing_inst = db.query(Institution).filter(Institution.id == inst_data["id"]).first()
            if not existing_inst:
                db.add(Institution(**inst_data))
                logger.info(f"Seeded Institution: {inst_data['name']} ({inst_data['username']})")
            else:
                existing_inst.username = inst_data["username"]
                existing_inst.name = inst_data["name"]
                existing_inst.contact_email = inst_data["contact_email"]
                existing_inst.admin_name = inst_data["admin_name"]
                if not existing_inst.password_hash:
                    existing_inst.password_hash = default_admin_hash

        # Seed Sample Recruiters
        recruiters_to_seed = [
            {
                "id": "REC001",
                "institution_id": "inst-001",
                "name": "Sarah Chen",
                "company_name": "Google Cloud",
                "email": "sarah.chen@google.com",
                "designation": "Principal Technical Recruiter"
            },
            {
                "id": "REC002",
                "institution_id": "inst-001",
                "name": "David Miller",
                "company_name": "Microsoft",
                "email": "david.miller@microsoft.com",
                "designation": "University Talent Lead"
            },
            {
                "id": "REC003",
                "institution_id": "inst-001",
                "name": "Priya Nair",
                "company_name": "Amazon AWS",
                "email": "priya.nair@amazon.com",
                "designation": "Campus Recruitment Lead"
            }
        ]

        for rec_data in recruiters_to_seed:
            existing_rec = db.query(Recruiter).filter(Recruiter.id == rec_data["id"]).first()
            if not existing_rec:
                db.add(Recruiter(**rec_data))
                logger.info(f"Seeded Recruiter: {rec_data['name']} ({rec_data['company_name']})")

        # 2. Seed Jobs
        if os.path.exists(jobs_file):
            with open(jobs_file, "r", encoding="utf-8") as f:
                jobs_data = json.load(f)
            
            jobs_added = 0
            for item in jobs_data:
                # Add associated company if missing
                comp_name = item.get("company", "TechCorp")
                existing_comp = db.query(Company).filter(Company.name == comp_name).first()
                if not existing_comp:
                    db.add(Company(
                        id=f"COMP_{abs(hash(comp_name)) % 100000:05d}",
                        name=comp_name,
                        industry="Technology"
                    ))

                existing_job = db.query(Job).filter(Job.id == item["id"]).first()
                if not existing_job:
                    job = Job(
                        id=item["id"],
                        company=item["company"],
                        title=item["title"],
                        description=item.get("description", ""),
                        minimum_cgpa=float(item["minimum_cgpa"]),
                        eligible_branches=item.get("eligible_branches", []),
                        max_backlogs=int(item.get("max_backlogs", 0)),
                        graduation_years=item.get("graduation_years", [2027]),
                        required_skills=item.get("required_skills", []),
                        preferred_skills=item.get("preferred_skills", []),
                        responsibilities=item.get("responsibilities", []),
                        experience_level=item.get("experience_level", "Fresher"),
                        institution_id="inst-001",
                        recruiter_id="REC001" if "Google" in item.get("company", "") else ("REC002" if "Microsoft" in item.get("company", "") else "REC003")
                    )
                    db.add(job)
                    jobs_added += 1
            logger.info(f"Seeded {jobs_added} new jobs (Total in file: {len(jobs_data)})")

        # 3. Seed Students
        if os.path.exists(students_file):
            with open(students_file, "r", encoding="utf-8") as f:
                students_data = json.load(f)
            
            default_student_hash = hash_password("student123")
            students_added = 0
            for item in students_data:
                stu_id = item["id"]
                default_email = f"{stu_id.lower()}@apex.edu"
                existing_student = db.query(Student).filter(Student.id == stu_id).first()
                if not existing_student:
                    # Calculate baseline readiness score if absent
                    assessment = item.get("assessment", {})
                    tech_eval = assessment.get("technical", 70.0)
                    apt_eval = assessment.get("aptitude", 70.0)
                    comm_eval = assessment.get("communication", 70.0)
                    cgpa_val = float(item.get("cgpa", 7.0))
                    
                    # Quick readiness estimate: technical 35%, projects 25%, academics 20%, assessments 15%, comm 5%
                    readiness = (
                        0.35 * tech_eval +
                        0.25 * min(100.0, len(item.get("projects", [])) * 45.0) +
                        0.20 * min(100.0, (cgpa_val / 10.0) * 100.0) +
                        0.15 * (0.6 * tech_eval + 0.4 * apt_eval) +
                        0.05 * comm_eval
                    )
                    readiness = round(min(100.0, max(0.0, readiness)), 1)
                    
                    if readiness >= 80.0:
                        tier = "Highly Employable"
                    elif readiness >= 65.0:
                        tier = "Ready"
                    elif readiness >= 50.0:
                        tier = "Developing"
                    else:
                        tier = "Not Ready"

                    student = Student(
                        id=stu_id,
                        name=item["name"],
                        email=item.get("email", default_email),
                        password_hash=default_student_hash,
                        branch=item["branch"],
                        graduation_year=item.get("graduation_year", 2027),
                        cgpa=cgpa_val,
                        backlogs=int(item.get("backlogs", 0)),
                        skills=item.get("skills", []),
                        projects=item.get("projects", []),
                        certifications=item.get("certifications", []),
                        assessment=assessment,
                        readiness_score=readiness,
                        readiness_tier=tier,
                        institution_id="inst-001"
                    )
                    db.add(student)
                    students_added += 1
                else:
                    if not existing_student.password_hash:
                        existing_student.password_hash = default_student_hash
                    if not existing_student.email:
                        existing_student.email = default_email
            logger.info(f"Seeded/updated {len(students_data)} students (new added: {students_added})")

        db.commit()
        logger.info(f"Database seeding completed successfully on active {active_db_type} database!")
    except Exception as exc:
        db.rollback()
        logger.error(f"Error seeding database: {exc}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

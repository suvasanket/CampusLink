import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("campuslink.db")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()

def create_resilient_engine():
    """
    Attempts to connect to PostgreSQL as primary database.
    If unavailable, automatically falls back to local SQLite with clear logging.
    """
    # 1. Try PostgreSQL Primary
    try:
        logger.info(f"Attempting connection to primary PostgreSQL database: {settings.DATABASE_URL}")
        pg_engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3} if "postgresql" in settings.DATABASE_URL else {}
        )
        # Test connection immediately
        with pg_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to primary PostgreSQL database.")
        return pg_engine, "postgresql"
    except Exception as exc:
        logger.warning(
            f"Primary PostgreSQL connection failed ({exc.__class__.__name__}: {exc}). "
            f"Seamlessly falling back to local SQLite database: {settings.FALLBACK_DATABASE_URL}"
        )

    # 2. Resilient SQLite Fallback
    sqlite_engine = create_engine(
        settings.FALLBACK_DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.FALLBACK_DATABASE_URL else {}
    )
    logger.info("Local SQLite database initialized.")
    return sqlite_engine, "sqlite"

engine, active_db_type = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables in the active database engine and ensure new columns exist."""
    logger.info(f"Creating database tables on active {active_db_type} engine...")
    Base.metadata.create_all(bind=engine)
    
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        with engine.begin() as conn:
            if "institutions" in tables:
                inst_cols = [c["name"] for c in inspector.get_columns("institutions")]
                if "password_hash" not in inst_cols:
                    logger.info("Adding missing password_hash column to institutions...")
                    conn.execute(text("ALTER TABLE institutions ADD COLUMN password_hash VARCHAR(255)"))

            if "students" in tables:
                stu_cols = [c["name"] for c in inspector.get_columns("students")]
                if "email" not in stu_cols:
                    logger.info("Adding missing email column to students...")
                    conn.execute(text("ALTER TABLE students ADD COLUMN email VARCHAR(100)"))
                if "password_hash" not in stu_cols:
                    logger.info("Adding missing password_hash column to students...")
                    conn.execute(text("ALTER TABLE students ADD COLUMN password_hash VARCHAR(255)"))
    except Exception as e:
        logger.warning(f"Column migration check notice: {e}")

    logger.info("Database tables verified.")

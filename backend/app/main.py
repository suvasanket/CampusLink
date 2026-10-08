import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router
from app.db.session import init_db, SessionLocal, active_db_type
from app.models.entities import Student

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("campuslink")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hook: initialize database schema and seed if empty on boot."""
    logger.info(f"CampusLink backend starting up with active database: {active_db_type}")
    try:
        init_db()
        # Auto-seed if students table is empty
        db = SessionLocal()
        count = db.query(Student).count()
        if count == 0:
            logger.info("Database is empty. Triggering automated seed loader...")
            from seed_db import seed_database
            seed_database()
        else:
            logger.info(f"Database verified with {count} existing students.")
        db.close()
    except Exception as exc:
        logger.error(f"Error during database initialization: {exc}")
    yield
    logger.info("CampusLink backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CampusLink — Intelligent, Explainable Campus Placement Recommendation Platform API",
    lifespan=lifespan
)

# Enable CORS for frontend web application integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import create_db_and_tables, ensure_default_user, run_migrations
from routers import (
    dashboard,
    onboarding,
    plan_allowances,
    providers,
    recommendations,
    settings,
    subscriptions,
    usage,
    users,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ami API", version="0.2.0")

# CORS — only needed in dev (frontend on :5173, backend on :8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(providers.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")
app.include_router(usage.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(plan_allowances.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    run_migrations()
    ensure_default_user()
    logger.info("Ami API ready")


# Serve built frontend in production
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

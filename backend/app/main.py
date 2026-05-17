"""
Ddumba.AI Editorial API — Main Application
FastAPI backend replacing localStorage with PostgreSQL.

Run with: uvicorn backend.app.main:app --reload --port 8000
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session

from backend.app.database import init_db, get_db, Branding as BrandingDB
from backend.app.auth import seed_default_author
from backend.app.models import BrandingResponse
from backend.app.database import Category as CategoryDB

# Import all routers
from backend.app.routers import auth, posts, authors, comments, media, branding, categories, subscribers


# ============================================
# APPLICATION LIFECYCLE (STARTUP)
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on application startup and shutdown."""
    # STARTUP: Create tables and seed default data
    print("🚀 Starting Ddumba.AI Editorial API...")
    init_db()

    # Seed default author and branding
    db = next(get_db())
    seed_default_author(db)

    # Seed default branding if not exists
    existing_branding = db.query(BrandingDB).filter(BrandingDB.id == 1).first()
    if not existing_branding:
        default_branding = BrandingDB(
            id=1,
            site_title="Ddumba.AI · Editorial on Production AI Infrastructure",
            meta_title="Ddumba.AI — Production AI Infrastructure Editorial",
            meta_description="Senior-engineer essays on vLLM, RAG, Kubernetes, inference cost optimization, and observability for production AI.",
            keywords="AI infrastructure, vLLM, RAG, Kubernetes, LLM inference, MLOps, platform engineering",
            og_image="/profile.png",
            logo="/profile.png",
            favicon="/favicon.png",
        )
        db.add(default_branding)
        db.commit()
        print("✅ Default branding seeded successfully")

    # Seed default categories
    existing_cats = db.query(CategoryDB).count()
    if existing_cats == 0:
        default_categories = [
            CategoryDB(slug="ai-infrastructure", name="AI Infrastructure", color="from-emerald-400 to-teal-500"),
            CategoryDB(slug="rag-systems", name="RAG Systems", color="from-cyan-400 to-blue-500"),
            CategoryDB(slug="kubernetes", name="Kubernetes", color="from-violet-400 to-indigo-500"),
            CategoryDB(slug="inference", name="Inference", color="from-amber-400 to-orange-500"),
            CategoryDB(slug="platform", name="Platform Engineering", color="from-pink-400 to-rose-500"),
            CategoryDB(slug="observability", name="Observability", color="from-lime-400 to-green-500"),
        ]
        for cat in default_categories:
            db.add(cat)
        db.commit()
        print("✅ Default categories seeded")

    db.close()
    print("✅ API is ready to serve requests")
    yield
    # SHUTDOWN: Clean up if needed
    print("👋 Shutting down...")


# ============================================
# CREATE FASTAPI APPLICATION
# ============================================
app = FastAPI(
    title="Ddumba.AI Editorial API",
    description="Production-grade API for AI/Tech editorial blog platform. Replaces localStorage with PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================
# CORS — Allow Lovable frontend to connect
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your Lovable URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# REGISTER ALL ROUTERS
# ============================================
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(authors.router, prefix="/api/authors", tags=["Authors"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(media.router, prefix="/api/media", tags=["Media"])
app.include_router(branding.router, prefix="/api/branding", tags=["Branding"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(subscribers.router, prefix="/api/subscribe", tags=["Subscribers"])


# ============================================
# ROOT ENDPOINT
# ============================================
@app.get("/")
def root():
    return {
        "message": "Ddumba.AI Editorial API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "posts": "/api/posts",
            "authors": "/api/authors",
            "comments": "/api/comments",
            "media": "/api/media",
            "branding": "/api/branding",
        }
    }


# ============================================
# HEALTH CHECK
# ============================================
@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Check if API and database are healthy."""
    try:
        # Try a simple query
        db.execute(db.bind.dialect.do_ping(None))
        db_status = "connected"
    except:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0"
    }
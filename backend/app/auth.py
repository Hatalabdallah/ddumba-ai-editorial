"""
JWT authentication utilities.
Replaces the simulated localStorage login in blog-context.tsx
"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from backend.app.database import get_db, Author as AuthorDB

load_dotenv()

# Secret key for signing JWT tokens
SECRET_KEY = os.getenv("JWT_SECRET", "change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30  # Long-lived for convenience; reduce in production

# Password hashing (bcrypt)
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer security scheme
security = HTTPBearer()


# ============================================
# PASSWORD UTILITIES
# ============================================
def hash_password(password: str) -> str:
    """Production-ready native bcrypt hashing for Python 3.13."""
    import bcrypt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Safely handles native token byte matching."""
    import bcrypt
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


# ============================================
# JWT TOKEN UTILITIES
# ============================================
def create_access_token(author_id: str) -> str:
    """Create a JWT token for an author."""
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": author_id,  # subject = author ID
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """Decode a JWT token and return the author ID. Raises if invalid."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload.get("sub")


# ============================================
# DEPENDENCY: GET CURRENT LOGGED-IN AUTHOR
# ============================================
def get_current_author(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AuthorDB:
    """
    Extract the current author from the JWT token in the Authorization header.
    This replaces the localStorage session check in blog-context.tsx.
    Usage: Add `author = Depends(get_current_author)` to any protected endpoint.
    """
    token = credentials.credentials
    try:
        author_id = decode_access_token(token)
        if author_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    author = db.query(AuthorDB).filter(AuthorDB.id == author_id).first()
    if author is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Author not found"
        )
    return author


# ============================================
# SEED DEFAULT AUTHOR (called on startup)
# ============================================
def seed_default_author(db: Session):
    """
    Create the default author (Ddumba AK) if it doesn't exist.
    Matches the seedAuthor in src/lib/seed-data.ts
    """
    existing = db.query(AuthorDB).filter(AuthorDB.id == "ddumba-ak").first()
    if existing:
        return  # Already exists

    default_author = AuthorDB(
        id="ddumba-ak",
        username="ddumba",
        password=hash_password("ddumba2025"),  # Same as seed data, but HASHED
        name="Ddumba AK",
        full_name="Abdallah Kato Ddumba",
        role="Platform & AI Systems Engineer",
        tagline="Architecting LLM Infrastructure at Scale | AWS, Kubernetes, RAG, & Inference Optimization",
        location="Kampala, Central Region, Uganda",
        avatar="/profile.png",
        bio="AI Platform Engineer | Production AI & Infrastructure\n\nI build the \"Engines\" that allow AI to survive in production.\n\nWhile much of the industry is focused on prompt engineering, I focus on the \"Day 2\" reality: Why is the inference cost higher than projected? Why is the RAG pipeline latency lagging? How do we scale a Kubernetes cluster to handle tens of thousands of concurrent agentic requests?\n\nI sit at the intersection of Platform Reliability and AI System Design. My goal is to transform \"Experimental AI\" into \"Enterprise-Grade Infrastructure\" that is resilient, observable, and profitable.",
        challenges=[
            "AI systems that work in dev but fail to scale under production loads",
            "High inference costs without a clear optimization strategy",
            "Latency and observability gaps in complex RAG pipelines",
            "Infrastructure bottlenecks when deploying GPU-intensive workloads",
        ],
        focus_areas=[
            "AI Infrastructure", "Inference Optimization", "RAG Systems",
            "AWS", "Kubernetes", "Terraform", "ArgoCD", "vLLM", "TensorRT-LLM",
        ],
        tech_stack=[
            "LangChain", "LlamaIndex", "PyTorch", "Pinecone", "AWS",
            "Kubernetes", "Kafka", "Terraform", "Grafana", "Prometheus",
        ],
        contacts={
            "linkedin": "https://linkedin.com/in/ddumbaka",
            "twitter": "",
            "facebook": "",
            "whatsapp": "",
            "companyWebsite": "https://kyakabi.com",
            "personalWebsite": "https://ddumba.kyakabi.com",
            "phone": "+256701019242",
            "email": "abdallahddumbakato@gmail.com",
        }
    )
    db.add(default_author)
    db.commit()
    print("✅ Default author 'ddumba' seeded successfully")
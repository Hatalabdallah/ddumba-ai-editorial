"""
Authentication router — replaces localStorage simulated login.
Endpoints: POST /login, POST /register, GET /me
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.database import get_db, Author as AuthorDB
from backend.app.auth import (
    hash_password, verify_password, create_access_token, get_current_author
)
from backend.app.models import (
    LoginRequest, LoginResponse, AuthorCreate, AuthorResponse
)

router = APIRouter()


# ============================================
# POST /api/auth/login
# Replaces: login(username, password) in blog-context.tsx
# ============================================
@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an author and return a JWT token.
    This replaces the localStorage-based login in blog-context.tsx.
    """
    # Find author by username
    author = db.query(AuthorDB).filter(AuthorDB.username == request.username).first()
    if not author:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Verify password
    if not verify_password(request.password, author.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create JWT token
    access_token = create_access_token(author.id)

    # Build author response (no password)
    author_response = AuthorResponse(
        id=author.id,
        username=author.username,
        name=author.name,
        fullName=author.full_name,
        role=author.role,
        tagline=author.tagline,
        location=author.location,
        avatar=author.avatar,
        bio=author.bio,
        challenges=author.challenges or [],
        focusAreas=author.focus_areas or [],
        techStack=author.tech_stack or [],
        contacts=author.contacts or {},
        created_at=author.created_at,
        updated_at=author.updated_at,
    )

    return LoginResponse(
        access_token=access_token,
        author=author_response
    )


# ============================================
# POST /api/auth/register
# Replaces: registerAuthor(a) in blog-context.tsx
# ============================================
@router.post("/register", response_model=AuthorResponse)
def register(request: AuthorCreate, db: Session = Depends(get_db)):
    """
    Register a new author.
    """
    # Check if username already exists
    existing = db.query(AuthorDB).filter(
        (AuthorDB.username == request.username) | (AuthorDB.id == request.id)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or ID already exists"
        )

    # Create new author with hashed password
    new_author = AuthorDB(
        id=request.id,
        username=request.username,
        password=hash_password(request.password),
        name=request.name,
        full_name=request.fullName,
        role=request.role,
        tagline=request.tagline,
        location=request.location,
        bio=request.bio,
        challenges=request.challenges,
        focus_areas=request.focusAreas,
        tech_stack=request.techStack,
        contacts=request.contacts.model_dump() if request.contacts else {},
    )

    db.add(new_author)
    db.commit()
    db.refresh(new_author)

    return AuthorResponse(
        id=new_author.id,
        username=new_author.username,
        name=new_author.name,
        fullName=new_author.full_name,
        role=new_author.role,
        tagline=new_author.tagline,
        location=new_author.location,
        avatar=new_author.avatar,
        bio=new_author.bio,
        challenges=new_author.challenges or [],
        focusAreas=new_author.focus_areas or [],
        techStack=new_author.tech_stack or [],
        contacts=new_author.contacts or {},
        created_at=new_author.created_at,
        updated_at=new_author.updated_at,
    )


# ============================================
# GET /api/auth/me
# Replaces: currentAuthor in blog-context.tsx
# ============================================
@router.get("/me", response_model=AuthorResponse)
def get_current_user(author: AuthorDB = Depends(get_current_author)):
    """
    Get the currently logged-in author's profile.
    Requires a valid JWT token in the Authorization header.
    """
    return AuthorResponse(
        id=author.id,
        username=author.username,
        name=author.name,
        fullName=author.full_name,
        role=author.role,
        tagline=author.tagline,
        location=author.location,
        avatar=author.avatar,
        bio=author.bio,
        challenges=author.challenges or [],
        focusAreas=author.focus_areas or [],
        techStack=author.tech_stack or [],
        contacts=author.contacts or {},
        created_at=author.created_at,
        updated_at=author.updated_at,
    )
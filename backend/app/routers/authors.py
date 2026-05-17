"""
Authors router — replaces localStorage author operations.
Endpoints map to blog-context.tsx functions:
  list_authors → GET /
  get_author → GET /{author_id}
  updateAuthor → PUT /{author_id}
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.database import get_db, Author as AuthorDB
from backend.app.auth import get_current_author
from backend.app.models import AuthorResponse, AuthorUpdate

router = APIRouter()


# ============================================
# GET /api/authors — List all authors
# ============================================
@router.get("/")
def list_authors(db: Session = Depends(get_db)):
    """List all registered authors."""
    authors = db.query(AuthorDB).all()
    return [
        AuthorResponse(
            id=a.id,
            username=a.username,
            name=a.name,
            fullName=a.full_name,
            role=a.role,
            tagline=a.tagline,
            location=a.location,
            avatar=a.avatar,
            bio=a.bio,
            challenges=a.challenges or [],
            focusAreas=a.focus_areas or [],
            techStack=a.tech_stack or [],
            contacts=a.contacts or {},
            created_at=a.created_at,
            updated_at=a.updated_at,
        )
        for a in authors
    ]


# ============================================
# GET /api/authors/{author_id} — Single author profile
# ============================================
@router.get("/{author_id}", response_model=AuthorResponse)
def get_author(author_id: str, db: Session = Depends(get_db)):
    """Get a single author's profile by ID."""
    author = db.query(AuthorDB).filter(AuthorDB.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

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


# ============================================
# PUT /api/authors/{author_id} — Update author profile
# Replaces: updateAuthor(id, patch) in blog-context.tsx
# Requires authentication
# ============================================
@router.put("/{author_id}", response_model=AuthorResponse)
def update_author(
    author_id: str,
    update_data: AuthorUpdate,
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """Update an author's profile. Only the author themselves can update."""
    if current_author.id != author_id:
        raise HTTPException(status_code=403, detail="Can only edit your own profile")

    author = db.query(AuthorDB).filter(AuthorDB.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if field == "fullName":
            author.full_name = value
        elif field == "focusAreas":
            author.focus_areas = value
        elif field == "techStack":
            author.tech_stack = value
        elif field == "contacts":
            author.contacts = value if isinstance(value, dict) else (value.model_dump() if value else {})
        elif field == "challenges":
            author.challenges = value
        elif hasattr(author, field):
            setattr(author, field, value)

    author.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(author)

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
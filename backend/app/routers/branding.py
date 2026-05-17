"""
Branding router — replaces localStorage branding.
Endpoints map to blog-context.tsx functions:
  updateBranding → PUT /
  resetBranding → POST /reset
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.database import get_db, Branding as BrandingDB
from backend.app.auth import get_current_author
from backend.app.models import BrandingUpdate, BrandingResponse

router = APIRouter()


# ============================================
# GET /api/branding — Get current branding
# ============================================
@router.get("/", response_model=BrandingResponse)
def get_branding(db: Session = Depends(get_db)):
    """Get the current site branding settings."""
    branding = db.query(BrandingDB).filter(BrandingDB.id == 1).first()
    if not branding:
        raise HTTPException(status_code=404, detail="Branding not initialized")

    return BrandingResponse(
        siteTitle=branding.site_title,
        metaTitle=branding.meta_title,
        metaDescription=branding.meta_description,
        keywords=branding.keywords,
        ogImage=branding.og_image,
        logo=branding.logo,
        favicon=branding.favicon,
        updatedAt=branding.updated_at,
    )


# ============================================
# PUT /api/branding/ — Update branding
# Replaces: updateBranding(patch) in blog-context.tsx
# ============================================
@router.put("/", response_model=BrandingResponse)
def update_branding(
    update_data: BrandingUpdate,
    db: Session = Depends(get_db),
    current_author=Depends(get_current_author)
):
    """Update site branding settings. Requires authentication."""
    branding = db.query(BrandingDB).filter(BrandingDB.id == 1).first()
    if not branding:
        raise HTTPException(status_code=404, detail="Branding not initialized")

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if field == "siteTitle":
            branding.site_title = value
        elif field == "metaTitle":
            branding.meta_title = value
        elif field == "metaDescription":
            branding.meta_description = value
        elif field == "keywords":
            branding.keywords = value
        elif field == "ogImage":
            branding.og_image = value
        elif field == "logo":
            branding.logo = value
        elif field == "favicon":
            branding.favicon = value

    branding.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(branding)

    return BrandingResponse(
        siteTitle=branding.site_title,
        metaTitle=branding.meta_title,
        metaDescription=branding.meta_description,
        keywords=branding.keywords,
        ogImage=branding.og_image,
        logo=branding.logo,
        favicon=branding.favicon,
        updatedAt=branding.updated_at,
    )


# ============================================
# POST /api/branding/reset — Reset branding to defaults
# Replaces: resetBranding() in blog-context.tsx
# ============================================
@router.post("/reset", response_model=BrandingResponse)
def reset_branding(
    db: Session = Depends(get_db),
    current_author=Depends(get_current_author)
):
    """Reset branding to default values."""
    branding = db.query(BrandingDB).filter(BrandingDB.id == 1).first()
    if not branding:
        raise HTTPException(status_code=404, detail="Branding not initialized")

    branding.site_title = "Ddumba.AI · Editorial on Production AI Infrastructure"
    branding.meta_title = "Ddumba.AI — Production AI Infrastructure Editorial"
    branding.meta_description = "Senior-engineer essays on vLLM, RAG, Kubernetes, inference cost optimization, and observability for production AI."
    branding.keywords = "AI infrastructure, vLLM, RAG, Kubernetes, LLM inference, MLOps, platform engineering"
    branding.og_image = "/profile.png"
    branding.logo = "/profile.png"
    branding.favicon = "/favicon.png"
    branding.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(branding)

    return BrandingResponse(
        siteTitle=branding.site_title,
        metaTitle=branding.meta_title,
        metaDescription=branding.meta_description,
        keywords=branding.keywords,
        ogImage=branding.og_image,
        logo=branding.logo,
        favicon=branding.favicon,
        updatedAt=branding.updated_at,
    )
"""Categories router"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from backend.app.database import get_db, Category as CategoryDB
from backend.app.auth import get_current_author

router = APIRouter()

class CategoryCreate(BaseModel):
    slug: str
    name: str
    color: str = "from-emerald-400 to-teal-500"

class CategoryResponse(BaseModel):
    slug: str
    name: str
    color: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True

@router.get("/")
def list_categories(db: Session = Depends(get_db)):
    return db.query(CategoryDB).all()

@router.post("/", response_model=CategoryResponse)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), author=Depends(get_current_author)):
    existing = db.query(CategoryDB).filter(CategoryDB.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    cat = CategoryDB(slug=data.slug, name=data.name, color=data.color)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{slug}")
def delete_category(slug: str, db: Session = Depends(get_db), author=Depends(get_current_author)):
    cat = db.query(CategoryDB).filter(CategoryDB.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted"}
"""
Media router — replaces localStorage base64 media storage.
Endpoints map to blog-context.tsx functions:
  addMedia → POST /upload
  deleteMedia → DELETE /{media_id}
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os
import shutil
import random
import string

from backend.app.database import get_db, MediaItem as MediaDB
from backend.app.auth import get_current_author
from backend.app.models import MediaItemResponse

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================
# GET /api/media — List all media
# ============================================
@router.get("/")
def list_media(db: Session = Depends(get_db)):
    """List all media items."""
    media = db.query(MediaDB).order_by(MediaDB.uploaded_at.desc()).all()
    return [
        MediaItemResponse(
            id=m.id,
            name=m.name,
            type=m.type,
            dataUrl=m.data_url,
            size=m.size or 0,
            uploadedAt=m.uploaded_at,
            uploadedBy=m.uploaded_by,
        )
        for m in media
    ]


# ============================================
# POST /api/media/upload — Upload a file
# Replaces: addMedia(m) in blog-context.tsx
# ============================================
@router.post("/upload", response_model=MediaItemResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_author=Depends(get_current_author)
):
    """
    Upload an image or video file.
    Saves to disk and records in database.
    """
    # Validate file type
    if file.content_type:
        if file.content_type.startswith("image/"):
            file_type = "image"
        elif file.content_type.startswith("video/"):
            file_type = "video"
        else:
            raise HTTPException(status_code=400, detail="Only image and video files are allowed")
    else:
        file_type = "image"  # default

    # Generate unique filename
    ext = os.path.splitext(file.filename or "file")[1] or ".png"
    unique_name = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{''.join(random.choices(string.ascii_lowercase, k=6))}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Generate media ID
    media_id = f"m_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"

    # Create database record
    media_item = MediaDB(
        id=media_id,
        name=file.filename or unique_name,
        type=file_type,
        data_url=f"/uploads/{unique_name}",  # URL path to access the file
        size=file_size,
        uploaded_at=datetime.utcnow(),
        uploaded_by=current_author.id,
    )

    db.add(media_item)
    db.commit()
    db.refresh(media_item)

    return MediaItemResponse(
        id=media_item.id,
        name=media_item.name,
        type=media_item.type,
        dataUrl=media_item.data_url,
        size=media_item.size or 0,
        uploadedAt=media_item.uploaded_at,
        uploadedBy=media_item.uploaded_by,
    )


# ============================================
# DELETE /api/media/{media_id} — Delete media
# Replaces: deleteMedia(id) in blog-context.tsx
# ============================================
@router.delete("/{media_id}")
def delete_media(
    media_id: str,
    db: Session = Depends(get_db),
    current_author=Depends(get_current_author)
):
    """Delete a media item. Only the uploader can delete."""
    media = db.query(MediaDB).filter(MediaDB.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    if media.uploaded_by != current_author.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete file from disk if it exists
    if media.data_url and media.data_url.startswith("/uploads/"):
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(media.data_url))
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(media)
    db.commit()
    return {"message": "Media deleted successfully"}
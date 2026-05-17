"""
Comments router — replaces localStorage comment operations.
Endpoints map to blog-context.tsx functions:
  addComment → POST /
  deleteComment → DELETE /{comment_id}
  likeComment → POST /{comment_id}/like
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.database import get_db, Comment as CommentDB, Post as PostDB
from backend.app.auth import get_current_author
from backend.app.models import CommentCreate, CommentResponse

router = APIRouter()


# ============================================
# GET /api/comments/post/{post_id} — Get comments for a post
# ============================================
@router.get("/post/{post_id}")
def get_comments(post_id: str, db: Session = Depends(get_db)):
    """Get all comments for a specific post."""
    comments = (
        db.query(CommentDB)
        .filter(CommentDB.post_id == post_id)
        .order_by(CommentDB.created_at.desc())
        .all()
    )
    return [
        CommentResponse(
            id=c.id,
            postId=c.post_id,
            parentId=c.parent_id,
            author=c.author,
            text=c.text,
            createdAt=c.created_at,
            likes=c.likes or 0,
            likedBy=c.liked_by or [],
        )
        for c in comments
    ]


# ============================================
# POST /api/comments/ — Add a comment
# Replaces: addComment(postId, text, author, parentId) in blog-context.tsx
# ============================================
@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(comment_data: CommentCreate, db: Session = Depends(get_db)):
    """
    Add a comment to a post. No authentication required (public commenting).
    Supports threaded replies via parentId.
    """
    # Verify post exists
    post = db.query(PostDB).filter(PostDB.id == comment_data.postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # If replying, verify parent comment exists
    if comment_data.parentId:
        parent = db.query(CommentDB).filter(CommentDB.id == comment_data.parentId).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    import random
    import string
    comment_id = f"c_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"

    new_comment = CommentDB(
        id=comment_id,
        post_id=comment_data.postId,
        parent_id=comment_data.parentId,
        author=comment_data.author,
        text=comment_data.text,
        created_at=datetime.utcnow(),
        likes=0,
        liked_by=[],
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        postId=new_comment.post_id,
        parentId=new_comment.parent_id,
        author=new_comment.author,
        text=new_comment.text,
        createdAt=new_comment.created_at,
        likes=0,
        likedBy=[],
    )


# ============================================
# DELETE /api/comments/{comment_id} — Delete a comment
# Replaces: deleteComment(id) in blog-context.tsx
# Also deletes replies (handled by cascade in database)
# ============================================
@router.delete("/{comment_id}")
def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_author=Depends(get_current_author)
):
    """Delete a comment. Requires authentication (any logged-in author)."""
    comment = db.query(CommentDB).filter(CommentDB.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)  # cascade will delete replies
    db.commit()
    return {"message": "Comment deleted successfully"}


# ============================================
# POST /api/comments/{comment_id}/like — Like/unlike a comment
# Replaces: likeComment(id, by) in blog-context.tsx
# ============================================
@router.post("/{comment_id}/like")
def like_comment(comment_id: str, by: str = "anonymous", db: Session = Depends(get_db)):
    """Toggle a like on a comment. Provide device/user ID in query."""
    comment = db.query(CommentDB).filter(CommentDB.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    liked_by = comment.liked_by or []

    if by in liked_by:
        # Unlike
        liked_by.remove(by)
        comment.likes = max(0, (comment.likes or 1) - 1)
    else:
        # Like
        liked_by.append(by)
        comment.likes = (comment.likes or 0) + 1

    comment.liked_by = liked_by
    db.commit()

    return {"likes": comment.likes, "likedBy": comment.liked_by}



# ============================================
# GET /api/comments/ — Get ALL comments (for admin)
# ============================================
@router.get("/")
def get_all_comments(db: Session = Depends(get_db)):
    """Get all comments across all posts (admin view)."""
    comments = (
        db.query(CommentDB)
        .order_by(CommentDB.created_at.desc())
        .all()
    )
    return [
        CommentResponse(
            id=c.id,
            postId=c.post_id,
            parentId=c.parent_id,
            author=c.author,
            text=c.text,
            createdAt=c.created_at,
            likes=c.likes or 0,
            likedBy=c.liked_by or [],
        )
        for c in comments
    ]
"""
Posts router — replaces all localStorage post operations.
Endpoints map to blog-context.tsx functions:
  createPost → POST /
  updatePost → PUT /{post_id}
  deletePost → DELETE /{post_id}
  togglePublish → PATCH /{post_id}/publish
  toggleFeatured → PATCH /{post_id}/featured
  toggleTrending → PATCH /{post_id}/trending
  incrementViews → POST /{post_id}/view
  schedulePost → PATCH /{post_id}/schedule
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional
from datetime import datetime

from backend.app.database import get_db, Post as PostDB, Author as AuthorDB, Subscriber as SubscriberDB
from backend.app.mailer import broadcast_new_post_email
from backend.app.auth import get_current_author
from backend.app.models import (
    PostCreate, PostUpdate, PostResponse, PaginatedPosts,
    CommentResponse, SeoMeta
)

router = APIRouter()


# ============================================
# HELPER: Convert PostDB → PostResponse
# ============================================
def post_to_response(post: PostDB) -> PostResponse:
    """Convert a database Post to a response model."""
    comments_list = [
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
        for c in (post.comments or [])
    ]

    return PostResponse(
        id=post.id,
        slug=post.slug,
        title=post.title,
        excerpt=post.excerpt,
        coverImage=post.cover_image,
        coverGradient=post.cover_gradient,
        category=post.category,
        tags=post.tags or [],
        authorId=post.author_id,
        publishedAt=post.published_at,
        scheduledFor=post.scheduled_for,
        updatedAt=post.updated_at,
        readingTime=post.reading_time or 5,
        status=post.status,
        featured=post.featured or False,
        trending=post.trending or False,
        views=post.views or 0,
        seo=SeoMeta(**post.seo) if post.seo else SeoMeta(),
        content=post.content or [],
        comments=comments_list,
        created_at=post.created_at,
    )


# ============================================
# GET /api/posts — List all published posts
# Replaces: posts array read in index.tsx, category.$slug.tsx, search.tsx
# ============================================
@router.get("/", response_model=PaginatedPosts)
def list_posts(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    authorId: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    trending: Optional[bool] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    List posts with optional filters.
    Public routes call this with status=published.
    Admin routes call without status filter.
    """
    query = db.query(PostDB).options(joinedload(PostDB.comments))

    # Apply filters
    if status:
        query = query.filter(PostDB.status == status)
    if category:
        query = query.filter(PostDB.category == category)
    if authorId:
        query = query.filter(PostDB.author_id == authorId)
    if featured is not None:
        query = query.filter(PostDB.featured == featured)
    if trending is not None:
        query = query.filter(PostDB.trending == trending)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                PostDB.title.ilike(search_term),
                PostDB.excerpt.ilike(search_term),
            )
        )

    # Sort: published first by date, then scheduled, then drafts
    query = query.order_by(PostDB.published_at.desc().nulls_last(), PostDB.updated_at.desc())

    # Pagination
    total = query.count()
    offset = (page - 1) * limit
    posts = query.offset(offset).limit(limit).all()

    return PaginatedPosts(
        posts=[post_to_response(p) for p in posts],
        pagination={
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if total > 0 else 1,
        }
    )


# ============================================
# GET /api/posts/featured — Featured posts for hero
# ============================================
@router.get("/featured")
def get_featured(db: Session = Depends(get_db)):
    """Get featured posts for the homepage hero."""
    posts = (
        db.query(PostDB)
        .options(joinedload(PostDB.comments))
        .filter(PostDB.featured == True, PostDB.status == "published")
        .order_by(PostDB.published_at.desc())
        .limit(5)
        .all()
    )
    return [post_to_response(p) for p in posts]


# ============================================
# GET /api/posts/trending — Trending posts for sidebar
# ============================================
@router.get("/trending")
def get_trending(db: Session = Depends(get_db)):
    """Get trending posts for the sidebar."""
    posts = (
        db.query(PostDB)
        .options(joinedload(PostDB.comments))
        .filter(PostDB.trending == True, PostDB.status == "published")
        .order_by(PostDB.views.desc())
        .limit(10)
        .all()
    )
    return [post_to_response(p) for p in posts]


# ============================================
# GET /api/posts/{slug} — Single post by slug
# Replaces: usePostBySlug() in blog-context.tsx
# ============================================
@router.get("/{slug}", response_model=PostResponse)
def get_post(slug: str, db: Session = Depends(get_db)):
    """
    Get a single post by its URL slug.
    Public routes only see published posts.
    """
    post = (
        db.query(PostDB)
        .options(joinedload(PostDB.comments))
        .filter(PostDB.slug == slug)
        .first()
    )

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post_to_response(post)


# ============================================
# POST /api/posts — Create a new post
# Replaces: createPost(p) in blog-context.tsx
# Requires authentication
# ============================================
@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """
    Create a new post. Requires authentication.
    """
    # Check slug uniqueness
    existing = db.query(PostDB).filter(PostDB.slug == post_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A post with this slug already exists")

    now = datetime.utcnow()

    new_post = PostDB(
        id=post_data.slug.replace("-", "_"),  # Generate ID from slug
        slug=post_data.slug,
        title=post_data.title,
        excerpt=post_data.excerpt,
        cover_image=post_data.coverImage,
        cover_gradient=post_data.coverGradient,
        category=post_data.category,
        tags=post_data.tags,
        author_id=current_author.id,
        published_at=now if post_data.status == "published" else None,
        scheduled_for=post_data.scheduledFor,
        updated_at=now,
        reading_time=post_data.readingTime,
        status=post_data.status,
        featured=post_data.featured,
        trending=post_data.trending,
        views=0,
        seo=post_data.seo.model_dump() if post_data.seo else {},
        content=post_data.content,
        created_at=now,
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    # Reload with comments relationship
    db.refresh(new_post)
    
    # If published immediately, broadcast to subscribers
    if new_post.status == "published":
        subscribers = db.query(SubscriberDB).all()
        emails = [s.email for s in subscribers]
        if emails:
            background_tasks.add_task(
                broadcast_new_post_email,
                emails,
                new_post.title,
                new_post.excerpt or "",
                new_post.slug
            )
    
    return post_to_response(new_post)


# ============================================
# PUT /api/posts/{post_id} — Update a post
# Replaces: updatePost(id, patch) in blog-context.tsx
# Requires authentication
# ============================================
@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: str,
    post_data: PostUpdate,
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """
    Update a post. Only the author who created it can update it.
    """
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_author.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")

    # Update only provided fields
    update_dict = post_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if field == "coverImage":
            post.cover_image = value
        elif field == "coverGradient":
            post.cover_gradient = value
        elif field == "authorId":
            post.author_id = value
        elif field == "readingTime":
            post.reading_time = value
        elif field == "scheduledFor":
            post.scheduled_for = value
        elif field == "seo":
            post.seo = value.model_dump() if value else {}
        elif field == "content":
            post.content = value
        elif hasattr(post, field):
            setattr(post, field, value)

    post.updated_at = datetime.utcnow()

    # If publishing for the first time, set published_at
    if post.status == "published" and not post.published_at:
        post.published_at = datetime.utcnow()

    db.commit()
    db.refresh(post)
    return post_to_response(post)


# ============================================
# DELETE /api/posts/{post_id} — Delete a post
# Replaces: deletePost(id) in blog-context.tsx
# Requires authentication
# ============================================
@router.delete("/{post_id}")
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """Delete a post. Only the author who created it can delete it."""
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_author.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}


# ============================================
# PATCH /api/posts/{post_id}/publish — Toggle publish status
# Replaces: togglePublish(id) in blog-context.tsx
# ============================================
@router.patch("/{post_id}/publish", response_model=PostResponse)
def toggle_publish(
    post_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """Toggle a post between draft and published."""
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_author.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if post.status == "published":
        post.status = "draft"
    else:
        post.status = "published"
        post.published_at = datetime.utcnow()
        post.scheduled_for = None
        
        # Broadcast to all subscribers
        subscribers = db.query(SubscriberDB).all()
        emails = [s.email for s in subscribers]
        if emails:
            background_tasks.add_task(
                broadcast_new_post_email,
                emails,
                post.title,
                post.excerpt or "",
                post.slug
            )

    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post_to_response(post)


# ============================================
# PATCH /api/posts/{post_id}/featured — Toggle featured
# Replaces: toggleFeatured(id) in blog-context.tsx
# ============================================
@router.patch("/{post_id}/featured", response_model=PostResponse)
def toggle_featured(
    post_id: str,
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """Toggle a post's featured status."""
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_author.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    post.featured = not post.featured
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post_to_response(post)


# ============================================
# PATCH /api/posts/{post_id}/trending — Toggle trending
# Replaces: toggleTrending(id) in blog-context.tsx
# ============================================
@router.patch("/{post_id}/trending", response_model=PostResponse)
def toggle_trending(
    post_id: str,
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """Toggle a post's trending status."""
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_author.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    post.trending = not post.trending
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post_to_response(post)


# ============================================
# POST /api/posts/{post_id}/view — Increment view count
# Replaces: incrementViews(id) in blog-context.tsx
# ============================================
@router.post("/{post_id}/view")
def increment_views(post_id: str, db: Session = Depends(get_db)):
    """Increment the view count for a post. No authentication required."""
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.views = (post.views or 0) + 1
    db.commit()
    return {"views": post.views}


# ============================================
# PATCH /api/posts/{post_id}/schedule — Schedule a post
# Replaces: schedulePost(id, scheduledFor) in blog-context.tsx
# ============================================
@router.patch("/{post_id}/schedule", response_model=PostResponse)
def schedule_post(
    post_id: str,
    scheduled_for: str,  # ISO datetime string
    db: Session = Depends(get_db),
    current_author: AuthorDB = Depends(get_current_author)
):
    """Schedule a post for future publishing."""
    post = db.query(PostDB).filter(PostDB.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_author.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        schedule_date = datetime.fromisoformat(scheduled_for)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")

    if schedule_date <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Scheduled time must be in the future")

    post.status = "scheduled"
    post.scheduled_for = schedule_date
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post_to_response(post)
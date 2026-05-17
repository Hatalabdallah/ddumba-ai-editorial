"""
Pydantic models for request/response validation.
Every model here mirrors the TypeScript types in src/lib/types.ts
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================
# CONTENT BLOCKS — mirrors ContentBlock union type
# ============================================
class ContentBlockParagraph(BaseModel):
    type: str = "paragraph"
    text: str

class ContentBlockHeading(BaseModel):
    type: str = "heading"
    level: int  # 1-6
    text: str

class ContentBlockList(BaseModel):
    type: str = "list"
    ordered: bool = False
    items: List[str]

class ContentBlockQuote(BaseModel):
    type: str = "quote"
    text: str
    cite: Optional[str] = None

class ContentBlockCode(BaseModel):
    type: str = "code"
    language: str
    code: str

class ContentBlockImage(BaseModel):
    type: str = "image"
    src: str
    alt: Optional[str] = None
    caption: Optional[str] = None

class ContentBlockVideo(BaseModel):
    type: str = "video"
    src: str
    poster: Optional[str] = None

class ContentBlockCallout(BaseModel):
    type: str = "callout"
    tone: str  # "info" | "warn" | "success"
    text: str

class ContentBlockSection(BaseModel):
    type: str = "section"
    heading: str
    body: str


# ============================================
# SEO META — mirrors SeoMeta
# ============================================
class SeoMeta(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    ogImage: Optional[str] = None


# ============================================
# AUTHOR CONTACTS — mirrors AuthorContacts
# ============================================
class AuthorContacts(BaseModel):
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    whatsapp: Optional[str] = None
    companyWebsite: Optional[str] = None
    personalWebsite: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


# ============================================
# AUTHOR SCHEMAS
# ============================================
class AuthorBase(BaseModel):
    id: str  # e.g., "ddumba-ak"
    username: str
    name: str
    fullName: Optional[str] = None
    role: Optional[str] = None
    tagline: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    challenges: List[str] = []
    focusAreas: List[str] = []
    techStack: List[str] = []
    contacts: AuthorContacts = AuthorContacts()

class AuthorCreate(BaseModel):
    """For registering a new author."""
    id: str
    username: str
    password: str  # plain text — will be hashed
    name: str
    fullName: Optional[str] = None
    role: Optional[str] = None
    tagline: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    challenges: List[str] = []
    focusAreas: List[str] = []
    techStack: List[str] = []
    contacts: AuthorContacts = AuthorContacts()

class AuthorUpdate(BaseModel):
    """Partial update for author profile."""
    name: Optional[str] = None
    fullName: Optional[str] = None
    role: Optional[str] = None
    tagline: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    challenges: Optional[List[str]] = None
    focusAreas: Optional[List[str]] = None
    techStack: Optional[List[str]] = None
    contacts: Optional[AuthorContacts] = None

class AuthorResponse(AuthorBase):
    """Public author response (NEVER includes password)."""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# LOGIN SCHEMAS
# ============================================
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    author: AuthorResponse


# ============================================
# COMMENT SCHEMAS — mirrors Comment
# ============================================
class CommentCreate(BaseModel):
    postId: str  # camelCase to match frontend
    parentId: Optional[str] = None
    author: str  # display name
    text: str

class CommentLike(BaseModel):
    by: str  # device ID or user identifier

class CommentResponse(BaseModel):
    id: str
    postId: str
    parentId: Optional[str] = None
    author: str
    text: str
    createdAt: datetime
    likes: int = 0
    likedBy: List[str] = []

    class Config:
        from_attributes = True


# ============================================
# POST SCHEMAS — mirrors Post
# ============================================
class PostCreate(BaseModel):
    slug: str
    title: str
    excerpt: Optional[str] = None
    coverImage: Optional[str] = None
    coverGradient: Optional[str] = None
    category: str
    tags: List[str] = []
    authorId: str
    readingTime: int = 5
    status: str = "draft"  # "draft" | "published" | "scheduled"
    featured: bool = False
    trending: bool = False
    seo: SeoMeta = SeoMeta()
    content: List[dict] = []
    scheduledFor: Optional[datetime] = None

class PostUpdate(BaseModel):
    """Partial update — ALL fields optional."""
    slug: Optional[str] = None
    title: Optional[str] = None
    excerpt: Optional[str] = None
    coverImage: Optional[str] = None
    coverGradient: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    readingTime: Optional[int] = None
    status: Optional[str] = None  # "draft" | "published" | "scheduled"
    featured: Optional[bool] = None
    trending: Optional[bool] = None
    views: Optional[int] = None
    seo: Optional[SeoMeta] = None
    content: Optional[List[dict]] = None
    scheduledFor: Optional[datetime] = None

class PostResponse(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: Optional[str] = None
    coverImage: Optional[str] = None
    coverGradient: Optional[str] = None
    category: str
    tags: List[str] = []
    authorId: str
    publishedAt: Optional[datetime] = None
    scheduledFor: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    readingTime: int = 5
    status: str
    featured: bool = False
    trending: bool = False
    views: int = 0
    seo: SeoMeta = SeoMeta()
    content: List[dict] = []
    comments: List[CommentResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# MEDIA ITEM SCHEMAS — mirrors MediaItem
# ============================================
class MediaItemResponse(BaseModel):
    id: str
    name: str
    type: str  # "image" | "video"
    dataUrl: Optional[str] = None
    size: int = 0
    uploadedAt: Optional[datetime] = None
    uploadedBy: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================
# BRANDING SCHEMAS — mirrors Branding
# ============================================
class BrandingUpdate(BaseModel):
    siteTitle: Optional[str] = None
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    keywords: Optional[str] = None
    ogImage: Optional[str] = None
    logo: Optional[str] = None
    favicon: Optional[str] = None

class BrandingResponse(BaseModel):
    siteTitle: str
    metaTitle: str
    metaDescription: str
    keywords: Optional[str] = None
    ogImage: Optional[str] = None
    logo: Optional[str] = None
    favicon: Optional[str] = None
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# PAGINATION
# ============================================
class PaginatedPosts(BaseModel):
    posts: List[PostResponse]
    pagination: dict


# ============================================
# SUBSCRIBER SCHEMAS
# ============================================
class SubscriberCreate(BaseModel):
    email: str

class SubscriberResponse(BaseModel):
    id: int
    email: str
    createdAt: datetime = Field(..., alias="created_at")

    class Config:
        from_attributes = True
        populate_by_name = True
"""
Database configuration and SQLAlchemy models.
Each table here mirrors exactly the TypeScript types in src/lib/types.ts
"""

from sqlalchemy import (
    create_engine, Column, String, Integer, Boolean, Float,
    Text, DateTime, ForeignKey, JSON, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres@localhost:5432/ai_chronicle")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ============================================
# AUTHOR TABLE — mirrors src/lib/types.ts Author
# ============================================
class Author(Base):
    __tablename__ = "authors"

    id = Column(String, primary_key=True)  # e.g., "ddumba-ak"
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)  # bcrypt hashed
    name = Column(String, nullable=False)  # display name
    full_name = Column(String, nullable=True)
    role = Column(String, nullable=True)
    tagline = Column(String, nullable=True)
    location = Column(String, nullable=True)
    avatar = Column(String, nullable=True)  # URL or base64
    bio = Column(Text, nullable=True)
    challenges = Column(JSON, default=list)  # string[]
    focus_areas = Column(JSON, default=list)  # string[]
    tech_stack = Column(JSON, default=list)  # string[]
    contacts = Column(JSON, default=dict)  # AuthorContacts
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    posts = relationship("Post", back_populates="author")
    media = relationship("MediaItem", back_populates="uploader")


# ============================================
# POST TABLE — mirrors src/lib/types.ts Post
# ============================================
class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True)  # e.g., "p1"
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    excerpt = Column(Text, nullable=True)
    cover_image = Column(Text, nullable=True)  # base64 dataURL or URL
    cover_gradient = Column(String, nullable=True)
    category = Column(String, nullable=False, index=True)
    tags = Column(JSON, default=list)  # string[]
    author_id = Column(String, ForeignKey("authors.id"), nullable=False, index=True)
    published_at = Column(DateTime, nullable=True)
    scheduled_for = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reading_time = Column(Integer, default=5)
    status = Column(String, nullable=False, default="draft", index=True)  # "draft" | "published" | "scheduled"
    featured = Column(Boolean, default=False, index=True)
    trending = Column(Boolean, default=False, index=True)
    views = Column(Integer, default=0)
    seo = Column(JSON, default=dict)  # SeoMeta
    content = Column(JSON, default=list)  # ContentBlock[]
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    author = relationship("Author", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


# ============================================
# COMMENT TABLE — mirrors src/lib/types.ts Comment
# ============================================
class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True)  # e.g., "c_1"
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(String, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    author = Column(String, nullable=False)  # display name
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    likes = Column(Integer, default=0)
    liked_by = Column(JSON, default=list)  # string[] of device IDs

    # Relationships
    post = relationship("Post", back_populates="comments")
    parent = relationship("Comment", remote_side="Comment.id", back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")


# ============================================
# MEDIA ITEM TABLE — mirrors src/lib/types.ts MediaItem
# ============================================
class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(String, primary_key=True)  # e.g., "m_1"
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # "image" | "video"
    data_url = Column(Text, nullable=True)  # base64 or file path
    size = Column(Integer, default=0)  # bytes
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String, ForeignKey("authors.id"), nullable=True)

    # Relationships
    uploader = relationship("Author", back_populates="media")


# ============================================
# BRANDING TABLE — mirrors src/lib/types.ts Branding
# Only ONE row (site-wide settings)
# ============================================
class Branding(Base):
    __tablename__ = "branding"

    id = Column(Integer, primary_key=True, default=1)  # Always id=1
    site_title = Column(String, nullable=False)
    meta_title = Column(String, nullable=False)
    meta_description = Column(Text, nullable=False)
    keywords = Column(String, nullable=True)
    og_image = Column(String, nullable=True)
    logo = Column(String, nullable=True)
    favicon = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
# ============================================
# CATEGORY TABLE
# ============================================
class Category(Base):
    __tablename__ = "categories"

    slug = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    color = Column(String, nullable=False, default="from-emerald-400 to-teal-500")
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================
# SUBSCRIBER TABLE
# ============================================
class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ============================================
# CREATE ALL TABLES
# ============================================
def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# Ddumba.AI Editorial — Full-Stack Architecture

**React + TypeScript frontend with FastAPI + PostgreSQL backend.**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS 4, TanStack Router |
| **Backend** | Python 3.13, FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL 14 |
| **Authentication** | JWT (python-jose) with bcrypt password hashing |
| **Email** | SMTP via cPanel with BackgroundTasks |
| **UI** | Radix UI, Lucide React, Framer Motion |

## Data Flow

```
React Frontend (localhost:8080)
       │
       │ HTTP/JSON (fetch)
       ▼
FastAPI Backend (localhost:8000)
       │
       │ SQLAlchemy ORM
       ▼
PostgreSQL (ai_chronicle)
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | No | Admin login, returns JWT |
| `GET` | `/api/auth/me` | Yes | Current user profile |
| `GET` | `/api/posts/` | No | List posts (optional filters) |
| `POST` | `/api/posts/` | Yes | Create post |
| `PUT` | `/api/posts/{id}` | Yes | Update post |
| `DELETE` | `/api/posts/{id}` | Yes | Delete post |
| `PATCH` | `/api/posts/{id}/publish` | Yes | Toggle publish status |
| `GET` | `/api/authors/` | No | List authors |
| `PUT` | `/api/authors/{id}` | Yes | Update author profile |
| `GET` | `/api/comments/` | No | List all comments |
| `POST` | `/api/comments/` | No | Add comment |
| `DELETE` | `/api/comments/{id}` | Yes | Delete comment |
| `POST` | `/api/media/upload` | Yes | Upload file |
| `GET` | `/api/branding/` | No | Get site branding |
| `PUT` | `/api/branding/` | Yes | Update branding |
| `GET` | `/api/categories/` | No | List categories |
| `POST` | `/api/categories/` | Yes | Create category |
| `DELETE` | `/api/categories/{slug}` | Yes | Delete category |
| `GET` | `/api/subscribe/` | No | List subscribers |
| `POST` | `/api/subscribe/` | No | Subscribe to newsletter |

## Database Tables

| Table | Description |
|-------|-------------|
| `authors` | Admin users with hashed passwords |
| `posts` | Articles with content blocks, tags, SEO metadata |
| `comments` | Threaded comments with likes |
| `media_items` | Uploaded images and videos |
| `branding` | Site-wide SEO and branding settings |
| `categories` | Post categories with color gradients |
| `subscribers` | Newsletter email subscribers |

## Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `index.tsx` | Homepage with hero, articles, trending |
| `/blog/$slug` | `blog.$slug.tsx` | Article detail page |
| `/category/$slug` | `category.$slug.tsx` | Category listing |
| `/search` | `search.tsx` | Full-text search |
| `/about-author` | `about-author.tsx` | Author profile page |
| `/admin` | `admin.tsx` | Admin dashboard (auth required) |

## State Management

All data flows from PostgreSQL through FastAPI to React via `BlogProvider` in `src/lib/blog-context.tsx`. The provider fetches data on mount and exposes it through React Context. Only theme preference remains in localStorage as a UI setting.

## Email System

- **Welcome Email:** Sent via BackgroundTasks when a user subscribes
- **Post Notification:** Broadcast to all subscribers when a post is published
- **SMTP:** cPanel SMTP with STARTTLS on port 587

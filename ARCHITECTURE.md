# Ddumba.AI Editorial — Frontend Architecture

100% frontend, zero backend. All state persists in **localStorage** via
`BlogProvider` in `src/lib/blog-context.tsx`.

## localStorage Keys

| Key | Purpose | Shape |
|---|---|---|
| `blog:posts:v1` | All articles (draft / scheduled / published) | `Post[]` |
| `blog:authors:v1` | Registered authors | `Author[]` |
| `blog:session:v1` | Current logged-in author id | `string \| null` |
| `blog:media:v1` | Media library | `MediaItem[]` |
| `blog:comments:v1` | All comments and replies | `Comment[]` |
| `blog:branding:v1` | Site branding & SEO | `Branding` |
| `blog:theme:v1` | UI theme | `"dark" \| "light"` |
| `blog:autosave:<postId>` | Editor autosave per post | `{ title, excerpt, content }` |
| `blog:device` | Anonymous device id for comment likes/ownership | `string` |
| `blog:name` | Last name used in public comment form | `string` |

## Schemas

### Post
```json
{
  "id": "abc123",
  "slug": "scaling-llm-inference",
  "title": "...",
  "excerpt": "...",
  "coverImage": "data:image/png;base64,...",
  "coverGradient": "linear-gradient(...)",
  "category": "inference",
  "tags": ["vLLM", "Kubernetes"],
  "authorId": "ddumba-ak",
  "status": "draft | scheduled | published",
  "scheduledFor": "2026-05-20T14:00:00.000Z",
  "publishedAt": "2026-05-15T10:00:00.000Z",
  "updatedAt": "2026-05-17T08:30:00.000Z",
  "readingTime": 12,
  "featured": true,
  "trending": true,
  "views": 0,
  "seo": { "title": "...", "description": "..." },
  "content": [ /* ContentBlock[] */ ],
  "comments": []
}
```

### Comment (threaded)
```json
{
  "id": "c_1",
  "postId": "p1",
  "parentId": null,
  "author": "Visitor Name",
  "text": "...",
  "createdAt": "2026-05-17T08:00:00.000Z",
  "likes": 3,
  "likedBy": ["u_abc", "u_def"]
}
```
A reply has `parentId` set to the parent comment's id. Deleting a comment also
removes its direct replies.

### Author
```json
{
  "id": "ddumba-ak",
  "username": "ddumba",
  "password": "ddumba2025",
  "name": "Ddumba AK",
  "role": "...",
  "tagline": "...",
  "location": "...",
  "avatar": "/profile.png  OR data:image/...",
  "bio": "...",
  "challenges": ["..."],
  "focusAreas": ["..."],
  "techStack": ["..."],
  "contacts": { "linkedin": "...", "email": "...", "phone": "...", ... }
}
```

### Branding
```json
{
  "siteTitle": "Ddumba.AI · Editorial...",
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": "ai, vLLM, ...",
  "ogImage": "/profile.png",
  "logo": "/profile.png",
  "favicon": "/favicon.png"
}
```

### MediaItem
```json
{ "id": "m_1", "name": "cover.png", "type": "image", "dataUrl": "data:...", "size": 12450, "uploadedAt": "..." }
```

## Workflows

### Auto-publish scheduled posts
`BlogProvider` registers a 15-second `setInterval` (and runs once on mount).
Every tick:
```ts
posts.forEach(p => {
  if (p.status === "scheduled" && new Date(p.scheduledFor) <= now) {
    p.status = "published";
    p.publishedAt = now.toISOString();
    p.scheduledFor = null;
  }
});
```
Result: scheduled posts appear publicly the moment their time arrives, no
refresh required. Public routes (`/`, `/category/$slug`, `/search`,
`/blog/$slug`) all filter by `status === "published"`, so scheduled and draft
posts never leak.

### Comment moderation
1. Visitor submits via `<Comments>` on `/blog/$slug` → `addComment()` writes to `blog:comments:v1`.
2. Admin sees every comment in `/admin → Comments` tab, can **Reply** (creates child comment) or **Delete** (removes comment + its replies).
3. Public threading: `Comments.tsx` reads same key and renders parents with nested replies; the author label is used as the "admin reply" signal when admins reply with `currentAuthor.name`.

### Branding & SEO
`BrandingTab` writes `blog:branding:v1`. A `useEffect` in `BlogProvider`
mirrors that into the live `<head>`: `document.title`, `<meta name=description>`,
`<meta name=keywords>`, `og:title`, `og:description`, `og:image`, `<link rel=icon>`.
Changes apply instantly across the app, no rebuild needed.

### Profile picture
`ProfileTab` reads an uploaded file as a base64 data URL and calls
`updateAuthor({ avatar })`. The avatar is consumed by:
- `Navbar` logo, `Footer` logo (when `branding.logo` falls back)
- `about-author.tsx` hero
- comments avatar fallback

### Editor autosave & draft/schedule/publish
`useAutoSave` writes `blog:autosave:<id>` on every keystroke. Editor toolbar:
- **Save as Draft** → `status = "draft"`
- **Schedule** → validates `scheduledFor` is in the future, `status = "scheduled"`
- **Publish Now** → `status = "published"`, `publishedAt = now`

## Public-route data consumption

| Route / Component | Reads | Filter |
|---|---|---|
| `/` (`index.tsx`) | `posts` | `status === "published"` |
| `/category/$slug` | `posts` | published + category match |
| `/search` | `posts` | published + fulltext match |
| `/blog/$slug` | `posts` | published only (throws 404 otherwise) |
| `TrendingSidebar` | `posts` | published + trending |
| `Comments` (per post) | `comments` | `postId === post.id` |
| `Footer` / `Navbar` | `branding`, `authors[0]` | — |
| `about-author.tsx` | `authors[0]`, `posts` | published by author |

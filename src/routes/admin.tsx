import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBlog, defaultBranding as defaultBrandingFallback } from "@/lib/blog-context";
import { MediaUpload } from "@/components/MediaUpload";
import { RichEditor } from "@/components/RichEditor";
import { RichContent } from "@/components/RichContent";
import type { Post, ContentBlock } from "@/lib/types";
import { toast } from "sonner";
import { LayoutDashboard, FileText, Image as ImageIcon, MessageSquare, Settings, 
  Plus, Edit3, Trash2, Eye, EyeOff, Star, Flame, LogIn, Calendar, Palette, Send, FileEdit, Layers } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function AdminPage() {
  const blog = useBlog();
  const { currentAuthor, login, logout } = blog;
  const [tab, setTab] = useState<"dashboard" | "posts" | "editor" | "media" | "comments" | "settings" | "branding" | "categories" | "subscribers">("dashboard");
  const [editing, setEditing] = useState<Post | null>(null);

  if (!currentAuthor) return <LoginScreen onLogin={login} />;

  const tabs = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "posts", label: "Posts", Icon: FileText },
    { id: "media", label: "Media", Icon: ImageIcon },
    { id: "comments", label: "Comments", Icon: MessageSquare },
    { id: "branding", label: "Branding & SEO", Icon: Palette },
    { id: "categories", label: "Categories", Icon: Layers },
    { id: "settings", label: "Profile", Icon: Settings },
    { id: "subscribers", label: "Subscribers", Icon: Send },
  ] as const;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold md:text-4xl">Author Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {currentAuthor.name}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="rounded-xl border px-4 py-2 text-sm hover:bg-muted">View site</Link>
            <button onClick={logout} className="rounded-xl border px-4 py-2 text-sm hover:bg-destructive/10 hover:text-destructive">Logout</button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border bg-card p-1.5">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setEditing(null); }}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${tab === t.id ? "bg-gradient-brand text-brand-foreground shadow-brand" : "hover:bg-muted"}`}>
              <t.Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <Dashboard onEdit={(p) => { setEditing(p); setTab("editor"); }} onNew={() => { setEditing(null); setTab("editor"); }} />}
        {tab === "posts" && <PostsTab onEdit={(p) => { setEditing(p); setTab("editor"); }} onNew={() => { setEditing(null); setTab("editor"); }} />}
        {tab === "editor" && <EditorTab post={editing} onDone={() => { setEditing(null); setTab("posts"); }} />}
        {tab === "media" && <MediaTab />}
        {tab === "comments" && <CommentsTab />}
        {tab === "settings" && <ProfileTab />}
        {tab === "branding" && <BrandingTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "subscribers" && <SubscribersTab />}
      </main>
      <Footer />
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const [username, setUsername] = useState("ddumba");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const blog = useBlog();
  const [reg, setReg] = useState({ username: "", password: "", name: "", role: "" });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-12">
        <div className="w-full rounded-3xl border bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand"><LogIn className="h-5 w-5 text-brand-foreground" /></div>
            <h1 className="font-display text-2xl font-bold">{showRegister ? "Register author" : "Author login"}</h1>
          </div>

          {!showRegister ? (
            <form onSubmit={async e => {
              e.preventDefault();
              try {
                await onLogin(username, password);
                toast.success("Welcome back");
              } catch {
                toast.error("Invalid credentials. Try ddumba / ddumba2025");
              }
            }} className="space-y-3">
              <Field label="Username"><input value={username} onChange={e => setUsername(e.target.value)} className="input" /></Field>
              <Field label="Password"><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" /></Field>
              <button className="w-full rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-brand-foreground shadow-brand">Login</button>
              <p className="text-center text-xs text-muted-foreground">Demo: <span className="font-mono">ddumba / ddumba2025</span></p>
              <button type="button" onClick={() => setShowRegister(true)} className="w-full text-xs text-muted-foreground hover:text-brand">Register a new author →</button>
            </form>
          ) : (
            <form onSubmit={async e => {
              e.preventDefault();
              if (!reg.username || !reg.password || !reg.name) return toast.error("Fill all required fields");
              try {
                await blog.registerAuthor({
                  username: reg.username, password: reg.password, name: reg.name, role: reg.role || "Author",
                  avatar: "", bio: "", challenges: [], focusAreas: [], techStack: [], contacts: {},
                } as any);
                toast.success("Author registered. Now log in.");
                setShowRegister(false);
              } catch {
                toast.error("Registration failed. Username may already exist.");
              }
            }} className="space-y-3">
              <Field label="Name"><input value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} className="input" /></Field>
              <Field label="Username"><input value={reg.username} onChange={e => setReg({ ...reg, username: e.target.value })} className="input" /></Field>
              <Field label="Password"><input type="password" value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })} className="input" /></Field>
              <Field label="Role"><input value={reg.role} onChange={e => setReg({ ...reg, role: e.target.value })} className="input" /></Field>
              <button className="w-full rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-brand-foreground shadow-brand">Register</button>
              <button type="button" onClick={() => setShowRegister(false)} className="w-full text-xs text-muted-foreground hover:text-brand">← Back to login</button>
            </form>
          )}
        </div>
      </main>
      <Footer />
      <style>{`.input { width:100%; border-radius:0.75rem; border:1px solid var(--border); background:var(--background); padding:0.55rem 0.75rem; font-size:0.875rem; outline:none; } .input:focus { border-color: var(--brand); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function Dashboard({ onEdit, onNew }: { onEdit: (p: Post) => void; onNew: () => void }) {
  const { posts, comments, media } = useBlog();
  const published = posts.filter(p => p.status === "published");
  const drafts = posts.filter(p => p.status === "draft");
  const stats = [
    { label: "Published", value: published.length, color: "from-emerald-400 to-teal-500" },
    { label: "Drafts", value: drafts.length, color: "from-amber-400 to-orange-500" },
    { label: "Comments", value: comments.length, color: "from-cyan-400 to-blue-500" },
    { label: "Media items", value: media.length, color: "from-pink-400 to-rose-500" },
  ];
  const recent = posts.slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-3xl border bg-card p-5">
            <div className={`inline-block rounded-lg bg-gradient-to-r ${s.color} px-2 py-0.5 text-[10px] font-bold uppercase text-black`}>{s.label}</div>
            <div className="mt-3 font-display text-4xl font-extrabold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Recent posts</h2>
          <button onClick={onNew} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground shadow-brand"><Plus className="h-3.5 w-3.5" /> New</button>
        </div>
        <ul className="divide-y">
          {recent.map(p => (
            <li key={p.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.status} · {p.views} views</div>
              </div>
              <button onClick={() => onEdit(p)} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">Edit</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PostsTab({ onEdit, onNew }: { onEdit: (p: Post) => void; onNew: () => void }) {
  const { posts, deletePost, togglePublish, toggleFeatured, toggleTrending } = useBlog();
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const list = posts.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(["all", "published", "draft", "scheduled"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${filter === f ? "border-brand bg-brand/10 text-brand" : "hover:bg-muted"}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground shadow-brand"><Plus className="h-3.5 w-3.5" /> New post</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-muted-foreground">
            <th className="py-2 pr-3">Title</th><th className="px-3">Status</th><th className="px-3">Views</th><th className="px-3">Date</th><th className="px-3 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y">
            {list.map(p => (
              <tr key={p.id}>
                <td className="py-3 pr-3">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </td>
                <td className="px-3"><span className="rounded-full border px-2 py-0.5 text-[10px] uppercase">{p.status}</span></td>
                <td className="px-3 text-muted-foreground">{p.views}</td>
                <td className="px-3 text-xs text-muted-foreground">{format(new Date(p.publishedAt), "MMM d")}</td>
                <td className="px-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => toggleFeatured(p.id)} title="Featured" className={`grid h-7 w-7 place-items-center rounded-md border ${p.featured ? "border-brand text-brand" : ""}`}><Star className="h-3 w-3" /></button>
                    <button onClick={() => toggleTrending(p.id)} title="Trending" className={`grid h-7 w-7 place-items-center rounded-md border ${p.trending ? "border-brand text-brand" : ""}`}><Flame className="h-3 w-3" /></button>
                    <button onClick={() => togglePublish(p.id)} title="Publish/unpublish" className="grid h-7 w-7 place-items-center rounded-md border">
                      {p.status === "published" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button onClick={() => onEdit(p)} className="grid h-7 w-7 place-items-center rounded-md border"><Edit3 className="h-3 w-3" /></button>
                                        <button onClick={() => setDeleteConfirm(p.id)} className="grid h-7 w-7 place-items-center rounded-md border hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

                {/* Delete Confirmation Modal */}
      {deleteConfirm && (() => {
        const postToDelete = posts.find(p => p.id === deleteConfirm);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div className="rounded-3xl border bg-card p-8 shadow-card-premium max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10">
                  <Trash2 className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">Delete Post?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will permanently delete <strong>"{postToDelete?.title}"</strong>. This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} 
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                  Cancel
                </button>
                <button onClick={async () => {
                  try { 
                    await deletePost(deleteConfirm); 
                    toast.success("Post deleted"); 
                  } catch { 
                    toast.error("Delete failed"); 
                  }
                  setDeleteConfirm(null);
                }}
                  className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90">
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      
        </table>
      </div>
    </div>
  );
}

function EditorTab({ post, onDone }: { post: Post | null; onDone: () => void }) {
  const { createPost, updatePost, currentAuthor, categories } = useBlog();
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState(post?.category ?? categories[0].slug);
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [readingTime, setReadingTime] = useState(post?.readingTime ?? 6);
  const [status, setStatus] = useState<Post["status"]>(post?.status ?? "draft");
  const [scheduledFor, setScheduledFor] = useState(post?.scheduledFor ?? "");
  const [cover, setCover] = useState<{ name: string; type: "image" | "video"; dataUrl: string; size: number } | null>(
    post?.coverImage ? { name: "cover", type: "image", dataUrl: post.coverImage, size: 0 } : null
  );
  const [content, setContent] = useState<ContentBlock[]>(post?.content ?? []);
  const [seoTitle, setSeoTitle] = useState(post?.seo.title ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seo.description ?? "");
  const [preview, setPreview] = useState(false);

  const save = async (newStatus?: Post["status"]) => {
    if (!title.trim()) return toast.error("Title required");
    const finalStatus = newStatus ?? status;
    const finalSlug = slug || slugify(title);
    const data: Omit<Post, "id"> = {
      title, excerpt, slug: finalSlug, category,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      readingTime: Number(readingTime) || 5,
      status: finalStatus,
      scheduledFor: finalStatus === "scheduled" ? scheduledFor : null,
      coverImage: cover?.dataUrl ?? "",
      coverGradient: post?.coverGradient ?? "linear-gradient(135deg,#0a3,#077,#055)",
      authorId: currentAuthor!.id,
      publishedAt: post?.publishedAt ?? new Date().toISOString(),
      featured: post?.featured ?? false,
      trending: post?.trending ?? false,
      views: post?.views ?? 0,
      seo: { title: seoTitle, description: seoDesc },
      content,
      comments: post?.comments ?? [],
    };
    try {
      if (post) { await updatePost(post.id, data as any); toast.success("Post updated"); }
      else { await createPost(data as any); toast.success("Post created"); }
      onDone();
    } catch (e: any) {
      toast.error(e.message || "Failed to save post");
    }
  };

  // autosave draft to localStorage
  useAutoSave({ title, excerpt, content }, post?.id ?? "new");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-3xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{post ? "Edit post" : "New post"}</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPreview(p => !p)} className="rounded-xl border px-3 py-1.5 text-xs">{preview ? "Edit" : "Preview"}</button>
            <button onClick={() => save("draft")} className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"><FileEdit className="h-3 w-3" /> Save as Draft</button>
            <button onClick={() => {
              if (!scheduledFor) return toast.error("Pick a future date/time in the Publishing panel");
              if (new Date(scheduledFor).getTime() <= Date.now()) return toast.error("Scheduled time must be in the future");
              save("scheduled");
            }} className="inline-flex items-center gap-1.5 rounded-xl border border-brand/40 px-3 py-1.5 text-xs text-brand"><Calendar className="h-3 w-3" /> Schedule</button>
            <button onClick={() => save("published")} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground shadow-brand"><Send className="h-3 w-3" /> Publish Now</button>
          </div>
        </div>

        {!preview ? (
          <>
            <input value={title} onChange={e => { setTitle(e.target.value); if (!post) setSlug(slugify(e.target.value)); }}
              placeholder="Article title…"
              className="w-full bg-transparent font-display text-3xl font-extrabold outline-none" />
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
              placeholder="Short excerpt that appears in cards & previews…"
              className="w-full resize-none border-l-2 border-brand bg-transparent pl-3 text-sm text-muted-foreground outline-none" />
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">Cover image</div>
              <MediaUpload value={cover} onChange={setCover} accept="image/*" />
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">Content blocks</div>
              <RichEditor value={content} onChange={setContent} />
            </div>
          </>
        ) : (
          <div className="prose-editorial">
            <h1>{title || "Untitled"}</h1>
            <p className="text-muted-foreground">{excerpt}</p>
            {cover && <img src={cover.dataUrl} alt="" />}
            <RichEditorPreview content={content} />
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border bg-card p-5">
          <h3 className="mb-3 font-display text-sm font-bold">Publishing</h3>
          <div className="space-y-3">
            <Field label="Status">
              <select value={status} onChange={e => setStatus(e.target.value as Post["status"])} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </Field>
            <Field label="Schedule for (date & time)">
              <input type="datetime-local" value={scheduledFor ?? ""} onChange={e => setScheduledFor(e.target.value)} className="input" />
            </Field>
            <Field label="Slug"><input value={slug} onChange={e => setSlug(slugify(e.target.value))} className="input" /></Field>
            <Field label="Category">
              <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Tags (comma-separated)"><input value={tags} onChange={e => setTags(e.target.value)} className="input" /></Field>
            <Field label="Reading time (min)"><input type="number" value={readingTime} onChange={e => setReadingTime(Number(e.target.value))} className="input" /></Field>
          </div>
        </div>
        <div className="rounded-3xl border bg-card p-5">
          <h3 className="mb-3 font-display text-sm font-bold">SEO</h3>
          <div className="space-y-3">
            <Field label="SEO title"><input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="input" /></Field>
            <Field label="SEO description"><textarea rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="input resize-none" /></Field>
          </div>
        </div>
      </aside>
      <style>{`.input { width:100%; border-radius:0.75rem; border:1px solid var(--border); background:var(--background); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; } .input:focus { border-color: var(--brand); }`}</style>
    </div>
  );
}

function RichEditorPreview({ content }: { content: ContentBlock[] }) {
  return <RichContent blocks={content} />;
}

function useAutoSave(data: unknown, key: string) {
  if (typeof window !== "undefined") {
    try { localStorage.setItem(`blog:autosave:${key}`, JSON.stringify(data)); } catch { /* */ }
  }
}

function MediaTab() {
  const { media, addMedia, deleteMedia } = useBlog();
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Upload media</h2>
        <MediaUpload onChange={(f) => { if (f) { addMedia(f); toast.success("Uploaded"); } }} value={null} />
      </div>
      <div className="rounded-3xl border bg-card p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Library ({media.length})</h2>
        {media.length === 0 ? (
          <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map(m => (
              <div key={m.id} className="group relative overflow-hidden rounded-2xl border">
                {m.type === "image"
                  ? <img src={m.dataUrl} alt={m.name} className="aspect-square w-full object-cover" />
                  : <video src={m.dataUrl} className="aspect-square w-full object-cover" />}
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <span className="truncate text-[10px] text-white">{m.name}</span>
                        <button onClick={async () => { try { await deleteMedia(m.id); toast.success("Removed"); } catch { toast.error("Remove failed"); } }} className="grid h-7 w-7 place-items-center rounded-md bg-destructive text-destructive-foreground"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsTab() {
  const { comments, posts, deleteComment, addComment, currentAuthor } = useBlog();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  
  // Collect all comments from all posts
  const allComments = comments;
  
  return (
    <div className="rounded-3xl border bg-card p-6">
      <h2 className="mb-5 font-display text-xl font-bold">Comments ({allComments.length})</h2>
      {allComments.length === 0 ? <p className="text-sm text-muted-foreground">No comments yet.</p> : (
        <ul className="space-y-3">
          {allComments.map(c => {
            const post = posts.find(p => p.id === c.postId);
            return (
              <li key={c.id} className="rounded-2xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">on <span className="text-foreground">{post?.title ?? "deleted"}</span> · by {c.author}</div>
                    <p className="mt-1 text-sm">{c.text}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="rounded-md border px-2 py-1 text-xs">Reply</button>
                    <button onClick={async () => { try { await deleteComment(c.id); } catch { /* */ } }} className="rounded-md border px-2 py-1 text-xs hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
                {replyTo === c.id && (
                  <div className="mt-3 flex gap-2">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write reply…"
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none" />
                    <button onClick={async () => {
                      if (!replyText.trim() || !post) return;
                      try {
                        await addComment(post.id, replyText, currentAuthor?.name ?? "Author", c.id);
                        setReplyText(""); setReplyTo(null);
                      } catch { /* */ }
                    }} className="rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-brand-foreground">Send</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ProfileTab() {
  const { currentAuthor, updateAuthor } = useBlog();
  const a = currentAuthor!;
  const [form, setForm] = useState(a);
  const [contacts, setContacts] = useState(a.contacts);
  const readFile = (file: File) => new Promise<string>((res) => {
    const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file);
  });
  return (
    <div className="space-y-6 rounded-3xl border bg-card p-6">
      <h2 className="font-display text-xl font-bold">Author profile</h2>

      <div className="flex flex-wrap items-center gap-5 rounded-2xl border bg-background p-5">
        <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-gradient-brand text-2xl font-bold text-brand-foreground ring-2 ring-brand/30">
          {form.avatar
            ? <img src={form.avatar} alt={form.name} className="h-full w-full object-cover" />
            : form.name.split(" ").map(s => s[0]).join("")}
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm font-semibold">Profile picture</div>
          <p className="text-xs text-muted-foreground">PNG / JPG. Updates instantly across navbar, footer, About page and author cards.</p>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs hover:bg-muted">
              Upload image
              <input type="file" accept="image/*" className="hidden"
                onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const data = await readFile(f);
                  setForm(prev => ({ ...prev, avatar: data }));
                }} />
            </label>
            {form.avatar && (
              <button onClick={() => setForm(prev => ({ ...prev, avatar: "" }))}
                className="rounded-xl border px-3 py-1.5 text-xs hover:text-destructive">Remove</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></Field>
        <Field label="Role"><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input" /></Field>
        <Field label="Tagline"><input value={form.tagline ?? ""} onChange={e => setForm({ ...form, tagline: e.target.value })} className="input" /></Field>
        <Field label="Location"><input value={form.location ?? ""} onChange={e => setForm({ ...form, location: e.target.value })} className="input" /></Field>
      </div>
      <Field label="Bio"><textarea rows={6} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input resize-none" /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="LinkedIn"><input value={contacts.linkedin ?? ""} onChange={e => setContacts({ ...contacts, linkedin: e.target.value })} className="input" /></Field>
        <Field label="Twitter / X"><input value={contacts.twitter ?? ""} onChange={e => setContacts({ ...contacts, twitter: e.target.value })} className="input" /></Field>
        <Field label="Email"><input value={contacts.email ?? ""} onChange={e => setContacts({ ...contacts, email: e.target.value })} className="input" /></Field>
        <Field label="Phone"><input value={contacts.phone ?? ""} onChange={e => setContacts({ ...contacts, phone: e.target.value })} className="input" /></Field>
        <Field label="Personal website"><input value={contacts.personalWebsite ?? ""} onChange={e => setContacts({ ...contacts, personalWebsite: e.target.value })} className="input" /></Field>
        <Field label="Company website"><input value={contacts.companyWebsite ?? ""} onChange={e => setContacts({ ...contacts, companyWebsite: e.target.value })} className="input" /></Field>
      </div>
            <button onClick={async () => { try { await updateAuthor(a.id, { ...form, contacts }); toast.success("Profile updated"); } catch { toast.error("Update failed"); } }}
        className="rounded-xl bg-gradient-brand px-5 py-2 text-sm font-semibold text-brand-foreground shadow-brand">Save changes</button>
      <style>{`.input { width:100%; border-radius:0.75rem; border:1px solid var(--border); background:var(--background); padding:0.55rem 0.75rem; font-size:0.875rem; outline:none; } .input:focus { border-color: var(--brand); }`}</style>
    </div>
  );
}

function BrandingTab() {
  const { branding, updateBranding, resetBranding } = useBlog();
  const [form, setForm] = useState(branding);
  const readFile = (file: File) => new Promise<string>((res) => {
    const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file);
  });
  const imgField = (key: "logo" | "favicon" | "ogImage", label: string, hint: string) => (
    <div className="rounded-2xl border bg-background p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl border bg-card">
          {form[key] ? <img src={form[key]} alt={label} className="h-full w-full object-cover" /> : <span className="text-[10px] text-muted-foreground">none</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs hover:bg-muted">
          Upload
          <input type="file" accept="image/*" className="hidden"
            onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const data = await readFile(f); setForm(p => ({ ...p, [key]: data })); }} />
        </label>
        <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder="…or paste URL" className="input flex-1 min-w-[160px]" />
      </div>
    </div>
  );
  return (
    <div className="space-y-6 rounded-3xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Branding & SEO</h2>
        <button onClick={async () => { try { await resetBranding(); setForm(defaultBrandingFallback); toast.success("Reset to defaults"); } catch { toast.error("Reset failed"); } }}
          className="rounded-xl border px-3 py-1.5 text-xs hover:bg-muted">Reset</button>
      </div>
      <p className="text-xs text-muted-foreground">All changes are saved to localStorage and applied to the document head instantly.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Site title"><input value={form.siteTitle} onChange={e => setForm(p => ({ ...p, siteTitle: e.target.value }))} className="input" /></Field>
        <Field label="Meta title"><input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))} className="input" /></Field>
      </div>
      <Field label="Meta description"><textarea rows={3} value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))} className="input resize-none" /></Field>
      <Field label="Keywords (comma-separated)"><input value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} className="input" /></Field>

      <div className="grid gap-4 md:grid-cols-3">
        {imgField("logo", "Logo", "Shown in navbar and footer.")}
        {imgField("favicon", "Favicon", "Browser tab icon.")}
        {imgField("ogImage", "Open Graph image", "Used for social previews.")}
      </div>

      <button onClick={async () => { try { await updateBranding(form); toast.success("Branding updated"); } catch { toast.error("Update failed"); } }}
        className="rounded-xl bg-gradient-brand px-5 py-2 text-sm font-semibold text-brand-foreground shadow-brand">Save branding</button>
      <style>{`.input { width:100%; border-radius:0.75rem; border:1px solid var(--border); background:var(--background); padding:0.55rem 0.75rem; font-size:0.875rem; outline:none; } .input:focus { border-color: var(--brand); }`}</style>
    </div>
  );
}

function CategoriesTab() {
  const { categories, addCategory, deleteCategory } = useBlog();
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("from-emerald-400 to-teal-500");

  const colorOptions = [
    { value: "from-emerald-400 to-teal-500", label: "Green" },
    { value: "from-cyan-400 to-blue-500", label: "Blue" },
    { value: "from-violet-400 to-indigo-500", label: "Purple" },
    { value: "from-amber-400 to-orange-500", label: "Orange" },
    { value: "from-pink-400 to-rose-500", label: "Pink" },
    { value: "from-lime-400 to-green-500", label: "Lime" },
    { value: "from-red-400 to-rose-600", label: "Red" },
    { value: "from-sky-400 to-indigo-500", label: "Sky" },
  ];

  return (
    <div className="space-y-6 rounded-3xl border bg-card p-6">
      <h2 className="font-display text-xl font-bold">Categories</h2>
      <p className="text-xs text-muted-foreground">Add or remove categories. Changes reflect in navbar, filters, and post editor.</p>

      <div className="flex flex-wrap gap-3 items-end rounded-2xl border bg-background p-4">
        <Field label="Slug (URL)">
          <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))} placeholder="e.g. ai-trends" className="input" />
        </Field>
        <Field label="Display name">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. AI Trends" className="input" />
        </Field>
        <Field label="Color">
          <select value={newColor} onChange={e => setNewColor(e.target.value)} className="input">
            {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <button onClick={async () => {
          if (!newSlug || !newName) return toast.error("Slug and name required");
          try {
            await addCategory({ slug: newSlug, name: newName, color: newColor });
            setNewSlug(""); setNewName(""); setNewColor("from-emerald-400 to-teal-500");
            toast.success("Category added");
          } catch { toast.error("Failed to add category"); }
        }} className="rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground h-[38px]">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2">
        {categories.map(c => (
          <div key={c.slug} className="flex items-center justify-between rounded-xl border bg-background px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`inline-block h-3 w-3 rounded-full bg-gradient-to-r ${c.color}`} />
              <span className="text-sm font-medium">{c.name}</span>
              <code className="text-xs text-muted-foreground">/{c.slug}</code>
            </div>
            <button onClick={async () => {
              try { await deleteCategory(c.slug); toast.success("Category removed"); } 
              catch { toast.error("Failed to remove"); }
            }} className="grid h-7 w-7 place-items-center rounded-md border hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <style>{`.input { width:100%; border-radius:0.75rem; border:1px solid var(--border); background:var(--background); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; } .input:focus { border-color: var(--brand); }`}</style>
    </div>
  );
}

function SubscribersTab() {
  const { subscribers } = useBlog() as any;
  const subList = Array.isArray(subscribers) ? subscribers : [];

  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold">Newsletter Registry</h2>
        <p className="text-xs text-muted-foreground">
          View all active platform subscribers ({subList.length}). Automated notifications are dispatched instantly on article releases.
        </p>
      </div>

      <div className="overflow-x-auto">
        {subList.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-2xl">
            No active subscribers registered in your system yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b pb-2">
                <th className="py-3 pr-4">Email Address</th>
                <th className="px-4 py-3">Subscription Date</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subList.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 pr-4 font-mono text-sm font-medium">{sub.email}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {sub.created_at ? format(new Date(sub.created_at), "MMMM d, yyyy · hh:mm a") : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

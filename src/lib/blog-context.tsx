import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Author, Branding, Comment, MediaItem, Post } from "./types";
import { seedAuthor, seedCategories } from "./seed-data";
import { api } from "./api";

// Only theme stays in localStorage (UI preference, not data)
const THEME_KEY = "blog:theme:v1";

export const defaultBranding: Branding = {
  siteTitle: "Ddumba.AI · Editorial on Production AI Infrastructure",
  metaTitle: "Ddumba.AI — Production AI Infrastructure Editorial",
  metaDescription: "Senior-engineer essays on vLLM, RAG, Kubernetes, inference cost optimization, and observability for production AI.",
  keywords: "AI infrastructure, vLLM, RAG, Kubernetes, LLM inference, MLOps, platform engineering",
  ogImage: "/profile.png",
  logo: "/profile.png",
  favicon: "/favicon.png",
};

interface BlogState {
  posts: Post[];
  authors: Author[];
  categories: typeof seedCategories;
  media: MediaItem[];
  comments: Comment[];
  currentAuthor: Author | null;
  theme: "dark" | "light";
  branding: Branding;
  loading: boolean;
  apiOnline: boolean;
  subscribers: Array<{ id: number; email: string; createdAt: string }>;
}

interface BlogActions {
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerAuthor: (a: Omit<Author, "id">) => Promise<void>;
  updateAuthor: (id: string, patch: Partial<Author>) => Promise<void>;

  createPost: (p: Omit<Post, "id">) => Promise<Post>;
  updatePost: (id: string, patch: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  togglePublish: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  toggleTrending: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  schedulePost: (id: string, scheduledFor: string) => Promise<void>;

  addComment: (postId: string, text: string, author: string, parentId?: string | null) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  likeComment: (id: string, by: string) => Promise<void>;

  addMedia: (file: File) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;

  updateBranding: (patch: Partial<Branding>) => Promise<void>;
  resetBranding: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  refreshComments: () => Promise<void>;
  addCategory: (data: { slug: string; name: string; color: string }) => Promise<void>;
  deleteCategory: (slug: string) => Promise<void>;
  subscribeNewsletter: (email: string) => Promise<void>;
  refreshSubscribers: () => Promise<void>;
}

type Ctx = BlogState & BlogActions;
const BlogContext = createContext<Ctx | null>(null);

const loadTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  try {
    return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark";
  } catch { return "dark"; }
};
const saveTheme = (t: "dark" | "light") => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(THEME_KEY, t); } catch { /* noop */ }
};

export function BlogProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Author[]>([seedAuthor]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentAuthor, setCurrentAuthor] = useState<Author | null>(null);
  const [theme, setThemeState] = useState<"dark" | "light">(loadTheme());
  const [categories, setCategories] = useState(seedCategories);
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [subscribers, setSubscribers] = useState<Array<{ id: number; email: string; createdAt: string }>>([]);

  const postsRef = useRef(posts);
  postsRef.current = posts;

  const fetchSubscribersList = async () => {
    try {
      const data = await api.getSubscribers();
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("⚠️ Failed to parse backend subscribers array query:", e);
      setSubscribers([]);
    }
  };

  // ============================================
  // INITIAL LOAD — Fetch from API, fallback to seeds
  // ============================================
  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      let isSessionAuthed = false;

      const token = localStorage.getItem("blog:session:v1");
      if (token) {
        try {
          const me = await api.getMe();
          if (me) {
            setCurrentAuthor(me);
            isSessionAuthed = true;
          }
        } catch {
          localStorage.removeItem("blog:session:v1");
        }
      }

      try {
        const [postsRes, authorsRes, mediaRes, brandingRes, categoriesRes, commentsRes, subscribersRes] = await Promise.allSettled([
          api.getPosts({}).catch(() => ({ posts: [], pagination: { total: 0 } })),
          api.getAuthors().catch(() => [seedAuthor]),
          api.getMedia().catch(() => []),
          api.getBranding().catch(() => defaultBranding),
          api.getCategories().catch(() => seedCategories),
          api.getAllComments().catch(() => []),
          isSessionAuthed ? api.getSubscribers().catch(() => []) : Promise.resolve([]),
        ]);

        const fetchedPosts = postsRes.status === "fulfilled" ? (postsRes.value.posts || postsRes.value || []) : [];
        const fetchedAuthors = authorsRes.status === "fulfilled" ? authorsRes.value : [seedAuthor];
        const fetchedMedia = mediaRes.status === "fulfilled" ? mediaRes.value : [];
        const fetchedBranding = brandingRes.status === "fulfilled" ? brandingRes.value : defaultBranding;
        const fetchedCategories = categoriesRes.status === "fulfilled" ? categoriesRes.value : seedCategories;
        const fetchedComments = commentsRes.status === "fulfilled" ? commentsRes.value : [];
        const fetchedSubscribers = subscribersRes.status === "fulfilled" ? subscribersRes.value : [];

        setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
        setAuthors(Array.isArray(fetchedAuthors) && fetchedAuthors.length > 0 ? fetchedAuthors : [seedAuthor]);
        setMedia(Array.isArray(fetchedMedia) ? fetchedMedia : []);
        setBranding({ ...defaultBranding, ...fetchedBranding });
        setCategories(Array.isArray(fetchedCategories) && fetchedCategories.length > 0 ? fetchedCategories : seedCategories);
        setComments(Array.isArray(fetchedComments) ? fetchedComments : []);
        setSubscribers(Array.isArray(fetchedSubscribers) ? fetchedSubscribers : []);
        setApiOnline(true);
      } catch {
        setPosts([]);
        setAuthors([seedAuthor]);
        setSubscribers([]);
        setApiOnline(false);
      }

      setLoading(false);
      setHydrated(true);
    }
    bootstrap();
  }, []);

  // ============================================
  // THEME — stays in localStorage (UI preference)
  // ============================================
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    saveTheme(theme);
  }, [theme, hydrated]);

  // ============================================
  // BRANDING — apply to document head
  // ============================================
  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    document.title = branding.metaTitle || branding.siteTitle;
    const setMeta = (sel: string, attr: string, name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${sel}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("name", "name", "description", branding.metaDescription);
    setMeta("name", "name", "keywords", branding.keywords);
    setMeta("property", "property", "og:title", branding.metaTitle);
    setMeta("property", "property", "og:description", branding.metaDescription);
    if (branding.ogImage) setMeta("property", "property", "og:image", branding.ogImage);
    if (branding.favicon) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = branding.favicon;
    }
  }, [branding, hydrated]);

  // ============================================
  // AUTO-PUBLISH — check scheduled posts every 15s
  // ============================================
  useEffect(() => {
    if (!hydrated) return;
    const tick = () => {
      const t = Date.now();
      let changed = false;
      const next = postsRef.current.map(p => {
        if (p.status === "scheduled" && p.scheduledFor && new Date(p.scheduledFor).getTime() <= t) {
          changed = true;
          return { ...p, status: "published" as const, publishedAt: new Date().toISOString(), scheduledFor: null };
        }
        return p;
      });
      if (changed) setPosts(next);
    };
    tick();
    const i = window.setInterval(tick, 15000);
    return () => window.clearInterval(i);
  }, [hydrated]);

  // ============================================
  // ALL ACTIONS — calling real API
  // ============================================
  const value: Ctx = useMemo(() => ({
    posts, authors, media, comments, currentAuthor, theme, branding, loading, apiOnline,
    categories, subscribers,

    setTheme: (t) => setThemeState(t),
    toggleTheme: () => setThemeState(t => (t === "dark" ? "light" : "dark")),

    // ── AUTH ──
    login: async (username, password) => {
      const data = await api.login(username, password);
      setCurrentAuthor(data.author);
      try {
        const dataSub = await api.getSubscribers();
        setSubscribers(Array.isArray(dataSub) ? dataSub : []);
      } catch { /* Suppress unauthenticated failures gracefully */ }
      return true;
    },
    logout: () => {
      api.logout();
      setCurrentAuthor(null);
      setSubscribers([]);
    },
    registerAuthor: async (a) => {
      await api.register({ ...a, id: a.username });
      const authors = await api.getAuthors();
      setAuthors(authors);
    },
    updateAuthor: async (aid, patch) => {
      await api.updateAuthor(aid, patch);
      setAuthors(prev => prev.map(a => a.id === aid ? { ...a, ...patch } : a));
      if (currentAuthor?.id === aid) setCurrentAuthor(c => c ? { ...c, ...patch } : c);
    },

    // ── POSTS ──
    createPost: async (p) => {
      const created = await api.createPost(p);
      setPosts(prev => [created, ...prev]);
      return created;
    },
    updatePost: async (pid, patch) => {
      await api.updatePost(pid, patch);
      setPosts(prev => prev.map(p => p.id === pid ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p));
    },
    deletePost: async (pid) => {
      await api.deletePost(pid);
      setPosts(prev => prev.filter(p => p.id !== pid));
    },
    togglePublish: async (pid) => {
      const updated = await api.togglePublish(pid);
      setPosts(prev => prev.map(p => p.id === pid ? updated : p));
    },
    toggleFeatured: async (pid) => {
      const updated = await api.toggleFeatured(pid);
      setPosts(prev => prev.map(p => p.id === pid ? updated : p));
    },
    toggleTrending: async (pid) => {
      const updated = await api.toggleTrending(pid);
      setPosts(prev => prev.map(p => p.id === pid ? updated : p));
    },
    incrementViews: async (pid) => {
      await api.incrementViews(pid);
      setPosts(prev => prev.map(p => p.id === pid ? { ...p, views: p.views + 1 } : p));
    },
    schedulePost: async (pid, scheduledFor) => {
      await api.schedulePost(pid, scheduledFor);
      setPosts(prev => prev.map(p => p.id === pid ? { ...p, status: "scheduled", scheduledFor, updatedAt: new Date().toISOString() } : p));
    },

    // ── COMMENTS ──
    addComment: async (postId, text, author, parentId = null) => {
      const newComment = await api.addComment({ postId, text, author, parentId });
      setComments(prev => [...prev, newComment]);
    },
    deleteComment: async (cid) => {
      await api.deleteComment(cid);
      setComments(prev => prev.filter(c => c.id !== cid && c.parentId !== cid));
    },
    likeComment: async (cid, by) => {
      const result = await api.likeComment(cid, by);
      setComments(prev => prev.map(c => {
        if (c.id !== cid) return c;
        return { ...c, likes: result.likes, likedBy: result.likedBy || [] };
      }));
    },

    // ── MEDIA ──
    addMedia: async (file: File) => {
      const item = await api.uploadMedia(file);
      setMedia(prev => [item, ...prev]);
      return item;
    },
    deleteMedia: async (mid) => {
      await api.deleteMedia(mid);
      setMedia(prev => prev.filter(m => m.id !== mid));
    },

    // ── BRANDING ──
    updateBranding: async (patch) => {
      await api.updateBranding(patch);
      setBranding(b => ({ ...b, ...patch }));
    },
    resetBranding: async () => {
      await api.resetBranding();
      setBranding(defaultBranding);
    },

    // ── REFRESH ──
    refreshPosts: async () => {
      const data = await api.getPosts({ status: "published" });
      setPosts(data.posts || data || []);
    },
    refreshComments: async () => {
      // Handled contextually per layout request
    },

    // ── CATEGORIES ──
    addCategory: async (data: { slug: string; name: string; color: string }) => {
      const created = await api.createCategory(data);
      setCategories(prev => [...prev, created]);
    },
    deleteCategory: async (slug: string) => {
      await api.deleteCategory(slug);
      setCategories(prev => prev.filter(c => c.slug !== slug));
    },

    // ── NEWSLETTER SUBSCRIBERS ──
    subscribeNewsletter: async (email: string) => {
      const res = await api.subscribe(email);
      if (res && res.id) {
        setSubscribers(prev => [res, ...prev]);
      } else {
        await fetchSubscribersList();
      }
    },
    refreshSubscribers: fetchSubscribersList,
  }), [posts, authors, media, comments, currentAuthor, theme, branding, loading, apiOnline, categories, subscribers]);

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used inside BlogProvider");
  return ctx;
}

export function usePostBySlug(slug: string) {
  const { posts } = useBlog();
  return posts.find(p => p.slug === slug);
}
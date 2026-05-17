// ============================================
// API HELPER — Replaces all localStorage calls
// Base URL from .env (VITE_API_URL)
// ============================================

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("blog:session:v1");
}

function setToken(token: string) {
  localStorage.setItem("blog:session:v1", token);
}

function clearToken() {
  localStorage.removeItem("blog:session:v1");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ============================================
// AUTH
// ============================================
export const api = {
  login: async (username: string, password: string) => {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.access_token);
    return data;
  },

  logout: () => clearToken(),

  getMe: () => request("/api/auth/me"),

  register: (author: any) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(author),
    }),

  // ============================================
  // AUTHORS
  // ============================================
  getAuthors: () => request("/api/authors/"),

  getAuthor: (id: string) => request(`/api/authors/${id}`),

  updateAuthor: (id: string, data: any) =>
    request(`/api/authors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ============================================
  // POSTS
  // ============================================
  getPosts: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/posts/${qs ? "?" + qs : ""}`);
  },

  getPost: (slug: string) => request(`/api/posts/${slug}`),

  createPost: (data: any) =>
    request("/api/posts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updatePost: (id: string, data: any) =>
    request(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deletePost: (id: string) =>
    request(`/api/posts/${id}`, { method: "DELETE" }),

  togglePublish: (id: string) =>
    request(`/api/posts/${id}/publish`, { method: "PATCH" }),

  toggleFeatured: (id: string) =>
    request(`/api/posts/${id}/featured`, { method: "PATCH" }),

  toggleTrending: (id: string) =>
    request(`/api/posts/${id}/trending`, { method: "PATCH" }),

  incrementViews: (id: string) =>
    request(`/api/posts/${id}/view`, { method: "POST" }),

  schedulePost: (id: string, scheduledFor: string) =>
    request(`/api/posts/${id}/schedule?scheduled_for=${encodeURIComponent(scheduledFor)}`, {
      method: "PATCH",
    }),

  // ============================================
  // COMMENTS
  // ============================================
  getComments: (postId: string) => request(`/api/comments/post/${postId}`),

  addComment: (data: { postId: string; author: string; text: string; parentId?: string | null }) =>
    request("/api/comments/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAllComments: () => request("/api/comments/"),

  deleteComment: (id: string) =>
    request(`/api/comments/${id}`, { method: "DELETE" }),

  likeComment: (id: string, by: string) =>
    request(`/api/comments/${id}/like?by=${encodeURIComponent(by)}`, { method: "POST" }),


  // ============================================
  // MEDIA
  // ============================================
  uploadMedia: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE}/api/media/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  getMedia: () => request("/api/media/"),

  deleteMedia: (id: string) =>
    request(`/api/media/${id}`, { method: "DELETE" }),

  // ============================================
  // BRANDING
  // ============================================
  getBranding: () => request("/api/branding/"),

  updateBranding: (data: any) =>
    request("/api/branding/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  resetBranding: () =>
    request("/api/branding/reset", { method: "POST" }),

    // ============================================
  // CATEGORIES
  // ============================================
  getCategories: () => request("/api/categories/"),

  createCategory: (data: { slug: string; name: string; color: string }) =>
    request("/api/categories/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteCategory: (slug: string) =>
    request(`/api/categories/${slug}`, { method: "DELETE" }),

  // ============================================
  // SUBSCRIBERS
  // ============================================
  getSubscribers: () => request("/api/subscribe/"),
  
  subscribe: (email: string) =>
    request("/api/subscribe/", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  
};
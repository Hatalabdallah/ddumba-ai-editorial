export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; language: string; code: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "callout"; tone: "info" | "warn" | "success"; text: string }
  | { type: "section"; heading: string; body: string };

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null;
  author: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface SeoMeta {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface Branding {
  siteTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  logo: string;
  favicon: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string; // base64 dataURL or empty
  coverGradient?: string;
  category: string;
  tags: string[];
  authorId: string;
  publishedAt: string;
  scheduledFor?: string | null;
  updatedAt?: string;
  readingTime: number;
  status: "draft" | "published" | "scheduled";
  featured: boolean;
  trending: boolean;
  views: number;
  seo: SeoMeta;
  content: ContentBlock[];
  comments: Comment[];
}

export interface Category {
  slug: string;
  name: string;
  color: string;
}

export interface AuthorContacts {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  whatsapp?: string;
  companyWebsite?: string;
  personalWebsite?: string;
  phone?: string;
  email?: string;
}

export interface Author {
  id: string;
  username: string;
  password: string;
  name: string;
  fullName?: string;
  role: string;
  tagline?: string;
  location?: string;
  avatar: string;
  bio: string;
  challenges: string[];
  focusAreas: string[];
  techStack: string[];
  contacts: AuthorContacts;
}

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
  dataUrl: string;
  size: number;
  uploadedAt: string;
}

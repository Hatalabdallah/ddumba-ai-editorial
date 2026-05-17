import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail } from "lucide-react";
import { useBlog } from "@/lib/blog-context";

export function Footer() {
  const { categories, authors, branding } = useBlog();
  const a = authors[0];
  return (
    <footer className="mt-24 border-t bg-card/30">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-brand shadow-brand ring-1 ring-brand/30">
                <img src={branding.logo || "/profile.png"} alt="Ddumba.AI" className="h-full w-full object-cover" />
              </div>
              <span className="font-display text-lg font-bold">Ddumba<span className="text-gradient-brand">.AI</span></span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Engineering essays on production AI infrastructure, RAG systems,
              inference optimization, and the platforms that make LLMs viable at scale.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {a?.contacts.linkedin && (
                <a href={a.contacts.linkedin} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl border hover:bg-muted">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {a?.contacts.email && (
                <a href={`mailto:${a.contacts.email}`} className="grid h-9 w-9 place-items-center rounded-xl border hover:bg-muted">
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {a?.contacts.personalWebsite && (
                <a href={a.contacts.personalWebsite} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl border hover:bg-muted">
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Categories</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {categories.slice(0, 6).map(c => (
                <li key={c.slug}>
                  <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-foreground">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li><Link to="/about-author" className="hover:text-foreground">About Author</Link></li>
              <li><Link to="/search" search={{ q: "" }} className="hover:text-foreground">Search</Link></li>
              <li><Link to="/admin" className="hover:text-foreground">Author Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Ddumba.AI Editorial. Crafted for engineers building production AI.</p>
          <p className="font-mono">v1.0 · frontend-only</p>
        </div>
      </div>
    </footer>
  );
}

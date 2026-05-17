import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useBlog } from "@/lib/blog-context";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { posts } = useBlog();
  const [query, setQuery] = useState(q);

  const filtered = posts.filter(p => {
    if (p.status !== "published") return false;
    const t = (q || "").toLowerCase();
    if (!t) return true;
    return p.title.toLowerCase().includes(t)
      || p.excerpt.toLowerCase().includes(t)
      || p.tags.some(tag => tag.toLowerCase().includes(t))
      || p.category.toLowerCase().includes(t);
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Search</h1>
        <form onSubmit={e => { e.preventDefault(); navigate({ search: { q: query } }); }}
          className="mt-4 flex items-center gap-2 rounded-2xl border bg-card p-2">
          <SearchIcon className="ml-2 h-4 w-4 text-muted-foreground" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, tags, categories…"
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none" />
          <button className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground">Search</button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          {q ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${q}"` : "Type to search across the editorial."}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => <ArticleCard key={p.id} post={p} index={i} />)}
        </div>
        {q && filtered.length === 0 && (
          <p className="mt-10 rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
            No articles matched. Try a broader query.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}

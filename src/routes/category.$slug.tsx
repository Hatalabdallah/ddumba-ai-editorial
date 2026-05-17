import { createFileRoute, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useBlog } from "@/lib/blog-context";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { posts, categories } = useBlog();
  const cat = categories.find(c => c.slug === slug);
  if (!cat) throw notFound();
  const list = posts.filter(p => p.status === "published" && p.category === slug);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8">
        <div className="mb-8 rounded-3xl border bg-gradient-to-br from-card to-muted/30 p-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Category</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">
            <span className={`bg-gradient-to-r ${cat.color} bg-clip-text text-transparent`}>{cat.name}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{list.length} article{list.length === 1 ? "" : "s"}</p>
        </div>

        {list.length === 0 ? (
          <p className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">No articles in this category.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => <ArticleCard key={p.id} post={p} index={i} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

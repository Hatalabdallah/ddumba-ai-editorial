import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroFeatured } from "@/components/HeroFeatured";
import { ArticleCard } from "@/components/ArticleCard";
import { TrendingSidebar } from "@/components/TrendingSidebar";
import { useBlog } from "@/lib/blog-context";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ddumba.AI — Production AI Infrastructure Editorial" },
      { name: "description", content: "Senior-engineer essays on vLLM, RAG, Kubernetes, inference cost optimization, and observability for production AI." },
      { property: "og:title", content: "Ddumba.AI Editorial" },
      { property: "og:description", content: "Production AI infrastructure essays." },
    ],
  }),
  component: HomePage,
});

const PAGE_SIZE = 6;

function HomePage() {
  const { posts, categories } = useBlog();
  const published = posts.filter(p => p.status === "published");
  const featured = published.find(p => p.featured) ?? published[0];
  const trending = published.filter(p => p.trending);
  const [page, setPage] = useState(1);
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const list = published.filter(p => p.id !== featured?.id);
    if (activeCat === "all") return list;
    return list.filter(p => p.category === activeCat);
  }, [published, featured, activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3 text-brand" /> Engineering essays · weekly drops
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
              Production AI is a <span className="text-gradient-brand">distributed system</span>.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Deep editorial on the platforms, pipelines, and patterns that keep LLMs alive in production.
            </p>
          </div>
        </motion.div>

        {featured && <HeroFeatured post={featured} />}

        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Recent articles</h2>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              <button onClick={() => { setActiveCat("all"); setPage(1); }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${activeCat === "all" ? "border-brand bg-brand/10 text-brand" : "hover:bg-muted"}`}>
                All
              </button>
              {categories.map(c => (
                <button key={c.slug} onClick={() => { setActiveCat(c.slug); setPage(1); }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${activeCat === c.slug ? "border-brand bg-brand/10 text-brand" : "hover:bg-muted"}`}>
                  {c.name}
                </button>
              ))}
            </div>

            {paged.length === 0 ? (
              <p className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
                No articles in this category yet.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {paged.map((p, i) => <ArticleCard key={p.id} post={p} index={i} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="grid h-10 w-10 place-items-center rounded-xl border disabled:opacity-40 hover:bg-muted">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-medium ${page === i + 1 ? "bg-gradient-brand text-brand-foreground" : "hover:bg-muted"}`}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="grid h-10 w-10 place-items-center rounded-xl border disabled:opacity-40 hover:bg-muted">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <TrendingSidebar posts={trending.length > 0 ? trending : published} />
        </section>

        <section className="mt-20 rounded-3xl border bg-gradient-to-br from-card via-card to-muted/30 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex rounded-full border bg-background px-3 py-1 text-xs">About the author</div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">Built by an AI Platform Engineer.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                I sit at the intersection of platform reliability and AI system design — turning experimental AI
                into enterprise-grade infrastructure that is resilient, observable, and profitable.
              </p>
              <Link to="/about-author" className="mt-5 inline-flex rounded-2xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand">
                Read the bio →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["vLLM", "Kubernetes", "AWS", "RAG", "Terraform", "ArgoCD", "Pinecone", "Kafka", "Grafana"].map(t => (
                <div key={t} className="rounded-2xl border bg-background px-3 py-3 text-center text-xs font-semibold">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

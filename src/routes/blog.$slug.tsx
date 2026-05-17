import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RichContent } from "@/components/RichContent";
import { ShareButtons } from "@/components/ShareButtons";
import { Comments } from "@/components/Comments";
import { ArticleCard } from "@/components/ArticleCard";
import { useBlog, usePostBySlug } from "@/lib/blog-context";
import { ArrowLeft, Clock, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export const Route = createFileRoute("/blog/$slug")({
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const post = usePostBySlug(slug);
  const { categories, posts, incrementViews, authors } = useBlog();
  const author = authors[0];

  useEffect(() => {
    if (post) incrementViews(post.id);
    if (post) document.title = `${post.title} · Ddumba.AI`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  if (!post || post.status !== "published") throw notFound();

  const cat = categories.find(c => c.slug === post.category);
  const related = posts.filter(p => p.id !== post.id && p.status === "published" && p.category === post.category).slice(0, 3);
  const url = `/blog/${post.slug}`;

  return (
    <div className="min-h-screen">
      <Navbar />

      <article className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to articles
        </Link>

        <header className="mx-auto mt-6 max-w-3xl text-center">
          <div className="mb-4 flex justify-center gap-2">
            <span className={`rounded-full bg-gradient-to-r ${cat?.color} px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black`}>
              {cat?.name}
            </span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            {post.title}
          </motion.h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readingTime} min read</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {post.views.toLocaleString()} views</span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            {author.avatar ? (
              <img 
                src={author.avatar.startsWith('http') || author.avatar.startsWith('/') ? author.avatar : `/${author.avatar}`} 
                alt={author.name} 
                className="h-11 w-11 object-cover rounded-2xl border"
              />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-brand text-sm font-bold text-brand-foreground">
                {author.name.split(" ").map(s => s[0]).join("")}
              </div>
            )}
            <div className="text-left">
              <Link to="/about-author" className="block text-sm font-semibold hover:text-brand">{author.name}</Link>
              <div className="text-xs text-muted-foreground">{author.role}</div>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-10 aspect-[16/8] max-w-5xl overflow-hidden rounded-3xl border"
          style={{ background: post.coverImage ? undefined : post.coverGradient }}>
          {post.coverImage && <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />}
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[60px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <ShareButtons url={url} title={post.title} vertical />
            </div>
          </div>
          <div className="min-w-0">
            <RichContent blocks={post.content} />

            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map(t => (
                <span key={t} className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">#{t}</span>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <h3 className="mb-3 text-sm font-semibold">Share this article</h3>
              <ShareButtons url={url} title={post.title} />
            </div>

            <div className="mt-12 rounded-3xl border bg-gradient-to-br from-card to-muted/40 p-7">
              <div className="flex flex-wrap items-center gap-5">
                {author.avatar ? (
                  <img 
                    src={author.avatar.startsWith('http') || author.avatar.startsWith('/') ? author.avatar : `/${author.avatar}`} 
                    alt={author.name} 
                    className="h-16 w-16 shrink-0 object-cover rounded-2xl border"
                  />
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xl font-bold text-brand-foreground">
                    {author.name.split(" ").map(s => s[0]).join("")}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-lg font-bold">{author.name}</h4>
                  <p className="text-sm text-muted-foreground">{author.tagline}</p>
                </div>
                <Link to="/about-author" className="rounded-2xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand">
                  View profile
                </Link>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-16">
                <h2 className="mb-6 font-display text-2xl font-bold">Related articles</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((p, i) => <ArticleCard key={p.id} post={p} index={i} />)}
                </div>
              </section>
            )}

            <Comments postId={post.id} />
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}

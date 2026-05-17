import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import type { Post } from "@/lib/types";
import { useBlog } from "@/lib/blog-context";
import { format } from "date-fns";

function formatViews(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export function ArticleCard({ post, index = 0, variant = "default" }: { post: Post; index?: number; variant?: "default" | "compact" }) {
  const { categories } = useBlog();
  const cat = categories.find(c => c.slug === post.category);

  if (variant === "compact") {
    return (
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block">
        <div className="flex gap-3">
          <div className="aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl"
            style={{ background: post.coverImage ? undefined : post.coverGradient }}>
            {post.coverImage && <img src={post.coverImage} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{cat?.name}</div>
            <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">{post.title}</h4>
            <div className="mt-1 text-xs text-muted-foreground">{post.readingTime} min read</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group rounded-3xl border bg-card p-3 transition-shadow hover:shadow-card-premium"
    >
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl"
          style={{ background: post.coverImage ? undefined : post.coverGradient }}>
          {post.coverImage && <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
          <div className="absolute left-3 top-3">
            <span className={`rounded-full bg-gradient-to-r ${cat?.color} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black`}>{cat?.name}</span>
          </div>
        </div>
        <div className="px-3 pb-3 pt-4">
          <h3 className="font-display text-xl font-bold leading-tight transition-colors group-hover:text-brand">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingTime} min</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatViews(post.views)}</span>
            <span className="ml-auto">{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

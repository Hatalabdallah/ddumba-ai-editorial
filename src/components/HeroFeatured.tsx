import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import type { Post } from "@/lib/types";
import { useBlog } from "@/lib/blog-context";

export function HeroFeatured({ post }: { post: Post }) {
  const { categories } = useBlog();
  const cat = categories.find(c => c.slug === post.category);

  return (
    <motion.section
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border bg-card"
    >
      <div className="bg-radial-brand absolute inset-0" />
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="relative grid gap-0 lg:grid-cols-5">
        <div className="relative lg:col-span-3">
          <div className="aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full"
            style={{ background: post.coverImage ? undefined : post.coverGradient }}>
            {post.coverImage && <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent lg:bg-gradient-to-r" />
        </div>
        <div className="relative flex flex-col justify-center gap-5 p-7 md:p-10 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand">
              <TrendingUp className="h-3 w-3" /> Featured
            </span>
            <span className={`rounded-full bg-gradient-to-r ${cat?.color} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black`}>{cat?.name}</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold leading-[1.1] md:text-4xl lg:text-[2.6rem]">
            {post.title}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingTime} min read</span>
            <span>·</span>
            <span>by Ddumba AK</span>
          </div>
          <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-brand">
            Read article <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.section>
  );
}

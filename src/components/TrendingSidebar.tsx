import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, Loader2 } from "lucide-react";
import type { Post } from "@/lib/types";
import { useBlog } from "@/lib/blog-context";

export function TrendingSidebar({ posts }: { posts: Post[] }) {
  const { subscribeNewsletter } = useBlog();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      await subscribeNewsletter(email.trim());
      setMessage({ type: "success", text: "Welcome aboard! Subscribed successfully." });
      setEmail("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Subscription failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="sticky top-24 hidden h-fit space-y-4 lg:block">
      <div className="rounded-3xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-brand">
            <Flame className="h-4 w-4 text-brand-foreground" />
          </div>
          <h3 className="font-display text-lg font-bold">Trending</h3>
        </div>
        <ol className="space-y-4">
          {posts.slice(0, 6).map((p, i) => (
            <li key={p.id} className="group">
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="flex gap-3">
                <span className="font-display text-2xl font-bold text-muted-foreground/40 group-hover:text-gradient-brand">
                  0{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">{p.title}</h4>
                  <div className="mt-1 text-xs text-muted-foreground">{p.readingTime} min read</div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-3xl border bg-gradient-to-br from-card to-muted/40 p-5">
        <h3 className="font-display text-base font-bold">Subscribe</h3>
        <p className="mt-1 text-xs text-muted-foreground">Premium AI infra essays. No spam.</p>
        <form onSubmit={handleSubscribe} className="mt-3 space-y-2">
          <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-brand disabled:opacity-60" />
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-3 py-2 text-sm font-semibold text-brand-foreground shadow-brand disabled:opacity-70 active:scale-[0.99] transition-transform">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
          </button>
        </form>
        {message && (
          <p className={`mt-2 text-xs font-medium ${message.type === "success" ? "text-emerald-500" : "text-destructive"}`}>
            {message.text}
          </p>
        )}
      </div>
    </aside>
  );
}
import { useMemo, useState } from "react";
import { Heart, Reply, Trash2, Send } from "lucide-react";
import { useBlog } from "@/lib/blog-context";
import { formatDistanceToNow } from "date-fns";
import type { Comment } from "@/lib/types";

function getDeviceId() {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem("blog:device");
  if (!id) { id = "u_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("blog:device", id); }
  return id;
}

export function Comments({ postId }: { postId: string }) {
  const { comments, addComment, deleteComment, likeComment, currentAuthor } = useBlog();
  const me = getDeviceId();
  const myName = currentAuthor?.name ?? (typeof window !== "undefined" ? localStorage.getItem("blog:name") || "" : "");
  const [name, setName] = useState(myName);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const postComments = useMemo(() => comments.filter(c => c.postId === postId), [comments, postId]);
  const top = postComments.filter(c => !c.parentId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const repliesOf = (id: string) => postComments.filter(c => c.parentId === id);

  const submit = async () => {
    if (!text.trim() || !name.trim()) return;
    localStorage.setItem("blog:name", name);
    try {
      await addComment(postId, text.trim(), name.trim());
      setText("");
    } catch {
      // silently fail — comment will show on refresh
    }
  };
  const submitReply = async (parent: string) => {
    if (!replyText.trim() || !name.trim()) return;
    localStorage.setItem("blog:name", name);
    try {
      await addComment(postId, replyText.trim(), name.trim(), parent);
      setReplyText(""); setReplyTo(null);
    } catch {
      // silently fail
    }
  };

  const renderComment = (c: Comment, depth = 0) => {
    const liked = c.likedBy.includes(me);
    const isMod = !!currentAuthor;
    return (
      <div key={c.id} className={`group rounded-2xl border bg-card p-4 ${depth > 0 ? "ml-6 mt-3" : ""}`}>
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-sm font-bold text-brand-foreground">
            {c.author.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
              <span className="font-semibold">{c.author}</span>
              <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="mt-1.5 text-sm text-foreground/90">{c.text}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <button onClick={async () => { try { await likeComment(c.id, me); } catch { /* */ } }} className={`inline-flex items-center gap-1 hover:text-brand ${liked ? "text-brand" : ""}`}>
                <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} /> {c.likes}
              </button>
              {depth === 0 && (
                <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="inline-flex items-center gap-1 hover:text-brand">
                  <Reply className="h-3.5 w-3.5" /> Reply
                </button>
              )}
              {isMod && (
                <button onClick={async () => { try { await deleteComment(c.id); } catch { /* */ } }} className="inline-flex items-center gap-1 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}
            </div>

            {replyTo === c.id && (
              <div className="mt-3 flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
                <button onClick={() => submitReply(c.id)} className="rounded-xl bg-gradient-brand px-3 py-2 text-sm font-semibold text-brand-foreground">
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
        {repliesOf(c.id).map(r => renderComment(r, depth + 1))}
      </div>
    );
  };

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold">Comments <span className="text-muted-foreground">({postComments.length})</span></h2>
      <div className="mt-5 rounded-3xl border bg-card p-5">
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand" />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your thoughts…" rows={3}
            className="w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand" />
          <div className="flex justify-end">
            <button onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand">
              <Send className="h-3.5 w-3.5" /> Post comment
            </button>
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {top.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">Be the first to comment.</p>
        ) : top.map(c => renderComment(c))}
      </div>
    </section>
  );
}

import type { ContentBlock } from "@/lib/types";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";

export function RichContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-editorial">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "paragraph": return <p key={i}>{b.text}</p>;
          case "heading": {
            const Tag = (`h${b.level}`) as unknown as React.ElementType;
            return <Tag key={i}>{b.text}</Tag>;
          }
          case "list":
            return b.ordered
              ? <ol key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ol>
              : <ul key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
          case "quote":
            return (
              <blockquote key={i}>
                "{b.text}"
                {b.cite && <footer className="mt-2 not-italic text-sm">— {b.cite}</footer>}
              </blockquote>
            );
          case "code":
            return (
              <pre key={i}><code>{b.code}</code></pre>
            );
          case "image":
            return (
              <figure key={i}>
                <img src={b.src} alt={b.alt ?? ""} />
                {b.caption && <figcaption className="text-center text-sm text-muted-foreground">{b.caption}</figcaption>}
              </figure>
            );
          case "video":
            return (
              <video key={i} src={b.src} poster={b.poster} controls className="my-6 w-full rounded-2xl" />
            );
          case "callout": {
            const Icon = b.tone === "warn" ? AlertTriangle : b.tone === "success" ? CheckCircle2 : Info;
            const color = b.tone === "warn" ? "border-amber-500/40 bg-amber-500/10" : b.tone === "success" ? "border-emerald-500/40 bg-emerald-500/10" : "border-brand/40 bg-brand/10";
            return (
              <div key={i} className={`my-6 flex gap-3 rounded-2xl border p-4 ${color}`}>
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="m-0 text-sm">{b.text}</p>
              </div>
            );
          }
          case "section":
            return (
              <section key={i}>
                <h2>{b.heading}</h2>
                <p>{b.body}</p>
              </section>
            );
          default: return null;
        }
      })}
    </div>
  );
}

import { useState } from "react";
import type { ContentBlock } from "@/lib/types";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code, ImagePlus, Trash2, Plus, GripVertical } from "lucide-react";
import { MediaUpload } from "./MediaUpload";

interface Props { value: ContentBlock[]; onChange: (b: ContentBlock[]) => void; }

export function RichEditor({ value, onChange }: Props) {
  const [showAdd, setShowAdd] = useState<number | null>(null);

  const update = (i: number, patch: Partial<ContentBlock>) => {
    const next = value.slice();
    next[i] = { ...next[i], ...patch } as ContentBlock;
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= value.length) return;
    const next = value.slice(); [next[i], next[j]] = [next[j], next[i]]; onChange(next);
  };
  const insert = (i: number, block: ContentBlock) => {
    const next = value.slice(); next.splice(i + 1, 0, block); onChange(next); setShowAdd(null);
  };

  const blockTypes = [
    { type: "paragraph", label: "Paragraph", Icon: Bold, make: (): ContentBlock => ({ type: "paragraph", text: "" }) },
    { type: "h1", label: "Heading 1", Icon: Heading1, make: (): ContentBlock => ({ type: "heading", level: 1, text: "" }) },
    { type: "h2", label: "Heading 2", Icon: Heading2, make: (): ContentBlock => ({ type: "heading", level: 2, text: "" }) },
    { type: "ul", label: "Bullet list", Icon: List, make: (): ContentBlock => ({ type: "list", ordered: false, items: [""] }) },
    { type: "ol", label: "Numbered list", Icon: ListOrdered, make: (): ContentBlock => ({ type: "list", ordered: true, items: [""] }) },
    { type: "quote", label: "Quote", Icon: Quote, make: (): ContentBlock => ({ type: "quote", text: "" }) },
    { type: "code", label: "Code", Icon: Code, make: (): ContentBlock => ({ type: "code", language: "ts", code: "" }) },
    { type: "image", label: "Image", Icon: ImagePlus, make: (): ContentBlock => ({ type: "image", src: "" }) },
  ];

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <button onClick={() => onChange([{ type: "paragraph", text: "" }])}
          className="w-full rounded-2xl border-2 border-dashed py-6 text-sm text-muted-foreground hover:border-brand/50 hover:text-foreground">
          + Add your first block
        </button>
      )}
      {value.map((b, i) => (
        <div key={i} className="group relative rounded-2xl border bg-card p-4">
          <div className="absolute -left-9 top-1/2 hidden -translate-y-1/2 flex-col gap-1 opacity-0 transition group-hover:opacity-100 md:flex">
            <button onClick={() => move(i, -1)} className="grid h-6 w-6 place-items-center rounded-md hover:bg-muted"><GripVertical className="h-3 w-3" /></button>
          </div>
          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button onClick={() => move(i, -1)} className="rounded-md border px-1.5 py-0.5 text-[10px]">↑</button>
            <button onClick={() => move(i, 1)} className="rounded-md border px-1.5 py-0.5 text-[10px]">↓</button>
            <button onClick={() => remove(i)} className="rounded-md border px-1.5 py-0.5 text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>

          <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{b.type}{b.type === "heading" ? ` h${b.level}` : ""}</div>

          {b.type === "paragraph" && (
            <textarea rows={3} value={b.text} onChange={e => update(i, { text: e.target.value })}
              placeholder="Write a paragraph…"
              className="w-full resize-none bg-transparent text-sm outline-none" />
          )}
          {b.type === "heading" && (
            <input value={b.text} onChange={e => update(i, { text: e.target.value })}
              placeholder={`Heading ${b.level}`}
              className="w-full bg-transparent font-display text-2xl font-bold outline-none" />
          )}
          {b.type === "list" && (
            <div className="space-y-1">
              {b.items.map((it, j) => (
                <div key={j} className="flex items-center gap-2">
                  <span className="text-muted-foreground">{b.ordered ? `${j + 1}.` : "•"}</span>
                  <input value={it} onChange={e => {
                    const items = b.items.slice(); items[j] = e.target.value;
                    update(i, { items });
                  }} className="flex-1 bg-transparent text-sm outline-none" placeholder="List item" />
                  <button onClick={() => update(i, { items: b.items.filter((_, k) => k !== j) })} className="text-xs text-muted-foreground hover:text-destructive">×</button>
                </div>
              ))}
              <button onClick={() => update(i, { items: [...b.items, ""] })} className="text-xs text-brand">+ add item</button>
            </div>
          )}
          {b.type === "quote" && (
            <>
              <textarea rows={2} value={b.text} onChange={e => update(i, { text: e.target.value })}
                placeholder="Quote text" className="w-full resize-none bg-transparent text-sm italic outline-none" />
              <input value={b.cite ?? ""} onChange={e => update(i, { cite: e.target.value })}
                placeholder="— citation" className="mt-1 w-full bg-transparent text-xs text-muted-foreground outline-none" />
            </>
          )}
          {b.type === "code" && (
            <>
              <input value={b.language} onChange={e => update(i, { language: e.target.value })}
                placeholder="language" className="mb-1 w-32 rounded-md border bg-background px-2 py-1 font-mono text-xs outline-none" />
              <textarea rows={5} value={b.code} onChange={e => update(i, { code: e.target.value })}
                placeholder="// code" className="w-full resize-none rounded-xl border bg-background p-2 font-mono text-xs outline-none" />
            </>
          )}
          {b.type === "image" && (
            <MediaUpload accept="image/*" value={b.src ? { name: "image", type: "image", dataUrl: b.src, size: 0 } : null}
              onChange={f => update(i, { src: f?.dataUrl ?? "" })} />
          )}

          {showAdd === i ? (
            <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl border bg-background p-2 sm:grid-cols-4">
              {blockTypes.map(bt => (
                <button key={bt.type} onClick={() => insert(i, bt.make())}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs hover:bg-muted">
                  <bt.Icon className="h-3 w-3" /> {bt.label}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setShowAdd(i)} className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-brand">
              <Plus className="h-3 w-3" /> add block
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

void Italic;

import { Linkedin, Twitter, Facebook, MessageCircle, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ url, title, vertical = false }: { url: string; title: string; vertical?: boolean }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const fullUrl = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;

  const links = [
    { Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(fullUrl)}`, label: "LinkedIn" },
    { Icon: Twitter, href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(fullUrl)}`, label: "X / Twitter" },
    { Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(fullUrl)}`, label: "Facebook" },
    { Icon: MessageCircle, href: `https://wa.me/?text=${enc(title + " " + fullUrl)}`, label: "WhatsApp" },
  ];

  const copy = async () => {
    try { await navigator.clipboard.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ }
  };

  return (
    <div className={vertical ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2"}>
      {links.map(({ Icon, href, label }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" title={`Share on ${label}`}
          className="grid h-10 w-10 place-items-center rounded-xl border bg-card transition hover:border-brand hover:bg-brand/10 hover:text-brand">
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button onClick={copy} title="Copy link"
        className="grid h-10 w-10 place-items-center rounded-xl border bg-card transition hover:border-brand hover:bg-brand/10 hover:text-brand">
        {copied ? <Check className="h-4 w-4 text-brand" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

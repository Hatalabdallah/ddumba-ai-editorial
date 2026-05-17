import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useBlog } from "@/lib/blog-context";
import { motion } from "framer-motion";
import { Linkedin, Globe, Phone, Mail, MapPin, Briefcase } from "lucide-react";

export const Route = createFileRoute("/about-author")({
  head: () => ({
    meta: [
      { title: "About Ddumba AK · Platform & AI Systems Engineer" },
      { name: "description", content: "AI Platform Engineer focused on production AI infrastructure, RAG, vLLM, Kubernetes, and inference cost optimization." },
    ],
  }),
  component: AboutAuthorPage,
});

function AboutAuthorPage() {
  const { authors, posts } = useBlog();
  const a = authors[0];
  const featured = posts.filter(p => p.status === "published" && p.authorId === a.id).slice(0, 3);

  const stats = [
    { label: "Production deployments", value: "50+" },
    { label: "Inference cost reduction", value: "60%" },
    { label: "GPU clusters managed", value: "12" },
    { label: "Years in platform eng", value: "8+" },
  ];

  const timeline = [
    { year: "2024 →", title: "AI Platform Architect", body: "Designing LLM inference planes & RAG systems for enterprise teams." },
    { year: "2022", title: "Senior Platform Engineer", body: "Kubernetes, GitOps, observability for AI-heavy workloads." },
    { year: "2020", title: "Cloud Infrastructure Engineer", body: "AWS, Terraform, large-scale data pipelines." },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8">
        <section className="relative overflow-hidden rounded-3xl border bg-card p-8 md:p-14">
          <div className="bg-radial-brand pointer-events-none absolute inset-0" />
          <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="grid h-40 w-40 place-items-center overflow-hidden rounded-3xl bg-gradient-brand text-5xl font-extrabold text-brand-foreground shadow-brand ring-2 ring-brand/30">
              {a.avatar
                ? <img src={a.avatar} alt={a.name} className="h-full w-full object-cover" />
                : a.name.split(" ").map(s => s[0]).join("")}
            </motion.div>
            <div>
              <div className="text-xs uppercase tracking-widest text-brand">{a.fullName}</div>
              <h1 className="mt-1 font-display text-4xl font-extrabold md:text-5xl">{a.name}</h1>
              <p className="mt-3 text-base text-muted-foreground md:text-lg">{a.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {a.role}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {a.location}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {a.contacts.linkedin && (
                  <a href={a.contacts.linkedin} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground shadow-brand">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {a.contacts.email && (
                  <a href={`mailto:${a.contacts.email}`} className="inline-flex items-center gap-2 rounded-xl border bg-background px-3.5 py-2 text-sm font-semibold hover:bg-muted">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                )}
                {a.contacts.personalWebsite && (
                  <a href={a.contacts.personalWebsite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border bg-background px-3.5 py-2 text-sm font-semibold hover:bg-muted">
                    <Globe className="h-3.5 w-3.5" /> Personal site
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl border bg-card p-5">
              <div className="font-display text-3xl font-extrabold text-gradient-brand">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border bg-card p-7 lg:col-span-2">
            <h2 className="font-display text-xl font-bold">About</h2>
            <div className="mt-3 space-y-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {a.bio}
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Common engineering challenges I solve</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {a.challenges.map(c => (
                  <li key={c} className="flex gap-2"><span className="text-brand">+</span>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-7">
              <h3 className="font-display text-base font-bold">Focus areas</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.focusAreas.map(f => (
                  <span key={f} className="rounded-full border bg-background px-2.5 py-1 text-xs">{f}</span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border bg-card p-7">
              <h3 className="font-display text-base font-bold">Tech stack</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {a.techStack.map(t => (
                  <div key={t} className="rounded-xl border bg-background px-3 py-2 text-center text-xs font-semibold">{t}</div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border bg-card p-7">
              <h3 className="font-display text-base font-bold">Contact</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {a.contacts.phone && <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-brand" /> <a href={`tel:${a.contacts.phone}`} className="hover:text-brand">{a.contacts.phone}</a></li>}
                {a.contacts.email && <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-brand" /> <a href={`mailto:${a.contacts.email}`} className="hover:text-brand">{a.contacts.email}</a></li>}
                {a.contacts.companyWebsite && <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-brand" /> <a href={a.contacts.companyWebsite} target="_blank" rel="noreferrer" className="hover:text-brand">{a.contacts.companyWebsite}</a></li>}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border bg-card p-7">
          <h2 className="font-display text-xl font-bold">Career timeline</h2>
          <ol className="mt-5 space-y-5">
            {timeline.map(t => (
              <li key={t.year} className="flex gap-5">
                <div className="w-20 shrink-0 font-mono text-xs text-brand">{t.year}</div>
                <div className="flex-1 border-l pl-5">
                  <h4 className="font-semibold">{t.title}</h4>
                  <p className="text-sm text-muted-foreground">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {featured.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 font-display text-2xl font-bold">Featured articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => <ArticleCard key={p.id} post={p} index={i} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

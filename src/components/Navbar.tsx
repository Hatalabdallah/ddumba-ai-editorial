import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Sun, Moon, ChevronDown, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { useBlog } from "@/lib/blog-context";

export function Navbar() {
  const { theme, toggleTheme, categories, currentAuthor, logout, branding } = useBlog();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate({ to: "/search", search: { q: search } });
    setSearchOpen(false);
    setOpen(false);
  };

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about-author", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-brand shadow-brand ring-1 ring-brand/30">
              <img src={branding.logo || "/profile.png"} alt="Ddumba.AI" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-tight">Ddumba<span className="text-gradient-brand">.AI</span></span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Editorial</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(n => (
              <Link key={n.to} to={n.to}
                className="relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                activeProps={{ className: "text-foreground bg-muted" }}
                activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                Categories <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full w-64 pt-2">
                    <div className="rounded-2xl border bg-popover p-2 shadow-card-premium">
                      {categories.map(c => (
                        <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }}
                          className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">
                          <span className={`mr-2 inline-block h-2 w-2 rounded-full bg-gradient-to-r ${c.color}`} />
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={submitSearch} className="hidden lg:flex">
              <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles…"
                  className="w-44 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
            </form>
            <button onClick={() => setSearchOpen(s => !s)} className="grid h-9 w-9 place-items-center rounded-xl border hover:bg-muted lg:hidden" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-xl border hover:bg-muted" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {currentAuthor ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/admin" className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                </Link>
                <button onClick={async () => { try { await logout(); } catch { /* */ } }} className="grid h-9 w-9 place-items-center rounded-xl border hover:bg-muted" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/admin" className="hidden items-center gap-1.5 rounded-xl bg-gradient-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground shadow-brand md:flex">
                <LogIn className="h-3.5 w-3.5" /> Author
              </Link>
            )}

            <button onClick={() => setOpen(o => !o)} className="grid h-9 w-9 place-items-center rounded-xl border hover:bg-muted md:hidden" aria-label="Menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.form onSubmit={submitSearch}
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t lg:hidden">
              <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-3 md:px-8">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles…"
                  className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="border-b bg-background md:hidden">
            <div className="space-y-1 px-5 py-4">
              {navItems.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">
                  {n.label}
                </Link>
              ))}
              <div className="px-3 pt-2 text-xs uppercase tracking-wider text-muted-foreground">Categories</div>
              {categories.map(c => (
                <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">
                  {c.name}
                </Link>
              ))}
              <div className="border-t pt-2">
                {currentAuthor ? (
                  <Link to="/admin" onClick={() => setOpen(false)} className="block rounded-xl bg-gradient-brand px-3 py-2.5 text-center text-sm font-semibold text-brand-foreground">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/admin" onClick={() => setOpen(false)} className={`block rounded-xl ${path === "/admin" ? "" : "bg-gradient-brand"} px-3 py-2.5 text-center text-sm font-semibold text-brand-foreground`}>
                    Author Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

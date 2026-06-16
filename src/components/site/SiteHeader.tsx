import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, X, ChefHat, LogIn, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/categoria/sobremesas", label: "Sobremesas" },
  { to: "/categoria/pratos-principais", label: "Pratos Principais" },
  { to: "/categoria/massas", label: "Massas" },
  { to: "/categoria/lanches-rapidos", label: "Lanches" },
  { to: "/categoria/bebidas-e-sucos", label: "Bebidas" },
  { to: "/sobre", label: "Sobre" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/buscar", search: { q: q.trim() } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold uppercase tracking-tight">
            Receitas <span className="text-primary">do Nill</span>
          </span>
        </Link>

        <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden items-center md:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar receita..."
              className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              aria-label="Buscar receita"
            />
          </div>
        </form>

        {user ? (
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent md:inline-flex"
          >
            <UserCircle2 className="h-4 w-4" /> Painel
          </Link>
        ) : (
          <Link
            to="/auth"
            className="hidden items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent md:inline-flex"
          >
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md p-2 lg:hidden"
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="space-y-1 px-4 py-3">
            <form onSubmit={submit} className="mb-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar receita..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                activeProps={{ className: "bg-accent text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/admin" : "/auth"}
              className="block rounded-md border border-input px-3 py-2 text-sm font-medium"
            >
              {user ? "Painel administrativo" : "Entrar"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

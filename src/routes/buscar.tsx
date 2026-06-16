import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { searchRecipes, listRecipes } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/site/RecipeCard";
import { Search } from "lucide-react";
import { useState } from "react";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/buscar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Buscar receitas — Receitas do Nill" },
      { name: "description", content: "Busque entre nossas receitas testadas por ingrediente, nome ou categoria." },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [term, setTerm] = useState(q ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["search", q ?? ""],
    queryFn: () => (q ? searchRecipes({ data: { q } }) : listRecipes({ data: { limit: 30 } })),
  });
  const items = (data as any)?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="ds-section-title mb-6">{q ? `Resultados para “${q}”` : "Todas as receitas"}</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: term.trim() || undefined } }); }}
        className="mb-8 flex max-w-xl gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Digite ingrediente, nome ou categoria..."
            className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" className="rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Buscar</button>
      </form>

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Buscando...</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Nenhuma receita encontrada.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r: any) => <RecipeCard key={r.slug} recipe={r} />)}
        </div>
      )}
    </div>
  );
}

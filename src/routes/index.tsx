import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRecipes, listCategories } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/site/RecipeCard";
import { AdSlot } from "@/components/site/AdSlot";
import heroImg from "@/assets/recipes/hero-home.jpg";
import { ChefHat, Clock, Heart, UtensilsCrossed } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Receitas do Nill — Receitas caseiras testadas e fáceis de fazer" },
      { name: "description", content: "Descubra receitas caseiras com passo a passo claro: sobremesas, pratos principais, massas, lanches e bebidas. Tudo testado pela nossa cozinha." },
      { property: "og:title", content: "Receitas do Nill — Receitas caseiras testadas" },
      { property: "og:description", content: "Receitas caseiras com passo a passo claro: sobremesas, pratos principais, massas, lanches e bebidas." },
      { property: "og:image", content: "/images/recipes/hero-home.jpg" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Receitas do Nill",
        url: "/",
        potentialAction: {
          "@type": "SearchAction",
          target: "/buscar?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }),
    }],
  }),
  component: Home,
});

function Home() {
  const { data } = useQuery({
    queryKey: ["recipes", "home"],
    queryFn: () => listRecipes({ data: { limit: 12 } }),
  });
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Mesa farta com pratos caseiros" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/65 to-ink/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <p className="ds-eyebrow text-gold">Bem-vindo à cozinha do Nill</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-cream md:text-6xl">
            Receitas caseiras, testadas e fáceis de fazer
          </h1>
          <p className="mt-5 max-w-xl text-base text-cream/85 md:text-lg">
            Sobremesas, pratos principais, massas, lanches e bebidas — com passo a passo claro,
            ingredientes acessíveis e dicas que realmente funcionam.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/categoria/$slug" params={{ slug: "sobremesas" }} className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Ver sobremesas
            </Link>
            <Link to="/buscar" className="inline-flex items-center gap-2 rounded-md border border-cream/30 bg-cream/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur hover:bg-cream/20">
              Buscar receita
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: ChefHat, t: "Testadas na cozinha", d: "Cada receita é preparada antes de publicar." },
            { icon: Clock, t: "Passo a passo claro", d: "Etapas curtas, fáceis de seguir." },
            { icon: UtensilsCrossed, t: "Ingredientes simples", d: "Itens que você encontra no mercado." },
            { icon: Heart, t: "Feito com carinho", d: "Cozinhar é cuidar de quem você ama." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-lg border border-border bg-card p-5">
              <Icon className="h-7 w-7 text-primary" />
              <h3 className="mt-3 font-display text-base font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot position="home-after-hero" className="mx-auto max-w-3xl px-4" />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="ds-section-title">Últimas Receitas</h2>
          <Link to="/buscar" className="hidden text-sm font-semibold text-primary hover:underline sm:block">Ver todas →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((r, i) => <RecipeCard key={r.slug} recipe={r} priority={i < 3} />)}
        </div>
      </section>

      <AdSlot position="home-mid" className="mx-auto max-w-3xl px-4" />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="ds-section-title mb-8">Explore por categoria</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cats?.map((c) => (
            <Link key={c.slug} to="/categoria/$slug" params={{ slug: c.slug }} className="ds-card ds-card-hover group p-6 text-center">
              <h3 className="font-display text-lg font-bold group-hover:text-primary">{c.name}</h3>
              {c.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

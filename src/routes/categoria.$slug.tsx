import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listRecipes } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/site/RecipeCard";
import { AdSlot } from "@/components/site/AdSlot";

export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["category", params.slug],
      queryFn: () => listRecipes({ data: { categorySlug: params.slug } }),
    });

    if (!data.category) throw notFound();

    return data;
  },

  head: ({ params, loaderData }) => {
    const c = loaderData?.category;

    const title =
      c?.meta_title || `${c?.name || "Categoria"} — Receitas do Nill`;

    const desc =
      c?.meta_description ||
      c?.description ||
      `Receitas da categoria ${c?.name}.`;

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/categoria/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/categoria/${params.slug}` }],
    };
  },

  component: CategoryPage,

  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">
        Categoria não encontrada
      </h1>

      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Voltar à home
      </Link>
    </div>
  ),

  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p>{error.message}</p>

      <button
        onClick={reset}
        className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        Tentar novamente
      </button>
    </div>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();

  const { data } = useSuspenseQuery({
    queryKey: ["category", slug],
    queryFn: () => listRecipes({ data: { categorySlug: slug } }),
  });

  const c = data.category!;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-10 max-w-3xl">
        <p className="ds-eyebrow">Categoria</p>

        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          {c.name}
        </h1>

        {c.description && (
          <p className="mt-3 text-base text-muted-foreground">
            {c.description}
          </p>
        )}
      </header>

      <AdSlot
        position="category-top"
        className="mx-auto max-w-3xl"
        minHeight={280}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_336px]">
        <main className="min-w-0">
          {data.items.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              Nenhuma receita publicada nesta categoria ainda.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((r) => (
                <RecipeCard key={r.slug} recipe={r} />
              ))}
            </div>
          )}
        </main>

        <aside className="hidden lg:block lg:self-start">
          <div className="sticky top-24">
            <AdSlot
              position="sidebar"
              className="mx-auto w-full min-w-[300px] max-w-[336px]"
              minHeight={600}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

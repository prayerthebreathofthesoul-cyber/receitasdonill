import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { marked } from "marked";
import { getRecipeBySlug } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/site/RecipeCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Clock, User, Tag, Home as HomeIcon, ChevronRight } from "lucide-react";

marked.setOptions({ breaks: true });

export const Route = createFileRoute("/receita/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["recipe", params.slug],
      queryFn: () => getRecipeBySlug({ data: { slug: params.slug } }),
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const r = loaderData?.recipe;
    if (!r) return {};
    const title = r.meta_title || `${r.title} — Receitas do Nill`;
    const desc = r.meta_description || r.excerpt || `Aprenda a fazer ${r.title} com passo a passo claro.`;
    const img = r.featured_image || undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/receita/${params.slug}` },
        ...(img ? [{ property: "og:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: `/receita/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Recipe",
          name: r.title,
          description: desc,
          image: img ? [img] : undefined,
          author: { "@type": "Person", name: r.author_name || "Receitas do Nill" },
          datePublished: r.published_at,
          recipeCategory: r.category?.name,
          keywords: r.tags?.join(", "),
        }),
      }, {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            ...(r.category ? [{ "@type": "ListItem", position: 2, name: r.category.name, item: `/categoria/${r.category.slug}` }] : []),
            { "@type": "ListItem", position: r.category ? 3 : 2, name: r.title, item: `/receita/${params.slug}` },
          ],
        }),
      }],
    };
  },
  component: RecipePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Receita não encontrada</h1>
      <p className="mt-3 text-muted-foreground">Talvez ela tenha sido movida. Explore outras receitas na home.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Voltar à home</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Erro ao carregar a receita</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Tentar novamente</button>
    </div>
  ),
});

function RecipePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["recipe", slug],
    queryFn: () => getRecipeBySlug({ data: { slug } }),
  });
  if (!data) return null;
  const { recipe: r, related } = data;
  const html = marked.parse(r.content || "") as string;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-primary"><HomeIcon className="h-3 w-3" />Home</Link>
        <ChevronRight className="h-3 w-3" />
        {r.category && (
          <>
            <Link to="/categoria/$slug" params={{ slug: r.category.slug }} className="hover:text-primary">{r.category.name}</Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground">{r.title}</span>
      </nav>

      {r.category && (
        <Link to="/categoria/$slug" params={{ slug: r.category.slug }} className="ds-eyebrow inline-flex items-center gap-1.5 hover:underline">
          <Tag className="h-3 w-3" /> {r.category.name}
        </Link>
      )}
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">{r.title}</h1>
      {r.subtitle && <p className="mt-3 text-lg text-muted-foreground">{r.subtitle}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {r.author_name && <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {r.author_name}</span>}
        {r.reading_time && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {r.reading_time} min de leitura</span>}
        {r.published_at && <time dateTime={r.published_at}>{new Date(r.published_at).toLocaleDateString("pt-BR")}</time>}
      </div>

      {r.featured_image && (
        <figure className="mt-7 overflow-hidden rounded-lg">
          <img src={r.featured_image} alt={r.featured_image_alt || r.title} className="aspect-[16/10] w-full object-cover" />
        </figure>
      )}

      <AdSlot position="article-after-intro" />

      <div className="ds-prose mt-6" dangerouslySetInnerHTML={{ __html: html }} />

      {r.images.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {r.images.map((img) => (
            <figure key={img.file_url} className="overflow-hidden rounded-lg">
              <img src={img.file_url} alt={img.alt_text || r.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              {img.caption && <figcaption className="mt-2 text-center text-xs italic text-muted-foreground">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {r.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {r.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">#{t}</span>
          ))}
        </div>
      )}

      <AdSlot position="article-before-related" />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="ds-section-title mb-6">Receitas relacionadas</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => <RecipeCard key={rel.slug} recipe={rel} />)}
          </div>
        </section>
      )}
    </article>
  );
}

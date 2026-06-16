import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export interface RecipeSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  reading_time: number | null;
  published_at: string | null;
  category: { slug: string; name: string } | null;
}

export interface RecipeFull extends RecipeSummary {
  id: string;
  subtitle: string | null;
  content: string;
  author_name: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  images: { position: string; file_url: string; alt_text: string | null; caption: string | null }[];
}

const SUMMARY_FIELDS =
  "slug, title, excerpt, featured_image, featured_image_alt, reading_time, published_at, categories(slug, name)";

function mapSummary(row: any): RecipeSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    featured_image: row.featured_image,
    featured_image_alt: row.featured_image_alt,
    reading_time: row.reading_time,
    published_at: row.published_at,
    category: row.categories ? { slug: row.categories.slug, name: row.categories.name } : null,
  };
}

export const listRecipes = createServerFn({ method: "GET" })
  .inputValidator((d: { limit?: number; offset?: number; categorySlug?: string } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("posts")
      .select(SUMMARY_FIELDS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(data.offset ?? 0, (data.offset ?? 0) + (data.limit ?? 20) - 1);
    if (data.categorySlug) {
      const { data: cat } = await sb.from("categories").select("id").eq("slug", data.categorySlug).maybeSingle();
      if (!cat) return { items: [] as RecipeSummary[], category: null };
      q = sb.from("posts")
        .select(SUMMARY_FIELDS)
        .eq("status", "published")
        .eq("category_id", cat.id)
        .order("published_at", { ascending: false });
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    let category = null as { slug: string; name: string; description: string | null; meta_title: string | null; meta_description: string | null } | null;
    if (data.categorySlug) {
      const { data: cat } = await sb.from("categories").select("slug, name, description, meta_title, meta_description").eq("slug", data.categorySlug).maybeSingle();
      category = cat;
    }
    return { items: (rows ?? []).map(mapSummary), category };
  });

export const getRecipeBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("posts")
      .select(`id, slug, title, subtitle, excerpt, content, featured_image, featured_image_alt,
               reading_time, published_at, author_name, tags, meta_title, meta_description,
               categories(slug, name),
               post_images(position, file_url, alt_text, caption, sort_order)`)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    const r: any = row;
    const recipe: RecipeFull = {
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      excerpt: r.excerpt,
      content: r.content,
      featured_image: r.featured_image,
      featured_image_alt: r.featured_image_alt,
      reading_time: r.reading_time,
      published_at: r.published_at,
      author_name: r.author_name,
      tags: r.tags ?? [],
      meta_title: r.meta_title,
      meta_description: r.meta_description,
      category: r.categories ? { slug: r.categories.slug, name: r.categories.name } : null,
      images: (r.post_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    };
    // Receitas relacionadas
    let related: RecipeSummary[] = [];
    if (r.categories) {
      const { data: rel } = await sb.from("posts")
        .select(SUMMARY_FIELDS)
        .eq("status", "published")
        .eq("category_id", (await sb.from("categories").select("id").eq("slug", r.categories.slug).maybeSingle()).data?.id ?? "")
        .neq("slug", r.slug)
        .order("published_at", { ascending: false })
        .limit(3);
      related = (rel ?? []).map(mapSummary);
    }
    return { recipe, related };
  });

export const searchRecipes = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const term = data.q.trim();
    if (!term) return { items: [] as RecipeSummary[] };
    const { data: rows, error } = await sb
      .from("posts")
      .select(SUMMARY_FIELDS)
      .eq("status", "published")
      .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
      .order("published_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    return { items: (rows ?? []).map(mapSummary) };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("categories").select("slug, name, description, sort_order").order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const listAllPublishedSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("posts").select("slug, updated_at").eq("status", "published");
  if (error) throw error;
  return data ?? [];
});

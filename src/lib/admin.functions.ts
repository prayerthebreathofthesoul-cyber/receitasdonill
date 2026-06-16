import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: any) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

const postSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string(),
  category_id: z.string().uuid().nullable().optional(),
  featured_image: z.string().nullable().optional(),
  featured_image_alt: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]),
  author_name: z.string().nullable().optional(),
  reading_time: z.number().int().nullable().optional(),
  tags: z.array(z.string()).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => postSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload: any = { ...data };
    if (data.status === "published" && !data.id) payload.published_at = new Date().toISOString();
    if (data.id) {
      const { error } = await context.supabase.from("posts").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    } else {
      const { data: row, error } = await context.supabase.from("posts").insert(payload).select("id").single();
      if (error) throw error;
      return { id: row.id };
    }
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("posts")
      .select("id, slug, title, status, published_at, updated_at, categories(name, slug)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase.from("posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.id) {
      const { error } = await context.supabase.from("categories").update(data).eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("categories").insert(data);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("categories").select("*").order("sort_order");
    if (error) throw error;
    return data ?? [];
  });

const adSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  position: z.string().min(1),
  device: z.string().default("all"),
  code: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const upsertAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => adSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.id) {
      const { error } = await context.supabase.from("ads").update(data).eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("ads").insert(data);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("ads").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminListAds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("ads").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  });

export const getSetting = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row } = await context.supabase.from("settings").select("value").eq("key", data.key).maybeSingle();
    return row?.value ?? null;
  });

export const setSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; value: any }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("settings").upsert({ key: data.key, value: data.value });
    if (error) throw error;
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [posts, published, cats, ads] = await Promise.all([
      context.supabase.from("posts").select("id", { count: "exact", head: true }),
      context.supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      context.supabase.from("categories").select("id", { count: "exact", head: true }),
      context.supabase.from("ads").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    return {
      posts: posts.count ?? 0,
      published: published.count ?? 0,
      categories: cats.count ?? 0,
      activeAds: ads.count ?? 0,
    };
  });

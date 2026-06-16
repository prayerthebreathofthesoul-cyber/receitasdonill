import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const sb = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );
        const [{ data: posts }, { data: cats }] = await Promise.all([
          sb.from("posts").select("slug, updated_at").eq("status", "published"),
          sb.from("categories").select("slug, updated_at"),
        ]);

        const staticUrls = ["", "/sobre", "/contato", "/politica-editorial", "/politica-de-privacidade", "/termos-de-uso"];
        const urls: { loc: string; lastmod?: string; priority?: string }[] = [
          ...staticUrls.map((u) => ({ loc: `${origin}${u || "/"}`, priority: u ? "0.7" : "1.0" })),
          ...(cats ?? []).map((c) => ({ loc: `${origin}/categoria/${c.slug}`, lastmod: c.updated_at, priority: "0.8" })),
          ...(posts ?? []).map((p) => ({ loc: `${origin}/receita/${p.slug}`, lastmod: p.updated_at, priority: "0.9" })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

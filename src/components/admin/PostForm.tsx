import { useState } from "react";

export interface PostFormValues {
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content: string;
  category_id?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  status: "draft" | "published";
  author_name?: string | null;
  reading_time?: number | null;
  tags?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
}

interface Props {
  initial?: Partial<PostFormValues>;
  categories: { id: string; name: string }[];
  onSubmit: (v: PostFormValues) => Promise<void> | void;
}

export function PostForm({ initial = {}, categories, onSubmit }: Props) {
  const [v, setV] = useState<PostFormValues>({
    slug: initial.slug ?? "",
    title: initial.title ?? "",
    subtitle: initial.subtitle ?? "",
    excerpt: initial.excerpt ?? "",
    content: initial.content ?? "",
    category_id: initial.category_id ?? null,
    featured_image: initial.featured_image ?? "",
    featured_image_alt: initial.featured_image_alt ?? "",
    status: (initial.status as any) ?? "draft",
    author_name: initial.author_name ?? "Nilton Gama",
    reading_time: initial.reading_time ?? 5,
    tags: initial.tags ?? [],
    meta_title: initial.meta_title ?? "",
    meta_description: initial.meta_description ?? "",
  });
  const [tagInput, setTagInput] = useState((initial.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof PostFormValues>(k: K, val: PostFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...v,
        tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
      });
    } finally { setSaving(false); }
  };

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Field label="Título">
          <input required value={v.title} onChange={(e) => { set("title", e.target.value); if (!initial.slug && !v.slug) set("slug", slugify(e.target.value)); }} className={inputCls} />
        </Field>
        <Field label="Slug (URL)">
          <input required value={v.slug} onChange={(e) => set("slug", slugify(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Subtítulo">
          <input value={v.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Resumo (excerpt)">
          <textarea value={v.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} rows={3} className={inputCls} />
        </Field>
        <Field label="Conteúdo (Markdown)">
          <textarea required value={v.content} onChange={(e) => set("content", e.target.value)} rows={22} className={`${inputCls} font-mono text-xs leading-relaxed`} />
          <p className="mt-1 text-xs text-muted-foreground">Use ## para subtítulos, **negrito**, listas com -, etc.</p>
        </Field>
      </div>
      <div className="space-y-4">
        <Field label="Status">
          <select value={v.status} onChange={(e) => set("status", e.target.value as any)} className={inputCls}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicada</option>
          </select>
        </Field>
        <Field label="Categoria">
          <select value={v.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)} className={inputCls}>
            <option value="">— Selecionar —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Imagem destaque (URL)">
          <input value={v.featured_image ?? ""} onChange={(e) => set("featured_image", e.target.value)} placeholder="/images/recipes/sua-foto.jpg" className={inputCls} />
        </Field>
        <Field label="Alt da imagem">
          <input value={v.featured_image_alt ?? ""} onChange={(e) => set("featured_image_alt", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Autor">
          <input value={v.author_name ?? ""} onChange={(e) => set("author_name", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Tempo de leitura (min)">
          <input type="number" min={1} value={v.reading_time ?? 5} onChange={(e) => set("reading_time", parseInt(e.target.value) || null)} className={inputCls} />
        </Field>
        <Field label="Tags (separadas por vírgula)">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Meta title (SEO)">
          <input value={v.meta_title ?? ""} onChange={(e) => set("meta_title", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Meta description (SEO)">
          <textarea value={v.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} rows={3} className={inputCls} />
        </Field>
        <button type="submit" disabled={saving} className="h-11 w-full rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? "Salvando…" : "Salvar receita"}
        </button>
      </div>
    </form>
  );
}

const inputCls = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span><div className="mt-1">{children}</div></label>;
}

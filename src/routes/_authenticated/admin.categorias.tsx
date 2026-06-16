import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListCategories, upsertCategory, deleteCategory } from "@/lib/admin.functions";
import { Trash2, Plus, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const listFn = useServerFn(adminListCategories);
  const upFn = useServerFn(upsertCategory);
  const delFn = useServerFn(deleteCategory);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-categories"], queryFn: () => listFn() });
  const [form, setForm] = useState({ slug: "", name: "", description: "", sort_order: 0 });

  const save = async (payload: any) => {
    try {
      await upFn({ data: payload });
      toast.success("Salvo");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      if (!payload.id) setForm({ slug: "", name: "", description: "", sort_order: 0 });
    } catch (e: any) { toast.error(e.message); }
  };
  const del = async (id: string) => {
    if (!confirm("Excluir categoria?")) return;
    try { await delFn({ data: { id } }); toast.success("Excluída"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Categorias</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form onSubmit={(e) => { e.preventDefault(); save(form); }} className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-display text-lg font-bold">+ Nova categoria</h3>
          <input placeholder="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          <input placeholder="slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={`${inputCls} mt-2`} />
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} mt-2`} />
          <input type="number" placeholder="Ordem" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} className={`${inputCls} mt-2`} />
          <button className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Criar</button>
        </form>

        <div className="space-y-3 lg:col-span-2">
          {data?.map((c: any) => (
            <CategoryRow key={c.id} cat={c} onSave={save} onDelete={del} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ cat, onSave, onDelete }: any) {
  const [c, setC] = useState(cat);
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} className={inputCls} />
        <input value={c.slug} onChange={(e) => setC({ ...c, slug: e.target.value })} className={inputCls} />
      </div>
      <textarea value={c.description ?? ""} onChange={(e) => setC({ ...c, description: e.target.value })} rows={2} className={`${inputCls} mt-2`} />
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => onSave(c)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Save className="h-3.5 w-3.5" /> Salvar</button>
        <button onClick={() => onDelete(c.id)} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
      </div>
    </div>
  );
}
const inputCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

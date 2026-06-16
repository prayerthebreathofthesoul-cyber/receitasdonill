import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPosts, deletePost } from "@/lib/admin.functions";
import { Pencil, Trash2, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/posts/")({
  component: PostsList,
});

function PostsList() {
  const listFn = useServerFn(adminListPosts);
  const delFn = useServerFn(deletePost);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-posts"], queryFn: () => listFn() });

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir “${title}”? Esta ação é irreversível.`)) return;
    try {
      await delFn({ data: { id } });
      toast.success("Receita excluída");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Receitas</h1>
        <Link to="/admin/posts/nova" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nova receita
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.categories?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "published" ? "bg-olive/15 text-olive" : "bg-muted text-muted-foreground"}`}>
                    {p.status === "published" ? "Publicada" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <a href={`/receita/${p.slug}`} target="_blank" rel="noopener" className="rounded p-1.5 hover:bg-accent" title="Ver"><ExternalLink className="h-4 w-4" /></a>
                    <Link to="/admin/posts/$id" params={{ id: p.id }} className="rounded p-1.5 hover:bg-accent" title="Editar"><Pencil className="h-4 w-4" /></Link>
                    <button onClick={() => onDelete(p.id, p.title)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Nenhuma receita cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListAds, upsertAd, deleteAd, getSetting, setSetting } from "@/lib/admin.functions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/anuncios")({
  component: AdsPage,
});

const POSITIONS = [
  "home-after-hero", "home-mid", "category-top",
  "article-after-intro", "article-mid", "article-before-related", "sidebar",
];

function AdsPage() {
  const listFn = useServerFn(adminListAds);
  const upFn = useServerFn(upsertAd);
  const delFn = useServerFn(deleteAd);
  const getSet = useServerFn(getSetting);
  const setSet = useServerFn(setSetting);
  const qc = useQueryClient();
  const { data: ads } = useQuery({ queryKey: ["admin-ads"], queryFn: () => listFn() });
  const { data: cfg } = useQuery({ queryKey: ["adsense-cfg"], queryFn: () => getSet({ data: { key: "adsense" } }) });

  const [pid, setPid] = useState("");
  useEffect(() => { setPid((cfg as any)?.publisher_id ?? ""); }, [cfg]);

  const [form, setForm] = useState<any>({ name: "", position: POSITIONS[0], device: "all", code: "", is_active: true });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Anúncios & AdSense</h1>

      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Publisher ID (Google AdSense)</h2>
        <p className="mt-1 text-sm text-muted-foreground">Após a aprovação do AdSense, cole aqui o seu publisher ID no formato <code>ca-pub-XXXXXXXXXX</code>. Sem ele, os blocos de anúncio mostram apenas placeholders.</p>
        <div className="mt-3 flex gap-2">
          <input value={pid} onChange={(e) => setPid(e.target.value)} placeholder="ca-pub-0000000000000000" className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm" />
          <button onClick={async () => {
            try { await setSet({ data: { key: "adsense", value: { publisher_id: pid } } }); toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["adsense-cfg"] }); qc.invalidateQueries({ queryKey: ["ad-slot"] }); }
            catch (e: any) { toast.error(e.message); }
          }} className="rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Salvar</button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl font-bold">Blocos de anúncio</h2>
        <p className="text-sm text-muted-foreground">Posições disponíveis: {POSITIONS.join(", ")}.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try { await upFn({ data: form }); toast.success("Salvo"); setForm({ name: "", position: POSITIONS[0], device: "all", code: "", is_active: true }); qc.invalidateQueries({ queryKey: ["admin-ads"] }); }
          catch (err: any) { toast.error(err.message); }
        }} className="mt-3 grid gap-2 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
          <input required placeholder="Nome interno" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={inputCls}>
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <textarea placeholder="Cole aqui o código <ins> do AdSense" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} rows={4} className={`${inputCls} sm:col-span-2 font-mono text-xs`} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Ativo</label>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Criar bloco</button>
        </form>

        <div className="mt-4 space-y-2">
          {ads?.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <p className="font-semibold">{a.name} <span className="text-xs text-muted-foreground">[{a.position}]</span></p>
                <p className="text-xs text-muted-foreground">{a.is_active ? "Ativo" : "Inativo"} · {a.device}</p>
              </div>
              <button onClick={async () => { if (!confirm("Excluir?")) return; await delFn({ data: { id: a.id } }); qc.invalidateQueries({ queryKey: ["admin-ads"] }); }} className="rounded p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
const inputCls = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSetting, setSetting } from "@/lib/admin.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  component: SettingsPage,
});

function SettingsPage() {
  const getFn = useServerFn(getSetting);
  const setFn = useServerFn(setSetting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["site-cfg"], queryFn: () => getFn({ data: { key: "site" } }) });
  const [cfg, setCfg] = useState({ site_name: "", site_description: "", ga4_id: "" });
  useEffect(() => { if (data) setCfg({ ...cfg, ...(data as any) }); /* eslint-disable-next-line */ }, [data]);

  const save = async () => {
    try { await setFn({ data: { key: "site", value: cfg } }); toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["site-cfg"] }); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Configurações do site</h1>
      <div className="mt-6 max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6">
        <label className="block">
          <span className="text-sm font-medium">Nome do site</span>
          <input value={cfg.site_name} onChange={(e) => setCfg({ ...cfg, site_name: e.target.value })} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Descrição do site</span>
          <textarea value={cfg.site_description} onChange={(e) => setCfg({ ...cfg, site_description: e.target.value })} rows={3} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Google Analytics 4 (Measurement ID — G-XXXXXX)</span>
          <input value={cfg.ga4_id} onChange={(e) => setCfg({ ...cfg, ga4_id: e.target.value })} placeholder="G-XXXXXXXXXX" className={inputCls} />
          <p className="mt-1 text-xs text-muted-foreground">Cole o ID. (A integração GA4 pode ser ativada em uma próxima fase.)</p>
        </label>
        <button onClick={save} className="h-11 rounded-md bg-primary px-5 font-semibold text-primary-foreground">Salvar configurações</button>
      </div>

      <div className="mt-8 max-w-2xl rounded-lg border border-border bg-muted/30 p-6 text-sm">
        <h3 className="font-display text-base font-bold">📋 Como publicar o blog</h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>Clique em <strong>Publish</strong> no canto superior direito do Lovable.</li>
          <li>Conecte um domínio próprio em Settings → Domains (recomendado para AdSense).</li>
          <li>Solicite aprovação do Google AdSense em <a className="text-primary underline" href="https://adsense.google.com" target="_blank" rel="noopener">adsense.google.com</a> usando o domínio próprio.</li>
          <li>Após aprovação, vá em <strong>Anúncios</strong>, cole seu <code>ca-pub-XXX</code> e o código de cada bloco.</li>
        </ol>
      </div>
    </div>
  );
}
const inputCls = "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminStats } from "@/lib/admin.functions";
import { FileText, FolderTree, Megaphone, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(adminStats);
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const cards = [
    { label: "Receitas totais", value: data?.posts ?? 0, icon: FileText, color: "text-primary" },
    { label: "Publicadas", value: data?.published ?? 0, icon: CheckCircle2, color: "text-olive" },
    { label: "Categorias", value: data?.categories ?? 0, icon: FolderTree, color: "text-gold" },
    { label: "Anúncios ativos", value: data?.activeAds ?? 0, icon: Megaphone, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Visão geral do blog.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-5">
            <c.icon className={`h-6 w-6 ${c.color}`} />
            <p className="mt-3 text-2xl font-bold">{c.value}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link to="/admin/posts/nova" className="block rounded-lg border border-border bg-card p-5 hover:border-primary">
          <h3 className="font-display text-lg font-bold">+ Nova receita</h3>
          <p className="mt-1 text-sm text-muted-foreground">Adicione uma nova receita ao blog.</p>
        </Link>
        <Link to="/admin/anuncios" className="block rounded-lg border border-border bg-card p-5 hover:border-primary">
          <h3 className="font-display text-lg font-bold">Configurar AdSense</h3>
          <p className="mt-1 text-sm text-muted-foreground">Cole seu publisher ID e códigos de anúncio.</p>
        </Link>
      </div>
    </div>
  );
}

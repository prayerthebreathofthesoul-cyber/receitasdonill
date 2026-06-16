import { createFileRoute } from "@tanstack/react-router";
import { Mail, Instagram, Facebook } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Receitas do Nill" },
      { name: "description", content: "Entre em contato com o Receitas do Nill para sugestões, parcerias e dúvidas." },
      { property: "og:title", content: "Contato — Receitas do Nill" },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: () => (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Contato</h1>
      <p className="mt-3 text-muted-foreground">Sugestões de receitas, parcerias, dúvidas ou correções: entre em contato pelos canais abaixo.</p>
      <ul className="mt-6 space-y-3 text-base">
        <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /> <a className="hover:underline" href="mailto:contato@receitasdonill.com">contato@receitasdonill.com</a></li>
        <li className="flex items-center gap-3"><Instagram className="h-5 w-5 text-primary" /> @receitasdonill</li>
        <li className="flex items-center gap-3"><Facebook className="h-5 w-5 text-primary" /> /receitasdonill</li>
      </ul>
      <form
        className="mt-10 space-y-4 rounded-lg border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const f = e.currentTarget as HTMLFormElement;
          const fd = new FormData(f);
          const subject = encodeURIComponent(`Contato site — ${fd.get("nome")}`);
          const body = encodeURIComponent(`${fd.get("mensagem")}\n\n— ${fd.get("nome")} (${fd.get("email")})`);
          window.location.href = `mailto:contato@receitasdonill.com?subject=${subject}&body=${body}`;
        }}
      >
        <div>
          <label className="text-sm font-medium">Seu nome</label>
          <input name="nome" required className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">E-mail</label>
          <input type="email" name="email" required className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Mensagem</label>
          <textarea name="mensagem" required rows={5} className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Enviar mensagem</button>
      </form>
    </div>
  ),
});

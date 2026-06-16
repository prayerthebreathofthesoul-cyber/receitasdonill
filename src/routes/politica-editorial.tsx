import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-editorial")({
  head: () => ({
    meta: [
      { title: "Política Editorial — Receitas do Nill" },
      { name: "description", content: "Nossa política editorial: como testamos, escrevemos e revisamos cada receita publicada." },
      { property: "og:url", content: "/politica-editorial" },
    ],
    links: [{ rel: "canonical", href: "/politica-editorial" }],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Política Editorial</h1>
      <div className="ds-prose mt-6">
        <p>Acreditamos que conteúdo de qualidade nasce de processo. Por isso, toda receita publicada no <strong>Receitas do Nill</strong> segue um fluxo editorial cuidadoso.</p>
        <h2>1. Origem das receitas</h2>
        <p>Nossas receitas vêm de três fontes: tradição familiar, adaptações de clássicos e criações próprias testadas em casa. Sempre que adaptamos uma receita conhecida, ajustamos para os ingredientes do mercado brasileiro.</p>
        <h2>2. Teste em cozinha</h2>
        <p>Antes de publicar, cada receita é preparada pelo menos uma vez na nossa cozinha. Tempos, quantidades e temperaturas são revisados.</p>
        <h2>3. Fotografia</h2>
        <p>As fotos são, sempre que possível, do prato final preparado por nós. Quando utilizamos imagens ilustrativas, sinalizamos claramente.</p>
        <h2>4. Linguagem clara</h2>
        <p>Escrevemos receitas em linguagem simples, evitando jargão técnico desnecessário. Cada etapa é curta e direta.</p>
        <h2>5. Correções e atualizações</h2>
        <p>Se você encontrar erro em alguma receita, escreva para <a href="mailto:contato@receitasdonill.com">contato@receitasdonill.com</a>. Corrigimos rapidamente e indicamos a data da última atualização.</p>
        <h2>6. Independência editorial</h2>
        <p>O conteúdo editorial é independente da publicidade. Anúncios são identificados claramente e não influenciam o que escrevemos.</p>
        <h2>7. Conflitos de interesse</h2>
        <p>Quando uma receita envolver marca patrocinadora, isso será informado de forma transparente no início do conteúdo.</p>
      </div>
    </div>
  ),
});

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Receitas do Nill" },
      { name: "description", content: "Termos e condições de uso do site Receitas do Nill." },
      { property: "og:url", content: "/termos-de-uso" },
    ],
    links: [{ rel: "canonical", href: "/termos-de-uso" }],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
      <div className="ds-prose mt-6">
        <h2>1. Aceite</h2>
        <p>Ao acessar o <strong>Receitas do Nill</strong>, você concorda com estes Termos de Uso. Se não concordar, por favor, não utilize o site.</p>
        <h2>2. Conteúdo</h2>
        <p>Todo o conteúdo (textos, receitas, imagens) é protegido por direitos autorais e pertence ao Receitas do Nill ou aos seus respectivos autores. É permitido compartilhar links; é vedada a reprodução integral sem autorização.</p>
        <h2>3. Uso permitido</h2>
        <p>Você pode utilizar as receitas livremente para uso pessoal e familiar. Para uso comercial, escolar ou em outros sites/redes sociais, é necessário citar a fonte com link para a página original.</p>
        <h2>4. Responsabilidade</h2>
        <p>As receitas são apresentadas em caráter informativo. Não nos responsabilizamos por alterações nos ingredientes, alergias alimentares ou intolerâncias. Verifique sempre os rótulos.</p>
        <h2>5. Comentários e contatos</h2>
        <p>Mensagens com discurso de ódio, spam ou conteúdo ilegal serão removidas. Reservamo-nos o direito de bloquear usuários abusivos.</p>
        <h2>6. Alterações</h2>
        <p>Estes termos podem ser alterados sem aviso prévio. Recomendamos a leitura periódica.</p>
        <h2>7. Foro</h2>
        <p>Para qualquer disputa relativa a estes termos, fica eleito o foro da cidade do administrador, com renúncia de qualquer outro.</p>
      </div>
    </div>
  ),
});

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Receitas do Nill" },
      { name: "description", content: "Conheça a história e a missão do Receitas do Nill: receitas caseiras testadas com passo a passo claro." },
      { property: "og:title", content: "Sobre o Receitas do Nill" },
      { property: "og:description", content: "Receitas caseiras testadas com passo a passo claro e fotos reais." },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Sobre o Receitas do Nill</h1>
      <div className="ds-prose mt-6">
        <p>O <strong>Receitas do Nill</strong> nasceu do amor de cozinhar e da vontade de compartilhar pratos que realmente funcionam. Aqui você encontra receitas caseiras testadas na cozinha, escritas em uma linguagem simples, com ingredientes acessíveis e passo a passo claro.</p>
        <h2>Nossa missão</h2>
        <p>Levar a alegria da boa cozinha caseira para a sua mesa todos os dias. Acreditamos que cozinhar não precisa ser complicado — basta uma boa receita, ingredientes frescos e atenção aos detalhes.</p>
        <h2>O que você encontra aqui</h2>
        <ul>
          <li>Sobremesas para arrasar nos dias especiais</li>
          <li>Pratos principais práticos para o dia a dia</li>
          <li>Massas caseiras e molhos saborosos</li>
          <li>Lanches rápidos para qualquer hora</li>
          <li>Bebidas e sucos refrescantes</li>
        </ul>
        <h2>Quem está por trás</h2>
        <p>Sou Nilton Gama, apaixonado por cozinhar há mais de 20 anos. Cada receita publicada aqui é preparada, fotografada e revisada antes de chegar até você.</p>
      </div>
    </div>
  ),
});

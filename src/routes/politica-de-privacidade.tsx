import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Receitas do Nill" },
      { name: "description", content: "Política de privacidade do Receitas do Nill: coleta, uso e proteção de dados, cookies e anúncios." },
      { property: "og:url", content: "/politica-de-privacidade" },
    ],
    links: [{ rel: "canonical", href: "/politica-de-privacidade" }],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
      <div className="ds-prose mt-6">
        <p>O <strong>Receitas do Nill</strong> respeita a sua privacidade e segue a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).</p>
        <h2>1. Informações que coletamos</h2>
        <p>Não exigimos cadastro para acessar o conteúdo. Podemos coletar, de forma automática: páginas visitadas, navegador, sistema operacional, idioma e localização aproximada (cidade/estado).</p>
        <h2>2. Cookies</h2>
        <p>Utilizamos cookies próprios e de terceiros para melhorar a experiência, mensurar audiência e exibir anúncios relevantes. Você pode desativá-los nas configurações do seu navegador.</p>
        <h2>3. Google AdSense</h2>
        <p>Este site exibe anúncios do Google AdSense. O Google utiliza cookies (incluindo o cookie DART) para veicular anúncios com base nas visitas anteriores. Você pode optar por não receber anúncios personalizados em <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">google.com/settings/ads</a>.</p>
        <h2>4. Google Analytics</h2>
        <p>Usamos o Google Analytics para entender de forma agregada como os visitantes utilizam o site. Os dados são anonimizados.</p>
        <h2>5. Compartilhamento de dados</h2>
        <p>Não vendemos seus dados. Compartilhamos apenas com provedores estritamente necessários (hospedagem, analytics, anúncios) e quando exigido por lei.</p>
        <h2>6. Seus direitos</h2>
        <p>Você pode solicitar acesso, correção ou exclusão de dados pessoais entrando em contato pelo e-mail <a href="mailto:contato@receitasdonill.com">contato@receitasdonill.com</a>.</p>
        <h2>7. Segurança</h2>
        <p>Adotamos medidas técnicas e administrativas razoáveis para proteger seus dados, embora nenhum método seja 100% seguro.</p>
        <h2>8. Mudanças</h2>
        <p>Esta política pode ser atualizada a qualquer tempo. Recomendamos a leitura periódica.</p>
      </div>
    </div>
  ),
});

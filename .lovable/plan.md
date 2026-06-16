## Receitas do Nill — Blog de Receitas (MVP)

### Identidade visual
Reaproveito a estrutura do design system enviado (tipografia forte em caixa alta, títulos com borda lateral, cards com sombra, hero impactante, seções alternadas), mas troco a paleta Flamengo por cores apetitosas de gastronomia:
- **Terracota** `#C2410C` (primária — botões, destaques, borda lateral dos títulos)
- **Verde-oliva** `#5C7A3A` (secundária — categorias, badges)
- **Creme** `#FBF7F0` (background)
- **Marrom torrado** `#3A2418` (texto principal)
- **Dourado suave** `#D4A24A` (acentos)

Tipografia: **Playfair Display** (títulos editoriais) + **Inter** (corpo).

### Stack
- TanStack Start + React 19 + Tailwind v4 (template atual)
- **Lovable Cloud** (Supabase) para banco, auth e storage
- shadcn/ui adaptado às variantes do design system

### Banco de dados (Lovable Cloud)
Tabelas: `profiles`, `user_roles` (enum admin/editor/author), `categories`, `posts`, `post_images`, `ads`, `settings`. RLS: leitura pública de posts publicados; escrita só para admin/editor.

### Categorias iniciais (5)
1. Sobremesas
2. Pratos Principais
3. Massas
4. Lanches Rápidos
5. Bebidas e Sucos

### 10 receitas seed (≈1000 palavras + 3 imagens IA cada)
1. Bolo de Cenoura com Cobertura de Chocolate (Sobremesas)
2. Pudim de Leite Condensado Clássico (Sobremesas)
3. Strogonoff de Frango Cremoso (Pratos Principais)
4. Feijoada Completa Tradicional (Pratos Principais)
5. Lasanha à Bolonhesa (Massas)
6. Macarrão Alho e Óleo Perfeito (Massas)
7. Hambúrguer Caseiro Suculento (Lanches Rápidos)
8. Tapioca Recheada de Frango (Lanches Rápidos)
9. Suco Verde Detox (Bebidas e Sucos)
10. Limonada Suíça Cremosa (Bebidas e Sucos)

### Rotas públicas
`/`, `/receita/$slug`, `/categoria/$slug`, `/buscar`, `/sobre`, `/contato`, `/politica-de-privacidade`, `/termos-de-uso`, `/politica-editorial`, `/auth`, 404.

Cada receita: hero com imagem, breadcrumbs, autor, tempo, categoria, conteúdo com 3 imagens posicionadas (início/meio/antes-da-conclusão), placeholders de anúncio bem espaçados, receitas relacionadas, schema Article + Recipe JSON-LD.

### Rotas admin (`/_authenticated/admin/*`)
- Dashboard (totais)
- Posts (lista, criar, editar, publicar/rascunho, excluir)
- Categorias (CRUD)
- Mídia (upload via Storage)
- Anúncios (ativar AdSense, Publisher ID, blocos manuais por posição)
- Configurações (nome, logo, contato, redes sociais)

Acesso só para `niltongama81@gmail.com` (seed do role admin no primeiro signup com esse e-mail).

### SEO/Performance
- `head()` por rota com title/description/OG/Twitter/canonical
- JSON-LD Article + Recipe + BreadcrumbList
- `sitemap.xml` dinâmico (lista posts publicados) + `robots.txt`
- Imagens via Lovable Assets (CDN), lazy loading, `loading="lazy"`
- AdSense: componente `<AdSlot position="..."/>` que renderiza placeholder estilizado "Publicidade" até o Publisher ID estar configurado; depois injeta `<ins class="adsbygoogle">`. Posições: home-after-hero, home-mid, article-after-intro, article-mid, article-before-related, sidebar.

### Páginas institucionais
Política de Privacidade, Termos, Política Editorial — textos completos em português, mencionando AdSense, cookies, originalidade do conteúdo.

### Etapas de execução
1. Enable Lovable Cloud + migração (tabelas, RLS, enum role, trigger has_role)
2. Design system (`src/styles.css`) com paleta gastronômica + variantes shadcn
3. Layout base: header, footer, AdSlot component
4. Seed das 10 receitas (SQL com conteúdo completo) + geração de 30 imagens IA
5. Rotas públicas (home, receita, categoria, busca, institucionais, 404)
6. Auth + admin (dashboard, CRUD posts/categorias/anúncios/settings)
7. SEO técnico (sitemap, robots, JSON-LD, OG)
8. Pós: instruções para inserir Publisher ID real e publicar

### O que NÃO entrego nesta fase
- Os outros 40 artigos (crio depois pelo CMS ou em batches futuros — cada batch consome bastante crédito por causa das imagens IA)
- Editor WYSIWYG rico estilo TipTap (uso textarea com Markdown — bem mais leve e estável; posso trocar depois)
- Newsletter, comentários, multi-autor avançado

Tudo pronto, começo a execução? Vai gerar bastante código e ~30 imagens — leva alguns minutos.
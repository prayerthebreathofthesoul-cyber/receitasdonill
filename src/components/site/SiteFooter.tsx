import { Link } from "@tanstack/react-router";
import { ChefHat, Mail, Instagram, Facebook } from "lucide-react";

const CATEGORIES = [
  { slug: "sobremesas", label: "Sobremesas" },
  { slug: "pratos-principais", label: "Pratos Principais" },
  { slug: "massas", label: "Massas" },
  { slug: "lanches-rapidos", label: "Lanches Rápidos" },
  { slug: "bebidas-e-sucos", label: "Bebidas e Sucos" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold uppercase">
              Receitas do Nill
            </span>
          </Link>
          <p className="mt-3 text-sm text-cream/70">
            Receitas testadas, com passo a passo claro e fotos reais. Cozinhar é mais fácil quando alguém te guia.
          </p>
        </div>

        <div>
          <h4 className="ds-eyebrow text-cream/80">Categorias</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/categoria/$slug" params={{ slug: c.slug }} className="text-cream/80 hover:text-primary">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="ds-eyebrow text-cream/80">Institucional</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/sobre" className="text-cream/80 hover:text-primary">Sobre</Link></li>
            <li><Link to="/contato" className="text-cream/80 hover:text-primary">Contato</Link></li>
            <li><Link to="/politica-editorial" className="text-cream/80 hover:text-primary">Política Editorial</Link></li>
            <li><Link to="/politica-de-privacidade" className="text-cream/80 hover:text-primary">Política de Privacidade</Link></li>
            <li><Link to="/termos-de-uso" className="text-cream/80 hover:text-primary">Termos de Uso</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="ds-eyebrow text-cream/80">Fale com a gente</h4>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@receitasdonill.com</li>
            <li className="flex items-center gap-2"><Instagram className="h-4 w-4" /> @receitasdonill</li>
            <li className="flex items-center gap-2"><Facebook className="h-4 w-4" /> /receitasdonill</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} Receitas do Nill. Todos os direitos reservados.
      </div>
    </footer>
  );
}

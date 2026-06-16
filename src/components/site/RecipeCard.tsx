import { Link } from "@tanstack/react-router";
import { Clock, Tag } from "lucide-react";

export interface RecipeCardData {
  slug: string;
  title: string;
  excerpt?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  reading_time?: number | null;
  category?: { slug: string; name: string } | null;
}

export function RecipeCard({ recipe, priority = false }: { recipe: RecipeCardData; priority?: boolean }) {
  return (
    <article className="ds-card ds-card-hover group flex h-full flex-col">
      <Link to="/receita/$slug" params={{ slug: recipe.slug }} className="block overflow-hidden">
        {recipe.featured_image ? (
          <img
            src={recipe.featured_image}
            alt={recipe.featured_image_alt || recipe.title}
            loading={priority ? "eager" : "lazy"}
            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="aspect-[16/10] w-full bg-gradient-to-br from-primary/30 via-gold/30 to-olive/30" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {recipe.category && (
          <Link
            to="/categoria/$slug"
            params={{ slug: recipe.category.slug }}
            className="ds-eyebrow mb-2 inline-flex items-center gap-1.5 hover:underline"
          >
            <Tag className="h-3 w-3" /> {recipe.category.name}
          </Link>
        )}
        <h3 className="font-display text-xl font-bold leading-tight text-foreground">
          <Link to="/receita/$slug" params={{ slug: recipe.slug }} className="hover:text-primary">
            {recipe.title}
          </Link>
        </h3>
        {recipe.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{recipe.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {recipe.reading_time ?? 5} min de leitura
          </span>
          <Link to="/receita/$slug" params={{ slug: recipe.slug }} className="font-semibold text-primary hover:underline">
            Ver receita →
          </Link>
        </div>
      </div>
    </article>
  );
}

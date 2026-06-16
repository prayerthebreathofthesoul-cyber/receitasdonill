import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  position: string;
  label?: string;
  className?: string;
}

/**
 * AdSlot — espaço seguro para anúncios.
 * - Mostra placeholder estilizado "Publicidade" até que um Publisher ID do
 *   AdSense seja configurado em /admin/anuncios.
 * - Quando o Publisher ID estiver salvo em settings.adsense.publisher_id E
 *   houver um ad ativo cadastrado para esta posição com `code`, renderiza
 *   o HTML do anúncio injetado.
 * - Posições recomendadas: home-after-hero, home-mid, article-after-intro,
 *   article-mid, article-before-related, sidebar.
 */
export function AdSlot({ position, label = "Publicidade", className = "" }: AdSlotProps) {
  const { data } = useQuery({
    queryKey: ["ad-slot", position],
    queryFn: async () => {
      const [{ data: ad }, { data: setting }] = await Promise.all([
        supabase.from("ads").select("code").eq("position", position).eq("is_active", true).maybeSingle(),
        supabase.from("settings").select("value").eq("key", "adsense").maybeSingle(),
      ]);
      const publisherId = (setting?.value as { publisher_id?: string } | null)?.publisher_id;
      return { code: ad?.code ?? null, publisherId: publisherId ?? null };
    },
    staleTime: 60_000,
  });

  const showReal = data?.code && data?.publisherId;

  return (
    <aside
      role="complementary"
      aria-label={label}
      className={`my-8 ${className}`}
      data-ad-position={position}
    >
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </p>
      {showReal ? (
        <div className="overflow-hidden rounded-md" dangerouslySetInnerHTML={{ __html: data.code! }} />
      ) : (
        <div className="ds-ad-slot">Espaço reservado para anúncio</div>
      )}
    </aside>
  );
}

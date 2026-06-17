import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  position: string;
  label?: string;
  className?: string;
}

export function AdSlot({ position, label = "Publicidade", className = "" }: AdSlotProps) {
  const { data } = useQuery({
    queryKey: ["ad-slot", position],
    queryFn: async () => {
      const { data: ad } = await supabase
        .from("ads")
        .select("code")
        .eq("position", position)
        .eq("is_active", true)
        .maybeSingle();
      return { code: ad?.code ?? null };
    },
    staleTime: 60_000,
  });

  const ref = useRef<HTMLDivElement>(null);
  const code = data?.code ?? null;

  useEffect(() => {
    const el = ref.current;
    if (!el || !code) return;

    // Limpa antes de re-injetar (necessário p/ scripts de anúncio executarem)
    el.innerHTML = "";

    // Faz parse do HTML do anúncio e re-cria <script> manualmente,
    // pois innerHTML não executa scripts inseridos dinamicamente.
    const template = document.createElement("template");
    template.innerHTML = code.trim();

    const nodes = Array.from(template.content.childNodes);
    nodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const old = node as HTMLScriptElement;
        const s = document.createElement("script");
        // copia atributos (src, type, async, data-*)
        for (const attr of Array.from(old.attributes)) {
          s.setAttribute(attr.name, attr.value);
        }
        if (old.textContent) s.text = old.textContent;
        el.appendChild(s);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });
  }, [code]);

  const showReal = !!code;

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
        <div ref={ref} className="overflow-hidden rounded-md flex justify-center" />
      ) : (
        <div className="ds-ad-slot">Espaço reservado para anúncio</div>
      )}
    </aside>
  );
}

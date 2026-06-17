import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  position: string;
  label?: string;
  className?: string;
  minHeight?: number;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  position,
  label = "Publicidade",
  className = "",
  minHeight = 250,
}: AdSlotProps) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement | null>(null);

  const routeKey = useMemo(() => {
    return `${location.pathname}${location.searchStr || ""}`;
  }, [location.pathname, location.searchStr]);

  const { data } = useQuery({
    queryKey: ["ad-slot", position],
    queryFn: async () => {
      const { data: ads, error } = await supabase
        .from("ads")
        .select("code")
        .eq("position", position)
        .eq("is_active", true)
        .not("code", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const ad = ads?.find((item) => item.code?.trim());

      return {
        code: ad?.code?.trim() || null,
      };
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const code = data?.code ?? null;

  useEffect(() => {
    const slot = ref.current;

    if (!slot || !code) return;

    let cancelled = false;
    const insertedScripts: HTMLScriptElement[] = [];

    function clearSlot() {
      insertedScripts.forEach((script) => {
        script.remove();
      });

      if (ref.current) {
        ref.current.innerHTML = "";
      }
    }

    function executeInlineScript(scriptText: string) {
      try {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.text = scriptText;
        script.setAttribute("data-ad-position", position);
        script.setAttribute("data-ad-route", routeKey);

        insertedScripts.push(script);
        document.body.appendChild(script);
      } catch (error) {
        console.warn("Erro ao executar script inline do anúncio:", error);
      }
    }

    function pushAdSense() {
      try {
        const currentSlot = ref.current;

        if (!currentSlot) return;

        const hasAdSenseUnit = currentSlot.querySelector(".adsbygoogle");

        if (!hasAdSenseUnit) return;

        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (error) {
        console.warn("AdSense não carregou neste bloco:", error);
      }
    }

    function injectAd() {
      const currentSlot = ref.current;

      if (!currentSlot || cancelled) return;

      currentSlot.innerHTML = "";

      const template = document.createElement("template");
      template.innerHTML = code;

      const externalScripts: HTMLScriptElement[] = [];
      const inlineScripts: string[] = [];

      Array.from(template.content.childNodes).forEach((node) => {
        if (node.nodeName === "SCRIPT") {
          const oldScript = node as HTMLScriptElement;

          if (oldScript.src) {
            const newScript = document.createElement("script");

            for (const attr of Array.from(oldScript.attributes)) {
              newScript.setAttribute(attr.name, attr.value);
            }

            newScript.setAttribute("data-ad-position", position);
            newScript.setAttribute("data-ad-route", routeKey);
            newScript.async = true;

            externalScripts.push(newScript);
          } else if (oldScript.textContent) {
            inlineScripts.push(oldScript.textContent);
          }
        } else {
          currentSlot.appendChild(node.cloneNode(true));
        }
      });

      window.setTimeout(() => {
        if (cancelled) return;

        externalScripts.forEach((script) => {
          insertedScripts.push(script);
          document.body.appendChild(script);
        });

        window.setTimeout(() => {
          if (cancelled) return;

          inlineScripts.forEach((scriptText) => {
            executeInlineScript(scriptText);
          });

          pushAdSense();
        }, 250);
      }, 150);
    }

    const timer = window.setTimeout(() => {
      injectAd();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      clearSlot();
    };
  }, [code, position, routeKey]);

  if (!code) return null;

  return (
    <aside
      role="complementary"
      aria-label={label}
      className={`my-8 w-full ${className}`}
      data-ad-position={position}
      data-ad-route={routeKey}
    >
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </p>

      <div
        key={`${position}-${routeKey}`}
        ref={ref}
        className="w-full overflow-visible rounded-md"
        style={{
          minHeight,
        }}
      />
    </aside>
  );
}

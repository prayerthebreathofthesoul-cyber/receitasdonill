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

type ScriptInfo = {
  src: string | null;
  text: string;
  attrs: Array<{
    name: string;
    value: string;
  }>;
  hasAsync: boolean;
};

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

    function normalizeScriptUrl(src: string) {
      if (src.startsWith("//")) {
        return `${window.location.protocol}${src}`;
      }

      return src;
    }

    function clearSlot() {
      insertedScripts.forEach((script) => {
        script.remove();
      });

      if (ref.current) {
        ref.current.innerHTML = "";
      }
    }

    function collectScripts(template: HTMLTemplateElement): ScriptInfo[] {
      const scriptElements = Array.from(
        template.content.querySelectorAll("script"),
      );

      return scriptElements.map((oldScript) => {
        const info: ScriptInfo = {
          src: oldScript.getAttribute("src"),
          text: oldScript.textContent || "",
          attrs: Array.from(oldScript.attributes).map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
          hasAsync: oldScript.hasAttribute("async"),
        };

        oldScript.remove();

        return info;
      });
    }

    function createScript(scriptInfo: ScriptInfo) {
      const script = document.createElement("script");

      scriptInfo.attrs.forEach((attr) => {
        if (attr.name === "src") return;
        if (attr.name === "async") return;

        script.setAttribute(attr.name, attr.value);
      });

      script.setAttribute("data-ad-position", position);
      script.setAttribute("data-ad-route", routeKey);

      if (scriptInfo.src) {
        script.async = scriptInfo.hasAsync;
        script.src = normalizeScriptUrl(scriptInfo.src);
      } else {
        script.text = scriptInfo.text;
      }

      return script;
    }

    function pushAdSenseIfNeeded() {
      try {
        const currentSlot = ref.current;

        if (!currentSlot) return;

        const adSenseUnits = currentSlot.querySelectorAll(".adsbygoogle");

        if (!adSenseUnits.length) return;

        adSenseUnits.forEach((unit) => {
          const status = unit.getAttribute("data-adsbygoogle-status");

          if (!status) {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
          }
        });
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

      const scripts = collectScripts(template);

      /**
       * Primeiro colocamos o HTML do anúncio dentro do bloco.
       * Isso é importante para Native Banner da Adsterra, que usa:
       * <div id="container-xxxx"></div>
       */
      currentSlot.appendChild(template.content.cloneNode(true));

      const inlineScripts = scripts.filter((script) => !script.src);
      const externalScripts = scripts.filter((script) => script.src);

      /**
       * Depois executamos scripts inline.
       * Isso é essencial para Banner da Adsterra, porque o atOptions
       * precisa existir antes do invoke.js.
       */
      inlineScripts.forEach((scriptInfo) => {
        if (cancelled) return;

        const script = createScript(scriptInfo);
        insertedScripts.push(script);
        currentSlot.appendChild(script);
      });

      /**
       * Por último carregamos scripts externos.
       * Eles são adicionados dentro do próprio bloco do anúncio,
       * não no document.body.
       */
      externalScripts.forEach((scriptInfo) => {
        if (cancelled) return;

        const script = createScript(scriptInfo);
        insertedScripts.push(script);
        currentSlot.appendChild(script);
      });

      window.setTimeout(() => {
        if (cancelled) return;
        pushAdSenseIfNeeded();
      }, 400);
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

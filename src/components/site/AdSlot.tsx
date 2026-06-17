import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  position: string;
  label?: string;
  className?: string;
}

export function AdSlot({
  position,
  label = "Publicidade",
  className = "",
}: AdSlotProps) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const [renderKey, setRenderKey] = useState(0);

  const routeKey = useMemo(() => {
    return `${location.pathname}-${location.searchStr || ""}`;
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
    staleTime: 60_000,
  });

  const code = data?.code ?? null;

  useEffect(() => {
    setRenderKey((current) => current + 1);
  }, [routeKey, position]);

  useEffect(() => {
    const el = ref.current;

    if (!el || !code) return;

    let isCancelled = false;
    const insertedScripts: HTMLScriptElement[] = [];

    const timer = window.setTimeout(() => {
      if (isCancelled || !ref.current) return;

      const currentEl = ref.current;

      currentEl.innerHTML = "";

      const previousScripts = document.querySelectorAll(
        `script[data-ad-position="${position}"]`
      );

      previousScripts.forEach((script) => {
        script.remove();
      });

      const template = document.createElement("template");
      template.innerHTML = code;

      Array.from(template.content.childNodes).forEach((node) => {
        if (node.nodeName === "SCRIPT") {
          const oldScript = node as HTMLScriptElement;
          const newScript = document.createElement("script");

          for (const attr of Array.from(oldScript.attributes)) {
            newScript.setAttribute(attr.name, attr.value);
          }

          newScript.setAttribute("data-ad-position", position);
          newScript.setAttribute("data-ad-route", routeKey);
          newScript.async = true;

          if (oldScript.textContent) {
            newScript.text = oldScript.textContent;
          }

          insertedScripts.push(newScript);
        } else {
          currentEl.appendChild(node.cloneNode(true));
        }
      });

      insertedScripts.forEach((script) => {
        document.body.appendChild(script);
      });
    }, 150);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);

      insertedScripts.forEach((script) => {
        script.remove();
      });

      const currentEl = ref.current;

      if (currentEl) {
        currentEl.innerHTML = "";
      }
    };
  }, [code, position, routeKey, renderKey]);

  if (!code) return null;

  return (
    <aside
      role="complementary"
      aria-label={label}
      className={`my-8 ${className}`}
      data-ad-position={position}
      data-ad-route={routeKey}
    >
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </p>

      <div
        key={`${position}-${routeKey}-${renderKey}`}
        ref={ref}
        className="flex min-h-[250px] w-full justify-center overflow-visible rounded-md"
      />
    </aside>
  );
}

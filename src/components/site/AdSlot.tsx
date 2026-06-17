import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
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
  const ref = useRef<HTMLDivElement | null>(null);

  const routeKey = location.href;

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
    refetchOnWindowFocus: false,
  });

  const code = data?.code ?? null;

  useEffect(() => {
    const slotElement = ref.current;

    if (!slotElement || !code) return;

    let cancelled = false;
    const insertedScripts: HTMLScriptElement[] = [];

    const timer = window.setTimeout(() => {
      const currentSlot = ref.current;

      if (cancelled || !currentSlot) return;

      currentSlot.innerHTML = "";

      const oldScripts = document.querySelectorAll(
        `script[data-ad-position="${position}"]`
      );

      oldScripts.forEach((script) => {
        script.remove();
      });

      const template = document.createElement("template");
      template.innerHTML = code;

      Array.from(template.content.childNodes).forEach((node) => {
        if (node.nodeName === "SCRIPT") {
          const originalScript = node as HTMLScriptElement;
          const newScript = document.createElement("script");

          for (const attr of Array.from(originalScript.attributes)) {
            newScript.setAttribute(attr.name, attr.value);
          }

          newScript.setAttribute("data-ad-position", position);
          newScript.setAttribute("data-ad-route", routeKey);
          newScript.async = true;

          if (originalScript.textContent) {
            newScript.text = originalScript.textContent;
          }

          insertedScripts.push(newScript);
        } else {
          currentSlot.appendChild(node.cloneNode(true));
        }
      });

      insertedScripts.forEach((script) => {
        currentSlot.appendChild(script);
      });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);

      insertedScripts.forEach((script) => {
        script.remove();
      });

      const currentSlot = ref.current;

      if (currentSlot) {
        currentSlot.innerHTML = "";
      }
    };
  }, [code, position, routeKey]);

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
        key={`${position}-${routeKey}`}
        ref={ref}
        className="flex min-h-[250px] w-full justify-center overflow-visible rounded-md"
      />
    </aside>
  );
}

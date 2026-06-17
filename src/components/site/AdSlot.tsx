import { useQuery } from "@tanstack/react-query";
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
  const ref = useRef<HTMLDivElement>(null);

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
    const el = ref.current;

    if (!el || !code) return;

    el.innerHTML = "";

    const previousScripts = document.querySelectorAll(
      `script[data-ad-position="${position}"]`
    );

    previousScripts.forEach((script) => {
      script.remove();
    });

    const template = document.createElement("template");
    template.innerHTML = code;

    const scripts: HTMLScriptElement[] = [];

    Array.from(template.content.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement("script");

        for (const attr of Array.from(oldScript.attributes)) {
          newScript.setAttribute(attr.name, attr.value);
        }

        newScript.setAttribute("data-ad-position", position);

        if (oldScript.textContent) {
          newScript.text = oldScript.textContent;
        }

        scripts.push(newScript);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });

    scripts.forEach((script) => {
      document.body.appendChild(script);
    });

    return () => {
      scripts.forEach((script) => {
        script.remove();
      });

      if (el) {
        el.innerHTML = "";
      }
    };
  }, [code, position]);

  if (!code) return null;

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

      <div
        ref={ref}
        className="flex min-h-[250px] w-full justify-center overflow-visible rounded-md"
      />
    </aside>
  );
}

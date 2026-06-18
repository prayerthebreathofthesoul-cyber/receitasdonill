import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  position: string;
  label?: string;
  className?: string;
  minHeight?: number;
}

export function AdSlot({
  position,
  label = "Publicidade",
  className = "",
  minHeight = 250,
}: AdSlotProps) {
  const location = useLocation();

  const routeKey = useMemo(() => {
    return `${location.pathname}${location.searchStr || ""}`;
  }, [location.pathname, location.searchStr]);

  const { data } = useQuery({
    queryKey: ["ad-slot", position, routeKey],
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
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  const code = data?.code ?? null;

  const srcDoc = useMemo(() => {
    if (!code) return "";

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <base target="_blank" />
          <style>
            html,
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              min-height: ${minHeight}px;
              background: transparent;
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }

            iframe,
            img,
            embed,
            object {
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          ${code}
        </body>
      </html>
    `;
  }, [code, minHeight]);

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

      <iframe
        key={`${position}-${routeKey}-${code.slice(0, 40)}`}
        title={`Anúncio ${position}`}
        srcDoc={srcDoc}
        loading="lazy"
        scrolling="no"
        className="block w-full overflow-hidden border-0"
        style={{
          minHeight,
          height: minHeight,
          border: 0,
        }}
      />
    </aside>
  );
}

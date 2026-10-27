"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";

/**
 * Subtle, config-gated Google AdSense slot.
 *  - Renders NOTHING unless NEXT_PUBLIC_ADSENSE_CLIENT and the placement slot id are set.
 *  - Never displayed during an active exam or study session (product policy).
 *  - Labeled "Advertisement/Publicidade" (transparency).
 * Set up: NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXX, NEXT_PUBLIC_ADSENSE_SLOT_HOME / _RESULTS / _GUIDE.
 */
export function AdSlot({ placement, className }: { placement: "home" | "results" | "guide"; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot =
    placement === "home"
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME
      : placement === "results"
        ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS
        : process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE;

  const pushed = useRef(false);
  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle ?? [];
      w.adsbygoogle.push({});
    } catch {
      /* ad blockers etc. */
    }
  }, [client, slot]);

  const { t } = useLang();

  if (!client || !slot) return null;

  return (
    <aside
      role="complementary"
      aria-label={t.footer.adsLabel}
      className={cn("mx-auto w-full max-w-3xl px-4", className)}
    >
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {t.footer.adsLabel}
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

/** Loads the AdSense library once, only when configured. Render inside layout-level tree. */
export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;
  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}

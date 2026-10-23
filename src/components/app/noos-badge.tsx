"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { hubHomeUrl } from "@/lib/axon/deep-links";

/**
 * "by Noos" endorsement badge (Noos identity manual — Guia de Adaptação, Fase 1).
 *
 * Rules enforced here:
 *  - Compact mark, positive on light / negative on dark.
 *  - Soft ink (muted), never a title, never a primary button, shown once
 *    (footer only) — the app's own name prevails on every screen.
 *  - Links to the Noos hub with the free canonical fallback URL embedded until
 *    noos.study exists (NEXT_PUBLIC_NOOS_HUB_URL overrides it).
 *  - The word is "Noos" — no accent, no caps, no translation, in any language.
 *
 * Sizing (founder feedback 2026-10-23 — overrides the manual's 11–13 px mark):
 * the 12 px mark read as "small on mobile, tiny on desktop". Now responsive:
 *  - Mobile: 16 px mark / 11 px text (46% of the 24 px app name).
 *  - Desktop (md+): 20 px mark / 13 px text (54% of the 24 px app name) —
 *    larger screens are viewed from farther away, so the endorsement scales up.
 */
export function NoosBadge({ className }: { className?: string }) {
  const { lang } = useLang();
  return (
    <a
      href={hubHomeUrl(lang)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <img src="/brand/noos-compact.svg" alt="" width={16} height={16} aria-hidden className="h-4 w-4 dark:hidden md:h-5 md:w-5" />
      <img src="/brand/noos-mark-negative.svg" alt="" width={16} height={16} aria-hidden className="hidden h-4 w-4 dark:block md:h-5 md:w-5" />
      <span className="font-newsreader text-[11px] italic leading-none tracking-wide md:text-[13px]">by Noos</span>
    </a>
  );
}

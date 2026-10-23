"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { hubHomeUrl } from "@/lib/axon/deep-links";

/**
 * "by Noos" endorsement badge (Noos identity manual — Guia de Adaptação, Fase 1).
 *
 * Rules enforced here:
 *  - Compact mark at 11–13 px (12 px): positive on light, negative on dark.
 *  - Endorsement text at 32–40% of the app name body: the footer renders the
 *    app name at text-2xl (24 px) → badge text at 9 px = 37.5%.
 *  - Soft ink (muted), never a title, never a primary button, shown once
 *    (footer only) — the app's own name prevails on every screen.
 *  - Links to the Noos hub with the free canonical fallback URL embedded until
 *    noos.study exists (NEXT_PUBLIC_NOOS_HUB_URL overrides it).
 *  - The word is "Noos" — no accent, no caps, no translation, in any language.
 */
export function NoosBadge({ className }: { className?: string }) {
  const { lang } = useLang();
  return (
    <a
      href={hubHomeUrl(lang)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <img src="/brand/noos-compact.svg" alt="" width={12} height={12} aria-hidden className="h-3 w-3 dark:hidden" />
      <img src="/brand/noos-mark-negative.svg" alt="" width={12} height={12} aria-hidden className="hidden h-3 w-3 dark:block" />
      <span className="font-newsreader text-[9px] italic leading-none tracking-wide">by Noos</span>
    </a>
  );
}

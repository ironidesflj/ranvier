/**
 * Axon (F1) — Deep-links to the Noos hub.
 *
 * The only ecosystem seam in the app UI: the Community button deep-links to
 * the question's discussion page on the hub, anchored by the stable public ID,
 * generated in the current interface language. The hub being down never breaks
 * study — these are links, not dependencies.
 *
 * Canonical hub domain: noos.study (register per the Carta).
 * Free canonical fallback (until the domain exists): https://noos-hub.vercel.app
 * Override with NEXT_PUBLIC_NOOS_HUB_URL once noos.study is live.
 */

import type { Lang } from "@/lib/types";

export const NOOS_HUB_CANONICAL_URL = "https://noos.study";
export const NOOS_HUB_FALLBACK_URL = "https://noos-hub.vercel.app";

/** Hub base URL (env-configurable; defaults to the free canonical fallback). */
export function hubBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_NOOS_HUB_URL;
  const base = fromEnv && fromEnv.trim() ? fromEnv.trim() : NOOS_HUB_FALLBACK_URL;
  return base.replace(/\/+$/, "");
}

/** Deep-link to a question's discussion page, in the current UI language. */
export function discussionUrl(publicId: string, lang: Lang): string {
  return `${hubBaseUrl()}/${lang}/q/${publicId}`;
}

/** Hub home, in the current UI language (badge target). */
export function hubHomeUrl(lang: Lang): string {
  return `${hubBaseUrl()}/${lang}`;
}

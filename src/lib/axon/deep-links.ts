/**
 * Axon — deep-links to the Noos hub (fatia 5: format adopted; the canonical
 * domain flip ships when the hub pages go live).
 *
 * Links, not dependencies: zero hub fetches at runtime — the hub being down
 * never breaks study. The origins match the package's canonicalUrl /
 * fallbackUrl; NEXT_PUBLIC_NOOS_HUB_URL overrides the base (set it to
 * https://noos.study once the hub's /q/ pages are lit).
 *
 * The public ID is validated before a URL is built (constitution §3): a
 * broken link on a published ID is a contract violation — fail here, at
 * render time, not at the student's click. CI guarantees every registry ID
 * is valid, so this guard never fires in practice; it exists so a future
 * regression cannot ship silently.
 */
import { validateId } from "@ironidesflj/axon";
import type { Lang } from "@/lib/types";

export const NOOS_HUB_CANONICAL_URL = "https://noos.study"; // package canonicalUrl origin
export const NOOS_HUB_FALLBACK_URL = "https://noos-hub.vercel.app"; // package fallbackUrl origin

/** Hub base URL (env-configurable; defaults to the free canonical fallback). */
export function hubBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_NOOS_HUB_URL;
  const base = fromEnv && fromEnv.trim() ? fromEnv.trim() : NOOS_HUB_FALLBACK_URL;
  return base.replace(/\/+$/, "");
}

/** Deep-link to a question's discussion page, in the current UI language. */
export function discussionUrl(publicId: string, lang: Lang): string {
  const v = validateId(publicId);
  if (!v.ok) {
    throw new Error(`invalid publicId for deep-link: ${publicId} — ${v.reason} (constitution §3)`);
  }
  return `${hubBaseUrl()}/${lang}/q/${publicId}`;
}

/** Hub home, in the current UI language (badge target). */
export function hubHomeUrl(lang: Lang): string {
  return `${hubBaseUrl()}/${lang}`;
}

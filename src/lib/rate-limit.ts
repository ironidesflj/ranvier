/**
 * Best-effort in-memory rate limiter (per-instance; documented in SDD as a
 * single-instance mitigation — swap for Upstash/Redis when scaling out).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Best-effort client IP extraction.
 * Red Team F2 hardening: never trust the FIRST X-Forwarded-For entry (client-spoofable).
 * Behind a single trusted reverse proxy (Caddy/Vercel), the proxy appends the real
 * client IP as the LAST entry — so we scan from the right and take the first
 * public (non-private) address. Direct access (no XFF) falls back to "local".
 */
function isPrivateIp(ip: string): boolean {
  if (/^(10|127)\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^(::1|fc|fd|fe80)/i.test(ip)) return true;
  if (ip === "unknown") return true;
  return false;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const entries = xff.split(",").map((s) => s.trim()).filter(Boolean);
    for (let i = entries.length - 1; i >= 0; i--) {
      if (!isPrivateIp(entries[i])) return entries[i];
    }
    // All private (internal call chain) — use the last entry as a stable key.
    if (entries.length > 0) return entries[entries.length - 1];
  }
  return "local";
}

export function rateLimit(req: Request, route: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const key = `${route}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Occasionally prune expired buckets to bound memory. */
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }, 60_000);
  // Don't hold the event loop open (serverless-friendly).
  (timer as unknown as { unref?: () => void }).unref?.();
}

export const LIMITS = {
  auth: { limit: 10, windowMs: 5 * 60_000 },
  startAttempt: { limit: 30, windowMs: 5 * 60_000 },
  answer: { limit: 300, windowMs: 5 * 60_000 },
  submit: { limit: 60, windowMs: 5 * 60_000 },
  read: { limit: 300, windowMs: 60_000 },
  /* v1.7.0 — flashcards: draw é 1 por sessão (mas re-draws acontecem);
     review é 1 por cartão (com re-entradas, uma sessão de 50 bate ~100). */
  flashcardsDraw: { limit: 60, windowMs: 5 * 60_000 },
  flashcardsReview: { limit: 300, windowMs: 5 * 60_000 },
} as const;

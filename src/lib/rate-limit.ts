import { db } from "@/lib/db";

/** Shared fixed-window limiter backed by Neon/Prisma across all Vercel instances. */
function isPrivateIp(ip: string): boolean {
  if (/^(10|127)\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^(::1|fc|fd|fe80)/i.test(ip)) return true;
  return ip === "unknown";
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const entries = xff.split(",").map((s) => s.trim()).filter(Boolean);
    for (let i = entries.length - 1; i >= 0; i--) {
      if (!isPrivateIp(entries[i])) return entries[i];
    }
    if (entries.length > 0) return entries[entries.length - 1];
  }
  return "local";
}

export async function rateLimit(req: Request, route: string, limit: number, windowMs: number) {
  const id = `${route}:${clientIp(req)}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const existing = await db.rateLimitBucket.findUnique({ where: { id } });

  if (!existing || existing.resetAt <= now) {
    await db.rateLimitBucket.upsert({ where: { id }, create: { id, count: 1, resetAt }, update: { count: 1, resetAt } });
    return { ok: true, retryAfterSec: 0 };
  }

  const next = await db.rateLimitBucket.updateMany({
    where: { id, resetAt: existing.resetAt, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });
  if (next.count === 0 || existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000)) };
  }
  return { ok: true, retryAfterSec: 0 };
}

export const LIMITS = {
  auth: { limit: 10, windowMs: 5 * 60_000 },
  startAttempt: { limit: 30, windowMs: 5 * 60_000 },
  answer: { limit: 300, windowMs: 5 * 60_000 },
  submit: { limit: 60, windowMs: 5 * 60_000 },
  read: { limit: 300, windowMs: 60_000 },
  flashcardsDraw: { limit: 60, windowMs: 5 * 60_000 },
  flashcardsReveal: { limit: 300, windowMs: 5 * 60_000 },
  flashcardsGrade: { limit: 300, windowMs: 5 * 60_000 },
  trails: { limit: 60, windowMs: 5 * 60_000 },
} as const;

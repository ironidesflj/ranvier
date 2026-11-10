import { NextResponse } from "next/server";
import { z } from "zod";
import { listAttempts } from "@/lib/attempt-service";
import { getFlashcardsSummary } from "@/lib/flashcard-service";
import { getTrails } from "@/lib/trail-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import type { HomeOverview } from "@/lib/types";

/**
 * Home overview (perf fix 2026-11-10): the landing needs attempts, flashcards
 * summary and trails in the same render. Three separate GETs cost three
 * rate-limit round-trips plus three DB wake-ups on cold Neon; this endpoint
 * runs the three owner-scoped queries in PARALLEL behind ONE rate limit and
 * one HTTP request. Owner-scoped payload — no edge caching (same rule as the
 * individual endpoints; they remain available for deep links).
 */
const querySchema = z.object({
  certSlug: z.string().min(1).max(120),
  lang: z.enum(["en", "pt"]).default("en"),
});

export async function GET(req: Request) {
  const rl = await rateLimit(req, "overview", LIMITS.read.limit, LIMITS.read.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      certSlug: url.searchParams.get("certSlug") ?? "",
      lang: url.searchParams.get("lang") ?? "en",
    });
    if (!parsed.success) return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });

    const [attempts, flashcards, trails] = await Promise.all([
      listAttempts(),
      getFlashcardsSummary(parsed.data.certSlug),
      getTrails(parsed.data.certSlug, parsed.data.lang),
    ]);
    const body: HomeOverview = { attempts, flashcards, trails };
    return NextResponse.json(body);
  } catch (err) {
    return jsonError(err);
  }
}

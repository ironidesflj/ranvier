import { NextResponse } from "next/server";
import { getFlashcardsSummary } from "@/lib/flashcard-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

/**
 * Flashcards summary (v1.7.0): due/new/total/mature counts for the active
 * certification — feeds the Home CTA ("N para hoje") and the Progress block.
 *
 * Per-owner payload (anonymous cookie or session) — NO edge caching here,
 * unlike the public catalog.
 */
export async function GET(req: Request) {
  const rl = rateLimit(req, "flashcards-summary", LIMITS.read.limit, LIMITS.read.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const certSlug = new URL(req.url).searchParams.get("certSlug") ?? "";
    if (!certSlug.trim() || certSlug.length > 120) {
      return NextResponse.json({ error: "Invalid certSlug" }, { status: 400 });
    }
    const summary = await getFlashcardsSummary(certSlug);
    return NextResponse.json(summary);
  } catch (err) {
    return jsonError(err);
  }
}

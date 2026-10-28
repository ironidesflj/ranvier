import { NextResponse } from "next/server";
import { z } from "zod";
import { revealFlashcard } from "@/lib/flashcard-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const revealSchema = z.object({
  questionId: z.string().min(1).max(64),
});

/**
 * Reveal a flashcard (v1.8.0 §4): READ-ONLY — returns the card back
 * (correct index, explanations, reference) plus the SRS projections for
 * both judgment buttons. The answer index travels only AFTER the student
 * turned the card (same exposure the study mode has after any answer);
 * grading happens separately, so a revealed card left without judgment
 * records no review.
 */
export async function POST(req: Request) {
  const rl = await rateLimit(req, "flashcards-reveal", LIMITS.flashcardsReveal.limit, LIMITS.flashcardsReveal.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = revealSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const result = await revealFlashcard(parsed.data.questionId);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

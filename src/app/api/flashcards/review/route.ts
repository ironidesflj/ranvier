import { NextResponse } from "next/server";
import { z } from "zod";
import { reviewFlashcard } from "@/lib/flashcard-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const reviewSchema = z.object({
  questionId: z.string().min(1).max(64),
  /** 0–3 canonical index; null = "pular" (reveal without answering — counts as forgot). */
  selectedIndex: z.number().int().min(0).max(3).nullable(),
});

/**
 * Review one flashcard (v1.7.0): server-side grading (same security model
 * as study mode — the answer index only travels back AFTER the attempt),
 * then the SM-2 state transition is applied and returned as the card back.
 */
export async function POST(req: Request) {
  const rl = await rateLimit(req, "flashcards-review", LIMITS.flashcardsReview.limit, LIMITS.flashcardsReview.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const result = await reviewFlashcard(parsed.data.questionId, parsed.data.selectedIndex);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

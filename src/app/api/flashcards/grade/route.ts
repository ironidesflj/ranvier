import { NextResponse } from "next/server";
import { z } from "zod";
import { gradeFlashcard } from "@/lib/flashcard-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const gradeSchema = z.object({
  questionId: z.string().min(1).max(64),
  /** Student's honest self-assessment: did they recall the answer? */
  remembered: z.boolean(),
});

/**
 * Grade a flashcard (v1.8.0 §4): WRITE — applies the SM-2 transition with
 * the student's binary self-assessment and returns the new scheduling.
 * Self-assessment is a study tool, not a test (documented in the spec);
 * the binary rule is stated in the UI ("Acertei = you'd say the right
 * answer from memory").
 */
export async function POST(req: Request) {
  const rl = rateLimit(req, "flashcards-grade", LIMITS.flashcardsGrade.limit, LIMITS.flashcardsGrade.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = gradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const result = await gradeFlashcard(parsed.data.questionId, parsed.data.remembered);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

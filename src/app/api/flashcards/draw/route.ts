import { NextResponse } from "next/server";
import { z } from "zod";
import { drawFlashcards } from "@/lib/flashcard-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const drawSchema = z.object({
  certSlug: z.string().min(1).max(120),
  domainCodes: z.array(z.number().int().min(1).max(20)).max(20).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  scope: z.enum(["mixed", "due", "new"]),
});

/**
 * Draw the flashcard queue (v1.7.0): due cards first (most overdue first),
 * then new ones filling the limit. Cards are PublicQuestion DTOs — the
 * correct answer NEVER travels here; grading happens on review.
 */
export async function POST(req: Request) {
  const rl = rateLimit(req, "flashcards-draw", LIMITS.flashcardsDraw.limit, LIMITS.flashcardsDraw.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = drawSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const result = await drawFlashcards(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

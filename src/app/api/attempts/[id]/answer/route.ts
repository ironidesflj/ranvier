import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/lib/attempt-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const answerSchema = z.object({
  questionId: z.string().min(1).max(64),
  selectedIndex: z.number().int().min(0).max(3),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rl = await rateLimit(req, "answer", LIMITS.answer.limit, LIMITS.answer.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const result = await answerQuestion(id, parsed.data.questionId, parsed.data.selectedIndex);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

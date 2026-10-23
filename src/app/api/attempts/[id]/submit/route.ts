import { NextResponse } from "next/server";
import { submitAttempt } from "@/lib/attempt-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(req, "submit", LIMITS.submit.limit, LIMITS.submit.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const { id } = await ctx.params;
    const result = await submitAttempt(id);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

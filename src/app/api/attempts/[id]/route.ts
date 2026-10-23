import { NextResponse } from "next/server";
import { getAttemptDetail } from "@/lib/attempt-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(req, "attempt-get", LIMITS.read.limit, LIMITS.read.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const { id } = await ctx.params;
    const detail = await getAttemptDetail(id);
    return NextResponse.json(detail);
  } catch (err) {
    return jsonError(err);
  }
}

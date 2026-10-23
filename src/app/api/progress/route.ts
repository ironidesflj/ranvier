import { NextResponse } from "next/server";
import { getProgress } from "@/lib/attempt-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const rl = rateLimit(req, "progress", LIMITS.read.limit, LIMITS.read.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const progress = await getProgress();
    return NextResponse.json(progress);
  } catch (err) {
    return jsonError(err);
  }
}

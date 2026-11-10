import { NextResponse } from "next/server";
import { getProgress } from "@/lib/attempt-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const rl = await rateLimit(req, "progress", LIMITS.read.limit, LIMITS.read.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const certSlug = new URL(req.url).searchParams.get("certSlug") ?? "";
    if (!certSlug) return NextResponse.json({ error: "certSlug is required" }, { status: 400 });
    const progress = await getProgress(certSlug);
    return NextResponse.json(progress);
  } catch (err) {
    return jsonError(err);
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { listAttempts, startAttempt } from "@/lib/attempt-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const startSchema = z.object({
  certSlug: z.string().min(1).max(120),
  /** TRAIL (v1.8.0): sequenced tranche on one domain — requires domainCodes=[code]. */
  mode: z.enum(["STUDY", "EXAM", "TRAIL"]),
  domainCodes: z.array(z.number().int().min(1).max(20)).max(20).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  questionIds: z.array(z.string().min(1).max(64)).max(50).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(req, "attempts-post", LIMITS.startAttempt.limit, LIMITS.startAttempt.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const result = await startAttempt(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

export async function GET(req: Request) {
  const rl = rateLimit(req, "attempts-get", LIMITS.read.limit, LIMITS.read.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const attempts = await listAttempts();
    return NextResponse.json({ attempts });
  } catch (err) {
    return jsonError(err);
  }
}

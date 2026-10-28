import { NextResponse } from "next/server";
import { z } from "zod";
import { getTrails } from "@/lib/trail-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const querySchema = z.object({
  certSlug: z.string().min(1).max(120),
  lang: z.enum(["en", "pt"]).default("en"),
});

/**
 * Trails summary (v1.8.0 §5.5): the 7 official domains as an ordered study
 * route with DERIVED progress (AttemptAnswer correct in any mode — zero
 * new tables). Owner-scoped payload: no edge caching (same rule as the
 * flashcards summary).
 */
export async function GET(req: Request) {
  const rl = rateLimit(req, "trails", LIMITS.trails.limit, LIMITS.trails.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      certSlug: url.searchParams.get("certSlug") ?? "",
      lang: url.searchParams.get("lang") ?? "en",
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }
    const result = await getTrails(parsed.data.certSlug, parsed.data.lang);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

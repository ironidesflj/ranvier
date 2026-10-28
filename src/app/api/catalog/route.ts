import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/attempt-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import type { Lang } from "@/lib/types";

export async function GET(req: Request) {
  const rl = rateLimit(req, "catalog", LIMITS.read.limit, LIMITS.read.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const lang = (new URL(req.url).searchParams.get("lang") === "en" ? "en" : "pt") as Lang;
    const catalog = await getCatalog(lang);
    const res = NextResponse.json({ certifications: catalog });
    // Edge cache (perf fix (b), plan.md): the catalog is a public per-lang
    // payload that only changes when the question bank is re-seeded (deploy)
    // — cacheable for 5 min and swappable-while-revalidating for a day. This
    // takes the ~500ms DB round-trip off the first-hit path for new visitors.
    const cachePolicy = "public, s-maxage=300, stale-while-revalidate=86400";
    res.headers.set("Cache-Control", cachePolicy);
    res.headers.set("CDN-Cache-Control", cachePolicy);
    return res;
  } catch (err) {
    return jsonError(err);
  }
}

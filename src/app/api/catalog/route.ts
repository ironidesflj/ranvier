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
    return NextResponse.json({ certifications: catalog });
  } catch (err) {
    return jsonError(err);
  }
}

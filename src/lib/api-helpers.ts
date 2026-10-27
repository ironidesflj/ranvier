import { NextResponse } from "next/server";
import { ServiceError } from "@/lib/attempt-service";

export function jsonError(err: unknown): NextResponse {
  if (err instanceof ServiceError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api] unexpected error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function tooMany(retryAfterSec: number): NextResponse {
  const res = NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  res.headers.set("Retry-After", String(Math.max(1, retryAfterSec)));
  return res;
}

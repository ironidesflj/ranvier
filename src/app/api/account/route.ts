import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearSessionCookie, getCurrentUser } from "@/lib/session";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { tooMany } from "@/lib/api-helpers";

/**
 * Account deletion — cascades to attempts and answers (no orphan data).
 * Requires an authenticated session; also clears cookies.
 */
export async function DELETE(req: Request) {
  const rl = rateLimit(req, "account-delete", LIMITS.auth.limit, LIMITS.auth.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    await db.user.delete({ where: { id: user.id } }); // attempts + answers cascade
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api] account delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

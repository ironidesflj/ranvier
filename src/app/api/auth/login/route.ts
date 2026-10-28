import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { mergeAnonAttemptsIntoUser, mergeAnonFlashcardsIntoUser, setSessionCookie } from "@/lib/session";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { tooMany } from "@/lib/api-helpers";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  const rl = rateLimit(req, "auth-login", LIMITS.auth.limit, LIMITS.auth.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    // Constant-ish work to avoid trivial timing oracle
    const hash = user?.passwordHash ?? "00$00";
    const ok = verifyPassword(parsed.data.password, hash);
    if (!user || !ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    await setSessionCookie(user.id);
    const merged = await mergeAnonAttemptsIntoUser(user.id);
    await mergeAnonFlashcardsIntoUser(user.id); // v1.7.0 — SRS state follows the account
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, mergedAttempts: merged });
  } catch (err) {
    console.error("[api] login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

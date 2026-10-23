import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { mergeAnonAttemptsIntoUser, setSessionCookie } from "@/lib/session";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { tooMany } from "@/lib/api-helpers";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(req, "auth-register", LIMITS.auth.limit, LIMITS.auth.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password (min 8 characters)." }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Red Team F3: equalize timing with the creation path (dummy scrypt) so
      // response latency does not reveal whether the account exists.
      hashPassword("timing-equalization-dummy");
      // Generic message to avoid account enumeration
      return NextResponse.json({ error: "Unable to create the account with these credentials." }, { status: 409 });
    }
    const user = await db.user.create({
      data: { email, name: parsed.data.name ?? null, passwordHash: hashPassword(parsed.data.password) },
      select: { id: true, email: true, name: true },
    });
    await setSessionCookie(user.id);
    const merged = await mergeAnonAttemptsIntoUser(user.id);
    return NextResponse.json({ user, mergedAttempts: merged }, { status: 201 });
  } catch (err) {
    console.error("[api] register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

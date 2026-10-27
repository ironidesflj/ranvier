import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSessionToken, verifySessionToken } from "@/lib/auth";
import type { PublicUser } from "@/lib/types";

/**
 * Session resolution for API routes.
 * Two identity modes:
 *  1) Logged-in user  → signed httpOnly cookie `ct_session`
 *  2) Anonymous       → random httpOnly cookie `ct_anon` (server-side progress that is
 *                       merged into the account on login/register)
 */

export const ANON_COOKIE = "ct_anon";
export const SESSION_COOKIE = "ct_session";

const isProd = process.env.NODE_ENV === "production";

export interface Owner {
  userId: string | null;
  anonId: string | null;
}

/** Resolve the current owner; sets the anonymous cookie on first contact when needed. */
export async function resolveOwner(): Promise<Owner> {
  const jar = await cookies();
  const sessionToken = jar.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(sessionToken);
  if (userId) {
    // Red Team F1: verify the user still exists (account may have been deleted).
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (user) return { userId, anonId: null };
    // Stale session for a deleted account: clear it and fall back to anonymous.
    jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 0, path: "/" });
  }

  let anonId = jar.get(ANON_COOKIE)?.value;
  if (!anonId) {
    anonId = randomUUID();
    jar.set(ANON_COOKIE, anonId, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
  }
  return { userId: null, anonId };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const userId = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } });
  return user ?? null;
}

/** Prisma `where` matching attempts owned by the current identity. */
export async function ownerWhere(): Promise<{ userId: string } | { anonId: string; userId: null }> {
  const { userId, anonId } = await resolveOwner();
  if (userId) return { userId };
  return { anonId: anonId!, userId: null };
}

export async function setSessionCookie(userId: string): Promise<void> {
  const jar = await cookies();
  const { token, maxAgeSec } = createSessionToken(userId);
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: maxAgeSec,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 0, path: "/" });
}

/**
 * Merge anonymous attempts into a user account (on login/register).
 * Prevents data orphaning and gives instant "sync" on first login.
 */
export async function mergeAnonAttemptsIntoUser(userId: string): Promise<number> {
  const jar = await cookies();
  const anonId = jar.get(ANON_COOKIE)?.value;
  if (!anonId) return 0;
  const res = await db.attempt.updateMany({
    where: { anonId, userId: null },
    data: { userId, anonId: null },
  });
  return res.count;
}

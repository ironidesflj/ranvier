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

/**
 * Merge anonymous flashcard SRS state into a user account (v1.7.0 —
 * spec docs/sdd/spec-v1.7.0-flashcards.md §4).
 *
 * Collision rule (same question reviewed both anonymously and on the
 * account): keep the row with MORE `reps` (more history wins); tie → keep
 * the account's row. Deterministic, no history silently lost.
 */
export async function mergeAnonFlashcardsIntoUser(userId: string): Promise<number> {
  const jar = await cookies();
  const anonId = jar.get(ANON_COOKIE)?.value;
  if (!anonId) return 0;

  const anonRows = await db.flashcardState.findMany({ where: { anonId, userId: null } });
  if (anonRows.length === 0) return 0;

  const anonQuestionIds = anonRows.map((r) => r.questionId);
  const userRows = await db.flashcardState.findMany({ where: { userId, questionId: { in: anonQuestionIds } } });
  const userByQuestion = new Map(userRows.map((r) => [r.questionId, r]));

  let merged = 0;
  await db.$transaction(async (tx) => {
    for (const anon of anonRows) {
      const userRow = userByQuestion.get(anon.questionId);
      if (!userRow) {
        // No collision: the anonymous row simply becomes the user's.
        await tx.flashcardState.update({ where: { id: anon.id }, data: { userId, anonId: null } });
        merged += 1;
      } else if (anon.reps > userRow.reps) {
        // Anonymous history is richer: carry its SRS state onto the user row.
        await tx.flashcardState.update({
          where: { id: userRow.id },
          data: {
            ease: anon.ease,
            intervalDays: anon.intervalDays,
            reps: anon.reps,
            lapses: anon.lapses,
            dueAt: anon.dueAt,
            lastReviewedAt: anon.lastReviewedAt,
          },
        });
        await tx.flashcardState.delete({ where: { id: anon.id } });
        merged += 1;
      } else {
        // Account history wins (or ties): drop the anonymous duplicate.
        await tx.flashcardState.delete({ where: { id: anon.id } });
      }
    }
  });
  return merged;
}

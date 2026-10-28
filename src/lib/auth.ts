import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Lightweight auth primitives:
 *  - Password hashing with scrypt (salted, per-user).
 *  - Stateless session tokens: `${userId}.${expiry}.${hmac}` signed with SESSION_SECRET.
 * No external dependencies; httpOnly cookies are set in session.ts.
 */

function sessionSecret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required in production");
  return "ranvier-dev-secret-change-me";
}
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function createSessionToken(userId: string): { token: string; maxAgeSec: number } {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}.${exp}`;
  return { token: `${payload}.${sign(payload)}`, maxAgeSec: Math.floor(TOKEN_TTL_MS / 1000) };
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const payload = `${userId}.${exp}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
}

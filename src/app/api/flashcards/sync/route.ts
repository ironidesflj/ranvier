import { NextResponse } from "next/server";
import { z } from "zod";
import { syncFlashcards } from "@/lib/flashcard-service";
import { jsonError, tooMany } from "@/lib/api-helpers";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

const eventSchema = z.object({
  questionId: z.string().min(1).max(64),
  /** Student's honest self-assessment at the time of the offline judgment. */
  remembered: z.boolean(),
  /** ISO timestamp of when the student judged the card (client clock). */
  occurredAt: z
    .string()
    .min(10)
    .max(40)
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: "occurredAt must be an ISO timestamp" }),
});

const syncSchema = z.object({
  /** ≤200 events per batch (client cap mirrors the local queue cap — spec §4). */
  events: z.array(eventSchema).max(200),
  /** Active certification — optional; lets the response carry a fresh summary. */
  certSlug: z.string().min(1).max(120).optional(),
});

/**
 * Sync the offline flashcard judgment queue (v1.10.0 — spec docs/sdd/
 * spec-v1.10.0-flashcards-offline.md §3): replays the queued judgments IN
 * ORDER as SM-2 reviews (same semantics as /grade, folded per card).
 *
 * A 200 response clears the client queue — applied+skipped is reported so
 * the client can be honest about what happened (never a silent drop).
 * Self-assessment is a study tool, not a test: the replay trusts the
 * student's own judgments, exactly like the online /grade does.
 */
export async function POST(req: Request) {
  const rl = await rateLimit(req, "flashcards-sync", LIMITS.flashcardsSync.limit, LIMITS.flashcardsSync.windowMs);
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    const body = await req.json().catch(() => null);
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const result = await syncFlashcards(parsed.data.events, parsed.data.certSlug);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

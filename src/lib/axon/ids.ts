/**
 * Axon (F1) — Stable public question IDs.
 *
 * Format: {APP}-{EXAM}-{SEQ} — e.g. RAN-DBDEA-00042.
 *  - Prefix is the app's public brand mark (RAN- for Ranvier).
 *  - GLI- IDs published under the old internal codename remain valid forever
 *    as aliases — a published ID is never renamed. (None were ever published,
 *    so the registry starts at RAN- from the very first question.)
 *  - Each app owns its namespace: only Ranvier emits RAN-* (no central issuer,
 *    no cross-sibling collisions by construction).
 *  - Sequential per exam, no recycling: a removed question becomes an epitaph,
 *    never a reused number. Typo fixes keep the ID (version bumps); a rewrite
 *    gets a new ID with a "replaces" pointer.
 */

/** Ranvier's public namespace prefix. */
export const APP_ID_PREFIX = "RAN" as const;

/**
 * Exam code registry (namespace segment of the public ID).
 * DBDEA = Databricks Certified Data Engineer Associate.
 * Future exams (e.g. AZ900, DP700) extend this registry — codes are compact,
 * uppercase, alphanumeric, and immutable once published.
 */
export const EXAM_CODES = {
  DBDEA: "Databricks Certified Data Engineer Associate",
} as const;

export type ExamCode = keyof typeof EXAM_CODES;

/** RAN-<EXAM>-<SEQ>: exam segment 2–8 chars A-Z0-9, 5-digit zero-padded sequence. */
export const QUESTION_ID_PATTERN = /^RAN-[A-Z0-9]{2,8}-\d{5}$/;

/** Formats a stable public question ID. Sequences start at 1. */
export function formatQuestionId(examCode: string, seq: number): string {
  const exam = examCode.toUpperCase();
  if (!/^[A-Z0-9]{2,8}$/.test(exam)) {
    throw new Error(`Invalid exam code for public ID: "${examCode}"`);
  }
  if (!Number.isInteger(seq) || seq < 1 || seq > 99999) {
    throw new Error(`Invalid sequence for public ID: ${seq}`);
  }
  return `${APP_ID_PREFIX}-${exam}-${String(seq).padStart(5, "0")}`;
}

/** Validates the public ID format (RAN-EXAM-SEQ). */
export function isValidQuestionId(id: string): boolean {
  return QUESTION_ID_PATTERN.test(id);
}

/** Parses a public ID into its segments; null when malformed. */
export function parseQuestionId(id: string): { prefix: string; exam: string; seq: number } | null {
  if (!isValidQuestionId(id)) return null;
  const [prefix, exam, seq] = id.split("-");
  return { prefix, exam, seq: Number(seq) };
}

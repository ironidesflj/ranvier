/**
 * Axon (F1) — Question/manifest schemas.
 *
 * The manifest contract (manifest.jsonl, one line per question) is how the hub
 * sees the question bank: the app's CI publishes it as a static file and the
 * hub ingests it on scheduled builds. The app owns the questions and progress;
 * the hub owns the discussions. The public ID is the only seam.
 *
 * Fields (Guia de Adaptação, Tabela 4):
 *  - id         stable public ID (RAN-EXAM-SEQ) — the discussion anchor
 *  - exam       exam code (e.g. DBDEA) — hub navigation by certification
 *  - topics     question topic list — search, filters, per-topic stats
 *  - difficulty declared difficulty — aggregate metric, never individual
 *  - lang       question language — the hub renders the page in this language
 *  - version    current question version — fixes keep the ID, bump the version
 *  - checksum   content checksum — detects manifest/app divergence
 *  - aliases    equivalent IDs already published (GLI- codename mappings)
 *  - snapshot   statement, options, answer and official reference — the hub
 *               serves this without consulting the app at runtime
 */

import { z } from "zod";
import { QUESTION_ID_PATTERN } from "./ids";

export const MANIFEST_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const manifestSnapshotSchema = z.object({
  statement: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  answer: z.enum(["A", "B", "C", "D"]),
  reference: z.string().url(),
  referenceTitle: z.string().min(1),
});

export const manifestLineSchema = z.object({
  id: z.string().regex(QUESTION_ID_PATTERN, "id must match RAN-EXAM-SEQ"),
  exam: z.string().regex(/^[A-Z0-9]{2,8}$/),
  topics: z.array(z.string().min(1)).min(1),
  difficulty: z.enum(MANIFEST_DIFFICULTIES),
  lang: z.string().min(2).max(10),
  version: z.number().int().positive(),
  checksum: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  aliases: z.array(z.string()),
  snapshot: manifestSnapshotSchema,
});

export type ManifestSnapshot = z.infer<typeof manifestSnapshotSchema>;
export type ManifestLine = z.infer<typeof manifestLineSchema>;

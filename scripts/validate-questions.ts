/**
 * Structural validation of the question bank (run with: bun scripts/validate-questions.ts).
 * Does NOT hit the network — purely structural QA before seeding.
 */
import { s1Questions } from "../src/data/questions/s1-platform";
import { s2Questions } from "../src/data/questions/s2-ingestion";
import { s3Questions } from "../src/data/questions/s3-transformation";
import { s4Questions } from "../src/data/questions/s4-jobs";
import { s5Questions } from "../src/data/questions/s5-cicd";
import { s6Questions } from "../src/data/questions/s6-troubleshooting";
import { s7Questions } from "../src/data/questions/s7-governance";
import { ID_REGISTRY, ID_REGISTRY_BY_KEY } from "../src/data/questions/id-registry";
import type { SeedQuestion } from "../src/data/questions/types";
import { CERTIFICATIONS, EXAM_DISTRIBUTION } from "../src/data/certifications";
import { isValidQuestionId, parseQuestionId } from "../src/lib/axon/ids";

const all: SeedQuestion[] = [
  ...s1Questions,
  ...s2Questions,
  ...s3Questions,
  ...s4Questions,
  ...s5Questions,
  ...s6Questions,
  ...s7Questions,
];

const errors: string[] = [];
const warnings: string[] = [];

const expected: Record<number, number> = { 1: 19, 2: 59, 3: 69, 4: 43, 5: 31, 6: 33, 7: 46 };

// Counts per domain
const byDomain = new Map<number, SeedQuestion[]>();
for (const q of all) {
  const list = byDomain.get(q.domainCode) ?? [];
  list.push(q);
  byDomain.set(q.domainCode, list);
}
for (const [code, list] of Object.entries(expected)) {
  const actual = byDomain.get(Number(code))?.length ?? 0;
  if (actual !== list) errors.push(`Domain S${code}: expected ${list}, got ${actual}`);
}

// Unique keys
const keys = new Set<string>();
for (const q of all) {
  if (keys.has(q.key)) errors.push(`Duplicate key: ${q.key}`);
  keys.add(q.key);
  if (!/^S[1-7]-\d{3}$/.test(q.key)) warnings.push(`Odd key format: ${q.key}`);
  if (q.domainCode !== Number(q.key.substring(1, 2)))
    errors.push(`Key ${q.key} domain prefix != domainCode ${q.domainCode}`);
  if (q.options.length !== 4) errors.push(`${q.key}: options.length=${q.options.length}`);
  if (new Set(q.options).size !== 4) errors.push(`${q.key}: duplicate options`);
  if (q.correctIndex < 0 || q.correctIndex > 3) errors.push(`${q.key}: correctIndex out of range`);
  if (!["EASY", "MEDIUM", "HARD"].includes(q.difficulty)) errors.push(`${q.key}: bad difficulty`);
  if (!/^https:\/\/(www|docs)\.databricks\.com\//.test(q.referenceUrl))
    errors.push(`${q.key}: non-official referenceUrl ${q.referenceUrl}`);
  if (!q.explanationEn || q.explanationEn.length < 200) warnings.push(`${q.key}: short explanationEn`);
  if (!q.explanationPt || q.explanationPt.length < 200) warnings.push(`${q.key}: short explanationPt`);
  if (!q.stem || q.stem.length < 120) warnings.push(`${q.key}: very short stem`);
  if (!q.referenceTitle) warnings.push(`${q.key}: missing referenceTitle`);
}

// Public ID registry (Noos ecosystem): every published question must carry a
// registered RAN-EXAM-SEQ ID — valid format, unique, never recycled.
const examCode = CERTIFICATIONS[0].examCode.toUpperCase();
const seenPublicIds = new Set<string>();
for (const entry of ID_REGISTRY) {
  if (!isValidQuestionId(entry.publicId)) errors.push(`registry: invalid publicId ${entry.publicId} (${entry.key})`);
  if (seenPublicIds.has(entry.publicId)) errors.push(`registry: duplicate publicId ${entry.publicId}`);
  seenPublicIds.add(entry.publicId);
  const parsed = parseQuestionId(entry.publicId);
  if (parsed && parsed.exam !== examCode) errors.push(`registry: ${entry.publicId} exam segment != ${examCode}`);
}
for (const q of all) {
  const publicId = ID_REGISTRY_BY_KEY[q.key];
  if (!publicId) errors.push(`${q.key}: no public ID registered (run generate-manifest --assign)`);
}
for (const entry of ID_REGISTRY) {
  if (!all.some((q) => q.key === entry.key)) warnings.push(`epitaph: ${entry.key} (${entry.publicId}) — number never reused`);
}

// Duplicate stems (normalized)
const stems = new Set<string>();
for (const q of all) {
  const norm = q.stem.replace(/\s+/g, " ").toLowerCase().slice(0, 120);
  if (stems.has(norm)) errors.push(`Duplicate-ish stem: ${q.key}`);
  stems.add(norm);
}

// Distributions
const diff = { EASY: 0, MEDIUM: 0, HARD: 0 };
const idx = { 0: 0, 1: 0, 2: 0, 3: 0 };
for (const q of all) {
  diff[q.difficulty as keyof typeof diff]++;
  idx[q.correctIndex as keyof typeof idx]++;
}

// Exam feasibility: each domain must have >= 2x exam distribution
const cert = CERTIFICATIONS[0];
console.log(`Certification: ${cert.name} (${cert.versionLabel})`);
console.log(`Exam: ${cert.questionCount} questions / ${cert.durationMin} min / cut ref ${cert.passingScorePercent}%`);
const distTotal = Object.values(EXAM_DISTRIBUTION).reduce((a, b) => a + b, 0);
if (distTotal !== cert.questionCount)
  errors.push(`EXAM_DISTRIBUTION total ${distTotal} != ${cert.questionCount}`);
for (const [code, need] of Object.entries(EXAM_DISTRIBUTION)) {
  const have = byDomain.get(Number(code))?.length ?? 0;
  if (have < need * 2) warnings.push(`Domain S${code}: bank ${have} < 2x exam need ${need * 2}`);
}

const weightSum = cert.domains.reduce((a, d) => a + d.weightPercent, 0);
if (weightSum !== 100) errors.push(`Domain weights sum ${weightSum} != 100`);

console.log(`\nTotal questions: ${all.length} (expected ${Object.values(expected).reduce((a, b) => a + b, 0)})`);
console.log("By domain:", Object.fromEntries([...byDomain.entries()].map(([c, l]) => [`S${c}`, l.length])));
console.log("Difficulty:", diff);
console.log("correctIndex:", idx);
console.log(`\nErrors: ${errors.length}`);
for (const e of errors) console.log("  ✗ " + e);
console.log(`Warnings: ${warnings.length}`);
for (const w of warnings) console.log("  ⚠ " + w);

if (errors.length > 0) process.exit(1);
console.log("\n✓ Question bank OK");

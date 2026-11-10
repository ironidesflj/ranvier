/**
 * Structural validation of the question bank (run with: bun scripts/validate-questions.ts).
 * Does NOT hit the network — purely structural QA before seeding.
 * Works per certification (CERT_BANKS) — adding a bank never requires changing this script.
 */
import { CERT_BANKS, ALL_QUESTIONS } from "../src/data/questions/bank";
import { ID_REGISTRY, ID_REGISTRY_BY_KEY } from "../src/data/questions/id-registry";
import type { SeedQuestion } from "../src/data/questions/types";
import { CERTIFICATIONS } from "../src/data/certifications";
import { validateId } from "@ironidesflj/axon";

const errors: string[] = [];
const warnings: string[] = [];

const examCodes = new Set(CERTIFICATIONS.map((c) => c.examCode.toUpperCase()));

// ---------- structural checks per bank ----------
const allKeys = new Set<string>();
const allStems = new Set<string>();

for (const bank of CERT_BANKS) {
  const cert = bank.cert;
  const questions = bank.files.flatMap((file) => file.questions);
  const byDomain = new Map<number, SeedQuestion[]>();
  for (const q of questions) {
    const list = byDomain.get(q.domainCode) ?? [];
    list.push(q);
    byDomain.set(q.domainCode, list);
  }

  for (const [code, expected] of Object.entries(bank.expectedByDomain)) {
    const actual = byDomain.get(Number(code))?.length ?? 0;
    if (actual !== expected) errors.push(`${cert.examCode} domain ${code}: expected ${expected}, got ${actual}`);
  }

  for (const q of questions) {
    if (allKeys.has(q.key)) errors.push(`Duplicate key: ${q.key}`);
    allKeys.add(q.key);
    const match = bank.keyPattern.exec(q.key);
    if (!match) {
      warnings.push(`Odd key format for ${cert.examCode}: ${q.key}`);
      continue;
    }
    if (q.domainCode !== bank.keySection(q.key))
      errors.push(`${q.key}: key section != domainCode ${q.domainCode}`);
    if (q.options.length !== 4) errors.push(`${q.key}: options.length=${q.options.length}`);
    if (new Set(q.options).size !== 4) errors.push(`${q.key}: duplicate options`);
    if (q.correctIndex < 0 || q.correctIndex > 3) errors.push(`${q.key}: correctIndex out of range`);
    if (!["EASY", "MEDIUM", "HARD"].includes(q.difficulty)) errors.push(`${q.key}: bad difficulty`);
    if (!bank.referenceDomain.test(q.referenceUrl))
      errors.push(`${q.key}: non-official referenceUrl ${q.referenceUrl}`);
    if (!q.explanationEn || q.explanationEn.length < 200) warnings.push(`${q.key}: short explanationEn`);
    if (!q.explanationPt || q.explanationPt.length < 200) warnings.push(`${q.key}: short explanationPt`);
    if (!q.stem || q.stem.length < 120) warnings.push(`${q.key}: very short stem`);
    if (!q.referenceTitle) warnings.push(`${q.key}: missing referenceTitle`);

    const norm = q.stem.replace(/\s+/g, " ").toLowerCase().slice(0, 120);
    if (allStems.has(norm)) errors.push(`Duplicate-ish stem: ${q.key}`);
    allStems.add(norm);
  }

  // Exam feasibility per domain
  const distTotal = Object.values(cert.examDistribution).reduce((a, b) => a + b, 0);
  if (distTotal !== cert.questionCount)
    errors.push(`${cert.examCode}: examDistribution total ${distTotal} != questionCount ${cert.questionCount}`);
  for (const [code, need] of Object.entries(cert.examDistribution)) {
    const have = byDomain.get(Number(code))?.length ?? 0;
    if (have < need * 2)
      warnings.push(`${cert.examCode} domain ${code}: bank ${have} < 2x exam need ${need * 2}`);
  }
  const weightSum = cert.domains.reduce((a, d) => a + d.weightPercent, 0);
  if (weightSum !== 100) errors.push(`${cert.examCode}: domain weights sum ${weightSum} != 100`);
}

// ---------- public ID registry (Noos ecosystem) ----------
// Every published question must carry a registered RAN-EXAM-SEQ ID — valid
// format, unique, exam segment one of the registered exams, never recycled.
const seenPublicIds = new Set<string>();
for (const entry of ID_REGISTRY) {
  const v = validateId(entry.publicId);
  if (!v.ok) {
    errors.push(`registry: invalid publicId ${entry.publicId} (${entry.key}) — ${v.reason}`);
  } else if (!examCodes.has(v.parsed.exam.toUpperCase())) {
    errors.push(`registry: ${entry.publicId} exam segment not registered`);
  }
  if (seenPublicIds.has(entry.publicId)) errors.push(`registry: duplicate publicId ${entry.publicId}`);
  seenPublicIds.add(entry.publicId);
}
for (const q of ALL_QUESTIONS) {
  if (!ID_REGISTRY_BY_KEY[q.key]) errors.push(`${q.key}: no public ID registered (run generate-manifest --assign)`);
}
for (const entry of ID_REGISTRY) {
  if (!ALL_QUESTIONS.some((q) => q.key === entry.key))
    warnings.push(`epitaph: ${entry.key} (${entry.publicId}) — number never reused`);
}

// ---------- report ----------
for (const bank of CERT_BANKS) {
  const cert = bank.cert;
  const questions = bank.files.flatMap((file) => file.questions);
  const diff = { EASY: 0, MEDIUM: 0, HARD: 0 };
  const idx = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const q of questions) {
    diff[q.difficulty as keyof typeof diff]++;
    idx[q.correctIndex as keyof typeof idx]++;
  }
  console.log(`Certification: ${cert.name} (${cert.versionLabel})`);
  console.log(`Exam: ${cert.questionCount} questions / ${cert.durationMin} min / cut ref ${cert.passingScorePercent}%`);
  console.log(`  total: ${questions.length} (expected ${Object.values(bank.expectedByDomain).reduce((a, b) => a + b, 0)})`);
  console.log("  by domain:", Object.fromEntries([...bank.files.entries()].map(([, f]) => [f.file, f.questions.length])));
  console.log("  difficulty:", diff, "· correctIndex:", idx);
  console.log("");
}

console.log(`Total questions: ${ALL_QUESTIONS.length} across ${CERT_BANKS.length} certification(s)`);
console.log(`\nErrors: ${errors.length}`);
for (const e of errors) console.log("  ✗ " + e);
console.log(`Warnings: ${warnings.length}`);
for (const w of warnings) console.log("  ⚠ " + w);

if (errors.length > 0) process.exit(1);
console.log("\n✓ Question bank OK");

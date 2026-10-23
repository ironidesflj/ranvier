/**
 * Seed script — idempotent (safe to re-run; updates content by stable keys).
 * Public IDs (RAN-EXAM-SEQ) come from the FROZEN registry (src/data/questions/id-registry.ts):
 * assigned on creation only — never rewritten on update (published IDs are immutable).
 * Run with: bun scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { CERTIFICATIONS, EXAM_DISTRIBUTION } from "../src/data/certifications";
import { s1Questions } from "../src/data/questions/s1-platform";
import { s2Questions } from "../src/data/questions/s2-ingestion";
import { s3Questions } from "../src/data/questions/s3-transformation";
import { s4Questions } from "../src/data/questions/s4-jobs";
import { s5Questions } from "../src/data/questions/s5-cicd";
import { s6Questions } from "../src/data/questions/s6-troubleshooting";
import { s7Questions } from "../src/data/questions/s7-governance";
import { ID_REGISTRY_BY_KEY } from "../src/data/questions/id-registry";
import type { SeedQuestion } from "../src/data/questions/types";

const db = new PrismaClient();

const ALL_QUESTIONS: SeedQuestion[] = [
  ...s1Questions,
  ...s2Questions,
  ...s3Questions,
  ...s4Questions,
  ...s5Questions,
  ...s6Questions,
  ...s7Questions,
];

// Persist the official exam distribution next to the certification so the API layer
// (and any future certification) can compute stratified samples from the DB.
function distributionJson(): string {
  return JSON.stringify(EXAM_DISTRIBUTION);
}

async function main() {
  for (const cert of CERTIFICATIONS) {
    const data = {
      slug: cert.slug,
      examCode: cert.examCode,
      vendor: cert.vendor,
      name: cert.name,
      shortName: cert.shortName,
      versionLabel: cert.versionLabel,
      durationMin: cert.durationMin,
      questionCount: cert.questionCount,
      passingScore: cert.passingScorePercent,
      fee: cert.fee,
      languages: cert.languages,
      delivery: cert.delivery,
      officialUrl: cert.officialUrl,
      guideUrl: cert.guideUrl,
      trainingUrl: cert.trainingUrl,
      descriptionEn: cert.descriptionEn,
      descriptionPt: cert.descriptionPt,
      codeNoteEn: cert.codeNoteEn,
      codeNotePt: cert.codeNotePt,
    };
    const certification = await db.certification.upsert({
      where: { slug: cert.slug },
      create: data,
      update: data,
    });

    // Domains
    const domainByCode = new Map<number, { id: string }>();
    for (const d of cert.domains) {
      const dData = {
        code: d.code,
        name: d.name,
        namePt: d.namePt,
        weightPercent: d.weightPercent,
        orderIndex: d.code,
        outlineEn: JSON.stringify(d.outlineEn),
        outlinePt: JSON.stringify(d.outlinePt),
        certificationId: certification.id,
      };
      const existing = await db.domain.findFirst({
        where: { certificationId: certification.id, code: d.code },
      });
      const domain = existing
        ? await db.domain.update({ where: { id: existing.id }, data: dData })
        : await db.domain.create({ data: dData });
      domainByCode.set(d.code, domain);
    }

    // Questions (upsert by unique key). publicId is IMMUTABLE: set on create from the
    // frozen registry, never touched on update. version is managed manually (bump on fixes).
    let created = 0;
    let updated = 0;
    for (const q of ALL_QUESTIONS) {
      const domain = domainByCode.get(q.domainCode);
      if (!domain) throw new Error(`No domain for code ${q.domainCode} (${q.key})`);
      const publicId = ID_REGISTRY_BY_KEY[q.key];
      if (!publicId) {
        throw new Error(
          `No public ID registered for ${q.key} — run: bun scripts/generate-manifest.ts --assign`
        );
      }
      const qData = {
        domainId: domain.id,
        stem: q.stem,
        options: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        explanationEn: q.explanationEn,
        explanationPt: q.explanationPt,
        referenceUrl: q.referenceUrl,
        referenceTitle: q.referenceTitle,
        difficulty: q.difficulty,
        enabled: true,
      };
      const existing = await db.question.findUnique({ where: { key: q.key } });
      if (existing) {
        await db.question.update({ where: { id: existing.id }, data: qData });
        updated++;
      } else {
        await db.question.create({ data: { key: q.key, publicId, ...qData } });
        created++;
      }
    }

    console.log(`\n✓ ${cert.name}`);
    console.log(`  domains: ${domainByCode.size}, questions created: ${created}, updated: ${updated}`);
    const totalQ = await db.question.count({ where: { enabled: true } });
    console.log(`  total enabled questions in DB: ${totalQ}`);
    for (const d of cert.domains) {
      const n = await db.question.count({ where: { domainId: domainByCode.get(d.code)!.id, enabled: true } });
      console.log(`  S${d.code} ${d.name}: ${n} questions (${d.weightPercent}%)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

/**
 * Seed script — idempotent (safe to re-run; updates content by stable keys).
 * Public IDs (RAN-EXAM-SEQ) come from the FROZEN registry (src/data/questions/id-registry.ts):
 * assigned on creation only — never rewritten on update (published IDs are immutable).
 *
 * Works per certification: each CertBank seeds its own questions into its own
 * certification/domains — never mixing DBDEA and AZ-900 in the same domain map.
 * Run with: bun scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { CERT_BANKS } from "../src/data/questions/bank";
import { ID_REGISTRY_BY_KEY } from "../src/data/questions/id-registry";

const db = new PrismaClient();

async function main() {
  for (const bank of CERT_BANKS) {
    const cert = bank.cert;
    const questions = bank.files.flatMap((file) => file.questions);

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
    for (const q of questions) {
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
      console.log(`  ${cert.examCode} D${d.code} ${d.name}: ${n} questions (${d.weightPercent}%)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

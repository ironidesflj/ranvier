/**
 * Question-bank registry: one entry per certification.
 *
 * The app owns the questions; this module is the single source of truth for
 * "which files belong to which exam" so every script (validate, manifest,
 * seed, CI gate, prep) works per certification instead of assuming DBDEA.
 *
 * Adding a certification:
 *  1. register it in src/data/certifications.ts (examCode immutable);
 *  2. add its question file(s) here with expected per-domain counts;
 *  3. `bun scripts/generate-manifest.ts --assign` appends public IDs.
 */
import type { SeedQuestion } from "./types";
import { CERTIFICATIONS, type SeedCertification } from "../certifications";

import { s1Questions } from "./s1-platform";
import { s2Questions } from "./s2-ingestion";
import { s3Questions } from "./s3-transformation";
import { s4Questions } from "./s4-jobs";
import { s5Questions } from "./s5-cicd";
import { s6Questions } from "./s6-troubleshooting";
import { s7Questions } from "./s7-governance";

import { az1Questions } from "./az1-cloud-concepts";
import { az2Questions } from "./az2-architecture-services";
import { az3Questions } from "./az3-management-governance";

export interface CertBankFile {
  /** File name as it appears in src/data/questions (used in gate findings). */
  file: string;
  questions: SeedQuestion[];
}

export interface CertBank {
  cert: SeedCertification;
  files: CertBankFile[];
  /** Hub topic slug per domain (feeds search/filters/stats). */
  domainTopics: Record<number, string>;
  /** Internal key format of the bank, e.g. S1-001 or AZ1-001. */
  keyPattern: RegExp;
  /** Official exam section encoded in the key (1..N). */
  keySection: (key: string) => number;
  /** Editorial expectation per domain — regeneration must match exactly. */
  expectedByDomain: Record<number, number>;
  /** Official-documentation domain(s) allowed for referenceUrl. */
  referenceDomain: RegExp;
}

function certBySlug(slug: string): SeedCertification {
  const cert = CERTIFICATIONS.find((c) => c.slug === slug);
  if (!cert) throw new Error(`certification not registered: ${slug}`);
  return cert;
}

const DBDEA = "databricks-data-engineer-associate";
const AZ900 = "microsoft-azure-fundamentals-az-900";

export const CERT_BANKS: CertBank[] = [
  {
    cert: certBySlug(DBDEA),
    files: [
      { file: "s1-platform.ts", questions: s1Questions },
      { file: "s2-ingestion.ts", questions: s2Questions },
      { file: "s3-transformation.ts", questions: s3Questions },
      { file: "s4-jobs.ts", questions: s4Questions },
      { file: "s5-cicd.ts", questions: s5Questions },
      { file: "s6-troubleshooting.ts", questions: s6Questions },
      { file: "s7-governance.ts", questions: s7Questions },
    ],
    domainTopics: {
      1: "platform",
      2: "ingestion",
      3: "transformation",
      4: "jobs",
      5: "cicd",
      6: "troubleshooting",
      7: "governance",
    },
    keyPattern: /^S([1-7])-(\d{3})$/,
    keySection: (key) => Number(key.slice(1, 2)),
    expectedByDomain: { 1: 19, 2: 59, 3: 69, 4: 43, 5: 31, 6: 33, 7: 46 },
    referenceDomain: /^https:\/\/(www|docs)\.databricks\.com\//,
  },
  {
    cert: certBySlug(AZ900),
    files: [
      { file: "az1-cloud-concepts.ts", questions: az1Questions },
      { file: "az2-architecture-services.ts", questions: az2Questions },
      { file: "az3-management-governance.ts", questions: az3Questions },
    ],
    domainTopics: {
      1: "cloud-concepts",
      2: "architecture",
      3: "management",
    },
    keyPattern: /^AZ([1-3])-(\d{3})$/,
    keySection: (key) => Number(key.slice(2, 3)),
    expectedByDomain: { 1: 85, 2: 115, 3: 100 },
    referenceDomain: /^https:\/\/(learn\.microsoft\.com|azure\.microsoft\.com)\//,
  },
];

export const ALL_QUESTIONS: SeedQuestion[] = CERT_BANKS.flatMap((bank) =>
  bank.files.flatMap((file) => file.questions)
);

export function bankForExam(examCode: string): CertBank {
  const upper = examCode.toUpperCase();
  const bank = CERT_BANKS.find((b) => b.cert.examCode.toUpperCase() === upper);
  if (!bank) throw new Error(`no question bank registered for exam code ${examCode}`);
  return bank;
}

export function bankForCert(cert: SeedCertification): CertBank {
  const bank = CERT_BANKS.find((b) => b.cert.slug === cert.slug);
  if (!bank) throw new Error(`no question bank registered for ${cert.slug}`);
  return bank;
}

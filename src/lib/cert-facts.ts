import { CERTIFICATIONS, type SeedCertification } from "@/data/certifications";
import type { Lang } from "@/lib/types";

/**
 * Editorial facts that vary PER CERTIFICATION and therefore can never be
 * global copy: validity/renewal policy, the note about the real exam's
 * languages, and the vendor-specific labels of the official links
 * ("Exam Guide (PDF)" / "Academy" are Databricks wording; Microsoft uses
 * "study guide" / "Microsoft Learn").
 *
 * P2 fix (2026-11-11): the certification screen used to read fixed i18n copy
 * (`t.cert.validityValue`, `t.cert.examLanguagesNote`, `t.cert.officialGuide`,
 * `t.cert.officialTraining`), so AZ-900 inherited DBDEA's
 * "2 anos (recertificação obrigatória)" and a Databricks note. The source of
 * truth is now `CERTIFICATIONS` (the same seed that feeds the database), and
 * every value is selected by the ACTIVE slug — DBDEA keeps its original
 * strings byte-for-byte.
 */
export interface CertFacts {
  slug: string;
  /** false for credentials that never expire (Microsoft Fundamentals). */
  doesExpire: boolean;
  /** Value of the "Validade"/"Validity" fact, localized. */
  validity: string;
  /** Renewal/expiry note rendered under the facts; null = no note (DBDEA screen unchanged). */
  renewalNote: string | null;
  /** Official source(s) backing the renewal note; empty when there is no note. */
  renewalSources: { url: string; label: string }[];
  /** Note about app/real-exam languages (vendor-specific). */
  examLanguagesNote: string;
  /** Label of the official study-guide link. */
  guideLabel: string;
  /** Label of the recommended-training link. */
  trainingLabel: string;
}

/** Active certification by slug; unknown slug falls back to the app default (first seed). */
export function pickCertification(
  slug: string | null | undefined,
  certs: SeedCertification[] = CERTIFICATIONS,
): SeedCertification {
  const cert = certs.find((c) => c.slug === slug) ?? certs[0];
  if (!cert) throw new Error("cert-facts: nenhuma certificação no seed");
  return cert;
}

/** Per-certification facts for the ACTIVE certification, localized (PT/EN). */
export function certFacts(
  slug: string | null | undefined,
  lang: Lang,
  certs: SeedCertification[] = CERTIFICATIONS,
): CertFacts {
  const cert = pickCertification(slug, certs);
  const pt = lang === "pt";
  const validity = cert.validity;
  return {
    slug: cert.slug,
    doesExpire: validity.doesExpire,
    validity: pt ? validity.labelPt : validity.labelEn,
    renewalNote: (pt ? validity.notePt : validity.noteEn) ?? null,
    renewalSources: (validity.sources ?? []).map((source) => ({
      url: source.url,
      label: pt ? source.labelPt : source.labelEn,
    })),
    examLanguagesNote: pt ? cert.examLanguagesNotePt : cert.examLanguagesNoteEn,
    guideLabel: pt ? cert.guideLabelPt : cert.guideLabelEn,
    trainingLabel: pt ? cert.trainingLabelPt : cert.trainingLabelEn,
  };
}

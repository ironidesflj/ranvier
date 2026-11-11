/**
 * Regression tests for the 2026-11-11 P2 fix.
 *
 * The certification screen used fixed copy, so AZ-900 inherited the DBDEA
 * "2 anos (recertificação obrigatória)" line and a Databricks-specific note.
 * Microsoft Fundamentals do NOT expire. These tests pin the per-cert facts
 * (validity/renewal, real-exam languages note, vendor link labels) in PT and
 * EN, and walk the DBDEA → AZ-900 → DBDEA transition performed by the
 * "Trocar certificação" selector.
 */
import { describe, expect, it } from "bun:test";
import { CERTIFICATIONS } from "../data/certifications";
import { useAppStore } from "../store/app-store";
import { certFacts, pickCertification } from "./cert-facts";

const DBDEA = "databricks-data-engineer-associate";
const AZ900 = "microsoft-azure-fundamentals-az-900";

describe("cert-facts — fatos por certificação", () => {
  it("DBDEA mantém exatamente a validade, a nota e os rótulos originais (PT/EN)", () => {
    const pt = certFacts(DBDEA, "pt");
    expect(pt.slug).toBe(DBDEA);
    expect(pt.doesExpire).toBe(true);
    expect(pt.validity).toBe("2 anos (recertificação obrigatória)");
    expect(pt.renewalNote).toBeNull(); // tela do DBDEA inalterada
    expect(pt.renewalSources).toEqual([]);
    expect(pt.examLanguagesNote).toBe(
      "As questões do app são em inglês, como no exame real. Curiosidade: o exame real também é oferecido em Português (BR), Japonês e Coreano.",
    );
    expect(pt.guideLabel).toBe("Exam Guide oficial (PDF)");
    expect(pt.trainingLabel).toBe("Treinamento recomendado (Academy)");

    const en = certFacts(DBDEA, "en");
    expect(en.doesExpire).toBe(true);
    expect(en.validity).toBe("2 years (recertification required)");
    expect(en.renewalNote).toBeNull();
    expect(en.examLanguagesNote).toContain("Portuguese (BR), Japanese and Korean");
    expect(en.guideLabel).toBe("Official Exam Guide (PDF)");
    expect(en.trainingLabel).toBe("Recommended training (Academy)");
  });

  it("AZ-900 não expira, cita a política oficial da Microsoft e não vaza conteúdo Databricks", () => {
    const policyUrls = [
      "https://learn.microsoft.com/en-gb/credentials/support/credential-expiration-policy",
      "https://learn.microsoft.com/en-us/credentials/certifications/renew-your-microsoft-certification-faq",
    ];
    for (const lang of ["pt", "en"] as const) {
      const facts = certFacts(AZ900, lang);
      expect(facts.slug).toBe(AZ900);
      expect(facts.doesExpire).toBe(false);
      expect(facts.validity).toBe(lang === "pt" ? "Não expira" : "Does not expire");
      expect(facts.renewalNote).not.toBeNull();
      expect(facts.renewalNote!.toLowerCase()).toContain(lang === "pt" ? "não expiram" : "do not expire");
      const urls = facts.renewalSources.map((source) => source.url);
      for (const url of policyUrls) expect(urls).toContain(url);
      expect(facts.renewalSources.every((source) => source.label.length > 0)).toBe(true);

      /* A área da AZ-900 não pode repetir nada do DBDEA. "não há
         recertificação obrigatória" é a NEGAÇÃO correta da política
         Microsoft — o que não pode aparecer é a linha/nota do DBDEA. */
      const az900Area = [
        facts.validity,
        facts.renewalNote ?? "",
        facts.examLanguagesNote,
        facts.guideLabel,
        facts.trainingLabel,
        ...facts.renewalSources.map((source) => source.label),
      ].join("\n");
      expect(az900Area).not.toMatch(/Databricks|DBDEA|Japonês|Japanese and Korean|2 anos|2 years/i);
      expect(facts.validity).not.toBe("2 anos (recertificação obrigatória)");
      expect(facts.validity).not.toBe("2 years (recertification required)");
    }
  });

  it("transição DBDEA → AZ-900 → DBDEA devolve sempre os fatos da certificação ativa", () => {
    const first = certFacts(DBDEA, "pt");
    const az = certFacts(AZ900, "pt");
    const back = certFacts(DBDEA, "pt");
    expect([first.validity, az.validity, back.validity]).toEqual([
      "2 anos (recertificação obrigatória)",
      "Não expira",
      "2 anos (recertificação obrigatória)",
    ]);
    expect(back.slug).toBe(DBDEA);

    const azEn = certFacts(AZ900, "en");
    const dbEn = certFacts(DBDEA, "en");
    const azEnAgain = certFacts(AZ900, "en");
    expect([azEn.validity, dbEn.validity, azEnAgain.validity]).toEqual([
      "Does not expire",
      "2 years (recertification required)",
      "Does not expire",
    ]);
  });

  it("a troca de certificação no store (\"Trocar certificação\") seleciona os fatos da nova ativa", () => {
    const store = useAppStore;
    store.getState().setCert(DBDEA);
    expect(store.getState().certSlug).toBe(DBDEA);
    expect(certFacts(store.getState().certSlug, "pt")).toMatchObject({ validity: "2 anos (recertificação obrigatória)", doesExpire: true });

    store.getState().setCert(AZ900);
    expect(store.getState().certSlug).toBe(AZ900);
    expect(certFacts(store.getState().certSlug, "pt")).toMatchObject({ validity: "Não expira", doesExpire: false });
    expect(certFacts(store.getState().certSlug, "en")).toMatchObject({ validity: "Does not expire", doesExpire: false });

    store.getState().setCert(DBDEA);
    expect(certFacts(store.getState().certSlug, "pt")).toMatchObject({ validity: "2 anos (recertificação obrigatória)", doesExpire: true });
  });

  it("slug desconhecido cai no default da app (primeira certificação), sem tela vazia", () => {
    expect(pickCertification("nao-existe").slug).toBe(CERTIFICATIONS[0].slug);
    expect(certFacts(null, "pt").slug).toBe(CERTIFICATIONS[0].slug);
    expect(certFacts(undefined, "en").slug).toBe(CERTIFICATIONS[0].slug);
  });

  it("toda certificação do seed tem os fatos preenchidos nos dois idiomas", () => {
    expect(CERTIFICATIONS.length).toBeGreaterThanOrEqual(2);
    for (const cert of CERTIFICATIONS) {
      expect(cert.validity.labelPt.length).toBeGreaterThan(0);
      expect(cert.validity.labelEn.length).toBeGreaterThan(0);
      expect(cert.examLanguagesNotePt.length).toBeGreaterThan(0);
      expect(cert.examLanguagesNoteEn.length).toBeGreaterThan(0);
      expect(cert.guideLabelPt.length).toBeGreaterThan(0);
      expect(cert.guideLabelEn.length).toBeGreaterThan(0);
      expect(cert.trainingLabelPt.length).toBeGreaterThan(0);
      expect(cert.trainingLabelEn.length).toBeGreaterThan(0);
      if (!cert.validity.doesExpire) {
        expect((cert.validity.notePt ?? "").length).toBeGreaterThan(0);
        expect((cert.validity.noteEn ?? "").length).toBeGreaterThan(0);
        expect((cert.validity.sources ?? []).length).toBeGreaterThan(0);
      }
    }
  });
});

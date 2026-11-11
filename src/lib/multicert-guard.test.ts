/**
 * Regression guard for the 2026-11-10 AZ-900 release: the app is multi-cert,
 * so NO component may hardcode a DBDEA exam link and no copy may pin the
 * DBDEA exam version (the "maio/2026" label leaked into the Azure screens).
 *
 * Cheap static test (no browser): runs in `bun test` on every CI run.
 */
import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

describe("multi-cert regression guard", () => {
  it("nenhum componente hardcoda o link de exame do DBDEA", () => {
    const offenders = walk(path.join(root, "src", "components"))
      .filter((file) => /\.(tsx?|jsx?)$/.test(file))
      .filter((file) => readFileSync(file, "utf8").includes("databricks.com/learn/certification"));
    expect(offenders).toEqual([]);
  });

  it("a copy não fixa a versão do exame (maio/2026) — é por certificação", () => {
    const source = readFileSync(path.join(root, "src", "lib", "i18n.ts"), "utf8");
    expect(source).not.toContain("maio/2026");
    expect(source).not.toContain("May 2026");
  });


  it("progresso exige a certificação (sem número cruzado entre certs)", () => {
    const service = readFileSync(path.join(root, "src", "lib", "attempt-service.ts"), "utf8");
    expect(service).toContain("getProgress(certSlug: string)");
    const route = readFileSync(path.join(root, "src", "app", "api", "progress", "route.ts"), "utf8");
    expect(route).toContain("certSlug");
    const client = readFileSync(path.join(root, "src", "lib", "api-client.ts"), "utf8");
    expect(client).toContain("/api/progress?certSlug=");
    const view = readFileSync(path.join(root, "src", "components", "app", "progress-view.tsx"), "utf8");
    expect(view).toContain('queryKey: ["progress", certSlug]');
  });

  it("o glossário exige checagem por certificação (fallback fora do DBDEA)", () => {
    const source = readFileSync(path.join(root, "src", "components", "app", "glossary-view.tsx"), "utf8");
    expect(source).toContain("examCode === \"DBDEA\"");
  });

  /* P2 fix (2026-11-11): validity/renewal/language notes and vendor link
     labels are per-certification data, never fixed copy. AZ-900 was showing
     DBDEA's "2 anos (recertificação obrigatória)" + a Databricks note. */
  it("a tela de certificação lê validade/notas/rótulos por certificação (sem copy fixa)", () => {
    const view = readFileSync(path.join(root, "src", "components", "app", "cert-view.tsx"), "utf8");
    expect(view).toContain("certFacts(");
    for (const fixedKey of [
      "t.cert.validityValue",
      "t.cert.examLanguagesNote",
      "t.cert.officialGuide",
      "t.cert.officialTraining",
    ]) {
      expect(view).not.toContain(fixedKey);
    }

    /* A copy global não pode voltar a fixar fatos de uma certificação. */
    const i18n = readFileSync(path.join(root, "src", "lib", "i18n.ts"), "utf8");
    for (const leaked of [
      "DBDEA",
      "recertificação obrigatória",
      "recertification required",
      "Japonês e Coreano",
      "Japanese and Korean",
      "Exam Guide oficial (PDF)",
      "Official Exam Guide (PDF)",
      "(Academy)",
    ]) {
      expect(i18n).not.toContain(leaked);
    }
  });

  it("home e resultado não exibem validade/renovação fixas nem certificação fixa", () => {
    for (const file of ["home-view.tsx", "results-view.tsx", "exam-view.tsx"]) {
      const source = readFileSync(path.join(root, "src", "components", "app", file), "utf8");
      expect(source).not.toMatch(/validityValue|examLanguagesNote/i);
      expect(source).not.toContain("Databricks · DBDEA");
    }
  });
});

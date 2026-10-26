/**
 * ============================================================================
 * RED TEAM DO GATE — selftest por mutação (prova de que o gate FALHA quando deve)
 * ============================================================================
 * Para cada caso: copia a árvore real p/ tmp, injeta UM defeito, roda runGate
 * e afirma que a família de finding esperada aparece com a severidade esperada.
 * Caso 0 (baseline sem mutação) e caso 12 (defeito BAIXO) provam os caminhos
 * de PASS. Caso 13 testa o modo --strict. Caso 14 testa exit codes do CLI.
 *
 * Uso: bun scripts/ci_gate/selftest.ts   → exit 0 = todas as mutações capturadas
 * ============================================================================
 */
import { cp, rm, mkdir } from "node:fs/promises";
import { runGate } from "./gate.ts";

const SRC = new URL("../../src/data", import.meta.url).pathname;
const TMP = new URL("./tmp_selftest", import.meta.url).pathname;
const ALLOW = new URL("./allowlist.tsv", import.meta.url).pathname;

// dados originais (p/ saber correctIndex etc. sem tocar nas cópias)
const { s2Questions } = await import(`${SRC}/questions/s2-ingestion`);
const { s3Questions } = await import(`${SRC}/questions/s3-transformation`);
const { s4Questions } = await import(`${SRC}/questions/s4-jobs`);
const { s7Questions } = await import(`${SRC}/questions/s7-governance`);

async function freshCopy(name: string): Promise<string> {
  const dir = `${TMP}/${name}`;
  await rm(dir, { recursive: true, force: true });
  await cp(SRC, dir, { recursive: true });
  return dir;
}
async function edit(dir: string, rel: string, fn: (t: string) => string) {
  const p = `${dir}/${rel}`;
  const t = await Bun.file(p).text();
  await Bun.write(p, fn(t));
}

/** Localiza o bloco da questão (do `key: "..."` até o próximo objeto) e devolve [ini, fim) */
function blockSpan(text: string, key: string): [number, number] {
  const kIdx = text.indexOf(`key: "${key}"`);
  if (kIdx < 0) throw new Error(`key não encontrada: ${key}`);
  let end = text.indexOf("\n  {", kIdx);
  if (end < 0) end = text.indexOf("\n];", kIdx);
  return [kIdx, end];
}

/** Anexa filler à alternativa CORRETA de uma questão (para inflar o viés) */
function lengthenCorrect(text: string, key: string, correctIndex: number, filler: string): string {
  const [ini, fim] = blockSpan(text, key);
  const block = text.slice(ini, fim);
  const m = block.match(/options: \[([\s\S]*?)\n    \],/);
  if (!m) throw new Error(`options não achadas: ${key}`);
  if (m[1].includes('\\"') || m[1].includes("`")) return text; // pula apenas se AS OPÇÕES tiverem escapes
  const items = m[1].split("\n").filter(l => l.trim().length > 0); // descarta linha vazia pós-[
  const line = items[correctIndex];
  const lm = line.match(/^(\s*)"(.*)",\s*$/);
  if (!lm) throw new Error(`linha de opção inesperada em ${key}: ${line}`);
  items[correctIndex] = `${lm[1]}"${lm[2]}${filler}",`;
  return text.slice(0, ini) + block.replace(m[0], `options: [\n${items.join("\n")}\n    ],`) + text.slice(fim);
}

const BIAS_FILLER = " and this deliberately verbose clause exists solely to inflate this option and must be caught by the length bias detector of the quality gate";

interface Case {
  name: string;
  mutate?: (dir: string) => Promise<void>;
  expectFamilies: string[];      // famílias que DEVEM aparecer
  expectVerdict: "PASS" | "FAIL";
  strict?: boolean;              // rodar com --strict
}

const cases: Case[] = [
  { name: "00-baseline-limpo", expectFamilies: [], expectVerdict: "PASS" },
  {
    name: "01-chave-duplicada",
    mutate: d => edit(d, "questions/s1-platform.ts", t => t.replace('key: "S1-002"', 'key: "S1-001"')),
    expectFamilies: ["KEY_DUP"], expectVerdict: "FAIL",
  },
  {
    name: "02-domainCode-divergente",
    mutate: d => edit(d, "questions/s2-ingestion.ts", t => t.replace("domainCode: 2,", "domainCode: 4,", 1)),
    expectFamilies: ["DOMAIN_MISMATCH"], expectVerdict: "FAIL",
  },
  {
    name: "03-registry-orfa",
    mutate: d => edit(d, "questions/id-registry.ts", t => t.replace('  { key: "S7-017", publicId: "RAN-DBDEA-00116" },\n', "")),
    expectFamilies: ["REGISTRY_ORPHAN"], expectVerdict: "FAIL",
  },
  {
    name: "04-publicId-duplicado",
    mutate: d => edit(d, "questions/id-registry.ts", t => t.replace('"RAN-DBDEA-00116"', '"RAN-DBDEA-00115"')),
    expectFamilies: ["REGISTRY_DUP_ID"], expectVerdict: "FAIL",
  },
  {
    name: "05-correctIndex-invalido",
    mutate: d => edit(d, "questions/s3-transformation.ts", t => t.replace("correctIndex: 1,", "correctIndex: 9,", 1)),
    expectFamilies: ["CORRECT_INDEX"], expectVerdict: "FAIL",
  },
  {
    name: "06-explicacao-PT-vazia",
    mutate: d => edit(d, "questions/s4-jobs.ts", t => t.replace(/explanationPt: `[\s\S]*?`,/, 'explanationPt: `curta.`,', 1)),
    expectFamilies: ["EXPLANATION_SHORT"], expectVerdict: "FAIL",
  },
  {
    name: "07-vies-de-comprimento",
    mutate: async d => {
      const targets = [
        ...s2Questions.map(q => ({ key: q.key, ci: q.correctIndex, file: "questions/s2-ingestion.ts" })),
        ...s3Questions.map(q => ({ key: q.key, ci: q.correctIndex, file: "questions/s3-transformation.ts" })),
        ...s4Questions.slice(0, 6).map(q => ({ key: q.key, ci: q.correctIndex, file: "questions/s4-jobs.ts" })),
      ];
      const byFile = new Map<string, string[]>();
      for (const t of targets) byFile.set(t.file, [...(byFile.get(t.file) || []), t.key]);
      for (const [file, keys] of byFile) {
        const cis = new Map(targets.filter(t => t.file === file).map(t => [t.key, t.ci]));
        await edit(d, file, t => {
          for (const k of keys) t = lengthenCorrect(t, k, cis.get(k)!, BIAS_FILLER);
          return t;
        });
      }
    },
    expectFamilies: ["BIAS_LENGTH"], expectVerdict: "FAIL",
  },
  {
    name: "08-url-fora-da-allowlist",
    mutate: d => edit(d, "questions/s5-cicd.ts", t =>
      t.replace(/referenceUrl: "https:\/\/docs\.databricks\.com\/[^"]+"/, 'referenceUrl: "https://docs.databricks.com/aws/en/nao/verificada"', 1)),
    expectFamilies: ["URL_ALLOWLIST"], expectVerdict: "FAIL",
  },
  {
    name: "09-url-fora-do-dominio",
    mutate: d => edit(d, "questions/s6-troubleshooting.ts", t =>
      t.replace(/referenceUrl: "https:\/\/docs\.databricks\.com\/[^"]+"/, 'referenceUrl: "https://example.com/qualquer-coisa"', 1)),
    expectFamilies: ["REFERENCE_DOMAIN"], expectVerdict: "FAIL",
  },
  {
    name: "10-stems-quase-identicos",
    mutate: async d => {
      // escolhe 2 questões S7 cujos stems não têm code fences
      const ok = s7Questions.filter(q => !q.stem.includes("```")).slice(0, 2);
      if (ok.length < 2) throw new Error("sem par sem-fence em S7");
      const synthetic = `A governance team reviews how table access is controlled in a shared lakehouse workspace and asks the platform owner which mechanism to use in this very specific duplicated scenario for testing purposes?`;
      await edit(d, "questions/s7-governance.ts", t => {
        for (const q of ok) {
          const [ini, fim] = blockSpan(t, q.key);
          const block = t.slice(ini, fim);
          const sm = block.match(/stem: `[\s\S]*?`,/);
          if (!sm) throw new Error(`stem não achado: ${q.key}`);
          t = t.slice(0, ini) + block.replace(sm[0], "stem: `" + synthetic + "`,") + t.slice(fim);
        }
        return t;
      });
    },
    expectFamilies: ["DUP_JACCARD"], expectVerdict: "FAIL",
  },
  {
    name: "11-desvio-de-blueprint",
    mutate: async d => {
      // calibrado para o tamanho atual do banco: 20 remoções em S7 (46→26 de ~280 ≈ -5,7pp)
      const keys = Array.from({ length: 20 }, (_, i) => `S7-${String(i + 12).padStart(3, "0")}`);
      await edit(d, "questions/s7-governance.ts", t => {
        for (const k of keys) {
          const objStart = t.lastIndexOf("\n  {", t.indexOf(`key: "${k}"`));
          let objEnd = t.indexOf("\n  {", t.indexOf(`key: "${k}"`));
          if (objEnd < 0) objEnd = t.indexOf("\n];", t.indexOf(`key: "${k}"`));
          t = t.slice(0, objStart) + t.slice(objEnd);
        }
        return t;
      });
    },
    expectFamilies: ["BLUEPRINT_DEVIATION"], expectVerdict: "FAIL",
  },
  {
    name: "12-aspas-curvas (controle: detecta mas NAO bloqueia)",
    mutate: d => edit(d, "questions/s1-platform.ts", t => t.replace("reads Delta tables", "reads “Delta” tables")),
    expectFamilies: ["MARKDOWN_CURLY"], expectVerdict: "PASS",
  },
  {
    name: "13-epitafio-registry (MÉDIO: só bloqueia com --strict)",
    mutate: d => edit(d, "questions/id-registry.ts", t => t.replace("\n];", '\n  { key: "S9-999", publicId: "RAN-DBDEA-09999" },\n];')),
    expectFamilies: ["REGISTRY_EPITAPH"], expectVerdict: "PASS",
  },
  {
    name: "13b-epitafio-registry-STRICT",
    mutate: d => edit(d, "questions/id-registry.ts", t => t.replace("\n];", '\n  { key: "S9-999", publicId: "RAN-DBDEA-09999" },\n];')),
    expectFamilies: ["REGISTRY_EPITAPH"], expectVerdict: "FAIL", strict: true,
  },
];

await mkdir(TMP, { recursive: true });
let failures = 0;
console.log("=== RED TEAM DO GATE — matrix de mutação ===\n");

for (const c of cases) {
  const dir = await freshCopy(c.name.replace(/[^0-9a-zA-Z-]/g, "_"));
  if (c.mutate) await c.mutate(dir);
  let res;
  try {
    res = await runGate(dir, { strict: c.strict === true, allowlistPath: ALLOW });
  } catch (e) {
    console.log(`✗ ${c.name}: EXCEÇÃO no gate — ${(e as Error).message}`);
    failures++;
    continue;
  }
  const gotFamilies = new Set(res.findings.map(f => f.family));
  const missing = c.expectFamilies.filter(f => !gotFamilies.has(f));
  const verdictOk = res.verdict === c.expectVerdict;
  const extra = [...gotFamilies].filter(f => !c.expectFamilies.includes(f));
  const ok = missing.length === 0 && verdictOk;
  console.log(`${ok ? "✓" : "✗"} ${c.name}${c.strict ? " (--strict)" : ""} — veredito=${res.verdict} (esperado ${c.expectVerdict}); families=[${[...gotFamilies].join(", ") || "—"}]${missing.length ? ` FALTANDO: ${missing.join(",")}` : ""}${extra.length && !ok ? ` extras: ${extra.join(",")}` : ""}`);
  if (!ok) failures++;
}

// ---- Caso 14: exit codes do CLI (o que o CI de fato consome) ----
{
  const okDir = await freshCopy("14a-cli-pass");
  const badDir = await freshCopy("14b-cli-fail");
  await edit(badDir, "questions/s1-platform.ts", t => t.replace('key: "S1-002"', 'key: "S1-001"'));
  const run = (d: string) => Bun.spawnSync(["bun", new URL("./gate.ts", import.meta.url).pathname, d, "--quiet", "--out", `${TMP}/cli.json`]);
  const a = run(okDir), b = run(badDir);
  const aOk = a.exitCode === 0, bOk = b.exitCode === 1;
  console.log(`${aOk ? "✓" : "✗"} 14a-cli-exit-code PASS (exit=${a.exitCode}, esperado 0)`);
  console.log(`${bOk ? "✓" : "✗"} 14b-cli-exit-code FAIL (exit=${b.exitCode}, esperado 1)`);
  if (!aOk || !bOk) failures++;
}

await rm(TMP, { recursive: true, force: true });
console.log(`\n=== RESULTADO RED TEAM: ${failures === 0 ? "TODAS AS MUTAÇÕES CAPTURADAS — GATE APROVADO" : `${failures} FALHA(S) — GATE REPROVADO`} ===`);
process.exit(failures === 0 ? 0 : 1);

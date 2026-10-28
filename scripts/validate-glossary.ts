/**
 * ============================================================================
 * QUALITY GATE DO GLOSSÁRIO BILÍNGUE — v1.9.0 (spec docs/sdd/
 * spec-v1.9.0-glossario.md §3)
 * ============================================================================
 * Garante as regras inegociáveis da spec §2 sobre src/data/glossary.ts:
 *   1. slugs únicos e kebab-case;
 *   2. glosses não-vazios (e não-triviais) nos DOIS idiomas;
 *   3. `url` de fonte oficial E dentro da allowlist verificada do CI
 *      (scripts/ci_gate/allowlist.tsv — mesmas URLs do banco de questões;
 *      reuso da mesma lógica de leitura do gate.ts);
 *   4. `domainCodes` válidos contra as 7 siglas oficiais do blueprint;
 *   5. apelidos não-vazios e sem duplicatas.
 *
 * Gate SEPARADO do ci:gate do banco de questões — mesma filosofia, nenhum
 * acoplamento: o glossário pode evoluir sem tocar o pipeline do banco.
 *
 * Uso: bun scripts/validate-glossary.ts   →  exit 0 = PASS · 1 = FAIL
 */

import { readFileSync } from "node:fs";

interface Finding {
  sev: "CRIT" | "ALTO" | "MÉDIO";
  where: string;
  desc: string;
  fix: string;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOMAIN_CODES = new Set([1, 2, 3, 4, 5, 6, 7]);
const MIN_GLOSS_LEN = 40;

async function loadAllowlist(): Promise<Set<string>> {
  const path = decodeURIComponent(new URL("./ci_gate/allowlist.tsv", import.meta.url).pathname);
  const txt = readFileSync(path, "utf8");
  const out = new Set<string>();
  for (const line of txt.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const u = line.split("\t")[0]?.trim();
    if (u && u.startsWith("http")) out.add(u);
  }
  return out;
}

async function main(): Promise<number> {
  const { GLOSSARY } = await import("../src/data/glossary");
  const allowlist = await loadAllowlist();

  const findings: Finding[] = [];
  const F = (sev: Finding["sev"], where: string, desc: string, fix: string) =>
    findings.push({ sev, where, desc, fix });

  // ---------- 1. slugs ----------
  const slugCount: Record<string, number> = {};
  for (const e of GLOSSARY) slugCount[e.slug] = (slugCount[e.slug] ?? 0) + 1;
  for (const [slug, c] of Object.entries(slugCount)) {
    if (c > 1) F("CRIT", slug, `slug duplicado ${c}x`, "Renomear");
  }
  for (const e of GLOSSARY) {
    if (!SLUG_RE.test(e.slug)) F("ALTO", e.slug, `slug fora do kebab-case: '${e.slug}'`, "Renomear");
    if (!e.term || e.term.trim().length < 2) F("CRIT", e.slug, "term vazio/trivial", "Preencher");
  }

  // ---------- 2. glosses bilíngues ----------
  for (const e of GLOSSARY) {
    for (const f of ["glossPt", "glossEn"] as const) {
      const t = (e[f] ?? "").trim();
      if (!t) F("CRIT", e.slug, `${f} vazio`, "Preencher nos dois idiomas");
      else if (t.length < MIN_GLOSS_LEN) F("ALTO", e.slug, `${f} muito curto (${t.length} < ${MIN_GLOSS_LEN})`, "Expandir");
      /* Mesmo padrão do gate do banco: case-SENSITIVE com word boundaries —
         "TODO" em caixa alta é placeholder; "todo" no meio da frase em PT é
         português legítimo (falso positivo capturado na 1ª execução). */
      if (/lorem ipsum|\[insert/i.test(t) || /\bTODO\b|\bTBD\b|\bXXX\b|\bFIXME\b/.test(t))
        F("CRIT", e.slug, `${f} contém placeholder`, "Completar");
    }
    const pt = (e.glossPt ?? "").trim().length;
    const en = (e.glossEn ?? "").trim().length;
    if (pt > 0 && en > 0 && (pt < en * 0.4 || en < pt * 0.4))
      F("MÉDIO", e.slug, `desequilíbrio de gloss EN(${en}) vs PT(${pt}) — tradução incompleta?`, "Revisar");
  }

  // ---------- 3. URLs (Security Engineer — mesma política do banco) ----------
  const usedUrls = new Set<string>();
  for (const e of GLOSSARY) {
    const u = e.url ?? "";
    if (!/^https:\/\/docs\.databricks\.com\/.+/.test(u)) {
      F("ALTO", e.slug, `url fora do domínio oficial: ${u}`, "Substituir por doc oficial");
    } else if (!allowlist.has(u)) {
      F("ALTO", e.slug, `url fora da allowlist de URLs verificadas: ${u}`, "Verificar on-line e registrar em ci_gate/allowlist.tsv (com revisão)");
    }
    usedUrls.add(u);
  }

  // ---------- 4. domainCodes ----------
  const perDomain: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (const e of GLOSSARY) {
    const codes = e.domainCodes ?? [];
    if (!Array.isArray(codes) || codes.length === 0) {
      F("CRIT", e.slug, "domainCodes vazio — todo verbete pertence a ≥1 domínio do blueprint", "Preencher");
      continue;
    }
    if (new Set(codes).size !== codes.length) F("MÉDIO", e.slug, "domainCodes com duplicatas", "Deduplicar");
    for (const c of codes) {
      if (!DOMAIN_CODES.has(c)) F("ALTO", e.slug, `domainCode inválido: ${c} (esperado 1–7)`, "Corrigir");
      else perDomain[c]++;
    }
  }

  // ---------- 5. aliases ----------
  for (const e of GLOSSARY) {
    if (e.aliases === undefined) continue;
    if (!Array.isArray(e.aliases) || e.aliases.length === 0) {
      F("MÉDIO", e.slug, "aliases declarado como array vazio — remover a chave", "Remover");
      continue;
    }
    const seen = new Set<string>();
    for (const a of e.aliases) {
      if (!a || a.trim().length < 2) F("ALTO", e.slug, `alias trivial: '${a}'`, "Corrigir ou remover");
      const key = a.trim().toLowerCase();
      if (seen.has(key)) F("MÉDIO", e.slug, `alias duplicado: '${a}'`, "Deduplicar");
      seen.add(key);
    }
    if (e.aliases.some((a) => a.trim().toLowerCase() === e.term.trim().toLowerCase()))
      F("MÉDIO", e.slug, "alias idêntico ao termo canônico — redundante", "Remover");
  }

  // ---------- veredito ----------
  const blocking = findings.filter((f) => f.sev === "CRIT" || f.sev === "ALTO");
  const verdict = blocking.length ? "FAIL" : "PASS";
  const counts = { CRIT: 0, ALTO: 0, "MÉDIO": 0 } as Record<string, number>;
  for (const f of findings) counts[f.sev]++;

  console.log("=== QUALITY GATE — GLOSSÁRIO BILÍNGUE (v1.9.0) ===");
  console.log(`Verbetes: ${GLOSSARY.length} | URLs únicas usadas: ${usedUrls.size}/${allowlist.size} allowlist`);
  console.log(
    `Cobertura por domínio: ${Object.entries(perDomain)
      .map(([c, n]) => `S${c}=${n}`)
      .join(" · ")}`
  );
  console.log(`Findings — CRIT: ${counts.CRIT} | ALTO: ${counts.ALTO} | MÉDIO: ${counts["MÉDIO"]}`);
  for (const f of findings) console.log(`[${f.sev}] ${f.where}: ${f.desc} → ${f.fix}`);
  console.log(`VEREDITO: ${verdict}`);
  return verdict === "PASS" ? 0 : 1;
}

process.exit(await main());

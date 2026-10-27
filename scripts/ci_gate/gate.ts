/**
 * ============================================================================
 * QUALITY GATE DO BANCO DE QUESTÕES DBDEA — CI gate do comitê multifuncional
 * ============================================================================
 * Consolida as 21 famílias da auditoria estrutural/psicométrica (v1/v2) em um
 * gate de integração contínua com políticas de severidade e exit codes.
 *
 * Uso (CI / local):
 *   bun scripts/ci_gate/gate.ts [baseDir] [--strict] [--out arquivo.json]
 *                               [--allowlist arquivo.tsv] [--quiet]
 *   baseDir padrão: scripts/data_fixed/data
 *
 * Exit codes:  0 = PASS (nenhum CRIT/ALTO)   1 = FAIL
 *   --strict: MÉDIO também bloqueia (usar no trunk principal; PRs de conteúdo
 *             podem rodar sem --strict para acumular avisos com folga).
 *
 * Políticas de severidade (espelham GATE_SPEC.md — não edite aqui sem lá):
 *   CRIT  → bloqueia sempre  (integridade: chaves, gabarito, registry, simulado)
 *   ALTO  → bloqueia sempre  (qualidade: viés de comprimento >40%, URL fora da
 *                             allowlist, desvio de blueprint >4pp, duplicatas)
 *   MÉDIO → avisa (bloqueia com --strict)
 *   BAIXO → informativo
 *
 * Donos por papel (assinaturas detalhadas em GATE_SPEC.md):
 *   Question Bank Lead ......... registry, chaves, sequências, capacidade
 *   SME / Cert Architect ....... aderência de conteúdo ao blueprint
 *   DB & Schema Architect ...... formato/shape dos seeds (options, tipos)
 *   Data Pipeline Engineer ..... execução, exit codes, JSON estável p/ CI
 *   Security Engineer .......... allowlist de URLs, domínio oficial
 *   UX Lead .................... stems perguntativos, comprimentos, EN/PT
 *   QA & Psychometrics Lead .... viés de comprimento, Jaccard, gabarito, mix
 *   Technical Writer ........... explicações bilíngues, títulos de referência
 *   Red Team ................... selftest.ts (mutações) — prova que o gate falha
 * ============================================================================
 */
export type Severity = "CRIT" | "ALTO" | "MÉDIO" | "BAIXO";

export interface GateFinding {
  id: string;
  sev: Severity;
  family: string;
  dim: string;
  where: string;
  desc: string;
  fix: string;
}

export interface GateResult {
  verdict: "PASS" | "FAIL";
  strict: boolean;
  baseDir: string;
  generatedAt: string;
  stats: Record<string, unknown>;
  findings: GateFinding[];
}

const FAIL_SEVS: Severity[] = ["CRIT", "ALTO"];

export async function runGate(
  baseDir: string,
  opts: { strict?: boolean; allowlistPath?: string } = {},
): Promise<GateResult> {
  const strict = opts.strict === true;
  const allowlistPath = opts.allowlistPath || decodeURIComponent(new URL("./allowlist.tsv", import.meta.url).pathname);

  const { s1Questions } = await import(`${baseDir}/questions/s1-platform`);
  const { s2Questions } = await import(`${baseDir}/questions/s2-ingestion`);
  const { s3Questions } = await import(`${baseDir}/questions/s3-transformation`);
  const { s4Questions } = await import(`${baseDir}/questions/s4-jobs`);
  const { s5Questions } = await import(`${baseDir}/questions/s5-cicd`);
  const { s6Questions } = await import(`${baseDir}/questions/s6-troubleshooting`);
  const { s7Questions } = await import(`${baseDir}/questions/s7-governance`);
  const { ID_REGISTRY } = await import(`${baseDir}/questions/id-registry`);
  const { CERTIFICATIONS, EXAM_DISTRIBUTION } = await import(`${baseDir}/certifications`);
  const { GUIDE_SECTIONS } = await import(`${baseDir}/guide`);

  const FILES: Record<number, { name: string; qs: any[] }> = {
    1: { name: "s1-platform.ts", qs: s1Questions },
    2: { name: "s2-ingestion.ts", qs: s2Questions },
    3: { name: "s3-transformation.ts", qs: s3Questions },
    4: { name: "s4-jobs.ts", qs: s4Questions },
    5: { name: "s5-cicd.ts", qs: s5Questions },
    6: { name: "s6-troubleshooting.ts", qs: s6Questions },
    7: { name: "s7-governance.ts", qs: s7Questions },
  };

  const all: any[] = [];
  for (const [code, f] of Object.entries(FILES)) {
    for (const q of f.qs) all.push({ ...q, _file: f.name, _section: Number(code) });
  }

  const findings: GateFinding[] = [];
  let F = 0;
  function finding(sev: Severity, family: string, dim: string, where: string, desc: string, fix: string) {
    findings.push({ id: `F-${String(++F).padStart(3, "0")}`, sev, family, dim, where, desc, fix });
  }

  // ---------- ALLOWLIST ----------
  const allowlisted = new Set<string>();
  const allowFile = Bun.file(allowlistPath);
  if (await allowFile.exists()) {
    const txt = await allowFile.text();
    for (const line of txt.split("\n")) {
      if (line.startsWith("#") || !line.trim()) continue;
      const u = line.split("\t")[0]?.trim();
      if (u && u.startsWith("http")) allowlisted.add(u);
    }
  } else {
    finding("MÉDIO", "ALLOWLIST_MISSING", "Referência", "allowlist.tsv",
      `Allowlist não encontrada em ${allowlistPath} — verificação de URL degradada (apenas domínio)`,
      "Restaurar scripts/ci_gate/allowlist.tsv");
  }

  // ============ A. INTEGRIDADE ESTRUTURAL (DB Architect + Bank Lead) ============
  // A1. chaves duplicadas
  const keyCount: Record<string, number> = {};
  for (const q of all) keyCount[q.key] = (keyCount[q.key] || 0) + 1;
  for (const [k, c] of Object.entries(keyCount)) if (c > 1)
    finding("CRIT", "KEY_DUP", "Integridade", k, `Chave duplicada ${c}x entre arquivos`, "Remover duplicata ou renumerar");

  // A2. formato de chave e gaps
  const keyRe = /^S([1-7])-(\d{3})$/;
  for (const q of all) if (!keyRe.test(q.key))
    finding("ALTO", "KEY_FORMAT", "Integridade", q.key, `Chave fora do padrão S{1-7}-NNN: '${q.key}'`, "Renomear");
  for (let s = 1; s <= 7; s++) {
    const seqs = all.filter(q => Number(q.key.slice(1, 2)) === s).map(q => Number(q.key.slice(3)));
    if (!seqs.length) continue;
    for (let i = 1; i <= Math.max(...seqs); i++) if (!seqs.includes(i))
      finding("ALTO", "KEY_GAP", "Integridade", `S${s}`, `Gap de sequência: S${s}-${String(i).padStart(3, "0")} ausente`, "Confirmar remoção intencional (epitáfio no registry)");
  }

  // A3. domainCode coerente com o arquivo
  for (const q of all) if (q._section !== q.domainCode)
    finding("CRIT", "DOMAIN_MISMATCH", "Integridade", q.key, `domainCode=${q.domainCode} diverge da seção do arquivo (${q._section})`, "Corrigir domainCode");

  // A4. opções
  for (const q of all) {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      finding("CRIT", "OPTIONS_SHAPE", "Integridade", q.key, `options com ${q.options?.length} elementos (esperado 4)`, "Corrigir");
    } else {
      if (new Set(q.options).size !== 4)
        finding("CRIT", "OPTIONS_DUP", "Integridade", q.key, "Alternativas duplicadas dentro da questão", "Corrigir");
      q.options.forEach((o: string, i: number) => {
        if (!o || o.trim().length < 5)
          finding("CRIT", "OPTIONS_TRIVIAL", "Integridade", q.key, `Alternativa ${i} vazia/trivial`, "Corrigir");
        if (/^(all|none) of the above/i.test(o.trim()))
          finding("ALTO", "ITEM_WRITING", "Psicometria", q.key, `Alternativa ${i} usa 'all/none of the above' (má prática)`, "Reescrever alternativa");
      });
    }
    if (![0, 1, 2, 3].includes(q.correctIndex))
      finding("CRIT", "CORRECT_INDEX", "Integridade", q.key, `correctIndex inválido: ${q.correctIndex}`, "Corrigir");
    if (!["EASY", "MEDIUM", "HARD"].includes(q.difficulty))
      finding("ALTO", "DIFFICULTY_VALUE", "Integridade", q.key, `difficulty inválida: ${q.difficulty}`, "Corrigir");
  }

  // A5. explicações (Technical Writer)
  for (const q of all) {
    for (const f of ["explanationEn", "explanationPt"]) {
      const t: string = q[f] || "";
      if (t.trim().length < 200)
        finding("ALTO", "EXPLANATION_SHORT", "Qualidade", q.key, `${f} muito curta (${t.trim().length} chars < 200)`, "Expandir justificativa");
      if (/\bTODO\b|\bTBD\b|\bXXX\b|\bFIXME\b/.test(t) || /lorem ipsum|\[insert/i.test(t))
        finding("CRIT", "PLACEHOLDER", "Qualidade", q.key, `${f} contém placeholder`, "Completar");
    }
    const en = q.explanationEn?.trim().length || 0, pt = q.explanationPt?.trim().length || 0;
    if (pt < en * 0.35 || en < pt * 0.35)
      finding("MÉDIO", "EXPLANATION_BALANCE", "Qualidade", q.key, `Desequilíbrio EN(${en}) vs PT(${pt}) — tradução incompleta?`, "Revisar tradução");
  }

  // A6. referências do banco (Security Engineer)
  for (const q of all) {
    const u: string = q.referenceUrl || "";
    if (!/^https:\/\/docs\.databricks\.com\/.+/.test(u))
      finding("ALTO", "REFERENCE_DOMAIN", "Referência", q.key, `referenceUrl fora do domínio oficial: ${u}`, "Substituir por doc oficial");
    else if (allowlisted.size && !allowlisted.has(u))
      finding("ALTO", "URL_ALLOWLIST", "Referência", q.key, `referenceUrl fora da allowlist de URLs verificadas: ${u}`, "Verificar on-line e registrar em ci_gate/allowlist.tsv");
    if (!q.referenceTitle || q.referenceTitle.trim().length < 3)
      finding("MÉDIO", "REFERENCE_TITLE", "Referência", q.key, "referenceTitle ausente", "Preencher");
  }

  // A7. markdown / caracteres (UX + Pipeline)
  for (const q of all) {
    for (const f of ["stem", "explanationEn", "explanationPt"]) {
      const t: string = q[f] || "";
      const fences = (t.match(/```/g) || []).length;
      if (fences % 2 !== 0)
        finding("ALTO", "MARKDOWN_FENCE", "Parsing", q.key, `${f}: bloco de código não fechado`, "Corrigir fence");
      if (/\r/.test(t))
        finding("MÉDIO", "WINDOWS_CR", "Parsing", q.key, `${f} contém CR (fim de linha Windows)`, "Normalizar para LF");
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(t))
        finding("ALTO", "CONTROL_CHARS", "Parsing", q.key, `${f} contém caractere de controle`, "Sanitizar");
      if (/[\u201C\u201D\u2018\u2019]/.test(t))
        finding("BAIXO", "MARKDOWN_CURLY", "Parsing", q.key, `${f} contém aspas tipográficas — risco em parsers Markdown`, "Trocar por aspas retas");
      if (/\u00A0/.test(t))
        finding("BAIXO", "NBSP", "Parsing", q.key, `${f} contém espaço não-quebrável (NBSP)`, "Trocar por espaço comum");
    }
    if (!(q.stem || "").includes("?"))
      finding("MÉDIO", "STEM_QUESTION", "Qualidade", q.key, "Stem não contém interrogação (formato de comando, não pergunta)", "Reescrever como pergunta");
  }

  // A8. registry (Bank Lead)
  const regKeys = ID_REGISTRY.map((e: any) => e.key);
  const regIds = ID_REGISTRY.map((e: any) => e.publicId);
  const qKeys = all.map(q => q.key);
  for (const k of qKeys.filter(k => !regKeys.includes(k)))
    finding("CRIT", "REGISTRY_ORPHAN", "Registry", k, "Questão presente no arquivo mas AUSENTE do id-registry (nunca receberia publicId)", "Appendar no registry com o próximo sequencial");
  for (const k of regKeys.filter(k => !qKeys.includes(k)))
    finding("MÉDIO", "REGISTRY_EPITAPH", "Registry", k, "Entrada no registry sem questão correspondente (epitáfio legítimo ou arquivo perdido?)", "Confirmar remoção intencional");
  const dupIds = regIds.filter((id, i) => regIds.indexOf(id) !== i);
  if (dupIds.length)
    finding("CRIT", "REGISTRY_DUP_ID", "Registry", "registry", `publicIds duplicados: ${[...new Set(dupIds)].join(", ")}`, "Corrigir");
  const seqNums = regIds.map(id => Number(id.slice("RAN-DBDEA-".length))).sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < seqNums[seqNums.length - 1]; i++) if (!seqNums.includes(i)) gaps.push(i);
  if (gaps.length)
    finding("MÉDIO", "REGISTRY_GAP", "Registry", "registry", `Sequência pública com lacunas: ${gaps.map(g => String(g).padStart(5, "0")).join(", ")}`, "Confirmar epitáfos");
  for (const e of ID_REGISTRY) if (!/^RAN-DBDEA-\d{5}$/.test(e.publicId))
    finding("ALTO", "REGISTRY_FORMAT", "Registry", e.key, `publicId fora do padrão: ${e.publicId}`, "Corrigir");
  for (let i = 1; i < regIds.length; i++) {
    if (Number(regIds[i].slice(-5)) < Number(regIds[i - 1].slice(-5))) {
      finding("MÉDIO", "REGISTRY_ORDER", "Registry", "registry", `Registry fora de ordem em índice ${i}`, "Reordenar");
      break;
    }
  }

  // ============ B. PSICOMETRIA (QA & Psychometrics Lead) ============
  const diffCount: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  const correctIdx: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  let correctLongest = 0, lenCorrectSum = 0, lenDistractSum = 0, homoCount = 0;
  const stemWords: Record<string, number> = {};
  const longStems: string[] = [];
  const flaggedBias: string[] = [];
  for (const q of all) {
    diffCount[q.difficulty]++;
    correctIdx[q.correctIndex]++;
    const lens = q.options.map((o: string) => o.length);
    if (Math.max(...lens) === lens[q.correctIndex] && lens.filter(l => l === lens[q.correctIndex]).length === 1) {
      correctLongest++;
      flaggedBias.push(q.key);
    }
    lenCorrectSum += lens[q.correctIndex];
    lenDistractSum += (lens.reduce((a: number, b: number) => a + b, 0) - lens[q.correctIndex]) / 3;
    const shortestDistractor = Math.min(...lens.filter((_: number, i: number) => i !== q.correctIndex));
    if (lens[q.correctIndex] > shortestDistractor * 3) homoCount++;
    const w = q.stem.split(/\s+/).length;
    stemWords[q.key] = w;
    if (w > 130) longStems.push(`${q.key} (${w}w)`);
  }
  const N = all.length || 1;
  const pctLongest = (correctLongest / N) * 100;
  const meanCorrect = lenCorrectSum / N, meanDistract = lenDistractSum / N;
  if (pctLongest > 40)
    finding("ALTO", "BIAS_LENGTH", "Psicometria", "global", `Viés de comprimento: correta é a mais longa em ${correctLongest}/${N} (${pctLongest.toFixed(1)}% — esperado ~25%, limite 40%)`, "Encurtar corretas ou alongar distratores");
  else if (pctLongest > 33)
    finding("MÉDIO", "BIAS_LENGTH", "Psicometria", "global", `Tendência leve de viés de comprimento: ${pctLongest.toFixed(1)}%`, "Monitorar");
  if (meanCorrect > meanDistract * 1.25)
    finding("MÉDIO", "BIAS_RATIO", "Psicometria", "global", `Comprimento médio da correta (${meanCorrect.toFixed(0)}) >1.25x distratores (${meanDistract.toFixed(0)})`, "Balancear");
  if (homoCount)
    finding("BAIXO", "LEN_HOMOGENEITY", "Psicometria", "global", `${homoCount} questões com correta >3x o distrator mais curto`, "Revisar homogeneidade");
  for (const ls of longStems)
    finding("BAIXO", "STEM_LONG", "UX", ls.split(" ")[0], `Stem muito longo: ${ls}`, "Considerar enxugar cenário");

  // gabarito por seção
  for (let s = 1; s <= 7; s++) {
    const qs = all.filter(q => q._section === s);
    if (!qs.length) continue;
    const dist = [0, 0, 0, 0];
    qs.forEach(q => dist[q.correctIndex]++);
    const maxShare = Math.max(...dist) / qs.length;
    if (maxShare > 0.45)
      finding("MÉDIO", "GABARITO_CONCENTRATION", "Psicometria", `S${s}`, `Concentração de gabaritos: [${dist}] — ${Math.round(maxShare * 100)}% em um único índice`, "Redistribuir");
  }

  // balanceamento global do índice correto
  for (const [idx, c] of Object.entries(correctIdx)) {
    const share = (c / N) * 100;
    if (share < 10 || share > 40)
      finding("MÉDIO", "INDEX_BALANCE", "Psicometria", "global", `Gabarito concentrado no índice ${idx}: ${share.toFixed(1)}% (banda 10-40%)`, "Redistribuir correctIndex");
  }
  // mix de dificuldade
  for (const [d, c] of Object.entries(diffCount)) {
    const share = (c / N) * 100;
    if (share < 10 || share > 65)
      finding("MÉDIO", "DIFFICULTY_MIX", "Psicometria", "global", `Dificuldade ${d} fora da banda: ${share.toFixed(1)}% (10-65%)`, "Reequilibrar lote");
  }

  // duplicidade (Jaccard de tokens no mesmo domínio)
  function tokens(s: string) {
    return new Set(s.toLowerCase().replace(/```[\s\S]*?```/g, " CODE ").split(/[^a-z0-9_]+/).filter(t => t.length > 3));
  }
  for (let s = 1; s <= 7; s++) {
    const qs = all.filter(q => q._section === s);
    for (let i = 0; i < qs.length; i++) for (let j = i + 1; j < qs.length; j++) {
      const a = tokens(qs[i].stem), b = tokens(qs[j].stem);
      let inter = 0; a.forEach(t => { if (b.has(t)) inter++; });
      const jac = inter / (a.size + b.size - inter);
      if (jac >= 0.70)
        finding("ALTO", "DUP_JACCARD", "Duplicidade", `${qs[i].key}≈${qs[j].key}`, `Stems quase idênticos (Jaccard ${jac.toFixed(2)})`, "Remover/reescrever duplicata");
      else if (jac > 0.55)
        finding("MÉDIO", "DUP_JACCARD", "Duplicidade", `${qs[i].key}≈${qs[j].key}`, `Stems muito similares (Jaccard ${jac.toFixed(2)})`, "Verificar sobreposição");
    }
  }

  // ============ C. BLUEPRINT (SME) ============
  const cert = CERTIFICATIONS[0];
  const weights: Record<number, number> = {};
  for (const d of cert.domains) weights[d.code] = d.weightPercent;
  const perDomain: any = {};
  for (let s = 1; s <= 7; s++) perDomain[s] = { count: all.filter(q => q._section === s).length, weight: weights[s] };
  for (let s = 1; s <= 7; s++) {
    const share = (perDomain[s].count / N) * 100;
    const dev = share - weights[s];
    if (Math.abs(dev) > 4)
      finding("ALTO", "BLUEPRINT_DEVIATION", "Blueprint", `S${s}`, `Desproporção: ${share.toFixed(1)}% do banco vs peso oficial ${weights[s]}% (desvio ${dev > 0 ? "+" : ""}${dev.toFixed(1)}pp)`, "Reequilibrar lote");
    if (EXAM_DISTRIBUTION[s] > perDomain[s].count)
      finding("CRIT", "SIMULADO_INFEASIBLE", "Blueprint", `S${s}`, `Simulado de ${EXAM_DISTRIBUTION[s]} questões impossível: banco tem ${perDomain[s].count}`, "Autorar mais questões");
  }
  // capacidade de simulados disjuntos (KPI de produto)
  let disjointSimulados = Infinity;
  for (let s = 1; s <= 7; s++) disjointSimulados = Math.min(disjointSimulados, Math.floor(perDomain[s].count / EXAM_DISTRIBUTION[s]));

  // ============ D. GUIA DE ESTUDOS (UX + Security) ============
  for (const sec of GUIDE_SECTIONS) {
    for (const l of sec.links) {
      if (!/^https:\/\/(docs\.)?databricks\.com\/.+/.test(l.url))
        finding("ALTO", "GUIDE_URL_DOMAIN", "Referência", `guide S${sec.code}`, `Link fora do domínio oficial: ${l.url}`, "Substituir");
      else if (allowlisted.size && !allowlisted.has(l.url))
        finding("MÉDIO", "GUIDE_URL_ALLOWLIST", "Referência", `guide S${sec.code}`, `Link do guia fora da allowlist: ${l.url}`, "Verificar on-line e registrar");
    }
  }

  // ============ VEREDITO ============
  const blocking = findings.filter(f => FAIL_SEVS.includes(f.sev) || (strict && f.sev === "MÉDIO"));
  const verdict: "PASS" | "FAIL" = blocking.length ? "FAIL" : "PASS";

  const stats = {
    totalQuestions: all.length,
    totalRegistry: ID_REGISTRY.length,
    perDomain,
    difficulty: diffCount,
    correctIndex: correctIdx,
    lengthBias: {
      pctCorrectLongest: Number(pctLongest.toFixed(1)),
      correctLongestCount: correctLongest,
      meanCorrectLen: Number(meanCorrect.toFixed(0)),
      meanDistractorLen: Number(meanDistract.toFixed(0)),
      flaggedQuestions: flaggedBias,
    },
    disjointSimuladosPossible: disjointSimulados === Infinity ? 0 : disjointSimulados,
    uniqueUrls: [...new Set(all.map(q => q.referenceUrl))].length,
    allowlistSize: allowlisted.size,
    counts: { CRIT: 0, ALTO: 0, "MÉDIO": 0, BAIXO: 0 } as Record<string, number>,
  };
  for (const f of findings) stats.counts[f.sev]++;

  return { verdict, strict, baseDir, generatedAt: new Date().toISOString(), stats, findings };
}

// ============================ CLI ============================
if (import.meta.main) {
  const args = process.argv.slice(2);
  let baseDir = decodeURIComponent(new URL("../../src/data", import.meta.url).pathname);
  let out = decodeURIComponent(new URL("./gate_result.json", import.meta.url).pathname);
  let allowlistPath: string | undefined;
  let strict = false, quiet = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--strict") strict = true;
    else if (args[i] === "--out") out = args[++i];
    else if (args[i] === "--allowlist") allowlistPath = args[++i];
    else if (args[i] === "--quiet") quiet = true;
    else baseDir = args[i];
  }
  if (!baseDir.startsWith("/")) baseDir = `${process.cwd()}/${baseDir}`;
  const res = await runGate(baseDir, { strict, allowlistPath });
  await Bun.write(out, JSON.stringify(res, null, 2));
  if (!quiet) {
    console.log("=== QUALITY GATE — BANCO DBDEA (comitê) ===");
    console.log(`Base: ${res.baseDir}`);
    console.log(`Questões: ${res.stats.totalQuestions} | Registry: ${res.stats.totalRegistry} | URLs únicas: ${res.stats.uniqueUrls}/${res.stats.allowlistSize} allowlist`);
    console.log(`Viés comprimento: ${res.stats.lengthBias.pctCorrectLongest}% (limite 40%) | Simulados disjuntos: ${res.stats.disjointSimuladosPossible}`);
    const c = res.stats.counts as Record<string, number>;
    console.log(`Findings — CRIT: ${c.CRIT} | ALTO: ${c.ALTO} | MÉDIO: ${c["MÉDIO"]} | BAIXO: ${c.BAIXO}`);
    for (const f of res.findings) console.log(`[${f.sev}] ${f.id} ${f.family} @ ${f.where}: ${f.desc}`);
    console.log(`VEREDITO: ${res.verdict}${res.strict ? " (strict)" : ""} → ${out}`);
  }
  process.exit(res.verdict === "FAIL" ? 1 : 0);
}

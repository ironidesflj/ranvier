/**
 * Prepara insumos do gate CI e das ondas de expansão:
 *  1) scripts/ci_gate/allowlist.tsv      — allowlist de URLs verificadas (banco + guia + url_check v1)
 *  2) scripts/expansion/existing_stems.txt — digest de stems p/ dedup de novos lotes
 * Uso: bun scripts/ci_gate/prep.ts
 */
const BASE = "/home/z/my-project/scripts/data_fixed/data";

const { s1Questions } = await import(`${BASE}/questions/s1-platform`);
const { s2Questions } = await import(`${BASE}/questions/s2-ingestion`);
const { s3Questions } = await import(`${BASE}/questions/s3-transformation`);
const { s4Questions } = await import(`${BASE}/questions/s4-jobs`);
const { s5Questions } = await import(`${BASE}/questions/s5-cicd`);
const { s6Questions } = await import(`${BASE}/questions/s6-troubleshooting`);
const { s7Questions } = await import(`${BASE}/questions/s7-governance`);
const { GUIDE_SECTIONS } = await import(`${BASE}/guide`);

const ALL = [s1Questions, s2Questions, s3Questions, s4Questions, s5Questions, s6Questions, s7Questions].flat();

// ---------- 1) ALLOWLIST ----------
// Fontes (em ordem de precedência): banco atual (verificado on-line na auditoria v1/v2),
// guide.ts (idem), url_check.tsv (log bruto da validação v1).
const urlInfo = new Map<string, { title: string; source: string }>();
for (const q of ALL) urlInfo.set(q.referenceUrl, { title: q.referenceTitle, source: "bank" });
for (const sec of GUIDE_SECTIONS) {
  for (const l of sec.links) if (!urlInfo.has(l.url)) urlInfo.set(l.url, { title: l.title, source: "guide" });
}
const tsvRaw = await Bun.file("/home/z/my-project/scripts/url_check.tsv").text();
for (const line of tsvRaw.split("\n")) {
  const u = line.split("\t")[2]?.trim();
  if (u && u.startsWith("http") && !urlInfo.has(u)) urlInfo.set(u, { title: "(verificada na auditoria v1)", source: "url_check" });
}

// PRESERVA entradas extras já registradas na allowlist (URLs verificadas fora do banco,
// p.ex. âncoras de expansão) — a regeneração nunca deve removê-las.
try {
  const existing = await Bun.file("/home/z/my-project/scripts/ci_gate/allowlist.tsv").text();
  for (const line of existing.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const cols = line.split("\t");
    const u = cols[0]?.trim();
    if (u && u.startsWith("http") && !urlInfo.has(u)) {
      urlInfo.set(u, { title: cols[1]?.trim() || "(preservada)", source: cols[2]?.trim() || "manual" });
    }
  }
} catch { /* primeira execução: arquivo ainda não existe */ }

let allow = "# ALLOWLIST DE URLS VERIFICADAS — Quality Gate do Comitê DBDEA\n";
allow += "# Política (Security Engineer): só adicione URL após verificação on-line (HTTP 200 + leitura de conteúdo)\n";
allow += "# e registro no log de verificação. URLs do banco de questões DEVEM vir daqui (types.ts: 'verified list').\n";
allow += "# URL\tTítulo exemplo\tFonte\n";
for (const [u, m] of [...urlInfo.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  allow += `${u}\t${m.title.replace(/\t/g, " ")}\t${m.source}\n`;
}
await Bun.write("/home/z/my-project/scripts/ci_gate/allowlist.tsv", allow);

// ---------- 2) STEM DIGEST (dedup de novos lotes) ----------
let digest = "# STEM DIGEST do banco atual — leia ANTES de redigir novas questões (dedup de conceito)\n";
digest += "# key\tdifficulty\tcorrectIndex\tstem (primeiros 160 chars)\n";
for (const q of ALL) {
  const stem = q.stem.replace(/\s+/g, " ").slice(0, 160);
  digest += `${q.key}\t${q.difficulty}\t${q.correctIndex}\t${stem}\n`;
}
await Bun.write("/home/z/my-project/scripts/expansion/existing_stems.txt", digest);

console.log(`allowlist.tsv: ${urlInfo.size} URLs (bank=${ALL.length} questões)`);
console.log(`existing_stems.txt: ${ALL.length} stems`);

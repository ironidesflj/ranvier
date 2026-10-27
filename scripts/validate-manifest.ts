/**
 * manifest.jsonl validator — the hub's own contract, run by the publisher
 * (Axon fatia 4: zero tolerance for whoever publishes).
 *
 * Reads public/manifest.jsonl and validates it with the SAME parser the hub
 * uses on ingestion (parseManifest, from @ironidesflj/axon): any rejected
 * line (with its number and reason) or any checksum divergence fails the
 * run. Also enforces the app-side invariant: every published line's id must
 * exist in the id-registry (generate-manifest is the only writer).
 *
 * Usage: bun scripts/validate-manifest.ts   (wired into ci.yml and manifest.yml)
 */
import { readFileSync } from "node:fs";
import { parseManifest, verifyChecksum } from "@ironidesflj/axon";
import { ID_REGISTRY } from "../src/data/questions/id-registry";

const MANIFEST_PATH = "public/manifest.jsonl";

const content = readFileSync(MANIFEST_PATH, "utf8");
const { ok, rejected } = parseManifest(content);

const errors: string[] = [];
for (const r of rejected) errors.push(`line ${r.lineNumber}: ${r.reason}`);

const diverged = ok.filter((r) => !verifyChecksum(r));
for (const r of diverged) errors.push(`id ${r.id}: checksum does not match the snapshot (canonical algorithm)`);

// App-side invariant: every published line maps to a registry entry.
const known = new Set(ID_REGISTRY.map((e) => e.publicId));
for (const r of ok) {
  if (!known.has(r.id)) errors.push(`id ${r.id}: not present in the id-registry (generate-manifest is the only writer)`);
}

const exams = [...new Set(ok.map((r) => r.exam))];
console.log(`manifest.jsonl — ${ok.length} valid · ${rejected.length} rejected · ${diverged.length} divergent`);
console.log(`  exam: ${exams.join(", ") || "—"} · first: ${ok[0]?.id ?? "—"} · last: ${ok[ok.length - 1]?.id ?? "—"}`);

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const e of errors) console.error("  ✗ " + e);
  process.exit(1);
}
console.log("\n✓ manifest valid under the hub parser (Axon fatia 4 — zero tolerance)");

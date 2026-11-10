/**
 * Option-length balance report (run with: bun scripts/option-length-report.ts).
 *
 * Editorial QA for the anti length-bias rule: the correct option must not be
 * conspicuously the longest (or shortest) — test-takers must not be able to
 * guess answers by option length. Purely structural, no network.
 *
 * Report per question: ratio = len(correct) / avg(len(other 3)).
 * Healthy range: 0.80–1.25. Flags:
 *   LONG  = correct is the longest option AND ratio >= 1.2
 *   SHORT = ratio < 0.80
 */
import { CERT_BANKS } from "../src/data/questions/bank";
import type { SeedQuestion } from "../src/data/questions/types";

const files: [string, SeedQuestion[]][] = CERT_BANKS.flatMap((bank) =>
  bank.files.map((file) => [file.file, file.questions] as [string, SeedQuestion[]])
);

let totalLong = 0;
let totalShort = 0;
let total = 0;
let longestIsCorrect = 0;

for (const [name, qs] of files) {
  console.log(`\n=== ${name} (${qs.length} questions) ===`);
  for (const q of qs) {
    total++;
    const lens = q.options.map((o) => o.length);
    const correctLen = lens[q.correctIndex];
    const others = lens.filter((_, i) => i !== q.correctIndex);
    const othersAvg = others.reduce((a, b) => a + b, 0) / others.length;
    const ratio = correctLen / othersAvg;
    const isLongest = correctLen === Math.max(...lens);
    if (isLongest) longestIsCorrect++;
    let flag = "";
    if (isLongest && ratio >= 1.2) {
      flag = "LONG ";
      totalLong++;
    } else if (ratio < 0.8) {
      flag = "SHORT";
      totalShort++;
    }
    if (flag) {
      console.log(`  ${flag} ${q.key}: correct=${correctLen} avgOthers=${Math.round(othersAvg)} ratio=${ratio.toFixed(2)}`);
    }
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total: ${total} | correct-is-longest: ${longestIsCorrect} (${Math.round((longestIsCorrect / total) * 100)}%) | flagged LONG: ${totalLong} | flagged SHORT: ${totalShort}`);
console.log(`Healthy file = 0 flags. Bank-level goal: correct-is-longest <= ~40%, no ratio > 1.25.`);

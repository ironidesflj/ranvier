/**
 * Generates the PWA icon set (public/icons/) from the Ranvier monograma
 * (patch de identidade v1.0 §4).
 *
 * Sources:
 *  - "any" icons: public/favicon.svg (tile #246cad raio 26/120 + monograma
 *    compacto em #f7fbf9) — the launcher icon of the app.
 *  - "maskable" + Apple touch icons: full-bleed square #246cad with the
 *    compact monograma inside the 80% safe zone (launchers crop maskable
 *    icons to a circle/squircle — nothing important near the edges).
 *
 * Run: bun scripts/generate-icons.ts   (idempotent — overwrites outputs)
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT_DIR = "public/icons";

/** Ranvier domain blue + paper ink, straight from the identity patch. */
const BRAND_BLUE = "#246cad";
const PAPER = "#f7fbf9";

/** Compact Topologia Orbital 'R' — 16px/launcher scale. */
const COMPACT_MONOGRAM = `
  <ellipse cx="58" cy="42" rx="33" ry="16" transform="rotate(-16 58 42)" fill="none" stroke="${PAPER}" stroke-width="3.2" opacity=".4"/>
  <g fill="none" stroke="${PAPER}" stroke-width="7.5" stroke-linecap="round">
    <path d="M34 20V100"/>
    <path d="M34 20A53.55 22 0 0 1 87.55 42A53.55 21.56 0 0 1 52 62.31"/>
    <path d="M68 71.34A88.25 88.25 0 0 1 90 98"/>
  </g>
  <g fill="${PAPER}">
    <circle cx="34" cy="20" r="4.8"/>
    <circle cx="34" cy="100" r="4.8"/>
    <circle cx="87.55" cy="42" r="4.8"/>
    <circle cx="52" cy="62.31" r="4.2"/>
    <circle cx="68" cy="71.34" r="6.2"/>
    <circle cx="90" cy="98" r="4.8"/>
  </g>`;

/** Full-bleed maskable icon: tile + compact monograma centered (57% of the
 *  canvas height — well inside the 80% maskable safe zone). */
function fullBleedSvg(size: number): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}">
  <rect width="120" height="120" fill="${BRAND_BLUE}"/>
  ${COMPACT_MONOGRAM}
</svg>`
  );
}

async function renderPng(input: Buffer | string, size: number, file: string) {
  await sharp(input, { density: 400 } as never)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`${OUT_DIR}/${file}`);
  console.log(`  ✓ ${OUT_DIR}/${file} (${size}x${size})`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // "any" purpose — tile #246cad (raio 26/120) + monograma compacto.
  await renderPng("public/favicon.svg", 192, "icon-192.png");
  await renderPng("public/favicon.svg", 512, "icon-512.png");

  // "maskable" purpose — full-bleed blue, monograma in the safe zone.
  await renderPng(fullBleedSvg(512), 192, "icon-maskable-192.png");
  await renderPng(fullBleedSvg(512), 512, "icon-maskable-512.png");

  // Apple touch icon (iOS home screen) — full-bleed, 180 px.
  await renderPng(fullBleedSvg(512), 180, "apple-touch-icon.png");

  console.log("PWA icon set generated (monograma R).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

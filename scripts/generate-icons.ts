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

/** Compact monograma (full leg, no node) — patch §4. */
const COMPACT_MONOGRAM = `
  <g fill="none" stroke="${PAPER}" stroke-width="10" stroke-linecap="round">
    <path d="M38 94V26"/>
    <path d="M38 26h22a20 20 0 0 1 0 40H38"/>
    <path d="M60 66l28 28"/>
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

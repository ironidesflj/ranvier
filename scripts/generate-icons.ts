/**
 * Generates the PWA icon set (public/icons/) from the Ranvier brand mark.
 *
 * Sources:
 *  - "any" icons: public/favicon.svg (rounded square #246cad + white check).
 *  - "maskable" + Apple touch icons: full-bleed square with the check scaled
 *    into the 80% safe zone (maskable icons are cropped by the launcher to a
 *    circle/squircle — nothing important may live near the edges).
 *
 * Run: bun scripts/generate-icons.ts   (idempotent — overwrites outputs)
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT_DIR = "public/icons";

/** Ranvier blue + dark ink, straight from noos-tokens.css. */
const BRAND_BLUE = "#246cad";

/** Full-bleed icon: check mark centered in the maskable safe zone. */
function fullBleedSvg(size: number): Buffer {
  // Check path derived from favicon.svg (viewBox 64 → scaled to a 512 canvas,
  // centered, ~49% width incl. stroke — well inside the 80% safe zone).
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <rect width="512" height="512" fill="${BRAND_BLUE}"/>
  <path d="M155 261 227 333 357 179" fill="none" stroke="#FFFFFF" stroke-width="47" stroke-linecap="round" stroke-linejoin="round"/>
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

  // "any" purpose — rounded square, transparent corners (straight from the favicon).
  await renderPng("public/favicon.svg", 192, "icon-192.png");
  await renderPng("public/favicon.svg", 512, "icon-512.png");

  // "maskable" purpose — full-bleed blue, check inside the safe zone.
  await renderPng(fullBleedSvg(512), 192, "icon-maskable-192.png");
  await renderPng(fullBleedSvg(512), 512, "icon-maskable-512.png");

  // Apple touch icon (iOS home screen) — full-bleed, 180 px.
  await renderPng(fullBleedSvg(512), 180, "apple-touch-icon.png");

  console.log("PWA icon set generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

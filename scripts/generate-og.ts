/**
 * Generates the Open Graph / social preview art (1200×630) — SDD plan debt #1
 * (founder request 2026-10-25; short spec: og:image 1200×630, twitter
 * summary_large_image, apple-touch icon, light/dark art, PT/EN texts, no
 * invented metrics).
 *
 * Design — an "exam ticket" on the Ranvier paper:
 *  - identity row: the favicon tile (domain blue + compact monogram) + the
 *    wordmark (Newsreader) + BY NOOS (Instrument Sans);
 *  - promise: cert eyebrow (mono, domain blue) + PT headline (Newsreader,
 *    second line italic) + EN line (Instrument Sans);
 *  - the "axon" hairline with nodes — the myelin-node motif of the brand and
 *    a nod to the @ironidesflj/axon package adopted in v1.5.0 — separating
 *    the promise from the facts; the Ranvier node is the blue one;
 *  - facts row (mono): only REAL numbers — 300 questions, 6 mock exams,
 *    PT/EN, no signup. Nothing invented (debt spec);
 *  - ticket strip: tinted band, dashed perforation and punched notches,
 *    carrying the unofficial/unaffiliated notice (PT/EN) and GRÁTIS · FREE;
 *  - watermark: the full monogram (with the node) behind the right side.
 *
 * The LIGHT art is THE og:image — paper reads well on both dark and light
 * chat UIs; the dark twin ships as an asset for future per-locale routes /
 * hub reuse (crawlers cannot switch og:image by theme — documented in
 * docs/sdd/spec-v1.5.1-og-preview.md).
 *
 * Typography: the app's brand fonts (Newsreader, Instrument Sans, IBM Plex
 * Mono), resolved by sharp/librsvg through fontconfig. The TTFs must be
 * installed first (Google Fonts → ~/.local/share/fonts/ranvier-og, see the
 * spec doc); without them text silently falls back to DejaVu — always
 * eyeball the output after running. Rendered at 2× and downscaled
 * (lanczos3) so small mono text stays crisp in feed-sized cards.
 *
 * Run: bun scripts/generate-og.ts   (idempotent — overwrites public/og/)
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const OUT_DIR = "public/og";
const W = 1200;
const H = 630;

/** Identity patch palette — paper, ink, domain blue (light) and its negative. */
const PAPER = "#f7fbf9";
const INK = "#0e1b1c";
const INK_NEG = "#e4e9e8";
const BLUE = "#246cad";
const BLUE_NEG = "#8ab8e8";
const DARK_BG = "#0a0f10";
const STRIP_LIGHT = "#edf3ef";
const STRIP_DARK = "#111b1d";

/** Copy on the card — PT/EN per the debt spec; only real facts. */
const CERT_LINE = "DATABRICKS CERTIFIED DATA ENGINEER ASSOCIATE";
const HEAD1 = "Simulados e estudo gratuitos,";
const HEAD2 = "no formato do exame real.";
const EN_LINE = "Free mock exams in the real exam format";
const FACTS = "300 QUESTÕES · 6 SIMULADOS · PT/EN · SEM CADASTRO";
const STRIP_LEFT = "NÃO OFICIAL · UNOFFICIAL — SEM AFILIAÇÃO · UNAFFILIATED";
const STRIP_RIGHT = "GRÁTIS · FREE";

/** Compact monogram (favicon tile geometry, patch §4) — the identity row. */
const TILE = `
  <svg x="72" y="56" width="88" height="88" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="26" fill="${BLUE}"/>
    <g transform="translate(-3 0)" fill="none" stroke="${PAPER}" stroke-width="10" stroke-linecap="round">
      <path d="M38 94V26"/>
      <path d="M38 26h22a20 20 0 0 1 0 40H38"/>
      <path d="M60 66l28 28"/>
    </g>
  </svg>`;

/** Full monogram (interrupted leg + node) as the watermark. */
function watermark(ink: string): string {
  return `
  <svg x="742" y="148" width="400" height="400" viewBox="0 0 120 120" opacity="0.05">
    <g fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round">
      <path d="M38 94V26"/>
      <path d="M38 26h22a20 20 0 0 1 0 40H38"/>
      <path d="M60 66l6.4 6.4"/>
      <path d="M82 88l6 6"/>
    </g>
    <circle cx="73.8" cy="79.8" r="2.8" fill="${ink}"/>
  </svg>`;
}

/** The axon hairline: quiet nodes + the blue Ranvier node. */
function axonLine(ink: string, blue: string): string {
  const nodes = [240, 480, 960]
    .map((x) => `<circle cx="${x}" cy="470" r="4.5" fill="${ink}" opacity="0.22"/>`)
    .join("");
  return `
  <line x1="72" y1="470" x2="1128" y2="470" stroke="${ink}" stroke-width="2" opacity="0.12"/>
  ${nodes}
  <circle cx="720" cy="470" r="7" fill="${blue}"/>`;
}

/** Ticket strip: tinted band, dashed perforation, punched side notches. */
function strip(bg: string, ink: string, blue: string, paper: string): string {
  return `
  <rect x="0" y="542" width="1200" height="88" fill="${bg}"/>
  <line x1="72" y1="542" x2="1128" y2="542" stroke="${ink}" stroke-width="2" opacity="0.28" stroke-dasharray="7 9"/>
  <circle cx="0" cy="542" r="15" fill="${paper}"/>
  <circle cx="1200" cy="542" r="15" fill="${paper}"/>
  <text x="72" y="595" font-family="IBM Plex Mono" font-size="17.5" letter-spacing="1.5" fill="${ink}" fill-opacity="0.72">${STRIP_LEFT}</text>
  <text x="1128" y="595" text-anchor="end" font-family="IBM Plex Mono Medium" font-size="17.5" letter-spacing="1.5" fill="${blue}">${STRIP_RIGHT}</text>`;
}

function ticketSvg(variant: "light" | "dark"): string {
  const light = variant === "light";
  const bg = light ? PAPER : DARK_BG;
  const ink = light ? INK : INK_NEG;
  const blue = light ? BLUE : BLUE_NEG;
  const stripBg = light ? STRIP_LIGHT : STRIP_DARK;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H * 2}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>

  ${watermark(ink)}
  ${TILE}

  <text x="184" y="122" font-family="Newsreader" font-size="60" fill="${ink}">Ranvier</text>
  <text x="186" y="154" font-family="Instrument Sans Medium" font-size="17" letter-spacing="3.2" fill="${ink}" fill-opacity="0.55">BY NOOS</text>

  <text x="72" y="238" font-family="IBM Plex Mono Medium" font-size="21" letter-spacing="2.5" fill="${blue}">${CERT_LINE}</text>

  <text x="72" y="316" font-family="Newsreader" font-size="60" fill="${ink}">${HEAD1}</text>
  <text x="72" y="388" font-family="Newsreader" font-style="italic" font-size="60" fill="${ink}" fill-opacity="0.82">${HEAD2}</text>
  <text x="72" y="436" font-family="Instrument Sans Medium" font-size="26" fill="${ink}" fill-opacity="0.68">${EN_LINE}</text>

  ${axonLine(ink, blue)}
  <text x="72" y="516" font-family="IBM Plex Mono" font-size="20" letter-spacing="1" fill="${ink}" fill-opacity="0.78">${FACTS}</text>

  ${strip(stripBg, ink, blue, bg)}
</svg>`;
}

async function renderPng(variant: "light" | "dark", file: string): Promise<void> {
  const png = await sharp(Buffer.from(ticketSvg(variant)))
    .resize(W, H, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  const meta = await sharp(png).metadata();
  if (meta.width !== W || meta.height !== H) {
    throw new Error(`${file}: expected ${W}×${H}, got ${meta.width}×${meta.height}`);
  }
  await writeFile(`${OUT_DIR}/${file}`, png);
  const kb = (png.byteLength / 1024).toFixed(0);
  console.log(`  ✓ ${OUT_DIR}/${file} (${W}×${H}, ${kb} KB)`);
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  await renderPng("light", "og-image.png");
  await renderPng("dark", "og-image-dark.png");
  console.log("\nDone — light is the og:image; dark ships as an asset (see spec-v1.5.1).");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

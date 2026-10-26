import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes Ranvier installable on students' devices
 * straight from the browser (Chrome/Edge/Android: install prompt + omnibox
 * icon; iOS Safari: Add to Home Screen) and gives the installed app its
 * standalone window, blue splash screen and launcher icons.
 *
 * Served by Next as a metadata route at /manifest.webmanifest.
 *
 * Notes:
 *  - start_url "/" + scope "/": the app is a single page with hash routing
 *    (/#/estudar, /#/simulado…), so every entry point is the same document.
 *  - theme/background colors match the light default (patch §3/§7): paper
 *    #f7fbf9 splash + Android bar; the in-app theme toggle keeps dark mode
 *    as an explicit student choice.
 *  - Shortcut labels are PT-BR (primary audience; the in-app language
 *    toggle keeps EN users fully served inside the app).
 *  - Icons carry the Ranvier monograma R (patch §4) — tile #246cad, raio
 *    26/120, compacto branco (see scripts/generate-icons.ts).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ranvier — Simulados e estudos gratuitos",
    short_name: "Ranvier",
    description:
      "Preparação gratuita para a certificação Databricks Certified Data Engineer Associate: simulados no formato real do exame, modo estudo com explicações e progresso por domínio.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f7fbf9",
    theme_color: "#f7fbf9",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Modo Estudo",
        short_name: "Estudo",
        description: "Questões com feedback imediato, explicação e fontes oficiais.",
        url: "/#/estudar",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Simulado",
        short_name: "Simulado",
        description: "45 questões cronometradas no formato do exame real.",
        url: "/#/certificacao",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Progresso",
        short_name: "Progresso",
        description: "Estatísticas, radar por domínio e fila de revisão de erros.",
        url: "/#/progresso",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}

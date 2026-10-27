"use client";

import { cn } from "@/lib/utils";

/**
 * Monograma Ranvier (patch de identidade v1.0 §4).
 *
 * O R geométrico em grade 120, traço 10, cantos redondos. A perna é
 * interrompida entre 36% e 62% do salto; o nó (5,6/120) ocupa a lacuna —
 * o nó usa --ranvier-node (#246cad no claro, #8ab8e8 no escuro).
 *
 *  - Completo (default): a partir de 24 px — interrupção + nó.
 *  - Compacto (16–23 px, favicon/app icon): perna inteira, sem nó.
 *
 * O traço herda `currentColor` (tinta do tema). Nunca aplicar gradiente,
 * contorno duplo, sombra ou a esfera Noos sobre o símbolo.
 */
export function RanvierMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("shrink-0", className)}
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={10}
      strokeLinecap="round"
    >
      {/* haste + bowl (íntegros nas duas versões) */}
      <path d="M38 94V26" />
      <path d="M38 26h22a20 20 0 0 1 0 40H38" />
      {compact ? (
        /* perna inteira — versão compacta */
        <path d="M60 66l28 28" />
      ) : (
        <>
          {/* perna interrompida no salto */}
          <path d="M60 66l6.4 6.4" />
          <path d="M82 88l6 6" />
          {/* o nó na lacuna */}
          <circle cx="73.8" cy="79.8" r="2.8" fill="var(--ranvier-node)" stroke="none" />
        </>
      )}
    </svg>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { hubHomeUrl } from "@/lib/axon/deep-links";

/**
 * Assinatura "by Noos" (guia Noos v1.1 §02 + decisões do fundador).
 *
 *  - Lugar (guia §04-F + checklist de lançamento + pedido do fundador
 *    2026-10-25): o RODAPÉ de conteúdo, ao lado de Local-First e da versão —
 *    uma única vez por tela, nunca nas duas pontas (o topo fica só com a
 *    marca do app: monograma + Ranvier).
 *  - Decisão do fundador (ADR v1.3.1): a assinatura VOLTA a ser um LINK para
 *    o hub Noos. Isso sobrepõe o "nunca como ação" do guia §02 — é endosso
 *    de origem que leva ao ecossistema, não CTA de produto; a assinatura
 *    continua sem vender nada dentro do app.
 *  - Sempre em inglês: "by" minúsculo, "Noos" capitalizado (nunca "por Noos").
 *  - Mono, tinta suave (muted → foreground no hover), símbolo compacto de
 *    14 px + texto de 13 px (teto do range do guia, preservando o pedido de
 *    legibilidade do fundador de 2026-10-23).
 *  - Alvo de 44 px (mínimo de touch do patch §12).
 *  - Símbolo compacto positivo no claro / negativo no escuro.
 */
export function NoosBadge({ className }: { className?: string }) {
  const { lang, t } = useLang();
  return (
    <a
      href={hubHomeUrl(lang)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.footer.byNoosLabel}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 font-mono text-[13px] leading-none text-muted-foreground transition-colors hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-ink)]",
        className
      )}
    >
      <img src="/brand/noos-compact.svg" alt="" width={14} height={14} aria-hidden className="h-3.5 w-3.5 dark:hidden" />
      <img src="/brand/noos-mark-negative.svg" alt="" width={14} height={14} aria-hidden className="hidden h-3.5 w-3.5 dark:block" />
      <span>by Noos</span>
    </a>
  );
}

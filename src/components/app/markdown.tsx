"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * Renders question stems and explanations (markdown subset: paragraphs,
 * fenced code, inline code, bold, links). No raw HTML is allowed.
 *
 * Bloco de código no mobile (correção do fundador 2026-10-25 — "a barra de
 * rolagem não parava no lugar, voltava automaticamente ao início"):
 *
 *  1. CAUSA-RAIZ do scroll que voltava: o objeto `components` era inline —
 *     identidade nova a cada render — então o React remontava a árvore do
 *     ReactMarkdown sempre que a tela-pai re-renderizava (o timer do
 *     simulado ticka a cada segundo). Remontar destrói o <pre> e o
 *     scrollLeft voltava a 0. Hoje o mapa vive no escopo do módulo:
 *     identidade estável, DOM preservado, rolagem preservada.
 *  2. MOBILE: abaixo de md (768 px) o código QUEBRA LINHA
 *     (whitespace-pre-wrap + break-words) — sem barra de rolagem horizontal
 *     no celular, a pedido do fundador ("ou resolve, ou retire o modo barra").
 *     No desktop (mouse/trackpad) a rolagem horizontal continua, com
 *     overscroll contido para não arrastar a página junto.
 */

const markdownComponents = {
  /* break-words: tokens longos sem espaço (ex.: expressões Spark em texto
     corrido) quebram quando sozinhos excedem a linha — sem isso, a revisão
     no mobile ganhava scroll horizontal (QA v1.4.0). */
  p: ({ children }: { children?: React.ReactNode }) => <p className="whitespace-pre-wrap break-words">{children}</p>,
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="max-w-full overflow-x-auto overscroll-x-contain rounded-sm border bg-muted/60 p-3 font-mono text-[13px] leading-relaxed max-md:whitespace-pre-wrap max-md:break-words">
      {children}
    </pre>
  ),
  code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) return <code className="font-mono">{children}</code>;
    return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] break-words">{children}</code>;
  },
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80 break-words"
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
};

export function Markdown({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("min-w-0 max-w-full space-y-3 break-words leading-relaxed", className)}>
      <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
    </div>
  );
}

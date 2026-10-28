"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookText, ExternalLink, Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { GLOSSARY, type GlossaryEntry } from "@/data/glossary";

/**
 * Glossário bilíngue de consulta (v1.9.0 — spec docs/sdd/
 * spec-v1.9.0-glossario.md §4).
 *
 * Divisão de trabalho: Estudar/Exame = reconhecimento; Flashcards = evocação;
 * Trilhas = sequência; Glossário = CONSULTA. Sem SRS, sem sessão, sem
 * contadores — campo de busca + filtro por domínio + cartões de verbete.
 *
 * O dado é estático (compila no bundle): a view nunca toca rede, API ou
 * TanStack Query — funciona offline POR CONSTRUÇÃO, alinhado ao local-first.
 * Busca insensível a acentos/caixa casa termo + apelidos + glosses (PT e EN).
 */

/** Normaliza para comparação: minúsculas sem diacríticos ("organizacao" ≡ "organização"). */
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Haystack de busca por verbete: termo + apelidos + os dois glosses. */
function haystackOf(e: GlossaryEntry): string {
  return norm([e.term, ...(e.aliases ?? []), e.glossPt, e.glossEn].join(" "));
}

export function GlossaryView() {
  const { t, f, lang } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<number | null>(null);

  /* Ordem alfabética estável pelo termo canônico (EN, como a prova usa). */
  const sorted = useMemo(() => [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term)), []);
  const haystacks = useMemo(() => new Map(GLOSSARY.map((e) => [e.slug, haystackOf(e)])), []);

  const q = norm(query.trim());
  const filtered = useMemo(
    () =>
      sorted.filter(
        (e) => (domain === null || e.domainCodes.includes(domain)) && (!q || (haystacks.get(e.slug) ?? "").includes(q)),
      ),
    [sorted, haystacks, q, domain],
  );

  /* Autofoco no desktop (a busca É o modo de uso da view); no mobile o teclado
     virtual não abre sozinho ao navegar — o campo espera o toque. */
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  /* Teclado (spec §4): "/" foca a busca no desktop. Escape limpa. */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const isFiltered = q !== "" || domain !== null;
  const hasQuery = query.trim() !== "";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.glossary.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.glossary.subtitle}</p>
      </div>

      {/* Busca instantânea — a porta de entrada da view */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
          aria-label={t.glossary.searchLabel}
          placeholder={t.glossary.searchPlaceholder}
          className="h-12 pl-10 pr-16 text-[15px]"
        />
        <span
          className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-[6px] border px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-block"
          aria-hidden
        >
          {t.glossary.searchHint}
        </span>
      </div>

      {/* Filtro por domínio — chips dos 7 domínios oficiais do blueprint */}
      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={t.glossary.domainsLabel}>
        <button
          type="button"
          onClick={() => setDomain(null)}
          aria-pressed={domain === null}
          className={cn(
            "flex min-h-11 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
            domain === null ? "border-transparent bg-primary text-primary-foreground" : "text-muted-foreground hover:border-[var(--noos-border-strong)] hover:text-foreground",
          )}
        >
          {t.glossary.filterAll}
        </button>
        {t.glossary.domains.map((label, i) => {
          const code = i + 1;
          const active = domain === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setDomain(active ? null : code)}
              aria-pressed={active}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                active ? "border-transparent bg-primary text-primary-foreground" : "text-muted-foreground hover:border-[var(--noos-border-strong)] hover:text-foreground",
              )}
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] opacity-70" aria-hidden>
                S{code}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Contagem factual — números do dado, nada inventado (patch §1) */}
      <p className="mt-5 border-b pb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground" aria-live="polite">
        {isFiltered ? f(t.glossary.countFiltered, { total: GLOSSARY.length, shown: filtered.length }) : f(t.glossary.countAll, { total: GLOSSARY.length })}
      </p>

      {/* Estado vazio honesto (spec §4): mensagem + saída clara */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-[14px] border border-dashed p-8 text-center">
          <SearchX className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
          <h2 className="font-display text-xl font-light tracking-[-0.02em]">{t.glossary.emptyTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.glossary.emptyDesc}</p>
          {isFiltered && (
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setDomain(null);
                inputRef.current?.focus();
              }}
            >
              {t.glossary.emptyClear}
            </Button>
          )}
        </div>
      ) : (
        /* Lista com scroll interno + scrollbar customizada (padrão do repo —
           a toolbar de busca/filtro permanece visível acima da lista). */
        <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1" role="list" aria-label={t.glossary.title}>
          {filtered.map((e) => (
            <article
              key={e.slug}
              role="listitem"
              className="rounded-[14px] border bg-card p-4 shadow-[var(--shadow-rest)] sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
                <h3 className="font-display text-[17px] font-medium leading-snug tracking-[-0.01em]">{e.term}</h3>
                <span className="flex flex-wrap items-center gap-1.5" aria-label={t.glossary.domainsLabel}>
                  {e.domainCodes.map((c) => (
                    <span key={c} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">
                      S{c}
                    </span>
                  ))}
                </span>
              </div>

              {e.aliases && e.aliases.length > 0 && (
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">{e.aliases.join(" · ")}</p>
              )}

              <p className="mt-2.5 max-w-[68ch] text-[15px] leading-relaxed">{lang === "pt" ? e.glossPt : e.glossEn}</p>

              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-app-ink underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                {t.glossary.source}
              </a>
            </article>
          ))}
        </div>
      )}

      <p className="mt-6 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:flex">
        <BookText className="h-3.5 w-3.5" aria-hidden />
        {t.glossary.offlineNote}
      </p>
      {hasQuery && <span className="sr-only">{f(t.glossary.countFiltered, { total: GLOSSARY.length, shown: filtered.length })}</span>}
    </div>
  );
}

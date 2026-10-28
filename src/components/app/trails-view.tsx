"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, GraduationCap, Play, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api, ApiError } from "@/lib/api-client";
import { QueryError } from "@/components/app/query-error";

/**
 * Trilhas de estudo (v1.8.0 — spec docs/sdd/spec-v1.8.0-trilhas-flashcards.md
 * §5.6): os 7 domínios oficiais como ROTA ordenada — a resposta ao "por onde
 * começo?". Cada trilha percorre as questões em rampa de dificuldade em
 * tranches; o progresso é 100% derivado dos AttemptAnswer (acertou em
 * qualquer modo = avançou; recarregar/trocar aparelho não perde o ponto).
 *
 * Trilha ENSINA (reconhecimento + feedback imediato na máquina do Estudar);
 * flashcard MANTÉM (evocação + SRS) — modos que se completam sem overlap.
 *
 * Números factuais apenas (patch §1): pesos oficiais do blueprint,
 * completed/total reais, percentual ponderado. Zero streak/XP/confete.
 */
export function TrailsView() {
  const { t, f, lang, langReady } = useLang();
  const { navigate, certSlug } = useAppStore();
  const [tranche, setTranche] = useState("20");

  const { data, isPending } = useQuery({
    queryKey: ["catalog", lang],
    queryFn: () => api.catalog(lang),
    enabled: langReady,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  const cert = data?.certifications.find((c) => c.slug === certSlug) ?? data?.certifications[0] ?? null;

  const {
    data: trails,
    isPending: trailsPending,
    isError: trailsError,
    isFetching: trailsFetching,
    refetch: refetchTrails,
    error: trailsErr,
  } = useQuery({
    queryKey: ["trails", cert?.slug, lang],
    queryFn: () => api.trails(cert!.slug, lang),
    enabled: Boolean(cert?.slug) && langReady,
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  const list = trails?.trails ?? [];
  const routeComplete = trails != null && list.length > 0 && list.every((tr) => tr.state === "complete");
  const nextTrail = list.find((tr) => tr.state === "in_progress") ?? list.find((tr) => tr.state === "not_started") ?? null;

  function startTrail(domainCode: number) {
    navigate("study", { trail: { domainCode, limit: Number(tranche) } });
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.trails.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.trails.subtitle}</p>
      </div>

      {isPending || !cert ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : trailsError ? (
        <QueryError
          onRetry={() => void refetchTrails()}
          isRetrying={trailsFetching}
          code={trailsErr instanceof ApiError ? `HTTP ${trailsErr.status}` : undefined}
        />
      ) : trailsPending ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : !trails || list.length === 0 ? (
        <div className="border border-dashed p-8 text-center text-sm text-muted-foreground">{t.common.error}</div>
      ) : (
        <>
          {/* Cabeçalho da rota: percentual ponderado factual + próxima
              trilha (ou o convite ao simulado quando 100%). */}
          <section className="rounded-[14px] border bg-card p-6 shadow-[var(--shadow-rest)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-medium">{f(t.trails.routeLabel, { cert: cert.shortName })}</h2>
              <p className="font-mono text-sm font-medium tabular-nums text-app-ink">
                {Math.round(trails.overallPercent)}%
              </p>
            </div>
            {/* barra de 3 px — filete reto de leitura (patch §9) */}
            <div className="mt-3 h-[3px] w-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(trails.overallPercent)} aria-label={`${Math.round(trails.overallPercent)}%`}>
              <div className="h-full bg-app-ink" style={{ width: `${Math.max(Math.round(trails.overallPercent), 1)}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {routeComplete ? t.trails.routeComplete : nextTrail ? f(t.trails.routeNext, { name: nextTrail.name }) : ""}
            </p>

            {routeComplete && (
              <Button className="mt-4" onClick={() => navigate("cert")}>
                <GraduationCap className="h-4 w-4" />
                {t.trails.routeCompleteCta}
              </Button>
            )}

            {/* Tranches — mesma granularidade das outras sessões do app. */}
            {!routeComplete && (
              <div className="mt-5 max-w-56 space-y-2">
                <Label htmlFor="trail-tranche" className="text-sm font-medium">
                  {t.trails.trancheLabel}
                </Label>
                <Select value={tranche} onValueChange={setTranche}>
                  <SelectTrigger id="trail-tranche" className="w-full sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["10", "20", "30", "50"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n} {t.common.questions}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </section>

          {/* As 7 trilhas — um card por domínio oficial, na ordem do blueprint. */}
          <div className="mt-6 space-y-4">
            {list.map((tr) => {
              const done = tr.completed;
              const total = tr.total;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <article key={tr.code} className="rounded-[14px] border bg-card p-5 shadow-[var(--shadow-rest)] sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="min-w-0 font-medium">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">{tr.code}.</span>
                      {tr.name}
                    </h3>
                    <p className="shrink-0 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                      {f(t.trails.weightLabel, { percent: tr.weightPercent })}
                    </p>
                  </div>

                  {/* 2 bullets do outline oficial (EN/PT do seed de domínios). */}
                  <ul className="mt-3 space-y-1.5">
                    {tr.outline.slice(0, 2).map((bullet) => (
                      <li key={bullet} className="flex min-w-0 items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" aria-hidden />
                        <span className="min-w-0">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Progresso factual da trilha. */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
                      {f(t.trails.progressLabel, { done, total })}
                    </p>
                    <p className="font-mono text-xs font-medium tabular-nums text-app-ink">{pct}%</p>
                  </div>
                  <div className="mt-1.5 h-[3px] w-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${pct}%`}>
                    <div
                      className={cn("h-full", tr.state === "complete" ? "bg-[var(--noos-success)]" : "bg-app-ink")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* CTA por estado: Iniciar · Continuar · Concluída (+ prática livre). */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {tr.state === "complete" ? (
                      <>
                        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-[var(--noos-success-line)] bg-[var(--noos-success-soft)] px-4 text-sm font-medium text-[var(--noos-success)]">
                          <CheckCircle2 className="h-4 w-4" aria-hidden />
                          {t.trails.complete}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => navigate("study", { domainCode: tr.code })}>
                          {t.trails.practiceFree}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => startTrail(tr.code)}>
                        {tr.state === "in_progress" ? <ArrowRight className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {tr.state === "in_progress" ? t.trails.continue : t.trails.start}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowUp, BookOpenCheck, Home, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { APP_VERSION } from "@/lib/version";
import { orderOptions } from "@/lib/option-order";
import { QuestionCard } from "@/components/app/question-card";
import { QueryError } from "@/components/app/query-error";
import { AdSlot } from "@/components/app/ad-slot";
import type { ReviewQuestion } from "@/lib/types";

/**
 * Resultado (patch Ranvier v1.0 §9 + v1.1 §12) — "laudo em papel, não troféu".
 *
 *  - Nota em mono grande (56–84) + `/ total` em muted; status com ponto
 *    verde discreto; linha de corte marcada na régua de 3 px.
 *  - Breakdown por domínio com porcentagem COLORIDA (verde ≥ corte /
 *    vermelho < corte) — restaurado a pedido do fundador 2026-10-26
 *    (feedback nº 7, não enviado ao design; o visual antigo voltou).
 *  - Barra fixa no topo (v1.1 §11): "Início" sempre à mão — depois de
 *    rolar a revisão inteira, voltar é um toque, não uma escalada
 *    (feedback nº 4). "Topo" devolve ao início da página.
 *  - Revisão por questão com explicação e fonte SEMPRE abertas (v1.1 §11,
 *    feedback nº 2) e alternativas na MESMA ordem embaralhada da sessão
 *    (semente por attemptId — nota B, feedback nº 5).
 *  - Proibido (e ausente): confete, anel colorido, emoji, ranking, badge
 *    de "parabéns".
 */
export function ResultsView() {
  const { t, f, lang } = useLang();
  const { attemptId, navigate, certSlug } = useAppStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "wrong">("all");
  const autoSubmittedId = useRef<string | null>(null);

  const { data: detail, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => api.getAttempt(attemptId!),
    enabled: Boolean(attemptId),
    refetchOnMount: "always",
  });

  // Auto-submit study attempts opened straight in results (defensive)
  const { mutate: submit, isError: submitError } = useMutation({
    mutationFn: (id: string) => api.submit(id),
    onSuccess: (_res, id) => {
      void queryClient.invalidateQueries({ queryKey: ["attempt", id] });
    },
    onError: () => toast.error(t.toast.error),
  });

  useEffect(() => {
    // Cached IN_PROGRESS data can outlive a successful submit. Wait for the
    // fresh detail, then submit a resumed study session only once.
    if (isFetching || isError || detail?.status !== "IN_PROGRESS") return;
    if (detail.mode === "EXAM") {
      navigate("exam", { attemptId: detail.attemptId });
      return;
    }
    if (autoSubmittedId.current === detail.attemptId) return;
    autoSubmittedId.current = detail.attemptId;
    submit(detail.attemptId);
  }, [isFetching, isError, detail?.status, detail?.mode, detail?.attemptId, navigate, submit]);

  const questions = (detail?.questions ?? []) as ReviewQuestion[];
  const result = detail?.result ?? null;

  const wrongQuestions = useMemo(() => questions.filter((q) => !q.correct), [questions]);
  const visible = filter === "wrong" ? wrongQuestions : questions;

  const retryExam = useMutation({
    mutationFn: () => api.startAttempt({ certSlug, mode: "EXAM" }),
    onSuccess: (res) => {
      toast.success(t.toast.started);
      navigate("exam", { attemptId: res.attemptId });
    },
    onError: () => toast.error(t.toast.error),
  });

  if (!attemptId) {
    navigate("home");
    return null;
  }

  if (isError || submitError) {
    return <QueryError onRetry={() => {
      if (submitError && detail) submit(detail.attemptId);
      else void refetch();
    }} />;
  }

  if (isLoading || !detail || !result) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Skeleton className="mb-6 h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isExam = detail.mode === "EXAM";
  const durationMin = Math.floor(result.durationSec / 60);
  const durationSec = result.durationSec % 60;
  const completedAt = result.completedAt ? new Date(result.completedAt) : null;
  const dateStr = completedAt
    ? completedAt.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-10">
      {/* h1 semântico para leitores de tela (equipe UX 3-b FAIL-6) */}
      <h1 className="sr-only">{isExam ? t.results.reportTitle : t.results.studyTitle}</h1>

      {/* Barra fixa do laudo (v1.1 §11 — feedback nº 4): Início e Topo
          sempre à mão, mesmo depois de rolar a revisão inteira. Sombra de
          flutuação só depois do scroll (v1.1 §6). */}
      <div className="sticky top-14 z-30 -mx-4 mb-6 border-b bg-card/95 px-4 py-2 backdrop-blur-sm supports-[backdrop-filter]:bg-card/90">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("home")} aria-label={t.results.backHome}>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">{t.nav.home}</span>
            </Button>
            <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {(isExam ? t.results.reportTitle : t.results.studyTitle)} · {detail.certShortName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="font-mono text-sm font-medium tabular-nums">
              {result.score}<span className="text-muted-foreground">/{result.total}</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label={t.results.scrollTop}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="hidden sm:inline">{t.results.scrollTop}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Laudo */}
      <header className="border-b pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {isExam ? t.results.reportTitle : t.results.studyTitle}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {f(t.results.reportFooter, { date: dateStr, duration: `${durationMin}m ${durationSec}s`, version: `v${APP_VERSION}` })}
          </p>
        </div>

        {/* Nota em mono grande + /total em muted */}
        <div className="mt-4 flex items-baseline gap-3">
          <p className="font-mono text-6xl font-medium leading-none tabular-nums tracking-[-0.01em] sm:text-7xl">
            {result.score}
          </p>
          <p className="font-mono text-xl tabular-nums text-muted-foreground">/ {result.total}</p>
          <p className="ml-2 font-mono text-sm tabular-nums text-muted-foreground">{Math.round(result.percent)}%</p>
        </div>

        {/* Status com ponto discreto + linha de corte */}
        <p className="mt-3 flex items-center gap-2 text-sm">
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", result.passed ? "bg-[var(--noos-success)]" : "bg-[var(--noos-danger)]")}
            aria-hidden
          />
          {isExam &&
            (result.passed
              ? f(t.results.aboveCutoff, { passing: result.passingScore })
              : f(t.results.belowCutoff, { passing: result.passingScore }))}
          {!isExam && f(t.results.scoreValue, { score: result.score, total: result.total })}
        </p>
        <div className="relative mt-4 h-[3px] w-full max-w-md bg-surface-2">
          <div className="h-full bg-app-ink" style={{ width: `${Math.max(Math.round(result.percent), 1)}%` }} />
          <span
            className="absolute -top-1 h-[11px] w-px bg-[var(--noos-border-strong)]"
            style={{ left: `${result.passingScore}%` }}
            aria-hidden
          />
          <span className="absolute -top-6 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground" style={{ left: `${result.passingScore}%` }}>
            {f(t.results.cutoffMarker, { passing: result.passingScore })}
          </span>
        </div>
        <p className="mt-3 max-w-[62ch] text-xs leading-relaxed text-muted-foreground">{t.home.passingNote}</p>
      </header>

      {/* Ações */}
      <div className="mt-5 flex flex-wrap gap-3">
        {wrongQuestions.length > 0 && (
          <Button onClick={() => navigate("study", { questionIds: wrongQuestions.map((q) => q.id) })}>
            <BookOpenCheck className="h-4 w-4" />
            {f(t.results.reviewN, { count: wrongQuestions.length })}
          </Button>
        )}
        {isExam && (
          <Button variant="outline" onClick={() => retryExam.mutate()} disabled={retryExam.isPending}>
            {retryExam.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            {t.results.retryExam}
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate("home")}>
          <Home className="h-4 w-4" />
          {t.results.backHome}
        </Button>
      </div>

      {/* Breakdown por domínio — porcentagem com cor (verde ≥ corte /
          vermelho < corte), restaurada a pedido do fundador 2026-10-26
          (feedback nº 7). Barras de 3 px acompanham a cor; valores tabulares. */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-light tracking-[-0.02em]">{t.results.byDomain}</h2>
        <div className="space-y-4">
          {result.byDomain.map((d) => {
            const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
            const color = pct >= result.passingScore ? "text-[var(--noos-success)]" : "text-[var(--noos-danger)]";
            const barColor = pct >= result.passingScore ? "bg-[var(--noos-success)]" : "bg-[var(--noos-danger)]";
            return (
              <div key={d.code}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <p className="min-w-0 font-medium">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">{d.code}</span>
                    {lang === "pt" ? d.namePt : d.name}
                  </p>
                  <p className="flex shrink-0 items-baseline gap-2 font-mono text-sm tabular-nums">
                    <span className="text-muted-foreground">{d.correct}/{d.total}</span>
                    <span className={cn("font-medium", color)} aria-label={`${pct}%`}>
                      {pct}%
                    </span>
                  </p>
                </div>
                <div className="h-[3px] w-full bg-surface-2" role="img" aria-label={`${pct}%`}>
                  <div className={cn("h-full", barColor)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Revisão */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-light tracking-[-0.02em]">{t.results.reviewTitle}</h2>
          {wrongQuestions.length > 0 && (
            <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "wrong")}>
              <TabsList>
                <TabsTrigger value="all">{t.results.reviewFilterAll} ({questions.length})</TabsTrigger>
                <TabsTrigger value="wrong">{t.results.reviewFilterWrong} ({wrongQuestions.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="space-y-8">
          {visible.map((q) => {
            /* Mesma ordem embaralhada da sessão (semente attemptId — nota B):
               a revisão reproduz exatamente o que a pessoa viu na prova. */
            const ordering = orderOptions(q, detail.attemptId, q.id);
            const displayCorrect = ordering.toDisplay(q.correctIndex);
            const displaySelected = q.selectedIndex !== null ? ordering.toDisplay(q.selectedIndex) : null;
            return (
              <div key={q.id}>
                <p className="mb-3 flex flex-wrap items-center gap-2 border-b pb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-[6px] border text-[11px] font-medium",
                      q.correct ? "border-[var(--noos-success)] text-[var(--noos-success)]" : "border-[var(--noos-danger)] text-[var(--noos-danger)]"
                    )}
                    aria-hidden
                  >
                    {q.correct ? "✓" : "✗"}
                  </span>
                  {f(t.results.question, { n: questions.indexOf(q) + 1 })}
                  <span className="text-muted-foreground/70">{q.publicId}</span>
                  {q.selectedIndex === null && (
                    <span className="rounded-[6px] border px-1.5 py-0.5 font-medium">{t.results.noAnswer}</span>
                  )}
                </p>
                <QuestionCard
                  question={{ ...q, options: ordering.options }}
                  selectedIndex={displaySelected}
                  review={{
                    correctIndex: displayCorrect,
                    correct: q.correct,
                    explanationEn: q.explanationEn,
                    explanationPt: q.explanationPt,
                    referenceUrl: q.referenceUrl,
                    referenceTitle: q.referenceTitle,
                  }}
                  /* Pills preenchidas de domínio + dificuldade logo abaixo do
                     cabeçalho "Questão N" (fundador 2026-10-26: "abaixo da
                     questão x aparecia o domínio tal e a dificuldade, os dois
                     com fundo preenchido — eu gostava disso, traz de volta"). */
                  showMeta
                />
              </div>
            );
          })}
        </div>
      </section>

      <AdSlot placement="results" className="mt-10" />
    </div>
  );
}

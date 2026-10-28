"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Layers, Loader2, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api, ApiError } from "@/lib/api-client";
import { orderOptions, type OptionOrdering } from "@/lib/option-order";
import { QuestionCard, type FeedbackState } from "@/components/app/question-card";
import { QueryError } from "@/components/app/query-error";
import type { FlashcardDrawScope, PublicQuestion } from "@/lib/types";

type Phase = "config" | "session" | "done";

interface CardResult {
  questionId: string;
  correct: boolean;
  intervalDays: number;
}

/**
 * Flashcards com repetição espaçada (v1.7.0 — spec
 * docs/sdd/spec-v1.7.0-flashcards.md).
 *
 * 1 questão do banco = 1 cartão. Frente com as alternativas (recall ativo
 * fiel ao formato da prova); a resposta/pulo chama o servidor, que corrige,
 * aplica o SM-2 e devolve o verso (gabarito + explicação + fonte + próxima
 * revisão). Cartão "errado/pulado" re-entra na fila DA PRÓPRIA SESSÃO
 * (limitado a 1 re-entrada por cartão — garantia de término).
 *
 * Nada de streak/XP/confete: o máximo de gamificação é o número factual
 * "N para hoje" (patch §1). Barra de sessão presa como no Estudar (§10.1);
 * alternativas embaralhadas por sessão com semente estável (nota B).
 */
export function FlashcardsView() {
  const { t, f, lang, langReady } = useLang();
  const { navigate, certSlug } = useAppStore();
  const queryClient = useQueryClient();

  const { data, isPending, isError, isFetching, refetch, error } = useQuery({
    queryKey: ["catalog", lang],
    queryFn: () => api.catalog(lang),
    enabled: langReady,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  const cert = data?.certifications.find((c) => c.slug === certSlug) ?? data?.certifications[0] ?? null;

  const { data: summary, isPending: summaryPending, isError: summaryError, refetch: refetchSummary, error: summaryErr } = useQuery({
    queryKey: ["flashcards-summary", cert?.slug],
    queryFn: () => api.flashcardsSummary(cert!.slug),
    enabled: Boolean(cert?.slug),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const [phase, setPhase] = useState<Phase>("config");
  const [scope, setScope] = useState<FlashcardDrawScope>("mixed");
  const [count, setCount] = useState("20");
  /* Fila da sessão (cresce com re-entradas) + semente estável de embaralhamento. */
  const [queue, setQueue] = useState<PublicQuestion[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{ selected: number | null; feedback: FeedbackState; intervalDays: number } | null>(null);
  const [results, setResults] = useState<Record<string, CardResult>>({});
  const [requeued, setRequeued] = useState<Set<string>>(new Set());

  const draw = useMutation({
    mutationFn: () => api.flashcardsDraw({ certSlug: cert?.slug ?? certSlug, scope, limit: Number(count) }),
    onSuccess: (res) => {
      if (res.cards.length === 0) {
        toast.info(t.flashcards.queueEmpty);
        void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
        return;
      }
      setQueue(res.cards);
      setSessionId(`fc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
      setIndex(0);
      setPick(null);
      setCurrentFeedback(null);
      setResults({});
      setRequeued(new Set());
      setPhase("session");
      toast.success(t.flashcards.toastStarted);
      window.scrollTo({ top: 0 });
    },
    onError: () => toast.error(t.toast.error),
  });

  /* Revisão: resposta (índice canônico) ou pulo (null) — a correção e o
     agendamento acontecem no servidor; o verso é montado com a resposta. */
  async function handleReview(question: PublicQuestion, ordering: OptionOrdering, displayPick: number | null) {
    if (reviewing || currentFeedback) return;
    setReviewing(true);
    const canonical = displayPick !== null ? ordering.toCanonical(displayPick) : null;
    try {
      const res = await api.flashcardsReview(question.id, canonical);
      const feedback: FeedbackState = {
        correct: res.correct,
        correctIndex: ordering.toDisplay(res.correctIndex),
        explanationEn: res.explanationEn,
        explanationPt: res.explanationPt,
        referenceUrl: res.referenceUrl,
        referenceTitle: res.referenceTitle,
      };
      setCurrentFeedback({ selected: displayPick, feedback, intervalDays: res.intervalDays });
      setResults((prev) => ({ ...prev, [question.id]: { questionId: question.id, correct: res.correct, intervalDays: res.intervalDays } }));
      /* Cartão errado/pulado: re-entra na fila da sessão (1× por cartão —
         garantia de término; o estado dele já vence AGORA no servidor). */
      if (!res.correct && !requeued.has(question.id)) {
        setQueue((prev) => [...prev, question]);
        setRequeued((prev) => new Set(prev).add(question.id));
      }
    } catch {
      toast.error(t.toast.error);
    } finally {
      setReviewing(false);
    }
  }

  function nextCard() {
    setPick(null);
    setCurrentFeedback(null);
    if (index + 1 >= queue.length) {
      setPhase("done");
      void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
      toast.success(t.flashcards.toastFinished);
    } else {
      setIndex(index + 1);
    }
    window.scrollTo({ top: 0 });
  }

  function finishSession() {
    setPhase("done");
    void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
    toast.success(t.flashcards.toastFinished);
  }

  const seenCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r.correct).length;
  const reentryCount = requeued.size;
  const current = queue[index] ?? null;
  const ordering = useMemo(
    () => (current ? orderOptions(current, sessionId, current.id) : null),
    [current, sessionId],
  );

  function srsWhen(intervalDays: number): string {
    if (intervalDays === 0) return t.flashcards.dueToday;
    if (intervalDays === 1) return t.flashcards.dueTomorrow;
    return f(t.flashcards.dueInDays, { days: intervalDays });
  }

  // -------------------------------------------------------------------
  // Config phase — resumo factual + escopo + início
  // -------------------------------------------------------------------
  if (phase === "config") {
    const totalAvailable = (summary?.dueCount ?? 0) + (summary?.newCount ?? 0);
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.flashcards.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.flashcards.subtitle}</p>
        </div>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isError ? (
          <QueryError
            onRetry={() => void refetch()}
            isRetrying={isFetching}
            code={error instanceof ApiError ? `HTTP ${error.status}` : undefined}
          />
        ) : !cert ? (
          <div className="border border-dashed p-8 text-center text-sm text-muted-foreground">{t.common.error}</div>
        ) : summaryPending ? (
          <Skeleton className="h-48 w-full" />
        ) : summaryError ? (
          <QueryError onRetry={() => void refetchSummary()} isRetrying={false} code={summaryErr instanceof ApiError ? `HTTP ${summaryErr.status}` : undefined} />
        ) : !summary || totalAvailable === 0 ? (
          /* Fila vazia de verdade: sem vencidas e sem novas — volta amanhã. */
          <div className="rounded-[14px] border border-dashed bg-card p-8 text-center">
            <Layers className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
            <h2 className="font-display text-xl font-light tracking-[-0.02em]">{t.flashcards.emptyTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.flashcards.emptyDesc}</p>
            <Button variant="outline" className="mt-5" onClick={() => navigate("study")}>
              {t.study.newSession}
            </Button>
          </div>
        ) : (
          <section className="rounded-[14px] border bg-card p-6 shadow-[var(--shadow-rest)]">
            <h2 className="text-base font-medium">{cert.shortName}</h2>

            {/* Números factuais do dono — nada inventado (patch §1). */}
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.flashcards.dueTodayLabel}</dt>
                <dd className="font-mono text-sm font-medium tabular-nums">{summary.dueCount}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.flashcards.inRotation}</dt>
                <dd className="font-mono text-sm font-medium tabular-nums">{summary.totalCards - summary.newCount}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t pt-2.5">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.flashcards.scopeNew}</dt>
                <dd className="font-mono text-sm font-medium tabular-nums">{summary.newCount}</dd>
              </div>
            </dl>

            {/* Escopo da fila */}
            <div className="mt-6 space-y-2">
              <Label className="text-sm font-medium">{t.flashcards.scopeLabel}</Label>
              <div className="inline-flex overflow-hidden rounded-[10px] border" role="group" aria-label={t.flashcards.scopeLabel}>
                {(
                  [
                    ["mixed", t.flashcards.scopeMixed],
                    ["due", t.flashcards.scopeDue],
                    ["new", t.flashcards.scopeNew],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScope(value)}
                    aria-pressed={scope === value}
                    className={cn(
                      "flex min-h-11 items-center px-4 text-sm font-medium transition-colors",
                      scope === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cartões por sessão */}
            <div className="mt-6 space-y-2">
              <Label htmlFor="fc-count" className="text-sm font-medium">
                {t.flashcards.countLabel}
              </Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger id="fc-count" className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["10", "20", "30", "50"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" className="mt-6 w-full sm:w-auto" disabled={draw.isPending} onClick={() => draw.mutate()}>
              {draw.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {t.flashcards.start}
            </Button>
          </section>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Session phase — frente → resposta/pulo → verso → próximo
  // -------------------------------------------------------------------
  if (phase === "session" && current && ordering) {
    const reviewed = seenCount;
    const percent = queue.length > 0 ? Math.round(((index) / queue.length) * 100) : 0;

    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        <h1 className="sr-only">
          {f(t.flashcards.cardOf, { current: index + 1, total: queue.length })} — {t.app.name}
        </h1>

        {/* Barra de sessão presa (padrão §10.1): Início sempre à mão. */}
        <div className="sticky top-14 z-30 -mx-4 mb-6 border-b bg-card px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (seenCount > 0 ? finishSession() : navigate("home"))}
                aria-label={t.nav.home}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t.nav.home}</span>
              </Button>
              <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {cert?.shortName ?? ""} · {t.flashcards.title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {f(t.flashcards.sessionStats, { correct: correctCount, answered: seenCount })}
              </p>
            </div>
          </div>
          <div className="mt-2 h-[3px] w-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`${percent}%`}>
            <div className="h-full bg-app-ink transition-[width] duration-200 ease-out" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {/* Metadados: CARTÃO N / TOTAL (com re-entradas, o total pode crescer) */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
          <p className="font-mono text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {f(t.flashcards.cardOf, { current: index + 1, total: queue.length })}
          </p>
          {requeued.has(current.id) && (
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              ↻ {t.flashcards.dueToday}
            </p>
          )}
        </div>

        <QuestionCard
          question={{ ...current, options: ordering.options }}
          selectedIndex={currentFeedback ? currentFeedback.selected : pick}
          feedback={currentFeedback?.feedback ?? null}
          onSelect={(i) => setPick(i)}
          onConfirm={pick !== null && !currentFeedback ? () => void handleReview(current, ordering, pick) : undefined}
          disabled={reviewing}
          showMeta
        />

        {/* Rodapé: Confirmar / Pular (frente) · Próximo + linha SRS (verso) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-3">
            {currentFeedback ? (
              <Button onClick={nextCard}>
                {index + 1 >= queue.length ? t.study.finishSession : t.flashcards.next}
                {index + 1 < queue.length && <ArrowRight className="h-4 w-4" />}
              </Button>
            ) : (
              <>
                <Button disabled={pick === null || reviewing} onClick={() => pick !== null && void handleReview(current, ordering, pick)}>
                  {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t.study.checkAnswer}
                </Button>
                {/* Pular: revela o verso sem responder — conta como "errei"
                    para o SRS (mesma semântica de questão em branco). */}
                <Button variant="ghost" disabled={reviewing} onClick={() => void handleReview(current, ordering, null)}>
                  {t.flashcards.skip}
                </Button>
              </>
            )}
          </div>
          {/* Linha SRS factual no verso — o agendamento devolvido pelo servidor. */}
          {currentFeedback && (
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground" role="status">
              {f(t.flashcards.nextReview, { when: srsWhen(currentFeedback.intervalDays) })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Done phase — resumo honesto, sem troféu
  // -------------------------------------------------------------------
  if (phase === "done") {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-center">
        <Target className="mx-auto mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
        <h2 className="font-display text-2xl font-light tracking-[-0.02em]">{t.flashcards.summaryTitle}</h2>
        <p className="mt-2 text-muted-foreground">
          {f(t.flashcards.summaryStats, { seen: seenCount, correct: correctCount, reentries: reentryCount })}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => setPhase("config")}>
            {t.flashcards.newSession}
          </Button>
          <Button onClick={() => navigate("home")}>{t.nav.home}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 text-center">
      <p className="text-muted-foreground">{t.common.error}</p>
      <Button className="mt-4" variant="outline" onClick={() => setPhase("config")}>
        {t.flashcards.newSession}
      </Button>
    </div>
  );
}

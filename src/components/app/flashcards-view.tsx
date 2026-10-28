"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, Layers, Loader2, Play, Target, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Markdown } from "@/components/app/markdown";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api, ApiError } from "@/lib/api-client";
import { orderOptions, type OptionOrdering } from "@/lib/option-order";
import { QuestionCard, LETTERS } from "@/components/app/question-card";
import { QueryError } from "@/components/app/query-error";
import type { FlashcardDrawnCard, FlashcardDrawScope } from "@/lib/types";

type Phase = "config" | "session" | "done";

/** localStorage flag: the recall instruction shows only on the first session. */
const HINT_SEEN_KEY = "ranvier:fc-hint-seen";

/** Reveal payload for the current card (display-mapped through the session ordering). */
interface RevealedCard {
  correctIndex: number;
  explanationEn: string;
  explanationPt: string;
  referenceUrl: string | null;
  referenceTitle: string | null;
  wrongDays: number;
  rightDays: number;
}

/**
 * Flashcards com repetição espaçada — SESSÃO V2 (v1.8.0 — spec
 * docs/sdd/spec-v1.8.0-trilhas-flashcards.md §3).
 *
 * Divisão de trabalho com os outros modos: Estudar/Exame treinam
 * RECONHECIMENTO (alternativas clicáveis, correção server-side); o
 * flashcard treina EVOCAÇÃO — a frente não mostra alternativas (exceto nas
 * 18 "statement-selection", onde as afirmações SÃO o enunciado), o aluno
 * tenta lembrar, vira o cartão e se julga com honestidade binária:
 *
 *   frente (evocação) → "Ver resposta" → verso (gabarito + explicação) →
 *   [ Errei · volta hoje ]  [ Acertei · amanhã/em N dias ] → próximo cartão.
 *
 * As projeções SRS vêm do SERVIDOR no reveal (mesma matemática de srs.ts,
 * função pura aplicada sem persistir) — o aluno vê o efeito de cada
 * julgamento antes de decidir (padrão Anki). Julgar = avançar. "Errei"
 * re-entra na fila da própria sessão (1× por cartão — garantia de término).
 * Virar e abandonar sem julgar NÃO registra revisão (o cartão segue devido).
 *
 * Teclado (desktop): Espaço/Enter vira · 1 = errei · 2 = acertei.
 * Nada de streak/XP/confete (patch §1) — o máximo de gamificação é o
 * número factual "N para hoje".
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
  const [queue, setQueue] = useState<FlashcardDrawnCard[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<RevealedCard | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
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
      setRevealed(null);
      setResults({});
      setRequeued(new Set());
      setPhase("session");
      toast.success(t.flashcards.toastStarted);
      window.scrollTo({ top: 0 });
    },
    onError: () => toast.error(t.toast.error),
  });

  const current = queue[index] ?? null;
  const ordering = useMemo(
    () => (current ? orderOptions(current, sessionId, current.id) : null),
    [current, sessionId],
  );

  /* V2: reveal é LEITURA — verso + projeções; sem escrita de estado. */
  async function handleReveal(card: FlashcardDrawnCard, ord: OptionOrdering) {
    if (revealing || revealed) return;
    setRevealing(true);
    try {
      const res = await api.flashcardsReveal(card.id);
      setRevealed({
        correctIndex: ord.toDisplay(res.correctIndex),
        explanationEn: res.explanationEn,
        explanationPt: res.explanationPt,
        referenceUrl: res.referenceUrl,
        referenceTitle: res.referenceTitle,
        wrongDays: res.projection.wrong.intervalDays,
        rightDays: res.projection.right.intervalDays,
      });
    } catch {
      toast.error(t.toast.error);
    } finally {
      setRevealing(false);
    }
  }

  /* V2: julgamento binário do aluno → escrita SM-2 → auto-avançar.
     "Errei" re-entra na fila 1× (o estado dele já vence AGORA no servidor). */
  async function handleGrade(remembered: boolean) {
    if (!current || !revealed || grading) return;
    setGrading(true);
    const willRequeue = !remembered && !requeued.has(current.id);
    try {
      await api.flashcardsGrade(current.id, remembered);
      setResults((prev) => ({ ...prev, [current.id]: remembered }));
      if (willRequeue) {
        setQueue((prev) => [...prev, current]);
        setRequeued((prev) => new Set(prev).add(current.id));
      }
      /* Avança contra a fila COMO FICARÁ (re-entrada já contabilizada). */
      if (index + 1 >= queue.length + (willRequeue ? 1 : 0)) {
        setPhase("done");
        void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
        toast.success(t.flashcards.toastFinished);
      } else {
        setIndex(index + 1);
      }
      setRevealed(null);
      window.scrollTo({ top: 0 });
    } catch {
      toast.error(t.toast.error);
    } finally {
      setGrading(false);
    }
  }

  function finishSession() {
    setPhase("done");
    void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
    toast.success(t.flashcards.toastFinished);
  }

  const seenCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter(Boolean).length;
  const reentryCount = requeued.size;

  /* Teclado (spec §3.2): Espaço/Enter vira · 1 = errei · 2 = acertei. */
  useEffect(() => {
    if (phase !== "session" || !current || !ordering) return;
    const card = current;
    const ord = ordering;
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        /* Enter num botão/link focado deixa o clique nativo agir. */
        if (e.key === "Enter" && target?.closest("button, a")) return;
        e.preventDefault(); // Espaço não rola a página nem "clica" botão focado
        void handleReveal(card, ord);
      } else if (revealed && (e.key === "1" || e.key === "2")) {
        e.preventDefault();
        void handleGrade(e.key === "2");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [phase, current, ordering, revealed, revealing, grading, index, queue, requeued]);

  /* Rótulo da projeção SRS (calculada no servidor, formatada aqui). */
  function projLabel(days: number): string {
    if (days === 0) return t.flashcards.projToday;
    if (days === 1) return t.flashcards.projTomorrow;
    return f(t.flashcards.projInDays, { days });
  }

  /* Instrução de evocação: só na primeira sessão (localStorage 1×). */
  const [hintSeen, setHintSeen] = useState(true);
  useEffect(() => {
    try {
      setHintSeen(Boolean(window.localStorage.getItem(HINT_SEEN_KEY)));
    } catch {
      setHintSeen(true);
    }
  }, []);
  function markHintSeen() {
    if (hintSeen) return;
    setHintSeen(true);
    try {
      window.localStorage.setItem(HINT_SEEN_KEY, "1");
    } catch {
      /* sem storage: a instrução vale só nesta sessão — aceitável */
    }
  }

  // -------------------------------------------------------------------
  // Config phase — resumo factual + escopo + início (inalterado da v1.7.0)
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
  // Session phase — frente (evocação) → verso (gabarito) → julgamento
  // -------------------------------------------------------------------
  if (phase === "session" && current && ordering) {
    const percent = queue.length > 0 ? Math.round((index / queue.length) * 100) : 0;

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

        {/* FRENTE (evocação) — sem alternativas; as 18 statement-selection
            mostram as afirmações como parte do enunciado (não-clicáveis). */}
        {!revealed && (
          <article className="rounded-[14px] border bg-card p-5 shadow-[var(--shadow-rest)] sm:p-6">
            {/* pills domínio + dificuldade (mesma linguagem do QuestionCard) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">
                {t.common.domain} {current.domainCode} · {lang === "pt" ? current.domainNamePt : current.domainName}
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
                {t.study.difficulty}: {t.study.difficulties[current.difficulty]}
              </span>
            </div>

            <Markdown
              text={current.stem}
              className="mt-4 max-w-[68ch] font-display text-[15px] font-normal leading-[1.55] tracking-[-0.006em] sm:text-base"
            />

            {/* Statement-selection: as alternativas SÃO o enunciado —
                lista estática com letras, sem clique. */}
            {current.frontIncludesOptions && (
              <div className="mt-4 space-y-2" aria-label={t.flashcards.statementsLabel}>
                {ordering.options.map((option, i) => (
                  <div
                    key={i}
                    className="flex min-h-[54px] w-full items-center gap-4 rounded-[10px] border border-border bg-card px-4 py-2.5 text-left"
                  >
                    <span
                      aria-hidden
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] border border-[var(--noos-border-strong)] font-mono text-xs font-medium text-muted-foreground"
                    >
                      {LETTERS[i]}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-[15px] leading-relaxed sm:text-base">{option}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Instrução discreta — apenas na primeira sessão. */}
            {!hintSeen && (
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {current.frontIncludesOptions ? t.flashcards.hintStatements : t.flashcards.hintRecall}{" "}
                <span className="hidden sm:inline">{t.flashcards.keyboardHint}</span>
              </p>
            )}
          </article>
        )}

        {/* VERSO — gabarito destacado entre as alternativas + explicação +
            fonte + ID pública (reuso do QuestionCard em modo feedback,
            sem seleção: só a correta acende). */}
        {revealed && (
          <article className="rounded-[14px] border bg-card p-5 shadow-[var(--shadow-rest)] sm:p-6">
            <QuestionCard
              question={{ ...current, options: ordering.options }}
              selectedIndex={null}
              feedback={{
                correct: true,
                correctIndex: revealed.correctIndex,
                explanationEn: revealed.explanationEn,
                explanationPt: revealed.explanationPt,
                referenceUrl: revealed.referenceUrl,
                referenceTitle: revealed.referenceTitle,
              }}
              showMeta
            />
          </article>
        )}

        {/* Rodapé: Ver resposta (frente) · Julgamento com projeção (verso) */}
        <div className="mt-6 border-t pt-4">
          {!revealed ? (
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={revealing}
              onClick={() => {
                markHintSeen();
                void handleReveal(current, ordering);
              }}
            >
              {revealing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {t.flashcards.reveal}
            </Button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {/* Julgamento binário com a projeção SRS impressa no botão
                    (padrão Anki — o aluno vê o efeito antes de decidir). */}
                <Button variant="outline" size="lg" disabled={grading} onClick={() => void handleGrade(false)}>
                  {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  {t.flashcards.gradeWrong} · {projLabel(revealed.wrongDays)}
                </Button>
                <Button size="lg" disabled={grading} onClick={() => void handleGrade(true)}>
                  <CheckCircle2 className="h-4 w-4" />
                  {t.flashcards.gradeRight} · {projLabel(revealed.rightDays)}
                </Button>
              </div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-right">
                {t.flashcards.keyboardHint}
              </p>
            </div>
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

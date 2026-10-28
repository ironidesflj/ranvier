"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, ExternalLink, Eye, Layers, Loader2, MessageCircle, Play, Target, WifiOff, XCircle } from "lucide-react";
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
import { applyReview, SRS_INITIAL_STATE } from "@/lib/srs";
import { appendEvent, clearQueue, readQueue } from "@/lib/fc-queue";
import { LETTERS } from "@/components/app/question-card";
import { discussionUrl } from "@/lib/axon/deep-links";
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

/** Projeção de carta re-entrante (julgada "Errei" nesta sessão): o estado
 *  pós-lapse é determinístico — reps zeram, ease cai 0.2 — então o próximo
 *  "Acertei" vale 1 dia e "Errei" volta hoje, INDEPENDENTE do estado prévio
 *  da carta. Computado com a mesma matemática pura de srs.ts, importada
 *  também no cliente (zero duplicação — spec v1.10.0 §4). */
const RELAPSE_PROJECTION = (() => {
  const postLapse = applyReview(SRS_INITIAL_STATE, false);
  return {
    wrong: { intervalDays: applyReview(postLapse, false).intervalDays },
    right: { intervalDays: applyReview(postLapse, true).intervalDays },
  };
})();

/**
 * Flashcards com repetição espaçada — SESSÃO V2 (v1.8.0 — spec
 * docs/sdd/spec-v1.8.0-trilhas-flashcards.md §3) → OFFLINE na v1.10.0
 * (spec docs/sdd/spec-v1.10.0-flashcards-offline.md).
 *
 * Divisão de trabalho com os outros modos: Estudar/Exame treinam
 * RECONHECIMENTO (alternativas clicáveis, correção server-side); o
 * flashcard treina EVOCAÇÃO — a frente não mostra alternativas (exceto nas
 * 18 "statement-selection", onde as afirmações SÃO o enunciado), o aluno
 * tenta lembrar, vira o cartão e se julga com honestidade binária:
 *
 *   frente (evocação) → "Ver resposta" → verso (SÓ a resposta + explicação) →
 *   [ Errei · volta hoje ]  [ Acertei · amanhã/em N dias ] → próximo cartão.
 *
 * v1.10.0 — o verso (gabarito + explicações + projeções) viaja no DRAW: virar
 * é leitura LOCAL (um só caminho de código, online ou offline). O julgamento
 * escreve online (/grade) ou acumula na fila local (spec §§3–4) e sincroniza
 * nos gatilhos: rede volta, foco da aba, fim de sessão. O draw continua
 * exigindo rede — a fila de cartas nasce do estado SRS do servidor.
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
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [requeued, setRequeued] = useState<Set<string>>(new Set());
  /* v1.10.0 — estado de rede honesto + fila local de julgamentos (spec §5). */
  const [offlineQueue, setOfflineQueue] = useState(0);
  const [netOffline, setNetOffline] = useState(false);
  const [drawOffline, setDrawOffline] = useState(false);
  const syncingRef = useRef(false);
  const trySyncRef = useRef<() => void>(() => {});

  const draw = useMutation({
    mutationFn: () => api.flashcardsDraw({ certSlug: cert?.slug ?? certSlug, scope, limit: Number(count) }),
    onSuccess: (res) => {
      if (res.cards.length === 0) {
        toast.info(t.flashcards.queueEmpty);
        void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
        return;
      }
      setDrawOffline(false);
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
    onError: (err) => {
      /* Rede ausente (status 0): bloqueio honesto da spec §5 — a fila de
         cartas nasce no servidor. Outros HTTP: erro genérico como hoje. */
      if (err instanceof ApiError && err.status === 0) setDrawOffline(true);
      else toast.error(t.toast.error);
    },
  });

  const current = queue[index] ?? null;
  const ordering = useMemo(
    () => (current ? orderOptions(current, sessionId, current.id) : null),
    [current, sessionId],
  );

  /* v1.10.0 — reveal LOCAL (spec §3): o verso (gabarito + explicações +
     projeções) veio no draw; virar é leitura de memória — um só caminho de
     código, online ou offline, sem chamada. Carta re-entrante usa a projeção
     pós-lapse (o payload do draw reflete o estado no momento do sorteio). */
  function handleReveal(card: FlashcardDrawnCard, ord: OptionOrdering) {
    if (revealed) return;
    const proj = requeued.has(card.id) ? RELAPSE_PROJECTION : card.projection;
    setRevealed({
      correctIndex: ord.toDisplay(card.correctIndex),
      explanationEn: card.explanationEn,
      explanationPt: card.explanationPt,
      referenceUrl: card.referenceUrl,
      referenceTitle: card.referenceTitle,
      wrongDays: proj.wrong.intervalDays,
      rightDays: proj.right.intervalDays,
    });
  }

  /* v1.10.0 — escrita do julgamento (spec §§3–4): online → POST /grade;
     offline (ou fetch falhando) → evento na fila local — o fluxo da sessão é
     IDÊNTICO nos dois mundos (Espaço vira, 1/2 julgam, auto-avança). Erro
     HTTP real (4xx/5xx) continua sendo erro: não avança, não enfileira. */
  async function persistGrade(questionId: string, remembered: boolean): Promise<"done" | "queued" | "failed"> {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      enqueueLocal(questionId, remembered);
      return "queued";
    }
    try {
      await api.flashcardsGrade(questionId, remembered);
      return "done";
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        enqueueLocal(questionId, remembered);
        return "queued";
      }
      return "failed";
    }
  }

  function enqueueLocal(questionId: string, remembered: boolean) {
    const { queue: q, dropped } = appendEvent({ questionId, remembered, occurredAt: new Date().toISOString() });
    setOfflineQueue(q.length);
    setNetOffline(true); // badge honesto: este dispositivo não alcança o servidor
    if (dropped > 0) toast.error(t.flashcards.offline.toastQueueDropped);
  }

  /* Sync da fila (spec §4): um POST; 200 limpa a fila e invalida o resumo.
     Falha = continua na fila — os gatilhos (online, foco, fim de sessão)
     tentam de novo. */
  async function trySync() {
    if (syncingRef.current) return;
    const events = readQueue();
    if (events.length === 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    syncingRef.current = true;
    try {
      const slug = cert?.slug ?? certSlug;
      const res = await api.flashcardsSync(events, slug);
      clearQueue();
      setOfflineQueue(0);
      if (res.summary) queryClient.setQueryData(["flashcards-summary", slug], res.summary);
      void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
      toast.success(f(t.flashcards.offline.toastSynced, { count: res.applied }));
      if (res.skipped > 0) toast.info(f(t.flashcards.offline.toastSkipped, { count: res.skipped }));
    } catch {
      /* sem rede ainda — a fila espera o próximo gatilho */
    } finally {
      syncingRef.current = false;
    }
  }
  trySyncRef.current = trySync;

  /* v1.10.0 — julgamento binário → escrita online OU fila local → auto-avançar.
     "Errei" re-entra na fila 1× (o estado dele já vence AGORA). */
  async function handleGrade(remembered: boolean) {
    if (!current || !revealed || grading) return;
    setGrading(true);
    const willRequeue = !remembered && !requeued.has(current.id);
    const outcome = await persistGrade(current.id, remembered);
    if (outcome !== "failed") {
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
        if (outcome === "queued") trySyncRef.current(); // fim de sessão é gatilho
      } else {
        setIndex(index + 1);
      }
      setRevealed(null);
      window.scrollTo({ top: 0 });
    } else {
      toast.error(t.toast.error);
    }
    setGrading(false);
  }

  function finishSession() {
    setPhase("done");
    void queryClient.invalidateQueries({ queryKey: ["flashcards-summary"] });
    toast.success(t.flashcards.toastFinished);
    trySyncRef.current(); // fim de sessão é gatilho de sync (spec §4)
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
  }, [phase, current, ordering, revealed, grading, index, queue, requeued]);

  /* v1.10.0 — gatilhos de sync (spec §4): a rede volta, o foco da aba, o fim
     da sessão. Estado de rede honesto para os badges (nunca palpite). */
  useEffect(() => {
    function onOnline() {
      setNetOffline(false);
      trySyncRef.current();
    }
    function onOffline() {
      setNetOffline(true);
    }
    function onVisibility() {
      if (document.visibilityState === "visible") trySyncRef.current();
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* Mount: fila de ontem? Conta honesta já no primeiro render + tentativa
     de sync se há rede (subir o app conta como foco). */
  useEffect(() => {
    const queued = readQueue();
    setOfflineQueue(queued.length);
    setNetOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    if (queued.length > 0 && typeof navigator !== "undefined" && navigator.onLine) {
      trySyncRef.current();
    }
  }, []);

  /* v1.10.0 — draw exige rede (a fila de cartas nasce do estado SRS do
     servidor — decisão honesta da spec §1/§5): offline, bloqueia com
     mensagem + retry em vez de queimar a tentativa. */
  function startDraw() {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setDrawOffline(true);
      return;
    }
    draw.mutate();
  }

  /* Bloqueio honesto do draw offline (spec §5): título, explicação e retry. */
  function offlineDrawBlock(onRetry: () => void) {
    return (
      <div className="rounded-[14px] border border-dashed bg-card p-8 text-center">
        <WifiOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
        <h2 className="font-display text-xl font-light tracking-[-0.02em]">{t.flashcards.offline.drawBlockedTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.flashcards.offline.drawBlockedDesc}</p>
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          {t.flashcards.offline.drawBlockedRetry}
        </Button>
      </div>
    );
  }

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
          summaryErr instanceof ApiError && summaryErr.status === 0 ? (
            /* Sem rede no resumo = sem rede no draw — o mesmo bloqueio honesto
               (spec §5), não um QueryError genérico. */
            offlineDrawBlock(() => void refetchSummary())
          ) : (
            <QueryError onRetry={() => void refetchSummary()} isRetrying={false} code={summaryErr instanceof ApiError ? `HTTP ${summaryErr.status}` : undefined} />
          )
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

            <Button size="lg" className="mt-6 w-full sm:w-auto" disabled={draw.isPending} onClick={startDraw}>
              {draw.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {t.flashcards.start}
            </Button>

            {/* v1.10.0 — resumo carregado ANTES de cair a rede: o clique no
                início detecta o offline e explica (spec §5) com retry. */}
            {drawOffline && offlineDrawBlock(() => {
              setDrawOffline(false);
              startDraw();
            })}
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

        {/* VERSO (v1.8.1 — emenda do fundador pós-deploy: "só tem que
            aparecer a resposta do card") — o texto da alternativa correta
            em destaque + explicação + fonte + ID pública. As 4 alternativas
            SAEM do verso: a frente é evocação, re-exibir a lista na viragem
            re-introduzia o formato de reconhecimento que a sessão evita.
            Nas 18 statement-selection a letra ecoa a lista A–D da frente. */}
        {revealed && (
          <article className="rounded-[14px] border bg-card p-5 shadow-[var(--shadow-rest)] sm:p-6">
            {/* pills — mesmo cabeçalho da frente */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">
                {t.common.domain} {current.domainCode} · {lang === "pt" ? current.domainNamePt : current.domainName}
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
                {t.study.difficulty}: {t.study.difficulties[current.difficulty]}
              </span>
            </div>

            {/* RESPOSTA — o gabarito, direto ao ponto */}
            <div
              className="mt-4 flex items-start gap-3 rounded-[10px] border border-[var(--noos-success-line)] bg-[var(--noos-success-soft)] p-4 sm:p-5"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--noos-success)]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--noos-success)]">
                  {t.flashcards.answerLabel}
                </p>
                <div className="mt-1.5 flex items-start gap-3">
                  {current.frontIncludesOptions && (
                    <span
                      aria-hidden
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] border border-[var(--noos-success)] bg-[var(--noos-success)] font-mono text-xs font-medium text-white"
                    >
                      {LETTERS[revealed.correctIndex]}
                    </span>
                  )}
                  <p className="min-w-0 flex-1 break-words font-display text-[15px] font-medium leading-[1.55] sm:text-base">
                    {ordering.options[revealed.correctIndex]}
                  </p>
                </div>
              </div>
            </div>

            {/* Explicação bilíngue — sempre aberta (patch v1.1 §11) */}
            <div className="mt-4 space-y-3 rounded-[10px] border p-4 sm:p-5">
              <div>
                <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {t.study.explanation}
                </p>
                <Markdown
                  text={lang === "pt" ? revealed.explanationPt : revealed.explanationEn}
                  className="max-w-[68ch] text-[15px] leading-relaxed"
                />
              </div>
              {revealed.referenceUrl && (
                <a
                  href={revealed.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-app-ink underline underline-offset-4 hover:opacity-80"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t.study.source}: {revealed.referenceTitle ?? revealed.referenceUrl}
                </a>
              )}
            </div>

            {/* Rodapé: ID pública (mono, citável) + Comunidade */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <span
                className="select-all font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
                title={t.study.publicIdTitle}
              >
                {current.publicId}
              </span>
              <a
                href={discussionUrl(current.publicId, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-app-ink transition-opacity hover:opacity-80"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                {t.footer.community}
                <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
              </a>
            </div>
          </article>
        )}

        {/* Rodapé: Ver resposta (frente) · Julgamento com projeção (verso) */}
        <div className="mt-6 border-t pt-4">
          {!revealed ? (
            /* v1.10.0 — virar é LOCAL e instantâneo: sem chamada, sem spinner. */
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                markHintSeen();
                handleReveal(current, ordering);
              }}
            >
              <Eye className="h-4 w-4" />
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

          {/* v1.10.0 — badge factual de rede (spec §5): offline com fila,
             ou online com fila pendente sincronizando. Números reais, nunca
             palpite sobre a conexão. */}
          {(netOffline || offlineQueue > 0) && (
            <p
              className="mt-4 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {netOffline
                ? f(t.flashcards.offline.badgeOffline, { count: offlineQueue })
                : f(t.flashcards.offline.badgePending, { count: offlineQueue })}
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
        {/* v1.10.0 — linha factual quando a sessão terminou com julgamentos
            na fila (spec §5): o aluno sabe o que ainda falta sincronizar. */}
        {offlineQueue > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">{f(t.flashcards.offline.summaryQueued, { count: offlineQueue })}</p>
        )}
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

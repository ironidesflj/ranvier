"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Flag, Loader2, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api, ApiError } from "@/lib/api-client";
import { orderOptions, type OptionOrdering } from "@/lib/option-order";
import { QuestionCard, type FeedbackState } from "@/components/app/question-card";
import { QueryError } from "@/components/app/query-error";
import type { Mode, PublicQuestion, StartAttemptResponse } from "@/lib/types";

type Phase = "config" | "session" | "summary";

/**
 * Modo Estudo (patch Ranvier v1.0 §8 + v1.1 §10).
 *
 * Sessão: barra de sessão PRESA ao topo (v1.1 §10.1 — feedback nº 4) com
 * Início, certificação e contadores; régua de progresso fina; "QUESTÃO
 * N / TOTAL" em mono à esquerda, domínio e nível à direita; a pergunta em
 * serifa ocupa a tela; rodapé com "Confirmar resposta", "Pular" e atalhos.
 * Após confirmar: reveal com tags textuais, explicação com fio superior e
 * fonte oficial.
 *
 * Alternativas embaralhadas por sessão com semente estável (attemptId) —
 * nota B do patch v1.1 (feedback nº 5): o gabarito viaja por índice
 * CANÔNICO no protocolo; a UI traduz canônico ↔ exibido.
 */
export function StudyView() {
  const { t, f, lang, langReady } = useLang();
  const { navigate, studyDomainCode, studyQuestionIds, studyTrail, certSlug } = useAppStore();
  const queryClient = useQueryClient();

  const { data, isPending, isError, isFetching, refetch, error } = useQuery({
    queryKey: ["catalog", lang],
    queryFn: () => api.catalog(lang),
    enabled: langReady,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  /* Certificação ATIVA (multi-cert — patch v1.1 §9), com fallback para a
     primeira disponível (ex.: storage de versão anterior). */
  const cert = data?.certifications.find((c) => c.slug === certSlug) ?? data?.certifications[0] ?? null;

  const [phase, setPhase] = useState<Phase>("config");
  const [selectedDomains, setSelectedDomains] = useState<number[]>([]);
  const [count, setCount] = useState("10");
  const [session, setSession] = useState<StartAttemptResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, { selected: number; feedback: FeedbackState }>>({});
  const [answering, setAnswering] = useState(false);

  // Pre-select domain when arriving from the cert view; otherwise pre-check
  // ALL domains ("default: all") so the visual state matches the effect
  // (QA 3-a WARN-3: unchecked checkboxes contradicting "default: all").
  useEffect(() => {
    if (!cert) return;
    if (studyDomainCode) {
      setSelectedDomains([studyDomainCode]);
    } else {
      setSelectedDomains((prev) => (prev.length === 0 ? cert.domains.map((d) => d.code) : prev));
    }
  }, [studyDomainCode, cert]);

  const start = useMutation({
    mutationFn: (vars: { mode?: Mode; domainCodes?: number[]; limit?: number; questionIds?: string[] }) =>
      api.startAttempt({
        certSlug: cert?.slug ?? certSlug,
        mode: vars.mode ?? "STUDY",
        domainCodes: vars.domainCodes,
        limit: vars.limit,
        questionIds: vars.questionIds,
      }),
    onSuccess: (res, vars) => {
      setSession(res);
      setIndex(0);
      setAnswers({});
      setPick(null);
      setPhase("session");
      toast.success(
        vars?.mode === "TRAIL"
          ? t.toast.trailStarted
          : studyQuestionIds?.length
            ? t.toast.practiceStarted
            : t.toast.sessionStarted
      );
      window.scrollTo({ top: 0 });
    },
    onError: () => toast.error(t.toast.error),
  });

  // Auto-start practice session for missed questions
  useEffect(() => {
    if (studyQuestionIds?.length && cert && phase === "config" && !start.isPending) {
      start.mutate({ questionIds: studyQuestionIds });
      navigate("study", { questionIds: null });
    }
  }, [studyQuestionIds, cert, phase, start, navigate]);

  // Auto-start TRAIL tranche arriving from the trails view (v1.8.0 — same
  // pattern as the review queue: the study machine runs the whole session).
  useEffect(() => {
    if (studyTrail && cert && phase === "config" && !start.isPending) {
      start.mutate({ mode: "TRAIL", domainCodes: [studyTrail.domainCode], limit: studyTrail.limit });
      navigate("study", { trail: null });
    }
  }, [studyTrail, cert, phase, start, navigate]);

  const submit = useMutation({
    mutationFn: (attemptId: string) => api.submit(attemptId),
    onSuccess: (_res, attemptId) => {
      toast.success(t.toast.sessionFinished);
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["attempts"] });
      /* Trilhas (v1.8.0): o progresso deriva dos AttemptAnswer — invalidar
         para a rota refletir a tranche recém-respondida. */
      void queryClient.invalidateQueries({ queryKey: ["trails"] });
      navigate("results", { attemptId });
    },
    onError: () => toast.error(t.toast.error),
  });

  function toggleDomain(code: number) {
    setSelectedDomains((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleConfirm(question: PublicQuestion, ordering: OptionOrdering, displayPick: number) {
    if (!session || answering) return;
    setAnswering(true);
    /* Índice canônico no protocolo; posição exibida só na UI (nota B). */
    const canonical = ordering.toCanonical(displayPick);
    try {
      const res = await api.answer(session.attemptId, question.id, canonical);
      const feedback: FeedbackState = {
        correct: res.correct === true,
        correctIndex: ordering.toDisplay(res.correctIndex ?? 0),
        explanationEn: res.explanationEn ?? "",
        explanationPt: res.explanationPt ?? "",
        referenceUrl: res.referenceUrl ?? null,
        referenceTitle: res.referenceTitle ?? null,
      };
      setAnswers((prev) => ({ ...prev, [question.id]: { selected: displayPick, feedback } }));
    } catch {
      toast.error(t.toast.error);
    } finally {
      setAnswering(false);
    }
  }

  function goToQuestion(i: number) {
    setIndex(i);
    setPick(null);
    window.scrollTo({ top: 0 });
  }

  const questions = session?.questions ?? [];
  const current = questions[index] ?? null;
  const currentAnswer = current ? answers[current.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.feedback.correct).length;
  const answered = useMemo(() => answeredCount, [answeredCount]);

  // -------------------------------------------------------------------
  // Config phase
  // -------------------------------------------------------------------
  if (phase === "config") {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.study.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.study.subtitle}</p>
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
        ) : (
          <section className="rounded-[14px] border bg-card p-6 shadow-[var(--shadow-rest)]">
            <h2 className="text-base font-medium">{t.study.configTitle}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {cert.shortName} · {cert.totalQuestions} {t.common.questions}
            </p>

            <div className="mt-6 space-y-3">
              <Label className="text-sm font-medium">{t.study.domainsLabel}</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {cert.domains.map((d) => (
                  <label
                    key={d.code}
                    className="flex cursor-pointer items-start gap-3 border p-3 transition-colors hover:border-[var(--noos-border-strong)] has-[button[data-state=checked]]:border-app has-[button[data-state=checked]]:bg-app-soft"
                  >
                    <Checkbox checked={selectedDomains.includes(d.code)} onCheckedChange={() => toggleDomain(d.code)} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-snug">
                        <span className="mr-1.5 font-mono text-xs text-muted-foreground">{d.code}.</span>
                        {lang === "pt" ? d.namePt : d.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                        {d.weightPercent}% · {d.questionCount} {t.common.questions}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {/* Comportamento explícito (pergunta do fundador 2026-10-25:
                  "quando não seleciono nenhum domínio e dou start, ele puxa
                  todos?" — antes sim: vazio = sem filtro = todos. Agora a
                  sessão exige ao menos um domínio, com aviso textual.) */}
              {selectedDomains.length === 0 && (
                <p role="status" className="text-xs leading-relaxed text-muted-foreground">
                  {t.study.domainsNone}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="study-count" className="text-sm font-medium">
                {t.study.countLabel}
              </Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger id="study-count" className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "20", "30"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} {t.common.questions}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="lg"
              className="mt-6 w-full sm:w-auto"
              disabled={start.isPending || selectedDomains.length === 0}
              onClick={() =>
                start.mutate({
                  domainCodes: selectedDomains.length ? selectedDomains : undefined,
                  limit: Number(count),
                })
              }
            >
              {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {t.study.start}
            </Button>
          </section>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Session phase
  // -------------------------------------------------------------------
  if (phase === "session" && session && current) {
    const isLast = index === questions.length - 1;
    const allAnswered = answeredCount === questions.length;
    const percent = Math.round((answeredCount / questions.length) * 100);
    const feedback = currentAnswer?.feedback ?? null;
    /* Ordem embaralhada estável por tentativa (nota B — feedback nº 5). */
    const ordering = orderOptions(current, session.attemptId, current.id);

    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        {/* h1 semântico para leitores de tela (equipe UX 3-b FAIL-6) */}
        <h1 className="sr-only">{f(t.study.questionOf, { current: index + 1, total: questions.length })} — {t.app.name}</h1>

        {/* Barra de sessão presa ao topo (v1.1 §10.1 — feedback nº 4): Início
            (resumo seguro — nada se perde, cada resposta já está no servidor),
            certificação · modo e contadores. Sempre à mão, rolando ou não. */}
        <div className="sticky top-14 z-30 -mx-4 mb-6 border-b bg-card px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (answeredCount > 0 || allAnswered ? setPhase("summary") : navigate("home"))}
                aria-label={t.nav.home}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t.nav.home}</span>
              </Button>
              <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {session.certification.shortName} · {session.mode === "TRAIL" ? t.trails.title : t.study.title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {f(t.study.sessionStats, { correct: correctCount, answered: answeredCount })}
              </p>
              <Button variant="ghost" size="sm" onClick={() => (allAnswered ? submit.mutate(session.attemptId) : setPhase("summary"))}>
                {t.study.finishSession}
              </Button>
            </div>
          </div>
          {/* Régua de progresso fina — filete reto de leitura (v1.1 §6) */}
          <div className="mt-2 h-[3px] w-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`${percent}%`}>
            <div className="h-full bg-app-ink transition-[width] duration-200 ease-out" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {/* Metadados: QUESTÃO N/TOTAL (v1.1 §10.3). Domínio e dificuldade
            migraram para as PILLS PREENCHIDAS no topo da questão
            (QuestionCard showMeta — fundador 2026-10-26), sem duplicar. */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
          <p className="font-mono text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {f(t.study.questionOf, { current: index + 1, total: questions.length })}
          </p>
        </div>

        {/* Questão — direto no papel, sem card */}
        <QuestionCard
          question={{ ...current, options: ordering.options }}
          selectedIndex={feedback ? currentAnswer?.selected ?? null : pick}
          feedback={feedback}
          onSelect={(i) => setPick(i)}
          onConfirm={pick !== null && !feedback ? () => void handleConfirm(current, ordering, pick) : undefined}
          disabled={answering}
          showMeta
        />

        {/* Rodapé da questão: Confirmar / Pular / atalhos */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-3">
            {feedback ? (
              <Button onClick={() => (isLast ? (allAnswered ? submit.mutate(session.attemptId) : setPhase("summary")) : goToQuestion(index + 1))}>
                {isLast ? t.study.finishSession : t.study.next}
                {!isLast && <ArrowRight className="h-4 w-4" />}
              </Button>
            ) : (
              <Button disabled={pick === null || answering} onClick={() => pick !== null && void handleConfirm(current, ordering, pick)}>
                {answering ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {t.study.checkAnswer}
              </Button>
            )}
            {!feedback && (
              <Button variant="ghost" onClick={() => (isLast ? setPhase("summary") : goToQuestion(index + 1))}>
                {t.study.skip}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t.study.shortcuts}</span>
            <Button variant="outline" size="sm" disabled={index === 0} onClick={() => goToQuestion(index - 1)} aria-label={t.common.back}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Summary phase (left with unanswered questions)
  // -------------------------------------------------------------------
  if (phase === "summary" && session) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-center">
        <Target className="mx-auto mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
        <h2 className="font-display text-2xl font-light tracking-[-0.02em]">{t.study.summaryTitle}</h2>
        <p className="mt-2 text-muted-foreground">
          {f(t.study.summaryCorrect, {
            correct: correctCount,
            total: answeredCount,
            percent: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
          })}
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
          {f(t.exam.answeredCount, { answered: answeredCount, total: questions.length })}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {answeredCount < questions.length && (
            <Button variant="outline" onClick={() => setPhase("session")}>
              <ArrowLeft className="h-4 w-4" />
              {t.common.continue}
            </Button>
          )}
          <Button onClick={() => submit.mutate(session.attemptId)} disabled={submit.isPending}>
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            {t.study.finishSession}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 text-center">
      <p className="text-muted-foreground">{t.common.error}</p>
      <Button className="mt-4" variant="outline" onClick={() => setPhase("config")}>
        {t.study.newSession}
      </Button>
    </div>
  );
}

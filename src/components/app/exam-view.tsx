"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Flag, Home, LayoutGrid, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { orderOptions } from "@/lib/option-order";
import { QuestionCard } from "@/components/app/question-card";

function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/**
 * Régua de tempo (patch Ranvier v1.0 §8 + v1.1 §10.2): de ponta a ponta,
 * ticks a cada 2%, majors a cada 10%, dreno da direita para a esquerda.
 * O número do relógio vive na barra de sessão (acima); aqui fica só o
 * dreno decorativo (aria-hidden) — o tempo em texto é anunciado por marcos.
 */
function TimeRuler({ remainingSec, totalSec }: { remainingSec: number; totalSec: number }) {
  const pct = totalSec > 0 ? Math.max(0, Math.min(100, (remainingSec / totalSec) * 100)) : 0;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-2" aria-hidden>
      <div className="relative h-4">
        {Array.from({ length: 51 }, (_, i) => {
          const left = i * 2;
          const major = left % 10 === 0;
          return (
            <span
              key={i}
              className="absolute bottom-0 w-px bg-[var(--noos-border-strong)]"
              style={{ left: `${left}%`, height: major ? 12 : 6, opacity: major ? 1 : 0.6 }}
            />
          );
        })}
        <span className="absolute bottom-0 left-0 right-0 h-px bg-[var(--noos-border-strong)]" />
        {/* dreno: o tempo decorrido cobre os ticks da direita para a esquerda */}
        <div className="absolute inset-y-0 right-0 bg-card" style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

/**
 * Exame (patch Ranvier v1.0 §7/§8 + v1.1 §10) — chrome-less: uma questão
 * por tela. Barra de sessão PRESA ao topo (v1.1 §10.1 — feedback nº 4):
 * Início, certificação · modo, posição 07/45 e relógio — o dreno do tempo
 * (régua) continua visível com a questão rolada. Questão em 720 px com
 * metadados QUESTÃO N/TOTAL e domínio · nível; alternativas com letra mono
 * (ver QuestionCard).
 *
 * Alternativas embaralhadas por sessão com semente estável (attemptId) —
 * nota B do patch v1.1 (feedback nº 5): o protocolo continua gravando
 * índices canônicos; a UI traduz canônico ↔ exibido ao responder, retomar
 * e revisar.
 */
export function ExamView() {
  const { t, f } = useLang();
  const { attemptId, navigate } = useAppStore();
  const queryClient = useQueryClient();

  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => api.getAttempt(attemptId!),
    enabled: Boolean(attemptId),
    refetchOnWindowFocus: false,
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const submittedRef = useRef(false);

  // Hydrate local state from server detail (resume support)
  useEffect(() => {
    if (!detail) return;
    const initial: Record<string, number> = {};
    for (const [qid, sel] of Object.entries(detail.answers)) {
      if (sel !== null) initial[qid] = sel;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate hydration from server data (resume support)
    setAnswers(initial);
    try {
      const stored = window.localStorage.getItem(`ct-flags-${detail.attemptId}`);
      if (stored) setFlags(JSON.parse(stored) as string[]);
    } catch {
      /* ignore */
    }
    // Jump to the first unanswered question
    const qs = detail.questions;
    const firstUnanswered = qs.findIndex((q) => detail.answers[q.id] === null || detail.answers[q.id] === undefined);
    setIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
  }, [detail?.attemptId, detail]);

  // Already completed → go to results
  useEffect(() => {
    if (detail?.status === "COMPLETED") {
      navigate("results", { attemptId: detail.attemptId });
    }
  }, [detail?.status, detail?.attemptId, navigate]);

  const submit = useMutation({
    mutationFn: (id: string) => api.submit(id),
    onSuccess: (_res, id) => {
      submittedRef.current = true;
      toast.success(t.toast.submitted);
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["attempts"] });
      void queryClient.invalidateQueries({ queryKey: ["attempt", id] });
      navigate("results", { attemptId: id });
    },
    onError: () => toast.error(t.toast.error),
  });

  // Timer
  const startedAt = detail?.startedAt;
  const durationMin = detail?.durationMin;
  const deadline = useMemo(() => {
    if (!startedAt || !durationMin) return null;
    return new Date(startedAt).getTime() + durationMin * 60_000;
  }, [startedAt, durationMin]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingSec = deadline ? Math.floor((deadline - now) / 1000) : 0;
  const totalSec = (durationMin ?? 0) * 60;

  /* Marcos de tempo em aria-live polite (guia Noos §06: "marcos, não ruído" —
     o relógio visual atualiza a cada segundo sem anúncio; anunciamos só em
     10 min e 1 min restantes). QA 3-a WARN-2. */
  const [timeAnnouncement, setTimeAnnouncement] = useState("");
  const announcedRef = useRef<{ ten: boolean; one: boolean }>({ ten: false, one: false });
  useEffect(() => {
    if (remainingSec <= 0) return;
    if (remainingSec <= 600 && !announcedRef.current.ten) {
      announcedRef.current.ten = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-shot milestone announcement for screen readers (aria-live polite)
      setTimeAnnouncement(t.exam.timeWarning);
    } else if (remainingSec <= 60 && !announcedRef.current.one) {
      announcedRef.current.one = true;
      setTimeAnnouncement(t.exam.timeWarningMinute);
    }
  }, [remainingSec, t.exam.timeWarning, t.exam.timeWarningMinute]);

  const autoSubmit = useCallback(() => {
    if (!detail || submittedRef.current || submit.isPending) return;
    submittedRef.current = true;
    toast.warning(t.exam.autoSubmitted);
    submit.mutate(detail.attemptId);
  }, [detail, submit, t.exam.autoSubmitted]);

  useEffect(() => {
    if (remainingSec <= 0 && deadline) autoSubmit();
  }, [remainingSec, deadline, autoSubmit]);

  function persistFlags(next: string[]) {
    setFlags(next);
    if (detail) {
      try {
        window.localStorage.setItem(`ct-flags-${detail.attemptId}`, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }

  async function handleSelect(questionId: string, ordering: { toCanonical: (d: number) => number }, displayIndex: number) {
    if (!detail) return;
    const canonical = ordering.toCanonical(displayIndex);
    setAnswers((prev) => ({ ...prev, [questionId]: canonical }));
    try {
      await api.answer(detail.attemptId, questionId, canonical);
    } catch {
      toast.error(t.toast.error);
    }
  }

  if (!attemptId) {
    navigate("home");
    return null;
  }

  if (isLoading || !detail) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Skeleton className="mb-4 h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-muted-foreground">{t.results.notFound}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("home")}>
          {t.common.back}
        </Button>
      </div>
    );
  }

  if (detail.status === "COMPLETED") return null; // redirect effect handles it

  const questions = detail.questions;
  const current = questions[index];
  const answeredCount = Object.keys(answers).length;
  const unanswered = questions.length - answeredCount;
  const lowTime = remainingSec <= 600;
  /* Ordem embaralhada estável por tentativa (nota B — feedback nº 5). */
  const ordering = orderOptions(current, detail.attemptId, current.id);
  const displaySelected = answers[current.id] !== undefined ? ordering.toDisplay(answers[current.id]) : null;

  return (
    <div className="flex flex-1 flex-col">
      {/* Marcos de tempo para leitores de tela (polite) */}
      <p className="sr-only" aria-live="polite">{timeAnnouncement}</p>
      {/* Barra de sessão presa ao topo (v1.1 §10.1 — feedback nº 4): Início
          (com confirmação — o relógio continua correndo), certificação · modo,
          posição N/T e entrega. Relógio na própria barra; o dreno (régua)
          logo abaixo, tudo fixo — nada some ao rolar a questão. */}
      <div className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex h-[52px] max-w-3xl items-center justify-between gap-2 px-4 md:h-14">
          <div className="flex min-w-0 items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={t.nav.home}>
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.nav.home}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.exam.leaveTitle}</AlertDialogTitle>
                  <AlertDialogDescription>{t.exam.leaveDesc}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.continue}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => navigate("home")}>{t.exam.leaveCta}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="hidden truncate font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:block">
              {detail.certShortName} · {t.exam.title}
            </p>
          </div>

          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] tabular-nums text-muted-foreground">
            {f(t.study.questionOf, { current: index + 1, total: questions.length })}
          </p>

          <div className="flex items-center gap-2">
            {/* Relógio na barra (v1.1 §10.1): mono tabular, vermelho só no
                aviso — nunca piscando. */}
            <p
              role="timer"
              aria-live="off"
              className={cn("font-mono text-sm font-medium tabular-nums tracking-[-0.01em]", lowTime ? "text-[var(--noos-danger)]" : "text-foreground")}
            >
              {formatClock(remainingSec)}
            </p>

            {/* Navegador de questões (mobile) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden" aria-label={t.exam.palette}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-4" aria-describedby={undefined}>
                <SheetTitle className="sr-only">{t.exam.palette}</SheetTitle>
                <PaletteGrid
                  questions={questions}
                  answers={answers}
                  flags={flags}
                  index={index}
                  onSelect={(i) => {
                    setIndex(i);
                    window.scrollTo({ top: 0 });
                  }}
                />
              </SheetContent>
            </Sheet>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={submit.isPending} aria-label={t.exam.submit}>
                  {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="hidden sm:inline">{t.exam.submit}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.exam.submitConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {f(t.exam.submitConfirmDesc, { answered: answeredCount, total: questions.length, unanswered })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => submit.mutate(detail.attemptId)}>{t.common.confirm}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Dreno do tempo — o tempo é a única coisa que se move */}
        <TimeRuler remainingSec={remainingSec} totalSec={totalSec} />
        {lowTime && <p className="py-1 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--noos-danger)]">{t.exam.timeWarning}</p>}
      </div>

      {/* Corpo: questão em 720 px + navegador no desktop */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-8 px-4 py-6">
        <div className="min-w-0 flex-1">
          {/* h1 semântico para leitores de tela (equipe UX 3-b FAIL-6) */}
          <h1 className="sr-only">{f(t.study.questionOf, { current: index + 1, total: questions.length })} — {t.app.name}</h1>
          {/* Metadados: QUESTÃO N/TOTAL à esquerda; domínio e nível à direita */}
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
            <p className="font-mono text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {f(t.study.questionOf, { current: index + 1, total: questions.length })}
            </p>
            <p className="text-xs text-muted-foreground">
              {current.domainName} · {t.study.difficulties[current.difficulty]}
            </p>
          </div>

          <QuestionCard
            question={{ ...current, options: ordering.options }}
            selectedIndex={displaySelected}
            onSelect={(i) => void handleSelect(current.id, ordering, i)}
          />

          {/* Rodapé da questão: navegação + marcar para revisão */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4">
            <Button variant="outline" size="sm" disabled={index === 0} aria-label={t.common.back} onClick={() => {
              setIndex((i) => Math.max(0, i - 1));
              window.scrollTo({ top: 0 });
            }}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t.common.back}</span>
            </Button>
            <Button
              variant={flags.includes(current.id) ? "secondary" : "ghost"}
              size="sm"
              onClick={() =>
                persistFlags(flags.includes(current.id) ? flags.filter((id) => id !== current.id) : [...flags, current.id])
              }
              aria-pressed={flags.includes(current.id)}
            >
              <Flag className={cn("h-4 w-4", flags.includes(current.id) && "fill-[var(--noos-signal)] text-[var(--noos-signal)]")} />
              <span className="hidden sm:inline">{flags.includes(current.id) ? t.exam.unflag : t.exam.flag}</span>
            </Button>
            {index < questions.length - 1 ? (
              <Button variant="outline" size="sm" onClick={() => {
                setIndex((i) => i + 1);
                window.scrollTo({ top: 0 });
              }}>
                {t.common.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm">
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.exam.submit}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.exam.submitConfirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {f(t.exam.submitConfirmDesc, { answered: answeredCount, total: questions.length, unanswered })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => submit.mutate(detail.attemptId)}>{t.common.confirm}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Navegador de questões (desktop) */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-40">
            <PaletteGrid
              questions={questions}
              answers={answers}
              flags={flags}
              index={index}
              onSelect={(i) => {
                setIndex(i);
                window.scrollTo({ top: 0 });
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function PaletteGrid({
  questions,
  answers,
  flags,
  index,
  onSelect,
}: {
  questions: { id: string }[];
  answers: Record<string, number>;
  flags: string[];
  index: number;
  onSelect: (i: number) => void;
}) {
  const { t } = useLang();
  return (
    <div>
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{t.exam.palette}</p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7 lg:grid-cols-5">
        {questions.map((q, i) => {
          const answered = answers[q.id] !== undefined;
          const flagged = flags.includes(q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Q${i + 1}${answered ? ` — ${t.exam.paletteLegend.answered}` : ` — ${t.exam.paletteLegend.unanswered}`}${flagged ? ` — ${t.exam.paletteLegend.flagged}` : ""}`}
              aria-current={i === index}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center border font-mono text-xs font-medium tabular-nums transition-colors",
                i === index && "outline-2 outline-offset-2 outline-[var(--app-ink)]",
                answered ? "border-app bg-app text-white" : "border-border bg-card text-muted-foreground hover:border-[var(--noos-border-strong)]"
              )}
            >
              {i + 1}
              {flagged && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--noos-signal)]" aria-hidden />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 border border-app bg-app" aria-hidden /> {t.exam.paletteLegend.answered}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 border border-border bg-card" aria-hidden /> {t.exam.paletteLegend.unanswered}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--noos-signal)]" aria-hidden /> {t.exam.paletteLegend.flagged}
        </p>
      </div>
    </div>
  );
}

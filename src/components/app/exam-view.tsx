"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Flag,
  LayoutGrid,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { QuestionCard } from "@/components/app/question-card";

function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

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

  const remainingSec = deadline ? Math.floor((deadline - now) / 1000) : null;

  const autoSubmit = useCallback(() => {
    if (!detail || submittedRef.current || submit.isPending) return;
    submittedRef.current = true;
    toast.warning(t.exam.autoSubmitted);
    submit.mutate(detail.attemptId);
  }, [detail, submit, t.exam.autoSubmitted]);

  useEffect(() => {
    if (remainingSec !== null && remainingSec <= 0) autoSubmit();
  }, [remainingSec, autoSubmit]);

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

  async function handleSelect(questionId: string, selectedIndex: number) {
    if (!detail) return;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
    try {
      await api.answer(detail.attemptId, questionId, selectedIndex);
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
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const lowTime = remainingSec !== null && remainingSec <= 600;

  return (
    <div className="flex flex-1 flex-col">
      {/* Exam toolbar */}
      <div className="sticky top-14 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t.common.back}</span>
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

          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{f(t.exam.answeredCount, { answered: answeredCount, total: questions.length })}</span>
            <span className="sm:hidden">
              {answeredCount}/{questions.length}
            </span>
            <div className="hidden w-24 sm:block">
              <Progress value={progressPercent} className="h-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums",
                lowTime ? "animate-pulse bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
              )}
              role="timer"
              aria-live="off"
            >
              <AlarmClock className="h-4 w-4" aria-hidden />
              {formatClock(remainingSec ?? 0)}
            </span>

            {/* Mobile palette */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
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
                <Button size="sm" disabled={submit.isPending}>
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
        {lowTime && (
          <p className="bg-destructive/10 py-1 text-center text-xs font-medium text-destructive">{t.exam.timeWarning}</p>
        )}
      </div>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-sm text-muted-foreground">
            {f(t.study.questionOf, { current: index + 1, total: questions.length })}
          </p>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <QuestionCard
                question={current}
                selectedIndex={answers[current.id] ?? null}
                onSelect={(i) => void handleSelect(current.id, i)}
              />
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Button>
            <Button
              variant={flags.includes(current.id) ? "secondary" : "ghost"}
              size="sm"
              onClick={() =>
                persistFlags(flags.includes(current.id) ? flags.filter((id) => id !== current.id) : [...flags, current.id])
              }
              aria-pressed={flags.includes(current.id)}
            >
              <Flag className={cn("h-4 w-4", flags.includes(current.id) && "fill-amber-400 text-amber-500")} />
              <span className="hidden sm:inline">
                {flags.includes(current.id) ? t.exam.unflag : t.exam.flag}
              </span>
            </Button>
            {index < questions.length - 1 ? (
              <Button onClick={() => setIndex((i) => i + 1)}>
                {t.common.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4" />
                    {t.exam.submit}
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

        {/* Desktop palette */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-32">
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.exam.palette}</p>
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
                "relative flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                i === index && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                answered ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50"
              )}
            >
              {i + 1}
              {flagged && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden /> {t.exam.paletteLegend.answered}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-card" aria-hidden /> {t.exam.paletteLegend.unanswered}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden /> {t.exam.paletteLegend.flagged}
        </p>
      </div>
    </div>
  );
}

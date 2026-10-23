"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Flag, Loader2, Play, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { QuestionCard, type FeedbackState } from "@/components/app/question-card";
import type { PublicQuestion, StartAttemptResponse } from "@/lib/types";

type Phase = "config" | "session" | "summary";

export function StudyView() {
  const { t, f, lang } = useLang();
  const { navigate, studyDomainCode, studyQuestionIds } = useAppStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["catalog", lang], queryFn: () => api.catalog(lang) });
  const cert = data?.certifications[0] ?? null;

  const [phase, setPhase] = useState<Phase>("config");
  const [selectedDomains, setSelectedDomains] = useState<number[]>([]);
  const [count, setCount] = useState("10");
  const [session, setSession] = useState<StartAttemptResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selected: number; feedback: FeedbackState }>>({});
  const [answering, setAnswering] = useState(false);

  // Pre-select domain when arriving from the cert view
  useEffect(() => {
    if (studyDomainCode && cert) {
      setSelectedDomains([studyDomainCode]);
    }
  }, [studyDomainCode, cert]);

  const start = useMutation({
    mutationFn: (vars: { domainCodes?: number[]; limit?: number; questionIds?: string[] }) =>
      api.startAttempt({
        certSlug: cert?.slug ?? "databricks-data-engineer-associate",
        mode: "STUDY",
        ...vars,
      }),
    onSuccess: (res) => {
      setSession(res);
      setIndex(0);
      setAnswers({});
      setPhase("session");
      toast.success(studyQuestionIds?.length ? t.toast.practiceStarted : t.toast.sessionStarted);
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

  const submit = useMutation({
    mutationFn: (attemptId: string) => api.submit(attemptId),
    onSuccess: (_res, attemptId) => {
      toast.success(t.toast.sessionFinished);
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["attempts"] });
      navigate("results", { attemptId });
    },
    onError: () => toast.error(t.toast.error),
  });

  function toggleDomain(code: number) {
    setSelectedDomains((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleAnswer(question: PublicQuestion, selectedIndex: number) {
    if (!session || answering) return;
    setAnswering(true);
    try {
      const res = await api.answer(session.attemptId, question.id, selectedIndex);
      if (res.correctIndex !== undefined) {
        const feedback: FeedbackState = {
          correct: Boolean(res.correct),
          correctIndex: res.correctIndex,
          explanationEn: res.explanationEn ?? "",
          explanationPt: res.explanationPt ?? "",
          referenceUrl: res.referenceUrl ?? null,
          referenceTitle: res.referenceTitle ?? null,
        };
        setAnswers((prev) => ({ ...prev, [question.id]: { selected: selectedIndex, feedback } }));
      }
    } catch {
      toast.error(t.toast.error);
    } finally {
      setAnswering(false);
    }
  }

  const questions = session?.questions ?? [];
  const current = questions[index] ?? null;
  const currentAnswer = current ? answers[current.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.feedback.correct).length;

  // -------------------------------------------------------------------
  // Config phase
  // -------------------------------------------------------------------
  if (phase === "config") {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t.study.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.study.subtitle}</p>
        </div>

        {isLoading || !cert ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.study.configTitle}</CardTitle>
              <CardDescription>
                {cert.shortName} · {cert.totalQuestions} {t.common.questions}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t.study.domainsLabel}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cert.domains.map((d) => (
                    <label
                      key={d.code}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:border-primary/50 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                    >
                      <Checkbox checked={selectedDomains.includes(d.code)} onCheckedChange={() => toggleDomain(d.code)} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-snug">
                          {d.code}. {lang === "pt" ? d.namePt : d.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {d.weightPercent}% · {d.questionCount} {t.common.questions}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
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
                className="w-full sm:w-auto"
                disabled={start.isPending}
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
            </CardContent>
          </Card>
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

    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        {/* Session header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t.study.sessionTitle}</p>
            <p className="text-sm text-muted-foreground">
              {f(t.study.questionOf, { current: index + 1, total: questions.length })}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {correctCount}/{answeredCount}
            </span>
            <Button variant="ghost" size="sm" onClick={() => (allAnswered ? submit.mutate(session.attemptId) : setPhase("summary"))}>
              {t.study.finishSession}
            </Button>
          </div>
        </div>
        <Progress value={percent} className="mb-6 h-1.5" aria-label={`${percent}%`} />

        {/* Question */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <QuestionCard
              question={current}
              selectedIndex={currentAnswer?.selected ?? null}
              feedback={currentAnswer?.feedback ?? null}
              onSelect={(i) => void handleAnswer(current, i)}
              disabled={answering}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </Button>
          {isLast ? (
            <Button
              onClick={() => (allAnswered ? submit.mutate(session.attemptId) : setPhase("summary"))}
              disabled={submit.isPending}
            >
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              {t.study.finishSession}
            </Button>
          ) : (
            <Button onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}>
              {t.study.next}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
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
        <Target className="mx-auto mb-4 h-12 w-12 text-primary" aria-hidden />
        <h2 className="text-xl font-bold">{t.study.summaryTitle}</h2>
        <p className="mt-2 text-muted-foreground">
          {f(t.study.summaryCorrect, {
            correct: correctCount,
            total: answeredCount,
            percent: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
          })}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {f(t.exam.answeredCount, { answered: answeredCount, total: questions.length })}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {answeredCount < questions.length && (
            <Button variant="outline" onClick={() => setPhase("session")}>
              <BookOpenCheck className="h-4 w-4" />
              {t.common.continue}
            </Button>
          )}
          <Button onClick={() => submit.mutate(session.attemptId)} disabled={submit.isPending}>
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t.study.finishSession}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center text-muted-foreground">
      <Button variant="outline" onClick={() => setPhase("config")}>
        <RotateCcw className="h-4 w-4" />
        {t.study.newSession}
      </Button>
    </div>
  );
}

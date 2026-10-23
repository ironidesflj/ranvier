"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Filter,
  Home,
  Loader2,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { QuestionCard } from "@/components/app/question-card";
import { Markdown } from "@/components/app/markdown";
import { AdSlot } from "@/components/app/ad-slot";
import type { ReviewQuestion } from "@/lib/types";

export function ResultsView() {
  const { t, f, lang } = useLang();
  const { attemptId, navigate } = useAppStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "wrong">("all");

  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => api.getAttempt(attemptId!),
    enabled: Boolean(attemptId),
  });

  // Auto-submit study attempts opened straight in results (defensive)
  const submit = useMutation({
    mutationFn: (id: string) => api.submit(id),
    onSuccess: (_res, id) => {
      void queryClient.invalidateQueries({ queryKey: ["attempt", id] });
    },
    onError: () => toast.error(t.toast.error),
  });

  useEffect(() => {
    if (detail?.status === "IN_PROGRESS" && !submit.isPending) {
      submit.mutate(detail.attemptId);
    }
  }, [detail?.status, detail?.attemptId, submit]);

  const questions = (detail?.questions ?? []) as ReviewQuestion[];
  const result = detail?.result ?? null;

  const wrongQuestions = useMemo(() => questions.filter((q) => !q.correct), [questions]);
  const visible = filter === "wrong" ? wrongQuestions : questions;

  const retryExam = useMutation({
    mutationFn: () => api.startAttempt({ certSlug: "databricks-data-engineer-associate", mode: "EXAM" }),
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

  if (isLoading || !detail || !result) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Skeleton className="mb-6 h-32 w-full" />
        <Skeleton className="h-64 w-full" />
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

  const isExam = detail.mode === "EXAM";
  const durationMin = Math.floor(result.durationSec / 60);
  const durationSec = result.durationSec % 60;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      {/* Result banner */}
      <Card
        className={cn(
          "border-2",
          result.passed ? "border-emerald-500/60" : "border-destructive/60"
        )}
      >
        <CardContent className="p-6 text-center">
          <div
            className={cn(
              "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full",
              result.passed ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"
            )}
            aria-hidden
          >
            {result.passed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {isExam ? (result.passed ? t.results.passed : t.results.failed) : t.results.studyTitle}
          </h1>
          <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight">
            {Math.round(result.percent)}
            <span className="text-xl text-muted-foreground">%</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {f(t.results.scoreValue, { score: result.score, total: result.total })}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {t.results.timeUsed}: {durationMin}m {durationSec}s
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {f(t.results.passingNote, { passing: result.passingScore })}
            </span>
          </div>
          <Progress value={result.percent} className="mt-4 h-2" aria-label={`${result.percent}%`} />
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {isExam && (
          <Button onClick={() => retryExam.mutate()} disabled={retryExam.isPending}>
            {retryExam.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            {t.results.retryExam}
          </Button>
        )}
        {wrongQuestions.length > 0 && (
          <Button
            variant="outline"
            onClick={() => navigate("study", { questionIds: wrongQuestions.map((q) => q.id) })}
          >
            <BookOpenCheck className="h-4 w-4" />
            {t.results.practiceWrong} ({wrongQuestions.length})
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate("home")}>
          <Home className="h-4 w-4" />
          {t.results.backHome}
        </Button>
      </div>

      {/* By domain */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t.results.byDomain}</h2>
        <Card>
          <CardContent className="space-y-3 p-4 sm:p-5">
            {result.byDomain.map((d) => {
              const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              return (
                <div key={d.code}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <p className="min-w-0 font-medium">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[11px] font-bold text-secondary-foreground">
                        {d.code}
                      </span>
                      {lang === "pt" ? d.namePt : d.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {d.correct}/{d.total}
                      </span>
                    </p>
                    <span className={cn("shrink-0 font-bold tabular-nums", pct >= 70 ? "text-emerald-500" : "text-destructive")}>
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* Review */}
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t.results.reviewTitle}</h2>
          {wrongQuestions.length > 0 && (
            <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "wrong")}>
              <TabsList>
                <TabsTrigger value="all">
                  <Filter className="mr-1 h-3.5 w-3.5" />
                  {t.results.reviewFilterAll} ({questions.length})
                </TabsTrigger>
                <TabsTrigger value="wrong">
                  {t.results.reviewFilterWrong} ({wrongQuestions.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="space-y-4">
          {visible.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4 sm:p-6">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white",
                      q.correct ? "bg-emerald-500" : "bg-destructive"
                    )}
                    aria-hidden
                  >
                    {q.correct ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  </span>
                  {f(t.results.question, { n: questions.indexOf(q) + 1 })}
                  {q.selectedIndex === null && (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{t.results.noAnswer}</span>
                  )}
                </p>
                <QuestionCard
                  question={q}
                  selectedIndex={q.selectedIndex}
                  review={{ correctIndex: q.correctIndex, correct: q.correct }}
                />
                {/* Review-mode explanation (QuestionCard only shows feedback panel in study mode) */}
                <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.results.explanation}
                  </p>
                  <Markdown text={lang === "pt" ? q.explanationPt : q.explanationEn} className="text-sm" />
                  {q.referenceUrl && (
                    <a
                      href={q.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80"
                    >
                      {t.results.source}: {q.referenceTitle ?? q.referenceUrl}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <AdSlot placement="results" className="mt-8" />

      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => navigate("progress")}>
          <ArrowLeft className="h-4 w-4" />
          {t.nav.progress}
        </Button>
      </div>
    </div>
  );
}

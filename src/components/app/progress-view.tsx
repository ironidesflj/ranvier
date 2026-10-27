"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  History,
  Loader2,
  LogIn,
  Play,
  Radar as RadarIcon,
  Target,
  TrendingUp,
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api, ApiError } from "@/lib/api-client";
import { useState } from "react";
import { AuthModal } from "@/components/app/auth-modal";
import { QueryError } from "@/components/app/query-error";

export function ProgressView() {
  const { t, f, lang } = useLang();
  const { navigate } = useAppStore();
  const [authOpen, setAuthOpen] = useState(false);

  const { data: progress, isLoading: progressLoading, isError: progressError, isFetching: progressFetching, refetch: refetchProgress, error: progressErr } = useQuery({
    queryKey: ["progress"],
    queryFn: api.progress,
    retry: 1,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const { data: attemptsData, isLoading: attemptsLoading } = useQuery({
    queryKey: ["attempts"],
    queryFn: api.listAttempts,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const user = me?.user ?? null;

  if (progressLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72 w-full" />
      </div>
    );
  }

  if (progressError) {
    return (
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.progress.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.progress.subtitle}</p>
        </div>
        <QueryError
          onRetry={() => void refetchProgress()}
          isRetrying={progressFetching}
          code={progressErr instanceof ApiError ? `HTTP ${progressErr.status}` : undefined}
        />
      </div>
    );
  }

  const totals = progress?.totals;
  const byDomain = progress?.byDomain ?? [];
  const attempts = attemptsData?.attempts ?? [];
  const hasData = (totals?.totalAnswered ?? 0) > 0;
  const examsCompleted = totals?.examsCompleted ?? 0;

  const radarData = byDomain.map((d) => ({
    domain: lang === "pt" ? `S${d.code}` : `S${d.code}`,
    accuracy: d.answered > 0 ? Math.round(d.accuracy) : 0,
    fullName: lang === "pt" ? d.namePt : d.name,
  }));

  const statCards = [
    { icon: CheckCircle2, label: t.progress.statCards.answered, value: String(totals?.totalAnswered ?? 0) },
    { icon: Target, label: t.progress.statCards.accuracy, value: `${totals?.accuracy ?? 0}%` },
    { icon: Award, label: examsCompleted === 1 ? t.progress.statCards.exam : t.progress.statCards.exams, value: String(examsCompleted) },
    { icon: TrendingUp, label: t.progress.statCards.best, value: totals?.bestExamPercent != null ? `${Math.round(totals.bestExamPercent)}%` : "—" },
    { icon: BookOpenCheck, label: t.progress.statCards.sessions, value: String(totals?.studySessions ?? 0) },
    { icon: History, label: t.progress.statCards.review, value: String(totals?.reviewQueueCount ?? 0) },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.progress.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.progress.subtitle}</p>
        </div>
      </div>

      {/* Anonymous note */}
      {!user && (
        <Card className="mb-6 border-dashed bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{t.progress.anonymousNote}</p>
            <Button size="sm" onClick={() => setAuthOpen(true)}>
              <LogIn className="h-4 w-4" />
              {t.progress.createAccount}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">{t.progress.statsTitle}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <card.icon className="mb-1.5 h-4 w-4 text-primary" aria-hidden />
                <p className="text-xl font-bold tabular-nums tracking-tight">{card.value}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Domain radar */}
      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">{t.progress.domainsTitle}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{t.progress.domainsHint}</p>
        {hasData && byDomain.length > 0 ? (
          <Card>
            <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} angle={90} />
                    <Radar name={t.common.accuracy} dataKey="accuracy" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 content-center">
                {byDomain.map((d) => (
                  <div key={d.code}>
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                      <p className="min-w-0 font-medium">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[11px] font-bold text-secondary-foreground">
                          {d.code}
                        </span>
                        {lang === "pt" ? d.namePt : d.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {d.correct}/{d.answered}
                        </span>
                      </p>
                      <span className={cn("shrink-0 font-bold tabular-nums", d.accuracy >= 70 ? "text-[var(--noos-success)]" : d.accuracy > 0 ? "text-[var(--noos-signal)]" : "text-muted-foreground")}>
                        {d.answered > 0 ? `${Math.round(d.accuracy)}%` : "—"}
                      </span>
                    </div>
                    <Progress value={d.answered > 0 ? d.accuracy : 0} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <RadarIcon className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">{t.progress.notEnoughData}</p>
              <Button size="sm" onClick={() => navigate("study")}>
                <Play className="h-4 w-4" />
                {t.progress.historyEmptyCta}
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Review queue */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              {t.progress.reviewQueueTitle}
            </CardTitle>
            <CardDescription>
              {f(t.progress.reviewQueueDesc, { count: totals?.reviewQueueCount ?? 0 })}
            </CardDescription>
          </CardHeader>
          {(totals?.reviewQueueCount ?? 0) > 0 && progress && progress.reviewQuestionIds.length > 0 && (
            <CardContent>
              <Button
                variant="secondary"
                onClick={() => navigate("study", { questionIds: progress.reviewQuestionIds })}
              >
                <Play className="h-4 w-4" />
                {t.progress.practiceCta}
              </Button>
            </CardContent>
          )}
        </Card>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t.progress.historyTitle}</h2>
        {attemptsLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : attempts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-muted-foreground">{t.progress.historyEmpty}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate("cert")}>
                  <Award className="h-4 w-4" />
                  {t.nav.exam}
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate("study")}>
                  <BookOpenCheck className="h-4 w-4" />
                  {t.nav.study}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead>{t.progress.mode.STUDY}/{t.progress.mode.EXAM}</TableHead>
                      <TableHead>{t.results.score}</TableHead>
                      <TableHead>{lang === "pt" ? "Data" : "Date"}</TableHead>
                      <TableHead className="text-right">—</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Badge variant={a.mode === "EXAM" ? "default" : "secondary"} className="text-[11px]">
                            {t.progress.mode[a.mode]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {a.status === "COMPLETED" && a.score != null
                            ? `${a.score}/${a.total} · ${Math.round(a.percent ?? 0)}%${a.passed ? " ✓" : ""}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(a.startedAt).toLocaleString(lang === "pt" ? "pt-BR" : "en-US", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {a.status === "COMPLETED" || a.mode === "STUDY" ? (
                            <Button variant="ghost" size="sm" onClick={() => navigate("results", { attemptId: a.id })}>
                              {a.status === "COMPLETED" ? t.progress.review : t.progress.status.COMPLETED}
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => navigate("exam", { attemptId: a.id })}>
                              <Play className="h-3.5 w-3.5" />
                              {t.progress.resume}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

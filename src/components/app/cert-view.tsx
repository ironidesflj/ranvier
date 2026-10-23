"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  BookOpenCheck,
  Clock,
  Code2,
  DollarSign,
  ExternalLink,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  Play,
  RefreshCw,
  Target,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { QueryError } from "@/components/app/query-error";
import { EXAM_DISTRIBUTION } from "@/data/certifications";

export function CertView() {
  const { t, lang } = useLang();
  const { navigate } = useAppStore();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["catalog", lang],
    queryFn: () => api.catalog(lang),
    retry: 1,
  });
  const cert = data?.certifications[0] ?? null;

  const startExam = useMutation({
    mutationFn: () => api.startAttempt({ certSlug: cert!.slug, mode: "EXAM" }),
    onSuccess: (res) => {
      toast.success(t.toast.started);
      navigate("exam", { attemptId: res.attemptId });
    },
    onError: () => toast.error(t.toast.error),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-10">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <QueryError onRetry={() => void refetch()} isRetrying={isFetching} />;
  }

  if (!cert) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        <p>{t.common.error}</p>
      </div>
    );
  }

  const facts = [
    { icon: BadgeCheck, label: t.home.facts.questions, value: String(cert.questionCount) },
    { icon: Clock, label: t.home.facts.duration, value: `${cert.durationMin} ${t.common.minutes}` },
    { icon: Target, label: t.home.facts.passing, value: `${cert.passingScore}%` },
    { icon: DollarSign, label: t.home.facts.fee, value: cert.fee },
    { icon: Languages, label: t.cert.languages, value: cert.languages },
    { icon: RefreshCw, label: t.cert.validity, value: t.cert.validityValue },
    { icon: Timer, label: t.cert.delivery, value: cert.delivery },
    { icon: BadgeCheck, label: t.cert.unscored, value: t.cert.unscoredValue },
  ];

  const officialLinks = [
    { icon: ExternalLink, label: t.cert.officialPage, href: cert.officialUrl },
    { icon: FileText, label: t.cert.officialGuide, href: cert.guideUrl },
    { icon: GraduationCap, label: t.cert.officialTraining, href: cert.trainingUrl },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{cert.vendor}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{cert.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{cert.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.cert.version}: <span className="font-medium text-foreground">{cert.versionLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:min-w-56">
          <Button size="lg" onClick={() => startExam.mutate()} disabled={startExam.isPending}>
            {startExam.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {t.cert.startExam}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("study")}>
            <BookOpenCheck className="h-4 w-4" />
            {t.nav.study}
          </Button>
        </div>
      </div>

      {/* Exam facts */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">{t.cert.examFacts}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <Card key={fact.label}>
              <CardContent className="p-4">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <fact.icon className="h-3.5 w-3.5" aria-hidden />
                  {fact.label}
                </p>
                <p className="text-sm font-semibold leading-snug">{fact.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex items-start gap-3 p-4">
              <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p className="text-xs leading-relaxed text-muted-foreground">{cert.codeNote}</p>
            </CardContent>
          </Card>
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex items-start gap-3 p-4">
              <Languages className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t.cert.questionsAlwaysEn} {t.cert.examLanguagesNote}
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t.home.passingNote}</p>
      </section>

      {/* Bank coverage */}
      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold">{t.cert.bankTitle}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{t.cert.bankSubtitle}</p>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">{t.cert.bankColumns.domain}</TableHead>
                  <TableHead>{t.cert.bankColumns.weight}</TableHead>
                  <TableHead>{t.cert.bankColumns.exam}</TableHead>
                  <TableHead>{t.cert.bankColumns.bank}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cert.domains.map((d) => (
                  <TableRow key={d.code}>
                    <TableCell>
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[11px] font-bold text-secondary-foreground">
                        {d.code}
                      </span>
                      <span className="font-medium">{lang === "pt" ? d.namePt : d.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-primary" style={{ width: `${Math.max(d.weightPercent * 3.5, 6)}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{d.weightPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{EXAM_DISTRIBUTION[d.code] ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{d.questionCount}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>{t.common.of} {cert.domains.length} {t.common.domain.toLowerCase()}</TableCell>
                  <TableCell>100%</TableCell>
                  <TableCell>{cert.questionCount}</TableCell>
                  <TableCell>{cert.totalQuestions}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Official links */}
      <section className="mb-4">
        <h2 className="mb-3 text-lg font-semibold">{t.cert.officialLinks}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {officialLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <link.icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm font-medium leading-snug group-hover:text-primary">{link.label}</p>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

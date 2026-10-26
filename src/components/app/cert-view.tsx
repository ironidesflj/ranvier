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

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api, ApiError } from "@/lib/api-client";
import { QueryError } from "@/components/app/query-error";
import { EXAM_DISTRIBUTION } from "@/data/certifications";

export function CertView() {
  const { t, lang } = useLang();
  const { navigate, certSlug } = useAppStore();
  const { data, isLoading, isError, isFetching, refetch, error } = useQuery({
    queryKey: ["catalog", lang],
    queryFn: () => api.catalog(lang),
    retry: 1,
  });
  /* Certificação ATIVA (multi-cert — patch v1.1 §9). */
  const cert = data?.certifications.find((c) => c.slug === certSlug) ?? data?.certifications[0] ?? null;

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
    return <QueryError onRetry={() => void refetch()} isRetrying={isFetching} code={error instanceof ApiError ? `HTTP ${error.status}` : undefined} />;
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
      <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{cert.vendor}</p>
          <h1 className="font-display text-3xl font-light leading-tight tracking-[-0.03em] sm:text-4xl">{cert.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{cert.description}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
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

      {/* Exam facts — hairlines, valores tabulares */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-2xl font-light tracking-[-0.02em]">{t.cert.examFacts}</h2>
        <div className="grid gap-px border sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-card p-4">
              <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {fact.label}
              </p>
              <p className="text-sm font-semibold leading-snug">{fact.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-px border sm:grid-cols-2">
          <div className="flex items-start gap-3 bg-card p-4">
            <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-app-ink" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">{cert.codeNote}</p>
          </div>
          <div className="flex items-start gap-3 bg-card p-4">
            <Languages className="mt-0.5 h-4 w-4 shrink-0 text-app-ink" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t.cert.questionsAlwaysEn} {t.cert.examLanguagesNote}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t.home.passingNote}</p>
      </section>

      {/* Bank coverage */}
      <section className="mb-8">
        <h2 className="mb-1 font-display text-2xl font-light tracking-[-0.02em]">{t.cert.bankTitle}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{t.cert.bankSubtitle}</p>
        <div className="border">
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
                    <span className="mr-2 font-mono text-xs text-muted-foreground">{d.code}</span>
                    <span className="font-medium">{lang === "pt" ? d.namePt : d.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-[3px] w-16 bg-surface-2">
                        <div className="h-full bg-app-ink" style={{ width: `${Math.max(d.weightPercent * 3.5, 6)}%` }} />
                      </div>
                      <span className="font-mono text-sm font-medium tabular-nums">{d.weightPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">{EXAM_DISTRIBUTION[d.code] ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm tabular-nums text-muted-foreground">{d.questionCount}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>{t.common.of} {cert.domains.length} {t.common.domain.toLowerCase()}</TableCell>
                <TableCell className="font-mono text-sm tabular-nums">100%</TableCell>
                <TableCell className="font-mono text-sm tabular-nums">{cert.questionCount}</TableCell>
                <TableCell className="font-mono text-sm tabular-nums">{cert.totalQuestions}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Official links + guia de estudos */}
      <section className="mb-4">
        <h2 className="mb-3 font-display text-2xl font-light tracking-[-0.02em]">{t.cert.officialLinks}</h2>
        <div className="grid gap-px border sm:grid-cols-3">
          {officialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-card p-4 transition-colors hover:bg-app-soft"
            >
              <link.icon className="h-5 w-5 shrink-0 text-app-ink" aria-hidden />
              <p className="text-sm font-medium leading-snug group-hover:text-app-ink">{link.label}</p>
              <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          ))}
        </div>
        <Button variant="ghost" className="mt-3" onClick={() => navigate("guide")}>
          <GraduationCap className="h-4 w-4" />
          {t.footer.guide}
        </Button>
      </section>
    </div>
  );
}

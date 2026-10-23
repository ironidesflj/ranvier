"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Award,
  BadgeCheck,
  BookOpenCheck,
  Clock,
  DollarSign,
  GraduationCap,
  LineChart,
  Loader2,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { AdSlot } from "@/components/app/ad-slot";
import { InstallBanner } from "@/components/app/install-banner";

export function HomeView() {
  const { t, lang } = useLang();
  const { navigate } = useAppStore();
  const { data, isLoading } = useQuery({ queryKey: ["catalog", lang], queryFn: () => api.catalog(lang) });
  const cert = data?.certifications[0] ?? null;

  const startExam = useMutation({
    mutationFn: () => api.startAttempt({ certSlug: "databricks-data-engineer-associate", mode: "EXAM" }),
    onSuccess: (res) => {
      toast.success(t.toast.started);
      navigate("exam", { attemptId: res.attemptId });
    },
    onError: () => toast.error(t.toast.error),
  });

  const facts = [
    { icon: BadgeCheck, value: String(cert?.questionCount ?? 45), label: t.home.facts.questions },
    { icon: Clock, value: `${cert?.durationMin ?? 90} ${t.common.minutes}`, label: t.home.facts.duration },
    { icon: Target, value: `${cert?.passingScore ?? 70}%`, label: t.home.facts.passing },
    { icon: DollarSign, value: "$200", label: t.home.facts.fee },
  ];

  const features = [
    { icon: Award, title: t.home.features.examTitle, desc: t.home.features.examDesc },
    { icon: BookOpenCheck, title: t.home.features.studyTitle, desc: t.home.features.studyDesc },
    { icon: LineChart, title: t.home.features.progressTitle, desc: t.home.features.progressDesc },
    { icon: ShieldCheck, title: t.home.features.originalTitle, desc: t.home.features.originalDesc },
  ];

  const steps = [
    { title: t.home.how.step1Title, desc: t.home.how.step1Desc },
    { title: t.home.how.step2Title, desc: t.home.how.step2Desc },
    { title: t.home.how.step3Title, desc: t.home.how.step3Desc },
  ];

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t.home.badge}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t.home.heroTitle}{" "}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                {t.home.heroTitleHighlight}
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground sm:text-lg">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => startExam.mutate()} disabled={startExam.isPending || isLoading}>
                {startExam.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {t.home.ctaExam}
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigate("study")}>
                <BookOpenCheck className="h-4 w-4" />
                {t.home.ctaStudy}
              </Button>
            </div>
            <Button variant="link" className="mt-2" onClick={() => navigate("guide")}>
              <GraduationCap className="h-4 w-4" />
              {t.home.ctaSecondary}
            </Button>
          </div>
        </div>
      </section>

      {/* Install as app (PWA) — browser install, works offline */}
      <InstallBanner />

      {/* Official exam facts */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold sm:text-2xl">{t.home.factsTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.home.factsSubtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <Card key={fact.label} className="text-center">
              <CardContent className="flex flex-col items-center gap-1 p-4 sm:p-6">
                <fact.icon className="mb-1 h-5 w-5 text-primary" aria-hidden />
                <p className="text-2xl font-bold tracking-tight">{fact.value}</p>
                <p className="text-xs text-muted-foreground">{fact.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">{t.home.passingNote}</p>
      </section>

      {/* Features */}
      <section className="border-y bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-6 text-center text-xl font-semibold sm:text-2xl">{t.home.featuresTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Domains & weights */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold sm:text-2xl">{t.home.domainsTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.home.domainsSubtitle}</p>
        </div>
        {isLoading ? (
          <div className="mx-auto max-w-3xl space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {cert?.domains.map((d) => (
              <div key={d.code} className="rounded-xl border bg-card p-3.5">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[11px] font-bold text-secondary-foreground">
                      {d.code}
                    </span>
                    {lang === "pt" ? d.namePt : d.name}
                  </p>
                  <p className="shrink-0 text-sm font-bold text-primary">{d.weightPercent}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${d.weightPercent}%`}>
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(d.weightPercent * 3.5, 6)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How to use */}
      <section className="border-y bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-6 text-center text-xl font-semibold sm:text-2xl">{t.home.howTitle}</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <p className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </p>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Disclaimer strip */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <p className="mx-auto max-w-3xl rounded-xl border border-dashed bg-muted/30 p-4 text-center text-xs leading-relaxed text-muted-foreground">
          {t.home.disclaimer}
        </p>
      </section>

      <AdSlot placement="home" className="py-6" />
    </div>
  );
}

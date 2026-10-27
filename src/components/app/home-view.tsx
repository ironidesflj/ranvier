"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Award, BookOpenCheck, History, LineChart, Loader2, Play, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { AdSlot } from "@/components/app/ad-slot";
import { InstallBanner } from "@/components/app/install-banner";
import { WhatsNewDialog } from "@/components/app/whats-new-dialog";
import { CertSelectorMenu } from "@/components/app/cert-selector";
import { SOON_LINE_CODES } from "@/data/soon-certs";

/**
 * Landing (patch Ranvier v1.0 §6 + v1.1 §7).
 *
 *  - Hero à esquerda: eyebrow mono com o exame, H1 serif de até 2 linhas,
 *    lead de até 3 linhas. Sem gradiente no título, sem blob, sem sparkles.
 *  - Bilhete de exame à direita (v1.1 §7.4): código, nome, questões,
 *    duração, última sessão, "Continuar" (retomar sessão), "Trocar
 *    certificação" e a linha "em breve" — raio 14, fio de 1px, sombra de
 *    repouso (v1.1 §6 "objeto sobre a mesa").
 *  - Linha de prova: questões comentadas com fonte; progresso no dispositivo.
 *  - Seções de apoio: pesos oficiais por domínio (barras de 3 px),
 *    "Como o Ranvier ajuda você" (restaurada a pedido do fundador
 *    2026-10-25) e como usar.
 *
 * O aviso de novidades (1× por versão) também vive aqui — só na tela
 * inicial, nunca durante questão ou simulado (patch §8).
 *
 * Os dados do bilhete vêm do catálogo (fonte única de verdade — nenhuma
 * métrica inventada); "última sessão" vem do histórico real do estudante.
 * A certificação exibida é a ATIVA (multi-cert — patch v1.1 §9).
 */
export function HomeView() {
  const { t, f, lang, langReady } = useLang();
  const { navigate, certSlug } = useAppStore();
  /* Catalog: espera o idioma ser resolvido (perf: 1 chamada, não 2) e aceita
     cache de 24h — o conteúdo só muda quando o banco muda (deploy/reseed). */
  const { data, isPending } = useQuery({
    queryKey: ["catalog", lang],
    queryFn: () => api.catalog(lang),
    enabled: langReady,
    staleTime: 24 * 60 * 60 * 1000,
  });
  const cert = data?.certifications.find((c) => c.slug === certSlug) ?? data?.certifications[0] ?? null;
  /* Lista de tentativas: sempre fresca ao montar a landing — o botão
     "Continuar" do bilhete depende dela e o cache stale escondia sessões
     em andamento (QA 3-a FAIL-1). */
  const { data: attemptsData } = useQuery({
    queryKey: ["attempts"],
    queryFn: api.listAttempts,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const lastAttempt = attemptsData?.attempts.find((a) => a.status === "COMPLETED") ?? null;
  const inProgress = attemptsData?.attempts.find((a) => a.status === "IN_PROGRESS") ?? null;

  const startExam = useMutation({
    mutationFn: () => api.startAttempt({ certSlug: cert?.slug ?? certSlug, mode: "EXAM" }),
    onSuccess: (res) => {
      toast.success(t.toast.started);
      navigate("exam", { attemptId: res.attemptId });
    },
    onError: () => toast.error(t.toast.error),
  });

  const steps = [
    { title: t.home.how.step1Title, desc: t.home.how.step1Desc },
    { title: t.home.how.step2Title, desc: t.home.how.step2Desc },
    { title: t.home.how.step3Title, desc: t.home.how.step3Desc },
  ];

  /* "Como o Ranvier ajuda você" — seção restaurada (pedido do fundador
     2026-10-25), no idioma da interface. Cards hairline do patch: sem raio,
     sem sombra, ícone discreto na tinta do app. */
  const features = [
    { icon: Award, title: t.home.features.examTitle, desc: t.home.features.examDesc },
    { icon: BookOpenCheck, title: t.home.features.studyTitle, desc: t.home.features.studyDesc },
    { icon: LineChart, title: t.home.features.progressTitle, desc: t.home.features.progressDesc },
    { icon: ShieldCheck, title: t.home.features.originalTitle, desc: t.home.features.originalDesc },
  ];

  return (
    <div className="flex-1">
      {/* Aviso de novidades — 1× por usuário a cada versão */}
      <WhatsNewDialog />

      {/* Hero + bilhete */}
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1fr_360px] lg:gap-14">
          {/* Hero à esquerda */}
          <div className="flex flex-col justify-center">
            <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t.home.landing.eyebrow}
            </p>
            <h1 className="max-w-[16ch] font-display text-4xl font-light leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              {t.home.landing.h1}
            </h1>
            <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground">{t.home.landing.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => startExam.mutate()} disabled={startExam.isPending}>
                {startExam.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {t.home.landing.ctaExam}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("cert")}>
                {t.home.landing.ctaExams}
              </Button>
            </div>
            <button
              type="button"
              onClick={() => navigate("study")}
              className="mt-4 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-app-ink underline-offset-4 hover:underline"
            >
              {t.home.landing.ctaStudy}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          {/* Bilhete de exame — v1.1 §7.4: raio 14, fio de 1px, sombra de
              repouso ("objeto sobre a mesa"). Continuar, Trocar certificação
              e a linha "em breve" — multi-cert (feedback nº 6). */}
          <aside
            className="self-start rounded-[14px] border bg-card p-5 shadow-[var(--shadow-rest)]"
            aria-label={t.home.ticket.label}
          >
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t.home.ticket.label}
            </p>
            {isPending || !cert ? (
              <div className="mt-3 space-y-3">
                <Skeleton className="h-7 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <h2 className="mt-2 font-display text-xl leading-snug tracking-[-0.02em]">{cert.name}</h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.home.ticket.code}</dt>
                    <dd className="font-mono text-sm font-medium">{cert.shortName}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.home.ticket.questions}</dt>
                    <dd className="font-mono text-sm font-medium tabular-nums">{cert.questionCount}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.home.ticket.duration}</dt>
                    <dd className="font-mono text-sm font-medium tabular-nums">{cert.durationMin} min</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.home.ticket.cutoff}</dt>
                    <dd className="font-mono text-sm font-medium tabular-nums">{cert.passingScore}%</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t pt-2.5">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.home.ticket.lastSession}</dt>
                    <dd className="font-mono text-sm font-medium tabular-nums">
                      {lastAttempt && lastAttempt.percent != null
                        ? f(t.home.ticket.sessionScore, { percent: Math.round(lastAttempt.percent), mode: lastAttempt.mode === "EXAM" ? t.exam.title : t.study.title })
                        : t.home.ticket.noSession}
                    </dd>
                  </div>
                </dl>

                {/* Retomar sessão em andamento (v1.1 §7.1: o "Continuar"
                    vive no bilhete — a barra fica com Entrar, nunca ambos) */}
                {inProgress && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => navigate(inProgress.mode === "EXAM" ? "exam" : "results", { attemptId: inProgress.id })}
                  >
                    <History className="h-4 w-4" />
                    {t.home.landing.continueSession}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                )}

                {/* Trocar certificação — seletor com foco total (v1.1 §9) */}
                <div className="mt-2">
                  <CertSelectorMenu variant="button" />
                </div>

                {/* Próximas certificações — estado "em breve", sem data
                    prometida, sem clique falso (v1.1 §9.6) */}
                <p className="mt-4 border-t pt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {SOON_LINE_CODES.join(" · ")} · {t.shell.certSoon}
                </p>

                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{t.home.passingNote}</p>
              </>
            )}
          </aside>
        </div>

        {/* Linha de prova */}
        <div className="border-t">
          <p className="mx-auto max-w-6xl px-4 py-3 text-sm text-muted-foreground">{t.home.landing.proofLine}</p>
        </div>
      </section>

      {/* Instalar como app (PWA) */}
      <InstallBanner />

      {/* Domínios e pesos oficiais */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-1 font-display text-2xl font-light tracking-[-0.02em]">{t.home.domainsTitle}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t.home.domainsSubtitle}</p>
        {isPending ? (
          <div className="max-w-3xl space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {cert?.domains.map((d) => (
              <div key={d.code}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <p className="min-w-0 font-medium">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">{d.code}</span>
                    {lang === "pt" ? d.namePt : d.name}
                  </p>
                  <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-app-ink">{d.weightPercent}%</p>
                </div>
                {/* barra de 3 px — patch §9 */}
                <div className="h-[3px] w-full bg-surface-2" role="img" aria-label={`${d.weightPercent}%`}>
                  <div className="h-full bg-app-ink" style={{ width: `${Math.max(d.weightPercent * 3.5, 6)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Como o Ranvier ajuda você (restaurada a pedido do fundador) —
          v1.1 §6: raio 14 + sombra de repouso ("objeto sobre a mesa") */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-6 font-display text-2xl font-light tracking-[-0.02em]">{t.home.featuresTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[14px] border bg-card p-5 shadow-[var(--shadow-rest)]">
                <div className="flex items-center gap-2.5">
                  <feature.icon className="h-4 w-4 shrink-0 text-app-ink" aria-hidden />
                  <p className="font-medium">{feature.title}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como usar */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-6 font-display text-2xl font-light tracking-[-0.02em]">{t.home.howTitle}</h2>
          <ol className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 font-medium">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Aviso de não-afiliação */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">{t.home.disclaimer}</p>
        </div>
      </section>

      <AdSlot placement="home" className="py-6" />
    </div>
  );
}

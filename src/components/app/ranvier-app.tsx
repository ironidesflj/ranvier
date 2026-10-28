"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  BookText,
  GraduationCap,
  Github,
  Globe,
  Layers,
  LineChart,
  MoreHorizontal,
  RotateCcw,
  Route,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore, type View } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { APP_VERSION } from "@/lib/version";
import { AdSenseScript } from "@/components/app/ad-slot";
import { NoosBadge } from "@/components/app/noos-badge";
import { RanvierMark, RanvierSplash } from "@/components/app/ranvier-mark";
import { TopBar, MoreSheet, LangSeg, ThemeToggle, AccountControl } from "@/components/app/top-bar";
import { HomeView } from "@/components/app/home-view";
import { CertView } from "@/components/app/cert-view";
import { StudyView } from "@/components/app/study-view";
import { ExamView } from "@/components/app/exam-view";
import { ResultsView } from "@/components/app/results-view";
import { FlashcardsView } from "@/components/app/flashcards-view";
import { TrailsView } from "@/components/app/trails-view";
import { ProgressView } from "@/components/app/progress-view";
import { GlossaryView } from "@/components/app/glossary-view";
import { GuideView } from "@/components/app/guide-view";
import { AboutView } from "@/components/app/about-view";
import { SettingsView } from "@/components/app/settings-view";

/**
 * Shell do app (guia Noos v1.1 §04 + patch Ranvier v1.0 §7 + v1.1 §8).
 *
 *  - Rail lateral de 208 px no desktop: marca no topo (monograma + Ranvier),
 *    QUATRO destinos principais (Estudar, Exame, Progresso, Revisão) e
 *    Ajustes como item secundário no pé, em 11 px, muted, acima da versão
 *    (v1.1 §8 — feedback nº 4.b: Ajustes nunca é destino principal).
 *  - Barra superior em TODAS as telas (v1.1 §8): certificação atual à
 *    esquerda; PT · EN, tema e conta à direita — os controles voltaram da
 *    barra (feedback nº 4.b), inclusive o Entrar.
 *  - Mobile (≤ 767 px): barra superior idem + navegação inferior de CINCO
 *    posições (quatro destinos + "Mais"); Ajustes e configurações profundas
 *    vivem no sheet de Mais (v1.1 §8.6).
 *  - A landing (view "home") tem header próprio com os mesmos controles
 *    (patch §7.1) e não exibe rail.
 *  - O exame é chrome-less (uma questão por tela; a barra de sessão da
 *    própria view substitui a barra superior).
 *  - Assinatura "by Noos" (decisão do fundador 2026-10-25 + guia §04-F e
 *    checklist de lançamento): vive no RODAPÉ de conteúdo, como LINK para
 *    o hub do ecossistema — uma vez por tela, nunca nas duas pontas. O
 *    topo (rail/barra) mostra apenas a marca do app.
 */

const RAIL_W = "w-[208px]";

/* ------------------------------------------------------------------ */
/* Marca (lockup do topo)                                             */
/* ------------------------------------------------------------------ */

function BrandLockup({ size = "md" }: { size?: "md" | "sm" }) {
  const { t } = useLang();
  const { navigate } = useAppStore();
  const mark = size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]";
  return (
    <button
      type="button"
      onClick={() => navigate("home")}
      className="flex items-center gap-2.5 text-left"
      aria-label={t.app.name}
    >
      <RanvierMark className={cn(mark, "text-foreground")} />
      <span
        className={cn("font-display font-normal leading-none tracking-[-0.03em]", size === "md" ? "text-xl" : "text-lg")}
      >
        {t.app.name}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Rail (desktop) — 4 destinos + Ajustes secundário no pé             */
/* ------------------------------------------------------------------ */

function Rail() {
  const { t, f } = useLang();
  const { view, navigate } = useAppStore();
  const queryClient = useQueryClient();

  const items: { view: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    /* v1.8.0 — Trilhas é o 1º destino: a resposta ao "por onde começo?"
       (spec §5.6 — Estudar · Flashcards · Exame · Progresso seguem). */
    { view: "trails", label: t.trails.title, icon: Route },
    { view: "study", label: t.shell.study, icon: BookOpen },
    { view: "flashcards", label: t.flashcards.title, icon: Layers },
    { view: "cert", label: t.shell.exam, icon: GraduationCap },
    { view: "progress", label: t.shell.progress, icon: LineChart },
    /* v1.9.0 — Glossário após Progresso (spec §4): consulta, não modo de
       estudo. Ícone BookText — BookOpen já pertence ao Estudar. */
    { view: "glossary", label: t.glossary.title, icon: BookText },
  ];

  /* Revisão: entra na fila de revisão (questões erradas) — se vazia,
     orienta e leva ao progresso (o guia manda o vazio oferecer o próximo passo). */
  async function startReview() {
    try {
      const progress = await queryClient.fetchQuery({ queryKey: ["progress"], queryFn: api.progress });
      const ids = progress?.reviewQuestionIds ?? [];
      if (ids.length > 0) {
        navigate("study", { questionIds: ids });
      } else {
        toast.info(t.shell.reviewEmpty);
        navigate("progress");
      }
    } catch {
      toast.error(t.toast.error);
    }
  }

  const isReviewActive = view === "study"; // a sessão de revisão roda dentro de Estudar

  return (
    <aside className={cn("hidden shrink-0 flex-col border-r bg-card md:flex", RAIL_W)} aria-label={t.nav.menu}>
      <div className="border-b px-4 py-4">
        <BrandLockup />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main navigation">
        {items.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => navigate(item.view)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 border-l-2 px-3 text-sm font-medium transition-colors",
                active
                  ? "border-app bg-app-soft text-app-ink"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => void startReview()}
          className={cn(
            "flex h-11 items-center gap-3 border-l-2 px-3 text-sm font-medium transition-colors",
            isReviewActive
              ? "border-app bg-app-soft text-app-ink"
              : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {t.shell.review}
        </button>
      </nav>

      {/* Ajustes: item secundário no pé do rail (v1.1 §8.2) — 11px, muted,
          acima da versão. Nunca destino principal. */}
      <div className="border-t p-2">
        <button
          type="button"
          onClick={() => navigate("settings")}
          aria-current={view === "settings" ? "page" : undefined}
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-[10px] px-3 text-[11px] font-medium transition-colors",
            view === "settings"
              ? "bg-app-soft text-app-ink"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Settings2 className="h-3.5 w-3.5" aria-hidden />
          {t.shell.settings}
        </button>
        <p className="mt-2 px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {f(t.footer.version, { version: APP_VERSION })}
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Navegação inferior (mobile) — quatro destinos + Mais               */
/* ------------------------------------------------------------------ */

function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const { t } = useLang();
  const { view, navigate } = useAppStore();

  const items: { key: string; label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; active: boolean }[] = [
    /* v1.9.0 (spec §4): 6 fixos + Mais — o Glossário entra nos fixos e a
       Revisão passa a viver só no sheet Mais (transitória como sempre).
       375 verificado: 6 botões + Mais cabem (mesmo padrão da Task 19). */
    { key: "trails", label: t.trails.title, icon: Route, onClick: () => navigate("trails"), active: view === "trails" },
    { key: "study", label: t.shell.study, icon: BookOpen, onClick: () => navigate("study"), active: view === "study" },
    { key: "flashcards", label: t.flashcards.title, icon: Layers, onClick: () => navigate("flashcards"), active: view === "flashcards" },
    { key: "cert", label: t.shell.exam, icon: GraduationCap, onClick: () => navigate("cert"), active: view === "cert" },
    { key: "progress", label: t.shell.progress, icon: LineChart, onClick: () => navigate("progress"), active: view === "progress" },
    { key: "glossary", label: t.glossary.title, icon: BookText, onClick: () => navigate("glossary"), active: view === "glossary" },
  ];

  return (
    <nav
      aria-label={t.nav.menu}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 pt-1.5 text-[10px] font-medium transition-colors",
            item.active ? "text-app-ink" : "text-muted-foreground"
          )}
        >
          <span className={cn("h-0.5 w-8", item.active ? "bg-app" : "bg-transparent")} aria-hidden />
          <item.icon className="h-5 w-5" aria-hidden />
          <span className="w-full truncate px-0.5 text-center">{item.label}</span>
        </button>
      ))}
      {/* "Mais" — Ajustes e configurações profundas no sheet (v1.1 §8.6) */}
      <button
        type="button"
        onClick={onMore}
        aria-label={t.shell.moreTitle}
        className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 pt-1.5 text-[10px] font-medium text-muted-foreground transition-colors"
      >
        <span className="h-0.5 w-8 bg-transparent" aria-hidden />
        <MoreHorizontal className="h-5 w-5" aria-hidden />
        {t.shell.more}
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Rodapé de conteúdo                                                 */
/* ------------------------------------------------------------------ */

function ContentFooter() {
  const { t, f } = useLang();
  const { navigate } = useAppStore();
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Assinatura "by Noos" no rodapé — link para o hub (decisão do
            fundador 2026-10-25; guia §04-F: rodapé = assinatura + Local-First
            + versão). Alvo de 44 px. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <NoosBadge />
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            <span>{t.shell.localFirst}</span>
            {/* versão: no desktop vive no pé do rail — nunca duplicado */}
            <span className="md:hidden">{f(t.footer.version, { version: APP_VERSION })}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">{t.footer.disclaimer}</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" aria-label="Footer">
            <a
              href="https://github.com/ironidesflj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://www.databricks.com/learn/certification/data-engineer-associate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-3.5 w-3.5" />
              {t.footer.sources}
            </a>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("guide")}>
              {t.footer.guide}
            </button>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("about")}>
              {t.footer.about}
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Landing (view "home") — header próprio (patch v1.1 §7.1)          */
/* ------------------------------------------------------------------ */

function LandingHeader() {
  const { t } = useLang();
  const { navigate } = useAppStore();

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <BrandLockup />
        <div className="flex items-center gap-1.5">
          <nav className="hidden items-center gap-1 mr-1 lg:flex" aria-label="Main navigation">
            <Button variant="ghost" size="sm" onClick={() => navigate("cert")}>
              {t.shell.examMenu}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("progress")}>
              {t.shell.progress}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("about")}>
              {t.footer.about}
            </Button>
          </nav>
          {/* Controles sempre na barra (v1.1 §7.1 — feedback nº 4.b):
              PT · EN, tema e Entrar. "Continuar" (retomar sessão) vive no
              bilhete — nunca "Entrar" e "Continuar" juntos na barra. */}
          <LangSeg />
          <ThemeToggle />
          <AccountControl />
        </div>
      </div>
    </header>
  );
}

function LandingFooter() {
  const { t, f } = useLang();
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Assinatura "by Noos" no rodapé — link para o hub (decisão do
            fundador 2026-10-25; guia §04-F + checklist de lançamento). */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <NoosBadge />
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            <span>{t.shell.localFirst}</span>
            <span>{f(t.footer.version, { version: APP_VERSION })}</span>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground">{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                              */
/* ------------------------------------------------------------------ */

export function RanvierApp() {
  const { view, syncFromHash, initCert } = useAppStore();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    syncFromHash();
    initCert(); // certificação ativa persistida (multi-cert — patch v1.1 §9)
    const onHashChange = () => syncFromHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [syncFromHash, initCert]);

  const content = (
    <>
      {view === "home" && <HomeView />}
      {view === "cert" && <CertView />}
      {view === "study" && <StudyView />}
      {view === "exam" && <ExamView />}
      {view === "results" && <ResultsView />}
      {view === "flashcards" && <FlashcardsView />}
      {view === "trails" && <TrailsView />}
      {view === "progress" && <ProgressView />}
      {view === "glossary" && <GlossaryView />}
      {view === "guide" && <GuideView />}
      {view === "about" && <AboutView />}
      {view === "settings" && <SettingsView />}
    </>
  );

  /* Exame: chrome-less — uma questão por tela, nada compete (patch §8).
     A barra de sessão (Início, cert, posição, relógio) substitui a barra
     superior. Conteúdo em 720 px; a régua de tempo vive dentro da view. */
  if (view === "exam") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AdSenseScript />
        <main className="flex flex-1 flex-col">{content}</main>
      </div>
    );
  }

  /* Landing: header próprio com os mesmos controles, sem rail (patch §7). */
  if (view === "home") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <RanvierSplash />
        <AdSenseScript />
        <LandingHeader />
        <main className="flex flex-1 flex-col">{content}</main>
        <LandingFooter />
      </div>
    );
  }

  /* Shell interno: rail no desktop, barra superior em toda tela, bottom
     nav (4 + Mais) no mobile. */
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <AdSenseScript />
      <Rail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col pb-20 md:pb-0">{content}</main>
        <ContentFooter />
      </div>
      <MobileBottomNav onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </div>
  );
}

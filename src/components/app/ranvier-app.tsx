"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  CheckCircle2,
  Github,
  Globe,
  Home,
  LogIn,
  LogOut,
  Menu,
  Moon,
  BookOpen,
  GraduationCap,
  LineChart,
  Info,
  Sun,
  Trash2,
  UserRound,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore, type View } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { AuthModal } from "@/components/app/auth-modal";
import { AdSenseScript } from "@/components/app/ad-slot";
import { NoosBadge } from "@/components/app/noos-badge";
import { HomeView } from "@/components/app/home-view";
import { CertView } from "@/components/app/cert-view";
import { StudyView } from "@/components/app/study-view";
import { ExamView } from "@/components/app/exam-view";
import { ResultsView } from "@/components/app/results-view";
import { ProgressView } from "@/components/app/progress-view";
import { GuideView } from "@/components/app/guide-view";
import { AboutView } from "@/components/app/about-view";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path d="M18 33.5 28 43.5 46 22" fill="none" stroke="var(--background)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-full border p-0.5" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => setLang("pt")}
        aria-pressed={lang === "pt"}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
          lang === "pt" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t.common.theme}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLang();
  const { view, navigate } = useAppStore();
  const navItems: { view: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: "home", label: t.nav.home, icon: Home },
    { view: "cert", label: t.nav.cert, icon: Award },
    { view: "study", label: t.nav.study, icon: BookOpen },
    { view: "progress", label: t.nav.progress, icon: LineChart },
    { view: "guide", label: t.nav.guide, icon: GraduationCap },
    { view: "about", label: t.nav.about, icon: Info },
  ];
  return (
    <nav aria-label="Main navigation" className="flex flex-col md:flex-row md:items-center gap-1 md:gap-0.5">
      {navItems.map((item) => (
        <button
          key={item.view}
          type="button"
          onClick={() => {
            navigate(item.view);
            onNavigate?.();
          }}
          aria-current={view === item.view ? "page" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:px-3 md:py-1.5",
            view === item.view
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function Header() {
  const { t } = useLang();
  const { navigate } = useAppStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const user = data?.user ?? null;

  async function handleLogout() {
    await api.logout();
    await queryClient.invalidateQueries();
    toast.message(t.toast.loggedOut);
  }

  async function handleDeleteAccount() {
    try {
      await api.deleteAccount();
      await queryClient.invalidateQueries();
      toast.message(t.toast.accountDeleted);
    } catch {
      toast.error(t.toast.error);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex items-center gap-2 font-bold tracking-tight"
          aria-label={t.app.name}
        >
          <LogoMark className="h-7 w-7 text-primary" />
          <span className="text-lg">{t.app.name}</span>
        </button>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="flex items-center gap-1.5">
          <LangToggle />
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t.auth.accountMenu}>
                  <UserRound className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{user.name ?? user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleLogout()}>
                  <LogOut className="h-4 w-4" />
                  {t.auth.logout}
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      {t.auth.deleteAccount}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.auth.deleteConfirmTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.auth.deleteConfirmDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() => void handleDeleteAccount()}
                      >
                        {t.auth.deleteAccount}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setAuthOpen(true)}>
              <LogIn className="h-4 w-4" />
              {t.auth.loginTitle}
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.nav.menu}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-4" aria-describedby={undefined}>
              <SheetTitle className="sr-only">{t.nav.menu}</SheetTitle>
              <div className="mt-2 flex flex-col gap-4">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                {!user && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthOpen(true);
                    }}
                  >
                    <LogIn className="h-4 w-4" />
                    {t.auth.loginTitle}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useLang();
  const { navigate } = useAppStore();
  return (
    <footer className="mt-auto border-t bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="space-y-2.5">
            {/* App name — maximum hierarchy: the title is always Ranvier. */}
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <LogoMark className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold tracking-tight">{t.app.name}</span>
            </div>
            {/* Signature row: "by Noos" endorsement badge + Contact, side by side. */}
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <NoosBadge />
              <span className="text-muted-foreground/40" aria-hidden>
                ·
              </span>
              <button
                type="button"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => navigate("about")}
              >
                {t.footer.contact}
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t.home.notAffiliated}
              </span>
              <p className="max-w-xl text-xs text-muted-foreground">{t.footer.disclaimer}</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs" aria-label="Footer">
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("about")}>
              {t.footer.about}
            </button>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("guide")}>
              {t.footer.guide}
            </button>
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
          </nav>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1 border-t pt-4 text-[11px] text-muted-foreground/80 md:flex-row md:justify-between">
          <p className="inline-flex flex-wrap items-center justify-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            {t.common.free}
            <span aria-hidden>·</span>
            <span>{t.footer.version}</span>
            <span aria-hidden>·</span>
            <span>{t.footer.license}</span>
          </p>
          <p>
            {t.app.name}
            <span className="mx-1" aria-hidden>
              ·
            </span>
            {t.footer.author}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function RanvierApp() {
  const { view, syncFromHash } = useAppStore();

  useEffect(() => {
    syncFromHash();
    const onHashChange = () => syncFromHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [syncFromHash]);

  // Exam view is chrome-less focused (full-bleed, no footer) — everything else shares the shell.
  const focused = view === "exam";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdSenseScript />
      <Header />
      <main className="flex flex-1 flex-col">
        {view === "home" && <HomeView />}
        {view === "cert" && <CertView />}
        {view === "study" && <StudyView />}
        {view === "exam" && <ExamView />}
        {view === "results" && <ResultsView />}
        {view === "progress" && <ProgressView />}
        {view === "guide" && <GuideView />}
        {view === "about" && <AboutView />}
      </main>
      {!focused && <Footer />}
    </div>
  );
}

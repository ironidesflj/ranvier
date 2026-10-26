"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  BookOpenCheck,
  ExternalLink,
  Languages,
  LogIn,
  LogOut,
  MonitorSmartphone,
  Moon,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { usePwa } from "@/components/app/pwa-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { AuthModal } from "@/components/app/auth-modal";

/**
 * Ajustes — destino do shell (guia Noos v1.1 §04 + patch §7).
 * Concentra idioma, tema, conta, instalação do app e sobre — os controles
 * que antes disputavam a barra do app. Superfícies com hairline, títulos de
 * seção em mono uppercase (metadado), sem sombra.
 */
export function SettingsView() {
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { navigate } = useAppStore();
  const { showInstallEntry, install } = usePwa();
  const queryClient = useQueryClient();
  const [authOpen, setAuthOpen] = useState(false);

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
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.settings.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.settings.subtitle}</p>
      </header>

      <div className="space-y-8">
        {/* Idioma */}
        <section className="border-t pt-5">
          <h2 className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.settings.languageTitle}
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">{t.settings.languageDesc}</p>
          <div className="inline-flex border" role="group" aria-label={t.common.language}>
            {(["pt", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "flex h-11 min-w-16 items-center justify-center gap-1.5 px-4 text-sm font-medium transition-colors",
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Languages className="h-4 w-4" aria-hidden />
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Tema */}
        <section className="border-t pt-5">
          <h2 className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.settings.themeTitle}
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">{t.settings.themeDesc}</p>
          <div className="inline-flex border" role="group" aria-label={t.common.theme}>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={cn(
                "flex h-11 items-center gap-1.5 px-4 text-sm font-medium transition-colors",
                theme !== "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun className="h-4 w-4" aria-hidden />
              {t.settings.themeLight}
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={cn(
                "flex h-11 items-center gap-1.5 px-4 text-sm font-medium transition-colors",
                theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon className="h-4 w-4" aria-hidden />
              {t.settings.themeDark}
            </button>
          </div>
        </section>

        {/* Conta */}
        <section className="border-t pt-5">
          <h2 className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.settings.accountTitle}
          </h2>
          {user ? (
            <>
              <div className="mb-3 flex items-center gap-3 border p-4">
                <UserRound className="h-5 w-5 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{user.name ?? user.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => void handleLogout()}>
                  <LogOut className="h-4 w-4" />
                  {t.settings.logout}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      {t.settings.deleteAccount}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.settings.deleteConfirmTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.settings.deleteConfirmDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => void handleDeleteAccount()}>
                        {t.settings.deleteAccount}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          ) : (
            <>
              <p className="mb-3 max-w-[62ch] text-sm text-muted-foreground">{t.settings.accountDesc}</p>
              <Button variant="outline" onClick={() => setAuthOpen(true)}>
                <LogIn className="h-4 w-4" />
                {t.settings.login}
              </Button>
            </>
          )}
        </section>

        {/* Instalar app (PWA) */}
        {showInstallEntry && (
          <section className="border-t pt-5">
            <h2 className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t.settings.installTitle}
            </h2>
            <p className="mb-3 max-w-[62ch] text-sm text-muted-foreground">{t.settings.installDesc}</p>
            <Button variant="outline" onClick={install}>
              <MonitorSmartphone className="h-4 w-4" />
              {t.settings.installButton}
            </Button>
          </section>
        )}

        {/* Sobre */}
        <section className="border-t pt-5">
          <h2 className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.settings.aboutTitle}
          </h2>
          <p className="mb-3 max-w-[62ch] text-sm text-muted-foreground">{t.settings.aboutDesc}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("about")}>
              <BookOpenCheck className="h-4 w-4" />
              {t.settings.aboutCta}
            </Button>
            <a
              href="https://www.databricks.com/learn/certification/data-engineer-associate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 border px-5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              {t.settings.sourcesCta}
            </a>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {t.settings.license} ·{t.settings.author}
          </p>
        </section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Languages, LogIn, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { AuthModal } from "@/components/app/auth-modal";
import { CertSelectorMenu } from "@/components/app/cert-selector";
import { RanvierMark } from "@/components/app/ranvier-mark";

/**
 * Barra superior do app (patch v1.1 §8 — feedback nº 4.b).
 *
 * "Controles voltam para a barra": PT/EN, tema e Entrar vivem AQUI, em toda
 * tela do app (e na landing), não escondidos em Ajustes — o fundador pediu
 * de volta os toggles na barra, especialmente o Entrar. Ajustes vira item
 * secundário (rail no desktop; sheet "Mais" no mobile).
 *
 * Sem sessão: "Entrar" (abre o modal). Com sessão: iniciais + menu
 * (Conta → Ajustes; Sair) — nunca os dois (nota E).
 * Tema: claro por padrão, alternável em qualquer tela (nota E).
 */

/* ------------------------------------------------------------------ */
/* Idioma PT · EN — grupo com aria-pressed e rótulo (patch §12)        */
/* ------------------------------------------------------------------ */

export function LangSeg({ size = "bar" }: { size?: "bar" | "sheet" }) {
  const { t, lang, setLang } = useLang();
  const h = size === "bar" ? "h-9" : "h-11";
  return (
    <div
      className={cn("inline-flex overflow-hidden rounded-[10px] border", size === "bar" && "hidden min-[430px]:inline-flex")}
      role="group"
      aria-label={t.common.language}
    >
      {(["pt", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "flex items-center justify-center font-mono text-[11px] font-medium uppercase tracking-[0.04em] transition-colors",
            h,
            "min-w-11 px-2",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tema — claro por padrão, alternável na barra em qualquer tela       */
/* ------------------------------------------------------------------ */

export function ThemeToggle({ size = "bar" }: { size?: "bar" | "sheet" }) {
  const { t } = useLang();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const h = size === "bar" ? "h-9 w-9" : "h-11 w-11";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.settings.themeLight : t.settings.themeDark}
      aria-pressed={isDark}
      title={isDark ? t.settings.themeLight : t.settings.themeDark}
      className={cn(
        "flex items-center justify-center rounded-[10px] border text-muted-foreground transition-colors hover:border-[var(--noos-border-strong)] hover:text-foreground",
        h
      )}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Conta — "Entrar" sem sessão; iniciais + menu com sessão             */
/* ------------------------------------------------------------------ */

export function AccountControl({ size = "bar" }: { size?: "bar" | "sheet" }) {
  const { t } = useLang();
  const { navigate } = useAppStore();
  const queryClient = useQueryClient();
  const [authOpen, setAuthOpen] = useState(false);

  const { data } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const user = data?.user ?? null;

  async function handleLogout() {
    await api.logout();
    await queryClient.invalidateQueries();
    toast.message(t.toast.loggedOut);
  }

  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)} className={size === "bar" ? "h-9" : "h-11 w-full"}>
          <LogIn className="h-4 w-4" />
          {t.auth.loginTitle}
        </Button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  const source = user.name?.trim() || user.email;
  const initial = source.slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t.auth.accountMenu}
          className={cn(
            "flex items-center justify-center rounded-[10px] border border-app-line bg-app-soft font-mono text-sm font-medium text-app-ink transition-colors hover:border-[var(--noos-border-strong)]",
            size === "bar" ? "h-9 w-9" : "h-11 w-11"
          )}
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="min-w-0 truncate text-sm font-normal">{user.name ?? user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("settings")}>{t.shell.settings}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleLogout()}>
          <LogOut className="h-4 w-4" />
          {t.auth.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Barra superior do shell — certificação à esquerda; controles à direita */
/* ------------------------------------------------------------------ */

export function TopBar() {
  const { t } = useLang();
  const { navigate } = useAppStore();

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {/* Mobile: marca (→ Início) + seletor de certificação.
              Desktop: o rail já carrega a marca; a barra começa no seletor. */}
          <button
            type="button"
            onClick={() => navigate("home")}
            aria-label={t.app.name}
            className="flex items-center gap-2 text-left md:hidden"
          >
            <RanvierMark className="h-[18px] w-[18px] text-foreground" />
            <span className="font-display text-lg font-normal leading-none tracking-[-0.03em]">{t.app.name}</span>
          </button>
          <CertSelectorMenu />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <LangSeg />
          <ThemeToggle />
          <AccountControl />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet "Mais" (mobile) — Ajustes e configurações profundas           */
/* ------------------------------------------------------------------ */

export function MoreSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useLang();
  const { navigate } = useAppStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[20px] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2"
        aria-describedby={undefined}
      >
        <SheetTitle className="mb-4 font-display text-xl font-light tracking-[-0.02em]">{t.shell.moreTitle}</SheetTitle>
        <div className="space-y-5 pb-2">
          {/* Idioma e tema em alvos de 44px (patch §12) */}
          <div>
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t.common.language}
            </p>
            <LangSeg size="sheet" />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t.common.theme}
            </p>
            <ThemeButtons />
          </div>
          <div className="border-t pt-4">
            <AccountControl size="sheet" />
          </div>
          <div className="border-t pt-4">
            <Button variant="outline" size="lg" className="w-full" onClick={() => { onOpenChange(false); navigate("settings"); }}>
              <Languages className="h-4 w-4" />
              {t.shell.settings}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* Botões Claro/Escuro em 44px para o sheet (o toggle compacto fica na barra). */
function ThemeButtons() {
  const { t } = useLang();
  const { theme, setTheme } = useTheme();
  return (
    <div className="inline-flex" role="group" aria-label={t.common.theme}>
      {(["light", "dark"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setTheme(mode)}
          aria-pressed={theme === mode}
          className={cn(
            "flex h-11 items-center gap-2 px-5 text-sm font-medium transition-colors",
            theme === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {mode === "light" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
          {mode === "light" ? t.settings.themeLight : t.settings.themeDark}
        </button>
      ))}
    </div>
  );
}

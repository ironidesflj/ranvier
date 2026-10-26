"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeftRight, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api } from "@/lib/api-client";
import { SOON_CERTS } from "@/data/soon-certs";
import type { PublicCertification } from "@/lib/types";

/**
 * Seletor de certificação (patch v1.1 §9 — feedback nº 6).
 *
 * "Uma por vez, de corpo inteiro": escolhida a certificação, o app inteiro
 * deriva dela. Troca em dois toques (seletor → certificação); durante uma
 * sessão em andamento, a troca pede confirmação e oferece "Retomar depois"
 * (patch §9.5). Certificações futuras aparecem como estado "em breve" —
 * código e nome reais, não clicáveis, sem data prometida.
 *
 * Progresso por certificação é inerente ao modelo de dados (tentativas →
 * questões → certificação; nota D): trocar não zera, não soma e não
 * empresta histórico.
 */

function initials(user: { name: string | null; email: string } | null): string {
  if (!user) return "";
  const source = user.name?.trim() || user.email;
  return source.slice(0, 1).toUpperCase();
}

export function CertSelectorMenu({ variant = "bar" }: { variant?: "bar" | "button" }) {
  const { t, f, lang } = useLang();
  const { certSlug, setCert, navigate } = useAppStore();
  const queryClient = useQueryClient();
  const [pendingCert, setPendingCert] = useState<{ slug: string; code: string } | null>(null);

  const { data } = useQuery({ queryKey: ["catalog", lang], queryFn: () => api.catalog(lang) });
  const certs: PublicCertification[] = data?.certifications ?? [];
  const active = certs.find((c) => c.slug === certSlug) ?? certs[0] ?? null;

  /* Sessão em andamento: a troca pede confirmação (patch §9.5). Com uma
     única certificação disponível hoje, este guarda fica dormente — a
     arquitetura já nasce correta para as próximas. */
  const { data: attemptsData } = useQuery({
    queryKey: ["attempts"],
    queryFn: api.listAttempts,
    staleTime: 30_000,
  });
  const inProgress = attemptsData?.attempts.find((a) => a.status === "IN_PROGRESS") ?? null;

  function chooseCert(slug: string, code: string) {
    if (!active || slug === active.slug) return;
    if (inProgress) {
      setPendingCert({ slug, code });
      return;
    }
    switchCert(slug, code);
  }

  function switchCert(slug: string, code: string) {
    const previous = active?.shortName ?? "";
    setCert(slug);
    void queryClient.invalidateQueries({ queryKey: ["progress"] });
    toast.message(f(t.shell.certSwitched, { cert: code, previous }));
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === "bar" ? (
            <button
              type="button"
              className="flex h-10 min-w-0 max-w-[190px] items-center gap-1.5 rounded-[10px] border bg-card px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-foreground transition-colors hover:border-[var(--noos-border-strong)] max-[429px]:max-w-[130px]"
              aria-label={t.shell.certSelectorLabel}
              aria-haspopup="menu"
            >
              <span className="truncate">{active?.shortName ?? t.shell.certSelectorLabel}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          ) : (
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="h-4 w-4" />
              {t.shell.switchCert}
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.shell.certSelectorLabel}
          </DropdownMenuLabel>
          {certs.map((c) => {
            const isActive = active?.slug === c.slug;
            return (
              <DropdownMenuItem
                key={c.slug}
                onSelect={() => chooseCert(c.slug, c.shortName)}
                aria-current={isActive || undefined}
                className={cn("gap-3", isActive && "bg-app-soft")}
              >
                <span className="w-16 shrink-0 font-mono text-xs font-medium">{c.shortName}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-[6px] border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em]",
                    isActive ? "border-app-line text-app-ink" : "border-border text-muted-foreground"
                  )}
                >
                  {isActive ? t.shell.certActive : t.shell.certAvailable}
                </span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t.shell.certSoonLabel}
          </DropdownMenuLabel>
          {SOON_CERTS.map((c) => (
            <DropdownMenuItem key={c.code} disabled aria-disabled className="gap-3 opacity-60">
              <span className="w-16 shrink-0 font-mono text-xs font-medium">{c.code}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{lang === "pt" ? c.namePt : c.nameEn}</span>
              <span className="shrink-0 rounded-[6px] border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {t.shell.certSoon}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmação de troca durante sessão (patch §9.5) */}
      <AlertDialog open={pendingCert !== null} onOpenChange={(open) => !open && setPendingCert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.shell.certSwitchTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.shell.certSwitchDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (inProgress) navigate(inProgress.mode === "EXAM" ? "exam" : "results", { attemptId: inProgress.id });
                setPendingCert(null);
              }}
            >
              {t.shell.certSwitchResume}
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-primary text-primary-foreground"
              onClick={() => {
                if (pendingCert) switchCert(pendingCert.slug, pendingCert.code);
                setPendingCert(null);
              }}
            >
              {t.shell.switchCert}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { initials };

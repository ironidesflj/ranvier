"use client";

import { create } from "zustand";

export type View = "home" | "cert" | "study" | "exam" | "results" | "flashcards" | "trails" | "progress" | "guide" | "about" | "settings";

/**
 * Certificação ativa (patch v1.1 §9 — modelo multi-certificação, "uma por
 * vez, de corpo inteiro"). Persistida em localStorage ("ranvier:cert").
 *
 * Nota técnica para o modelo construtor (nota D do patch): o progresso já é
 * separado por certificação POR CONSTRUÇÃO — tentativas e respostas apontam
 * para questões, e cada questão pertence a uma única certificação no banco.
 * Nenhuma consulta agrega certificações. Migração do progresso existente:
 * todo o histórico atual é DBDEA, e DBDEA é o padrão — nada a migrar além
 * do default explícito abaixo.
 */
export const CERT_STORAGE_KEY = "ranvier:cert";
export const DEFAULT_CERT_SLUG = "databricks-data-engineer-associate";

function readStoredCert(): string {
  if (typeof window === "undefined") return DEFAULT_CERT_SLUG;
  try {
    const stored = window.localStorage.getItem(CERT_STORAGE_KEY);
    return stored && stored.trim() ? stored : DEFAULT_CERT_SLUG;
  } catch {
    return DEFAULT_CERT_SLUG;
  }
}

interface AppState {
  view: View;
  attemptId: string | null;
  /** Active certification slug (multi-cert model — patch v1.1 §9). */
  certSlug: string;
  /** Pre-selected domain when navigating from the cert view to study config. */
  studyDomainCode: number | null;
  /** Explicit question ids for "practice missed questions" sessions (review queue). */
  studyQuestionIds: string[] | null;
  /** Trail tranche to AUTO-START in the study view (v1.8.0 — mode TRAIL):
   *  same pattern as studyQuestionIds; cleared right after the attempt starts. */
  studyTrail: { domainCode: number; limit: number } | null;
  navigate: (
    view: View,
    opts?: {
      attemptId?: string;
      domainCode?: number | null;
      questionIds?: string[] | null;
      trail?: { domainCode: number; limit: number } | null;
    }
  ) => void;
  syncFromHash: () => void;
  /** Hydrate the active cert from localStorage (post-mount, avoids SSR mismatch). */
  initCert: () => void;
  /** Switch the active certification (persists; progress is per-cert by design). */
  setCert: (slug: string) => void;
}

function parseHash(): { view: View; attemptId: string | null } {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [path, id] = hash.split("/");
  const map: Record<string, View> = {
    "": "home",
    certificacao: "cert",
    certification: "cert",
    estudar: "study",
    study: "study",
    flashcards: "flashcards",
    trilhas: "trails",
    trails: "trails",
    simulado: "exam",
    exam: "exam",
    resultado: "results",
    results: "results",
    progresso: "progress",
    progress: "progress",
    guia: "guide",
    "study-guide": "guide",
    sobre: "about",
    about: "about",
    ajustes: "settings",
    settings: "settings",
  };
  const view = map[path] ?? "home";
  const needsId: View[] = ["exam", "results"];
  if (needsId.includes(view)) {
    return id ? { view, attemptId: id } : { view: "home", attemptId: null };
  }
  return { view, attemptId: null };
}

function hashFor(view: View, attemptId?: string | null): string {
  const map: Record<View, string> = {
    home: "/",
    cert: "/certificacao",
    study: "/estudar",
    flashcards: "/flashcards",
    trails: "/trilhas",
    exam: `/simulado/${attemptId ?? ""}`,
    results: `/resultado/${attemptId ?? ""}`,
    progress: "/progresso",
    guide: "/guia",
    about: "/sobre",
    settings: "/ajustes",
  };
  return `#${map[view]}`;
}

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  attemptId: null,
  certSlug: DEFAULT_CERT_SLUG,
  studyDomainCode: null,
  studyQuestionIds: null,
  studyTrail: null,
  navigate: (view, opts) => {
    const attemptId = opts?.attemptId ?? null;
    if (typeof window !== "undefined") {
      window.location.hash = hashFor(view, attemptId ?? undefined);
    }
    set({
      view,
      attemptId,
      studyDomainCode: opts?.domainCode !== undefined ? opts.domainCode : null,
      studyQuestionIds: opts?.questionIds !== undefined ? opts.questionIds : null,
      studyTrail: opts?.trail !== undefined ? opts.trail : null,
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  },
  syncFromHash: () => {
    const { view, attemptId } = parseHash();
    set((s) => (s.view === view && s.attemptId === attemptId ? s : { ...s, view, attemptId }));
  },
  initCert: () => {
    const stored = readStoredCert();
    set((s) => (s.certSlug === stored ? s : { ...s, certSlug: stored }));
  },
  setCert: (slug) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CERT_STORAGE_KEY, slug);
      } catch {
        /* sem storage: a escolha vale só nesta sessão — aceitável */
      }
    }
    set((s) => (s.certSlug === slug ? s : { ...s, certSlug: slug }));
  },
}));

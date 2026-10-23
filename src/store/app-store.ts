"use client";

import { create } from "zustand";

export type View = "home" | "cert" | "study" | "exam" | "results" | "progress" | "guide" | "about";

interface AppState {
  view: View;
  attemptId: string | null;
  /** Pre-selected domain when navigating from the cert view to study config. */
  studyDomainCode: number | null;
  /** Explicit question ids for "practice missed questions" sessions (review queue). */
  studyQuestionIds: string[] | null;
  navigate: (view: View, opts?: { attemptId?: string; domainCode?: number | null; questionIds?: string[] | null }) => void;
  syncFromHash: () => void;
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
    exam: `/simulado/${attemptId ?? ""}`,
    results: `/resultado/${attemptId ?? ""}`,
    progress: "/progresso",
    guide: "/guia",
    about: "/sobre",
  };
  return `#${map[view]}`;
}

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  attemptId: null,
  studyDomainCode: null,
  studyQuestionIds: null,
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
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  },
  syncFromHash: () => {
    const { view, attemptId } = parseHash();
    set((s) => (s.view === view && s.attemptId === attemptId ? s : { ...s, view, attemptId }));
  },
}));

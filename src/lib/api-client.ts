import type {
  AttemptDetail,
  AttemptListItem,
  AttemptResult,
  FlashcardDrawResponse,
  FlashcardDrawScope,
  FlashcardGradeResponse,
  FlashcardRevealResponse,
  FlashcardsSummary,
  Lang,
  MeResponse,
  Mode,
  ProgressResponse,
  PublicCertification,
  PublicUser,
  StartAttemptResponse,
  TrailsSummary,
} from "@/lib/types";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    // Network-level failure (offline / unreachable) — surface a typed error so
    // views degrade gracefully; the PWA provider toasts connectivity changes.
    throw new ApiError(0, typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "network");
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return body as T;
}

export const api = {
  catalog: (lang: Lang) => fetchJson<{ certifications: PublicCertification[] }>(`/api/catalog?lang=${lang}`),

  startAttempt: (body: {
    certSlug: string;
    mode: Mode;
    domainCodes?: number[];
    limit?: number;
    questionIds?: string[];
  }) => fetchJson<StartAttemptResponse>("/api/attempts", { method: "POST", body: JSON.stringify(body) }),

  listAttempts: () => fetchJson<{ attempts: AttemptListItem[] }>("/api/attempts"),

  getAttempt: (id: string) => fetchJson<AttemptDetail>(`/api/attempts/${id}`),

  answer: (attemptId: string, questionId: string, selectedIndex: number) =>
    fetchJson<{ stored?: boolean; correct?: boolean; correctIndex?: number; explanationEn?: string; explanationPt?: string; referenceUrl?: string | null; referenceTitle?: string | null }>(
      `/api/attempts/${attemptId}/answer`,
      { method: "POST", body: JSON.stringify({ questionId, selectedIndex }) }
    ),

  submit: (attemptId: string) => fetchJson<AttemptResult>(`/api/attempts/${attemptId}/submit`, { method: "POST" }),

  progress: () => fetchJson<ProgressResponse>("/api/progress"),

  flashcardsSummary: (certSlug: string) =>
    fetchJson<FlashcardsSummary>(`/api/flashcards?certSlug=${encodeURIComponent(certSlug)}`),

  flashcardsDraw: (body: { certSlug: string; domainCodes?: number[]; limit?: number; scope: FlashcardDrawScope }) =>
    fetchJson<FlashcardDrawResponse>("/api/flashcards/draw", { method: "POST", body: JSON.stringify(body) }),

  /* v1.8.0 — reveal (leitura: verso + projeções) e grade (escrita: SM-2
     com a autoavaliação binária) substituem o antigo review. */
  flashcardsReveal: (questionId: string) =>
    fetchJson<FlashcardRevealResponse>("/api/flashcards/reveal", {
      method: "POST",
      body: JSON.stringify({ questionId }),
    }),

  flashcardsGrade: (questionId: string, remembered: boolean) =>
    fetchJson<FlashcardGradeResponse>("/api/flashcards/grade", {
      method: "POST",
      body: JSON.stringify({ questionId, remembered }),
    }),

  /* v1.8.0 — trilhas: progresso derivado por dono. */
  trails: (certSlug: string, lang: Lang) =>
    fetchJson<TrailsSummary>(`/api/trails?certSlug=${encodeURIComponent(certSlug)}&lang=${lang}`),

  me: () => fetchJson<MeResponse>("/api/auth/me"),

  login: (email: string, password: string) =>
    fetchJson<{ user: PublicUser; mergedAttempts: number }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name?: string) =>
    fetchJson<{ user: PublicUser; mergedAttempts: number }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () => fetchJson<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  deleteAccount: () => fetchJson<{ ok: boolean }>("/api/account", { method: "DELETE" }),
};

export { ApiError };

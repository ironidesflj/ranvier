import type {
  AttemptDetail,
  AttemptListItem,
  AttemptResult,
  Lang,
  MeResponse,
  ProgressResponse,
  PublicCertification,
  PublicUser,
  StartAttemptResponse,
} from "@/lib/types";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
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
    mode: "STUDY" | "EXAM";
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

/** Shared client/server DTO types. Never include correctIndex in PUBLIC
 *  question DTOs (Study/Exam keep server-side scoring). ONE deliberate
 *  exception: the flashcard DRAW payload (v1.10.0 — spec docs/sdd/
 *  spec-v1.10.0-flashcards-offline.md §2) embeds the card back so a session
 *  started online can continue offline; the threat model (self-assessed
 *  recall, no server-side correction to protect) is documented there. */

export type Lang = "en" | "pt";
/** Attempt mode. TRAIL (v1.8.0) = sequenced study tranche on one domain —
 *  behaves like STUDY (immediate feedback, no timer); progress is derived. */
export type Mode = "STUDY" | "EXAM" | "TRAIL";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface PublicDomain {
  id: string;
  code: number;
  name: string;
  namePt: string;
  weightPercent: number;
  questionCount: number;
  outline: string[]; // localized bullets
}

export interface PublicCertification {
  id: string;
  slug: string;
  vendor: string;
  name: string;
  shortName: string;
  versionLabel: string;
  durationMin: number;
  questionCount: number;
  passingScore: number;
  passingScoreIsOfficial: boolean;
  fee: string;
  languages: string;
  delivery: string;
  officialUrl: string;
  guideUrl: string;
  trainingUrl: string;
  description: string; // localized
  codeNote: string; // localized
  domains: PublicDomain[];
  totalQuestions: number;
}

export interface PublicQuestion {
  id: string;
  /** Stable public ID (RAN-EXAM-SEQ) — the Noos ecosystem seam: anchors the question's discussion page on the hub. */
  publicId: string;
  domainCode: number;
  domainName: string;
  domainNamePt: string;
  difficulty: Difficulty;
  stem: string;
  options: string[];
}

export interface StartAttemptResponse {
  attemptId: string;
  mode: Mode;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  durationMin: number | null; // EXAM only (official duration)
  certification: { slug: string; name: string; shortName: string; passingScore: number };
  questions: PublicQuestion[];
}

export interface AnswerFeedback {
  correct: boolean;
  correctIndex: number;
  explanation: string; // localized server-side is complex; client picks from En/Pt
  explanationEn: string;
  explanationPt: string;
  referenceUrl: string | null;
  referenceTitle: string | null;
}

export interface DomainResult {
  code: number;
  name: string;
  namePt: string;
  weightPercent: number;
  correct: number;
  total: number;
}

export interface AttemptResult {
  attemptId: string;
  mode: Mode;
  status: "COMPLETED";
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  passingScore: number;
  durationSec: number;
  completedAt: string;
  byDomain: DomainResult[];
}

export interface ReviewQuestion extends PublicQuestion {
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanationEn: string;
  explanationPt: string;
  referenceUrl: string | null;
  referenceTitle: string | null;
}

export interface AttemptListItem {
  id: string;
  mode: Mode;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  total: number | null;
  percent: number | null;
  passed: boolean | null;
  durationSec: number | null;
  certShortName: string;
}

export interface AttemptDetail {
  attemptId: string;
  mode: Mode;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  durationMin: number | null;
  /** Certification short name (e.g. "DBDEA") — session bars (patch v1.1 §10). */
  certShortName: string;
  result: AttemptResult | null;
  questions: PublicQuestion[] | ReviewQuestion[];
  answers: Record<string, number | null>; // questionId -> selectedIndex
}

export interface ProgressDomain {
  code: number;
  name: string;
  namePt: string;
  weightPercent: number;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface ProgressResponse {
  totals: {
    attemptsCompleted: number;
    examsCompleted: number;
    studySessions: number;
    totalAnswered: number;
    totalCorrect: number;
    accuracy: number;
    bestExamPercent: number | null;
    lastActivityAt: string | null;
    reviewQueueCount: number;
  };
  byDomain: ProgressDomain[];
  reviewQuestionIds: string[];
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
}

export interface MeResponse {
  user: PublicUser | null;
}

/* ------------------------------------------------------------------ */
/* Flashcards (v1.7.0 → V2 em v1.8.0 — spec docs/sdd/                  */
/* spec-v1.8.0-trilhas-flashcards.md: evocação na frente, julgamento   */
/* binário do aluno, reveal/grade divididos)                           */
/* ------------------------------------------------------------------ */

export type FlashcardDrawScope = "mixed" | "due" | "new";

export interface FlashcardsSummary {
  certSlug: string;
  /** Cards with state and dueAt <= now. */
  dueCount: number;
  /** Enabled questions with no state for this owner yet. */
  newCount: number;
  /** Enabled questions for the certification. */
  totalCards: number;
  /** Cards with intervalDays >= 21 (stable-ish memory). */
  matureCount: number;
}

/** Drawn card (v1.10.0 — offline sessions): PublicQuestion + the front-layout
 *  flag (server-computed) + the FULL card back — correctIndex, bilingual
 *  explanations, reference and SRS projections — so the client turns the card
 *  LOCALLY (one code path online and offline; /reveal stops being called by
 *  the app). Statement-selection questions (spec §3.1) carry their options on
 *  the FRONT; the flag is decided by a curated key list server-side. */
export interface FlashcardDrawnCard extends PublicQuestion {
  frontIncludesOptions: boolean;
  correctIndex: number;
  explanationEn: string;
  explanationPt: string;
  referenceUrl: string | null;
  referenceTitle: string | null;
  /** Interval the card would get on each judgment — SM-2 over the owner's
   *  state at draw time (same srs.ts math, computed without persisting). */
  projection: {
    wrong: { intervalDays: number };
    right: { intervalDays: number };
  };
}

export interface FlashcardDrawResponse {
  cards: FlashcardDrawnCard[];
  drewCount: number;
}

/** Reveal (read-only, DEPRECATED for the app since v1.10.0): the card back +
 *  SRS projections. The endpoint stays live as published API (removal only
 *  in a future version with notice); the app now turns cards locally from the
 *  draw payload. Kept in sync with FlashcardDrawnCard's embedded back. */
export interface FlashcardRevealResponse {
  correctIndex: number;
  explanationEn: string;
  explanationPt: string;
  referenceUrl: string | null;
  referenceTitle: string | null;
  /** intervalDays the card would get on each judgment (same srs.ts math). */
  projection: {
    wrong: { intervalDays: number };
    right: { intervalDays: number };
  };
}

/** Grade (write): apply SM-2 with the student's self-assessment. */
export interface FlashcardGradeResponse {
  intervalDays: number;
  reps: number;
  lapses: number;
  nextDueAt: string;
}

/** Offline sync (v1.10.0 — spec §3): replay of locally queued judgments.
 *  Events apply IN ORDER as reviews (same gradeFlashcard semantics); 200 OK
 *  clears the client queue. `certSlug` (optional) returns a fresh summary so
 *  the client can invalidate/refetch in one round trip. */
export interface FlashcardSyncEvent {
  questionId: string;
  remembered: boolean;
  /** ISO timestamp of when the student judged the card offline. */
  occurredAt: string;
}

export interface FlashcardSyncResponse {
  /** Events applied (each one = one SM-2 review). */
  applied: number;
  /** Events skipped (question missing/disabled since the queue was built). */
  skipped: number;
  summary: FlashcardsSummary | null;
}

/* ------------------------------------------------------------------ */
/* Trilhas (v1.8.0 — spec docs/sdd/spec-v1.8.0-trilhas-flashcards.md)   */
/* ------------------------------------------------------------------ */

export interface TrailInfo {
  code: number;
  /** Localized domain name (lang param). */
  name: string;
  weightPercent: number;
  /** Official outline bullets, localized. */
  outline: string[];
  /** Enabled questions in the domain. */
  total: number;
  /** Questions this owner answered correctly at least once (any mode). */
  completed: number;
  state: "not_started" | "in_progress" | "complete";
  /** Stable seed key of the next non-completed question (informational). */
  nextUp: string | null;
}

export interface TrailsSummary {
  certSlug: string;
  /** Weighted by the official blueprint domain weights. */
  overallPercent: number;
  trails: TrailInfo[];
}

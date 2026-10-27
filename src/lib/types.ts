/** Shared client/server DTO types. Never include correctIndex in public question DTOs. */

export type Lang = "en" | "pt";
export type Mode = "STUDY" | "EXAM";
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

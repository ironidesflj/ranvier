import { db } from "@/lib/db";
import { ownerWhere } from "@/lib/session";
import type {
  AnswerFeedback,
  AttemptDetail,
  AttemptListItem,
  AttemptResult,
  DomainResult,
  Lang,
  Mode,
  ProgressResponse,
  PublicCertification,
  PublicQuestion,
  ReviewQuestion,
  StartAttemptResponse,
} from "@/lib/types";

/**
 * Attempt service — ALL grading happens here, server-side.
 * The correct answer index is only ever returned:
 *  - in STUDY mode, after the user answered that specific question;
 *  - after an attempt is COMPLETED (review).
 */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Largest-remainder distribution of `total` questions across domains by official weight. */
function stratifiedCounts(domains: { code: number; weightPercent: number }[], total: number): Map<number, number> {
  const raw = domains.map((d) => ({ code: d.code, exact: (d.weightPercent * total) / 100 }));
  const rows = raw.map((r) => ({ code: r.code, n: Math.floor(r.exact), rem: r.exact - Math.floor(r.exact) }));
  let assigned = rows.reduce((a, b) => a + b.n, 0);
  const order = [...rows].sort((a, b) => b.rem - a.rem);
  let i = 0;
  while (assigned < total && order.length > 0) {
    order[i % order.length].n += 1;
    assigned += 1;
    i += 1;
  }
  return new Map(rows.map((r) => [r.code, r.n]));
}

class ServiceError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export async function getCatalog(lang: Lang): Promise<PublicCertification[]> {
  const certs = await db.certification.findMany({
    orderBy: { createdAt: "asc" },
    include: { domains: { orderBy: { orderIndex: "asc" }, include: { _count: { select: { questions: { where: { enabled: true } } } } } } },
  });
  return certs.map((c) => ({
    id: c.id,
    slug: c.slug,
    vendor: c.vendor,
    name: c.name,
    shortName: c.shortName,
    versionLabel: c.versionLabel,
    durationMin: c.durationMin,
    questionCount: c.questionCount,
    passingScore: c.passingScore,
    passingScoreIsOfficial: false, // Databricks does not publish an official cut score
    fee: c.fee,
    languages: c.languages,
    delivery: c.delivery,
    officialUrl: c.officialUrl,
    guideUrl: c.guideUrl,
    trainingUrl: c.trainingUrl,
    description: lang === "pt" ? c.descriptionPt : c.descriptionEn,
    codeNote: lang === "pt" ? c.codeNotePt : c.codeNoteEn,
    domains: c.domains.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      namePt: d.namePt,
      weightPercent: d.weightPercent,
      questionCount: d._count.questions,
      outline: JSON.parse(lang === "pt" ? d.outlinePt : d.outlineEn) as string[],
    })),
    totalQuestions: c.domains.reduce((a, d) => a + d._count.questions, 0),
  }));
}

// ---------------------------------------------------------------------------
// Start attempt
// ---------------------------------------------------------------------------

interface StartArgs {
  certSlug: string;
  mode: Mode;
  domainCodes?: number[];
  limit?: number;
  questionIds?: string[];
}

export async function startAttempt(args: StartArgs): Promise<StartAttemptResponse> {
  const cert = await db.certification.findUnique({
    where: { slug: args.certSlug },
    include: { domains: { orderBy: { orderIndex: "asc" }, include: { questions: { where: { enabled: true } } } } },
  });
  if (!cert) throw new ServiceError(404, "Certification not found");

  const owner = await ownerWhere();
  let selectedIds: string[];

  if (args.questionIds?.length) {
    // Review-queue practice: explicit question set (STUDY only)
    if (args.mode !== "STUDY") throw new ServiceError(400, "Custom question sets are only allowed in study mode");
    const ids = [...new Set(args.questionIds)].slice(0, 50);
    const valid = await db.question.findMany({
      where: { id: { in: ids }, enabled: true, domain: { certificationId: cert.id } },
      select: { id: true },
    });
    const validSet = new Set(valid.map((v) => v.id));
    selectedIds = ids.filter((id) => validSet.has(id));
    if (selectedIds.length === 0) throw new ServiceError(400, "No valid questions for this certification");
  } else if (args.mode === "EXAM") {
    // Stratified sample mirroring the official section weights
    const counts = stratifiedCounts(cert.domains, cert.questionCount);
    const picked: string[] = [];
    for (const domain of cert.domains) {
      const n = counts.get(domain.code) ?? 0;
      const pool = shuffle(domain.questions.map((q) => q.id));
      picked.push(...pool.slice(0, n));
    }
    // Top up if any domain ran short (defensive; bank is sized >= 2x)
    if (picked.length < cert.questionCount) {
      const chosen = new Set(picked);
      const rest = shuffle(cert.domains.flatMap((d) => d.questions.map((q) => q.id)).filter((id) => !chosen.has(id)));
      picked.push(...rest.slice(0, cert.questionCount - picked.length));
    }
    selectedIds = shuffle(picked);
  } else {
    // STUDY: filtered random sample
    const domains = args.domainCodes?.length
      ? cert.domains.filter((d) => args.domainCodes!.includes(d.code))
      : cert.domains;
    const pool = domains.flatMap((d) => d.questions.map((q) => q.id));
    if (pool.length === 0) throw new ServiceError(400, "No questions available for the selected domains");
    const limit = Math.min(Math.max(args.limit ?? 10, 1), 50, pool.length);
    selectedIds = shuffle(pool).slice(0, limit);
  }

  const attempt = await db.attempt.create({
    data: {
      mode: args.mode,
      status: "IN_PROGRESS",
      questionIds: JSON.stringify(selectedIds),
      certificationId: cert.id,
      ...(owner.userId !== null ? { userId: owner.userId } : { anonId: owner.anonId }),
    },
  });

  const questions = await db.question.findMany({
    where: { id: { in: selectedIds } },
    include: { domain: true },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));
  const publicQuestions = selectedIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map(toPublicQuestion);

  return {
    attemptId: attempt.id,
    mode: attempt.mode as Mode,
    status: "IN_PROGRESS",
    startedAt: attempt.startedAt.toISOString(),
    durationMin: args.mode === "EXAM" ? cert.durationMin : null,
    certification: { slug: cert.slug, name: cert.name, shortName: cert.shortName, passingScore: cert.passingScore },
    questions: publicQuestions,
  };
}

/** Canonical public question DTO mapper (shared with the flashcards service —
 *  NEVER includes correctIndex; grading is server-side only). */
export function toPublicQuestion(q: { id: string; publicId: string; stem: string; options: string; difficulty: string; domain: { code: number; name: string; namePt: string } }): PublicQuestion {
  return {
    id: q.id,
    publicId: q.publicId,
    domainCode: q.domain.code,
    domainName: q.domain.name,
    domainNamePt: q.domain.namePt,
    difficulty: q.difficulty as PublicQuestion["difficulty"],
    stem: q.stem,
    options: JSON.parse(q.options) as string[],
  };
}

// ---------------------------------------------------------------------------
// Answer (STUDY = immediate feedback; EXAM = store only)
// ---------------------------------------------------------------------------

export async function answerQuestion(attemptId: string, questionId: string, selectedIndex: number): Promise<AnswerFeedback | { stored: true }> {
  const attempt = await getOwnedAttempt(attemptId);
  const ids = JSON.parse(attempt.questionIds) as string[];
  if (!ids.includes(questionId)) throw new ServiceError(400, "Question is not part of this attempt");
  if (attempt.status === "COMPLETED") throw new ServiceError(400, "Attempt already submitted");

  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question) throw new ServiceError(404, "Question not found");

  const correct = selectedIndex === question.correctIndex;
  const existing = await db.attemptAnswer.findUnique({ where: { attemptId_questionId: { attemptId, questionId } } });
  if (existing) {
    await db.attemptAnswer.update({
      where: { id: existing.id },
      data: { selectedIndex, correct, answeredAt: new Date() },
    });
  } else {
    await db.attemptAnswer.create({ data: { attemptId, questionId, selectedIndex, correct } });
  }

  if (attempt.mode === "EXAM") return { stored: true };

  return {
    correct,
    correctIndex: question.correctIndex,
    explanation: question.explanationEn,
    explanationEn: question.explanationEn,
    explanationPt: question.explanationPt,
    referenceUrl: question.referenceUrl,
    referenceTitle: question.referenceTitle,
  };
}

// ---------------------------------------------------------------------------
// Submit + grading
// ---------------------------------------------------------------------------

export async function submitAttempt(attemptId: string): Promise<AttemptResult> {
  const attempt = await getOwnedAttempt(attemptId);
  const cert = await db.certification.findUnique({ where: { id: attempt.certificationId } });
  if (!cert) throw new ServiceError(404, "Certification not found");

  if (attempt.status === "COMPLETED") {
    return buildResult(attempt.id);
  }

  const ids = JSON.parse(attempt.questionIds) as string[];
  const questions = await db.question.findMany({
    where: { id: { in: ids } },
    include: { domain: true },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));
  const answers = await db.attemptAnswer.findMany({ where: { attemptId } });
  const answerByQ = new Map(answers.map((a) => [a.questionId, a]));

  // Grade every question; unanswered counts as incorrect (official scoring behavior)
  for (const id of ids) {
    const q = byId.get(id);
    if (!q) continue;
    const a = answerByQ.get(id);
    const correct = a?.selectedIndex === q.correctIndex;
    if (a) {
      await db.attemptAnswer.update({ where: { id: a.id }, data: { correct } });
    } else {
      await db.attemptAnswer.create({ data: { attemptId, questionId: id, selectedIndex: null, correct: false } });
    }
  }

  // Recompute from DB so unanswered rows (created as correct=false above) count exactly:
  const finalAnswers = await db.attemptAnswer.findMany({ where: { attemptId } });
  const finalCorrect = finalAnswers.filter((a) => a.correct === true).length;

  const total = ids.length;
  const percent = total > 0 ? Math.round((finalCorrect / total) * 1000) / 10 : 0;
  const passed = percent >= cert.passingScore;

  const elapsedSec = Math.max(1, Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000));
  const capSec = attempt.mode === "EXAM" ? cert.durationMin * 60 + 120 : 6 * 3600;
  const durationSec = Math.min(elapsedSec, capSec);

  await db.attempt.update({
    where: { id: attempt.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      score: finalCorrect,
      total,
      percent,
      passed,
      durationSec,
    },
  });

  return buildResult(attempt.id);
}

async function buildResult(attemptId: string): Promise<AttemptResult> {
  const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new ServiceError(404, "Attempt not found");
  const cert = await db.certification.findUnique({ where: { id: attempt.certificationId } });
  if (!cert) throw new ServiceError(404, "Certification not found");

  const answers = await db.attemptAnswer.findMany({
    where: { attemptId },
    include: { question: { include: { domain: true } } },
  });
  const ids = JSON.parse(attempt.questionIds) as string[];
  const total = ids.length;

  const domainMap = new Map<number, DomainResult>();
  for (const a of answers) {
    const d = a.question.domain;
    const row =
      domainMap.get(d.code) ??
      { code: d.code, name: d.name, namePt: d.namePt, weightPercent: d.weightPercent, correct: 0, total: 0 };
    row.total += 1;
    if (a.correct) row.correct += 1;
    domainMap.set(d.code, row);
  }
  const byDomain = [...domainMap.values()].sort((a, b) => a.code - b.code);

  return {
    attemptId: attempt.id,
    mode: attempt.mode as Mode,
    status: "COMPLETED",
    score: attempt.score ?? 0,
    total: attempt.total ?? total,
    percent: attempt.percent ?? 0,
    passed: attempt.passed ?? false,
    passingScore: cert.passingScore,
    durationSec: attempt.durationSec ?? 0,
    completedAt: (attempt.completedAt ?? new Date()).toISOString(),
    byDomain,
  };
}

// ---------------------------------------------------------------------------
// Detail / list / progress
// ---------------------------------------------------------------------------

export async function getAttemptDetail(attemptId: string): Promise<AttemptDetail> {
  let attempt = await getOwnedAttempt(attemptId);
  const cert = await db.certification.findUnique({ where: { id: attempt.certificationId } });
  if (!cert) throw new ServiceError(404, "Certification not found");

  // Server-side enforcement of the exam timer: expired in-progress exams are auto-submitted.
  if (
    attempt.mode === "EXAM" &&
    attempt.status === "IN_PROGRESS" &&
    Date.now() > attempt.startedAt.getTime() + (cert.durationMin + 2) * 60_000
  ) {
    await submitAttempt(attemptId);
    attempt = await getOwnedAttempt(attemptId);
  }

  const ids = JSON.parse(attempt.questionIds) as string[];
  const questions = await db.question.findMany({ where: { id: { in: ids } }, include: { domain: true } });
  const byId = new Map(questions.map((q) => [q.id, q]));
  const answers = await db.attemptAnswer.findMany({ where: { attemptId } });
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const completed = attempt.status === "COMPLETED";

  const questionDtos: PublicQuestion[] | ReviewQuestion[] = ids.map((id) => {
    const q = byId.get(id);
    if (!q) return null;
    const base = toPublicQuestion(q);
    const a = answerMap.get(id);
    if (!completed) return base;
    return {
      ...base,
      selectedIndex: a?.selectedIndex ?? null,
      correctIndex: q.correctIndex,
      correct: a?.correct ?? false,
      explanationEn: q.explanationEn,
      explanationPt: q.explanationPt,
      referenceUrl: q.referenceUrl,
      referenceTitle: q.referenceTitle,
    } satisfies ReviewQuestion;
  }).filter((x): x is PublicQuestion | ReviewQuestion => x !== null);

  const answersRecord: Record<string, number | null> = {};
  for (const id of ids) answersRecord[id] = answerMap.get(id)?.selectedIndex ?? null;

  return {
    attemptId: attempt.id,
    mode: attempt.mode as Mode,
    status: completed ? "COMPLETED" : "IN_PROGRESS",
    startedAt: attempt.startedAt.toISOString(),
    durationMin: attempt.mode === "EXAM" ? cert.durationMin : null,
    certShortName: cert.shortName,
    result: completed ? await buildResult(attempt.id) : null,
    questions: questionDtos,
    answers: answersRecord,
  };
}

export async function listAttempts(): Promise<AttemptListItem[]> {
  const where = await ownerWhere();
  const attempts = await db.attempt.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: 20,
    include: { certification: { select: { shortName: true } } },
  });
  return attempts.map((a) => ({
    id: a.id,
    mode: a.mode as Mode,
    status: a.status as "IN_PROGRESS" | "COMPLETED",
    startedAt: a.startedAt.toISOString(),
    completedAt: a.completedAt?.toISOString() ?? null,
    score: a.score,
    total: a.total,
    percent: a.percent,
    passed: a.passed,
    durationSec: a.durationSec,
    certShortName: a.certification.shortName,
  }));
}

export async function getProgress(): Promise<ProgressResponse> {
  const where = await ownerWhere();
  const attempts = await db.attempt.findMany({
    where,
    select: { id: true, mode: true, status: true, percent: true, startedAt: true },
    orderBy: { startedAt: "desc" },
    take: 200,
  });
  const completed = attempts.filter((a) => a.status === "COMPLETED");
  const exams = completed.filter((a) => a.mode === "EXAM");
  const studies = completed.filter((a) => a.mode === "STUDY");

  const answers = await db.attemptAnswer.findMany({
    where: { attempt: where },
    include: { question: { include: { domain: { select: { code: true, name: true, namePt: true, weightPercent: true } } } } },
    take: 5000,
  });

  const domainMap = new Map<number, { code: number; name: string; namePt: string; weightPercent: number; answered: number; correct: number }>();
  const wrongIds = new Set<string>();
  for (const a of answers) {
    const d = a.question.domain;
    const row = domainMap.get(d.code) ?? { code: d.code, name: d.name, namePt: d.namePt, weightPercent: d.weightPercent, answered: 0, correct: 0 };
    row.answered += 1;
    if (a.correct) row.correct += 1;
    else wrongIds.add(a.questionId);
    domainMap.set(d.code, row);
  }

  const totalAnswered = answers.length;
  const totalCorrect = answers.filter((a) => a.correct).length;

  const reviewQuestionIds = wrongIds.size > 0 ? shuffle([...wrongIds]).slice(0, 50) : [];

  return {
    totals: {
      attemptsCompleted: completed.length,
      examsCompleted: exams.length,
      studySessions: studies.length,
      totalAnswered,
      totalCorrect,
      accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 1000) / 10 : 0,
      bestExamPercent: exams.length > 0 ? Math.max(...exams.map((e) => e.percent ?? 0)) : null,
      lastActivityAt: attempts[0]?.startedAt.toISOString() ?? null,
      reviewQueueCount: wrongIds.size,
    },
    byDomain: [...domainMap.values()]
      .map((d) => ({ ...d, accuracy: d.answered > 0 ? Math.round((d.correct / d.answered) * 1000) / 10 : 0 }))
      .sort((a, b) => a.code - b.code),
    reviewQuestionIds,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getOwnedAttempt(attemptId: string) {
  const where = await ownerWhere();
  const attempt = await db.attempt.findFirst({ where: { id: attemptId, ...where } });
  if (!attempt) throw new ServiceError(404, "Attempt not found");
  return attempt;
}

export { ServiceError };

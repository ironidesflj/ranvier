import { db } from "@/lib/db";
import { ownerWhere } from "@/lib/session";
import { toPublicQuestion, ServiceError } from "@/lib/attempt-service";
import { applyReview, SRS_INITIAL_STATE, type SrsState } from "@/lib/srs";
import type { FlashcardDrawScope, FlashcardsSummary, FlashcardReviewResponse, PublicQuestion } from "@/lib/types";

/**
 * Flashcard service (spec v1.7.0 — docs/sdd/spec-v1.7.0-flashcards.md).
 *
 * Um cartão = uma questão do banco. O ESTADO de repetição espaçada é por
 * dono (userId XOR anonId — mesmo padrão de Attempt); a CORREÇÃO continua
 * 100% server-side: correctIndex só viaja na resposta da revisão, nunca no
 * draw (reuso do toPublicQuestion, contrato de segurança idêntico).
 *
 * Unicidade dono+questão é garantida AQUI (findFirst → update/create), como
 * o AttemptAnswer faz — índice único composto com NULL não é portável entre
 * SQLite e Postgres no Prisma.
 */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Summary (Home CTA + Progress block)
// ---------------------------------------------------------------------------

export async function getFlashcardsSummary(certSlug: string): Promise<FlashcardsSummary> {
  const cert = await db.certification.findUnique({
    where: { slug: certSlug },
    include: { domains: { include: { _count: { select: { questions: { where: { enabled: true } } } } } } },
  });
  if (!cert) throw new ServiceError(404, "Certification not found");

  const totalCards = cert.domains.reduce((a, d) => a + d._count.questions, 0);
  const where = await ownerWhere();
  const now = new Date();

  const [dueRows, seenRows, matureRows] = await Promise.all([
    db.flashcardState.count({
      where: { ...where, dueAt: { lte: now }, question: { enabled: true, domain: { certificationId: cert.id } } },
    }),
    db.flashcardState.count({
      where: { ...where, question: { enabled: true, domain: { certificationId: cert.id } } },
    }),
    db.flashcardState.count({
      where: { ...where, intervalDays: { gte: 21 }, question: { enabled: true, domain: { certificationId: cert.id } } },
    }),
  ]);

  return {
    certSlug: cert.slug,
    dueCount: dueRows,
    newCount: Math.max(0, totalCards - seenRows),
    totalCards,
    matureCount: matureRows,
  };
}

// ---------------------------------------------------------------------------
// Draw (session queue)
// ---------------------------------------------------------------------------

export interface DrawArgs {
  certSlug: string;
  domainCodes?: number[];
  limit?: number;
  scope: FlashcardDrawScope;
}

export async function drawFlashcards(args: DrawArgs): Promise<{ cards: PublicQuestion[]; drewCount: number }> {
  const cert = await db.certification.findUnique({
    where: { slug: args.certSlug },
    include: { domains: true },
  });
  if (!cert) throw new ServiceError(404, "Certification not found");

  const where = await ownerWhere();
  const now = new Date();
  const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);

  const domainFilter = args.domainCodes?.length
    ? { domain: { certificationId: cert.id, code: { in: args.domainCodes } } }
    : { domain: { certificationId: cert.id } };

  // Due cards (state exists, vencidas) — mais atrasadas primeiro.
  const dueStates = await db.flashcardState.findMany({
    where: { ...where, dueAt: { lte: now }, question: { enabled: true, ...domainFilter } },
    orderBy: [{ dueAt: "asc" }],
    select: { questionId: true },
    take: limit,
  });

  // New cards (sem estado para este dono) — aleatórias.
  const seenIds = await db.flashcardState.findMany({
    where: { ...where, question: { enabled: true, ...domainFilter } },
    select: { questionId: true },
  });
  const seenSet = new Set(seenIds.map((s) => s.questionId));
  const freshQuestions = await db.question.findMany({
    where: {
      enabled: true,
      ...(seenSet.size > 0 ? { id: { notIn: [...seenSet] } } : {}),
      ...domainFilter,
    },
    select: { id: true },
    take: 2 * limit, // pool maior para embaralhar
  });

  const dueIds = dueStates.map((s) => s.questionId);
  const newIds = shuffle(freshQuestions.map((q) => q.id));

  let queueIds: string[];
  if (args.scope === "due") {
    queueIds = shuffle(dueIds).slice(0, limit);
  } else if (args.scope === "new") {
    queueIds = newIds.slice(0, limit);
  } else {
    // mixed: devidas primeiro, novas completando o limite, embaralhadas em cada grupo
    queueIds = [...shuffle(dueIds), ...newIds].slice(0, limit);
  }
  if (queueIds.length === 0) {
    return { cards: [], drewCount: 0 };
  }

  const questions = await db.question.findMany({
    where: { id: { in: queueIds }, enabled: true },
    include: { domain: true },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));
  const cards = queueIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map(toPublicQuestion);

  return { cards, drewCount: cards.length };
}

// ---------------------------------------------------------------------------
// Review (grade + apply SRS)
// ---------------------------------------------------------------------------

export async function reviewFlashcard(questionId: string, selectedIndex: number | null): Promise<FlashcardReviewResponse> {
  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question || !question.enabled) throw new ServiceError(404, "Question not found");

  const owner = await ownerWhere();
  const now = new Date();

  /* Correção server-side — selectedIndex null = "pular" = não lembrou
     (mesma semântica de questão em branco do simulado). */
  const remembered = selectedIndex !== null && selectedIndex === question.correctIndex;

  const existing = await db.flashcardState.findFirst({ where: { ...owner, questionId } });
  const prevState: SrsState = existing
    ? { ease: existing.ease, intervalDays: existing.intervalDays, reps: existing.reps, lapses: existing.lapses }
    : SRS_INITIAL_STATE;
  const next = applyReview(prevState, remembered, now);

  if (existing) {
    await db.flashcardState.update({
      where: { id: existing.id },
      data: {
        ease: next.ease,
        intervalDays: next.intervalDays,
        reps: next.reps,
        lapses: next.lapses,
        dueAt: next.dueAt,
        lastReviewedAt: now,
      },
    });
  } else {
    await db.flashcardState.create({
      data: {
        // dono — userId XOR anonId (mesmo padrão do Attempt)
        ...(owner.userId !== null ? { userId: owner.userId } : { anonId: owner.anonId }),
        questionId,
        ease: next.ease,
        intervalDays: next.intervalDays,
        reps: next.reps,
        lapses: next.lapses,
        dueAt: next.dueAt,
        lastReviewedAt: now,
      },
    });
  }

  return {
    correct: remembered,
    correctIndex: question.correctIndex,
    explanationEn: question.explanationEn,
    explanationPt: question.explanationPt,
    referenceUrl: question.referenceUrl,
    referenceTitle: question.referenceTitle,
    intervalDays: next.intervalDays,
    reps: next.reps,
    lapses: next.lapses,
    nextDueAt: next.dueAt.toISOString(),
  };
}

import { db } from "@/lib/db";
import { ownerWhere } from "@/lib/session";
import { toPublicQuestion, ServiceError } from "@/lib/attempt-service";
import { applyReview, SRS_INITIAL_STATE, type SrsState } from "@/lib/srs";
import type {
  FlashcardDrawScope,
  FlashcardDrawResponse,
  FlashcardDrawnCard,
  FlashcardGradeResponse,
  FlashcardRevealResponse,
  FlashcardsSummary,
} from "@/lib/types";

/**
 * Flashcard service (v1.7.0 → V2 na v1.8.0 — docs/sdd/
 * spec-v1.8.0-trilhas-flashcards.md §§3–4).
 *
 * Um cartão = uma questão do banco. O ESTADO de repetição espaçada é por
 * dono (userId XOR anonId — mesmo padrão de Attempt); a CORREÇÃO continua
 * 100% server-side: correctIndex só viaja no REVEAL (depois de o aluno virar
 * o cartão), nunca no draw (reuso do toPublicQuestion).
 *
 * V2 — fluxo em dois passos:
 *   draw → [frente: evocação] → REVEAL (leitura: verso + projeções SRS) →
 *   GRADE (escrita: autoavaliação binária do aluno aplica o SM-2).
 * Virar e abandonar sem julgar NÃO registra revisão (o cartão segue devido).
 *
 * Unicidade dono+questão é garantida AQUI (findFirst → update/create), como
 * o AttemptAnswer faz — índice único composto com NULL não é portável entre
 * SQLite e Postgres no Prisma.
 */

/**
 * Statement-selection (spec §3.1): nestas 18 questões as alternativas SÃO o
 * conteúdo do prompt ("Which statement is correct?" — afirmações a avaliar),
 * então a FRENTE do cartão precisa mostrá-las como parte do enunciado
 * (lista não-clicável). Lista curada por chave estável do seed — zero
 * mudanças no banco/manifesto. O draw computa o flag `frontIncludesOptions`
 * AQUI no servidor; o cliente nunca decide.
 */
export const OPTION_DEPENDENT_KEYS: ReadonlySet<string> = new Set([
  "S1-006",
  "S1-009",
  "S1-011",
  "S1-012",
  "S2-024",
  "S2-035",
  "S3-018",
  "S3-019",
  "S3-024",
  "S3-052",
  "S3-058",
  "S4-010",
  "S7-002",
  "S7-008",
  "S7-013",
  "S7-017",
  "S7-022",
  "S7-031",
]);

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

export async function drawFlashcards(args: DrawArgs): Promise<FlashcardDrawResponse> {
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
  const cards: FlashcardDrawnCard[] = queueIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => ({
      ...toPublicQuestion(q),
      frontIncludesOptions: OPTION_DEPENDENT_KEYS.has(q.key),
    }));

  return { cards, drewCount: cards.length };
}

// ---------------------------------------------------------------------------
// Reveal (read-only: card back + SRS projections) — spec v1.8.0 §4
// ---------------------------------------------------------------------------

export async function revealFlashcard(questionId: string): Promise<FlashcardRevealResponse> {
  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question || !question.enabled) throw new ServiceError(404, "Question not found");

  const owner = await ownerWhere();
  const existing = await db.flashcardState.findFirst({ where: { ...owner, questionId } });
  const prev: SrsState = existing
    ? { ease: existing.ease, intervalDays: existing.intervalDays, reps: existing.reps, lapses: existing.lapses }
    : SRS_INITIAL_STATE;

  /* Projeções: a MESMA matemática de srs.ts, aplicada sem persistir —
     função pura chamada 2×. O aluno vê o efeito de cada julgamento antes
     de decidir (padrão Anki, fonte única de verdade). */
  const wrong = applyReview(prev, false);
  const right = applyReview(prev, true);

  return {
    correctIndex: question.correctIndex,
    explanationEn: question.explanationEn,
    explanationPt: question.explanationPt,
    referenceUrl: question.referenceUrl,
    referenceTitle: question.referenceTitle,
    projection: {
      wrong: { intervalDays: wrong.intervalDays },
      right: { intervalDays: right.intervalDays },
    },
  };
}

// ---------------------------------------------------------------------------
// Grade (write: apply SM-2 with the student's self-assessment)
// ---------------------------------------------------------------------------

export async function gradeFlashcard(questionId: string, remembered: boolean): Promise<FlashcardGradeResponse> {
  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question || !question.enabled) throw new ServiceError(404, "Question not found");

  const owner = await ownerWhere();
  const now = new Date();

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
    intervalDays: next.intervalDays,
    reps: next.reps,
    lapses: next.lapses,
    nextDueAt: next.dueAt.toISOString(),
  };
}

import { db } from "@/lib/db";
import { ownerWhere } from "@/lib/session";
import { toPublicQuestion, ServiceError } from "@/lib/attempt-service";
import { applyReview, SRS_INITIAL_STATE, type SrsReviewResult, type SrsState } from "@/lib/srs";
import type {
  FlashcardDrawScope,
  FlashcardDrawResponse,
  FlashcardDrawnCard,
  FlashcardGradeResponse,
  FlashcardRevealResponse,
  FlashcardSyncEvent,
  FlashcardSyncResponse,
  FlashcardsSummary,
} from "@/lib/types";

/**
 * Flashcard service (v1.7.0 → V2 na v1.8.0 → offline na v1.10.0 — docs/sdd/
 * spec-v1.8.0-trilhas-flashcards.md §§3–4 + spec-v1.10.0-flashcards-offline.md).
 *
 * Um cartão = uma questão do banco. O ESTADO de repetição espaçada é por
 * dono (userId XOR anonId — mesmo padrão de Attempt).
 *
 * v1.10.0 — o DRAW devolve a carta COMPLETA (verso embutido: gabarito,
 * explicações, fonte e projeções SRS) para que a sessão iniciada online
 * CONTINUE OFFLINE. Modelo de ameaça (spec §2): a avaliação de flashcard é
 * AUTO-DECLARADA — não existe correção server-side a proteger; quem inspecionar
 * o devtools para ver o gabarito antes de virar sabotageia o próprio treino
 * de evocação. Estudar/Exame permanecem 100% server-side (índice canônico,
 * nunca pré-buscado). O julgamento offline acumula na fila local do cliente e
 * sincroniza em lote (/sync); online, /grade continua valendo.
 *
 * Unicidade dono+questão é garantida AQUI (estado determinístico
 * owner+question com convergência em conflito único), índice único composto
 * com NULL não é portável entre SQLite e Postgres no Prisma.
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

function stateId(owner: { userId?: string | null; anonId?: string | null }, questionId: string): string {
  const ownerId = owner.userId ? `user_${owner.userId}` : `anon_${owner.anonId}`;
  return `fc_${ownerId}_${questionId}`;
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

  /* v1.10.0 — estados do dono para as cartas sorteadas: as projeções SRS são
     computadas AQUI (mesma matemática de srs.ts, sem persistir) e viajam no
     draw junto com o verso completo. Uma consulta, N cartas. */
  const states = await db.flashcardState.findMany({
    where: { ...where, questionId: { in: queueIds } },
    select: { questionId: true, ease: true, intervalDays: true, reps: true, lapses: true },
  });
  const stateByQ = new Map(states.map((s) => [s.questionId, s]));

  const cards: FlashcardDrawnCard[] = queueIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => {
      const existing = stateByQ.get(q.id);
      const prev: SrsState = existing
        ? { ease: existing.ease, intervalDays: existing.intervalDays, reps: existing.reps, lapses: existing.lapses }
        : SRS_INITIAL_STATE;
      const wrong = applyReview(prev, false);
      const right = applyReview(prev, true);
      return {
        ...toPublicQuestion(q),
        frontIncludesOptions: OPTION_DEPENDENT_KEYS.has(q.key),
        // v1.10.0 — o verso EMBUTIDO no draw (spec §3): reveal local.
        correctIndex: q.correctIndex,
        explanationEn: q.explanationEn,
        explanationPt: q.explanationPt,
        referenceUrl: q.referenceUrl,
        referenceTitle: q.referenceTitle,
        projection: {
          wrong: { intervalDays: wrong.intervalDays },
          right: { intervalDays: right.intervalDays },
        },
      };
    });

  return { cards, drewCount: cards.length };
}

// ---------------------------------------------------------------------------
// Reveal (READ-ONLY, DEPRECATED for the app since v1.10.0 — the client turns
// cards locally from the draw payload; endpoint stays live as published API)
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
// Sync (v1.10.0 — replay of the offline judgment queue, spec §3)
// ---------------------------------------------------------------------------

/**
 * Replays queued judgments IN ORDER as SM-2 reviews. SM-2 é um FOLD: eventos
 * da mesma carta aplicam sequencialmente EM MEMÓRIA e a carta recebe UMA
 * escrita final (O(cartas distintas) escritas em vez de O(eventos) viagens
 * ao banco — ≤200 eventos num lote ficam baratos mesmo no Neon).
 *
 * O instante de cada revisão é o `occurredAt` do evento (quando o aluno
 * julgou offline), não o now do servidor — histórico honesto: julgou ontem
 * com intervalo de 1 dia, a carta vence HOJE, não amanhã.
 *
 * Conflito multi-dispositivo (spec §4): eventos aplicam sobre o estado
 * corrente no servidor, em ordem de chegada — mesmo contrato de quem usa
 * duas abas. Dupla aplicação (200 perdido pós-apply): janela de milissegundos,
 * consequência = 1 passo extra de SM-2 numa carta autoavaliada — aceito e
 * documentado na spec.
 */
export async function syncFlashcards(events: FlashcardSyncEvent[], certSlug?: string): Promise<FlashcardSyncResponse> {
  const owner = await ownerWhere();

  const byQuestion = new Map<string, FlashcardSyncEvent[]>();
  for (const ev of events) {
    const bucket = byQuestion.get(ev.questionId);
    if (bucket) bucket.push(ev);
    else byQuestion.set(ev.questionId, [ev]);
  }

  const questionIds = [...byQuestion.keys()];
  const questions = await db.question.findMany({
    where: { id: { in: questionIds }, enabled: true },
    select: { id: true },
  });
  const validIds = new Set(questions.map((q) => q.id));

  const states = await db.flashcardState.findMany({
    where: { ...owner, questionId: { in: questionIds } },
    select: { id: true, questionId: true, ease: true, intervalDays: true, reps: true, lapses: true },
  });
  const stateByQ = new Map(states.map((s) => [s.questionId, s]));

  let applied = 0;
  let skipped = 0;
  const now = new Date();

  for (const [questionId, bucket] of byQuestion) {
    /* Questão removida/desabilitada desde a construção da fila: pula e
       REPORTA (nunca descarte silencioso — o cliente mostra o número). */
    if (!validIds.has(questionId)) {
      skipped += bucket.length;
      continue;
    }

    const existing = stateByQ.get(questionId);
    let state: SrsState = existing
      ? { ease: existing.ease, intervalDays: existing.intervalDays, reps: existing.reps, lapses: existing.lapses }
      : SRS_INITIAL_STATE;
    let last: SrsReviewResult | null = null;
    let lastAt = now;

    for (const ev of bucket) {
      const parsed = new Date(ev.occurredAt);
      const when = Number.isNaN(parsed.getTime()) ? now : parsed;
      last = applyReview(state, ev.remembered, when);
      state = { ease: last.ease, intervalDays: last.intervalDays, reps: last.reps, lapses: last.lapses };
      lastAt = when;
      applied++;
    }
    if (!last) continue;

    const data = {
      ease: state.ease,
      intervalDays: state.intervalDays,
      reps: state.reps,
      lapses: state.lapses,
      dueAt: last.dueAt,
      lastReviewedAt: lastAt,
    };

    if (existing) {
      await db.flashcardState.update({ where: { id: existing.id }, data });
    } else {
      const id = stateId(owner, questionId);
      try {
        await db.flashcardState.create({
          data: {
            id,
            // dono — userId XOR anonId (mesmo padrão do Attempt)
            ...(owner.userId !== null ? { userId: owner.userId } : { anonId: owner.anonId }),
            questionId,
            ...data,
          },
        });
      } catch (err) {
        // Concurrent syncs converge on the deterministic owner+question ID.
        if (!(err instanceof Error) || !err.message.includes("Unique constraint")) throw err;
        await db.flashcardState.update({ where: { id }, data });
      }
    }
  }

  /* Resumo fresco quando o cliente mandou a cert ativa — economiza uma
     viagem de invalidação; cert inválida não derruba o sync (summary null). */
  let summary: FlashcardsSummary | null = null;
  if (certSlug) {
    try {
      summary = await getFlashcardsSummary(certSlug);
    } catch {
      summary = null;
    }
  }

  return { applied, skipped, summary };
}

// ---------------------------------------------------------------------------
// Grade (write: apply SM-2 with the student's self-assessment) — online path
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
    const id = stateId(owner, questionId);
    try {
      await db.flashcardState.create({
        data: {
          id,
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
    } catch (err) {
      // Concurrent reviews converge on the deterministic owner+question ID.
      if (!(err instanceof Error) || !err.message.includes("Unique constraint")) throw err;
      await db.flashcardState.update({
        where: { id },
        data: {
          ease: next.ease,
          intervalDays: next.intervalDays,
          reps: next.reps,
          lapses: next.lapses,
          dueAt: next.dueAt,
          lastReviewedAt: now,
        },
      });
    }
  }

  return {
    intervalDays: next.intervalDays,
    reps: next.reps,
    lapses: next.lapses,
    nextDueAt: next.dueAt.toISOString(),
  };
}

export async function reviewFlashcard(questionId: string, selectedIndex: number | null): Promise<FlashcardGradeResponse> {
  const question = await db.question.findUnique({ where: { id: questionId }, select: { correctIndex: true, enabled: true } });
  if (!question?.enabled) throw new ServiceError(404, "Question not found");
  return gradeFlashcard(questionId, selectedIndex !== null && selectedIndex === question.correctIndex);
}

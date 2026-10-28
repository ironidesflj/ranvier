import { db } from "@/lib/db";
import { ownerWhere } from "@/lib/session";

/**
 * Trail core (v1.8.0 — spec docs/sdd/spec-v1.8.0-trilhas-flashcards.md §5).
 *
 * Funções compartilhadas entre o trail-service (resumo da rota) e o
 * attempt-service (seleção do modo TRAIL) — módulo separado para evitar
 * ciclo de imports (nenhum ServiceError aqui, só dados).
 *
 * Progresso de trilha é 100% DERIVADO: questão "concluída" = o dono já
 * respondeu CORRETAMENTE pelo menos uma vez, em qualquer modo (estudo,
 * trilha, simulado). Zero tabelas novas — o AttemptAnswer existente é a
 * fonte da verdade.
 */

/** Rampa da trilha (spec §5.2): EASY → MEDIUM → HARD, desempate pela chave
 *  estável do seed (S2-001 < S2-014 < …). Determinística e auditável. */
const DIFFICULTY_RANK: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

export function sortTrailQuestions<T extends { difficulty: string; key: string }>(questions: T[]): T[] {
  return [...questions].sort((a, b) => {
    const rank = (DIFFICULTY_RANK[a.difficulty] ?? 1) - (DIFFICULTY_RANK[b.difficulty] ?? 1);
    if (rank !== 0) return rank;
    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
  });
}

/** IDs de questões já concluídas por este dono nesta certificação
 *  (resposta correta em qualquer modo — spec §5.3). */
export async function completedQuestionIds(certificationId: string): Promise<Set<string>> {
  const owner = await ownerWhere();
  const rows = await db.attemptAnswer.findMany({
    where: {
      correct: true,
      attempt: { ...owner, certificationId },
      question: { enabled: true, domain: { certificationId } },
    },
    select: { questionId: true },
  });
  return new Set(rows.map((r) => r.questionId));
}

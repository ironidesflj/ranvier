/**
 * SRS — SM-2 simplificado, LOCAL no app (spec v1.7.0 — docs/sdd/
 * spec-v1.7.0-flashcards.md §3).
 *
 * Deliberadamente FORA do pacote @ironidesflj/axon: o dossiê das fatias é
 * explícito ("SM-2 não está no pacote; sobe só quando doer em dois apps").
 * Funções puras e sem estado — quando o Synapse precisar, esta assinatura
 * sobe para o Axon com a mesma interface.
 *
 * Nota do cartão = correção avaliada pelo SERVIDOR (a segurança de não
 * vazar o gabarito antes da resposta é requisito do app, não do algoritmo):
 *   - acertou  → "sabia"  → intervalo cresce
 *   - errou/pulou → "errei" → ease cai, reps zeram, vence AGORA
 *     (o cartão re-entra na fila da própria sessão).
 *
 * Simplificações conscientes (V1, documentadas na spec):
 *   - acerto NÃO aumenta o ease (SM-2 clássico cortado);
 *   - sem auto-avaliação em 4 botões (a correção do servidor já dá a nota);
 *   - teto de 180 dias (curso de prova, não repositório vitalício).
 */

export const SRS_EASE_INITIAL = 2.5;
export const SRS_EASE_MIN = 1.3;
export const SRS_EASE_STEP = 0.2;
export const SRS_INTERVAL_CAP_DAYS = 180;

/** Estado persistido de um cartão (espelha as colunas de FlashcardState). */
export interface SrsState {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}

/** Resultado de uma revisão aplicada — carrega o novo vencimento. */
export interface SrsReviewResult extends SrsState {
  dueAt: Date;
}

/** Estado inicial de um cartão nunca visto. */
export const SRS_INITIAL_STATE: SrsState = {
  ease: SRS_EASE_INITIAL,
  intervalDays: 0,
  reps: 0,
  lapses: 0,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Aplica uma revisão a um estado.
 * @param remembered true = acertou; false = errou ou pulou (mesma semântica
 *        de questão em branco = incorreta, como no simulado).
 * @param now instante da revisão (injetável para determinismo em teste).
 */
export function applyReview(state: SrsState, remembered: boolean, now: Date = new Date()): SrsReviewResult {
  if (!remembered) {
    return {
      ease: Math.max(SRS_EASE_MIN, round2(state.ease - SRS_EASE_STEP)),
      intervalDays: 0,
      reps: 0,
      lapses: state.lapses + 1,
      dueAt: now, // vence agora: re-entra na fila da sessão atual
    };
  }

  const reps = state.reps + 1;
  const intervalDays =
    reps === 1
      ? 1 // primeiro acerto → amanhã
      : reps === 2
        ? 3 // segundo acerto → 3 dias
        : Math.min(SRS_INTERVAL_CAP_DAYS, Math.round(state.intervalDays * state.ease) || 1);

  return {
    ease: state.ease,
    intervalDays,
    reps,
    lapses: state.lapses,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

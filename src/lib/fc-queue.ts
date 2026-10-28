import type { FlashcardSyncEvent } from "@/lib/types";

/**
 * Fila local de julgamentos offline (v1.10.0 — spec docs/sdd/
 * spec-v1.10.0-flashcards-offline.md §4).
 *
 * localStorage `ranvier:fc-queue`: [{ questionId, remembered, occurredAt }],
 * cap 200 — ao estourar, descarta o MAIS ANTIGO e avisa (cap nunca descarta
 * silenciosamente; o toast é responsabilidade de quem chama appendEvent).
 *
 * Por que localStorage e não IndexedDB: 200 eventos pequenos não precisam de
 * capacidade assíncrona (variante avaliada e descartada na spec §10).
 * Multi-aba: mesma chave, última escrita vence — mesmo contrato de quem usa
 * duas abas hoje.
 */

const QUEUE_KEY = "ranvier:fc-queue";

/** Espelha o cap do zod do /sync (spec §3) — cliente e servidor concordam. */
export const FC_QUEUE_CAP = 200;

function safeParse(raw: string | null): FlashcardSyncEvent[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is FlashcardSyncEvent =>
        Boolean(e) && typeof e === "object" && "questionId" in e && "remembered" in e && "occurredAt" in e,
    );
  } catch {
    /* storage corrompido — começa de novo, a fila era só um buffer */
    return [];
  }
}

export function readQueue(): FlashcardSyncEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse(window.localStorage.getItem(QUEUE_KEY));
  } catch {
    return [];
  }
}

export interface AppendResult {
  /** Fila após o append. */
  queue: FlashcardSyncEvent[];
  /** Eventos descartados por estouro do cap (0 na esmagadora maioria). */
  dropped: number;
}

/** Adiciona um julgamento; estourando o cap, descarta os mais antigos. */
export function appendEvent(event: FlashcardSyncEvent): AppendResult {
  const queue = [...readQueue(), event];
  let dropped = 0;
  while (queue.length > FC_QUEUE_CAP) {
    queue.shift();
    dropped++;
  }
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* sem storage (modo privado etc.): a fila vale só nesta sessão de
       memória — o return mantém o contador honesto para os badges */
  }
  return { queue, dropped };
}

/** Esvazia a fila após um sync 200 (spec §3). */
export function clearQueue(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* sem storage — nada a limpar */
  }
}

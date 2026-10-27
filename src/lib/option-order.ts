/**
 * Embaralhamento determinístico de alternativas por tentativa (patch Ranvier
 * v1.1 §10.6 + nota técnica B).
 *
 * Regra: as alternativas são embaralhadas POR SESSÃO com semente estável
 * derivada do attemptId — a mesma ordem é reproduzida ao recarregar, retomar
 * ou revisar. O gabarito viaja por ÍNDICE CANÔNICO (a posição no banco), não
 * pela posição exibida:
 *
 *   - `order` mapeia posição exibida → índice canônico: options[order[d]]
 *   - o servidor continua gravando e corrigindo índices canônicos;
 *   - a UI traduz canônico ↔ exibido com `toDisplay`/`toCanonical`.
 *
 * Isso resolve o viés de posição ("a correta parece sempre a mesma letra")
 * sem tocar no banco nem no contrato da API — tentativas antigas (pré-shuffle)
 * continuam válidas porque a ordem deriva apenas de (attemptId, questionId).
 *
 * Nota técnica para o modelo construtor (pedido do fundador 2026-10-26):
 * quando as alternativas ganharem IDs estáveis no banco (optionId), troque a
 * semente de índice para ID mantendo esta mesma interface.
 */

/** FNV-1a 32 bits — hash estável e rápido para strings curtas. */
function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** PRNG determinístico (mulberry32) — mesma semente, mesma sequência. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ordem das alternativas para uma questão numa tentativa.
 * Retorna `order` tal que `options[order[displayPos]]` é o texto exibido na
 * posição `displayPos` (Fisher-Yates com PRNG semeado).
 */
export function optionOrder(attemptId: string, questionId: string, count: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  if (count < 2) return order;
  const rand = mulberry32(hashString(`${attemptId}:${questionId}`));
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Interface de tradução canônico ↔ exibido para uma questão embaralhada. */
export interface OptionOrdering {
  /** Alternativas na ordem exibida. */
  options: string[];
  /** Índice canônico da alternativa na posição exibida `display`. */
  toCanonical: (display: number) => number;
  /** Posição exibida da alternativa canônica `canonical`. */
  toDisplay: (canonical: number) => number;
}

/** Embaralha as alternativas de uma questão para exibição numa tentativa. */
export function orderOptions(
  question: { options: string[] },
  attemptId: string,
  questionId: string,
): OptionOrdering {
  const order = optionOrder(attemptId, questionId, question.options.length);
  return {
    options: order.map((canonical) => question.options[canonical]),
    toCanonical: (display) => order[display] ?? display,
    toDisplay: (canonical) => order.indexOf(canonical),
  };
}

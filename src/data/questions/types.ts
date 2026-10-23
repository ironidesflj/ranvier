/**
 * Shared types for the question bank seed files.
 * Questions are ALWAYS in English (exam language), explanations are bilingual (EN + PT-BR).
 */
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface SeedQuestion {
  /** Stable unique key, e.g. "S2-014". Never reuse keys across files. */
  key: string;
  /** Official exam outline section (1..7) this question maps to. */
  domainCode: number;
  /**
   * Question stem in English. Markdown subset supported: paragraphs, `inline code`,
   * and fenced code blocks (```sql / ```python). Scenario-based, exam style.
   */
  stem: string;
  /** Exactly 4 answer options in English (single best answer). */
  options: [string, string, string, string];
  /** Index (0-3) of the correct option. Distribute roughly uniformly across 0..3. */
  correctIndex: 0 | 1 | 2 | 3;
  /** Why the correct option is right (and briefly why key distractors are wrong). English. */
  explanationEn: string;
  /** Natural PT-BR translation of the explanation (not machine-literal). */
  explanationPt: string;
  /** Official documentation URL that substantiates the answer. Must come from the verified list. */
  referenceUrl: string;
  /** Short human title of the reference, e.g. "Auto Loader — Databricks Docs". */
  referenceTitle: string;
  difficulty: Difficulty;
}

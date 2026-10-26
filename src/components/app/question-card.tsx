"use client";

import { useEffect } from "react";
import { ExternalLink, MessageCircle } from "lucide-react";
import { Markdown } from "@/components/app/markdown";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/app/language-provider";
import { discussionUrl } from "@/lib/axon/deep-links";
import type { PublicQuestion } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"] as const;

export interface FeedbackState {
  correct: boolean;
  correctIndex: number;
  explanationEn: string;
  explanationPt: string;
  referenceUrl: string | null;
  referenceTitle: string | null;
}

/**
 * Modo revisão (após finalizar) — patch v1.1 §11: a explicação é parte da
 * questão, não um estado opcional. O snapshot do servidor (ReviewQuestion)
 * carrega explicação e fonte; a revisão as exibe SEMPRE abertas.
 */
export interface ReviewState {
  correctIndex: number;
  correct: boolean;
  explanationEn?: string;
  explanationPt?: string;
  referenceUrl?: string | null;
  referenceTitle?: string | null;
}

interface QuestionCardProps {
  question: PublicQuestion;
  /** Currently selected option (user's choice). */
  selectedIndex: number | null;
  /** Interactive selection handler (absent in review mode). */
  onSelect?: (index: number) => void;
  /** Study mode: confirm the selected answer (Enter shortcut target). */
  onConfirm?: () => void;
  /** Study mode: graded feedback for this question (locks the options). */
  feedback?: FeedbackState | null;
  /** Review mode (after attempt completion) — may carry explanation+source. */
  review?: ReviewState | null;
  /** Disable interactions (e.g., while submitting an answer). */
  disabled?: boolean;
  /** Show domain + difficulty as FILLED pills above the question
   *  (founder 2026-10-26: "abaixo da Questão X aparecia o domínio e a
   *  dificuldade, os dois com fundo preenchido — eu gostava disso").
   *  On in study + review; off during the exam (chrome-less, v1.1 §10.1). */
  showMeta?: boolean;
}

/**
 * Tela de questão (patch Ranvier v1.0 §8 + v1.1 §5/§6/§10, ajuste v1.4.1).
 *
 *  - Contrato da pergunta REVISTO pelo fundador (2026-10-26): a escala
 *    20–32px do patch v1.1 §5 continuava "gigante" — o tamanho de leitura do
 *    print do app antigo voltou (15px mobile / 16px ≥640px, corpo normal);
 *    a serifa Newsreader e a medida generosa permanecem (identidade Noos).
 *  - Domínio e dificuldade como PILLS PREENCHIDAS acima da pergunta
 *    (showMeta — fundador: "os dois com fundo preenchido, eu gostava disso").
 *  - Alternativas em linhas de 54px, raio 10 (v1.1 §6): letra A–D em mono num
 *    quadrado de 26px com raio 6. Corrigida/errada com FUNDO preenchido
 *    sutil + borda colorida (fundador 2026-10-26: "o certo e errado tinha
 *    fundo colorido — traz de volta, mas mais sutil que o antigo").
 *  - Reveal com tag textual ("correta" / "sua resposta") — cor nunca é o
 *    único sinal (patch §12).
 *  - Correção em container PREENCHIDO (suave, cor do resultado) com lead
 *    serif, corpo sans e fonte em mono — TAMBÉM na revisão (v1.1 §11).
 *  - Teclado (patch §12): A–D seleciona, setas movem o foco, Enter confirma.
 */
export function QuestionCard({ question, selectedIndex, onSelect, onConfirm, feedback, review, disabled, showMeta }: QuestionCardProps) {
  const { t, lang } = useLang();

  const graded = feedback ?? review ?? null;
  const correctIndex = feedback?.correctIndex ?? review?.correctIndex ?? null;
  const interactive = !graded && Boolean(onSelect) && !disabled;
  const select = onSelect;
  /* Correção exibida: modo estudo (feedback) OU revisão com snapshot (v1.1 §11). */
  const explanation =
    feedback ?? (review && review.explanationEn !== undefined
      ? {
          correct: review.correct,
          correctIndex: review.correctIndex,
          explanationEn: review.explanationEn ?? "",
          explanationPt: review.explanationPt ?? "",
          referenceUrl: review.referenceUrl ?? null,
          referenceTitle: review.referenceTitle ?? null,
        }
      : null);

  /* Atalhos de teclado (patch §12): A–D seleciona, setas movem o foco entre
     alternativas, Enter confirma (com seleção feita e fora de botões). */
  useEffect(() => {
    if (!interactive || !select) return;
    const sel = select;
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const key = e.key.toLowerCase();
      const letterIndex = LETTERS.findIndex((l) => l.toLowerCase() === key);
      if (letterIndex >= 0 && letterIndex < question.options.length) {
        e.preventDefault();
        sel(letterIndex);
        return;
      }
      /* Enter confirma — exceto quando o foco já está num controle nativo
         (botão/link) para não duplicar o clique. */
      if (e.key === "Enter" && onConfirm && selectedIndex !== null && !(target?.closest("button, a, input, select, textarea"))) {
        e.preventDefault();
        onConfirm();
        return;
      }
      /* Setas movem o foco entre as alternativas. */
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
        if (options.length === 0) return;
        const currentIdx = options.findIndex((o) => o === document.activeElement);
        const nextIdx = e.key === "ArrowDown"
          ? (currentIdx + 1 + options.length) % options.length
          : (currentIdx - 1 + options.length) % options.length;
        e.preventDefault();
        options[nextIdx].focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [interactive, select, question.options.length, onConfirm, selectedIndex]);

  return (
    <div className="space-y-5">
      {/* Domínio + dificuldade — pills PREENCHIDAS (fundador 2026-10-26:
          "abaixo da Questão X aparecia o domínio e a dificuldade, os dois com
          fundo preenchido — eu gostava disso, traz de volta"). No estudo e na
          revisão; o simulado fica chrome-less (v1.1 §10.1). */}
      {showMeta && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">
            {t.common.domain} {question.domainCode} · {lang === "pt" ? question.domainNamePt : question.domainName}
          </span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
            {t.study.difficulty}: {t.study.difficulties[question.difficulty]}
          </span>
        </div>
      )}

      {/* Pergunta — tamanho de leitura do app antigo (print 2026-10-24:
          corpo normal 15/16px, não a escala 20–32 do patch v1.1 §5);
          serifa Newsreader e medida generosa permanecem. */}
      <Markdown
        text={question.stem}
        className="max-w-[68ch] font-display text-[15px] font-normal leading-[1.55] tracking-[-0.006em] sm:text-base"
      />

      {/* Alternativas — linhas de 54 px, letra mono em quadrado de 26 px */}
      <div className="space-y-2" role="listbox" aria-label="Answer options">
        {question.options.map((option, i) => {
          const selected = selectedIndex === i;
          const isCorrectOption = graded && correctIndex === i;
          const isWrongPick = graded && selected && correctIndex !== i;

          return (
            <button
              key={i}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={disabled || graded !== null || !onSelect}
              onClick={() => onSelect?.(i)}
              className={cn(
                "flex min-h-[54px] w-full items-center gap-4 rounded-[10px] border bg-card px-4 py-2.5 text-left transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-ink)]",
                !graded && "cursor-pointer hover:border-[var(--noos-border-strong)]",
                !graded && selected && "border-app bg-app-soft",
                !graded && !selected && "border-border",
                graded && isCorrectOption && "border-[var(--noos-success)] bg-[var(--noos-success-soft)]",
                graded && isWrongPick && "border-[var(--noos-danger)] bg-[var(--noos-danger-soft)]",
                graded && !isCorrectOption && !isWrongPick && "border-border opacity-60",
                (disabled || graded !== null) && "cursor-default"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] border font-mono text-xs font-medium",
                  !graded && selected && "border-app bg-app text-white",
                  !graded && !selected && "border-[var(--noos-border-strong)] text-muted-foreground",
                  graded && isCorrectOption && "border-[var(--noos-success)] bg-[var(--noos-success)] text-white",
                  graded && isWrongPick && "border-[var(--noos-danger)] bg-[var(--noos-danger)] text-white",
                  graded && !isCorrectOption && !isWrongPick && "border-border text-muted-foreground"
                )}
              >
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1 break-words text-[15px] leading-relaxed sm:text-base">{option}</span>
              {/* Tags textuais do reveal — cor nunca sozinha (patch §12) */}
              {graded && isCorrectOption && (
                <span className="shrink-0 rounded-[6px] border border-[var(--noos-success)] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--noos-success)]">
                  {t.study.tagCorrect}
                </span>
              )}
              {graded && isWrongPick && (
                <span className="shrink-0 rounded-[6px] border border-[var(--noos-danger)] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--noos-danger)]">
                  {t.study.tagYours}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Correção — container PREENCHIDO suave na cor do resultado
          (fundador 2026-10-26: "a explicação com a fonte vinha dentro de um
          preenchimento — traz de volta"), lead serif em tamanho de leitura,
          corpo sans e fonte em mono. Modo estudo (feedback) E revisão
          pós-final (v1.1 §11 — a explicação não desaparece depois de entregar). */}
      {explanation && (
        <div
          className={cn(
            "space-y-3 rounded-[10px] border p-4 sm:p-5",
            explanation.correct
              ? "border-[var(--noos-success-line)] bg-[var(--noos-success-soft)]"
              : "border-[var(--noos-danger-line)] bg-[var(--noos-danger-soft)]"
          )}
          role="status"
          aria-live="polite"
        >
          <p className={cn("font-display text-base font-medium leading-snug", explanation.correct ? "text-[var(--noos-success)]" : "text-[var(--noos-danger)]")}>
            {explanation.correct ? t.study.correct : `${t.study.correctAnswerIs} ${LETTERS[explanation.correctIndex]}.`}
          </p>
          <div>
            <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t.study.explanation}
            </p>
            <Markdown
              text={lang === "pt" ? explanation.explanationPt : explanation.explanationEn}
              className="max-w-[68ch] text-[15px] leading-relaxed"
            />
          </div>
          {explanation.referenceUrl && (
            <a
              href={explanation.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-app-ink underline underline-offset-4 hover:opacity-80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t.study.source}: {explanation.referenceTitle ?? explanation.referenceUrl}
            </a>
          )}
        </div>
      )}

      {/* Rodapé da questão: ID pública (mono, citável) + deep-link Comunidade.
          O ID é imutável (contrato Axon); o link abre a discussão da questão
          no hub Noos, no idioma da interface. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <span
          className="select-all font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
          title={t.study.publicIdTitle}
        >
          {question.publicId}
        </span>
        {(feedback || review) && (
          <a
            href={discussionUrl(question.publicId, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-app-ink transition-opacity hover:opacity-80"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            {t.footer.community}
            <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

export { LETTERS };

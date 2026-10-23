"use client";

import { CheckCircle2, XCircle, BookOpen, ExternalLink, MessageCircle } from "lucide-react";
import { Markdown } from "@/components/app/markdown";
import { Button } from "@/components/ui/button";
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

interface QuestionCardProps {
  question: PublicQuestion;
  /** Currently selected option (user's choice). */
  selectedIndex: number | null;
  /** Interactive selection handler (absent in review mode). */
  onSelect?: (index: number) => void;
  /** Study mode: graded feedback for this question (locks the options). */
  feedback?: FeedbackState | null;
  /** Review mode (after attempt completion). */
  review?: { correctIndex: number; correct: boolean } | null;
  /** Disable interactions (e.g., while submitting an answer). */
  disabled?: boolean;
}

export function QuestionCard({ question, selectedIndex, onSelect, feedback, review, disabled }: QuestionCardProps) {
  const { t, lang } = useLang();

  const graded = feedback ?? review ?? null;
  const correctIndex = feedback?.correctIndex ?? review?.correctIndex ?? null;
  const isCorrect = feedback ? feedback.correct : review ? review.correct : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
          {t.common.domain} {question.domainCode} · {lang === "pt" ? question.domainNamePt : question.domainName}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
          {t.study.difficulty}: {t.study.difficulties[question.difficulty]}
        </span>
      </div>

      <Markdown text={question.stem} className="text-[15px] sm:text-base" />

      <div className="space-y-2.5" role="listbox" aria-label="Answer options">
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
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                !graded && "hover:border-primary/50 hover:bg-accent/50 cursor-pointer",
                !graded && selected && "border-primary bg-primary/10 shadow-sm",
                !graded && !selected && "bg-card",
                graded && isCorrectOption && "border-emerald-500/70 bg-emerald-500/10",
                graded && isWrongPick && "border-destructive/70 bg-destructive/10",
                graded && !isCorrectOption && !isWrongPick && "opacity-60 bg-card",
                (disabled || graded !== null) && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  !graded && selected && "border-primary bg-primary text-primary-foreground",
                  !graded && !selected && "border-border text-muted-foreground",
                  graded && isCorrectOption && "border-emerald-500 bg-emerald-500 text-white",
                  graded && isWrongPick && "border-destructive bg-destructive text-white",
                  graded && !isCorrectOption && !isWrongPick && "border-border text-muted-foreground"
                )}
                aria-hidden
              >
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1 break-words">{option}</span>
              {graded && isCorrectOption && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />}
              {graded && isWrongPick && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={cn(
            "rounded-xl border p-4 space-y-3",
            feedback.correct ? "border-emerald-500/50 bg-emerald-500/5" : "border-destructive/50 bg-destructive/5"
          )}
          role="status"
        >
          <p className={cn("flex items-center gap-2 font-semibold", feedback.correct ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
            {feedback.correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {feedback.correct ? t.study.correct : t.study.incorrect}
            {!feedback.correct && (
              <span className="font-normal text-muted-foreground">
                — {t.study.correctAnswerIs}: {LETTERS[feedback.correctIndex]}
              </span>
            )}
          </p>
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> {t.study.explanation}
            </p>
            <Markdown text={lang === "pt" ? feedback.explanationPt : feedback.explanationEn} className="text-sm" />
          </div>
          {feedback.referenceUrl && (
            <a
              href={feedback.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t.study.source}: {feedback.referenceTitle ?? feedback.referenceUrl}
            </a>
          )}
        </div>
      )}

      {/* Question footer: stable public ID (mono, discreet) + Community deep-link.
          The ID is citable — select-all friendly; the Community button opens the
          question's discussion on the Noos hub, in the current UI language. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
        <span
          className="select-all font-mono text-[10px] tracking-tight text-muted-foreground/70"
          title={t.study.publicIdTitle}
        >
          {question.publicId}
        </span>
        {(feedback || review) && (
          <a
            href={discussionUrl(question.publicId, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-opacity hover:opacity-80"
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

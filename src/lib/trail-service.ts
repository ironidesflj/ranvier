import { db } from "@/lib/db";
import { ServiceError } from "@/lib/attempt-service";
import { completedQuestionIds, sortTrailQuestions } from "@/lib/trail-core";
import type { Lang, TrailsSummary, TrailInfo } from "@/lib/types";

/**
 * Trail service (v1.8.0 — spec docs/sdd/spec-v1.8.0-trilhas-flashcards.md §5).
 *
 * As 7 trilhas = os 7 domínios oficiais do blueprint, na ordem oficial.
 * O progresso é 100% DERIVADO do AttemptAnswer existente (questão concluída
 * = já respondida corretamente em qualquer modo) — zero tabelas novas, zero
 * migração. O percentual geral é ponderado pelos pesos oficiais do exame.
 */
export async function getTrails(certSlug: string, lang: Lang): Promise<TrailsSummary> {
  const cert = await db.certification.findUnique({
    where: { slug: certSlug },
    include: {
      domains: {
        orderBy: { orderIndex: "asc" },
        include: { questions: { where: { enabled: true }, select: { id: true, key: true, difficulty: true } } },
      },
    },
  });
  if (!cert) throw new ServiceError(404, "Certification not found");

  const completed = await completedQuestionIds(cert.id);

  const trails: TrailInfo[] = cert.domains.map((d) => {
    const ordered = sortTrailQuestions(d.questions);
    const total = ordered.length;
    const done = ordered.filter((q) => completed.has(q.id)).length;
    const nextUp = ordered.find((q) => !completed.has(q.id))?.key ?? null;
    return {
      code: d.code,
      name: lang === "pt" ? d.namePt : d.name,
      weightPercent: d.weightPercent,
      outline: JSON.parse(lang === "pt" ? d.outlinePt : d.outlineEn) as string[],
      total,
      completed: done,
      state: done === 0 ? "not_started" : done >= total ? "complete" : "in_progress",
      nextUp,
    };
  });

  /* Percentual geral ponderado pelos pesos oficiais do blueprint
     (fatos da certificação — nada inventado). */
  const weightSum = trails.reduce((a, tr) => a + tr.weightPercent, 0) || 100;
  const weighted =
    trails.reduce((a, tr) => a + tr.weightPercent * (tr.total > 0 ? tr.completed / tr.total : 0), 0) / weightSum;
  const overallPercent = Math.round(weighted * 1000) / 10;

  return { certSlug: cert.slug, overallPercent, trails };
}

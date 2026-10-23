import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Diagnóstico de produção: conectividade do banco + contagens básicas.
 * Sem dados sensíveis (só status e contadores públicos de catálogo).
 * Uso: curl https://<app>/api/health → {"status":"ok","db":"ok","certifications":1,"questions":116}
 * Se retornar 503/db:error → problema de DATABASE_URL ou schema (ver DEPLOY.md §5/§11).
 */
export async function GET() {
  try {
    const [certifications, questions] = await Promise.all([db.certification.count(), db.question.count()]);
    return NextResponse.json({ status: certifications > 0 ? "ok" : "empty", db: "ok", certifications, questions });
  } catch {
    return NextResponse.json({ status: "error", db: "error" }, { status: 503 });
  }
}

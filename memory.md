# Ranvier — maintainer memory / handoff

Last checked: 2026-11-06 (America/Sao_Paulo)

## Current state

- Repository: `ironidesflj/ranvier`, branch `main`, last known commit `1d28e85` (`fix: apply daily QA corrections`). Local checkout matched `origin/main` at the last git check.
- App version: `1.10.0` (`src/lib/version.ts`, `package.json`).
- Production URL: <https://ranvier-seven.vercel.app>.
- Important verification gap: on 2026-11-06, DNS lookup failed while checking Vercel, so deployment of `1d28e85` and current production health are unconfirmed. Do not describe it as deployed until checked.
- Stack: Next.js 16, React 19, TypeScript, Bun, Prisma 6; Neon PostgreSQL in production, SQLite in local development.
- Current exam: Databricks Certified Data Engineer Associate (DBDEA); 300 enabled questions across 7 domains; public IDs `RAN-DBDEA-00001` through `RAN-DBDEA-00300`.
- Axon is pinned exactly to `@ironidesflj/axon@0.2.1` in package.json and bun.lock. External Noos dossier dated 2026-10-30 identifies 0.2.2 as published latest; review its changelog/contract before upgrading.

## Product capabilities

- Practice mode with immediate server-side grading; timed 45-question mock exams; domain study trails; progress, history and review queue.
- Spaced repetition flashcards, offline queue (`ranvier:fc-queue`, cap 200) and batch sync at `/api/flashcards/sync`.
- Bilingual glossary with 94 static entries, domain filters and accent-insensitive search.
- PWA shell, dark mode, optional account, orbital Ranvier mark and silent splash.
- Noos/Axon slices 1–4 implemented. Slice 5 is operationally connected: public hub manifest and sample question URL returned 200 on 2026-10-30. Founder said the Vercel variable `NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study` was configured; verify active deployment was rebuilt with it.

## Security and data

- **Neon restore drill (2026-11-06):** temporary branch `testar restore` (`br-odd-butterfly-b63tjz70`), created from parent `production` on 2026-11-06 at 15:58 (São Paulo), was queried in the Neon SQL Editor. Result: `RateLimitBucket = 46`, `Question = 300` (query completed in 78 ms). This confirms the point-in-time test branch had application data. The branch was deleted after the check; the Neon branch list showed only `production` (34.06 MB). Production was not modified.
- Production requires `SESSION_SECRET`; missing secret fails closed. Never print secrets from `.env` or Vercel.
- Service worker does not cache owner-scoped API responses; only public catalog/health/manifest data is cacheable.
- Rate limiting is shared across Vercel instances via Neon `RateLimitBucket`, keyed by route and client IP. Expired keys are reused on next access. Retention is now opportunistic: `cleanupExpiredRateLimits()` deletes buckets whose `resetAt` is older than a 60s grace period, triggered fire-and-forget from `rateLimit()` with probability 1/50 (no cron, no shared secret; growth stays bounded and a failed sweep never affects the request).
- Flashcard state uses deterministic owner+question IDs for conflict convergence.
- Study/exam answer grading remains server-side. Flashcard draw includes the answer for offline self-assessment by design; see `docs/sdd/spec-v1.10.0-flashcards-offline.md`.
- Public `manifest.jsonl` contains answer snapshots by Noos/Axon contract; this is intentional.

## Recent QA changes

Commit `1d28e85` contains five local QA fixes: generic localized auth errors; Home card overflow fix; splash signature positioning; result view fresh fetch, duplicate-submit guard, EXAM resume handling and retry UI; PT/EN messages. TypeScript/ESLint did not produce a confirmed result during that push attempt. Verify CI/deployment checks before claiming these fixes are production-ready.

## Open work

1. Verify Vercel deployment for `1d28e85`; check build status/logs and `/api/health` (expect DB OK, 1 certification, 300 questions).
2. Verify active build picked up `NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study`; then check the community link points at `noos.study`.
3. Review Axon 0.2.2 release notes and decide whether to upgrade from 0.2.1; keep exact pin and regenerate lockfile/CI if changed.
4. Retention for expired rate-limit buckets is implemented opportunistically (1/50, 60s grace); monitor table growth in Neon and revisit if it keeps rising.
5. Maintain English GitHub README and About metadata for every published Ranvier update.
6. Keep `docs/SDD.md`, `docs/sdd/current-state.md`, `docs/sdd/plan.md`, this file, and `worklog.md` aligned.

## Source of truth

Read `docs/sdd/current-state.md` for the verified snapshot, `docs/sdd/plan.md` for open decisions, `docs/SDD.md` for architecture, and `worklog.md` for chronological evidence. When they disagree with code or live systems, verify first and update the documents; do not silently repeat stale claims.

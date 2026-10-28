# Ranvier — audit fixes

Date: 2026-10-28 · Version: 1.8.1 · Updated after production deployment

## Findings and corrections

| Finding | Risk | Correction |
|---|---|---|
| Service Worker cached owner-scoped GET responses by URL only | A shared device could serve one user's progress, flashcard state or session data to another user offline | Owner-scoped API GETs are now network-only; public catalog/health remain cacheable |
| Known development fallback for `SESSION_SECRET` could be used in production if the env was missing | Forged session tokens after a production misconfiguration | Session signing now fails closed in production and keeps the fallback only for local development |
| Flashcard state used `findFirst` followed by `create` | Concurrent reviews could create duplicate state rows | New rows use a deterministic owner+question ID and converge on a concurrent unique conflict |
| Main SDD still described 116 questions and Axon 0.1.0 | Maintainers could follow obsolete deployment/data instructions | Current SDD references are synchronized with the 300-question, Axon 0.2.1 state |
| Rate limit was in memory per Vercel instance | Traffic could bypass the limit by reaching another serverless instance | Buckets now live in Neon and are incremented atomically across all instances |

## Validation

- ESLint
- TypeScript
- Question validation: 300/300
- Manifest validation: 300 valid, 0 rejected, 0 divergent
- Strict quality gate: 0 findings
- Red-team self-test: 17/17
- Rate-limit schema/client generation and route type-check: passed

## Publication

- Neon production schema synchronized successfully with `prisma db push`.
- GitHub published: commit `17d1588` on `main`.
- Production health check after deployment: HTTP 200, database `ok`, 300 questions.
- The previous per-instance rate-limit limitation is closed.

## Deliberate trade-off

Private owner-scoped data is no longer available from the Service Worker while
offline. This is intentional: preventing cross-account disclosure is more
important than offline readability of personal progress. The existing query
error/offline UI remains the fallback.

The shared rate limiter adds one small database operation to protected API
requests. Expired buckets are reused; cleanup is implicit on the next request.

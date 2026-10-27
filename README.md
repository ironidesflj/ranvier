# Ranvier

Free, unofficial study app for the **Databricks Certified Data Engineer Associate** certification. Part of the **Noos** ecosystem.

**Live:** https://ranvier-seven.vercel.app

## What it offers

- Mock exams in the real exam format — timed, blueprint-faithful domain weighting;
- Study mode with instant feedback, explanations and official references;
- Per-domain progress and a post-exam review queue;
- Bilingual interface (English & PT-BR); questions always in exam English;
- Anonymous-first: everything works without an account, with progress saved in the browser; an optional free login syncs progress across devices;
- PWA — installable, works offline after the first visit;
- **300 original questions** (anti-dump: no real exam items; every question cites official documentation).

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Query, Zustand, Prisma. Local development uses SQLite (Bun); production runs on Vercel with Neon Postgres.

## Local development

```bash
bun install
bun run db:generate
bun run db:seed
bun run dev
```

Checks:

```bash
bun run lint
bunx tsc --noEmit
bun run validate:questions
bun run validate:manifest
```

## Noos ecosystem · Axon

Ranvier is the #1 consumer of [`@ironidesflj/axon`](https://www.npmjs.com/package/@ironidesflj/axon) (exact-pinned in `package.json`), the shared contract of the Noos ecosystem:

- **Public IDs** — every question carries a stable `RAN-DBDEA-#####` ID, generated and validated by the package; IDs are never renamed and never recycled;
- **Canonical checksums** — `sha256` over the canonical question snapshot (locked algorithm);
- **manifest.jsonl** — the bank is published as a static file (`/manifest.jsonl`), validated in CI with the same parser the hub uses on ingestion (zero rejections tolerated); the Noos hub (noos.study) turns it into public question pages;
- **Deep-links** — the "by Noos" badge and the per-question discussion links point to the hub: links, never runtime dependencies.

The app owns the questions and the progress; the hub owns the discussions. The public ID is the only seam.

## Sources & non-affiliation

Content is based on official public Databricks documentation. Questions are original; the project does not reproduce real exam items and is not affiliated with, sponsored by, or endorsed by Databricks, Microsoft, or Pearson VUE.

## License

Code under MIT. Question bank and content under CC BY-SA 4.0.

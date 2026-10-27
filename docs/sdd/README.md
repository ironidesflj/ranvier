# Ranvier — SDD

Desenvolvimento orientado por especificação, no formato do **Anexo A (método de
trabalho) do Guia de Aplicação dos Apps Noos v1.1** — aplicado a partir da
v1.3.1 (pedido do fundador, 2026-10-25). O problema, a decisão, os limites e a
evidência de conclusão vivem no repositório, não em conversa.

## Arquivos canônicos

| Arquivo | Responsabilidade |
|---|---|
| `constitution.md` | Regras permanentes de decisão e fechamento (invariantes). |
| `current-state.md` | Estado verificado, versões, commits e limitações. |
| `plan.md` | Autorizado, pendente, adiado e fora de escopo (dívidas com nome). |
| `spec-*.md` | Problema e contrato de uma mudança (uma por conceito). |
| [`../SDD.md`](../SDD.md) | Registro vivo histórico (v1.0 → v1.3.1). Permanece como histórico; o estado ativo vive aqui. |

## Quem responde

- **Decisões de produto**: fundador (Ironides Junior). A aprovação pode vir do
  pedido que iniciou o trabalho; não se repete a pergunta quando a autorização
  já está clara.
- **Implementação/verificação**: equipe Noos (orquestrador + subagentes de
  autoria de questões, QA, UX e edição de conteúdo).

## Contrato Axon

- Prefixo reservado: **RAN-DBDEA** (IDs públicas `RAN-DBDEA-00001..00116`).
- Deep-links: `https://noos-hub.vercel.app/{lang}/q/{publicId}` (fallback
  canônico gratuito até `noos.study` existir; override via
  `NEXT_PUBLIC_NOOS_HUB_URL`).
- ID pública é imutável: atribuída só na criação pelo registro congelado
  (`src/data/questions/id-registry.ts`), nunca reescrita nem reciclada.

## Stack, comandos e ambientes

- **Stack**: Next.js 16 (App Router, rota única `/` com hash routing),
  TypeScript estrito, Tailwind 4 + shadcn/ui, Prisma, React Query, Zustand.
- **Sandbox**: SQLite (`db/custom.db`) — dev server na porta 3000.
- **Produção**: Vercel + Neon Postgres (ver `../DEPLOY.md`).
- **Comandos de validação**: `bun run lint` · `bunx tsc --noEmit` ·
  `bun scripts/validate-questions.ts` · `bun scripts/option-length-report.ts` ·
  `bun scripts/seed.ts` (idempotente, atualiza por chave) · `curl /api/health`.

## O fluxo de uma mudança

Entender → Registrar (spec curta) → Decidir → Implementar (um conceito por
vez) → Verificar (fidelidade, regressão, contrato Axon) → Atualizar (SDD, docs
e versão no mesmo lote) → Commitar → Publicar.

Nenhuma tarefa fecha por relato: fecha com diff, comando, teste ou verificação
que outra pessoa consiga repetir.

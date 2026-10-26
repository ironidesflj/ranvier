# Ranvier

Aplicativo gratuito para estudar para a certificação **Databricks Data Engineer Associate**.

O Ranvier oferece:

- simulados no formato do exame;
- modo estudo com feedback imediato, explicações e fontes oficiais;
- progresso por domínio e fila de revisão;
- funcionamento sem cadastro obrigatório, com progresso salvo no navegador;
- suporte a instalação como PWA.

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Query, Zustand e Prisma.

O desenvolvimento local usa SQLite. A produção usa Vercel com Neon Postgres.

## Desenvolvimento local

```bash
bun install
bun run db:generate
bun run db:seed
bun run dev
```

Validações:

```bash
bun run lint
bunx tsc --noEmit
bun run validate:questions
```

## Axon

O Ranvier é consumidor de `@ironidesflj/axon@0.2.1`, fixado por versão exata.
A adoção de IDs, aliases, checksum e manifesto acontece em fatias independentes,
conforme o contrato do pacote.

## Fontes e não afiliação

O conteúdo é baseado em documentação pública oficial da Databricks. As questões
são autorais; o projeto não reproduz itens reais do exame e não é afiliado,
patrocinado ou endossado pela Databricks, Microsoft ou Pearson VUE.

## Licença

Código sob MIT. Banco de questões e conteúdo sob CC BY-SA 4.0.

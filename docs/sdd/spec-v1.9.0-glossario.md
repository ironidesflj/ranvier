# Spec v1.9.0 — Glossário bilíngue

**Status: APROVADA E IMPLEMENTADA** (lote de código Task 24, 28/out/2026).
Aprovada pelo fundador ("specs aprovadas") junto com a v1.10.0 — ambas
embarcaram no mesmo redeploy (usuários saindo da v1.8.1 veem o popup da
v1.10.0 com os 2 itens). Escrita em 28/out/2026 (Task 23), após o fundador
aprovar a direção ("Seguir com glossario e offline flashcards").
Lote 100% aditivo: **zero banco, zero API nova, zero migração** — dados
estáticos no cliente, funciona offline por construção.

**Deviations from spec (registered, worklog Task 24):**
- ~78 verbetes → **94 verbetes finais** (escopo aprovado = apêndice + regras
  §2; a lista final fechou no lote de código com 8 verbetes bank-backed
  adicionais: copy-into, lakeflow-connect, jdbc, automation-bundle,
  databricks-cli, abac, spark-ui, predictive-optimization — todos
  outline-named com URL dedicada na allowlist; merges: cloudFiles→alias do
  Auto Loader, credential→storage credential, snapshot→time travel,
  late data→event time, workflow→job, isolation→job cluster, slow query→
  query history, code review→pull request).
- Ícone do rail: **BookText** (a spec dizia BookOpen, que já pertence ao
  Estudar — colisão evitada).
- Autofoco da busca: desktop apenas (mobile não abre teclado sozinho).

---

## 1 · Problema

A prova é em inglês; o aluno estuda em PT-BR. As explicações das 300 questões
já são bilíngues, mas não existe uma **camada de referência rápida**: quando
o aluno esquece o que é "external location" vs "storage credential", ele
precisa achar a questão certa ou sair do app. O glossário fecha essa lacuna
com o vocabulário que o banco **de fato usa** — nada de enciclopédia.

Divisão de trabalho (mantida): Estudar/Exame = reconhecimento; Flashcards =
evocação; Trilhas = sequência; **Glossário = consulta**. Não é modo de
estudo, é referência — sem SRS, sem sessão, sem contadores.

## 2 · Conteúdo — seleção por dados, não por gosto

Varredura real do banco (stems + alternativas + explicações, 300 questões,
Task 23): 88 termos técnicos candidatos com ≥1 ocorrência. Os mais
presentes: workspace (216), Unity Catalog (201), cluster (182), Lakeflow
(154), notebook (148), Auto Loader (99), grant (84), trigger (79),
metastore (73), shuffle (68), silver (68), serverless (56), bronze (53),
dashboard (53)…

**Regra de seleção:** entra no glossário todo termo com presença real no
banco E que seja conceito de estudo (não mera palavra do enunciado).
Curadoria inicial: **~78 verbetes** (lista completa no fim da spec — o que
se aprova aqui é o ESCOPO; as redações das definições são do lote de
código, seguindo as regras abaixo).

**Regras de redação (inegociáveis):**
- Gloss PT-BR e gloss EN, 1–2 linhas cada, voz das explicações existentes;
- **zero definição inventada**: cada verbete cita fonte oficial (docs
  Databricks/Microsoft — prioridade às 74/76 URLs da allowlist do CI,
  mesmas das questões; URLs novas entram só na allowlist com revisão);
- termo canônico em inglês (como a prova usa) + apelidos relevantes
  (ex.: "Auto Loader" ↔ "cloudFiles"; "DLT" ↔ "Lakeflow Declarative
  Pipelines");
- domínio(s) relacionado(s) para o filtro (S1–S7 oficiais).

## 3 · Arquitetura — estático no cliente

- `src/data/glossary.ts` — array tipado `{ slug, term, aliases?, glossPt,
  glossEn, url, domainCodes[] }`. Compila no bundle; **offline por
  construção** (não depende de rede, API ou banco — coerente com
  local-first).
- **Sem** endpoint, **sem** tabela, **sem** cache de borda, **sem** TanStack
  Query: dado estático = import direto.
- `scripts/validate-glossary.ts` (novo gate `validate:glossary`): slugs
  únicos, glosses não-vazios nos 2 idiomas, `url` na allowlist (reuso da
  lógica do ci:gate), `domainCodes` válidos contra as 7 siglas oficiais.
  Entra na bateria de gates do repo (não altera o ci:gate do banco de
  questões — gate separado, mesma filosofia).

## 4 · UI — view `glossary`, busca instantânea

- View nova + hash `#/glossario` (PT) / mantém `#/glossario` no EN? Não —
  padrão do app: hash único canônico por view (como `#/flashcards`).
  Hash: **`#/glossario`**.
- **Rail:** item "Glossário" (ícone `BookOpen`) **após Progresso**
  (Trilhas · Estudar · Flashcards · Exame · Progresso · **Glossário** ·
  Revisão-transitória). Mobile: 6 fixos + Mais → Glossário entra nos 6
  fixos e **Revisão** passa a viver só no Mais (junto de Ajustes/Sobre);
  Revisão continua transitória como hoje.
- Página: campo de busca (autofoco, `/` foca — desktop), **insensível a
  acentos/caixa**, casa termo + apelidos + glosses (PT e EN); chips de
  filtro por domínio (Todos + S1–S7 com os nomes curtos oficiais);
  contagem factual ("78 verbetes · 12 resultados"); lista de cards
  (scroll, `max-h` com scrollbar customizada — padrão do repo): termo EN
  em destaque, gloss no idioma da interface, apelidos em mono, fonte
  oficial como link externo, pills dos domínios.
- Estado vazio de busca: mensagem honesta + sugestão de limpar filtro.
- Sem Home CTA, sem bloco no Progresso (referência não precisa de
  funil — o rail basta; Home já está densa com trilhas/flashcards).

## 5 · i18n, versão e artefatos

- Bloco `glossary.*` PT/EN completo (busca, filtros, contagem, vazio,
  dica de teclado).
- Bump **v1.9.0** nas 5 casas (version.ts, package.json, sw.js
  `ranvier-v1.9.0`, offline.html) + popup **1 item** ("Glossário
  bilíngue de consulta — 78 verbetes com fonte oficial, funciona
  offline").

## 6 · O que NÃO muda (contratos intocados)

Banco de questões, manifesto/IDs/Axon, DB/Prisma, todas as APIs, modos
Estudar/Exame/Trilhas/Flashcards, SRS, merge, cascade, rate limits,
SW (estratégias da auditoria 28/out inclusive — glossário é bundle
estático, nem passa pelo fetch).

## 7 · Plano de verificação (QA sandbox)

1. Gates: lint · tsc · validate:questions (300) · validate:manifest
   (300/0/0) · **validate:glossary** · ci:gate --strict · selftest.
2. Navegador (sessão limpa, EN e PT): popup 1× 1 item; rail com
   Glossário (desktop 7 · mobile 6+Mais com Revisão no Mais); busca com
   termo EN, termo PT, apelido ("cloudfiles"), acento insensível
   ("organizacao" acha "OTIMIZAÇÃO"? — gloss EN/PT casam); filtro S3;
   contagem factual; link de fonte abre; teclado `/` foca busca;
   mobile 375 sem scroll horizontal; **offline** (devtools network
   offline → glossário continua 100% funcional — dado estático);
   zero erros de console.

## 8 · Nota de deploy

Redeploy simples, **sem passo de banco**. Verificação pós-deploy:
abrir `#/glossario`, buscar "unity catalog".

## 9 · Variantes avaliadas e descartadas (reabertura fácil)

- **Auto-link dos termos dentro das explicações das questões** — tocar o
  seed/manifesto por cosmética; rejeitado (as explicações já citam as
  fontes).
- **Diagrams/imagens por verbete** — escopo/autação desproporcional.
- **Áudio de pronúncia** — dependência externa, fora da filosofia.
- **SRS no glossário** — redundante com flashcards (quem quer evocação
  tem o modo certo).
- **API/server para o glossário** — pior em todos os aspectos que o
  bundle estático (custo, latência, offline).
- **Contribuição comunitária de verbetes** — pertence ao hub (Noos),
  não ao app.

## Apêndice — lista de verbetes (escopo proposto, ~78)

S1 Plataforma: workspace, notebook, dashboard, Databricks SQL, SQL
warehouse, serverless compute, DBU, all-purpose cluster, job cluster,
shared cluster, single-user cluster, autotermination, Photon, init
script, secrets/secret scope, SCIM, account console, Unity Catalog,
metastore, catalog, schema (objeto), managed table, external table,
view, dynamic view, materialized view, streaming table, volumes,
external location, storage credential, credential, lineage, system
tables, audit log, row filter, column mask, grants/privileges.

S2 Ingestão: Auto Loader, cloudFiles, structured streaming,
micro-batch, trigger, checkpoint, exactly-once, idempotency, Kafka
como source, sink/source, event time, late data, watermark.

S3 Transformação: Lakeflow, DLT, expectation, quarantine, medallion,
bronze/silver/gold, lakehouse, Delta Lake, Parquet, OPTIMIZE, VACUUM,
Z-order, liquid clustering, time travel, snapshot, clone, schema
evolution, type widening, change data feed, SCD, upsert/MERGE,
generated column, partition, shuffle, broadcast join, data skew.

S4 Jobs: job, task, workflow, trigger de job, retries/backoff,
concurrent runs, isolation.

S5 CI/CD: Databricks Repos, pull request, code review, mirror,
release/deployment mode (production/staging).

S6 Troubleshooting: query history, slow query, plano de execução,
driver/executor, Spark session, OOM/spill, cache.

S7 Governança: já coberto em S1 (Unity Catalog & cia) — verbetes
compartilhados via `domainCodes` múltiplos.

(Esquema de agrupamento para o filtro; a lista final de slugs fecha no
lote de código com o `validate:glossary` garantindo as regras do §2.)

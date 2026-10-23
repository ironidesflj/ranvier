# CertTrack — Worklog (SDD vivo)

Projeto: App gratuito de estudos e simulados para certificações do ecossistema Microsoft/Azure & Databricks.
Primeira certificação: **Databricks Certified Data Engineer Associate**.
Não afiliado a Databricks/Microsoft/Pearson VUE. Sem dumps — questões 100% originais com referências oficiais.

## Decisões do cliente (reunião de kickoff)

1. Idioma: toggle EN / PT-BR. Em EN: tudo em inglês. Em PT-BR: interface + conteúdo (explicações, guia) em PT-BR, **questões/simulados sempre em EN** (formato do exame real).
2. Simulado o mais próximo possível do exame real (formato oficial).
3. ~110+ questões no lançamento, com distribuição correta por peso de domínio.
4. Modelo de conformidade: questões originais + explicação + link oficial por questão (sem dumps, sem reproduzir questões reais/NDA).
5. DB: SQLite via Prisma no sandbox; schema portável para Neon/Postgres em produção.
6. Usuários: (b) anônimo com progresso no servidor (cookie de sessão anônima) + login opcional (e-mail/senha) que sincroniza/mescla o progresso.
7. MVP: modo estudo (feedback imediato), modo simulado (timer, nota, review), progresso por domínio, página da certificação com guia + links oficiais. V2: flashcards, trilhas, novas certificações.
8. Arquitetura multi-certificação, só Databricks DE Associate com conteúdo no lançamento.
9. Identidade visual "Azure-esque": azul #0078D4, dark mode por padrão, toggle claro/escuro.
- Extras aprovados: radar de progresso por domínio, fila de revisão de erros, página Sobre/Fontes.
- Autor: Ironides Junior — https://github.com/ironidesflj — https://www.linkedin.com/in/ironjunior/
- Google Ads: avaliar inclusão sutil (sem pop-up, sem atrapalhar o estudo) → decisão: AdSlot config-gated (env NEXT_PUBLIC_ADSENSE_CLIENT), nunca exibido durante simulado/estudo ativos.
- SDD: manter em /home/z/my-project/docs/SDD.md para futuros acompanhamentos ("nada se perde").
- Hospedagem (resposta ao cliente): recomendação Vercel (Hobby grátis) + Neon Postgres (free tier), repo GitHub sob ironidesflj; passo a passo no SDD.

---
Task ID: 0
Agent: Principal SaaS Transformation Lead + Product Architect (orquestrador)
Task: Kickoff, pesquisa oficial do exame, decisão arquitetural, fundação de dados.

Work Log:
- Confirmadas com o cliente as 9 decisões de produto + extras (acima).
- Acessada a página oficial https://www.databricks.com/learn/certification/data-engineer-associate via agent-browser.
- Baixado e lido o Exam Guide oficial (PDF, versão vigente "as of May 4, 2026"):
  https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf
- Fatos oficiais do exame (fonte: página oficial + Exam Guide May/2026):
  * 45 questões de múltipla escolha pontuadas (pode haver itens não pontuados não identificados)
  * 90 minutos de limite de tempo
  * Taxa: USD 200 (+ impostos locais)
  * Entrega: online proctored ou teste center; acessórios de teste: nenhum permitido
  * Pré-requisito: nenhum; treinamento + 6 meses de experiência hands-on altamente recomendados
  * Validade: 2 anos; recertificação a cada 2 anos
  * Idiomas do exame real: English, 日本語, Português BR, 한국어 (o exame real OFERECE PT-BR — informado ao cliente; app mantém questões em EN por decisão do cliente)
  * Código de manipulação de dados: SQL quando possível, senão Python
  * Nota de corte NÃO é publicada oficialmente → app usa 70% como "referência comunitária", rotulada com honestidade
- Domínios oficiais (7 seções, versão May/2026) e pesos:
  S1 Databricks Intelligence Platform — 6%
  S2 Data Ingestion and Loading — 21%
  S3 Data Transformation and Modeling — 22%
  S4 Working with Lakeflow Jobs — 16%
  S5 Implementing CI/CD — 10%
  S6 Troubleshooting, Monitoring, and Optimization — 10%
  S7 Governance and Security — 15%
- Distribuição oficial do simulado (45 questões, amostragem estratificada por peso):
  S1=3, S2=9, S3=10, S4=7, S5=5, S6=4, S7=7 (total 45, método maior resto)
- Banco de questões alvo (≥2× a necessidade por domínio): S1=8, S2=24, S3=25, S4=18, S5=12, S6=12, S7=17 → 116 questões.
- Verificadas ~50 URLs oficiais (docs.databricks.com via sitemap.xml + curl; página oficial do exame; guide PDF; training home) para usar como referências das questões.
- Metodologia anti-dump: questões autorais estilo cenário (semelhantes ao estilo dos 5 exemplos oficiais aposentados publicados no guia), sem copiar questões reais; referências apontam sempre para docs oficiais.

Stage Summary:
- Blueprint oficial capturado e registrado (fonte: May 2026 Exam Guide). Nenhuma dependência de memória.
- Referências oficiais validadas (HTTP 200 / presentes no sitemap oficial).
- Arquitetura decidida: Next.js 16 single-page (hash routing, apenas rota /), APIs REST em /api/*, Prisma+SQLite (portátil a Neon/Postgres), auth própria leve (scrypt + cookie HMAC httpOnly), sessão anônima server-side com merge no login, correção server-side (nunca expõe gabarito ao cliente), i18n próprio EN/PT-BR, ads config-gated fora das telas de estudo/exame.
- Time mapeado: SaaS Lead/Architect = orquestrador; Database Architect/Backend/Frontend/Security/UX = orquestrador + validações; Technical Writer = subagente (SDD); Red Team = subagente adversarial; QA = agent-browser E2E; redação de questões = 5 subagentes paralelos (Tasks 1-a..1-e).
---
Task ID: 1-d
Agent: Question Bank Author (S5 + S6)
Task: Author 12 S5 CI/CD questions + 12 S6 Troubleshooting questions

Work Log:
- Read worklog.md (Task 0 context), types.ts (SeedQuestion contract), s1-platform.ts (exemplar quality bar), certifications.ts (official May/2026 outline bullets for S5 and S6).
- Authored /home/z/my-project/src/data/questions/s5-cicd.ts — export const s5Questions, keys S5-001..S5-012, domainCode 5.
- Authored /home/z/my-project/src/data/questions/s6-troubleshooting.ts — export const s6Questions, keys S6-001..S6-012, domainCode 6.
- Coverage per official outline bullets:
  * S5 (4 bullets): Git Folder branch/commit/push/PR workflow (S5-001, S5-002 side-by-side branches, S5-003 PR-from-workspace); bundle variables/overrides per target (S5-004, S5-005 sequence-replacement override, S5-011); deploying bundles for Jobs/pipelines/assets across envs (S5-006, S5-012 deployment modes); CLI validate/deploy/run + SP auth in CI (S5-007, S5-008, S5-009, S5-010).
  * S6 (5 bullets): run history vs baseline trends (S6-001); Jobs UI statuses/DAG upstream blockers (S6-002) + repair runs (S6-003); Spark UI stage metrics for skew/shuffle/spill (S6-004 metrics block, S6-005 AQE skew join, S6-006 disk spill); Liquid Clustering + predictive optimization (S6-007, S6-008, S6-009); cluster startup failure/library conflict/OOM (S6-010, S6-011, S6-012).
- Current terminology used throughout: Automation Bundles (formerly Asset Bundles), Git Folders (formerly Repos), Lakeflow Jobs, Lakeflow Spark Declarative Pipelines (formerly DLT), Liquid Clustering, predictive optimization.
- Several stems carry code: ```yaml bundle snippets (targets/variables/overrides/resources), ```bash databricks bundle validate/deploy commands, ```text stage-metrics summary for skew diagnosis.
- Verified (read-only node script, no bun/lint/db/dev): 12 items/file, unique keys S5-001..S5-012 / S6-001..S6-012, exactly 4 options each (48 lines/file), correctIndex 0-3, every referenceUrl within the allowed verified list; TS syntax parses cleanly after type-stripping (backticks and \${...} escaped correctly inside template literals).
- No other files touched; no test files created.

Stage Summary:
- Counts: S5 = 12 questions (s5-cicd.ts), S6 = 12 questions (s6-troubleshooting.ts); 24 total new questions.
- Difficulty mix per file: 4 EASY (33%) / 6 MEDIUM (50%) / 2 HARD (17%) — matches ~30/50/20 target.
- correctIndex distribution per file: 0=3, 1=3, 2=3, 3=3 (perfectly uniform).
- Stem prose lengths 40-69 words (plus code blocks where present); explanations EN 61-95 words, PT-BR 66-101 words, written naturally (not literal translation).
- Anti-dump: all scenarios/wording original; no official sample or real exam items reproduced.
- Caveats for reviewer: (1) S5-005 relies on the documented override semantics (mappings merge per key; sequences are replaced wholesale) — double-check wording against docs/dev-tools/bundles/overrides; (2) S5-012 states production mode requires explicit run_as and dev mode appends a [dev] marker to deployed resource names — verify phrasing vs docs/dev-tools/bundles/deployment-modes; (3) S6-011/S6-012 reference compute/configure (closest allowed URL for init scripts/libraries); dedicated cluster-troubleshooting/library doc pages exist but were outside the allowed list; (4) referenceTitle strings are human-readable labels, not exact page <title>s.
---
Task ID: 1-e
Agent: Question Bank Author (S7)
Task: Author 17 S7 Governance and Security questions

Work Log:
- Read worklog.md, types.ts (SeedQuestion contract), s1-platform.ts (exemplar quality bar), certifications.ts (official S7 outline bullets: managed/external tables, GRANT/REVOKE/DENY hierarchy, row filters & column masks, ABAC policies).
- Fact-verified every answer against live official docs fetched via curl (text-extracted locally in /tmp/docverify): managed-versus-external, tables/external, tables/convert-to-managed, manage-privileges, filters-and-masks (+ manually-apply child page), abac/, abac/abac-vs-rls-cm (+ abac/core-concepts child page), permissions-concepts, sql-ref-privileges, sql-ref-syntax-ddl-create-table-using, security-deny, is_account_group_member. Confirmed key facts: DROP deletes files for managed tables (8-day retention) vs metadata-only for external; CREATE [EXTERNAL] TABLE ... LOCATION; managed storage location at schema/catalog/metastore level; ALTER TABLE ... SET MANAGED (external->managed, no MOVE/COPY; UNSET MANAGED rollback within 14 days); privilege inheritance to current+future children; USE CATALOG+USE SCHEMA+SELECT all required to read; REVOKE semantics ("succeeds even if never granted"); row filter / column mask UDF syntax (RETURN clause, SET ROW FILTER ... ON, ALTER COLUMN ... SET MASK, is_account_group_member); ABAC governed tags, has_tag()/has_tag_value(), TO/EXCEPT, policies set at higher level cannot be removed by table owners, evaluated before runtime, "act like future grants".
- Wrote NEW file /home/z/my-project/src/data/questions/s7-governance.ts: export const s7Questions, 17 questions S7-001..S7-017, stems in EN with fenced ```sql blocks (escaped backticks), 4 options each, single best answer, bilingual explanations, referenceUrl only from the allowed list.
- Verified programmatically (python structural checks) + compiled with project tsc (--noEmit --strict) — COMPILE OK. No other files modified; no bun/lint/db/dev commands run.

Stage Summary:
- Count: 17/17 questions (S7-001..S7-017), domainCode=7, exactly 4 options each, no all/none-of-the-above.
- Difficulty mix: EASY 5 (29%), MEDIUM 9 (53%), HARD 3 (18%).
- correctIndex distribution: 0->4, 1->5, 2->4, 3->4 (uniform, 4-5 per index).
- Outline bullet coverage: managed vs external + operations = 5 (S7-001 drop semantics, S7-002 CREATE EXTERNAL TABLE, S7-003 managed storage location, S7-004 SET MANAGED conversion, S7-005 managed CTAS); GRANT/REVOKE/DENY + hierarchy + principals = 6 (S7-006 inheritance/schema-level grants, S7-007 USE CATALOG/USE SCHEMA, S7-008 GRANT syntax, S7-009 REVOKE vs group-derived access, S7-010 DENY overrides GRANT, S7-011 groups/service principals); row filters & column masks = 3 (S7-012 row filter who-sees-what, S7-013 ALTER COLUMN SET MASK syntax, S7-014 mask who-sees-what); ABAC = 3 (S7-015 governed tags matching, S7-016 central catalog-level policies, S7-017 ABAC vs table-level comparison).
- Reference URLs used (all from allowed list, all verified live today): managed-versus-external (x3), tables/external (x1), tables/convert-to-managed (x1), manage-privileges (x6), unity-catalog/ (x1), filters-and-masks (x3), abac/ (x1), abac/abac-vs-rls-cm (x2). Explanations 82-116 words EN / 85-119 words PT-BR (natural, non-literal).
- Caveats for review: (1) S7-010 (DENY overrides GRANT) matches the exam outline bullet and classic Databricks teaching; current docs note the DENY *statement* is hive_metastore-only while UC explicit denials are ABAC DENY policies (Beta) — the question is phrased conceptually and the explanation states this nuance; reference manage-privileges is the closest allowed page for GRANT/REVOKE/DENY. (2) The allowed URL .../access-control/table-acl currently 404s (docs moved to .../table-acls/table-acl), so it was deliberately not cited. (3) S7-001 explanation mentions managed-table DROP file deletion "after a short retention period" per current docs (8-day) without hard-coding the number. (4) S7-011 "grant to groups" best practice is standard Databricks guidance; referenced page states the three principal types.
---
Task ID: 1-b
Agent: Question Bank Author (S2)
Task: Author 24 S2 Data Ingestion and Loading questions

Work Log:
- Leu worklog.md, types.ts (SeedQuestion), s1-platform.ts (exemplares) e certifications.ts (outline oficial S2, 7 bullets).
- Fato crítico de precisão: buscou as páginas oficiais vigentes (out/2026) via curl para verificar TODOS os fatos antes de escrever: COPY INTO (idempotência/exactly-once, sintaxe, mergeSchema/schemaless, pré-requisito external location + READ FILES, fontes S3/ADLS/GCS/volumes), Auto Loader (fonte cloudFiles via readStream, checkpoint RocksDB/exactly-once, inferência JSON=string por padrão + inferColumnTypes, schemaEvolutionMode addNewColumns/ addNewColumnsWithTypeWidening/ rescue/ failOnNewColumns/ none, UnknownFieldException + restart via Lakeflow Jobs, _rescued_data, schemaHints, scale milhões de arquivos/h), directory listing (padrão, sem permissões extras), file notification (SNS+SQS/S3, Event Grid+Queue/ADLS, Pub/Sub/GCS, prefixos e limites), best practices (Trigger.AvailableNow, lifecycle policy no checkpoint = estado corrompido, modos de descoberta), Lakeflow Connect (conceitos: connection UC + pipeline serverless + streaming tables; ingestão incremental; retries; conector Salesforce), Ingest with SQL and Spark APIs, batch-vs-streaming, medallion (bronze raw), Kafka Structured Streaming (format "kafka", key/value binários, from_json) e JDBC (partitionColumn/lowerBound/upperBound/numPartitions, fetchSize, aviso numPartitions).
- Nota de terminologia: docs atuais (2026) NÃO listam "permissive" como valor de cloudFiles.schemaEvolutionMode (valores reais: addNewColumns, addNewColumnsWithTypeWidening, rescue, failOnNewColumns, none) — evitado o distrator incorreto; "incremental listing" está deprecado nas docs atuais e não foi afirmado como recomendado.
- Escreveu /home/z/my-project/src/data/questions/s2-ingestion.ts (NOVO): export const s2Questions, 24 questões S2-001..S2-024, domainCode 2, stems em EN com 9 blocos de código (```sql/```python/```json), 4 opções cada, explicações EN (72–99 palavras) + PT-BR naturais, referenceUrl sempre da lista permitida.
- Verificação estrutural via script Python (sem rodar bun/lint/db/dev): 24 itens, chaves únicas e sequenciais, 4 opções, correctIndex 0–3, URLs permitidas, paridade de chaves/colchetes, template literals íntegros (fences escapados, sem ${), sem "all/none of the above".
- Não modificou nenhum outro arquivo.

Stage Summary:
- 24 questões (S2-001..S2-024). Dificuldade: 7 EASY (29%), 12 MEDIUM (50%), 5 HARD (21%).
- correctIndex: 0=6, 1=6, 2=6, 3=6 (uniforme).
- Cobertura dos 7 bullets do outline: (1) padrões batch/streaming/incremental (S2-001) + arquivos locais via volume UC (S2-002); (2) COPY INTO sintaxe/idempotência/mergeSchema/external location (S2-002..005); (3) Auto Loader: snippet cloudFiles, checkpoint/exactly-once, perda de checkpoint, listing vs notification (2 ângulos: alto volume × política de segurança), recursos SNS/SQS, inferência JSON strings, addNewColumns/UnknownFieldException, modo rescue, _rescued_data, schemaHints, Trigger.AvailableNow (S2-006..017); (4) Lakeflow Connect configuração/características (S2-019, S2-020); (5) JDBC paralelizado (S2-021) + REST em notebook orquestrado por Lakeflow Jobs (S2-022); (6) priorização Auto Loader × COPY INTO × managed connectors (S2-018, S2-019); (7) semiestruturado: JSON aninhado via Auto Loader (S2-012, S2-016) + Kafka/Confluent via streaming (S2-023). Medallion bronze (S2-024).
- Uso de URLs: auto-loader/ ×8, copy-into ×4, best-practices ×2, file-notification ×2, lakeflow-connect ×2, batch-vs-streaming/directory-listing/ingestion/jobs/kafka/medallion ×1 cada — todas da lista permitida.
- Caveats para revisão: (a) S2-021 (JDBC) referencia a URL permitida mais específica disponível (/ingestion/ = "Ingest with SQL and Spark APIs"); os fatos de particionamento JDBC são opções padrão do Spark documentadas na Databricks, mas a página dedicada de JDBC não está na lista permitida; (b) S2-020 menciona conector gerenciado de Confluent Kafka (alinhado ao Exam Guide May/2026; docs atuais citam RabbitMQ como exemplo de streaming connector) — a questão testa componentes/arquitetura, não o catálogo de conectores; (c) terminologia "standard connectors" do exam guide tratada como camada SQL/Spark APIs auto-gerenciada versus managed connectors serverless (S2-019/S2-020); (d) explicações PT-BR levemente acima das EN em contagem bruta de tokens (uso de em-dashes), dentro do esperado.
---
Task ID: 1-a
Agent: Question Bank Author (S1 + S4)
Task: Author 6 additional S1 questions + 18 S4 questions

Work Log:
- Read worklog.md, types.ts (SeedQuestion contract), s1-platform.ts (exemplars S1-001/S1-002) and certifications.ts (official outline bullets + exam facts).
- Fetched and read the current official docs (docs.databricks.com/aws/en) for every topic before writing: jobs/control-flow, jobs/tasks/if-else, jobs/tasks/for-each, jobs/task-values, jobs/configure-task, jobs/configure-job, jobs/triggers, jobs/scheduled, jobs/file-arrival-triggers, jobs/trigger-table-update, jobs/repair-job-failures, jobs/notifications, jobs/compute, jobs/ (index), jobs/tasks/notebook, compute, compute/configure, compute/cluster-config-best-practices, introduction (all pages dated Sep-Oct 2026 updates; facts extracted to /tmp/dbdocs/*.txt).
- Extended src/data/questions/s1-platform.ts in place: kept S1-001/S1-002 untouched, appended S1-003..S1-008 to the same exported `s1Questions` array (8 total), updated only the header comment.
- Created src/data/questions/s4-jobs.ts (new): exported `s4Questions` with S4-001..S4-018.
- All questions scenario-based, single best answer, 4 options, no "all/none of the above"; bilingual explanations (EN + natural PT-BR); referenceUrl strictly from the allowed list; current terminology (Lakeflow Jobs, Lakeflow Spark Declarative Pipelines, Git Folders, with occasional "(formerly X)").
- Anti-dump: 100% original scenarios/wording; answers grounded in doc facts fetched during this session (run-if condition list, if/else == string-comparison semantics, for-each concurrency default 1, task-value 48 KiB / dynamic value syntax, file-arrival cooldown vs debounce options, table-update any/all, max concurrent runs default 1 + queueing 48h, job-level notifications suppressed during retries, repair-run semantics incl. new job cluster, JAR/Spark Submit classic-only, SQL task on serverless/pro SQL warehouse, etc.).
- Verification: `tsc --noEmit` on s1-platform.ts + s4-jobs.ts + types.ts compiles clean; structural script confirms counts (8 / 18), unique keys, exactly 4 options each, correctIndex in 0-3, all referenceUrls from allowed list, stems 40+ words, explanations 60-120 words. No other project files modified; no bun/lint/db/dev commands run; no test files created.

Stage Summary:
- FILE A (s1-platform.ts): 8 questions total (S1-001..S1-008). Additions difficulty: 2 EASY, 3 MEDIUM, 1 HARD (file totals: 3 EASY / 4 MEDIUM / 1 HARD). correctIndex totals: 0:2, 1:3, 2:1, 3:2 (additions alone: 0:2, 1:1, 2:1, 3:2 — within ~1-2 per index; residual skew comes from both exemplars sitting at index 1).
- FILE B (s4-jobs.ts): 18 questions (S4-001..S4-018). Difficulty: 5 EASY (27.8%), 9 MEDIUM (50%), 4 HARD (22.2%). correctIndex: 0:4, 1:5, 2:5, 3:4.
- S1 outline coverage: core components (Unity Catalog governance — S1-003; Lakeflow Jobs as orchestration component — S1-008; exemplars cover lakehouse/Delta) and compute services selection/limitations/cost (serverless for jobs — S1-004; SQL warehouse for BI — S1-005; JAR task classic-only — S1-006; GPU/ML-runtime classic vs serverless — S1-007; job cluster exemplar S1-001).
- S4 outline coverage: control flows (retries S4-003, run-if "All done" S4-002, if/else branching S4-004/S4-005, for-each looping S4-006); common tasks + dependencies + DAG (DAG failure propagation S4-001, task types SQL/pipeline/dashboard S4-009, notebook parameters S4-008, SQL task compute S4-010, shared job cluster S4-011); schedules & triggers (file arrival S4-013/S4-014, table update S4-015, scheduled/cron S4-016, time-based vs data-driven choice S4-016); operational extras per brief (task values S4-007, concurrent runs/queueing S4-012, notifications-on-retried-failure S4-017, repair run S4-018).
- Caveats for review: (1) S4-009/S4-010/S4-004 reference configure-task / jobs/compute / if-else — most specific allowed URLs; the Dashboard-task behavioral detail ("refreshes a published dashboard") is substantiated by docs page jobs/tasks/dashboard which is NOT in the allowed URL list, so configure-task (which lists the Dashboards task type) is used as reference for S4-009. (2) S4-012 mentions queueing default "on for UI-created jobs after Apr 15, 2024" — verified on configure-job page. (3) S1-005 mentions JDBC/ODBC BI connectivity as scenario context; the substantive fact (SQL warehouses = compute optimized for SQL/analytics/BI) is on the referenced compute page. (4) Difficulty/correctIndex of the two pre-existing exemplars was fixed; final S1 distribution is as uniform as possible given both sit at index 1.
---
Task ID: 1-c
Agent: Question Bank Author (S3)
Task: Author 25 S3 Data Transformation and Modeling questions

Work Log:
- Read worklog.md, types.ts (SeedQuestion contract), s1-platform.ts (exemplar quality bar), certifications.ts (official May 2026 outline for Section 3, 22% weight).
- Verified every allowed reference URL is live (HTTP 200) and extracted page text to fact-check answers against current docs: AQE page (spark.sql.shuffle.partitions default 200, coalescing, sort-merge→broadcast switch, skew splitting, enabled by default); tables/constraints (NOT NULL/CHECK enforced; PK/FK informational only); ldp/concepts/materialized-views ("cache the results and refresh them on a specified interval", "precomputed"); ldp/concepts/streaming-tables ("process inputs only once", "checkpoint management", ingestion from cloud object storage via Auto Loader); sql-ref-syntax-ddl-create-materialized-view (SCHEDULE CRON '0 0 2 * * ?' AT TIME ZONE clause, six-field quartz cron with '?', CONSTRAINT name EXPECT (expr) ON VIOLATION {FAIL UPDATE | DROP ROW} expectations, default warn when ON VIOLATION omitted); sql-ref create-streaming-table + read_files (STREAM(read_files(..., format => 'json')) pattern); pyspark/reference/functions (broadcast() documented: "Marks a DataFrame as small enough for use in broadcast joins"); lakehouse/medallion (bronze raw / silver validated / gold enriched); delta/merge (upsert semantics).
- Wrote NEW file src/data/questions/s3-transformation.ts exporting s3Questions: 25 original scenario questions S3-001..S3-025, domainCode 3, bilingual explanations (EN + natural PT-BR), fenced code in 14 stems (```python / ```sql) plus 4 questions whose options are SQL/PySpark code snippets (18/25 code-involving; exam code note: SQL when possible, otherwise Python respected).
- Structural validation via node import of a de-typed copy in /tmp (then deleted): 25 items, unique sequential keys, exactly 4 options each, correctIndex in 0..3, all 10 fields present, referenceUrl only from the allowed list, no ${} interpolation hazards. Also fixed one PT typo ("tareças"→"tarefas") and expanded two stems below the 40-word floor (S3-009, S3-022).
- Did NOT touch any other file; no bun/lint/db/dev commands run; no test files created in the project.

Stage Summary:
- Count: 25 questions (S3-001..S3-025), file src/data/questions/s3-transformation.ts, export s3Questions.
- Difficulty mix: 7 EASY (28%), 13 MEDIUM (52%), 5 HARD (20%).
- correctIndex distribution: 0→6, 1→7, 2→6, 3→6 (within the 6-7 target).
- Outline-bullet coverage: (1) bronze→silver cleaning/nulls/types: S3-001 fillna, S3-002 COALESCE, S3-003 cast, S3-004 medallion responsibilities, S3-005 dropna how/all; (2) combining DataFrames: S3-006 inner join cardinality, S3-007 multi-key fan-out fix, S3-008 broadcast join + autoBroadcastJoinThreshold, S3-009 cross join/Cartesian, S3-010 union vs unionAll; (3) column/row manipulation: S3-011 split/drop/rename chain, S3-012 explode, S3-013 filter NULL-semantics trap; (4) dedup/aggregations: S3-014 dropDuplicates nondeterminism vs window, S3-015 summary(), S3-016 approx_count_distinct, S3-017 MERGE upsert; (5) tuning: S3-018 spark.sql.shuffle.partitions (default 200) + re-measure, S3-019 AQE capabilities, S3-020 executor memory OOM; (6) gold objects: S3-021 view vs MV, S3-022 CREATE MATERIALIZED VIEW + SCHEDULE CRON, S3-023 CREATE OR REFRESH STREAMING TABLE + STREAM(read_files); (7) data quality: S3-024 enforced vs informational constraints, S3-025 SQL expectations ON VIOLATION DROP ROW (+ @dlt.expect_or_drop/expect_or_fail/expect equivalents in explanations).
- Reference URL usage: pyspark/reference/functions x12, spark-sql language-manual functions x3, lakehouse/medallion x1, delta/merge x1, optimizations/aqe x2, compute/configure x1, ldp/concepts/materialized-views x1, sql-ref create-materialized-view x2, ldp/concepts/streaming-tables x1, tables/constraints x1.
- Caveats for review: (a) fillna/dropna/dropDuplicates/join are DataFrame methods, so the pyspark/reference/functions URL is the closest allowed PySpark reference but does not document those methods verbatim (broadcast/split/summary/union DO appear on that page); (b) S3-025 tests the SQL expectations syntax (CONSTRAINT ... EXPECT ... ON VIOLATION DROP ROW) because it is verifiable on the allowed CREATE MATERIALIZED VIEW page — the classic Python @dlt.expect* decorators are only covered in the explanation text; (c) S3-023's "materialized view" distractor is wrong on object-choice grounds (ST page positions streaming tables for append-only ingestion); I avoided claiming MV+STREAM() is syntactically invalid since I could not verify that verbatim; (d) autoBroadcastJoinThreshold 10 MB default stated in S3-008 explanation is standard Spark config, not verifiable on the specific allowed page used.
---
Task ID: 6
Agent: QA Lead (orquestrador + agent-browser)
Task: QA end-to-end do app completo no navegador

Work Log:
- Lint limpo (0 erros) após correções do React Compiler (componentes fora do render, memoização, hidratação deliberada documentada).
- Fluxos verificados no agent-browser (desktop 1280x800 e mobile 390x844):
  * Home renderiza (PT detectado via toggle; EN por locale do navegador); fatos oficiais (45/90min/70%ref/$200) corretos.
  * Simulado completo: criação (201), timer 89:55→contando, paleta 45 questões, resposta persistida no servidor (verificado via API), diálogo de entrega com contagem de não respondidas, submissão → resultados (2%, 1/45), distribuição por domínio exatamente oficial (3/9/10/7/5/4/7=45).
  * Revisão pós-exame: 45 blocos de explicação + 45 links oficiais renderizados.
  * Retomada: reload no meio do exame restaura respostas (2/45) e pula para a 1ª não respondida.
  * Modo estudo: config (domínios+quantidade), feedback imediato (Correto!/Incorreto + explicação PT + link oficial), resumo, submissão, resultados.
  * Progresso: estatísticas, radar S1–S7, barras por domínio, fila de revisão (50), histórico com Revisar/Retomar.
  * Auth: registro (qa@certtrack.dev), merge do progresso anônimo (55 questões preservadas), menu do usuário (Sair/Excluir conta), nota anônima some após login.
  * Guia e Sobre renderizam; autor com GitHub (ironidesflj) e LinkedIn (ironjunior) linkados; guia oficial (PDF) linkado.
  * Mobile: sem overflow horizontal, menu hamburger (Sheet) OK, rodapé no fim da página (sticky por construção flex).
  * Console do navegador: zero erros de página (aviso cosmético do Radix corrigido com aria-describedby).
  * Log do servidor: apenas 200/201; 404 corretos em acesso cross-owner (sem cookie) — isolamento funcionando.
- Bugs encontrados e corrigidos durante o QA:
  1. Vazamento de "}" no formatador de plurais (regex não consumia a chave externa do bloco plural ICU) — corrigido em src/lib/i18n.ts.
  2. A11y: SheetContent sem descrição — corrigido com aria-describedby={undefined}.
  3. Warning de cross-origin no dev — allowedDevOrigins adicionado ao next.config.ts (+ headers de segurança).
- Teste adversarial do timer: attempt backdated 100 min via Prisma; GET do detail retornou COMPLETED 0/45 com durationSec=5520 (cap de 92 min) — imposição do tempo no servidor funciona sem depender do cliente.

Stage Summary:
- Golden path completo verificado ponta a ponta: landing → simulado → entrega → resultados/revisão → estudo → progresso → auth/merge → mobile.
- 3 correções aplicadas; zero erros de console e de servidor.
- App pronto para Red Team Review (Task 8) e SDD (Task 7).
---
Task ID: 7
Agent: Technical Writer
Task: SDD completo em docs/SDD.md

Work Log:
- Lido o worklog.md integralmente (kickoff, Task 0, Tasks 1-a..1-e, Task 6) como fonte de verdade do histórico.
- Explorado o codebase em modo leitura (nada modificado): prisma/schema.prisma; src/lib/{auth,session,attempt-service,rate-limit,types,i18n,api-client,api-helpers,db}.ts; todas as rotas src/app/api/**/route.ts (catalog, attempts, attempts/[id], answer, submit, progress, auth/register|login|logout|me, account, e a rota de scaffold GET /api); src/data/certifications.ts (+EXAM_DISTRIBUTION), src/data/guide.ts, src/data/questions/types.ts e contagem das 116 questões (8/24/25/18/12/12/17 confirmada por script); src/components/app/*.tsx (views, ad-slot, language-provider, markdown, certtrack-app); src/store/app-store.ts; next.config.ts; package.json; scripts/seed.ts e scripts/validate-questions.ts.
- .env inspecionado apenas para CONFIRMAR nomes de variáveis (DATABASE_URL, SESSION_SECRET) — valores jamais impressos.
- Coletadas as famílias de referenceUrls oficiais usadas pelas 116 questões (todas em docs.databricks.com/aws/en/...).
- Verificado estado do git: .gitignore cobre .env*/node_modules/.next/logs/skills, mas NÃO cobre db/ — db/custom.db está trackeado (documentado como checagem crítica no passo de deploy do SDD).
- Escrito /home/z/my-project/docs/SDD.md (626 linhas, PT-BR com termos técnicos em EN), com as 16 seções exigidas, 2 diagramas mermaid (fluxo + ER), tabelas de API/DTOs/segurança/ADR/roadmap e blocos de comando. Nenhum outro arquivo modificado; nenhum comando bun/lint/db/dev executado.

Stage Summary:
- SDD v1.0.0 cobre: visão do produto (gratuito, não-afiliado, autor Ironides Junior); fatos oficiais do exame (45 questões/90 min/USD 200/7 domínios 6-21-22-16-10-10-15/versão May 4 2026/idiomas incl. PT-BR/Pearson VUE/validade 2 anos/70% rotulado como referência comunitária) com as 2 fontes oficiais completas; equipe de 10 papéis e governança (gate Red Team); arquitetura Next.js 16 single-page + hash routing, correção 100% server-side, sessão anônima ct_anon + login ct_session com merge; modelo de dados com cascatas; API REST completa (12 endpoints com propriedade e códigos de erro); segurança com threat model mitigado vs aceito (crawling do gabarito = risco aceito, mitigado por rate limit); metodologia de conteúdo/IP (anti-dump, referenceUrl oficial por questão, maior-resto, licenças MIT + CC BY-NC-SA 4.0); guia de como adicionar questões/certificações (pipeline validate → seed idempotente); i18n (dicionário único, questões sempre EN, explicações bilíngues, format() plural ICU-like, ct-lang); política e ativação de AdSense config-gated (+ alternativa GitHub Sponsors); deploy passo a passo (GitHub + Vercel + Neon, com a checagem crítica do db/ não ignorado); 8 ADRs; roadmap v2+; manutenção (worklog como SDD vivo); changelog v1.0.0 (2026-10-22).
- Limitações documentadas com honestidade: rate limit in-memory single-instance; NextAuth instalado mas não usado; GET /api de scaffold; ignoreBuildErrors do sandbox; seleção de certificação fixa na UI enquanto houver só uma; validador com contagens hardcoded (precisa atualizar `expected` ao adicionar questões).
---
Task ID: 8-a
Agent: Red Team Reviewer — Front A (API/segurança)
Task: Ataques de API — vazamento de gabarito, IDOR, validação, idempotência, rate limit, cascata

Work Log:
- A1 Vazamento de gabarito: GET /api/catalog?lang=pt (200) — 0 ocorrências de correctIndex/explanationEn/explanationPt/referenceUrl; keys = id,slug,vendor,name,shortName,versionLabel,durationMin,questionCount,passingScore,passingScoreIsOfficial,fee,languages,delivery,officialUrl,guideUrl,trainingUrl,description,codeNote,domains,totalQuestions. POST /api/attempts EXAM (201, jar fresh ct_anon) — 45 questões, keys por questão = id,domainCode,domainName,domainNamePt,difficulty,stem,options (limpo). GET detail IN_PROGRESS (200) — keys top = answers,attemptId,durationMin,mode,questions,result,startedAt,status; result=null; answers=<id>:null; zero campos de gabarito. Resposta de answer em EXAM = {"stored":true} (sem feedback).
- A2 IDOR: GET /api/attempts/<A-id> com jar B → 404 "Attempt not found"; sem cookies → 404; owner (jar A) → 200. Isolamento por owner confirmado.
- A3 Resposta sem posse: POST answer com jar B e sem cookies → 404 "Attempt not found" (não 400/403 que revelaria existência).
- A4 Questão fora do conjunto: questionId "nonexistent123" → 400 "Question is not part of this attempt"; bônus: id real do banco fora do attempt → 400 idem; selectedIndex 99/-1/"1" (string) → 400 "Invalid request body".
- A5 Corpos inválidos: {"certSlug":"x","mode":"HACK"} → 400; EXAM+limit:999 → 400; STUDY+domainCodes:[99] → 400; STUDY limit:999 → 400; sem body/array/garbage JSON → 400. dev.log: nenhum stack trace novo por estes ataques; varredura completa = apenas 2×500 (ver achado F1), zero TypeError/Unhandled.
- A6 Double submit: submit #1 e #2 → 200 com JSON byte-idêntico (COMPLETED 1/45, durationSec, byDomain estáveis); answer pós-submit → 400 "Attempt already submitted". Idempotente.
- A7 Rate limit login: 10×401 "Invalid email or password." → 11ª e 12ª = 429 "Too many requests. Please slow down." com retry-after: 300. Limite 10/5min confirmado.
- A7-bypass (ACHADO F2): X-Forwarded-For forjado (1.2.3.4 / 5.6.7.8) cria buckets novos no rate-limit.ts clientIp() (primeiro valor do header) → login 401 processado enquanto bucket "local" ainda 429 → bypass completo do rate limit de auth (e por consequência da mitigação documentada anti-crawl/anti-bruteforce). Reproduzido 2×.
- A8 Enumeração: register com e-mail existente (qa@certtrack.dev) → 409 "Unable to create the account with these credentials." (texto genérico) vs e-mail novo → 201 (ACHADO F3: código de status + timing ~6-8ms vs ~40-46ms permitem enumerar contas; e-mail normalizado p/ minúsculas — "QA@..." também 409). Login NÃO é enumerável: mensagem idêntica e timing ~36-47ms para e-mail inexistente vs existente.
- A9 Fluxo via API: register redteam-a@certtrack.dev/redteam12345 → 201 (userId cmvjttrbg005vskrq5tqniein, cookie ct_session httpOnly); STUDY limit 5 → 201 (5 questões); answer 1 questão → 200 COM correctIndex=2, correct=false, explanationEn/explanationPt/referenceUrl/referenceTitle (by design estudo); submit → 200 COMPLETED 0/5; GET detail → 200 COMPLETED com review (correctIndex/explanations/references/selectedIndex por questão, answers map 1 respondida). DELETE /api/account → 200 {"ok":true}; GET /api/auth/me com cookie antigo → {"user":null}. Prisma read-only (bun -e findMany): user=null, attempts(userId)=0, attempts(anonId)=0, answers=0 — cascata íntegra, zero linhas órfãs.
- A9-bypass (ACHADO F1): cookie ct_session HMAC-válido de usuário deletado → POST /api/attempts = 500 "Internal server error" (Prisma P2003 FK em attempt-service.ts:158; evidência pré-existente na linha 400 do dev.log de teste anterior de outro agente + minha reprodução na linha 540). GET /api/progress com mesmo cookie → 200 (degrada bem); só a criação de attempt quebra → usuário daquele browser fica bloqueado até o cookie expirar.
- A10 Mutações sem auth: DELETE /api/account sem sessão → 401 "Authentication required."; com ct_session forjado → 401 (HMAC rejeita); POST /api/attempts garbage JSON sem cookie → 400; GET attempt com cookie forjado → 404 (não vaza existência).
- Dados descartáveis criados (além do redteam-a, deletado): contas probe redteam-probe-tmp@certtrack.dev + 3 contas nope-*@certtrack.dev (senha guessing12345) exigidas pelo teste A8 de e-mail novo/timing (regra proíbe deletá-las — apenas redteam-a era deletável); tentativas anônimas throwaway (rt1/rtB/rtC/rtE). Nenhum arquivo do projeto modificado; apenas append neste worklog; sem bun dev/build/lint/db:push/db:seed; prisma somente leitura.

Stage Summary:
- Verdict front A: REPROVADO — 2 HIGH corrigíveis (nenhum CRITICAL, nenhum vazamento de gabarito, nenhum IDOR):
  * F1 (HIGH, robustez/DoS funcional): sessão ct_session órfã pós-delete de conta → 500 P2003 persistente em POST /api/attempts até expirar cookie. Fix: ao resolver sessão, checar existência do usuário e invalidar/reemitir identidade anônima (ou capturar P2003 e rebaixar).
  * F2 (HIGH, segurança): clientIp() confia no primeiro X-Forwarded-For → rate limit de auth/startAttempt/answer/submit burlável por rotação de header; invalida mitigação documentada do risco aceito de crawl do banco (respostas STUDY expõem correctIndex+explicações por design). Fix: usar IP confiável da plataforma (último XFF/vercel) ou chave por conta, e store compartilhado.
  * F3 (MEDIUM→LOW): enumeração de contas no register via 409-vs-201 + timing (~6ms vs ~40ms); login limpo. Fix: resposta uniforme + caminho de tempo constante.
  * F4 (INFO): mensagem 429/401/404/400 genérica e consistente; nenhum stack trace vazou ao cliente; retry-after presente.
- Ataques que NÃO quebraram: gabarito pré-conclusão (catalog/create/detail/answer-EXAM limpos), IDOR cross-owner (404), answer sem posse (404), questão fora do conjunto (400), selectedIndex inválido (400), corpos inválidos (400 sem crash), double submit idempotente, rate limit nominal 10/5min, enumeração via login (msg+timing idênticos), unauth mutations (401), cookie forjado (401/404), cascata de delete (0 linhas), submit pós-submit (400).
---
Task ID: 8 (orquestração) + 8-b (Front B executado pelo orquestrador)
Agent: Red Team Reviewer (Front A: subagente) + SaaS Transformation Lead (fixes, Front B, regressão)
Task: Revisão adversarial completa + correções + re-verificação

Work Log:
- Front A (subagente, Task 8-a): 10 ataques de API executados com evidências. Veredito inicial: REPROVADO com 2 HIGH + 1 MEDIUM (nenhum CRITICAL, nenhum vazamento de gabarito, nenhum IDOR):
  * F1 (HIGH): sessão órfã pós-DELETE /api/account causava 500 na criação de tentativas.
  * F2 (HIGH): rate limit confiava no primeiro X-Forwarded-For (spoofável) — bypass de força bruta demonstrado.
  * F3 (MEDIUM): enumeração de conta no registro via status 409/201 + timing (~6ms vs ~40ms).
  * Defesas que SEGURARAM: gabarito não vaza em nenhum GET; IDOR bloqueado (404); resposta fora do conjunto (400); corpos inválidos (400 sem stack trace); double-submit idempotente; rate limit nominal 429+Retry-After; login não enumerável; cascata de deleção sem órfãos; mutações sem sessão (401); cookie forjado rejeitado por HMAC.
- Correções aplicadas pelo orquestrador:
  * F1: resolveOwner() agora verifica existência do usuário; sessão órfã é limpa e cai em identidade anônima (regressão: 500 → 201 verificado por curl).
  * F2: clientIp() usa o último IP público do XFF (IP anexado pelo proxy confiável), nunca o primeiro valor; privado/loopback filtrados (regressão verificada: bucket 'local' esgotado → 429; XFF "spoof, real" → chave = IP real).
  * F3: timing equalizado no registro com scrypt dummy; 409 genérico mantido (residual documentado no SDD).
- Front B (executado pelo orquestrador após timeout do subagente):
  * Higiene do repositório: .gitignore agora cobre .env, db/, dev.log, agent-ctx/; git rm --cached .env db/custom.db executado (vazamento de segredo+banco CORRIGIDO — achado crítico do Technical Writer confirmado e resolvido); .env.example criado com placeholders.
  * Spot-check de acurácie das 5 questões sinalizadas pelos redatores (contra docs oficiais ao vivo):
    - S4-009 ✓ (docs: "dashboard task... to refresh a published dashboard").
    - S5-005 ✓ (docs overrides: "the setting in the targets mapping takes precedence"; sequências sem chave são substituídas — comportamento DAB).
    - S5-012 ✓ (docs deployment-modes: mode: production + run_as service principal; [dev] marker no dev mode).
    - S7-010 ✓ conceitualmente alinhado ao edital oficial ("GRANT, REVOKE, and DENY") com nuance UC/ABAC divulgada na explicação.
    - S2-021 ✓ resposta correta (partitionColumn/lowerBound/upperBound/numPartitions); referência melhorada para a página oficial dedicada de JDBC (connect/external-systems/jdbc) + reseed.
  * Limpeza de dados de teste: 5 contas descartáveis (QA + Red Team) removidas com cascata; 0 usuários restantes no dev DB; seed de produção contém apenas certificações/domínios/questões (nenhum usuário).
- UX walk e mobile já cobertos no QA (Task 6); nenhuma regressão introduzida pelas correções (lint 0 erros; home/loading/APIs re-verificados no navegador; dev.log sem erros).
- SDD atualizado: seção 7 (threat model) reflete F1/F2 mitigados e F3 residual.

Stage Summary:
- Veredito Red Team final: APROVADO — os 2 HIGH foram corrigidos e re-verificados com regressão; F3 mitigado (residual documentado); 0 CRITICAL em aberto.
- Pipeline de entrega completo: pesquisa oficial → banco (116 questões) → backend seguro → frontend → QA E2E → SDD → Red Team → fixes → re-verificação.
- Artefatos: app em / (única rota), APIs /api/*, docs/SDD.md (SDD vivo), worklog.md (histórico completo por Task ID), .env.example.

---
Task ID: 2-e2
Agent: Technical Writer (subagente)
Task: docs/DEPLOY.md — guia de implantação GitHub → Neon → Vercel + checklist de lançamento

Work Log:
- Lidos worklog.md (seções recentes: Task 8-a/8 Red Team + fixes, higiene de repo, vazamento .env/db corrigido) e docs/SDD.md (§11 ads, §12 deploy, §13 ADRs, §15 manutenção) para contexto e para alinhar o novo fluxo de deploy (a Fase 1 introduziu schema.prod.prisma + build:vercel, que substitui a troca manual de provider descrita no §12 do SDD — divergência explicitada no próprio DEPLOY.md).
- Fatos confirmados por leitura direta (nenhuma execução de bun dev/build/db, apenas leituras): package.json (scripts dev/build:vercel/db:push/db:push:prod/db:generate/db:generate:prod/db:seed/validate:questions/manifest + postinstall prisma generate); .env.example (DATABASE_URL sqlite↔neon, SESSION_SECRET com openssl rand -hex 32, NEXT_PUBLIC_NOOS_HUB_URL default https://noos-hub.vercel.app, 4 vars AdSense opcionais); .github/workflows/manifest.yml (paths: src/data/questions/**, certifications.ts, lib/axon/**, generate-manifest.ts; workflow_dispatch; commit de volta pelo ranvier-manifest-bot; HUB_DEPLOY_HOOK_URL opcional); prisma/schema.prisma (sqlite) e prisma/schema.prod.prisma (postgresql, mesmos models, push sem --accept-data-loss); next.config.ts (output standalone, ignoreBuildErrors: false, headers nosniff/X-Frame-Options DENY/Referrer-Policy/Permissions-Policy); public/manifest.jsonl = 116 linhas (RAN-DBDEA-00001…00116, campos id/exam/topics/difficulty/lang/version/checksum sha256/aliases/snapshot); scripts/generate-manifest.ts (--assign append-only no registry), scripts/validate-questions.ts (expected hardcoded 8/24/25/18/12/12/17), scripts/seed.ts (idempotente por key, publicId do registry congelado); src/lib/axon/ids.ts (formato RAN-{EXAM}-{SEQ} 5 dígitos), deep-links.ts ({base}/{lang}/q/{id}, fallback noos-hub.vercel.app), site.ts (Ironides Junior, GitHub, LinkedIn), session.ts (cookies ct_anon/ct_session), noos-badge.tsx (marca 12px, texto 9px vs nome text-2xl 24px = 37,5%, positivo/negativo por tema, uma ocorrência no rodapé), ranvier-app.tsx (rodapé: nome text-2xl + NoosBadge), language-provider.tsx (ct-lang → navigator.language → fallback en), ad-slot.tsx (config-gated, placements home/results/guide, rotulado), noos-tokens.css/globals.css/layout.tsx (--noos-ranvier #246cad como --primary e theme-color light), LICENSE (MIT) e LICENSE-CONTENT.md (CC BY-SA 4.0).
- Estado do git auditado: branch main; .env/db/logs NÃO trackeados (.gitignore cobre); porém artefatos de sandbox AINDA trackeados (tool-results/, .zscripts/, examples/, mini-services/, download/, tests/, Caddyfile, cli_readme.md) e TODOS os arquivos da Fase 1 ainda não-commitados (.github/, LICENSE, LICENSE-CONTENT.md, prisma/schema.prod.prisma, public/manifest.jsonl, public/brand/, scripts/generate-manifest.ts, noos-badge.tsx, id-registry.ts, src/lib/axon/, src/lib/site.ts, src/styles/ + modificações) — ambos os fatos documentados como passos obrigatórios/recomendados na seção 2 do DEPLOY.md.
- Escrito /home/z/my-project/docs/DEPLOY.md (355 linhas, PT-BR, comandos copy-paste com placeholders <SUA_CONNECTION_STRING_NEON_POOLED> etc.) nas 11 seções exigidas: (1) visão/pré-requisitos + smoke test local; (2) repo GitHub (higiene de artefatos, commit da Fase 1, verificação de nada sensível trackeado, push para ironidesflj/ranvier); (3) Neon (string pooled com sslmode=require, pgbouncer=true&connection_limit=1 se preciso, onde usar); (4) Vercel (Build Command override bun run build:vercel com explicação do porquê do client postgres, env vars, região, postinstall nuance); (5) sequência exata de init do banco prod com justificativa por passo (bun install → db:generate:prod → DATABASE_URL=... db:push:prod → DATABASE_URL=... seed → verificação de 116 questões → db:generate para restaurar client sqlite) + nota de manutenção dos 2 schemas; (6) verificação pós-deploy (curl /, /api/catalog, /manifest.jsonl=116, headers de segurança + checklist de navegador: dark mode, PT/EN persistente, sessão de estudo, simulado, deep-link Comunidade, badge do rodapé); (7) pipeline do manifest (o que faz, gatilhos, verificação, receita de novas questões com --assign + expected do validador + propagação local e prod); (8) AdSense opcional (habilitação via env + redeploy, política de colocação, pré-requisito de domínio próprio); (9) domínio próprio (noos.study aponta ao hub; trocar NEXT_PUBLIC_NOOS_HUB_URL quando existir); (10) Go-live checklist (Tabela 6: 12 itens técnicos com verificação objetiva + 4 itens jurídicos INPI Noos/Ranvier 41+42, EUIPO/USPTO, noos.study, licenças já decididas); (11) troubleshooting (11 sintomas: tsc --noEmit, engine mismatch, 500 /api, SESSION_SECRET, CI vermelho por ID não registrada e por expected desatualizado, pooler, npm vs bun, hub com dados antigos, push:prod sem accept-data-loss, app vazio pós-import).
- Nenhum outro arquivo do projeto modificado — apenas criado docs/DEPLOY.md e feito este append no worklog.md.

Stage Summary:
- Artefato: docs/DEPLOY.md v1.0.0 (2026-10-23) — guia de implantação GitHub → Neon → Vercel escrito para execução pelo "GPT local" do fundador, com todos os comandos confirmados contra o código real (scripts, workflow, schemas, manifest de 116 linhas) e as regras Noos Fase 1 refletidas (anti-SPOF, grátis sem paywall, ads apenas em resultado/rodapé estático, privacidade sem rastreamento individual, IDs RAN-DBDEA imutáveis, deep-link {base}/{lang}/q/{id}).
- Decisões-chave documentadas: (a) Build Command override build:vercel como fonte da verdade do client postgres na Vercel; (b) sequência de init do banco com regeneração do client no início E no fim (evita o engine mismatch clássico no dev local); (c) checklist de lançamento com verificação objetiva por item (tamanhos de badge 12px/9px=37,5%, cor #246cad via --noos-ranvier/theme-color, 116 IDs no manifest, cookies apenas ct_anon/ct_session); (d) itens jurídicos (INPI 41+42 Noos→Ranvier, EUIPO/USPTO depois, domínio noos.study, licenças CC BY-SA 4.0 + MIT já decididas) marcados como paralelo e de responsabilidade do fundador.
- Ressalvas para o fundador: (1) antes do primeiro push, os arquivos da Fase 1 precisam ser commitados (o guia instrui isso) e recomenda-se limpar artefatos de sandbox trackeados (tool-results/ etc.); (2) o worklog.md cita contas de teste do sandbox — revisar antes de tornar o repo público; (3) a §12 do SDD descreve o fluxo antigo de deploy (troca manual de provider no schema.prisma) — o DEPLOY.md a substitui e a divergência está anotada na seção "Referências cruzadas" do DEPLOY.md (o SDD NÃO foi editado, conforme a regra de não modificar outros arquivos; sugerir ao orquestrador atualizar o §12 do SDD num momento adequado); (4) região Vercel/Neon e detalhes de UI da Vercel (nomes de menus) podem variar com o tempo — o guia marca os campos de forma genérica.

---
Task ID: 2 (orquestração: 2-a, 2-b, 2-c, 2-d, 2-e, 2-f, 2-g)
Agent: SaaS Transformation Lead / Product Architect (orquestrador)
Task: Adaptação do app ao ecossistema Noos — Fase 1 (Arquivo 2.zip) + configuração para colocar online para teste

Work Log:
- Lido o Guia de Adaptação Noos-Ranvier Fase 1 (upload/Arquivo 2.zip → PDF 12 páginas + noos-tokens.css + 3 SVGs + capa HTML) e mapeados os 7 passos da Tabela 5 e o checklist da Tabela 6.
- 2-a Batismo visual: copiados noos-compact.svg/noos-mark-negative.svg/noos-mark.svg para public/brand/; tokens do manual versionados em src/styles/noos-tokens.css (prefixo --noos- para evitar colisão com vars shadcn; valores verbatim); fontes via next/font/google (Instrument Sans corpo, IBM Plex Mono IDs, Newsreader reservada ao wordmark); cor de domínio #246cad em --primary/--ring/--chart-1/sidebar/favicon/theme-color (variante noturna #64a1d8); CSS antigo Azure #0078D4 substituído.
- 2-b Renome + assinatura: app renomeado Ranvier em i18n (PT/EN), metadata/OG, layout (título "Ranvier — Simulados e estudos gratuitos…"); componente NoosBadge (marca 12px positiva/negativa por tema + "by Noos" Newsreader itálico 9px = 37,5% do nome 24px, tinta suave, link para o hub); rodapé reformulado (nome hierarquia máxima + badge + Contato ao lado + não-afiliado + licenças MIT/CC BY-SA 4.0); componente CertTrackApp→RanvierApp (arquivo renvier-app.tsx); página Sobre ganhou cartões Contato (GitHub/LinkedIn, e-mail via src/lib/site.ts, sem formulário) e Ecossistema Noos (link do hub); LICENSE (MIT) + LICENSE-CONTENT.md (CC BY-SA 4.0 — decisão do guia, substitui CC BY-NC-SA); resíduos "CertTrack" na UI corrigidos (featuresTitle/disclaimer home PT+EN).
- 2-c IDs públicas: examCode DBDEA adicionado à certificação (fonte + schema); Question.publicId (unique) + version (default 1) no schema Prisma; registry imutável src/data/questions/id-registry.ts (116 entradas RAN-DBDEA-00001…00116, gerado com --assign, header com regras de imutabilidade/epitáfio); seed atribui publicId apenas na criação (nunca reescreve); DB resetado e reseedado (116 questões, domínios 8/24/25/18/12/12/17); DTO PublicQuestion + attempt-service expõem publicId (sem vazar gabarito); question-card exibe ID em IBM Plex Mono 10px (select-all) + botão Comunidade (deep-link no idioma corrente) após feedback/review; i18n adiciona community/publicIdTitle.
- 2-d Manifesto: scripts/generate-manifest.ts (lê a fonte do seed sem DB; Tabela 4 completa — id/exam/topics/difficulty/lang/version/checksum sha256/aliases[]/snapshot com statement/options/answer/reference/referenceTitle; validação zod do Axon; --assign append-only do registry; aviso de epitáfio); public/manifest.jsonl gerado (116 linhas, servido em /manifest.jsonl, HTTP 200); .github/workflows/manifest.yml (CI: valida, regenera, comita de volta; paths sem loop; hook opcional do hub via secret HUB_DEPLOY_HOOK_URL).
- 2-e Deploy: .env.example completo (DATABASE_URL, SESSION_SECRET, NEXT_PUBLIC_NOOS_HUB_URL, 4x AdSense); prisma/schema.prod.prisma (postgresql, header de sincronização); package.json → name "ranvier" v1.1.0 + scripts build:vercel/db:push:prod/db:generate:prod/manifest/postinstall; .env do sandbox ganha SESSION_SECRET dev + hub URL; fallback de segredo renomeado; tsconfig inclui apenas src/scripts/tests/mini-services (exclui examples/skills/upload/tool-results/download); ignoreBuildErrors=false (tsc --noEmit limpo; erro pré-existente de narrowing em attempt-service corrigido).
- 2-e2 (subagente general-purpose): docs/DEPLOY.md (354 linhas — GitHub→Neon→Vercel com build command override, init do banco prod, verificação pós-deploy, pipeline do manifest, AdSense opcional, domínio, Go-live checklist Tabela 6 + jurídico INPI/noos.study, troubleshooting) + append próprio no worklog.
- 2-f QA E2E (agent-browser + VLM): título/metadata Ranvier; dark default + toggle; badge by Noos (href https://noos-hub.vercel.app/en→/pt conforme idioma; Newsreader itálico; marca 12px; endosso 37,5% — medidos via getComputedStyle); primary light = rgb(36,108,173)=#246cad; marca compacta no claro / negativa no escuro; estudo PT: ID RAN-DBDEA-00072 em IBM Plex Mono + Comunidade → https://noos-hub.vercel.app/pt/q/RAN-DBDEA-00072 após resposta (ausente antes/durante prova); simulado: footer oculto, ID sem Comunidade, entrega → resultado com 45 IDs + 45 links Comunidade; /manifest.jsonl 200 (116 linhas, campos íntegros); Sobre: 8 cartões incl. Contato e Ecossistema Noos (3 links GitHub, 2 LinkedIn); mobile 375px sem overflow horizontal, footer mt-auto no fim; VLM confirmou ausência de defeitos visuais em home/study/light/about/mobile/results; dev.log limpo (todas APIs 200/201; server auto-restartou ao trocar next.config e recompilou OK); lint 0 erros; tsc 0 erros.
- 2-g Docs + git: SDD v1.1.0 (título Ranvier by Noos; §1/§8.3 licenças CC BY-SA 4.0; §12 reescrito — schemas duplicados + build:vercel + referência canônica ao DEPLOY.md; avisos atualizados — ignoreBuildErrors=false, manifesto publica gabarito POR DESIGN documentado para o Red Team; nova §16 Ecossistema Noos; changelog v1.1.0); worklog (esta seção); commit git preparado para o GPT local do fundador publicar.

Stage Summary:
- Adaptação Noos Fase 1 COMPLETA e verificada em navegador (2 temas × 2 idiomas × mobile): assinatura by Noos, IDs públicas RAN-DBDEA-##### em 116/116 questões (registry imutável), Axon F1, manifest.jsonl servido + CI GitHub Actions, política de idioma dispositivo-primeiro (já vigente), licenças MIT + CC BY-SA 4.0.
- Decisões: prefixo --noos- nos tokens (colisão shadcn); exam code DBDEA (registry documentado em axon/ids.ts); badge no rodapé com nome em text-2xl para cumprir 32–40% com legibilidade; Contato aponta para a página Sobre in-app (hub ainda não existe — link do hub fica no badge e no cartão Ecossistema); cookies ct_anon/ct_session preservados (não órfar sessões).
- Deploy pronto para o fluxo do fundador: repo commitado → GPT local publica no GitHub → Vercel (build:vercel) + Neon (schema.prod.prisma) seguindo docs/DEPLOY.md; Go-live checklist (Tabela 6 + jurídico) incluído lá.
- Ressalva honesta: o hub (noos-hub.vercel.app) não existe ainda — links de Comunidade/badge apontam para onde a discussão vai nascer (por design do guia, Fase 2 do ecossistema).
---
Task ID: 3
Agent: SaaS Transformation Lead (orquestrador)
Task: PWA — instalar o app do navegador + funcionar offline; e ampliar o badge "by Noos" do rodapé (pequeno no celular, minúsculo no PC)

Work Log:
- Contexto lido: worklog.md completo (kickoff → Tasks 1–8 → Noos Fase 1 → DEPLOY.md); app no ar em https://ranrier-seven.vercel.app/#/ (v1.1.0); repo local idêntico ao commit 7ff4315 (diffs pendentes = apenas mudanças de file mode 644→755, sem conteúdo).
- Badge ampliado (noos-badge.tsx): marca 12px → 16px mobile / 20px desktop (md:); texto 9px → 11px/13px; gap 1→1.5; comment atualizado documentando o override da regra manual 32–40% por feedback do fundador (46%/54% do nome de 24px).
- Ícones PWA gerados (scripts/generate-icons.ts com sharp; `bun run icons`): icon-192/512 (rounded, propósito any), icon-maskable-192/512 (fundo cheio #246cad, check na safe zone de 80% — path derivado do favicon escalado 7.2×), apple-touch-icon 180. Em public/icons/.
- Manifest via rota de metadata src/app/manifest.ts → /manifest.webmanifest: id "/", start_url/scope "/", standalone, theme/background #0B1424, lang pt-BR, categories education, ícones any+maskable, atalhos Modo Estudo/Simulado/Progresso (#/study, #/exam, #/progress).
- Service worker public/sw.js (hand-written, sem dependências): navegação network-first com fallback do shell e offline.html; assets de build cache-first APENAS quando resposta é immutable (produção: URLs com hash de conteúdo; dev: no-store → nunca cacheado → dev sempre fresco — bug de CSS stale descoberto e corrigido durante o QA); assets de marca cache-first versionado por VERSION; API GETs + manifest.jsonl em stale-while-revalidate; POST/PUT/DELETE nunca interceptados (scoring server-side + rate limit intactos); sem skipWaiting (nunca interromper simulado em andamento); clients.claim + reload único na primeira visita.
- PwaProvider (src/components/app/pwa-provider.tsx) montado em providers.tsx dentro do LanguageProvider: registra SW em contexto seguro; captura beforeinstallprompt; detecta standalone (display-mode + navigator.standalone) e iOS (UA + iPadOS MacIntel/maxTouchPoints); toasts de offline/online/installed (tRef pattern para listeners únicos); diálogo iOS com os 3 passos de Adicionar à Tela de Início.
- UI de instalação: InstallBanner (faixa abaixo do hero na Home; "Agora não" persiste 7 dias em localStorage ranvier-install-dismissed; escondida quando standalone) + botão "Instalar app" no rodapé (linha de assinatura, entre badge e Contato, ícone MonitorSmartphone); ambos exibidos só quando canInstall || isIOS.
- i18n: seção `pwa` completa em PT e EN (título, descrição, botões, toasts, passos iOS); versões de rodapé v1.1.0 → v1.2.0 (PT e EN); package.json v1.2.0 + script `icons`.
- Infra: next.config.ts ganha headers Cache-Control no-cache para /sw.js (+ Service-Worker-Allowed) e max-age 3600 para /manifest.webmanifest; layout.tsx ganha apple-touch-icon, ícones PNG, appleWebApp (capable/statusBarStyle black-translucent/title Ranvier) e formatDetection telephone false.
- api-client.ts: fetch envolvido em try/catch — falha de rede vira ApiError(0, "offline"/"network") tipado (views degradam com toast genérico; toasts de conectividade vêm do PwaProvider).
- QA E2E (agent-browser):
  * Rotas: /manifest.webmanifest 200 (application/manifest+json, JSON íntegro), /sw.js 200 com headers corretos, /offline.html 200, 5 ícones 200.
  * SW: registrado, controla a página (controllerchange → 1 reload na 1ª visita), caches populados (shell 7: offline.html/favicon/brand/ícones//; assets: fontes woff2 immutable + brand; data: manifest+catalog pt/en+me).
  * Offline (emulado): reload offline renderiza o shell SSR completo (h1, footer, badge) — teste completo de app interativo offline feito com a estratégia anterior (chunks dev cacheados) antes do gate immutable; em produção os chunks são immutable → mesmo resultado interativo.
  * Instalação: evento beforeinstallprompt sintético → banner + botão do rodapé aparecem; clique chama prompt() e oculta o banner; iPhone 14 emulado → diálogo iOS com 3 passos correto; PT ("Estude até sem internet"/"Instalar app"/"Agora não") e EN verificados.
  * Badge medido: mobile 375px = 16px/11px; desktop 1280px = 20px/13px (após corrigir md: faltante nas imgs — pego pelo teste).
  * Regressão: modo estudo completo (config com 7 domínios → sessão → resposta → "Correto!" + explicação + fonte + RAN-DBDEA-00094); lint 0 erros; tsc 0 erros; console 0 erros/0 warnings de hidratação em carga limpa.
- Incidente encontrado e resolvido: banco SQLite do dev VAZIO (0 certificações, 0 questões; arquivo tocado às 19:40 — hipótese: db:push sem seed durante a preparação de deploy pelo GPT local do fundador). Re-seed executado (`bun run db:seed`, idempotente): 1 cert, 7 domínios, 116 questões (8/24/25/18/12/12/17), 0 usuários. Sintoma documentado no SDD §17.3 (API vazia = rodar seed).
- VLM (4 screenshots aprovados): banner desktop (limpo, alinhado, sem defeitos), rodapé desktop (badge legível, layout limpo), rodapé mobile 390px (badge visível, "Instalar app" presente, sem overflow), diálogo iOS (3 passos claros com ícones).
- Docs: SDD §17 novo (PWA completo: peças, estratégias de cache, observações) + changelog renumerado §18 + entrada v1.2.0; DEPLOY.md seção 6 com checks curl de PWA + itens de navegador (instalar em desktop/Android/iOS, teste offline).

Stage Summary:
- PWA completo e verificado: instalável do navegador (Chrome/Edge/Android nativo via beforeinstallprompt; iOS com diálogo de 3 passos), offline funcional (shell + dados já vistos; mutações sempre online por design — scoring server-side preservado), dev mode sempre fresco (gate immutable).
- Badge "by Noos" ampliado por decisão do fundador: 16/11px mobile, 20/13px desktop (override documentado da regra 32–40% do manual).
- Versão 1.2.0; pronta para o GPT local do fundador publicar (commit criado no repo local).
- Ressalvas honestas: (1) teste interativo-offline completo foi feito com a estratégia de cache pré-gate (equivalente em produção, onde chunks são immutable); em dev o offline renderiza o shell SSR estático; (2) labels dos atalhos do manifest em PT-BR (toggle EN completo dentro do app); (3) DB dev foi re-semeado após esvaziamento externo — produção Neon não afetada.

---
Task ID: 4
Agent: Orquestrador (sessão de continuação)
Task: Diagnóstico de "não encontramos os arquivos" + correção do pacote de transferência do v1.2.0

Work Log:
- Diagnóstico: trabalho do v1.2.0 (PWA + badge) está ÍNTEGRO no sandbox, commitado como bf516c2 (main); causa de "não encontrar" = arquivos nunca saíram do sandbox para a máquina do fundador (sem git remote configurado — `git remote -v` vazio).
- Auditoria do pacote de entrega encontrou 2 falhas reais:
  * `.env.example` documentado no DEPLOY.md (§1 `cp .env.example .env`, §6 tabela) NÃO existia no repo nem no disco — vítima do padrão `.env*` do .gitignore (nunca foi commitado; perdido junto do incidente das 19:40).
  * `.env` do sandbox também foi resetado externamente: só tinha DATABASE_URL (perdeu SESSION_SECRET dev e NEXT_PUBLIC_NOOS_HUB_URL do v1.1.0).
- Correções: (1) `.env.example` recriado com as 8 variáveis canônicas + comentários cross-referenciando DEPLOY.md (sqlite dev `file:../db/custom.db` + neon pooled comentado); (2) `.gitignore` ganha `!.env.example` (negação logo após `.env*`); (3) `.env` do sandbox restaurado com SESSION_SECRET dev novo (openssl rand -hex 32) + hub URL; (4) padrão `/public/ranvier-v1.2.0-source.zip` ignorado (artefato de transferência temporário).
- Commit de correção criado sobre bf516c2; artefatos de transferência regenerados em download/: bundle (história completa), patch (2 commits via format-patch --stdout) e zip fonte (git archive).
- Zip fonte adicionalmente copiado em public/ para download direto pelo painel de preview (caminho /ranvier-v1.2.0-source.zip), sem entrar no repo (gitignored).

Stage Summary:
- Lacuna de handoff fechada: `.env.example` agora viaja no repo (fresh clones funcionam com `cp .env.example .env` + db:push, conforme DEPLOY.md §1).
- Sandbox .env íntegro de novo (SESSION_SECRET dev rotacionado — irrelevantes as sessões antigas, eram dev-only).
- Três formas de transferência disponíveis e verificadas: zip fonte (mais simples), git bundle (história completa), patch (aplica sobre v1.1.0).

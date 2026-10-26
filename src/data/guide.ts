/**
 * Bilingual study guide (Technical Writer content).
 * Each section maps to an official exam outline domain, with study points and
 * official documentation links. PT-BR and EN versions.
 */

export interface GuideLink {
  title: string;
  titlePt?: string;
  url: string;
}

export interface GuideSection {
  code: number;
  titleEn: string;
  titlePt: string;
  summaryEn: string;
  summaryPt: string;
  pointsEn: string[];
  pointsPt: string[];
  links: GuideLink[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    code: 1,
    titleEn: "Databricks Intelligence Platform (6%)",
    titlePt: "Plataforma Databricks Intelligence (6%)",
    summaryEn:
      "Core platform components (architecture, Delta Lake, Unity Catalog) and choosing the right compute for each workload.",
    summaryPt:
      "Componentes centrais da plataforma (arquitetura, Delta Lake, Unity Catalog) e a escolha do compute certo para cada workload.",
    pointsEn: [
      "Lakehouse = open table format (Delta Lake) on cloud object storage + governance (Unity Catalog): one copy for BI and AI.",
      "Compute menu: job clusters (job-scoped, cheaper, no interactive attach), all-purpose clusters (interactive, shared), serverless compute (fast start, managed), SQL warehouses (SQL/BI workloads).",
      "Know the cost model differences: all-purpose vs job compute rates; serverless is billed per usage.",
      "Medallion architecture: bronze (raw) → silver (cleaned/conformed) → gold (business-level aggregates).",
    ],
    pointsPt: [
      "Lakehouse = formato de tabela aberto (Delta Lake) sobre cloud object storage + governança (Unity Catalog): uma cópia para BI e IA.",
      "Menu de compute: job clusters (escopo do job, mais barato, sem attach interativo), all-purpose clusters (interativo, compartilhado), serverless (início rápido, gerenciado), SQL warehouses (workloads SQL/BI).",
      "Entenda as diferenças de custo: tarifas all-purpose vs job compute; serverless é cobrado por uso.",
      "Arquitetura medallion: bronze (raw) → silver (limpo/conformado) → gold (agregados de negócio).",
    ],
    links: [
      { title: "Introduction to the platform", titlePt: "Introdução à plataforma", url: "https://docs.databricks.com/aws/en/introduction" },
      { title: "Medallion architecture", titlePt: "Arquitetura medallion", url: "https://docs.databricks.com/aws/en/lakehouse/medallion" },
      { title: "Compute overview", titlePt: "Visão geral de compute", url: "https://docs.databricks.com/aws/en/compute" },
    ],
  },
  {
    code: 2,
    titleEn: "Data Ingestion and Loading (21%)",
    titlePt: "Ingestão e Carregamento de Dados (21%)",
    summaryEn:
      "Batch, streaming and incremental ingestion; COPY INTO; Auto Loader; Lakeflow Connect; JDBC/ODBC and REST ingestion with Lakeflow Jobs.",
    summaryPt:
      "Ingestão batch, streaming e incremental; COPY INTO; Auto Loader; Lakeflow Connect; ingestão JDBC/ODBC e REST com Lakeflow Jobs.",
    pointsEn: [
      "COPY INTO: idempotent incremental load of files from ADLS/S3/GCS into a Delta table — great for small, known file sets; tracks loaded files in the transaction log.",
      "Auto Loader (cloudFiles): streaming source for new files; directory listing vs file notification modes; exactly-once via checkpoint.",
      "Auto Loader schema handling: schema inference, schema hints, schema evolution (addNewColumns), and the rescued data column for bad records.",
      "Lakeflow Connect: managed connectors (e.g., SQL Server, PostgreSQL, Salesforce, Confluent Kafka, Google Pub/Sub) land data serverless into Unity Catalog streaming tables.",
      "JDBC reads can be parallelized with partitionColumn/lowerBound/upperBound + numPartitions; orchestrate pulls with Lakeflow Jobs.",
      "Decision criteria between methods: file volume, arrival frequency, source type, governance needs.",
    ],
    pointsPt: [
      "COPY INTO: carga incremental idempotente de arquivos do ADLS/S3/GCS em uma tabela Delta — ótimo para conjuntos pequenos e conhecidos; rastreia arquivos carregados no transaction log.",
      "Auto Loader (cloudFiles): fonte de streaming para novos arquivos; modos directory listing vs file notification; exactly-once via checkpoint.",
      "Tratamento de schema no Auto Loader: inferência, schema hints, schema evolution (addNewColumns) e a coluna rescued data para registros problemáticos.",
      "Lakeflow Connect: conectores gerenciados (ex.: SQL Server, PostgreSQL, Salesforce, Confluent Kafka, Google Pub/Sub) aterrissam dados serverless em streaming tables do Unity Catalog.",
      "Leituras JDBC podem ser paralelizadas com partitionColumn/lowerBound/upperBound + numPartitions; orquestre pulls com Lakeflow Jobs.",
      "Critérios de decisão entre métodos: volume de arquivos, frequência de chegada, tipo de fonte, necessidade de governança.",
    ],
    links: [
      { title: "COPY INTO", url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into" },
      { title: "Auto Loader", url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/" },
      { title: "File notification mode", titlePt: "Modo file notification", url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/file-notification-mode" },
      { title: "Lakeflow Connect", url: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/" },
    ],
  },
  {
    code: 3,
    titleEn: "Data Transformation and Modeling (22%)",
    titlePt: "Transformação e Modelagem de Dados (22%)",
    summaryEn:
      "Bronze→silver cleaning with PySpark/SQL, joins and unions, column/row manipulation, dedup and aggregations, tuning parameters, gold layer objects, data quality.",
    summaryPt:
      "Limpeza bronze→silver com PySpark/SQL, joins e unions, manipulação de colunas/linhas, dedup e agregações, parâmetros de tuning, objetos da camada gold, qualidade de dados.",
    pointsEn: [
      "Cleaning toolkit: fillna/dropna, cast/withColumn for types, withColumnRenamed, split, drop, explode for arrays; write silver tables with write.mode/saveAsTable or CREATE TABLE AS SELECT.",
      "Joins: inner/left/cross; broadcast() hint for small dimensions (autoBroadcastJoinThreshold); union deduplicates, unionAll does not.",
      "Aggregations: count, mean, summary(); approx_count_distinct for huge cardinalities (trades tiny error for speed).",
      "Deduplication: dropDuplicates(subset) keeps an arbitrary row; window row_number() when determinism matters.",
      "Tuning basics: spark.sql.shuffle.partitions (default 200), executor/driver memory, AQE; always re-measure after changes.",
      "Gold objects: VIEW (no storage), MATERIALIZED VIEW (precomputed, scheduled refresh), STREAMING TABLE (incremental, process-once inputs), TABLE.",
      "Data quality: enforced constraints (NOT NULL, CHECK) reject bad rows; declarative expectations in pipelines can drop/quarantine.",
    ],
    pointsPt: [
      "Kit de limpeza: fillna/dropna, cast/withColumn para tipos, withColumnRenamed, split, drop, explode para arrays; escreva tabelas silver com write.mode/saveAsTable ou CREATE TABLE AS SELECT.",
      "Joins: inner/left/cross; hint broadcast() para dimensões pequenas (autoBroadcastJoinThreshold); union deduplica, unionAll não.",
      "Agregações: count, mean, summary(); approx_count_distinct para cardinalidades enormes (troca erro mínimo por velocidade).",
      "Deduplicação: dropDuplicates(subset) mantém uma linha arbitrária; window row_number() quando o determinismo importa.",
      "Tuning básico: spark.sql.shuffle.partitions (padrão 200), memória de executor/driver, AQE; sempre remedir após mudanças.",
      "Objetos gold: VIEW (sem armazenamento), MATERIALIZED VIEW (pré-computada, refresh agendado), STREAMING TABLE (incremental, inputs processados uma vez), TABLE.",
      "Qualidade de dados: constraints enforcement (NOT NULL, CHECK) rejeitam linhas ruins; expectations declarativas em pipelines podem descartar/quarantear.",
    ],
    links: [
      { title: "Delta Lake guide", titlePt: "Guia Delta Lake", url: "https://docs.databricks.com/aws/en/delta/" },
      { title: "MERGE (upserts)", url: "https://docs.databricks.com/aws/en/delta/merge" },
      { title: "Materialized views", titlePt: "Materialized views", url: "https://docs.databricks.com/aws/en/ldp/concepts/materialized-views" },
      { title: "Streaming tables", titlePt: "Streaming tables", url: "https://docs.databricks.com/aws/en/ldp/concepts/streaming-tables" },
      { title: "Best practices", titlePt: "Boas práticas", url: "https://docs.databricks.com/aws/en/delta/best-practices" },
    ],
  },
  {
    code: 4,
    titleEn: "Working with Lakeflow Jobs (16%)",
    titlePt: "Trabalhando com Lakeflow Jobs (16%)",
    summaryEn:
      "Orchestration with Lakeflow Jobs: control flows (retries, branching, looping), task types and dependencies, and trigger types (scheduled, file arrival, table update).",
    summaryPt:
      "Orquestração com Lakeflow Jobs: fluxos de controle (retries, branching, looping), tipos de tarefa e dependências, e tipos de gatilho (agendado, file arrival, table update).",
    pointsEn: [
      "Jobs = DAG of tasks (notebook, SQL, pipeline, dashboard, dbt, for-each…); dependencies define execution order.",
      "Control flow: retries with backoff, if/else branching on task values, for-each looping with concurrency control.",
      "Task values share parameters between tasks; dynamic value references template them.",
      "Triggers: scheduled (cron), file arrival (new files in a location), table update (data-driven — fires when upstream tables update).",
      "Time-based triggers when SLAs matter; data-driven triggers when freshness depends on upstream data.",
      "Repair runs re-run failed tasks (and dependents) without re-running the whole job.",
    ],
    pointsPt: [
      "Jobs = DAG de tarefas (notebook, SQL, pipeline, dashboard, dbt, for-each…); dependências definem a ordem de execução.",
      "Fluxo de controle: retries com backoff, branching if/else sobre task values, loop for-each com controle de concorrência.",
      "Task values compartilham parâmetros entre tarefas; dynamic value references os templateiam.",
      "Gatilhos: scheduled (cron), file arrival (novos arquivos em um local), table update (orientado a dados — dispara quando tabelas a montante atualizam).",
      "Gatilhos por tempo quando SLAs importam; orientados a dados quando a frescor depende de dados a montante.",
      "Repair runs reexecutam tarefas falhas (e dependentes) sem reexecutar o job inteiro.",
    ],
    links: [
      { title: "Lakeflow Jobs", url: "https://docs.databricks.com/aws/en/jobs/" },
      { title: "Control flow (retries, branching)", titlePt: "Fluxo de controle", url: "https://docs.databricks.com/aws/en/jobs/control-flow" },
      { title: "Trigger types", titlePt: "Tipos de gatilho", url: "https://docs.databricks.com/aws/en/jobs/triggers" },
      { title: "File arrival triggers", titlePt: "Gatilhos de chegada de arquivo", url: "https://docs.databricks.com/aws/en/jobs/file-arrival-triggers" },
      { title: "Table update triggers", titlePt: "Gatilhos de atualização de tabela", url: "https://docs.databricks.com/aws/en/jobs/trigger-table-update" },
    ],
  },
  {
    code: 5,
    titleEn: "Implementing CI/CD (10%)",
    titlePt: "Implementando CI/CD (10%)",
    summaryEn:
      "Git workflow in the workspace (Git Folders), environment-specific configuration with Automation Bundles, and the Databricks CLI in CI pipelines.",
    summaryPt:
      "Fluxo Git no workspace (Git Folders), configuração por ambiente com Automation Bundles e a Databricks CLI em pipelines de CI.",
    pointsEn: [
      "Databricks Git Folders (formerly Repos): branch, commit, push and pull requests directly in the workspace UI.",
      "Automation Bundles (DABs, formerly Asset Bundles): declarative YAML packaging of jobs, pipelines and other resources + targets (dev/test/prod).",
      "Per-target variables and overrides promote the same codebase across environments.",
      "Databricks CLI: `bundle validate`, `bundle deploy`, `bundle run` — the backbone of automated CI/CD with service principals.",
    ],
    pointsPt: [
      "Databricks Git Folders (antes Repos): branch, commit, push e pull requests direto na UI do workspace.",
      "Automation Bundles (DABs, antes Asset Bundles): empacotamento declarativo em YAML de jobs, pipelines e outros recursos + targets (dev/test/prod).",
      "Variáveis e overrides por target promovem a mesma base de código entre ambientes.",
      "Databricks CLI: `bundle validate`, `bundle deploy`, `bundle run` — a espinha dorsal do CI/CD automatizado com service principals.",
    ],
    links: [
      { title: "Git Folders concepts", titlePt: "Conceitos de Git Folders", url: "https://docs.databricks.com/aws/en/repos/git-folders-concepts" },
      { title: "Automation Bundles", url: "https://docs.databricks.com/aws/en/dev-tools/bundles/" },
      { title: "Bundle variables & overrides", titlePt: "Variáveis e overrides", url: "https://docs.databricks.com/aws/en/dev-tools/bundles/overrides" },
      { title: "Databricks CLI", url: "https://docs.databricks.com/aws/en/dev-tools/cli" },
    ],
  },
  {
    code: 6,
    titleEn: "Troubleshooting, Monitoring, and Optimization (10%)",
    titlePt: "Troubleshooting, Monitoramento e Otimização (10%)",
    summaryEn:
      "Reading job run history and DAG status, Spark UI stage metrics for skew/shuffle/spill, Liquid Clustering, predictive optimization, and cluster/libraries/OOM diagnostics.",
    summaryPt:
      "Leitura do histórico de execuções e status do DAG, métricas de estágio no Spark UI para skew/shuffle/spill, Liquid Clustering, predictive optimization e diagnóstico de clusters/bibliotecas/OOM.",
    pointsEn: [
      "Lakeflow Jobs UI: run history to compare durations against baselines; DAG view reveals upstream blockers.",
      "Spark UI: stage-level metrics — one long task with huge max shuffle read = data skew; spill to disk = memory pressure.",
      "Skew fixes: AQE skew join handling, salting keys, repartitioning; tune spark.sql.shuffle.partitions.",
      "Liquid Clustering replaces partitioning/ZORDER for new tables: mutable clustering keys, incremental re-clustering.",
      "Predictive optimization: Unity Catalog manages OPTIMIZE/VACUUM automatically for managed tables.",
      "Cluster diagnostics: startup failures (init scripts, capacity), library conflicts (version pinning), OOM (memory config/data size).",
    ],
    pointsPt: [
      "UI do Lakeflow Jobs: histórico de execuções para comparar durações com baselines; visão do DAG revela bloqueadores a montante.",
      "Spark UI: métricas por estágio — uma tarefa longa com max shuffle read enorme = data skew; spill para disco = pressão de memória.",
      "Correções de skew: AQE skew join, salting de chaves, reparticionamento; ajuste spark.sql.shuffle.partitions.",
      "Liquid Clustering substitui particionamento/ZORDER em tabelas novas: chaves mutáveis, re-clustering incremental.",
      "Predictive optimization: o Unity Catalog gerencia OPTIMIZE/VACUUM automaticamente para tabelas gerenciadas.",
      "Diagnóstico de clusters: falhas de inicialização (init scripts, capacidade), conflitos de bibliotecas (pinning de versão), OOM (memória/tamanho dos dados).",
    ],
    links: [
      { title: "Monitor jobs", titlePt: "Monitorar jobs", url: "https://docs.databricks.com/aws/en/jobs/monitor" },
      { title: "Diagnose job performance", titlePt: "Diagnosticar performance", url: "https://docs.databricks.com/aws/en/jobs/diagnose-job-performance" },
      { title: "Spark UI guide", url: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/" },
      { title: "Liquid Clustering", url: "https://docs.databricks.com/aws/en/tables/clustering" },
      { title: "Predictive optimization", titlePt: "Otimização preditiva", url: "https://docs.databricks.com/aws/en/optimizations/predictive-optimization" },
    ],
  },
  {
    code: 7,
    titleEn: "Governance and Security (15%)",
    titlePt: "Governança e Segurança (15%)",
    summaryEn:
      "Unity Catalog: managed vs external tables, GRANT/REVOKE/DENY and the privilege hierarchy, row filters and column masks, and ABAC policies.",
    summaryPt:
      "Unity Catalog: tabelas gerenciadas vs externas, GRANT/REVOKE/DENY e a hierarquia de privilégios, row filters e column masks, e políticas ABAC.",
    pointsEn: [
      "Managed tables: Unity Catalog controls data and layout; DROP deletes data (after retention). External tables: path in an external location; DROP removes metadata only.",
      "Privilege hierarchy: catalog → schema → table; USE CATALOG/USE SCHEMA are required to traverse; grants cascade to future children.",
      "GRANT to principals (users, groups, service principals); prefer groups; DENY overrides GRANT.",
      "Row filters (row-level security) and column masks: SQL functions bound to tables; visibility can depend on group membership (is_account_group_member).",
      "ABAC policies: centralized, tag/attribute-driven row filtering and column masking — secure-by-default at scale.",
    ],
    pointsPt: [
      "Tabelas gerenciadas: o Unity Catalog controla dados e layout; DROP apaga os dados (após retenção). Externas: caminho em external location; DROP remove só os metadados.",
      "Hierarquia de privilégios: catalog → schema → table; USE CATALOG/USE SCHEMA são exigidos para atravessar; grants cascateiam para filhos futuros.",
      "GRANT para principals (usuários, grupos, service principals); prefira grupos; DENY sobrepõe GRANT.",
      "Row filters (segurança por linha) e column masks: funções SQL vinculadas a tabelas; a visibilidade pode depender de grupo (is_account_group_member).",
      "Políticas ABAC: filtragem por linha e mascaramento por coluna centralizados e orientados a tags/atributos — secure-by-default em escala.",
    ],
    links: [
      { title: "Unity Catalog", url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/" },
      { title: "Managed vs external tables", titlePt: "Gerenciadas vs externas", url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external" },
      { title: "Manage privileges (GRANT/REVOKE)", titlePt: "Privilégios (GRANT/REVOKE)", url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/" },
      { title: "Row filters & column masks", titlePt: "Filtros de linha e máscaras", url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/" },
      { title: "ABAC policies", titlePt: "Políticas ABAC", url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/" },
    ],
  },
];

import type { SeedQuestion } from "./types";

/**
 * Section 1 — Databricks Intelligence Platform (6%)
 * 8 questions total: S1-001 and S1-002 are the curated exemplars;
 * S1-003..S1-008 authored in Task 1-a, verified against official docs.
 */
export const s1Questions: SeedQuestion[] = [
  {
    key: "S1-001",
    domainCode: 1,
    stem: `A data engineering team runs a nightly pipeline that reads Delta tables, applies PySpark transformations, and writes a gold table. The pipeline is executed by a Lakeflow Job and must use dedicated compute that starts when the job starts and is terminated automatically when the job finishes. Analysts must not be able to attach to this compute for interactive sessions.

Which compute option should the team use for this workload?`,
    options: [
      "An all-purpose cluster that stays running so analysts can attach to it between job runs",
      "A job cluster scoped to the Lakeflow Job, created and terminated by the job itself",
      "A serverless SQL warehouse configured for the notebook tasks in the job",
      "A high-concurrency cluster shared with other teams that run ad hoc queries",
    ],
    correctIndex: 1,
    explanationEn: `Job clusters are dedicated compute created by and for a specific Lakeflow Job run: they start when the job starts and are torn down when it finishes, and they cannot be attached to for interactive use. All-purpose and high-concurrency clusters are designed for interactive, shared sessions, which contradicts the requirement that analysts cannot attach. A SQL warehouse serves SQL analytics workloads, not a general-purpose PySpark pipeline job.

Job compute is also billed at job rates instead of all-purpose rates, which typically lowers the cost of scheduled, non-interactive workloads.`,
    explanationPt: `Job clusters são compute dedicado criado por e para uma execução específica de um Lakeflow Job: iniciam quando o job inicia e são encerrados quando ele termina, e não podem receber conexões interativas. Clusters all-purpose e de alta concorrência são projetados para sessões interativas compartilhadas — o que contraria o requisito de que analistas não possam se conectar. Um SQL warehouse atende workloads analíticos de SQL, não um job de pipeline PySpark genérico.

Além disso, o compute de job é cobrado pela tarifa de job (e não pela de all-purpose), o que normalmente reduz o custo de workloads agendados e não interativos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/compute",
    referenceTitle: "Compute for Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-002",
    domainCode: 1,
    stem: `A company currently exports data from its operational systems to Parquet files in cloud object storage. Analysts want to run ad hoc SQL queries over that data, and data scientists want to train models on the exact same tables. Both teams need ACID guarantees, reliable schema, and a single source of truth — without maintaining two separate copies of the data in a warehouse and a data lake.

Which approach directly addresses these requirements on the Databricks Data Intelligence Platform?`,
    options: [
      "Keep two copies of the data: load it into a classic data warehouse for the analysts and keep the raw files in the lake for the data scientists",
      "Adopt the lakehouse approach: use the Delta Lake open table format on cloud object storage, with Unity Catalog governing access for all teams",
      "Store everything as ephemeral in-memory DataFrames and recompute them from source whenever either team needs the data",
      "Convert all data to unstructured JSON files so both teams can parse them with their own custom readers",
    ],
    correctIndex: 1,
    explanationPt: `A abordagem lakehouse usa o Delta Lake — um formato de tabela aberto sobre o cloud object storage — para trazer transações ACID, controle de schema e time travel diretamente ao data lake. Uma única cópia dos dados serve simultaneamente analytics (SQL) e ciência de dados (PySpark/ML), com o Unity Catalog fornecendo governança, linhagem e controle de acesso centralizados sobre essas tabelas.

Manter duas cópias (warehouse + lake) gera custo dobrado e inconsistência; DataFrames em memória são efêmeros e não constituem fonte da verdade; e JSON não estruturado perde schema e garantias transacionais.`,
    explanationEn: `The lakehouse approach uses Delta Lake — an open table format layered on cloud object storage — to bring ACID transactions, schema enforcement, and time travel directly to the data lake. A single copy of the data serves both analytics (SQL) and data science (PySpark/ML) workloads, with Unity Catalog providing governance, lineage, and centralized access control over those tables.

Keeping two copies (warehouse + lake) doubles cost and creates consistency risks; in-memory DataFrames are ephemeral and are not a source of truth; and unstructured JSON loses schema and transactional guarantees.`,
    referenceUrl: "https://docs.databricks.com/aws/en/introduction",
    referenceTitle: "Introduction to the Databricks Data Intelligence Platform",
    difficulty: "EASY",
  },
  {
    key: "S1-003",
    domainCode: 1,
    stem: `A healthcare company is migrating its analytics to the Databricks Data Intelligence Platform. Its security officers need one central place to define who can access which tables across all workspaces, to track lineage, and to audit query activity for compliance reporting. They do not want to manage access rules separately in each cloud storage account.

Which platform component is the foundation for these requirements?`,
    options: [
      "Unity Catalog, which centralizes permissions, lineage, and auditing across the lakehouse",
      "Delta Lake, which enforces access rules inside the table format through its ACID transaction log",
      "Serverless SQL warehouses, which automatically apply row-level filters to every query they execute",
      "Lakeflow Jobs, which can grant and revoke privileges each time a scheduled task runs",
    ],
    correctIndex: 0,
    explanationEn: `Unity Catalog is the governance layer of the Databricks Data Intelligence Platform: it provides a unified governance model for the lakehouse, centralizing permissions (managed through the UI or SQL GRANT/REVOKE), lineage, and auditing across catalogs, schemas, and tables. Delta Lake brings ACID transactions, schema enforcement, and time travel at the storage layer, but the table format itself does not manage who can read the data. SQL warehouses are compute for SQL analytics, and Lakeflow Jobs orchestrate tasks — neither defines access policy.`,
    explanationPt: `O Unity Catalog é a camada de governança da Databricks Data Intelligence Platform: ele fornece um modelo de governança unificado para o lakehouse, centralizando permissões (gerenciadas pela UI ou por SQL com GRANT/REVOKE), linhagem e auditoria sobre catálogos, schemas e tabelas. O Delta Lake traz transações ACID, enforcement de schema e time travel na camada de armazenamento, mas o formato de tabela em si não controla quem pode ler os dados. SQL warehouses são compute para analytics em SQL, e os Lakeflow Jobs orquestram tarefas — nenhum deles define política de acesso.`,
    referenceUrl: "https://docs.databricks.com/aws/en/introduction",
    referenceTitle: "Introduction to the Databricks Data Intelligence Platform",
    difficulty: "EASY",
  },
  {
    key: "S1-004",
    domainCode: 1,
    stem: `A two-person data engineering team schedules a nightly Lakeflow Job that runs a PySpark notebook to refresh reporting tables. The team has no cluster administration expertise and wants to avoid selecting instance types, worker counts, or runtime versions. They also want the job's compute to become available quickly, with no infrastructure for them to deploy or configure.

Which compute option best fits these requirements?`,
    options: [
      "Serverless compute for jobs, which Databricks provisions, scales, and manages automatically",
      "A classic job cluster with manually selected worker instance types and autoscaling bounds",
      "A shared all-purpose cluster that remains running so the job can attach to it at night",
      "A classic job cluster that the team resizes each evening based on the previous run",
    ],
    correctIndex: 0,
    explanationEn: `Serverless compute for jobs runs Lakeflow Jobs without configuring or deploying infrastructure: Databricks automatically provisions and scales the compute and manages its settings, and it is the default for all task types that support it. A classic job cluster moves instance types, worker counts, and runtime choices onto the team. Keeping an all-purpose cluster running adds idle cost and administration, and Databricks does not recommend all-purpose compute for production jobs; resizing clusters nightly is manual work with none of the requested benefits.`,
    explanationPt: `O serverless compute for jobs executa Lakeflow Jobs sem configurar nem implantar infraestrutura: a Databricks provisiona e escala o compute automaticamente, gerencia suas configurações e ele é o padrão para todos os tipos de tarefa compatíveis. Um job cluster clássico transfere para a equipe a escolha de tipos de instância, número de workers e versão de runtime. Manter um cluster all-purpose rodando gera custo de ociosidade e administração — e a Databricks não recomenda compute all-purpose para jobs de produção; redimensionar clusters toda noite é trabalho manual, sem nenhum dos benefícios pedidos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/compute",
    referenceTitle: "Compute for Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-005",
    domainCode: 1,
    stem: `A BI team connects Tableau and Power BI to the Databricks workspace over JDBC/ODBC and spends the day running ad hoc SQL queries and dashboards against gold Delta tables. Analysts do not want to size or tune Spark clusters; they need compute that is optimized for SQL analytics and BI workloads and that starts and scales on demand with query traffic.

Which compute service should the team use?`,
    options: [
      "A classic all-purpose Spark cluster with Photon enabled, shared by all analysts",
      "A SQL warehouse, the compute optimized for SQL queries, analytics, and business intelligence workloads",
      "A job cluster scoped to a nightly Lakeflow Job, which the BI tools connect to during the day",
      "Serverless compute for jobs, because the BI tools schedule their queries as job tasks",
    ],
    correctIndex: 1,
    explanationEn: `SQL warehouses are Databricks compute optimized for SQL queries, analytics, and business intelligence workloads, and they are the standard endpoint for JDBC/ODBC connectivity from BI tools; they can be serverless (on-demand, automatically managed and scaled) or classic. An all-purpose Spark cluster can run SQL but requires sizing and tuning and is aimed at interactive notebook work, not BI-tool access patterns. A job cluster exists only for a specific job run and cannot serve interactive BI sessions. Serverless compute for jobs executes job tasks, not queries submitted by external BI tools.`,
    explanationPt: `Os SQL warehouses são o compute da Databricks otimizado para consultas SQL, analytics e workloads de business intelligence, sendo o endpoint padrão para conectividade JDBC/ODBC de ferramentas de BI; podem ser serverless (sob demanda, gerenciados e escalados automaticamente) ou clássicos. Um cluster Spark all-purpose consegue executar SQL, mas exige dimensionamento e tuning e é voltado ao trabalho interativo em notebooks, não ao padrão de acesso de ferramentas de BI. Um job cluster existe apenas para uma execução específica de job e não atende sessões interativas de BI. Já o serverless compute for jobs executa tarefas de jobs, não consultas enviadas por ferramentas externas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute",
    referenceTitle: "Compute — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-006",
    domainCode: 1,
    stem: `A data engineering team is migrating a legacy Spark application into a Lakeflow Job. One task in the job must run a compiled JAR that the team maintains. The team would prefer to run the entire job on serverless compute for jobs to avoid managing clusters.

Which statement is correct?`,
    options: [
      "The JAR task can run on serverless compute for jobs once the JAR is uploaded as a dependent library",
      "The JAR task must run on a serverless SQL warehouse, because SQL warehouses execute compiled artifacts",
      "JAR tasks are not supported on serverless compute for jobs — they need classic jobs compute instead",
      "Serverless compute for jobs supports every task type; the team only needs to pick a Databricks Runtime version",
    ],
    correctIndex: 2,
    explanationEn: `Not all task types run on serverless compute for jobs. The compute guidance for Lakeflow Jobs lists JAR and Spark Submit tasks as supported only on classic compute — classic jobs compute is recommended, with classic all-purpose as the alternative — while notebook, Python script, and Python wheel tasks support serverless. SQL warehouses run SQL, not compiled JARs, and dependent libraries do not change which compute types a task supports. The team can keep the other tasks on serverless and assign the JAR task a classic job cluster.`,
    explanationPt: `Nem todos os tipos de tarefa rodam no serverless compute for jobs. A orientação de compute para Lakeflow Jobs lista tarefas JAR e Spark Submit como suportadas apenas em compute clássico — com classic jobs compute como recomendado e classic all-purpose como alternativa — enquanto tarefas de notebook, Python script e Python wheel aceitam serverless. SQL warehouses executam SQL, não JARs compilados, e bibliotecas dependentes não mudam quais tipos de compute uma tarefa suporta. A equipe pode manter as demais tarefas em serverless e associar a tarefa de JAR a um job cluster clássico.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/compute",
    referenceTitle: "Compute for Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-007",
    domainCode: 1,
    stem: `A machine learning team works interactively in notebooks, training models on GPU-enabled instances with Databricks Runtime for Machine Learning and several custom environment libraries. To reduce administration, they ask whether this workload can move to serverless compute.

What should the data engineer answer?`,
    options: [
      "Yes — serverless compute automatically attaches GPU instances when it detects ML libraries",
      "Yes — serverless compute supports every Databricks Runtime version, including ML runtimes",
      "No — interactive GPU training must be submitted as separate Lakeflow Jobs that each create a job cluster",
      "No — ML Runtime on GPU is not supported on serverless compute; it requires a classic compute resource",
    ],
    correctIndex: 3,
    explanationEn: `Serverless compute is on-demand and automatically managed, but it does not support every workload: Databricks recommends serverless for most new workloads, and for workloads that serverless does not support — such as ML Runtime on GPU — the guidance is to configure a classic compute resource with the required instance types, runtime, and libraries. Serverless never attaches GPUs based on detected libraries, and moving interactive experimentation into per-run job clusters would break the team's interactive workflow while adding orchestration overhead.`,
    explanationPt: `O serverless compute é sob demanda e gerenciado automaticamente, mas não suporta qualquer workload: a Databricks recomenda serverless para a maioria dos novos workloads e, para aqueles sem suporte — como ML Runtime em GPU —, a orientação é configurar um recurso de compute clássico com os tipos de instância, o runtime e as bibliotecas necessários. O serverless nunca anexa GPUs por detectar bibliotecas de ML, e mover a experimentação interativa para job clusters por execução destruiria o fluxo interativo da equipe, além de adicionar sobrecarga de orquestração.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/cluster-config-best-practices",
    referenceTitle: "Classic compute configuration best practices — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S1-008",
    domainCode: 1,
    stem: `A retail company wants its data quality notebook to run automatically every night at 02:00, to retry the task if it fails, and to email the on-call engineer whenever a run fails. The notebook already exists in the workspace.

Which platform capability should the company use?`,
    options: [
      "Databricks Git Folders (formerly Repos), which run notebooks on a schedule from a Git branch",
      "Unity Catalog, which governs data access and can also schedule notebook refreshes",
      "Delta Lake time travel, which can rewind and replay a notebook's previous outputs from the table's transaction log",
      "Lakeflow Jobs (formerly Workflows), which schedule notebooks with retries and failure notifications",
    ],
    correctIndex: 3,
    explanationEn: `Lakeflow Jobs is the platform's workflow automation service: it schedules and orchestrates tasks such as notebooks and SQL queries, supports task retries, and can send email or webhook notifications when a run fails or takes too long. Git Folders provide version control for code in Git repositories — they never execute code on a schedule. Unity Catalog centralizes governance (permissions, lineage, auditing) and does not schedule notebooks. Time travel is a Delta Lake feature for querying historical versions of a table, unrelated to orchestration.`,
    explanationPt: `O Lakeflow Jobs é o serviço de automação de workflows da plataforma: ele agenda e orquestra tarefas como notebooks e consultas SQL, suporta retries e pode enviar notificações por e-mail ou webhook quando uma execução falha ou demora demais. Os Git Folders oferecem controle de versão do código em repositórios Git — nunca executam código em um agendamento. O Unity Catalog centraliza a governança (permissões, linhagem, auditoria) e não agenda notebooks. Time travel é um recurso do Delta Lake para consultar versões históricas de uma tabela, sem relação com orquestração.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/",
    referenceTitle: "Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
];

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
    explanationEn: `The lakehouse approach uses Delta Lake — an open table format layered on cloud object storage — to bring ACID transactions, schema enforcement, and time travel directly to the data lake. A single copy of the data serves both analytics (SQL) and data science (PySpark/ML) workloads, with Unity Catalog providing governance, lineage, and centralized access control over those tables.

Keeping two copies (warehouse + lake) doubles cost and creates consistency risks; in-memory DataFrames are ephemeral and are not a source of truth; and unstructured JSON loses schema and transactional guarantees.`,
    explanationPt: `A abordagem lakehouse usa o Delta Lake — um formato de tabela aberto sobre o cloud object storage — para trazer transações ACID, controle de schema e time travel diretamente ao data lake. Uma única cópia dos dados serve simultaneamente analytics (SQL) e ciência de dados (PySpark/ML), com o Unity Catalog fornecendo governança, linhagem e controle de acesso centralizados sobre essas tabelas.

Manter duas cópias (warehouse + lake) gera custo dobrado e inconsistência; DataFrames em memória são efêmeros e não constituem fonte da verdade; e JSON não estruturado perde schema e garantias transacionais.`,
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
      "Unity Catalog, the lakehouse's unified governance layer, with centralized permissions, lineage, and auditing",
      "Delta Lake, which enforces access rules inside the table format through the ACID transaction log it maintains on every write",
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
      "A classic job cluster scoped to a nightly Lakeflow Job, which the BI tools would have to connect to during the day while it stays running",
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
      "JAR tasks are not supported on serverless compute for jobs — that task needs classic jobs compute",
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
      "No — ML Runtime on GPU is not supported on serverless compute; use a classic compute resource",
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
      "Delta Lake time travel, which can rewind and replay a notebook's previous outputs",
      "Lakeflow Jobs, which schedule the notebook with retries and failure notifications",
    ],
    correctIndex: 3,
    explanationEn: `Lakeflow Jobs is the platform's workflow automation service: it schedules and orchestrates tasks such as notebooks and SQL queries, supports task retries, and can send email or webhook notifications when a run fails or takes too long. Git Folders provide version control for code in Git repositories — they never execute code on a schedule. Unity Catalog centralizes governance (permissions, lineage, auditing) and does not schedule notebooks. Time travel is a Delta Lake feature for querying historical versions of a table, unrelated to orchestration.`,
    explanationPt: `O Lakeflow Jobs é o serviço de automação de workflows da plataforma: ele agenda e orquestra tarefas como notebooks e consultas SQL, suporta retries e pode enviar notificações por e-mail ou webhook quando uma execução falha ou demora demais. Os Git Folders oferecem controle de versão do código em repositórios Git — nunca executam código em um agendamento. O Unity Catalog centraliza a governança (permissões, linhagem, auditoria) e não agenda notebooks. Time travel é um recurso do Delta Lake para consultar versões históricas de uma tabela, sem relação com orquestração.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/",
    referenceTitle: "Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S1-009",
    domainCode: 1,
    stem: `A fintech runs its Databricks workspace on classic compute, with all-purpose clusters for interactive notebook work and job clusters for nightly Lakeflow Jobs. During a security review, the cloud architect asks in which cloud account those clusters will run, because that determines network routing and instance policies. Which statement correctly describes how compute is deployed for this workspace?`,
    options: [
      "Classic clusters run in the customer's cloud account, in the data plane; the Databricks-managed control plane hosts the UI, job scheduling, and APIs",
      "Every deployment runs all of its compute in Databricks-owned cloud accounts, so customer cloud resources never execute any workloads",
      "The data plane is only a metadata layer for the workspace UI, and all cluster workloads execute inside the Databricks control plane",
      "Serverless compute runs inside the customer's VPC, while classic compute runs in Databricks-owned cloud accounts",
    ],
    correctIndex: 0,
    explanationEn: `The platform is split into a control plane and a data plane. The control plane — the workspace UI, the notebook environment, the job scheduler, and the REST APIs — is managed by Databricks in its own accounts. For a workspace on classic compute, the data plane lives in the customer's cloud account: all-purpose clusters and job clusters are launched in the customer's account and process data there, which is why the architect's questions about network routing and instance policies matter. Saying every deployment runs compute in Databricks-owned accounts confuses classic compute with the serverless data plane. The data plane is not a metadata layer — it is where data storage and data processing happen. And serverless compute does not run in the customer's VPC either: it runs in the Databricks-managed serverless data plane.`,
    explanationPt: `A plataforma é dividida em control plane e data plane. O control plane — a UI do workspace, o ambiente de notebooks, o agendador de jobs e as APIs REST — é gerenciado pela Databricks em contas próprias. Para um workspace em classic compute, o data plane fica na conta de nuvem do cliente: clusters all-purpose e job clusters são lançados na conta do cliente e processam dados lá — é por isso que as perguntas do arquiteto sobre roteamento de rede e políticas de instância se aplicam. Afirmar que qualquer deployment roda o compute em contas da Databricks confunde classic compute com o serverless data plane. O data plane não é uma camada de metadados — é onde acontecem o armazenamento e o processamento dos dados. E o serverless compute também não roda na VPC do cliente: ele roda no serverless data plane, gerenciado pela Databricks.`,
    referenceUrl: "https://docs.databricks.com/aws/en/introduction",
    referenceTitle: "Introduction to the Databricks Data Intelligence Platform",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-010",
    domainCode: 1,
    stem: `A data engineer created an all-purpose cluster for interactive notebook work on Friday, used it all day, and then forgot to terminate it before leaving. On Monday, the cloud bill shows the cluster ran — and billed — for the entire weekend, because an administrator had changed the cluster's termination settings at creation. Which default behavior would have stopped the cluster if those settings had been left unchanged?`,
    options: [
      "Interactive clusters never terminate on their own by default; termination must be configured and triggered manually",
      "The same default inactivity timeout applies to job clusters, which otherwise stay running between their job runs",
      "All-purpose clusters are created with auto-termination enabled by default, after 120 minutes of inactivity",
      "Auto-termination only affects clusters that use spot instances; on-demand clusters keep running until stopped",
    ],
    correctIndex: 2,
    explanationEn: `By default, an all-purpose cluster has auto-termination enabled with a 120-minute inactivity timeout: if no commands run on the cluster for two hours, Databricks terminates it automatically, so the forgotten Friday cluster would have stopped on its own. Interactive clusters are not left running indefinitely by default — this default exists precisely to protect against forgotten idle compute. The idle timeout does not apply to job clusters: a classic job cluster is created for a job run and terminated when the run ends, so it does not sit idle between runs waiting for a timer. Auto-termination is also unrelated to spot instances — it applies to any cluster regardless of the node types it uses.`,
    explanationPt: `Por padrão, um cluster all-purpose é criado com auto-termination habilitado e timeout de inatividade de 120 minutos: se nenhum comando rodar no cluster por duas horas, a Databricks o encerra automaticamente — o cluster esquecido na sexta teria parado sozinho. Clusters interativos não ficam rodando indefinidamente por padrão; esse default existe justamente para proteger contra compute esquecido e ocioso. O timeout de ociosidade não se aplica a job clusters: um job cluster clássico é criado para uma execução de job e encerrado quando ela termina, então ele não fica ocioso entre runs esperando um timer. Auto-termination também não tem relação com instâncias spot — vale para qualquer cluster, independentemente dos tipos de nó utilizados.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Configure clusters — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S1-011",
    domainCode: 1,
    stem: `A data engineering team is standardizing the environment for a long-lived production pipeline. The tech lead asks everyone to select a Databricks Runtime version for the pipeline's clusters, ideally one that will keep receiving fixes for as long as possible. Team members disagree about what the Databricks Runtime actually is and what an LTS version offers. Which statement is correct?`,
    options: [
      "Databricks Runtime is only the operating system image installed on the cluster's nodes, with no data processing libraries included",
      "Databricks Runtime packages Apache Spark, Delta Lake, and core libraries, and LTS versions receive fixes for an extended period",
      "Databricks Runtime LTS versions are the oldest and slowest releases available, so new pipelines should always use the latest non-LTS version instead",
      "Databricks Runtime versions are picked automatically for each notebook session, and cannot be pinned on the cluster",
    ],
    correctIndex: 1,
    explanationEn: `Databricks Runtime (DBR) is the set of core components that run on the cluster: it builds on Apache Spark and already includes Delta Lake and other managed libraries, so the pipeline runs on a tested, pre-integrated stack. A version labeled LTS (Long Term Support) is a stable release that keeps receiving critical fixes and updates for an extended period, which is exactly what a long-lived production pipeline should target. DBR is far more than the nodes' operating system image — the OS is only one part of what the runtime installs. LTS releases are not the oldest and slowest choice; they are supported, current releases picked for stability. And the runtime version is chosen explicitly when the cluster is configured — it applies to the whole cluster, not to each notebook session.`,
    explanationPt: `O Databricks Runtime (DBR) é o conjunto de componentes centrais que rodam no cluster: ele é construído sobre o Apache Spark e já inclui o Delta Lake e outras bibliotecas gerenciadas — ou seja, o pipeline roda sobre uma stack testada e pré-integrada. Uma versão LTS (Long Term Support) é uma release estável que continua recebendo correções críticas e atualizações por um período estendido, exatamente o que um pipeline de produção de longa vida deve buscar. O DBR é muito mais do que a imagem de sistema operacional dos nós — o SO é apenas uma parte do que o runtime instala. Versões LTS não são as mais antigas e lentas; são releases atuais e suportadas, escolhidas por estabilidade. E a versão do runtime é escolhida explicitamente na configuração do cluster — ela vale para o cluster inteiro, não para cada sessão de notebook.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute",
    referenceTitle: "Compute — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-012",
    domainCode: 1,
    stem: `A data engineering team's nightly Lakeflow Job runs on a classic job cluster that spends five to ten minutes launching before the first task starts. The team is evaluating moving this job to serverless compute for jobs. Which statement correctly describes what serverless compute changes for this workload?`,
    options: [
      "Serverless compute has Databricks provision, manage, and scale the compute automatically, so jobs start quickly with no clusters to deploy or configure",
      "Serverless compute still requires the team to create, configure, and maintain a dedicated cluster for the job before each run can start",
      "Serverless compute can only power SQL warehouses, so it is unavailable to Lakeflow Jobs and their notebook tasks",
      "Serverless compute removes the need for Unity Catalog to govern the tables that the job reads from and writes to",
    ],
    correctIndex: 0,
    explanationEn: `With serverless compute for jobs, Databricks provisions, manages, and scales the compute automatically in its serverless data plane, so there is no cluster for the team to create, size, or configure, and job runs start almost immediately instead of waiting for a classic cluster to launch. It does not require the team to set up a dedicated cluster — that manual work is exactly what serverless removes. It is not limited to SQL warehouses: serverless compute also runs Lakeflow Jobs, notebooks, and Lakeflow pipelines. And it does not replace Unity Catalog: serverless changes who operates the infrastructure, while permissions, lineage, and auditing of the job's tables still come from Unity Catalog.`,
    explanationPt: `Com o serverless compute for jobs, a Databricks provisiona, gerencia e escala o compute automaticamente no serverless data plane dela — não há cluster para o time criar, dimensionar ou configurar, e as execuções do job começam quase imediatamente, em vez de esperar um cluster clássico subir. Ele não exige que o time configure um cluster dedicado: esse trabalho manual é exatamente o que o serverless elimina. Também não se limita a SQL warehouses — o serverless compute roda Lakeflow Jobs, notebooks e Lakeflow pipelines. E ele não substitui o Unity Catalog: o serverless muda quem opera a infraestrutura, enquanto permissões, lineage e auditoria das tabelas do job continuam vindo do Unity Catalog.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute",
    referenceTitle: "Compute — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S1-013",
    domainCode: 1,
    stem: `A BI team is choosing a SQL warehouse for analysts who run ad hoc queries and dashboard refreshes with very uneven traffic: long quiet periods followed by bursts of concurrent queries. The team wants compute that starts quickly and scales responsively with that demand. Which warehouse should the team choose?`,
    options: [
      "A classic or pro warehouse, because these provision their clusters faster than serverless warehouses and react to load spikes more quickly",
      "Any warehouse type works, because classic, pro, and serverless warehouses behave identically in startup and scaling and differ only in price",
      "A serverless warehouse, which starts quickly, scales dynamically, and is the type Databricks recommends for most workloads",
      "A serverless warehouse, once the team has selected the instance types that its worker clusters will run on",
    ],
    correctIndex: 2,
    explanationEn: `Databricks recommends a serverless SQL warehouse for most workloads: serverless warehouses deliver instant, elastic compute and use Intelligent Workload Management to add capacity dynamically as query traffic grows, so bursts of concurrent queries are absorbed without manual tuning. Classic and pro warehouses are not faster: they use a manual scaling model in which you configure the number of clusters, so runs wait for infrastructure to be provisioned and scaling is less responsive. The types are not identical either — serverless, pro, and classic warehouses differ in startup, scaling, and management model, not just in price. Finally, a serverless warehouse requires no instance type selection: capacity is managed for you, and fixed instance types are a classic and pro concept.`,
    explanationPt: `A Databricks recomenda serverless SQL warehouse para a maioria das cargas: warehouses serverless entregam compute instantâneo e elástico e usam o Intelligent Workload Management para adicionar capacidade dinamicamente conforme o tráfego de queries cresce, então picos de queries concorrentes são absorvidos sem ajuste manual. Warehouses classic e pro não são mais rápidos: usam um modelo de scaling manual, em que você configura o número de clusters, então as execuções esperam o provisionamento da infraestrutura e o scaling é menos responsivo. Os tipos também não são idênticos — serverless, pro e classic diferem no início, no scaling e no modelo de gerenciamento, não apenas no preço. Por fim, um warehouse serverless não exige escolher tipos de instância: a capacidade é gerenciada para você, e tipos de instância fixos são um conceito de classic e pro.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-behavior",
    referenceTitle: "SQL warehouse sizing, scaling, and queuing behavior — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-014",
    domainCode: 1,
    stem: `A new analyst asks where each of these artifacts should live in the Databricks workspace: an iterative Python script that will be edited and run cell by cell, a SQL query that must be saved once and rerun every week, and a management-facing page of visualizations. Which guidance is correct?`,
    options: [
      "Use notebooks for all three artifacts, since saved queries and dashboards are not workspace objects and live in separate external tools",
      "Develop Python in notebooks, save the reusable SQL as a query in Databricks SQL, and build the management page as a dashboard",
      "Build dashboards for all three needs, since dashboards fully replace notebooks for developing and running code",
      "Develop Python in notebooks and build dashboards, but keep the weekly SQL in notebooks too, because saved queries cannot be shared",
    ],
    correctIndex: 1,
    explanationEn: `The workspace holds distinct objects for each need. A notebook is the home for iterative code: cells of Python, R, Scala, or SQL with markdown commentary, edited and run cell by cell. A query saved in Databricks SQL is the right home for the reusable weekly SQL — it can be reopened, rerun, shared with other analysts, and used by dashboards and alerts. A dashboard is the object for a management-facing page of visualizations assembled from queries. Saved queries and dashboards are workspace objects, not external tools, dashboards do not replace notebooks for code development, and a saved query can be shared with other users rather than being locked to its author.`,
    explanationPt: `O workspace guarda objetos distintos para cada necessidade. Um notebook é a casa do código iterativo: células de Python, R, Scala ou SQL com comentários em markdown, editadas e executadas célula por célula. Uma query salva no Databricks SQL é o lugar certo para o SQL semanal reutilizável — ela pode ser reaberta, reexecutada, compartilhada com outros analistas e usada por dashboards e alerts. Um dashboard é o objeto adequado para uma página de visualizações voltadas à gestão, montada a partir de queries. Queries salvas e dashboards são objetos do workspace, não ferramentas externas, dashboards não substituem notebooks no desenvolvimento de código, e uma query salva pode ser compartilhada com outros usuários em vez de ficar presa ao autor.`,
    referenceUrl: "https://docs.databricks.com/aws/en/introduction",
    referenceTitle: "Introduction to the Databricks Data Intelligence Platform",
    difficulty: "EASY",
  },
  {
    key: "S1-015",
    domainCode: 1,
    stem: `Finance asks the platform team to break down monthly Databricks compute costs by team and project so that each group can be charged back. The company runs a single workspace whose many clusters and Lakeflow Jobs are shared across teams. Which approach meets this requirement?`,
    options: [
      "Give every team its own workspace whenever possible, because compute costs can only be measured and charged back per workspace",
      "Track costs by cluster name only, since the cluster name is the single identifying field carried into usage reports",
      "Tag only the SQL warehouses, because custom tags are ignored on classic clusters and job clusters",
      "Apply team and project tags to clusters and jobs, and break the tagged usage down in the billing reports",
    ],
    correctIndex: 3,
    explanationEn: `Custom tags are the built-in mechanism for cost attribution: you attach key-value tags to clusters and Lakeflow Jobs, Databricks applies them to cloud resources like VMs and disk volumes as well as to the Databricks usage logs, and billing and usage reports can then break compute cost down by tag for chargeback. Separate workspaces per team are not required for cost visibility and add heavy operational overhead. Cluster names are free-form labels, not a reliable reporting key — the tagged usage data is. And tags are not limited to SQL warehouses: they work on classic compute, jobs, and pipelines as well.`,
    explanationPt: `Tags customizadas são o mecanismo nativo de atribuição de custo: você anexa pares chave-valor a clusters e Lakeflow Jobs, a Databricks os aplica aos recursos de nuvem, como VMs e volumes de disco, e também aos logs de uso, e os relatórios de billing e de uso conseguem então detalhar o custo de compute por tag para o chargeback. Workspaces separados por time não são necessários para visibilidade de custo e adicionam muita sobrecarga operacional. Nomes de cluster são rótulos livres, não uma chave confiável de relatório — o que vale é o dado de uso tagueado. E tags não se limitam a SQL warehouses: funcionam também em classic compute, jobs e pipelines.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Configure clusters — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-016",
    domainCode: 1,
    stem: `A platform team must install a native operating system package on every node of every classic cluster in the workspace before notebooks or job tasks run, and manually configuring each cluster no longer scales as clusters multiply. Which mechanism should the team use to automate this installation?`,
    options: [
      "Init scripts that run on every node at cluster startup, attached per cluster or defined globally for the whole workspace",
      "Manual installation of the package through each cluster's library settings in the UI, repeated by hand for every new cluster",
      "A %pip install cell in the first notebook of every job, which installs the package node-wide for all later sessions",
      "Init scripts configured to run after each task completes, cleaning up the installed packages between runs",
    ],
    correctIndex: 0,
    explanationEn: `An init script is a shell script that runs during the startup of every cluster node, before the Spark driver and executor JVMs launch, so it can install native packages automatically on all nodes of every cluster — configured per cluster as cluster-scoped init scripts, or once for the whole workspace by admins as global init scripts. Manual installation through library settings is exactly the per-cluster work that does not scale. A %pip cell only affects the Python environment of that notebook session, not the node as a whole. And init scripts run before any work starts, not after tasks complete — they prepare the environment rather than clean it up.`,
    explanationPt: `Um init script é um shell script que roda durante a inicialização de cada nó do cluster, antes de as JVMs do driver e dos executores do Spark subirem — assim ele instala pacotes nativos automaticamente em todos os nós de todos os clusters, configurado por cluster como cluster-scoped init scripts, ou uma única vez para o workspace inteiro pelos admins, como global init scripts. A instalação manual pelas configurações de biblioteca é exatamente o trabalho por cluster que não escala. Uma célula %pip afeta apenas o ambiente Python daquela sessão do notebook, não o nó como um todo. E init scripts rodam antes de qualquer trabalho começar, não depois das tarefas — eles preparam o ambiente em vez de fazer limpeza.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Configure clusters — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-017",
    domainCode: 1,
    stem: `A team's latency-sensitive Lakeflow Jobs run on classic job clusters, and every run still loses four to six minutes while cloud instances are acquired and bootstrapped. The team wants to cut that startup delay for its most time-critical nightly runs. Which approach should the team take?`,
    options: [
      "Keep one all-purpose cluster running around the clock and point every job at it, so no job run ever waits for a cluster to start",
      "Rely on an instance pool's pre-warmed instances, which deliver instant cluster startup with no idle-instance charges on the cloud bill",
      "Attach the job clusters to an instance pool, which keeps idle instances ready and cuts startup time at the cost of idle billing",
      "Move the jobs onto a pool-backed SQL warehouse, because instance pools can only accelerate SQL warehouses",
    ],
    correctIndex: 2,
    explanationEn: `An instance pool keeps a set of idle, pre-warmed cloud instances ready; clusters configured with the pool attach to those instances instead of waiting for the cloud provider to acquire new ones, cutting the startup delay for time-critical job runs — with the trade-off that idle pool instances keep billing on the cloud account. Pools do not make that idle capacity free: keeping instances warm is precisely what removes the wait. An always-on all-purpose cluster would also avoid startup waits, but it bills a full interactive cluster around the clock and couples every job to shared compute. And pools are not a SQL warehouse feature: they back classic clusters, so they accelerate clusters, not warehouses.`,
    explanationPt: `Um instance pool mantém um conjunto de instâncias de nuvem ociosas e pré-aquecidas; clusters configurados com o pool anexam essas instâncias em vez de esperar o provedor de nuvem alocar novas máquinas, cortando o atraso de inicialização das execuções críticas — com o trade-off de que as instâncias ociosas do pool continuam gerando custo na conta de nuvem. Pools não tornam essa capacidade ociosa gratuita: manter instâncias prontas é exatamente o que elimina a espera. Um cluster all-purpose sempre ligado também evitaria a espera, mas fatura um cluster interativo completo 24 horas por dia e acopla todos os jobs a um compute compartilhado. E pools não são um recurso de SQL warehouse: eles servem ao classic compute, então aceleram clusters, não warehouses.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute",
    referenceTitle: "Compute — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S1-018",
    domainCode: 1,
    stem: `A newly hired data engineer asks how work is divided when a PySpark notebook runs on a multi-node cluster: where the notebook's code and the Spark session live, and where the actual parallel processing of data happens. Which answer is correct?`,
    options: [
      "All of the work, including data processing, runs on the driver node; the executors are passive and only store the underlying data files",
      "Each executor runs its own full copy of the notebook's code and independently processes its own portion of the data",
      "Driver nodes exist only on high-concurrency shared clusters; single-user clusters and dedicated job clusters run without any driver at all",
      "The driver node hosts the Spark session and coordinates tasks, while executors run the tasks that process data in parallel",
    ],
    correctIndex: 3,
    explanationEn: `In a Spark cluster, the driver node hosts the Spark session and runs the notebook's user code: it analyzes the code, builds the execution plan, and distributes tasks to the executors. The executors are the worker nodes that actually run those tasks, each processing its partition of the data in parallel and reporting results back to the driver. Executors are not passive file stores — they do the data processing. They do not each re-run the whole notebook; they execute only the individual tasks assigned by the driver. And every cluster has a driver, whether it is a shared, single-user, or job cluster.`,
    explanationPt: `Em um cluster Spark, o driver node hospeda a Spark session e executa o código do notebook: ele analisa o código, constrói o plano de execução e distribui as tarefas para os executores. Os executors são os nós de trabalho que de fato executam essas tarefas, cada um processando sua partição dos dados em paralelo e devolvendo os resultados ao driver. Executors não são depósitos passivos de arquivos — são eles que processam os dados. Eles também não reexecutam o notebook inteiro cada um; executam apenas as tarefas individuais atribuídas pelo driver. E todo cluster tem um driver, seja ele compartilhado, single-user ou um job cluster.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute",
    referenceTitle: "Compute — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S1-019",
    domainCode: 1,
    stem: `A finance analyst reviewing the Databricks invoice asks the platform team what a "DBU" actually is, because the bill is expressed in Databricks Units consumed per hour by each compute resource.

Which explanation is correct?`,
    options: [
      "A fixed dollar amount that is identical across all compute types, so costs vary only with hours run",
      "A unit of processing capability, billed per second at rates that depend on the compute type",
      "A measure of lakehouse storage consumed, charged per gigabyte-month of data retained",
      "A license seat billed per named user, regardless of how much compute that user runs",
    ],
    correctIndex: 1,
    explanationEn: `A Databricks Unit (DBU) is the unit of measure for the platform's processing capability: compute resources consume DBUs while they run, and each SKU — all-purpose compute, job compute, serverless, SQL warehouses — has its own DBU rate, which is why choosing the right compute type for a workload changes the bill even at equal runtime. It is not a flat currency (rates differ by SKU), it does not measure storage, and it is not a per-seat license: it tracks usage of compute.`,
    explanationPt: `Uma Databricks Unit (DBU) é a unidade de medida da capacidade de processamento da plataforma: os recursos de compute consomem DBUs enquanto executam, e cada SKU — compute all-purpose, job compute, serverless, SQL warehouses — tem sua própria taxa de DBU; por isso escolher o tipo certo de compute para um workload muda a fatura mesmo com o mesmo tempo de execução. Não é uma moeda fixa (as tarifas variam por SKU), não mede armazenamento e não é licença por usuário: acompanha o uso de compute.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute",
    referenceTitle: "Compute — Databricks Docs",
    difficulty: "EASY",
  },
];

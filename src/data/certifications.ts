/**
 * Canonical certification metadata (seed source of truth).
 * All facts verified against the official Databricks page and the Exam Guide
 * (version as of May 4, 2026) on 2025-XX research session:
 *  - https://www.databricks.com/learn/certification/data-engineer-associate
 *  - https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf
 */
export interface SeedDomain {
  code: number;
  name: string;
  namePt: string;
  weightPercent: number;
  /** Official outline bullets (EN, condensed from the exam guide). */
  outlineEn: string[];
  /** PT-BR rendering of the outline bullets. */
  outlinePt: string[];
}

export interface SeedCertification {
  slug: string;
  /** Compact exam code used in public question IDs (RAN-{EXAM}-{SEQ}) and the hub manifest. Immutable once published. */
  examCode: string;
  vendor: string;
  name: string;
  shortName: string;
  versionLabel: string;
  durationMin: number;
  questionCount: number;
  /** Community reference threshold — Databricks does not publish an official cut score. */
  passingScorePercent: number;
  passingScoreIsOfficial: boolean;
  fee: string;
  languages: string;
  delivery: string;
  officialUrl: string;
  guideUrl: string;
  trainingUrl: string;
  descriptionEn: string;
  descriptionPt: string;
  codeNoteEn: string;
  codeNotePt: string;
  domains: SeedDomain[];
}

export const CERTIFICATIONS: SeedCertification[] = [
  {
    slug: "databricks-data-engineer-associate",
    examCode: "DBDEA",
    vendor: "Databricks",
    name: "Databricks Certified Data Engineer Associate",
    shortName: "Data Engineer Associate",
    versionLabel: "Exam version: May 4, 2026",
    durationMin: 90,
    questionCount: 45,
    passingScorePercent: 70,
    passingScoreIsOfficial: false,
    fee: "USD 200 (+ local taxes)",
    languages: "English, 日本語, Português (BR), 한국어",
    delivery: "Online proctored or test center",
    officialUrl: "https://www.databricks.com/learn/certification/data-engineer-associate",
    guideUrl:
      "https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf",
    trainingUrl: "https://www.databricks.com/learn/training/home",
    descriptionEn:
      "Assesses the ability to use the Databricks Data Intelligence Platform to execute foundational data engineering tasks: the platform and its workspace/architecture, data ingestion and loading, transformation and modeling with PySpark/SQL, Lakeflow Jobs, CI/CD, troubleshooting, monitoring, optimization, and governance & security.",
    descriptionPt:
      "Avalia a capacidade de usar a Databricks Data Intelligence Platform para executar tarefas fundamentais de engenharia de dados: a plataforma e seu workspace/arquitetura, ingestão e carregamento de dados, transformação e modelagem com PySpark/SQL, Lakeflow Jobs, CI/CD, troubleshooting, monitoramento, otimização e governança & segurança.",
    codeNoteEn:
      "Data manipulation code in the exam is provided in SQL when possible; in all other cases, code is in Python.",
    codeNotePt:
      "No exame, código de manipulação de dados é em SQL quando possível; nos demais casos, em Python.",
    domains: [
      {
        code: 1,
        name: "Databricks Intelligence Platform",
        namePt: "Plataforma Databricks Intelligence",
        weightPercent: 6,
        outlineEn: [
          "Understand the core components of the Databricks Data Intelligence Platform, such as its architecture, Delta Lake, and Unity Catalog.",
          "Understand compute services, including their characteristics, limitations, and cost models, and select the most suitable option for each workload use case.",
        ],
        outlinePt: [
          "Entender os componentes centrais da Databricks Data Intelligence Platform, como arquitetura, Delta Lake e Unity Catalog.",
          "Entender os serviços de compute (características, limitações e modelos de custo) e selecionar a opção mais adequada para cada caso de uso.",
        ],
      },
      {
        code: 2,
        name: "Data Ingestion and Loading",
        namePt: "Ingestão e Carregamento de Dados",
        weightPercent: 21,
        outlineEn: [
          "Enable data ingestion patterns: batch, streaming, and incremental loading; import from local files, Lakeflow Connect standard connectors, and managed connectors.",
          "Use COPY INTO to incrementally load files from cloud object storage (ADLS/S3/GCS) into Unity Catalog-governed tables.",
          "Use Auto Loader with schema enforcement and schema evolution in batch modes (directory listing, file notification) to land data into Unity Catalog-governed tables.",
          "Configure Lakeflow Connect to reliably ingest data from diverse enterprise sources into Unity Catalog-governed tables.",
          "Use JDBC/ODBC or REST clients in notebooks to land data into cloud storage or Unity Catalog-governed tables, usually orchestrated with Lakeflow Jobs.",
          "Prioritize between Auto Loader, Lakeflow Connect (standard and managed connectors), partner connectors, and other ingestion methods based on volume, frequency, data types, and governance needs.",
          "Ingest semi-structured and unstructured data (e.g., JSON, nested data) via Lakeflow Connect and other managed connectors into Unity Catalog-governed Delta tables.",
        ],
        outlinePt: [
          "Habilitar padrões de ingestão: batch, streaming e carregamento incremental; importar de arquivos locais, conectores standard do Lakeflow Connect e conectores gerenciados.",
          "Usar COPY INTO para carregar incrementalmente arquivos do cloud object storage (ADLS/S3/GCS) em tabelas governadas pelo Unity Catalog.",
          "Usar Auto Loader com schema enforcement e schema evolution em modos batch (directory listing, file notification) para aterrissar dados em tabelas governadas pelo Unity Catalog.",
          "Configurar o Lakeflow Connect para ingerir com confiabilidade dados de fontes corporativas em tabelas governadas pelo Unity Catalog.",
          "Usar clientes JDBC/ODBC ou REST em notebooks para aterrissar dados em cloud storage ou tabelas governadas pelo Unity Catalog, geralmente orquestrados com Lakeflow Jobs.",
          "Priorizar entre Auto Loader, Lakeflow Connect (standard e gerenciados), conectores de parceiros e outros métodos de ingestão com base em volume, frequência, tipos de dados e necessidade de governança.",
          "Ingerir dados semiestruturados e não estruturados (ex.: JSON, dados aninhados) via Lakeflow Connect e outros conectores gerenciados em tabelas Delta governadas pelo Unity Catalog.",
        ],
      },
      {
        code: 3,
        name: "Data Transformation and Modeling",
        namePt: "Transformação e Modelagem de Dados",
        weightPercent: 22,
        outlineEn: [
          "Implement data cleaning by reading bronze tables with PySpark/SQL, cleaning nulls, standardizing data types, and writing to new silver tables.",
          "Combine DataFrames: inner join, left join, broadcast join, multiple keys, cross join, union, and union all.",
          "Manipulate columns, rows, and table structures: add, drop, split, rename columns; apply filters; explode arrays.",
          "Perform deduplication and aggregations on DataFrames: count, approximate count distinct, mean, summary.",
          "Understand basic tuning parameters (spark.sql.shuffle.partitions, spark.default.parallelism, spark.executor/driver.memory, spark.sql.autoBroadcastJoinThreshold) and re-measure performance.",
          "Understand the difference between, and how to build, Gold layer objects: materialized views, views, streaming tables, and tables for BI/analytics teams in Unity Catalog.",
          "Apply data quality checks and validation rules to ensure reliable Silver and Gold datasets.",
        ],
        outlinePt: [
          "Implementar limpeza de dados lendo tabelas bronze com PySpark/SQL, tratando nulos, padronizando tipos e escrevendo novas tabelas silver.",
          "Combinar DataFrames: inner join, left join, broadcast join, múltiplas chaves, cross join, union e union all.",
          "Manipular colunas, linhas e estruturas de tabelas: adicionar, remover, dividir e renomear colunas; aplicar filtros; explodir arrays.",
          "Realizar deduplicação e agregações em DataFrames: count, approximate count distinct, mean, summary.",
          "Entender parâmetros básicos de tuning (spark.sql.shuffle.partitions, spark.default.parallelism, spark.executor/driver.memory, spark.sql.autoBroadcastJoinThreshold) e remedir a performance.",
          "Entender a diferença entre — e como construir — objetos da camada Gold: materialized views, views, streaming tables e tables para times de BI/analytics no Unity Catalog.",
          "Aplicar checagens de qualidade de dados e regras de validação para garantir datasets Silver e Gold confiáveis.",
        ],
      },
      {
        code: 4,
        name: "Working with Lakeflow Jobs",
        namePt: "Trabalhando com Lakeflow Jobs",
        weightPercent: 16,
        outlineEn: [
          "Implement control flows (retries and conditional tasks such as branching and looping) using Lakeflow Jobs for pipeline orchestration.",
          "Configure common tasks (notebook, SQL query, dashboard, and pipeline tasks) and their dependencies using Lakeflow Jobs and its DAG-based task graph.",
          "Implement job schedules with Lakeflow Jobs with an understanding of trigger types (scheduled, file arrival, and table update).",
          "Choose between time-based and data-driven triggers based on data availability and pipeline dependencies.",
        ],
        outlinePt: [
          "Implementar fluxos de controle (retries e tarefas condicionais como branching e looping) usando Lakeflow Jobs para orquestração de pipelines.",
          "Configurar tarefas comuns (notebook, SQL query, dashboard e pipeline tasks) e suas dependências usando Lakeflow Jobs e seu grafo de tarefas baseado em DAG.",
          "Implementar agendamentos com Lakeflow Jobs entendendo os tipos de gatilho (scheduled, file arrival e table update).",
          "Escolher entre gatilhos baseados em tempo e baseados em dados, conforme disponibilidade dos dados e dependências do pipeline.",
        ],
      },
      {
        code: 5,
        name: "Implementing CI/CD",
        namePt: "Implementando CI/CD",
        weightPercent: 10,
        outlineEn: [
          "Manage the code development workflow in the Databricks workspace UI: creating and switching branches in Databricks Git Folders (formerly Repos), committing and pushing changes, and creating pull requests using Databricks Git integration.",
          "Understand environment-specific configuration using Automation Bundle (formerly Databricks Asset Bundles) variables and overrides while promoting the same codebase across dev, test, and prod targets.",
          "Deploy Automation Bundles to package, configure, and promote Lakeflow Jobs, Lakeflow Spark Declarative Pipelines, and other workspace assets across dev, test, and prod environments.",
          "Understand the Databricks CLI to validate, deploy, and manage Automation Bundles and other workspace assets in automated CI/CD workflows.",
        ],
        outlinePt: [
          "Gerenciar o fluxo de desenvolvimento de código na UI do workspace: criar e alternar branches nos Databricks Git Folders (antes Repos), commitar, enviar mudanças e criar pull requests com a integração Git da Databricks.",
          "Entender configuração por ambiente com variáveis e overrides de Automation Bundles (antes Databricks Asset Bundles) ao promover a mesma base de código entre targets dev, test e prod.",
          "Deployar Automation Bundles para empacotar, configurar e promover Lakeflow Jobs, Lakeflow Spark Declarative Pipelines e outros assets do workspace entre ambientes dev, test e prod.",
          "Entender a Databricks CLI para validar, deployar e gerenciar Automation Bundles e outros assets em fluxos automatizados de CI/CD.",
        ],
      },
      {
        code: 6,
        name: "Troubleshooting, Monitoring, and Optimization",
        namePt: "Troubleshooting, Monitoramento e Otimização",
        weightPercent: 10,
        outlineEn: [
          "Identify trends in job performance using the Lakeflow Jobs run history view to compare current execution times against historical baselines.",
          "Use the Lakeflow Jobs UI to monitor pipeline health: interpreting job statuses, viewing DAG-based task graphs to spot upstream blockers, and tracking run times and failure rates.",
          "Identify common performance bottlenecks such as data skew, shuffling, and disk spilling by interpreting stage-level metrics in the Spark UI.",
          "Understand the features of Liquid Clustering and predictive optimization.",
          "Diagnose cluster startup failures, library conflicts, and out-of-memory issues.",
        ],
        outlinePt: [
          "Identificar tendências de performance de jobs usando a visão de histórico de execuções do Lakeflow Jobs para comparar tempos atuais com baselines históricos.",
          "Usar a UI do Lakeflow Jobs para monitorar a saúde do pipeline: interpretar statuses de jobs, ver grafos de tarefas (DAG) para identificar bloqueadores a montante e acompanhar tempos de execução e taxas de falha.",
          "Identificar gargalos comuns de performance — data skew, shuffling e disk spilling — interpretando métricas por estágio no Spark UI.",
          "Entender os recursos de Liquid Clustering e predictive optimization.",
          "Diagnosticar falhas de inicialização de clusters, conflitos de bibliotecas e problemas de out-of-memory.",
        ],
      },
      {
        code: 7,
        name: "Governance and Security",
        namePt: "Governança e Segurança",
        weightPercent: 15,
        outlineEn: [
          "Differentiate between managed and external tables in Unity Catalog and perform basic operations (create, modify, delete, and convert between managed and external tables).",
          "Configure access controls using the UI and SQL by applying GRANT, REVOKE, and DENY privileges to principals (users, groups, and service principals) at appropriate levels of the security hierarchy.",
          "Understand column-level masking and row-level security to restrict data visibility based on user groups.",
          "Understand Unity Catalog ABAC policies to centrally control row-level filtering and column masking for sensitive data.",
        ],
        outlinePt: [
          "Diferenciar tabelas gerenciadas e externas no Unity Catalog e realizar operações básicas (criar, modificar, excluir e converter entre gerenciadas e externas).",
          "Configurar controles de acesso pela UI e SQL aplicando privilégios GRANT, REVOKE e DENY a principals (usuários, grupos e service principals) nos níveis adequados da hierarquia de segurança.",
          "Entender mascaramento por coluna (column masking) e segurança por linha (row-level security) para restringir a visibilidade de dados com base em grupos de usuários.",
          "Entender políticas ABAC do Unity Catalog para controlar centralmente filtragem por linha e mascaramento de coluna para dados sensíveis.",
        ],
      },
    ],
  },
];

/** Stratified per-domain question counts for a full exam simulation (45 questions). */
export const EXAM_DISTRIBUTION: Record<number, number> = {
  1: 3,
  2: 9,
  3: 10,
  4: 7,
  5: 5,
  6: 4,
  7: 7,
};

/**
 * Glossário bilíngue de consulta (v1.9.0 — spec docs/sdd/spec-v1.9.0-glossario.md).
 *
 * Divisão de trabalho entre modos: Estudar/Exame = reconhecimento; Flashcards
 * = evocação; Trilhas = sequência; **Glossário = consulta**. Não é modo de
 * estudo — sem SRS, sem sessão, sem contadores.
 *
 * Regras da spec §2 (inegociáveis, garantidas por scripts/validate-glossary.ts):
 *  - seleção por presença REAL no banco de 300 questões (varredura Task 23);
 *  - termo canônico em INGLÊS (como a prova usa) + apelidos relevantes
 *    (ex.: "Auto Loader" ↔ "cloudFiles"; "DLT" ↔ "Lakeflow Declarative
 *    Pipelines");
 *  - gloss PT-BR e gloss EN, 1–2 linhas, voz das explicações do banco;
 *  - `url` SEMPRE da allowlist verificada do CI (scripts/ci_gate/allowlist.tsv
 *    — mesmas URLs das questões; URLs novas só entram lá com revisão);
 *  - `domainCodes` ⊆ {1..7} (as 7 siglas oficiais do blueprint DBDEA).
 *
 * Dado 100% estático: compila no bundle, funciona offline por construção —
 * sem endpoint, sem tabela, sem cache de borda, sem TanStack Query.
 */

export interface GlossaryEntry {
  /** Kebab-case, único — validado pelo gate. */
  slug: string;
  /** Termo canônico em inglês, como o exame usa. */
  term: string;
  /** Apelidos/nomes alternativos que a busca também casa. */
  aliases?: string[];
  glossPt: string;
  glossEn: string;
  /** Fonte oficial — obrigatoriamente na allowlist do CI. */
  url: string;
  /** Domínios oficiais do blueprint onde o termo aparece (1–7). */
  domainCodes: number[];
}

export const GLOSSARY: GlossaryEntry[] = [
  // ------------------------------------------------------------------
  // S1 · Databricks Intelligence Platform
  // ------------------------------------------------------------------
  {
    slug: "workspace",
    term: "workspace",
    glossPt:
      "Ambiente Databricks de uma pessoa ou equipe: notebooks, pastas Git, jobs, dashboards e permissões vivem aqui. Pertence a uma conta e é o contêiner de tudo o que você cria na plataforma.",
    glossEn:
      "A Databricks environment for a person or team: notebooks, Git folders, jobs, dashboards and permissions live here. It belongs to an account and is the container for everything you create on the platform.",
    url: "https://docs.databricks.com/aws/en/introduction",
    domainCodes: [1],
  },
  {
    slug: "notebook",
    term: "notebook",
    glossPt:
      "Documento interativo que mistura código (Python, SQL, Scala, R), saídas e Markdown em células. É onde a maior parte do desenvolvimento de dados acontece no workspace — células %sql e %python coexistem.",
    glossEn:
      "Interactive document mixing code (Python, SQL, Scala, R), outputs and Markdown in cells. Most data development in the workspace happens here — %sql and %python cells can coexist.",
    url: "https://docs.databricks.com/aws/en/introduction",
    domainCodes: [1],
  },
  {
    slug: "dashboard",
    term: "dashboard",
    glossPt:
      "Coleção de visualizações construídas sobre consultas SQL e compartilháveis dentro do workspace. No contexto da prova, dashboards alimentam times de BI/analistas a partir da camada Gold.",
    glossEn:
      "A collection of visualizations built on SQL queries and shareable within the workspace. In exam terms, dashboards feed BI/analyst teams from the Gold layer.",
    url: "https://docs.databricks.com/aws/en/introduction",
    domainCodes: [1],
  },
  {
    slug: "databricks-sql",
    term: "Databricks SQL",
    glossPt:
      "A superfície de analítica do workspace: editor SQL, dashboards e SQL warehouses para consultas e BI — tudo governado pelo Unity Catalog.",
    glossEn:
      "The analytics surface of the workspace: SQL editor, dashboards and SQL warehouses for queries and BI — all governed by Unity Catalog.",
    url: "https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-behavior",
    domainCodes: [1],
  },
  {
    slug: "sql-warehouse",
    term: "SQL warehouse",
    aliases: ["warehouse", "serverless SQL warehouse"],
    glossPt:
      "Motor de compute para consultas SQL e BI: sobe e desce sozinho, escala automaticamente e cobra por DBU enquanto roda. Sem cluster Spark para gerenciar — é o ponto de entrada do Databricks SQL.",
    glossEn:
      "The compute engine for SQL queries and BI: it starts and stops on its own, autoscales and bills by DBU while running. No Spark cluster to manage — it is the entry point for Databricks SQL.",
    url: "https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-behavior",
    domainCodes: [1],
  },
  {
    slug: "serverless-compute",
    term: "serverless compute",
    glossPt:
      "Compute que a Databricks provisiona e gerencia por você: início rápido, sem infraestrutura visível e cobrança por uso. Contraste com clusters que você configura e espera subir.",
    glossEn:
      "Compute that Databricks provisions and manages for you: fast startup, no visible infrastructure, pay-per-use. Contrast with clusters you configure and wait to boot.",
    url: "https://docs.databricks.com/aws/en/compute",
    domainCodes: [1],
  },
  {
    slug: "dbu",
    term: "DBU",
    aliases: ["Databricks Unit"],
    glossPt:
      "Unidade de cobrança da Databricks: um DBU equivale a uma hora de processamento, conforme o tipo e o nível do compute. Compare custos pensando em DBUs — job compute e serverless cobram menos que all-purpose.",
    glossEn:
      "Databricks' billing unit: one DBU equals an hour of processing depending on compute type and tier. Compare costs in DBUs — job compute and serverless bill less than all-purpose.",
    url: "https://docs.databricks.com/aws/en/compute",
    domainCodes: [1],
  },
  {
    slug: "all-purpose-cluster",
    term: "all-purpose cluster",
    glossPt:
      "Cluster de uso geral para desenvolvimento interativo e análise: compartilhado, reutilizável e com taxa de DBU mais alta. Não é a escolha econômica para jobs agendados.",
    glossEn:
      "General-purpose cluster for interactive development and analysis: shared, reusable, billed at a higher DBU rate. Not the economical choice for scheduled jobs.",
    url: "https://docs.databricks.com/aws/en/compute",
    domainCodes: [1],
  },
  {
    slug: "job-cluster",
    term: "job cluster",
    glossPt:
      "Cluster criado para UM job e destruído no fim da execução: isolamento total entre execuções, sem estado residual — e taxa de DBU menor. A escolha padrão para cargas de produção.",
    glossEn:
      "A cluster created for ONE job and destroyed when it ends: full isolation between runs, no residual state — and a lower DBU rate. The default choice for production workloads.",
    url: "https://docs.databricks.com/aws/en/jobs/compute",
    domainCodes: [1, 4],
  },
  {
    slug: "shared-cluster",
    term: "shared cluster",
    aliases: ["shared access mode"],
    glossPt:
      "Modo de acesso em que vários usuários compartilham um cluster com isolamento gerenciado pelo Unity Catalog. Suporta SQL e Python — sem RDDs nem bibliotecas fora do pacote.",
    glossEn:
      "Access mode where multiple users share one cluster with isolation managed by Unity Catalog. Supports SQL and Python only — no RDDs or unpackaged libraries.",
    url: "https://docs.databricks.com/aws/en/compute/configure",
    domainCodes: [1],
  },
  {
    slug: "single-user-cluster",
    term: "single-user cluster",
    aliases: ["single-user access mode", "assigned access mode"],
    glossPt:
      "Modo de acesso sem isolamento entre usuários: o cluster pertence a um único principal (usuário ou service principal) e ganha desempenho por dispensar as barreiras do modo compartilhado.",
    glossEn:
      "Access mode with no isolation between users: the cluster belongs to a single principal (user or service principal) and gains performance by skipping shared-mode barriers.",
    url: "https://docs.databricks.com/aws/en/compute/configure",
    domainCodes: [1],
  },
  {
    slug: "autotermination",
    term: "autotermination",
    glossPt:
      "Encerramento automático de um cluster ocioso após X minutos configuráveis. É a rede de segurança contra clusters esquecidos queimando DBUs — política recomendada em todo compute interativo.",
    glossEn:
      "Automatic shutdown of an idle cluster after a configurable number of minutes. The safety net against forgotten clusters burning DBUs — recommended policy on all interactive compute.",
    url: "https://docs.databricks.com/aws/en/compute",
    domainCodes: [1],
  },
  {
    slug: "photon",
    term: "Photon",
    aliases: ["Photon acceleration"],
    glossPt:
      "Engine vetorial em C++ acoplada ao runtime: acelera SQL e operações de DataFrame sem mudar código. Perguntas de comparação de desempenho frequentemente apontam Photon como resposta.",
    glossEn:
      "C++ vectorized engine built into the runtime: speeds up SQL and DataFrame operations with no code changes. Performance comparison questions often point to Photon.",
    url: "https://docs.databricks.com/aws/en/compute/photon",
    domainCodes: [1, 6],
  },
  {
    slug: "init-script",
    term: "init script",
    glossPt:
      "Script executado na inicialização de cada nó para instalar bibliotecas ou configurar ambiente. Caminho legado para dependências — hoje prefira bibliotecas gerenciadas e políticas de cluster.",
    glossEn:
      "Script run at node startup to install libraries or configure the environment. Legacy path for dependencies — prefer managed libraries and cluster policies today.",
    url: "https://docs.databricks.com/aws/en/compute/configure",
    domainCodes: [1],
  },
  {
    slug: "secrets",
    term: "secrets",
    aliases: ["secret scope", "Databricks Secrets"],
    glossPt:
      "Armazenamento de credenciais com escopo: senhas e tokens entram num scope e são lidos em runtime com dbutils.secrets — nunca impressos, nunca commitados. Notebooks veem o valor mascarado.",
    glossEn:
      "Scoped credential storage: passwords and tokens go into a scope and are read at runtime with dbutils.secrets — never printed, never committed. Notebooks see a redacted value.",
    url: "https://docs.databricks.com/aws/en/security/secrets",
    domainCodes: [1, 7],
  },
  {
    slug: "scim",
    term: "SCIM",
    aliases: ["SCIM 2.0", "System for Cross-domain Identity Management"],
    glossPt:
      "Protocolo padrão para sincronizar identidades: usuários, grupos e service principals fluem do IdP corporativo para a conta Databricks. É assim que o provisionamento de contas acontece.",
    glossEn:
      "Standard protocol for syncing identities: users, groups and service principals flow from the corporate IdP into the Databricks account. That is how account provisioning happens.",
    url: "https://docs.databricks.com/aws/en/introduction",
    domainCodes: [1, 7],
  },
  {
    slug: "account-console",
    term: "account console",
    glossPt:
      "Painel administrativo da CONTA Databricks (acima dos workspaces): usuários, grupos, metastores, identidade federada e configurações de conta. Não confundir com a UI do workspace.",
    glossEn:
      "The ADMIN console for the Databricks account (above workspaces): users, groups, metastores, federated identity and account settings. Not to be confused with the workspace UI.",
    url: "https://docs.databricks.com/aws/en/introduction",
    domainCodes: [1],
  },
  {
    slug: "unity-catalog",
    term: "Unity Catalog",
    aliases: ["UC"],
    glossPt:
      "Camada de governança central da plataforma: um metastore por região, hierarquia catalog → schema → objeto, permissões GRANT/REVOKE, lineage e auditoria de tudo. Um usuário, muitos workspaces, um catálogo.",
    glossEn:
      "The platform's central governance layer: one metastore per region, catalog → schema → object hierarchy, GRANT/REVOKE permissions, lineage and auditing throughout. One user, many workspaces, one catalog.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    domainCodes: [1, 7],
  },
  {
    slug: "metastore",
    term: "metastore",
    aliases: ["Unity Catalog metastore", "Hive metastore"],
    glossPt:
      "Contêiner de metadados em nível de conta/região: catálogos, esquemas e permissões do Unity Catalog vivem num metastore anexado aos workspaces. O Hive metastore legado é o predecessor por workspace.",
    glossEn:
      "Account/region-level metadata container: Unity Catalog catalogs, schemas and permissions live in a metastore attached to workspaces. The legacy Hive metastore is its per-workspace predecessor.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    domainCodes: [1, 7],
  },
  {
    slug: "catalog",
    term: "catalog",
    glossPt:
      "Primeiro nível da hierarquia Unity Catalog (catalog → schema → tabela/view/volume). Agrupa esquemas por domínio ou ambiente — ex.: prod_analytics — e é unidade de concessão de permissões.",
    glossEn:
      "Top level of the Unity Catalog hierarchy (catalog → schema → table/view/volume). Groups schemas by domain or environment — e.g. prod_analytics — and is a unit for granting permissions.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    domainCodes: [1, 7],
  },
  {
    slug: "schema-object",
    term: "schema",
    aliases: ["database"],
    glossPt:
      "Segundo nível da hierarquia Unity Catalog: dentro de um catalog, o schema organiza tabelas, views e volumes. Na linguagem SQL antiga, \"database\" — hoje schema é o termo oficial.",
    glossEn:
      "Second level of the Unity Catalog hierarchy: inside a catalog, a schema organizes tables, views and volumes. Legacy SQL called it a \"database\" — schema is the official term now.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    domainCodes: [1, 7],
  },
  {
    slug: "managed-table",
    term: "managed table",
    glossPt:
      "Tabela cujos dados e metadados o Unity Catalog gerencia no caminho padrão: DROP apaga os dados, otimizações automáticas disponíveis. A escolha padrão no lakehouse.",
    glossEn:
      "Table whose data and metadata Unity Catalog manages in the default location: DROP deletes the data, automatic optimizations are available. The lakehouse default.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external",
    domainCodes: [1, 7],
  },
  {
    slug: "external-table",
    term: "external table",
    glossPt:
      "Tabela registrada sobre dados em um local que VOCÊ controla (external location): DROP remove só os metadados — os arquivos permanecem. Use quando o dado é compartilhado fora do Databricks.",
    glossEn:
      "Table registered over data in a location YOU control (external location): DROP removes only the metadata — files stay. Use when the data is shared outside Databricks.",
    url: "https://docs.databricks.com/aws/en/tables/external",
    domainCodes: [1, 7],
  },
  {
    slug: "view",
    term: "view",
    glossPt:
      "SELECT salvo como objeto de catálogo: zero cópia de dados, executado sobre as tabelas de origem com os privilégios do DONO da view. Quem consulta não precisa de acesso à origem.",
    glossEn:
      "A saved SELECT exposed as a catalog object: zero data copied, executed over the source tables with the VIEW OWNER's privileges. Readers need no access to the sources.",
    url: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-create-view",
    domainCodes: [1, 3],
  },
  {
    slug: "dynamic-view",
    term: "dynamic view",
    glossPt:
      "View com funções de identidade (current_user(), is_account_group_member()) dentro do WHERE: cada usuário vê linhas diferentes da MESMA view — row-level security sem tabelas duplicadas.",
    glossEn:
      "View with identity functions (current_user(), is_account_group_member()) inside the WHERE: each user sees different rows of the SAME view — row-level security without duplicate tables.",
    url: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-create-view",
    domainCodes: [1, 7],
  },
  {
    slug: "materialized-view",
    term: "materialized view",
    glossPt:
      "Objeto Gold que PRÉ-CALCULA agregações e junções: consultas rápidas, com custo de armazenamento e atualização incremental a partir da origem. Para BI que bate na mesma agregação todo dia.",
    glossEn:
      "Gold-layer object that PRE-COMPUTES aggregations and joins: fast queries at the cost of storage and incremental refresh from the source. For BI hitting the same aggregation every day.",
    url: "https://docs.databricks.com/aws/en/ldp/concepts/materialized-views",
    domainCodes: [1, 3],
  },
  {
    slug: "streaming-table",
    term: "streaming table",
    glossPt:
      "Tabela alimentada por pipeline declarativo (Lakeflow/DLT): ingere com Auto Loader e processa incrementalmente, exatamente uma vez. É o destino natural da camada Bronze.",
    glossEn:
      "Table fed by a declarative pipeline (Lakeflow/DLT): ingests with Auto Loader and processes incrementally, exactly once. The natural landing zone for the Bronze layer.",
    url: "https://docs.databricks.com/aws/en/ldp/concepts/streaming-tables",
    domainCodes: [1, 2, 3],
  },
  {
    slug: "volumes",
    term: "volumes",
    aliases: ["Unity Catalog Volumes", "UC Volumes"],
    glossPt:
      "Objeto Unity Catalog para ARQUIVOS não-tabulares no storage gerenciado: caminhos governados, com permissões, em vez de paths soltos de cloud. O jeito certo de ler e escrever datasets de arquivos.",
    glossEn:
      "Unity Catalog object for non-tabular FILES in managed storage: governed paths with permissions instead of loose cloud locations. The right way to read and write file datasets.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external",
    domainCodes: [1, 7],
  },
  {
    slug: "external-location",
    term: "external location",
    glossPt:
      "Objeto Unity Catalog que registra um caminho de cloud storage para uso por tabelas externas e volumes: um caminho, uma credencial de storage, governados em um lugar só.",
    glossEn:
      "Unity Catalog object that registers a cloud storage path for external tables and volumes to use: one path, one storage credential, governed in one place.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external",
    domainCodes: [1, 7],
  },
  {
    slug: "storage-credential",
    term: "storage credential",
    aliases: ["credential"],
    glossPt:
      "Objeto Unity Catalog que encapsula uma identidade de cloud (IAM role, service principal) para acessar storage. External locations apontam para credenciais; tabelas e volumes nunca guardam segredos.",
    glossEn:
      "Unity Catalog object encapsulating a cloud identity (IAM role, service principal) used to reach storage. External locations point at credentials; tables and volumes never hold secrets.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external",
    domainCodes: [1, 7],
  },
  {
    slug: "lineage",
    term: "lineage",
    aliases: ["data lineage"],
    glossPt:
      "Grafo de origem→destino capturado AUTOMATICAMENTE pelo Unity Catalog para cada tabela e view: quem gerou o quê, com quais consultas. A base de análise de impacto e de confiança em governança.",
    glossEn:
      "Source→target graph captured AUTOMATICALLY by Unity Catalog for every table and view: what produced what, through which queries. The backbone of impact analysis and governance trust.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    domainCodes: [1, 7],
  },
  {
    slug: "system-tables",
    term: "system tables",
    glossPt:
      "Conjunto de tabelas administrativas no schema system do Unity Catalog: uso de compute, auditoria, lineage e faturamento. A análise da própria plataforma via SQL.",
    glossEn:
      "The set of administrative tables under Unity Catalog's system schema: compute usage, audit, lineage and billing. Analyzing the platform itself through SQL.",
    url: "https://docs.databricks.com/aws/en/admin/system-tables",
    domainCodes: [1, 6],
  },
  {
    slug: "audit-log",
    term: "audit log",
    glossPt:
      "Registro imutável de eventos da plataforma (quem fez o quê, quando, de onde): entregue como system table consultável. É a resposta de compliance para \"quem acessou este dado\".",
    glossEn:
      "Immutable record of platform events (who did what, when, from where): delivered as a queryable system table. The compliance answer to \"who touched this data\".",
    url: "https://docs.databricks.com/aws/en/admin/system-tables/audit-logs",
    domainCodes: [1, 7],
  },
  {
    slug: "row-filter",
    term: "row filter",
    aliases: ["row-level security", "RLS"],
    glossPt:
      "Função SQL anexada a uma tabela que filtra LINHAS conforme quem consulta: o usuário vê só o subconjunto permitido, sem views duplicadas. No UC, é uma function + ALTER TABLE ... SET ROW FILTER.",
    glossEn:
      "SQL function attached to a table that filters ROWS per querying user: each one sees only the allowed subset, no duplicate views. In UC: a function + ALTER TABLE ... SET ROW FILTER.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/",
    domainCodes: [7],
  },
  {
    slug: "column-mask",
    term: "column mask",
    aliases: ["column-level masking"],
    glossPt:
      "Função SQL anexada a uma coluna que mascara VALORES conforme quem consulta (ex.: só o RH vê o salário inteiro). Mesmo mecanismo do row filter, aplicado na coluna.",
    glossEn:
      "SQL function attached to a column that masks VALUES per querying user (e.g. only HR sees full salary). Same mechanism as a row filter, applied to the column.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/",
    domainCodes: [7],
  },
  {
    slug: "grants",
    term: "grants",
    aliases: ["privileges", "GRANT", "REVOKE", "DENY"],
    glossPt:
      "Permissões declarativas sobre objetos: GRANT SELECT ON TABLE t TO engineering; REVOKE remove; DENY nega explicitamente mesmo com grants indiretos. Aplicáveis por hierarquia — do catalog ao comando.",
    glossEn:
      "Declarative permissions over objects: GRANT SELECT ON TABLE t TO engineering; REVOKE removes; DENY explicitly denies even with indirect grants. Applied down the hierarchy — from catalog to command.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    domainCodes: [7],
  },
  {
    slug: "abac",
    term: "ABAC",
    aliases: ["attribute-based access control", "tag-based access control"],
    glossPt:
      "Controle de acesso por ATRIBUTOS (tags) em vez de por objeto: uma política sobre tags de classificação substitui centenas de grants individuais. No UC, centraliza row filters e column masks.",
    glossEn:
      "Access control by ATTRIBUTES (tags) instead of by object: one policy over classification tags replaces hundreds of individual grants. In UC it centralizes row filters and column masks.",
    url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/",
    domainCodes: [7],
  },

  // ------------------------------------------------------------------
  // S2 · Data Ingestion and Loading
  // ------------------------------------------------------------------
  {
    slug: "auto-loader",
    term: "Auto Loader",
    aliases: ["cloudFiles", "readStream cloudFiles"],
    glossPt:
      "Ingestão incremental de arquivos de cloud storage para Delta: detecta novos arquivos por directory listing ou file notification, com schema inference/evolution e exactly-once via checkpoint. O padrão para dados que chegam.",
    glossEn:
      "Incremental ingestion of cloud storage files into Delta: detects new files via directory listing or file notification, with schema inference/evolution and exactly-once through checkpoints. The default for arriving data.",
    url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    domainCodes: [2],
  },
  {
    slug: "copy-into",
    term: "COPY INTO",
    glossPt:
      "Comando SQL de carregamento idempotente: copia os arquivos novos de um caminho para a tabela Delta — reexecutar não duplica. Bom para lotes pequenos e simples; Auto Loader assume quando cresce.",
    glossEn:
      "Idempotent SQL loading command: copies new files from a path into a Delta table — rerunning does not duplicate. Fine for small simple batches; Auto Loader takes over as it grows.",
    url: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    domainCodes: [2],
  },
  {
    slug: "lakeflow-connect",
    term: "Lakeflow Connect",
    aliases: ["standard connector", "managed connector"],
    glossPt:
      "Família de conectores gerenciados que ingere fontes corporativas (Salesforce, ERP, bancos) direto em tabelas Unity Catalog: sem glue code, com CDC nativo. A escolha de ingestão quando a fonte é um sistema.",
    glossEn:
      "Family of managed connectors ingesting enterprise sources (Salesforce, ERP, databases) straight into Unity Catalog tables: no glue code, native CDC. The ingestion pick when the source is a system.",
    url: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    domainCodes: [2],
  },
  {
    slug: "jdbc",
    term: "JDBC",
    aliases: ["ODBC"],
    glossPt:
      "Protocolo de conexão a bancos externos: em notebooks, spark.read.format(\"jdbc\") puxa dados relacionais para o lakehouse (ou grava de volta). Atenção ao driver e ao particionamento antes de mover volume.",
    glossEn:
      "Connection protocol for external databases: in notebooks, spark.read.format(\"jdbc\") pulls relational data into the lakehouse (or writes back). Mind the driver and partitioning before moving volume.",
    url: "https://docs.databricks.com/aws/en/connect/external-systems/jdbc",
    domainCodes: [2],
  },
  {
    slug: "structured-streaming",
    term: "Structured Streaming",
    aliases: ["source", "sink"],
    glossPt:
      "API Spark de processamento incremental: a tabela é tratada como fluxo infinito, em micro-batches sob checkpoint, com resultado idempotente. Fonte = source; destino = sink (Delta, Kafka, console…).",
    glossEn:
      "Spark's incremental processing API: a table treated as an unbounded stream, in micro-batches under a checkpoint, with idempotent results. Input = source; output = sink (Delta, Kafka, console…).",
    url: "https://docs.databricks.com/aws/en/connect/streaming/kafka/",
    domainCodes: [2],
  },
  {
    slug: "micro-batch",
    term: "micro-batch",
    glossPt:
      "Modelo de execução do Structured Streaming: o fluxo é processado em pequenos lotes discretos, disparados por tempo ou por disponibilidade — não evento a evento. Equilíbrio entre latência e throughput.",
    glossEn:
      "Structured Streaming's execution model: the stream is processed in small discrete batches fired by time or availability — not one event at a time. The balance between latency and throughput.",
    url: "https://docs.databricks.com/aws/en/data-engineering/batch-vs-streaming",
    domainCodes: [2],
  },
  {
    slug: "streaming-trigger",
    term: "trigger",
    aliases: ["Trigger.Once", "Trigger.AvailableNow", "processing time trigger"],
    glossPt:
      "Define quando um micro-batch dispara: tempo fixo (padrão), Trigger.Once (um lote e para) ou Trigger.AvailableNow (processa o disponível e encerra — o modo econômico de jobs incrementais).",
    glossEn:
      "Defines when a micro-batch fires: fixed time (default), Trigger.Once (one batch then stop) or Trigger.AvailableNow (process what is available and finish — the economical mode for incremental jobs).",
    url: "https://docs.databricks.com/aws/en/data-engineering/batch-vs-streaming",
    domainCodes: [2],
  },
  {
    slug: "checkpoint",
    term: "checkpoint",
    aliases: ["checkpoint location"],
    glossPt:
      "Estado persistido de um stream (offsets, arquivos vistos, watermarks) num caminho confiável: é ele que garante continuação exata e exactly-once após restart. Perder o checkpoint = reprocessar do zero.",
    glossEn:
      "A stream's persisted state (offsets, seen files, watermarks) in a reliable location: it is what guarantees exact continuation and exactly-once after a restart. Lose the checkpoint = reprocess from scratch.",
    url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/best-practices",
    domainCodes: [2],
  },
  {
    slug: "exactly-once",
    term: "exactly-once",
    glossPt:
      "Garantia de processamento: cada evento é aplicado uma única vez — nem perdido, nem duplicado — mesmo com falhas e restarts. No pipeline: checkpoint + escritas idempotentes em Delta.",
    glossEn:
      "Processing guarantee: every event is applied exactly once — neither lost nor duplicated — even across failures and restarts. In the pipeline: checkpoint + idempotent Delta writes.",
    url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/best-practices",
    domainCodes: [2],
  },
  {
    slug: "idempotency",
    term: "idempotency",
    glossPt:
      "Propriedade de uma operação que dá o mesmo resultado se repetida: reexecutar o job não duplica dados. COPY INTO e MERGE por chave, ou appends deduplicados por metadado de arquivo — os mecanismos habituais.",
    glossEn:
      "Property of an operation that yields the same result when repeated: rerunning the job does not duplicate data. COPY INTO and MERGE by key, or appends deduplicated by file metadata — the usual mechanisms.",
    url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/best-practices",
    domainCodes: [2],
  },
  {
    slug: "kafka",
    term: "Kafka",
    glossPt:
      "Barramento distribuído de mensagens organizado por tópicos e partições: a fonte clássica de streaming no Structured Streaming. Assine o tópico com offsets e checkpoint — não com polling.",
    glossEn:
      "Distributed message bus organized by topics and partitions: the classic streaming source for Structured Streaming. Subscribe to a topic with offsets and checkpointing — not with polling.",
    url: "https://docs.databricks.com/aws/en/connect/streaming/kafka/",
    domainCodes: [2],
  },
  {
    slug: "event-time",
    term: "event time",
    aliases: ["late data"],
    glossPt:
      "O instante em que o evento ACONTECEU (campo do dado), não quando chegou. Dados atrasados (late data) chegam depois do próprio event time — janela e watermark decidem se ainda contam.",
    glossEn:
      "When the event actually HAPPENED (a field in the data), not when it arrived. Late data arrives after its own event time — windowing and watermarking decide whether it still counts.",
    url: "https://docs.databricks.com/aws/en/connect/streaming/kafka/",
    domainCodes: [2],
  },
  {
    slug: "watermark",
    term: "watermark",
    glossPt:
      "Limite móvel de atraso tolerado: o stream declara \"aceito dados até X atrás do progresso\" e as janelas fecham definitivamente quando a água passa. Sem watermark, janelas nunca fecham e o estado cresce sem fim.",
    glossEn:
      "Moving threshold of tolerated lateness: the stream declares \"I accept data up to X behind progress\" and windows close for good once the water passes. Without a watermark, windows never close and state grows forever.",
    url: "https://docs.databricks.com/aws/en/connect/streaming/kafka/",
    domainCodes: [2],
  },

  // ------------------------------------------------------------------
  // S3 · Data Transformation and Modeling
  // ------------------------------------------------------------------
  {
    slug: "lakeflow",
    term: "Lakeflow",
    glossPt:
      "O guarda-chuva de engenharia de dados: Lakeflow Jobs (orquestração), Lakeflow Connect (ingestão) e Lakeflow Declarative Pipelines (transformação declarativa). Antes espalhado em DLT, Workflows e ingestão.",
    glossEn:
      "The data engineering umbrella: Lakeflow Jobs (orchestration), Lakeflow Connect (ingestion) and Lakeflow Declarative Pipelines (declarative transformation). Previously spread across DLT, Workflows and ingestion.",
    url: "https://docs.databricks.com/aws/en/jobs/",
    domainCodes: [2, 3, 4],
  },
  {
    slug: "dlt",
    term: "DLT",
    aliases: ["Lakeflow Declarative Pipelines", "Delta Live Tables"],
    glossPt:
      "Pipelines declarativos: você declara tabelas como fluxos (bronze/silver/gold) com expectativas de qualidade, e o runtime resolve orquestração, infra e reprocessamento. Antigo Delta Live Tables.",
    glossEn:
      "Declarative pipelines: you declare tables as flows (bronze/silver/gold) with data-quality expectations and the runtime handles orchestration, infra and reprocessing. Formerly Delta Live Tables.",
    url: "https://docs.databricks.com/aws/en/ldp/cdc",
    domainCodes: [3],
  },
  {
    slug: "expectation",
    term: "expectation",
    aliases: ["expect", "data quality expectation"],
    glossPt:
      "Regra declarativa de qualidade num pipeline: EXPECT (coluna IS NOT NULL) marca ou retém linhas inválidas por tabela. Vigora DURANTE o processamento — qualidade como código, não como job depois.",
    glossEn:
      "Declarative quality rule in a pipeline: EXPECT (col IS NOT NULL) flags or holds invalid rows per table. Enforced DURING processing — quality as code, not as an after-the-fact job.",
    url: "https://docs.databricks.com/aws/en/ldp/cdc",
    domainCodes: [3],
  },
  {
    slug: "quarantine",
    term: "quarantine",
    glossPt:
      "Padrão de pipelines: linhas que violam expectativas vão para uma tabela de quarentena em vez de sumir ou quebrar o fluxo — revise, corrija e reponha.",
    glossEn:
      "Pipeline pattern: rows violating expectations land in a quarantine table instead of vanishing or breaking the flow — review, fix and reinsert.",
    url: "https://docs.databricks.com/aws/en/ldp/cdc",
    domainCodes: [3],
  },
  {
    slug: "medallion",
    term: "medallion architecture",
    glossPt:
      "Arquitetura em camadas do lakehouse: bronze (dado cru, como chegou), silver (limpo, conformado) e gold (agregado, pronto para consumo). Refinamento progressivo — cada camada serve a próxima.",
    glossEn:
      "The lakehouse layering architecture: bronze (raw data as it landed), silver (cleaned, conformed) and gold (aggregated, consumption-ready). Progressive refinement — each layer feeds the next.",
    url: "https://docs.databricks.com/aws/en/lakehouse/medallion",
    domainCodes: [3],
  },
  {
    slug: "bronze-silver-gold",
    term: "bronze · silver · gold",
    glossPt:
      "As três camadas da medallion: bronze preserva o original (histórico auditável), silver padroniza e deduplica, gold agrega para BI/ML. A pergunta clássica do exame: \"em qual camada isso vive?\".",
    glossEn:
      "The three medallion layers: bronze preserves the original (auditable history), silver standardizes and deduplicates, gold aggregates for BI/ML. The classic exam question: \"which layer does this live in?\".",
    url: "https://docs.databricks.com/aws/en/lakehouse/medallion",
    domainCodes: [3],
  },
  {
    slug: "lakehouse",
    term: "lakehouse",
    glossPt:
      "Arquitetura que junta o storage barato do data lake com o ACID e a governança do warehouse: Parquet + Delta Lake no fundo, SQL/BI/ML em cima. A premissa de toda a plataforma.",
    glossEn:
      "Architecture combining cheap data-lake storage with warehouse ACID and governance: Parquet + Delta Lake underneath, SQL/BI/ML on top. The premise of the whole platform.",
    url: "https://docs.databricks.com/aws/en/introduction",
    domainCodes: [1, 3],
  },
  {
    slug: "delta-lake",
    term: "Delta Lake",
    aliases: ["Delta", "Delta table"],
    glossPt:
      "Camada de tabelas ACID sobre Parquet: um log transacional (_delta_log) registra cada versão — time travel, MERGE, schema evolution e VACUUM vêm daí. O coração do lakehouse.",
    glossEn:
      "ACID table layer over Parquet: a transaction log (_delta_log) records every version — time travel, MERGE, schema evolution and VACUUM all come from it. The lakehouse's heart.",
    url: "https://docs.databricks.com/aws/en/delta/",
    domainCodes: [1, 3],
  },
  {
    slug: "parquet",
    term: "Parquet",
    glossPt:
      "Formato colunar aberto de arquivos: compressão forte e leitura apenas das colunas necessárias. Os arquivos de uma tabela Delta SÃO Parquet — o _delta_log é o que acrescenta transações.",
    glossEn:
      "Open columnar file format: strong compression and reading only the columns you need. A Delta table's files ARE Parquet — the _delta_log is what adds transactions.",
    url: "https://docs.databricks.com/aws/en/delta/",
    domainCodes: [3],
  },
  {
    slug: "optimize",
    term: "OPTIMIZE",
    glossPt:
      "Comando que compacta arquivos pequenos em maiores (bin-packing) e reorganiza os dados pelo clustering: leituras mais rápidas, menos arquivos abertos. Manutenção padrão de tabelas ativas.",
    glossEn:
      "Command that compacts small files into larger ones (bin-packing) and reorganizes data by clustering: faster reads, fewer open files. Standard maintenance for active tables.",
    url: "https://docs.databricks.com/aws/en/delta/best-practices",
    domainCodes: [3, 6],
  },
  {
    slug: "vacuum",
    term: "VACUUM",
    glossPt:
      "Remove arquivos órfãos (referenciados só por versões antigas) e libera storage: o padrão retém 7 dias — reduzir exige habilitar o check de retenção. Depois do VACUUM, o time travel antigo morre.",
    glossEn:
      "Removes orphaned files (referenced only by old versions) and reclaims storage: the default retention is 7 days — going lower requires enabling the retention check. After VACUUM, old time travel is gone.",
    url: "https://docs.databricks.com/aws/en/delta/best-practices",
    domainCodes: [3, 6],
  },
  {
    slug: "z-order",
    term: "Z-order",
    aliases: ["ZORDER BY", "Z-ordering"],
    glossPt:
      "Layout multidimensional (curva Z) que co-localiza linhas pelas colunas escolhidas: data skipping corta arquivos inteiros nos filtros. Legado — em tabelas novas, prefira liquid clustering.",
    glossEn:
      "Multidimensional (Z-curve) layout co-locating rows by chosen columns: data skipping skips whole files on filters. Legacy — prefer liquid clustering on new tables.",
    url: "https://docs.databricks.com/aws/en/tables/clustering",
    domainCodes: [3, 6],
  },
  {
    slug: "liquid-clustering",
    term: "liquid clustering",
    aliases: ["CLUSTER BY"],
    glossPt:
      "Clusterização que substitui partição e Z-order: escreva CLUSTER BY (colunas) e o Delta reorganiza os dados em background, sem reescrever a tabela. Flexível — troca de colunas sem rebuild.",
    glossEn:
      "Clustering replacement for partitioning and Z-order: write CLUSTER BY (cols) and Delta reorganizes data in the background without rewriting the table. Flexible — change columns without a rebuild.",
    url: "https://docs.databricks.com/aws/en/tables/clustering",
    domainCodes: [3, 6],
  },
  {
    slug: "time-travel",
    term: "time travel",
    aliases: ["VERSION AS OF", "TIMESTAMP AS OF", "snapshot"],
    glossPt:
      "Consultar versões anteriores de uma tabela Delta: SELECT ... VERSION AS OF 7 ou TIMESTAMP AS OF. Auditoria, debugging e UNDO derivam daí — cada snapshot é um estado consistente.",
    glossEn:
      "Querying previous Delta table versions: SELECT ... VERSION AS OF 7 or TIMESTAMP AS OF. Audit, debugging and UNDO derive from it — each snapshot is a consistent state.",
    url: "https://docs.databricks.com/aws/en/delta/",
    domainCodes: [3],
  },
  {
    slug: "clone",
    term: "clone",
    aliases: ["SHALLOW CLONE", "DEEP CLONE"],
    glossPt:
      "Cópia de tabela Delta: SHALLOW copia só a definição (aponta para os mesmos arquivos — rápido, zero storage extra); DEEP copia os dados. Ideal para ambientes de teste e experimentos isolados.",
    glossEn:
      "Delta table copy: SHALLOW copies just the definition (points at the same files — fast, zero extra storage); DEEP copies the data. Ideal for test environments and isolated experiments.",
    url: "https://docs.databricks.com/aws/en/delta/",
    domainCodes: [3, 5],
  },
  {
    slug: "schema-evolution",
    term: "schema evolution",
    aliases: ["mergeSchema"],
    glossPt:
      "A tabela absorve colunas novas do dado que chega (Auto Loader com mergeSchema=true, ou MERGE com schema evolution) sem recriar nada. O contrário do enforcement, que rejeita o divergente.",
    glossEn:
      "The table absorbs new columns from arriving data (Auto Loader with mergeSchema=true, or MERGE with schema evolution) with no rebuild. The counterpart of enforcement, which rejects divergence.",
    url: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    domainCodes: [2, 3],
  },
  {
    slug: "type-widening",
    term: "type widening",
    glossPt:
      "Evolução de TIPO sem rewrite: int → long — o Delta amplia o tipo de uma coluna existente quando o dado cresce (habilitado por table property). Evita recriar a tabela inteira.",
    glossEn:
      "TYPE evolution without rewrite: int → long — Delta widens an existing column's type as data grows (enabled via table property). Avoids rebuilding the whole table.",
    url: "https://docs.databricks.com/aws/en/delta/",
    domainCodes: [3],
  },
  {
    slug: "change-data-feed",
    term: "change data feed",
    aliases: ["CDF"],
    glossPt:
      "A tabela Delta publica as MUDANÇAS (inserts, updates, deletes) como linhas marcadas: consumidores leem só o incremental desde a última versão. Sincroniza downstream sem reprocessar tudo.",
    glossEn:
      "The Delta table publishes its CHANGES (inserts, updates, deletes) as marked rows: consumers read just the incremental changes since their last version. Sync downstream without reprocessing everything.",
    url: "https://docs.databricks.com/aws/en/tables/features/change-data-feed",
    domainCodes: [3],
  },
  {
    slug: "scd",
    term: "SCD",
    aliases: ["slowly changing dimension", "SCD type 1", "SCD type 2"],
    glossPt:
      "Dimensões que mudam devagar: Type 1 SOBRESCREVE (sem histórico); Type 2 VERSIONA (linha nova + vigência de/para) — MERGE é o instrumento padrão para implementar ambas em Delta.",
    glossEn:
      "Dimensions that change slowly: Type 1 OVERWRITES (no history); Type 2 VERSIONS (new row + valid-from/to) — MERGE is the standard instrument to implement both on Delta.",
    url: "https://docs.databricks.com/aws/en/delta/merge",
    domainCodes: [3],
  },
  {
    slug: "merge",
    term: "MERGE",
    aliases: ["upsert", "MERGE INTO"],
    glossPt:
      "UPSERT de tabela: junta por chave de correspondência e decide INSERT/UPDATE/DELETE por ramo. O canivete de deduplicação, SCD e sincronização incremental — o comando mais importante do arsenal Delta.",
    glossEn:
      "Table UPSERT: joins on a match key and decides INSERT/UPDATE/DELETE per branch. The workhorse of dedup, SCD and incremental sync — the most important command in the Delta toolbox.",
    url: "https://docs.databricks.com/aws/en/delta/merge",
    domainCodes: [3],
  },
  {
    slug: "generated-column",
    term: "generated column",
    aliases: ["GENERATED ALWAYS AS"],
    glossPt:
      "Coluna calculada na escrita (GENERATED ALWAYS AS (expr)): o Delta calcula e otimiza o layout por ela — data derivada de timestamp é o caso clássico. Sem custo de leitura, sem divergência.",
    glossEn:
      "Column computed at write time (GENERATED ALWAYS AS (expr)): Delta computes it and optimizes layout around it — date derived from timestamp is the classic case. No read cost, no drift.",
    url: "https://docs.databricks.com/aws/en/delta/best-practices",
    domainCodes: [3],
  },
  {
    slug: "partition",
    term: "partition",
    aliases: ["partitioning", "partition pruning", "Hive-style partitioning"],
    glossPt:
      "Física de tabela por diretórios de coluna (PARTITION BY (data)): leituras pulam partições inteiras (pruning). Dimensões demais = arquivos minúsculos — em tabelas novas, liquid clustering substitui.",
    glossEn:
      "Table physics by column directories (PARTITION BY (date)): reads skip whole partitions (pruning). Too many dimensions = tiny files — liquid clustering replaces it on new tables.",
    url: "https://docs.databricks.com/aws/en/tables/clustering",
    domainCodes: [3, 6],
  },
  {
    slug: "shuffle",
    term: "shuffle",
    aliases: ["spark.sql.shuffle.partitions", "exchange"],
    glossPt:
      "Reorganização de dados entre executores (joins, groupBy): tudo trafega pela rede e define o número de tarefas da etapa. O parâmetro spark.sql.shuffle.partitions (padrão 200) é o primeiro ajuste de tuning.",
    glossEn:
      "Data reorganization across executors (joins, groupBy): everything travels over the network and sets the stage's task count. spark.sql.shuffle.partitions (default 200) is the first tuning knob.",
    url: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/",
    domainCodes: [3, 6],
  },
  {
    slug: "broadcast-join",
    term: "broadcast join",
    glossPt:
      "Join que envia a tabela PEQUENA inteira para cada executor (sem shuffle da grande): automático abaixo do threshold (autoBroadcastJoinThreshold) ou forçado com broadcast(df). A cura clássica do shuffle pesado.",
    glossEn:
      "Join that ships the SMALL table whole to every executor (no shuffle of the big one): automatic under the threshold (autoBroadcastJoinThreshold) or forced with broadcast(df). The classic cure for heavy shuffle.",
    url: "https://docs.databricks.com/aws/en/optimizations/aqe",
    domainCodes: [3],
  },
  {
    slug: "data-skew",
    term: "data skew",
    glossPt:
      "Chaves desiguais: uma task do join/groupBy concentra a maioria das linhas e vira o gargalo (stage longa no Spark UI, as demais terminam cedo). Salting e reparticionamento são as saídas.",
    glossEn:
      "Unequal keys: one join/groupBy task concentrates most rows and becomes the bottleneck (long stage in the Spark UI, peers finish early). Salting and repartitioning are the way out.",
    url: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage",
    domainCodes: [3, 6],
  },

  // ------------------------------------------------------------------
  // S4 · Working with Lakeflow Jobs
  // ------------------------------------------------------------------
  {
    slug: "job",
    term: "job",
    aliases: ["Lakeflow Job", "workflow"],
    glossPt:
      "Unidade de orquestração: grafo DAG de tarefas com agendamento, retries, notificações e histórico de execuções. \"Workflow\" é o conceito; o job é o objeto que o materializa no Lakeflow Jobs.",
    glossEn:
      "The orchestration unit: a DAG of tasks with scheduling, retries, notifications and run history. \"Workflow\" is the concept; the job is the object that materializes it in Lakeflow Jobs.",
    url: "https://docs.databricks.com/aws/en/jobs/",
    domainCodes: [4],
  },
  {
    slug: "task",
    term: "task",
    glossPt:
      "Um nó do grafo do job: notebook, SQL, pipeline, dashboard ou outra etapa, com dependências (upstream/downstream) e parâmetros — a granularidade de retries e de reparos.",
    glossEn:
      "One node in the job's graph: a notebook, SQL query, pipeline, dashboard or other step, with dependencies (upstream/downstream) and parameters — the granularity of retries and repairs.",
    url: "https://docs.databricks.com/aws/en/jobs/configure-task",
    domainCodes: [4],
  },
  {
    slug: "job-trigger",
    term: "job trigger",
    glossPt:
      "O que dispara o job: agenda cron (scheduled), chegada de arquivo (file arrival — dado novo na origem) ou atualização de tabela (table update — dado pronto a jusante). Tempo vs. dado: escolha pelo pipeline.",
    glossEn:
      "What fires the job: a cron schedule (scheduled), a file arriving (file arrival — new data at the source) or a table updating (table update — data ready downstream). Time vs. data: pick per pipeline.",
    url: "https://docs.databricks.com/aws/en/jobs/triggers",
    domainCodes: [4],
  },
  {
    slug: "retries-backoff",
    term: "retries",
    aliases: ["retry policy", "backoff", "repair run"],
    glossPt:
      "Tentativas automáticas de tarefa falha, com atraso crescente (backoff) entre elas. Para falha além das tentativas: o repair job reexecuta A PARTIR da tarefa quebrada, sem refazer o que deu certo.",
    glossEn:
      "Automatic attempts for a failed task, with growing delay (backoff) between them. For failure beyond attempts: a job repair re-runs FROM the broken task without redoing what already succeeded.",
    url: "https://docs.databricks.com/aws/en/jobs/repair-job-failures",
    domainCodes: [4],
  },
  {
    slug: "concurrent-runs",
    term: "concurrent runs",
    glossPt:
      "Execuções paralelas do mesmo job: o padrão é 1 (a nova execução espera a atual); aumentar serve a jobs idempotentes e leituras lentas. Um job cluster novo por execução mantém o isolamento.",
    glossEn:
      "Parallel runs of the same job: the default is 1 (a new run waits for the current one); raise it for idempotent jobs and slow reads. A fresh job cluster per run keeps isolation.",
    url: "https://docs.databricks.com/aws/en/jobs/configure-job",
    domainCodes: [4],
  },

  // ------------------------------------------------------------------
  // S5 · Implementing CI/CD
  // ------------------------------------------------------------------
  {
    slug: "git-folders",
    term: "Databricks Git Folders",
    aliases: ["Repos", "Git folder"],
    glossPt:
      "Pasta do workspace espelhada a um repositório Git: branches, commits, push/pull e pull requests direto na UI. \"Repos\" é o nome antigo — a integração Git nativa para notebooks e pipelines.",
    glossEn:
      "A workspace folder mirrored to a Git repository: branches, commits, push/pull and pull requests right in the UI. \"Repos\" is the old name — the native Git integration for notebooks and pipelines.",
    url: "https://docs.databricks.com/aws/en/repos/git-folders-concepts",
    domainCodes: [5],
  },
  {
    slug: "pull-request",
    term: "pull request",
    aliases: ["PR", "code review"],
    glossPt:
      "Fluxo de revisão: um branch com mudanças é proposto para merge na principal, revisado por pares antes. No DBDEA, o fluxo Git (branch → commit → PR → review) acontece dentro dos Git Folders.",
    glossEn:
      "The review flow: a branch with changes is proposed for merge into main, peer-reviewed first. For the DBDEA, the Git flow (branch → commit → PR → review) happens inside Git Folders.",
    url: "https://docs.databricks.com/aws/en/repos/git-operations-with-repos",
    domainCodes: [5],
  },
  {
    slug: "mirror",
    term: "mirror",
    glossPt:
      "A pasta Git É um espelho do repositório remoto: pull traz o estado de lá, push devolve — o remoto continua sendo a fonte da verdade do código, nunca apenas o workspace.",
    glossEn:
      "The Git folder IS a mirror of the remote repository: pull brings its state over, push sends it back — the remote remains the source of truth for code, never just the workspace.",
    url: "https://docs.databricks.com/aws/en/repos/git-folders-concepts",
    domainCodes: [5],
  },
  {
    slug: "automation-bundle",
    term: "Automation Bundle",
    aliases: ["Databricks Asset Bundles", "DAB"],
    glossPt:
      "Empacotamento declarativo de recursos (jobs, pipelines) em YAML: um bundle, vários alvos (dev/test/prod) com variáveis e overrides. Promover código entre ambientes deixa de ser manual.",
    glossEn:
      "Declarative packaging of resources (jobs, pipelines) in YAML: one bundle, multiple targets (dev/test/prod) with variables and overrides. Promoting code across environments stops being manual.",
    url: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    domainCodes: [5],
  },
  {
    slug: "deployment-mode",
    term: "deployment mode",
    aliases: ["production mode", "staging mode", "bundle target"],
    glossPt:
      "Modo de deploy do Automation Bundle: production sobrescreve e desativa o agendamento antigo; staging cria uma cópia com sufixo, sem tocar na produção. Mesmo código, ambientes separados por alvo.",
    glossEn:
      "Automation Bundle deploy mode: production overwrites and disables the old schedule; staging creates a suffixed copy without touching prod. Same code, environments split by target.",
    url: "https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes",
    domainCodes: [5],
  },
  {
    slug: "databricks-cli",
    term: "Databricks CLI",
    glossPt:
      "Ferramenta de linha de comando para gerenciar workspaces e bundles: databricks bundle validate/deploy/run nos pipelines de CI. É assim que o CI/CD externo (GitHub Actions etc.) conversa com a Databricks.",
    glossEn:
      "Command-line tool to manage workspaces and bundles: databricks bundle validate/deploy/run inside CI pipelines. It is how external CI/CD (GitHub Actions etc.) talks to Databricks.",
    url: "https://docs.databricks.com/aws/en/dev-tools/cli",
    domainCodes: [5],
  },

  // ------------------------------------------------------------------
  // S6 · Troubleshooting, Monitoring, and Optimization
  // ------------------------------------------------------------------
  {
    slug: "query-history",
    term: "query history",
    aliases: ["slow query"],
    glossPt:
      "System table + UI com TODAS as consultas SQL do workspace: duração, usuário, warehouse, perfil e plano de execução. O ponto de partida para achar a query lenta e quantificar melhorias.",
    glossEn:
      "System table + UI with EVERY SQL query in the workspace: duration, user, warehouse, profile and execution plan. The starting point to find the slow query and quantify improvements.",
    url: "https://docs.databricks.com/aws/en/sql/user/queries/query-history",
    domainCodes: [6],
  },
  {
    slug: "query-plan",
    term: "query plan",
    aliases: ["execution plan", "query profile"],
    glossPt:
      "O grafo de operações que o motor executará (scan → join → aggregate): o query profile mostra cada nó com tempo e linhas. Ler o plano é diagnosticar onde a consulta queima tempo.",
    glossEn:
      "The graph of operations the engine will execute (scan → join → aggregate): the query profile shows each node with time and rows. Reading the plan is how you diagnose where a query burns time.",
    url: "https://docs.databricks.com/aws/en/sql/user/queries/query-profile",
    domainCodes: [6],
  },
  {
    slug: "spark-ui",
    term: "Spark UI",
    glossPt:
      "Painel de diagnóstico da execução Spark: estágios, tarefas, shuffle, memória e spill por executor. Onde data skew e gargalos de stage aparecem com números — a evidência, não o palpite.",
    glossEn:
      "Spark execution diagnostics panel: stages, tasks, shuffle, memory and spill per executor. Where data skew and stage bottlenecks show up as numbers — evidence, not guesswork.",
    url: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/",
    domainCodes: [6],
  },
  {
    slug: "driver-executor",
    term: "driver / executor",
    glossPt:
      "Papel dos nós: o DRIVER coordena (plano, distribuição, coleta) e nunca processa dados em paralelo; os EXECUTORES fazem o trabalho e morrem com o cluster. Driver pequeno = falha na coordenação, não no processamento.",
    glossEn:
      "Node roles: the DRIVER coordinates (planning, distribution, collection) and never processes data in parallel; EXECUTORS do the work and die with the cluster. A small driver = coordination failure, not processing failure.",
    url: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/",
    domainCodes: [6],
  },
  {
    slug: "spark-session",
    term: "Spark session",
    glossPt:
      "A porta de entrada do Spark: todo código PySpark roda sob uma SparkSession (gerenciada pelo Databricks) que conecta driver, executores e catálogo. \"spark\" é a variável viva no notebook.",
    glossEn:
      "Spark's entry point: all PySpark code runs under a SparkSession (managed by Databricks) connecting driver, executors and catalog. \"spark\" is the live variable in the notebook.",
    url: "https://docs.databricks.com/aws/en/pyspark/reference",
    domainCodes: [6],
  },
  {
    slug: "oom-spill",
    term: "out of memory / spill",
    aliases: ["OOM", "disk spill", "spilling"],
    glossPt:
      "Sintomas de memória curta: OOM mata a tarefa; SPILL despeja em disco o que não cabe em RAM (visível no Spark UI) — lento, mas vivo. Ajuste partições/shuffle ou aumente memória, conforme o diagnóstico.",
    glossEn:
      "Short-memory symptoms: OOM kills the task; SPILL dumps to disk what does not fit in RAM (visible in the Spark UI) — slow but alive. Tune partitions/shuffle or add memory, per the diagnosis.",
    url: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage",
    domainCodes: [6],
  },
  {
    slug: "cache",
    term: "cache",
    aliases: ["disk cache", "Spark cache", "df.cache()"],
    glossPt:
      "Duas coisas distintas: DISK cache (automático — blocos Delta no SSD do cluster, invisível no código) e CACHE de DataFrame (explícito — df.cache(), em memória). O query insights mostra a taxa de acerto do disk cache.",
    glossEn:
      "Two different things: DISK cache (automatic — Delta blocks on the cluster's SSD, invisible in code) and DataFrame CACHE (explicit — df.cache(), in memory). Query insights shows the disk cache hit ratio.",
    url: "https://docs.databricks.com/aws/en/sql/user/queries/performance-insights",
    domainCodes: [6],
  },
  {
    slug: "predictive-optimization",
    term: "predictive optimization",
    glossPt:
      "O Unity Catalog agenda OPTIMIZE e VACUUM sozinho nas tabelas gerenciadas, conforme o uso observado: manutenção sem cron, sem job seu. Verifique antes de criar jobs de manutenção manuais.",
    glossEn:
      "Unity Catalog schedules OPTIMIZE and VACUUM on its own for managed tables based on observed usage: maintenance without cron, without your job. Check it before creating manual maintenance jobs.",
    url: "https://docs.databricks.com/aws/en/optimizations/predictive-optimization",
    domainCodes: [6],
  },
];

export const GLOSSARY_COUNT = GLOSSARY.length;

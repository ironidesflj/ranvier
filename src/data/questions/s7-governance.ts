import type { SeedQuestion } from "./types";

/**
 * Section 7 — Governance and Security (15%)
 * Target: 17 questions (S7-001 .. S7-017).
 */
export const s7Questions: SeedQuestion[] = [
  {
    key: "S7-001",
    domainCode: 7,
    stem: `A data engineer is decommissioning two production tables governed by Unity Catalog. Both tables currently hold live data, and the engineer runs the following statements, which complete successfully:

\`\`\`sql
DROP TABLE main.sales.orders;       -- originally created with CREATE TABLE main.sales.orders (...);
DROP TABLE main.sales.orders_hist;  -- originally created with CREATE TABLE ... LOCATION 's3://acme-raw/orders_hist';
\`\`\`

The cloud storage team asks what will happen to the underlying data files once the DROP statements complete. Which answer is correct?`,
    options: [
      "The files for orders are deleted from Unity Catalog managed storage; the files for orders_hist remain in place because it is an external table.",
      "The files for both tables are deleted, because DROP TABLE in Unity Catalog always removes the underlying data, even for tables created with a LOCATION clause.",
      "The files for both tables remain in place, because DROP TABLE in Unity Catalog removes only table metadata and never deletes cloud files.",
      "The files for orders remain in place, while the files for orders_hist are deleted from the external location by Unity Catalog.",
    ],
    correctIndex: 0,
    explanationEn: `orders was created without a LOCATION clause, so it is a managed table: Unity Catalog stores its files in the managed storage location of the containing schema, catalog, or metastore, and dropping the table deletes the underlying data files after a short retention period. orders_hist was created with LOCATION, making it an external table: dropping it removes only the table metadata from Unity Catalog, and the data files remain in place — the storage team must delete them directly. The distractors either apply one behavior to both table types or invert the two, which is the classic managed-versus-external confusion.`,
    explanationPt: `A tabela orders foi criada sem a cláusula LOCATION, portanto é gerenciada: o Unity Catalog armazena seus arquivos no managed storage location do schema, catálogo ou metastore correspondente e, ao dropar a tabela, exclui os arquivos de dados após um curto período de retenção. Já orders_hist foi criada com LOCATION — uma tabela externa: o DROP remove apenas os metadados no Unity Catalog e os arquivos permanecem no storage; a equipe de storage precisa excluí-los manualmente. Os distratores generalizam um comportamento para os dois tipos de tabela ou invertem os papéis — a confusão clássica entre tabelas gerenciadas e externas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external",
    referenceTitle: "Managed versus external assets in Unity Catalog — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-002",
    domainCode: 7,
    stem: `An upstream system continuously writes Delta files to s3://acme-raw/legacy/events/, and that system must keep full control of the data's lifecycle. The data team wants to query this existing data with SQL in Unity Catalog without copying or moving it.

Which statement registers the existing files as a Unity Catalog external table?`,
    options: [
      "CREATE TABLE main.legacy.events AS SELECT * FROM read_files('s3://acme-raw/legacy/events');",
      "CREATE EXTERNAL TABLE main.legacy.events USING DELTA LOCATION 's3://acme-raw/legacy/events';",
      "CREATE TABLE main.legacy.events MANAGED LOCATION 's3://acme-raw/legacy/events';",
      "COPY INTO main.legacy.events FROM 's3://acme-raw/legacy/events' FORMAT AS DELTA;",
    ],
    correctIndex: 1,
    explanationEn: `CREATE EXTERNAL TABLE ... USING DELTA LOCATION registers the existing files as an external table: the path must sit under an external location registered in Unity Catalog, the data is not copied, and the upstream system keeps control of the file lifecycle — a later DROP removes only metadata. CREATE TABLE ... AS SELECT materializes a copy of the data into a new managed table in Unity Catalog managed storage, violating the no-copy requirement. There is no MANAGED LOCATION clause in Databricks SQL. COPY INTO loads files into an already existing table; it does not register a storage path as a table.`,
    explanationPt: `O CREATE EXTERNAL TABLE ... USING DELTA LOCATION registra os arquivos existentes como uma tabela externa: o caminho precisa estar coberto por um external location registrado no Unity Catalog, nada é copiado e o sistema de origem mantém o controle do ciclo de vida dos arquivos — um DROP futuro remove apenas os metadados. Já o CREATE TABLE ... AS SELECT materializa uma cópia dos dados em uma nova tabela gerenciada no managed storage do Unity Catalog, violando o requisito de não copiar. Não existe cláusula MANAGED LOCATION no Databricks SQL. O COPY INTO carrega arquivos para uma tabela já existente; ele não registra um caminho de storage como tabela.`,
    referenceUrl: "https://docs.databricks.com/aws/en/tables/external",
    referenceTitle: "Work with external tables — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-003",
    domainCode: 7,
    stem: `A senior engineer creates the following table in a schema that has a managed storage location configured:

\`\`\`sql
CREATE TABLE main.fin.transactions (
  txn_id BIGINT,
  account_id STRING,
  amount DECIMAL(12,2)
);
\`\`\`

During a compliance review, the auditor asks where this table's data files physically reside and who controls their lifecycle. Which answer is accurate?`,
    options: [
      "They are stored in storage operated by Databricks outside the company's cloud account, because Unity Catalog takes ownership of managed tables' data.",
      "They are stored in a path chosen by the table creator inside any cloud bucket the creator can access, because CREATE TABLE always writes to a creator-selected location.",
      "They are stored in the managed storage location of the containing schema (or catalog/metastore), in the company's cloud account; Unity Catalog controls the file lifecycle.",
      "They are stored in the workspace's DBFS root directory, which is managed by workspace administrators and remains the default target for tables created without a LOCATION clause.",
    ],
    correctIndex: 2,
    explanationEn: `Because the statement has no LOCATION clause, the table is managed: Unity Catalog stores the files in the managed storage location configured on the containing schema, falling back to the catalog or metastore level. Unity Catalog decides the exact path, handles file organization and optimization, and deletes the files when the table is dropped — but the data always stays inside the company's own cloud account; Databricks never takes ownership of it. Creator-chosen paths define external tables, not managed ones. The DBFS root belongs to legacy workspace storage, not Unity Catalog managed storage.`,
    explanationPt: `Como o comando não tem cláusula LOCATION, a tabela é gerenciada: o Unity Catalog armazena os arquivos no managed storage location configurado no schema que a contém (ou, em cascata, no catálogo/metastore). O Unity Catalog define o caminho exato, cuida da organização e da otimização dos arquivos e os exclui quando a tabela é dropada — mas os dados sempre permanecem na conta de cloud da própria empresa; a Databricks nunca assume a propriedade deles. Caminhos escolhidos pelo criador caracterizam tabelas externas. O DBFS root pertence ao storage legado do workspace, não ao managed storage do Unity Catalog.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external",
    referenceTitle: "Managed versus external assets in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-004",
    domainCode: 7,
    stem: `main.sales.orders_hist is a Unity Catalog external Delta table whose files live at s3://acme-raw/orders_hist. The team now wants Unity Catalog to manage the table's storage and lifecycle, keeping the same table name, permissions, and history, with minimal reader and writer downtime. The team owns the table and uses Serverless compute.

Which command should they run?`,
    options: [
      "ALTER TABLE main.sales.orders_hist SET MANAGED MOVE;",
      "CREATE TABLE main.sales.orders_managed AS SELECT * FROM main.sales.orders_hist; followed by DROP TABLE main.sales.orders_hist;",
      "ALTER TABLE main.sales.orders_hist UNSET MANAGED;",
      "ALTER TABLE main.sales.orders_hist SET MANAGED; — requires DBR 17.3 LTS+ or Serverless.",
    ],
    correctIndex: 3,
    explanationEn: `ALTER TABLE ... SET MANAGED is the recommended way to convert an external Delta table into a Unity Catalog managed table (it requires table ownership and Databricks Runtime 17.3 LTS+ or Serverless). It copies the data and transaction log into the managed storage location, retains the table's name, settings, permissions, views, and history, and minimizes reader and writer downtime — which is why Databricks recommends it over CTAS. MOVE and COPY are valid only for foreign tables; here the command fails with DELTA_ALTER_TABLE_SET_MANAGED_UNSUPPORTED_COPY_MOVE_SYNTAX. UNSET MANAGED is the rollback command that converts back to external within 14 days.`,
    explanationPt: `O ALTER TABLE ... SET MANAGED é a forma recomendada de converter uma tabela Delta externa em gerenciada pelo Unity Catalog (exige ownership da tabela e Databricks Runtime 17.3 LTS+ ou Serverless). O comando copia os dados e o log de transações para o managed storage location, preserva nome, configurações, permissões, views e histórico da tabela e minimiza o downtime de leitores e escritores — por isso a Databricks o recomenda em vez de CTAS. MOVE e COPY só valem para tabelas foreign; aqui o comando falha com DELTA_ALTER_TABLE_SET_MANAGED_UNSUPPORTED_COPY_MOVE_SYNTAX. Já o UNSET MANAGED é o rollback, que devolve a tabela para externa em até 14 dias.`,
    referenceUrl: "https://docs.databricks.com/aws/en/tables/convert-to-managed",
    referenceTitle: "Convert external or foreign Delta Lake tables to Unity Catalog managed tables — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-005",
    domainCode: 7,
    stem: `A data team is building a new curated table that summarizes several silver tables, computed with a single query. They want Unity Catalog to own the table's storage location, optimization, and deletion — no external system will ever write to these files.

Which single statement creates the table with the intended ownership of the data lifecycle?`,
    options: [
      "CREATE TABLE gold.daily_summary LOCATION 's3://acme-gold/summary' AS SELECT ... FROM silver.orders;",
      "CREATE TABLE gold.daily_summary AS SELECT ... FROM silver.orders; — a managed CTAS.",
      "CREATE VIEW gold.daily_summary AS SELECT ... FROM silver.orders;",
      "df.write.option(\"path\", \"s3://acme-gold/summary\").saveAsTable(\"gold.daily_summary\")",
    ],
    correctIndex: 1,
    explanationEn: `Omitting LOCATION makes the table managed: Unity Catalog chooses the path inside the managed storage location of the target schema or catalog, and takes care of layout, optimization, and deletion when the table is dropped — exactly the lifecycle ownership the team wants. Adding a LOCATION clause to the CTAS turns it into an external table, leaving the file lifecycle with the team. The path option in saveAsTable has the same external-table effect. A view is just a saved query over other tables: it stores no data and cannot serve as the curated summary table.`,
    explanationPt: `Omitir a cláusula LOCATION torna a tabela gerenciada: o Unity Catalog escolhe o caminho dentro do managed storage location do schema ou catálogo de destino e cuida do layout, da otimização e da exclusão dos arquivos quando a tabela é dropada — exatamente o controle de ciclo de vida que o time quer. Incluir LOCATION no CTAS transforma-a em tabela externa, deixando o ciclo de vida dos arquivos com o time. A opção path no saveAsTable tem o mesmo efeito de tabela externa. Já uma view é apenas uma consulta salva sobre outras tabelas: não armazena dados e não pode servir como a tabela resumida.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/managed-versus-external",
    referenceTitle: "Managed versus external assets in Unity Catalog — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-006",
    domainCode: 7,
    stem: `A lakehouse on Unity Catalog contains the catalog main with several schemas. The group data_analysts already has these grants:

\`\`\`sql
GRANT USE CATALOG ON CATALOG main TO data_analysts;
GRANT USE SCHEMA ON SCHEMA main.sales TO data_analysts;
\`\`\`

An ingestion job creates new tables in main.sales every week. The team wants analysts to read every current and future table in main.sales — and only in that schema — without maintaining grants each week. Which additional statement achieves this?`,
    options: [
      "GRANT SELECT ON SCHEMA main.sales TO data_analysts;",
      "GRANT SELECT ON CATALOG main TO data_analysts;",
      "GRANT SELECT ON METASTORE TO data_analysts;",
      "GRANT SELECT ON TABLE main.sales.* TO data_analysts;",
    ],
    correctIndex: 0,
    explanationEn: `Unity Catalog privileges inherit downward: a privilege granted on a container object (catalog or schema) applies to all current and future child objects. Granting SELECT on the schema main.sales therefore covers every table the weekly ingestion job creates — one statement, no weekly maintenance, with scope limited to that schema. Granting SELECT on the whole catalog main would also work through inheritance but violates least privilege by exposing every schema in the catalog. Grants on the metastore do not inherit to data objects; they govern metastore-level operations such as CREATE CATALOG. Wildcard table grants are not part of the syntax.`,
    explanationPt: `Os privilégios no Unity Catalog são herdados de cima para baixo: um privilégio concedido a um objeto contêiner (catálogo ou schema) aplica-se a todos os objetos filhos, atuais e futuros. Conceder SELECT no schema main.sales cobre, portanto, toda tabela que o job semanal de ingestão criar — uma única instrução, sem manutenção semanal, com escopo limitado a esse schema. Conceder SELECT no catálogo main inteiro também funcionaria por herança, mas viola o princípio do menor privilégio ao expor todos os schemas. Grants no metastore não são herdados por objetos de dados — controlam operações do próprio metastore, como CREATE CATALOG. E grants com curinga em tabelas não fazem parte da sintaxe.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-007",
    domainCode: 7,
    stem: `An analyst who belongs to the group finance_analysts runs:

\`\`\`sql
SELECT * FROM analytics.finance.invoices;
\`\`\`

The query fails with a permissions error, even though the group's grants include:

\`\`\`sql
GRANT SELECT ON TABLE analytics.finance.invoices TO finance_analysts;
\`\`\`

The group has SELECT on the table, yet the read still fails. Which additional privileges does the group need?`,
    options: [
      "MODIFY on analytics.finance.invoices, because reads also require the write privilege on Unity Catalog tables, without which SELECT grants stay inactive.",
      "BROWSE on catalog analytics, which lets principals read data from all objects in the catalog, without needing USE SCHEMA on each schema.",
      "USE CATALOG on analytics and USE SCHEMA on analytics.finance — usage privileges on both parent containers are required in addition to SELECT.",
      "Ownership of analytics.finance.invoices must be transferred to finance_analysts before any member can query it, since only owners may read table data.",
    ],
    correctIndex: 2,
    explanationEn: `Reading a table in Unity Catalog requires three privileges together: SELECT on the table, USE SCHEMA on the parent schema, and USE CATALOG on the parent catalog. Usage privileges let principals traverse the hierarchy, and having only SELECT is explicitly not sufficient to read a table. BROWSE grants metadata discovery only — seeing that objects exist and viewing their metadata — never data access. MODIFY is a write privilege, unrelated to reads. Transferring ownership would work only as massive over-provisioning, since owners automatically hold all capabilities on an object.`,
    explanationPt: `Para ler uma tabela no Unity Catalog são necessários três privilégios juntos: SELECT na tabela, USE SCHEMA no schema pai e USE CATALOG no catálogo pai. Os usage privileges permitem que os principals atravessem a hierarquia — e ter apenas o SELECT é explicitamente insuficiente para ler a tabela. O BROWSE concede apenas descoberta de metadados (ver que os objetos existem), nunca acesso aos dados. O MODIFY é privilégio de escrita, sem relação com leitura. Transferir o ownership funcionaria apenas como um over-provisioning enorme, já que owners têm automaticamente todas as capacidades sobre o objeto.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-008",
    domainCode: 7,
    stem: `A governance engineer is onboarding a new analytics team to the lakehouse. The team's group, finance_analysts, must be allowed to read rows from the table analytics.finance.invoices, and the engineer wants to apply the grant with SQL in a notebook rather than through Catalog Explorer.

Which statement uses the correct Databricks SQL syntax?`,
    options: [
      "GRANT SELECT TO finance_analysts ON TABLE analytics.finance.invoices;",
      "GRANT READ ON TABLE analytics.finance.invoices TO finance_analysts;",
      "GRANT SELECT ON TABLE analytics.finance.invoices FROM finance_analysts;",
      "GRANT SELECT ON TABLE analytics.finance.invoices TO finance_analysts;",
    ],
    correctIndex: 3,
    explanationEn: `Databricks SQL follows the pattern GRANT privilege ON securable_type name TO principal — the privilege and the object come first, and the recipient follows TO. SELECT is the read privilege for tables and views. GRANT READ is not a Unity Catalog privilege. Swapping TO before ON produces invalid syntax, and FROM is the preposition used by REVOKE, not by GRANT. Principal names that contain special characters, such as email addresses, must be wrapped in backticks; simple identifiers like finance_analysts can appear unquoted.`,
    explanationPt: `O Databricks SQL segue o padrão GRANT privilégio ON tipo_do_objeto nome TO principal — primeiro o privilégio e o objeto, depois o destinatário após o TO. SELECT é o privilégio de leitura para tabelas e views. GRANT READ não existe no Unity Catalog. Inverter o TO antes do ON gera sintaxe inválida, e FROM é a preposição usada pelo REVOKE, não pelo GRANT. Nomes de principals com caracteres especiais, como endereços de e-mail, devem vir entre crases; identificadores simples como finance_analysts podem aparecer sem aspas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-009",
    domainCode: 7,
    stem: `A platform admin runs the following statements against a Unity Catalog metastore, intending to cut off a contractor's read access:

\`\`\`sql
GRANT SELECT ON TABLE main.sales.orders TO data_analysts;
REVOKE SELECT ON TABLE main.sales.orders FROM \`contractor@acme.com\`;
\`\`\`

The user contractor@acme.com is a member of data_analysts. A few minutes after the REVOKE completes, the contractor runs SELECT COUNT(*) FROM main.sales.orders and it succeeds. Why does the contractor keep access?`,
    options: [
      "REVOKE statements only take effect after the principal's active sessions end, and the contractor has an open session, so old grants persist.",
      "The contractor's SELECT comes from the group grant; REVOKE removes only direct grants, so group-derived access is untouched.",
      "REVOKE must be executed by a metastore admin to affect principals other than the statement's author, such as members of a group.",
      "The contractor also needs USE SCHEMA on main.sales before a table-level REVOKE can apply to them, plus USE CATALOG on main.",
    ],
    correctIndex: 1,
    explanationEn: `REVOKE removes grants that were made directly to the named principal. The contractor never had a direct grant — the SELECT privilege belongs to the group data_analysts, and the contractor inherits it through membership. A REVOKE issued against the contractor therefore removes nothing; it even succeeds when the privilege was never granted directly to that principal. Access through the group remains until the group's grant is revoked, the membership is removed, or the privilege is explicitly denied. REVOKE takes effect immediately: there is no session-based delay and no special admin role beyond normal privilege-management rights.`,
    explanationPt: `O REVOKE remove grants feitos diretamente ao principal indicado. O contractor nunca teve um grant direto — o privilégio SELECT pertence ao grupo data_analysts, e o contractor o herda por ser membro. Um REVOKE emitido contra o contractor, portanto, não remove nada; ele chega a ser executado com sucesso mesmo quando o privilégio nunca foi concedido diretamente àquele principal. O acesso via grupo continua até que o grant do grupo seja revogado, que a associação seja removida ou que o privilégio seja explicitamente negado. O REVOKE vale imediatamente: não há atraso por sessão ativa nem exigência de papel especial de administrador.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-010",
    domainCode: 7,
    stem: `A contractor's engagement is being transferred to a partner organization. Today the contractor reads main.hr.compensation through membership in the hr_analysts group, which holds SELECT on that table. Security policy requires that this specific principal must never be able to read the table again — even if the contractor is later added to other groups that hold SELECT on it, now or in the future.

Which action guarantees this outcome?`,
    options: [
      "Explicitly deny SELECT on the table to the contractor: an explicit denial overrides any grant, including group-inherited access.",
      "Run REVOKE SELECT ON TABLE main.hr.compensation FROM contractor@acme.com — it removes both direct grants and access inherited through group membership.",
      "Remove the contractor from the hr_analysts group, which also blocks any future group that is later granted SELECT.",
      "Transfer ownership of main.hr.compensation to the security team and remove all existing grants, which also denies future grants to the contractor.",
    ],
    correctIndex: 0,
    explanationEn: `An explicit denial is designed for exactly this requirement: a denied privilege takes precedence over any explicit or implicit grant, so the contractor cannot read the table even while hr_analysts keeps its SELECT — and denials inherit downward through the hierarchy just like grants. REVOKE removes only direct grants; the contractor has none, so nothing changes. Removing one group membership fixes today's access, but any future group grant could re-expose the data. In current Unity Catalog, explicit denials are implemented through ABAC DENY policies, which always take precedence over grants; the classic DENY statement covers the legacy Hive metastore.`,
    explanationPt: `Uma negação explícita existe exatamente para esse requisito: um privilégio negado tem precedência sobre qualquer grant explícito ou implícito, então o contractor não consegue ler a tabela mesmo que hr_analysts mantenha o SELECT — e as negações são herdadas para baixo na hierarquia, assim como os grants. O REVOKE remove apenas grants diretos; o contractor não tem nenhum, então nada muda. Remover a associação a um grupo resolve o acesso de hoje, mas qualquer grant futuro em outro grupo poderia reexpor os dados. No Unity Catalog atual, as negações explícitas são implementadas por ABAC DENY policies, que sempre têm precedência sobre grants; o comando DENY clássico vale para o Hive metastore legado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-011",
    domainCode: 7,
    stem: `A platform team supports about 60 analysts who join and leave the company frequently, plus a scheduled ingestion pipeline that runs unattended every night. The team wants to manage Unity Catalog access with minimal maintenance while keeping a clear audit trail of who did what.

How should they assign privileges?`,
    options: [
      "Grant SELECT on the analysts' tables to each analyst's individual user account, re-running the grants whenever someone joins or leaves.",
      "Grant all privileges to a shared analytics_admin user account and have all analysts sign in with it.",
      "Grant privileges to the nightly pipeline's cluster configuration, because compute-level grants cover everyone who attaches to it.",
      "Add analysts to groups and grant privileges to the groups; run the pipeline under a service principal granted only the privileges it needs.",
    ],
    correctIndex: 3,
    explanationEn: `Unity Catalog grants privileges to three kinds of principals: users, groups, and service principals (identified by their application ID). Granting to groups is the scalable pattern: analysts join and leave through group membership managed in the account or identity provider, while SQL grants stay untouched — and every query is still audited per individual user. Service principals are the right identity for unattended automation such as the nightly pipeline, receiving only the privileges the job needs. Individual per-user grants would demand constant re-granting at that scale, a shared admin account destroys per-principal auditing, and compute-level grants do not exist in Unity Catalog.`,
    explanationPt: `O Unity Catalog concede privilégios a três tipos de principals: usuários, grupos e service principals (identificados pelo application ID). Conceder a grupos é o padrão escalável: analistas entram e saem pela associação ao grupo, gerenciada na conta ou no provedor de identidade, enquanto os grants em SQL permanecem intactos — e cada consulta continua sendo auditada por usuário individual. Service principals são a identidade certa para automações sem interação, como o pipeline noturno, recebendo apenas os privilégios de que o job precisa. Grants individuais por usuário exigiriam regrants constantes nessa escala; uma conta compartilhada destrói a auditoria por principal; e grants em nível de compute não existem no Unity Catalog.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-012",
    domainCode: 7,
    stem: `A retail company stores all of its sales transactions in main.sales.transactions, with records from every sales region. The governance team protects the table with the following row filter:

\`\`\`sql
CREATE FUNCTION main.sec.emea_filter(region STRING)
RETURN IF(is_account_group_member('sales_admins'), true, region = 'EMEA');

ALTER TABLE main.sales.transactions SET ROW FILTER main.sec.emea_filter ON (region);
\`\`\`

Members of sales_admins and analysts who are not members of the group both query main.sales.transactions. What does each user see?`,
    options: [
      "All users see all rows; the function only records which non-admin users queried the table.",
      "The query fails for users outside sales_admins, because they lack permission to evaluate the filter function.",
      "Members of sales_admins see all rows; everyone else sees only the rows where region = 'EMEA'.",
      "All users see only EMEA rows in SQL, but members of sales_admins can bypass the filter by exporting the table from Catalog Explorer.",
    ],
    correctIndex: 2,
    explanationEn: `A row filter is a SQL UDF that Unity Catalog evaluates for each row at query time: rows where the function returns TRUE are returned, and rows where it returns FALSE are excluded from every result. Because is_account_group_member() is evaluated for the querying user, the outcome varies by principal: members of sales_admins get TRUE on every row and see the whole table, while everyone else is restricted to region = 'EMEA'. Filters never raise errors for unauthorized users, and they apply to every query path — SQL, Catalog Explorer, and dashboards alike. Here the function is an admin bypass, not a logging mechanism.`,
    explanationPt: `Um row filter é uma UDF SQL que o Unity Catalog avalia para cada linha no momento da consulta: linhas em que a função retorna TRUE são devolvidas, e linhas em que retorna FALSE são excluídas de todo resultado. Como is_account_group_member() é avaliado para o usuário que executa a consulta, o resultado varia por principal: membros de sales_admins recebem TRUE em todas as linhas e veem a tabela inteira, enquanto os demais ficam restritos a region = 'EMEA'. Filtros nunca geram erro para usuários sem permissão e valem para todo caminho de consulta — SQL, Catalog Explorer e dashboards. Aqui a função é um bypass para admins, não um mecanismo de log.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/",
    referenceTitle: "Row filters and column masks — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-013",
    domainCode: 7,
    stem: `The table main.crm.customers contains the column email (STRING). Only the group pii_viewers should see real email addresses; every other user with SELECT should see ***@***.*** instead. A SQL UDF implements the logic:

\`\`\`sql
CREATE FUNCTION main.sec.mask_email(email STRING)
RETURN CASE WHEN is_account_group_member('pii_viewers')
            THEN email
            ELSE '***@***.***' END;
\`\`\`

Which statement correctly applies this function as a column mask on that column?`,
    options: [
      "ALTER TABLE main.crm.customers SET MASK main.sec.mask_email ON (email);",
      "ALTER TABLE main.crm.customers ALTER COLUMN email SET MASK main.sec.mask_email;",
      "ALTER TABLE main.crm.customers SET ROW FILTER main.sec.mask_email ON (email);",
      "ALTER TABLE main.crm.customers ALTER COLUMN email SET ROW FILTER main.sec.mask_email;",
    ],
    correctIndex: 1,
    explanationEn: `Column masks are attached with ALTER TABLE ... ALTER COLUMN column SET MASK function: the masking function takes the column's value as input and returns either the original value or a masked value of a compatible type, evaluated for the querying user — here through is_account_group_member('pii_viewers'). SET MASK without ALTER COLUMN is not valid syntax. SET ROW FILTER, with or without ALTER COLUMN, is the row-level security mechanism: it expects a boolean function that decides which rows are visible and cannot transform column values. A table can also declare the mask inline at creation time using MASK function in the column definition.`,
    explanationPt: `As column masks são anexadas com ALTER TABLE ... ALTER COLUMN coluna SET MASK função: a função de mascaramento recebe o valor da coluna como entrada e devolve o valor original ou um valor mascarado de tipo compatível, avaliado para o usuário que consulta — aqui por meio de is_account_group_member('pii_viewers'). SET MASK sem ALTER COLUMN não é sintaxe válida. Já o SET ROW FILTER, com ou sem ALTER COLUMN, é o mecanismo de segurança por linha: espera uma função booleana que decide quais linhas são visíveis e não transforma valores de coluna. A tabela também pode declarar a mask na criação, usando MASK função na definição da coluna.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/",
    referenceTitle: "Row filters and column masks — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-014",
    domainCode: 7,
    stem: `An HR database contains employee records with sensitive Social Security Numbers. The ssn column of main.hr.employees is protected as follows:

\`\`\`sql
CREATE FUNCTION main.sec.ssn_mask(ssn STRING)
RETURN CASE WHEN is_account_group_member('hr_payroll') THEN ssn
            ELSE '***-**-' || right(ssn, 4) END;

ALTER TABLE main.hr.employees ALTER COLUMN ssn SET MASK main.sec.ssn_mask;
\`\`\`

An HR analyst (member of hr_payroll) and a finance analyst (not a member) both hold SELECT on the table and run:

\`\`\`sql
SELECT name, ssn FROM main.hr.employees;
\`\`\`

What does each analyst see in the ssn column?`,
    options: [
      "Both see the full SSN values, because both principals hold SELECT on the table.",
      "Both see masked values; the raw values can only be read from the underlying files.",
      "The finance analyst's query fails, because the mask blocks users outside hr_payroll.",
      "The HR analyst sees the full SSN values; the finance analyst sees values such as ***-**-1234.",
    ],
    correctIndex: 3,
    explanationEn: `The mask function receives the raw column value as input, and its logic depends on the querying user: is_account_group_member('hr_payroll') returns true only for the HR analyst, who therefore sees the original SSN, while the finance analyst — who legitimately holds SELECT — sees the masked form such as ***-**-1234, with the last four digits preserved by the expression. Column masks apply at query time to every read of that column from any client, and they never raise errors for unauthorized users. A mask restricts visibility for principals who already have access; it neither grants nor blocks the SELECT privilege itself.`,
    explanationPt: `A função de mask recebe o valor original da coluna como entrada, e sua lógica depende do usuário que consulta: is_account_group_member('hr_payroll') retorna true apenas para o analista de RH, que portanto vê o SSN original, enquanto o analista de finanças — que legitimamente tem SELECT — vê a forma mascarada, como ***-**-1234, com os quatro últimos dígitos preservados pela expressão. As column masks são aplicadas no momento da consulta a toda leitura da coluna, em qualquer cliente, e nunca geram erro para usuários fora do grupo. A mask restringe a visibilidade de principals que já têm acesso; ela não concede nem bloqueia o próprio privilégio de SELECT.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/",
    referenceTitle: "Row filters and column masks — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-015",
    domainCode: 7,
    stem: `A governance admin wants a single policy attached to the catalog main that masks every column tagged pii = ssn for all users except the compliance_team group. Hundreds of tables live under main, and new columns are tagged every week — they must be covered without editing the policy.

In Unity Catalog ABAC, what mechanism identifies which columns the policy protects?`,
    options: [
      "Governed tags: policy conditions evaluate attributes such as pii = ssn with has_tag_value(), matching every column carrying the tag, including ones tagged later.",
      "Content inspection: Unity Catalog scans column values at query time and masks anything that matches an SSN pattern, using built-in classifiers that run on every read.",
      "Name heuristics: the policy infers sensitive columns from names such as ssn, tax_id, or national_id, with a configurable list maintained per catalog.",
      "Manual registration: each table owner must list their table's columns in the policy, re-running the registration whenever a new column is tagged.",
    ],
    correctIndex: 0,
    explanationEn: `ABAC stands for attribute-based access control: access decisions come from attributes attached to securable objects, implemented as governed tags — key-value pairs defined at the account level and applied to catalogs, schemas, tables, and columns. Policy conditions evaluate those tags with functions such as has_tag() and has_tag_value('pii', 'ssn'), so a single policy attached to the catalog matches every column carrying the tag, and columns tagged later are covered automatically, with no policy edits. ABAC never inspects data values, column names, or data types at query time, and it requires no per-table registration — that is exactly the scalability it adds over manual filters and masks.`,
    explanationPt: `ABAC significa attribute-based access control: as decisões de acesso derivam de atributos anexados aos objetos protegidos, implementados como governed tags — pares chave-valor definidos no nível da conta e aplicados a catálogos, schemas, tabelas e colunas. As condições das policies avaliam essas tags com funções como has_tag() e has_tag_value('pii', 'ssn'); assim, uma única policy anexada ao catálogo encontra toda coluna que carrega a tag, e colunas marcadas depois ficam cobertas automaticamente, sem editar a policy. O ABAC nunca inspeciona valores de dados, nomes de colunas ou tipos no momento da consulta nem exige registro por tabela — é exatamente essa escalabilidade que ele agrega sobre filtros e masks manuais.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/",
    referenceTitle: "Attribute-based access control in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-016",
    domainCode: 7,
    stem: `A bank runs 200+ Delta tables across the catalogs main and finance. Sensitive columns are classified with governed tags. The governance team must guarantee consistent masking rules for all of them, and — critically — table owners must not be able to weaken or remove the protections on their own tables. New tables are created daily and must be covered automatically once they are tagged.

Which approach meets these requirements?`,
    options: [
      "Each table owner writes a masking UDF and runs ALTER TABLE ... ALTER COLUMN ... SET MASK on their own tables, and the resulting mask cannot be removed by anyone, including the owner.",
      "Governance admins define ABAC column mask policies at the catalog level using governed tags; they apply automatically to matching tables and columns, and table owners cannot override or remove them.",
      "The governance team creates one dynamic view per table, embedding is_account_group_member() checks in each view definition, which centralizes enforcement at the catalog level and covers future tables automatically.",
      "The governance team grants SELECT on all sensitive tables only to the compliance_team group and tells everyone else to request extracts, which masks values for everyone outside the group.",
    ],
    correctIndex: 1,
    explanationEn: `ABAC column mask policies attach at the catalog or schema level and match tables and columns dynamically using governed tags, so one policy enforces consistent rules across the entire scope, and newly tagged tables are covered automatically — behaving like future grants. Critically, policies set at a higher level by catalog or schema owners cannot be removed, modified, or bypassed by table owners, giving the governance team the separation of duties it needs. Table-level masks require each owner to run ALTER TABLE per table — and owners can also remove them. Dynamic views are per-object as well and provide no central enforcement, while granting SELECT to a single group hides the data instead of masking it.`,
    explanationPt: `As ABAC column mask policies são anexadas no nível do catálogo ou schema e casam tabelas e colunas dinamicamente por meio de governed tags; assim, uma única policy aplica regras consistentes em todo o escopo, e tabelas novas passam a ser cobertas automaticamente quando recebem as tags — como grants futuros. Policies definidas em nível mais alto pelos owners do catálogo ou schema não podem ser removidas, alteradas nem burladas pelos owners das tabelas, garantindo a separação de funções. Masks em nível de tabela exigem ALTER TABLE por tabela — e os próprios owners podem removê-las. Dynamic views também são por objeto, sem enforcement central; e conceder SELECT a um único grupo esconde os dados em vez de mascará-los.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/abac-vs-rls-cm",
    referenceTitle: "When to use ABAC vs table-level row filters and column masks — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-017",
    domainCode: 7,
    stem: `A lead data engineer is preparing a governance review for auditors who want to understand how Databricks protects sensitive data in Unity Catalog. The engineer must accurately compare Unity Catalog ABAC policies with table-level row filters and column masks.

Which statement about the two mechanisms is accurate?`,
    options: [
      "ABAC policies replace object-level grants: users matched by a policy can query protected tables without being granted SELECT, because the policy itself grants read privileges dynamically at query time.",
      "Table-level row filters and column masks are evaluated by Unity Catalog before the query reaches the runtime, while ABAC policies are evaluated inside the query engine afterwards, in a second evaluation phase after optimization.",
      "ABAC policies attach at catalog or schema level and match objects via governed tags; higher-level policies cannot be modified or removed by table owners, while table-level filters and masks are owner-managed per table.",
      "Table-level column masks can be attached to many tables at once by tagging the tables, which makes them equivalent to ABAC policies, since SET MASK accepts a governed tag as its target.",
    ],
    correctIndex: 2,
    explanationEn: `ABAC policies are created with CREATE POLICY attached to a catalog, schema, or table, and they match objects dynamically using governed tags with functions like has_tag() and has_tag_value(); once set by higher-level owners, table owners cannot override, modify, or remove them. Table-level row filters and column masks are applied with ALTER TABLE on individual tables and are managed by the table owners, who can change or drop them. Both mechanisms only add restrictions on top of object-level privileges — SELECT must still be granted separately, so ABAC never replaces grants. ABAC policies are also evaluated by Unity Catalog before the query reaches the runtime, and only ABAC uses tags.`,
    explanationPt: `As ABAC policies são criadas com CREATE POLICY anexadas a um catálogo, schema ou tabela e casam objetos dinamicamente por meio de governed tags, com funções como has_tag() e has_tag_value(); uma vez definidas por owners de nível mais alto, os owners das tabelas não podem alterá-las, removê-las nem burlá-las. Já os row filters e column masks em nível de tabela são aplicados com ALTER TABLE em tabelas individuais e gerenciados pelos próprios owners. Os dois mecanismos apenas acrescentam restrições sobre privilégios de objeto — o SELECT segue sendo concedido à parte; o ABAC nunca substitui grants. As policies ABAC ainda são avaliadas pelo Unity Catalog antes de a consulta chegar ao runtime, e só o ABAC usa tags.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/abac-vs-rls-cm",
    referenceTitle: "When to use ABAC vs table-level row filters and column masks — Databricks Docs",
    difficulty: "HARD",
  },
];

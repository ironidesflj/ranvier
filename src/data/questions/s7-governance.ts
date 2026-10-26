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
      "orders (managed): UC deletes the data files; orders_hist (external): the files stay in cloud storage.",
      "The files for both tables are deleted, because DROP TABLE in Unity Catalog always removes the underlying data.",
      "The files for both tables remain in place, because DROP TABLE in Unity Catalog removes only table metadata.",
      "The files for orders remain in place, while the files for orders_hist are deleted from the external location.",
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
      "They are stored in storage operated by Databricks outside the company's cloud account, because Unity Catalog owns the data of managed tables.",
      "They are stored in a path chosen by the table creator inside any cloud bucket the creator can access.",
      "In the schema's managed storage location, inside the company's own cloud account — Unity Catalog controls the file lifecycle.",
      "They are stored in the workspace's DBFS root directory, managed by workspace administrators.",
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
      "ALTER TABLE main.sales.orders_hist SET MANAGED;",
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
      "CREATE TABLE gold.daily_summary AS SELECT ... FROM silver.orders;",
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
      "MODIFY on analytics.finance.invoices, because reads also require the write privilege on Unity Catalog tables.",
      "BROWSE on catalog analytics, which lets principals read data from all objects in the catalog.",
      "USE CATALOG on analytics and USE SCHEMA on analytics.finance, in addition to SELECT on the table.",
      "Ownership of analytics.finance.invoices must be transferred to finance_analysts before any member can query it.",
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
      "REVOKE statements only take effect after the principal's active sessions end, and the contractor still has an open session in the workspace.",
      "The contractor's SELECT comes from the group grant — REVOKE only removes direct grants, leaving group access intact.",
      "REVOKE must be executed by a metastore admin to affect principals other than the statement's author.",
      "The contractor also needs USE SCHEMA on main.sales before a table-level REVOKE can apply to them.",
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
      "Explicitly deny SELECT on the table to the contractor — it overrides any grant, group or direct.",
      "Run REVOKE SELECT ON TABLE main.hr.compensation FROM contractor@acme.com.",
      "Remove the contractor from the hr_analysts group.",
      "Transfer ownership of main.hr.compensation to the security team and remove all existing grants on the table for every principal.",
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
      "Both see the full SSN values, because both principals hold SELECT on the table and masks only apply to writes.",
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
      "Governed tags: conditions such as pii = ssn, evaluated with has_tag_value(), match every tagged column — even ones tagged later.",
      "Content inspection: Unity Catalog scans column values at query time and masks anything matching an SSN pattern, with no policy configuration.",
      "Name heuristics: the policy infers sensitive columns from names such as ssn, tax_id, or national_id.",
      "Manual registration: each table owner must list their table's columns in the policy.",
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
      "Each table owner writes a masking UDF and runs ALTER TABLE ... ALTER COLUMN ... SET MASK on their own tables.",
      "ABAC column mask policies at the catalog level using governed tags: automatic coverage, and table owners cannot override them.",
      "The governance team creates one dynamic view per table, embedding is_account_group_member() checks in each view definition.",
      "The governance team grants SELECT on all sensitive tables only to the compliance_team group and tells everyone else to request extracts.",
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
      "ABAC policies replace object-level grants: users matched by a policy can query protected tables without being granted SELECT.",
      "Table-level row filters and column masks are evaluated by Unity Catalog before the query reaches the runtime, while ABAC policies are evaluated inside the query engine afterwards.",
      "ABAC policies attach at catalog or schema level, match via governed tags, and cannot be modified by table owners; table-level masks are owner-managed per table.",
      "Table-level column masks can be attached to many tables at once by tagging the tables, which makes them equivalent to ABAC policies.",
    ],
    correctIndex: 2,
    explanationEn: `ABAC policies are created with CREATE POLICY attached to a catalog, schema, or table, and they match objects dynamically using governed tags with functions like has_tag() and has_tag_value(); once set by higher-level owners, table owners cannot override, modify, or remove them. Table-level row filters and column masks are applied with ALTER TABLE on individual tables and are managed by the table owners, who can change or drop them. Both mechanisms only add restrictions on top of object-level privileges — SELECT must still be granted separately, so ABAC never replaces grants. ABAC policies are also evaluated by Unity Catalog before the query reaches the runtime, and only ABAC uses tags.`,
    explanationPt: `As ABAC policies são criadas com CREATE POLICY anexadas a um catálogo, schema ou tabela e casam objetos dinamicamente por meio de governed tags, com funções como has_tag() e has_tag_value(); uma vez definidas por owners de nível mais alto, os owners das tabelas não podem alterá-las, removê-las nem burlá-las. Já os row filters e column masks em nível de tabela são aplicados com ALTER TABLE em tabelas individuais e gerenciados pelos próprios owners. Os dois mecanismos apenas acrescentam restrições sobre privilégios de objeto — o SELECT segue sendo concedido à parte; o ABAC nunca substitui grants. As policies ABAC ainda são avaliadas pelo Unity Catalog antes de a consulta chegar ao runtime, e só o ABAC usa tags.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/abac-vs-rls-cm",
    referenceTitle: "When to use ABAC vs table-level row filters and column masks — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-018",
    domainCode: 7,
    stem: `A data engineer must register an existing Delta dataset as an external table in Unity Catalog and runs the following statement:

\`\`\`sql
CREATE TABLE main.sales.orders_ext (order_id BIGINT, amount DECIMAL(10,2))
USING DELTA
LOCATION 's3://acme-raw/orders/';
\`\`\`

The statement fails with an error saying that the input path does not match any external location. What is the most likely cause?`,
    options: [
      "The s3:// path would be accepted if the bucket were publicly readable, so the failure means the bucket policy must be opened.",
      "The engineer's account is missing SELECT on the main catalog, and granting SELECT on a catalog is what authorizes table creation.",
      "The path is not covered by any registered external location, an object that references a storage credential.",
      "The statement was run on a shared cluster, and s3:// locations in CREATE TABLE only resolve on single-user clusters.",
    ],
    correctIndex: 2,
    explanationEn: `In Unity Catalog, a cloud storage path used for an external table must be covered by an external location, an object that associates the storage path with a storage credential. Because no external location covering s3://acme-raw/orders/ has been registered, the CREATE TABLE statement cannot resolve the path and fails. Making the bucket publicly readable would not bypass this governance check, since access to governed paths is always mediated by the storage credential. SELECT on a catalog is a read privilege on data and never authorizes creating tables, and the external location requirement is enforced by Unity Catalog regardless of which compute the statement runs on.`,
    explanationPt: `No Unity Catalog, um caminho de cloud storage usado por uma tabela externa precisa estar coberto por um external location, objeto que associa o caminho de armazenamento a uma storage credential. Como nenhum external location cobrindo s3://acme-raw/orders/ foi registrado, o CREATE TABLE não consegue resolver o caminho e falha. Tornar o bucket publicamente acessível não contorna essa checagem de governança, pois o acesso a caminhos governados é sempre mediado pela storage credential. SELECT em um catálogo é privilégio de leitura de dados e nunca autoriza a criação de tabelas, e a exigência de external location vale para qualquer compute em que o comando rode.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-019",
    domainCode: 7,
    stem: `A data platform team plans to rename a column in main.sales.orders, one of the most widely reused tables in the lakehouse. Before making the change, the lead engineer must identify every job, query, dashboard, and downstream table that reads from it, without instrumenting any code. What does Unity Catalog provide for this need?`,
    options: [
      "Unity Catalog captures lineage automatically, and Catalog Explorer's Lineage tab shows the table's downstream jobs and dashboards.",
      "Lineage becomes available only after the team enables a dedicated capture job for each table that needs to be tracked.",
      "Lineage tracks Lakeflow Jobs and pipelines but excludes queries run in Databricks SQL and the dashboards built on them.",
      "Unity Catalog offers no lineage capability of its own, so every consuming team must maintain a manual catalog that documents its dependencies.",
    ],
    correctIndex: 0,
    explanationEn: `Unity Catalog captures lineage automatically as data is used: queries, jobs, and pipelines that read or write governed data are recorded, aggregated across all workspaces attached to the metastore. In Catalog Explorer, a table's Lineage tab renders the upstream and downstream graph, including the tables, jobs, and dashboards that depend on it — exactly the impact analysis the rename needs. No per-table capture job exists to enable, lineage is not limited to Lakeflow Jobs because Databricks SQL queries and dashboards are captured too, and manual dependency catalogs are unnecessary and go stale immediately.`,
    explanationPt: `O Unity Catalog captura o lineage automaticamente conforme os dados são usados: queries, jobs e pipelines que leem ou escrevem dados governados são registrados, com agregação entre todos os workspaces anexados ao metastore. No Catalog Explorer, a aba Lineage de uma tabela exibe o grafo upstream e downstream, incluindo as tabelas, jobs e dashboards que dependem dela — exatamente a análise de impacto que o rename exige. Não existe um job de captura por tabela para habilitar, o lineage não se limita a Lakeflow Jobs porque queries do Databricks SQL e dashboards também são capturados, e catálogos manuais de dependências são desnecessários e ficam desatualizados na hora.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-020",
    domainCode: 7,
    stem: `A compliance officer must produce a list of every principal that ran SELECT against the sensitive table main.hr.compensation during the last 30 days, along with timestamps. The list must come directly from a SQL query in the lakehouse: the team may not download access logs from the cloud provider or export CSV files from the query history UI. Which approach meets the requirement?`,
    options: [
      "Ask the cloud provider for the bucket's access logs and parse the object-level entries that touch the table's files.",
      "Query the system.access.audit system table, filtering the event date and the request parameters that name the table.",
      "Enable query history for each user and export every user's CSV history for offline consolidation into one report.",
      "Ask the account admin to review raw audit events manually, because audit events are visible only to admins and cannot be queried with SQL.",
    ],
    correctIndex: 1,
    explanationEn: `Unity Catalog delivers audit logs as a ready-to-query system table, system.access.audit, which records every request to the platform: the acting principal in user_identity, the timestamp in event_time (with event_date recommended for filters), and the request parameters that name the table in request_params. A 30-day filter on the audit table produces the compliance list directly in SQL. Cloud provider bucket logs record object-level storage access, not SQL queries and their principals. Exporting per-user CSV files from query history is manual and incomplete, and the events are queryable by anyone granted access to the system schema, not only by account admins.`,
    explanationPt: `O Unity Catalog entrega os logs de auditoria como uma system table pronta para consulta, system.access.audit, que registra toda requisição feita à plataforma: o principal ator em user_identity, o timestamp em event_time (com event_date recomendado para filtros) e os parâmetros da requisição, que nomeiam a tabela, em request_params. Um filtro de 30 dias na audit table produz a lista de compliance diretamente em SQL. Os logs de bucket do provedor de nuvem registram acesso a objetos de storage, não as queries SQL nem seus principals. Exportar CSVs por usuário do query history é manual e incompleto, e os eventos podem ser consultados por quem receber acesso ao schema system — não são exclusivos de account admins.`,
    referenceUrl: "https://docs.databricks.com/aws/en/admin/system-tables/audit-logs",
    referenceTitle: "Audit log system table reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-021",
    domainCode: 7,
    stem: `A workspace has years of legacy tables in the workspace-local Hive metastore, still referenced by old jobs using two-part names like legacy_db.orders. The company has now enabled Unity Catalog, and policy requires every production table to fall under its centralized permissions, lineage, and audit.

What must happen to legacy_db.orders to meet the policy?`,
    options: [
      "Nothing is needed: enabling Unity Catalog automatically places existing hive_metastore tables under its governance",
      "Run GRANT SELECT through Unity Catalog against the legacy table, which supplies the missing permissions, lineage, and audit trail",
      "Mount the table's underlying storage with DBFS so that Unity Catalog can see and govern the data files directly",
      "Migrate the table into Unity Catalog and update the old jobs to use its three-level name, so it becomes a UC-governed object",
    ],
    correctIndex: 3,
    explanationEn: `Tables in the workspace-local Hive metastore remain legacy objects after Unity Catalog is enabled: they stay outside the UC three-level namespace and outside its centralized governance model — Unity Catalog grants, lineage, and audit do not apply to them. The path to satisfy the policy is to migrate the table into Unity Catalog (creating it as a UC-managed or external table in a catalog and schema) and update references to its catalog.schema.table name. GRANT statements issued in Unity Catalog cannot manage hive_metastore objects, which keep their own legacy access controls; and DBFS mounts predate Unity Catalog and provide storage access, not governance.`,
    explanationPt: `As tabelas do Hive metastore local do workspace permanecem como objetos legados depois que o Unity Catalog é habilitado: elas ficam fora do namespace de três níveis do UC e fora do seu modelo centralizado de governança — grants, linhagem e auditoria do Unity Catalog não se aplicam a elas. O caminho para atender à política é migrar a tabela para o Unity Catalog (criando-a como tabela gerenciada ou externa em um catalog e schema) e atualizar as referências para o nome catalog.schema.table. Comandos GRANT emitidos no Unity Catalog não conseguem gerenciar objetos do hive_metastore, que mantêm seus controles de acesso legados; e os mounts de DBFS anteriores ao Unity Catalog dão acesso de armazenamento, não governança.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-022",
    domainCode: 7,
    stem: `A company runs five Databricks workspaces, all in the AWS region us-east-1, and wants every workspace to see the same Unity Catalog catalogs, such as main and finance, so that grants and data stay consistent across teams. The platform lead is documenting how the Unity Catalog metastore is organized for this deployment. Which statement is correct?`,
    options: [
      "Unity Catalog uses one metastore per account per region; all workspaces in us-east-1 attach to it and share its catalogs.",
      "Each workspace hosts its own metastore, and administrators can optionally configure replication between the metastores.",
      "Unity Catalog creates one metastore per catalog rather than per region, so the main and finance catalogs would each get their own metastore.",
      "Best practice is to create several metastores in the same region and assign a dedicated one to each workspace.",
    ],
    correctIndex: 0,
    explanationEn: `Unity Catalog is organized around one metastore per account per cloud region: each region in which the company operates gets exactly one metastore, and every workspace in that region links to it. The five us-east-1 workspaces therefore attach to the same metastore and see the same catalogs, so a grant on main or finance applies in every workspace. Workspaces do not host their own metastores or replicate them, a metastore contains many catalogs rather than being created per catalog, and creating multiple metastores in one region contradicts the one-metastore-per-region model.`,
    explanationPt: `O Unity Catalog é organizado com um metastore por conta e por região de nuvem: cada região em que a empresa opera recebe exatamente um metastore, e cada workspace dessa região se vincula a ele. Os cinco workspaces em us-east-1, portanto, se anexam ao mesmo metastore e veem os mesmos catálogos, então um grant em main ou finance vale em todos eles. Workspaces não hospedam metastores próprios nem os replicam, um metastore contém muitos catálogos em vez de ser criado por catálogo, e criar vários metastores em uma mesma região contraria o modelo de um metastore por região.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-023",
    domainCode: 7,
    stem: `A nightly Lakeflow Job runs under the service principal loader-sp and writes report files into the Unity Catalog volume main.ops.drop_zone. The job's identity already has USE CATALOG on main and USE SCHEMA on ops. Which grant should an administrator apply so that the pipeline can write its files into the volume?`,
    options: [
      "GRANT SELECT ON VOLUME main.ops.drop_zone TO `loader-sp`, since SELECT is the privilege that controls reads and writes on volumes.",
      "GRANT ALL PRIVILEGES ON CATALOG main TO `loader-sp`, which is the least-privilege grant that still enables the file writes.",
      "GRANT WRITE VOLUME ON VOLUME main.ops.drop_zone TO `loader-sp`, the Unity Catalog privilege that authorizes writing files in a volume.",
      "GRANT nothing at all, because volumes automatically inherit their access rules from the storage credential backing them.",
    ],
    correctIndex: 2,
    explanationEn: `Unity Catalog volumes have their own privilege types: WRITE VOLUME authorizes creating and writing files in the volume, while READ VOLUME authorizes reading them. Since loader-sp already holds USE CATALOG on main and USE SCHEMA on ops, granting WRITE VOLUME on main.ops.drop_zone gives the pipeline exactly what it needs. SELECT is a table and view privilege and does not exist for volumes, ALL PRIVILEGES on the entire catalog violates least privilege for a job that only drops files, and volumes do not inherit permissions from the underlying storage credential — access is decided solely by Unity Catalog grants.`,
    explanationPt: `Os Unity Catalog volumes têm tipos de privilégio próprios: WRITE VOLUME autoriza criar e gravar arquivos no volume, enquanto READ VOLUME autoriza lê-los. Como o loader-sp já tem USE CATALOG em main e USE SCHEMA em ops, conceder WRITE VOLUME em main.ops.drop_zone dá ao pipeline exatamente o que ele precisa. SELECT é um privilégio de tables e views e não existe para volumes, ALL PRIVILEGES no catálogo inteiro viola o least privilege para um job que apenas descarrega arquivos, e volumes não herdam permissões da storage credential subjacente — o acesso é decidido exclusivamente pelos grants do Unity Catalog.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-024",
    domainCode: 7,
    stem: `A new data engineer joins a company whose lakehouse is governed by Unity Catalog. The onboarding documentation consistently refers to tables by fully qualified names such as main.sales.orders, and the engineer asks a senior colleague what the three parts of the name mean. Which explanation is accurate?`,
    options: [
      "main names the metastore, sales is a database, and orders is a table, following the legacy Hive database.table model with a decorative prefix.",
      "main is the catalog, sales is a schema inside it, and orders is a table in that schema, the three-level namespace Unity Catalog enforces.",
      "main names the workspace, sales is the database inside it, and orders is the table, matching the workspace.database.table convention.",
      "main is the cloud region, sales is a storage bucket in that region, and orders is the table stored under that bucket.",
    ],
    correctIndex: 1,
    explanationEn: `Unity Catalog enforces a three-level namespace, catalog.schema.object, for every table, view, and volume. In main.sales.orders, main is the catalog — the top-level securable container shared across workspaces — sales is a schema inside that catalog, and orders is the table in that schema. The two-level database.table convention belongs to the legacy Hive metastore, the namespace never includes the workspace name, and it has nothing to do with cloud regions or storage buckets.`,
    explanationPt: `O Unity Catalog impõe um namespace de três níveis, catalog.schema.object, para toda table, view e volume. Em main.sales.orders, main é o catálogo — o contêiner de securables de nível mais alto, compartilhado entre workspaces —, sales é um schema dentro desse catálogo e orders é a tabela desse schema. A convenção de dois níveis database.table pertence ao metastore Hive legado, o namespace nunca inclui o nome do workspace e não tem relação com regiões de nuvem nem storage buckets.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-025",
    domainCode: 7,
    stem: `A company syncs groups such as data_engineers from its identity provider to Databricks using SCIM provisioning. The governance team wants a single definition of each group, so that a grant issued in any workspace, or directly in Unity Catalog, always applies to the same members. Where should these groups be managed?`,
    options: [
      "Recreate each group manually as a workspace-local group in every single workspace, keeping every member list synchronized by hand across the company.",
      "Keep the groups at the account level, but accept that Unity Catalog data grants cannot reference account groups on securables.",
      "Manage them as account groups synced from the identity provider: they can be used for grants in any workspace, unlike workspace-local groups.",
      "Rely on the SCIM sync to create an equivalent workspace-local copy of each group automatically inside every workspace.",
    ],
    correctIndex: 2,
    explanationEn: `Groups synced from the identity provider land in the Databricks account, where they are managed in the account console. Account groups can be assigned to any workspace and used in Unity Catalog grants, so one group definition behaves identically everywhere — the source of record stays the IdP. Manually recreating groups as workspace-local groups fragments identity and invites membership drift, account groups absolutely can be referenced in data grants, and SCIM does not create workspace-local copies: it provisions the account groups themselves.`,
    explanationPt: `Os grupos sincronizados do identity provider chegam à conta do Databricks, onde são gerenciados no account console. Grupos de conta podem ser atribuídos a qualquer workspace e usados em grants do Unity Catalog, então uma única definição de grupo se comporta igual em todos os lugares — a fonte da verdade continua sendo o IdP. Recriar grupos manualmente como workspace-local groups fragmenta a identidade e provoca drift de membros, grupos de conta podem sim ser referenciados em grants de dados, e o SCIM não cria cópias locais: ele provisiona os próprios grupos de conta.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-026",
    domainCode: 7,
    stem: `During a quarterly access review, the governance team must list every principal that currently holds any privilege on the Unity Catalog table main.sales.orders, together with the privilege types. The reviewer wants to produce the list with one SQL statement in the query editor. How should the reviewer get the information?`,
    options: [
      "Run SHOW GRANTS ON TABLE main.sales.orders, which lists each principal and the privilege it holds on the table.",
      "Run DESCRIBE TABLE main.sales.orders, because its output includes the current grantees along with the table's columns.",
      "Use the table details page in Catalog Explorer, because grants are visible there and no SQL statement returns them.",
      "Run SELECT * FROM grants, the global view that lists every grant in the metastore without needing to name a specific object.",
    ],
    correctIndex: 0,
    explanationEn: `SHOW GRANTS ON TABLE main.sales.orders returns one row per principal and privilege currently held on the table — exactly the access review the governance team needs; a reviewer who is the object owner or holds MANAGE or READ METADATA sees every principal's grants. DESCRIBE TABLE lists columns and table properties, not grantees. Grants are fully scriptable in SQL — Catalog Explorer's Permissions tab is a convenience, not the only source — and there is no relation called grants to SELECT from; the supported way to enumerate grants is SHOW GRANTS on a securable.`,
    explanationPt: `SHOW GRANTS ON TABLE main.sales.orders devolve uma linha por principal e privilégio atualmente existente na tabela — exatamente a revisão de acessos que a governança precisa; um revisor que é owner do objeto ou detém MANAGE ou READ METADATA vê os grants de todos os principals. DESCRIBE TABLE lista colunas e propriedades da tabela, não grantees. Grants são totalmente consultáveis via SQL — a aba Permissions do Catalog Explorer é uma conveniência, não a única fonte — e não existe uma relação chamada grants para consultar; o caminho suportado é SHOW GRANTS sobre um securable.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-027",
    domainCode: 7,
    stem: `During a security audit, the auditors require separation of duties across the company's Databricks deployment. They ask the platform lead to explain which administrator role manages users, groups, and workspaces at the account level, which role manages an individual workspace, and which role manages catalogs and data in the metastore. Which answer is accurate?`,
    options: [
      "Account admin is the only built-in administrative role; workspace admin and metastore admin are just conventional names that teams use for ordinary groups.",
      "Workspace admin automatically includes metastore admin, so a single role is enough to govern both the workspace and the catalogs in its region.",
      "Account admins manage users, groups, workspaces, and metastores at the account level; workspace admins govern one workspace; metastore admins manage catalogs and data.",
      "All three administrative scopes should be assigned to the same trusted person, which is what the auditors' separation-of-duties requirement expects.",
    ],
    correctIndex: 2,
    explanationEn: `Databricks deliberately separates the three administrative scopes. Account admins operate at the account level: they manage users, groups, and service principals, create workspaces and metastores, and link them. Workspace admins manage membership, settings, and workspace objects within a single workspace. Metastore admins manage catalogs and data across the metastore — and the role is distinct: creating the metastore makes the account admin its initial metastore admin, and workspace admin does not imply it. Collapsing all three onto one person is exactly what a separation-of-duties audit rejects.`,
    explanationPt: `A Databricks separa deliberadamente os três escopos administrativos. Os account admins atuam no nível da conta: gerenciam usuários, grupos e service principals, criam workspaces e metastores e os vinculam. Os workspace admins gerenciam membros, configurações e objetos de um único workspace. Os metastore admins gerenciam catálogos e dados no metastore inteiro — e o papel é distinto: quem cria o metastore se torna seu metastore admin inicial, e ser workspace admin não implica ser metastore admin. Concentrar os três papéis em uma só pessoa é exatamente o que uma auditoria de separação de deveres rejeita.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-028",
    domainCode: 7,
    stem: `An external security auditor is reviewing how the company's lakehouse reaches its cloud storage. The platform lead explains that one Unity Catalog object encapsulates the cloud credential — an AWS IAM role — that authorizes access to storage paths, and the auditor asks who in the platform can create that object. Which explanation is accurate?`,
    options: [
      "Any lakehouse user can create a storage credential whenever they register a new cloud storage path for their team.",
      "A storage credential is created at the metastore level by a metastore admin or a principal granted CREATE STORAGE CREDENTIAL.",
      "Storage credentials live inside individual schemas, next to the tables and volumes that read from their storage paths.",
      "Storage credentials are account-wide objects that every user shares automatically, with no Unity Catalog privilege required to use them.",
    ],
    correctIndex: 1,
    explanationEn: `A storage credential is the Unity Catalog object that encapsulates a cloud credential, such as an AWS IAM role, used to reach data in cloud storage. It is a metastore-level object: creating one requires being a metastore admin (or account admin) or holding the CREATE STORAGE CREDENTIAL privilege on the metastore, which admins can delegate to other principals. Storage credentials never live inside schemas; they sit directly under the metastore, where external locations reference them to govern cloud paths. And they are not automatically usable by everyone: working with them is itself controlled by Unity Catalog privileges such as READ METADATA and MANAGE, plus optional workspace bindings.`,
    explanationPt: `A storage credential é o objeto do Unity Catalog que encapsula uma credencial de nuvem, como um IAM role da AWS, usada para alcançar dados no cloud storage. É um objeto de nível de metastore: criar uma exige ser metastore admin (ou account admin) ou ter o privilégio CREATE STORAGE CREDENTIAL no metastore — privilégio que os admins podem delegar a outros principals. Storage credentials nunca moram dentro de schemas; elas ficam diretamente sob o metastore, onde os external locations as referenciam para governar caminhos de nuvem. E elas não ficam automaticamente disponíveis para qualquer usuário: usá-las e gerenciá-las também é controlado por privilégios do Unity Catalog, como READ METADATA e MANAGE, além de workspace bindings opcionais.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-029",
    domainCode: 7,
    stem: `A new analytics domain is joining the lakehouse, and the governance team plans to give it a dedicated Unity Catalog catalog so its schemas and tables stay separate from other domains. The platform admin who will create the catalog asks which privilege the task requires. Which answer is correct?`,
    options: [
      "CREATE CATALOG on the metastore, a privilege that metastore and account admins can grant to other principals.",
      "USE CATALOG on an existing catalog, since usage privileges on one catalog authorize creating sibling catalogs.",
      "Workspace admin in every workspace attached to the metastore, because catalog creation is a workspace-scoped operation.",
      "SELECT on at least one existing catalog, because demonstrated read access is the prerequisite for creating new catalogs.",
    ],
    correctIndex: 0,
    explanationEn: `CREATE CATALOG is a metastore-level privilege: catalog creation is a metastore-scoped operation, and grants on a metastore govern metastore operations like CREATE CATALOG rather than inheriting down to data objects. Metastore admins hold the privilege by default, and account admins can also grant privileges directly on a metastore, so the right can be delegated to the platform admin. USE CATALOG only lets a principal interact with objects inside an existing catalog and never authorizes creating one — the new catalog does not exist yet. Workspace admin manages users and settings within one workspace, not the contents of the metastore, and SELECT is a data-read privilege on tables and views, unrelated to creation rights.`,
    explanationPt: `CREATE CATALOG é um privilégio de nível de metastore: criar catálogos é uma operação com escopo no metastore e, no modelo de permissões, grants no metastore controlam operações como CREATE CATALOG, sem herdar para os objetos de dados. Metastore admins têm o privilégio por padrão, e account admins também podem conceder privilégios diretamente no metastore — ou seja, o direito pode ser delegado ao platform admin. USE CATALOG apenas permite interagir com objetos de um catálogo existente e nunca autoriza criação — o catálogo novo nem existe ainda. Workspace admin gerencia usuários e configurações de um único workspace, não o conteúdo do metastore; e SELECT é privilégio de leitura de dados em tabelas e views, sem relação com direitos de criação.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-030",
    domainCode: 7,
    stem: `A data engineer created the Unity Catalog table main.finance.risk_scores and owned it until she changed teams. No GRANT statement ever named her user, yet she could always query the table, modify its data, and grant other groups access to it. Her successor asks how that was possible. What is the explanation?`,
    options: [
      "Object owners receive hidden grants that SHOW GRANTS deliberately omits from its output to keep listings short.",
      "An owner's only automatic capability is dropping the table; reads and writes still require explicitly granted privileges.",
      "Unity Catalog grants owners every capability on their object implicitly — including granting privileges to other principals.",
      "Ownership cannot be transferred after creation, so the engineer's account must keep owning the table forever.",
    ],
    correctIndex: 2,
    explanationEn: `Every securable object in Unity Catalog has exactly one owner, and ownership carries all capabilities on that object: querying, modifying, granting and revoking privileges, transferring ownership, and dropping it. These capabilities are implied — functionally equivalent to ALL PRIVILEGES — without a single GRANT statement, which is why SHOW GRANTS never listed the engineer. Ownership is also transferable to another principal at any time, so a departed owner's account does not lock the table. There are no hidden grant rows that SHOW GRANTS suppresses, dropping is only one of the owner's many capabilities, and nothing prevents transferring ownership after creation.`,
    explanationPt: `Cada securable do Unity Catalog tem exatamente um owner, e o ownership carrega todas as capacidades sobre o objeto: consultar, modificar, conceder e revogar privilégios, transferir o ownership e dropar. Essas capacidades são implícitas — funcionam como um ALL PRIVILEGES — sem uma única instrução GRANT, e é por isso que o SHOW GRANTS nunca listou a engenheira. O ownership também é transferível a outro principal a qualquer momento, então a conta de quem saiu não prende a tabela. Não existem grants ocultos que o SHOW GRANTS omita, dropar é apenas uma das muitas capacidades do owner, e nada impede transferir o ownership depois da criação.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-031",
    domainCode: 7,
    stem: `A governance program is rolling out governed tags — key-value classifications such as pii=high — so that ABAC policies can act on them uniformly. The data governance lead is documenting where these tags are defined and who can create them.

Which statement matches the platform?`,
    options: [
      "Governed tags are defined per metastore, and any metastore admin can create them freely",
      "Governed tags are created ad hoc by users on their own tables, with no central control",
      "Governed tags are account-level, applying across the whole estate including multiple metastores",
      "Governed tags are defined per workspace and never shared between workspaces",
    ],
    correctIndex: 2,
    explanationEn: `Governed tags are account-level objects: they are defined once at the account level and apply across the entire data estate — spanning workspaces and even multiple metastores — so a classification like pii=high means the same thing everywhere and ABAC policies can rely on it. Creating them requires account-level permission (account and workspace admins hold it by default), which is what makes the vocabulary centrally controlled. Per-metastore, per-workspace, and user-ad-hoc definitions would fragment exactly the consistency governed tags exist to provide.`,
    explanationPt: `Os governed tags são objetos de nível de conta: são definidos uma única vez no nível da conta e valem por todo o estate de dados — atravessando workspaces e até múltiplos metastores — de modo que uma classificação como pii=high signifique a mesma coisa em todos os lugares e as políticas ABAC possam confiar nela. Criá-los exige permissão de nível de conta (account e workspace admins a têm por padrão), e é isso que mantém o vocabulário controlado centralmente. Definições por metastore, por workspace ou ad hoc pelos usuários fragmentariam exatamente a consistência que os governed tags existem para garantir.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/",
    referenceTitle: "Attribute-based access control — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-032",
    domainCode: 7,
    stem: `The governance team plans to rename msrp, a single column in main.products.price_list, a 60-column table with dozens of downstream dashboards and pipelines. Most consumers never touch that column, so the team wants to reach only the assets that actually depend on it, instead of every consumer of the table. Which Unity Catalog capability supports this?`,
    options: [
      "Unity Catalog tracks lineage at the table level only, so every consumer of the table counts as affected.",
      "Unity Catalog captures lineage down to the column level, and Catalog Explorer shows which assets depend on that column.",
      "Column lineage becomes available only after an administrator enables audit logging on each table that needs tracking.",
      "Column-level lineage is captured only for external tables, because their files live outside the managed storage location.",
    ],
    correctIndex: 1,
    explanationEn: `Unity Catalog captures lineage automatically for queries run on Databricks, down to the column level, and aggregates it across all workspaces attached to the metastore. In Catalog Explorer's lineage graph, clicking a column reveals the upstream columns it derives from and the downstream columns, tables, and dashboards that depend on it — exactly the per-column impact analysis the team should run before renaming msrp. Lineage is not confined to the table level, it requires no per-table auditing setup because capture is automatic, and it is not limited to external tables: any governed table referenced by its catalog-qualified name gets column-level lineage.`,
    explanationPt: `O Unity Catalog captura o lineage automaticamente para as queries executadas na plataforma, até o nível de coluna, com agregação entre todos os workspaces anexados ao metastore. No grafo de lineage do Catalog Explorer, clicar em uma coluna revela as colunas upstream de que ela deriva e as colunas, tabelas e dashboards downstream que dependem dela — exatamente a análise de impacto por coluna que o time deve rodar antes de renomear msrp. O lineage não se limita ao nível de tabela, não exige configurar auditoria por tabela porque a captura é automática, e não é exclusivo de tabelas externas: toda tabela governada referenciada pelo nome qualificado de catálogo tem column lineage.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-033",
    domainCode: 7,
    stem: `A platform team is designing file storage under Unity Catalog. Machine learning artifacts produced by Databricks jobs should live in storage that Unity Catalog fully controls, including deletion. A large reference dataset already sits in a bucket owned by another application, must stay there, and must never be deleted by Databricks. How should the team create the two volumes?`,
    options: [
      "Create both as external volumes, because Unity Catalog volumes must always reference paths governed by an external location.",
      "Create both as managed volumes, each with an explicit LOCATION clause that names its destination storage path.",
      "Create a managed volume for the artifacts and an external volume with LOCATION for the reference dataset.",
      "Create an external volume for the artifacts so that dropping it purges their files, and a managed volume for the reference dataset.",
    ],
    correctIndex: 2,
    explanationEn: `Unity Catalog offers managed and external volumes. A managed volume is created without a LOCATION clause, stored in the managed storage location of the containing schema, and Unity Catalog controls the file lifecycle — dropping it permanently deletes the underlying files, which suits the ML artifacts. An external volume is registered with a LOCATION that must fall under a governed external location; Databricks governs access to the application's bucket but never deletes its files, because dropping an external volume removes only the volume definition. Volumes are therefore not always external, managed volumes never take a LOCATION, and dropping an external volume never purges data from cloud storage.`,
    explanationPt: `O Unity Catalog oferece volumes managed e external. Um managed volume é criado sem cláusula LOCATION, armazenado no managed storage location do schema que o contém, e o Unity Catalog controla o ciclo de vida dos arquivos — dropá-lo apaga os arquivos subjacentes, o que atende aos artefatos de ML. Um external volume é registrado com um LOCATION que precisa estar sob um external location governado; o Databricks governa o acesso ao bucket da aplicação, mas nunca apaga os arquivos dela, porque dropar um external volume remove apenas a definição do volume. Portanto volumes não são sempre externos, managed volumes nunca recebem LOCATION, e dropar um external volume jamais apaga dados do cloud storage.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-034",
    domainCode: 7,
    stem: `The governance team granted the group marketing_analysts all of its access to catalog main with one set of statements:

\`\`\`sql
GRANT USE CATALOG ON CATALOG main TO marketing_analysts;
GRANT USE SCHEMA ON CATALOG main TO marketing_analysts;
GRANT SELECT ON CATALOG main TO marketing_analysts;
\`\`\`

The group's project later ends. An administrator runs REVOKE SELECT ON CATALOG main FROM marketing_analysts, and the group holds no grants other than the three shown. What happens to its members' access to tables in main.sales and main.marketing?`,
    options: [
      "They lose SELECT on every table under main at once, because those reads were inherited from the catalog-level grant.",
      "They keep reading the tables, because the surviving USE CATALOG and USE SCHEMA privileges are what authorize data access.",
      "Their access persists until an administrator repeats the REVOKE on every schema and every table under main.",
      "The REVOKE is ignored below the catalog, because Unity Catalog copies inherited privileges into each table when granting them.",
    ],
    correctIndex: 0,
    explanationEn: `Unity Catalog privileges inherit downward: the single SELECT grant on catalog main gave the group SELECT on every current and future table inside main, and nothing was copied or re-granted at the schema or table levels. Revoking that one grant removes SELECT everywhere below it at once, because inherited reads live only as long as the parent grant. The surviving USE CATALOG and USE SCHEMA let members traverse and discover objects, but usage privileges never authorize data reads, so no table stays readable. No schema-by-schema or table-by-table repetition is needed, because no grants exist at those levels, and inheritance is evaluated live through the hierarchy rather than materialized as per-table copies.`,
    explanationPt: `Os privilégios do Unity Catalog são herdados de cima para baixo: o único grant de SELECT no catálogo main dava ao grupo SELECT em toda tabela atual e futura dentro de main, sem copiar nem re-conceder nada nos níveis de schema ou tabela. Revogar esse único grant remove o SELECT de tudo que está abaixo de uma só vez, porque as leituras herdadas só existem enquanto o grant pai existir. O USE CATALOG e o USE SCHEMA que sobrevivem permitem atravessar e descobrir objetos, mas usage privileges nunca autorizam leitura de dados, então nenhuma tabela continua legível. Não é preciso repetir o REVOKE schema por schema nem tabela por tabela, porque não existem grants nesses níveis, e a herança é avaliada em tempo real na hierarquia, não materializada como cópias por tabela.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-035",
    domainCode: 7,
    stem: `During a security architecture review, the team is documenting every kind of object that Unity Catalog can protect with grants, beyond the familiar catalogs, schemas, and tables. The reviewer asks which other object types are securables that carry their own privilege types. Which answer is accurate?`,
    options: [
      "Only tables are securables; every other object is protected indirectly through the privileges of the catalog that contains it.",
      "Views, volumes, and functions exist as governed objects, but none of them carries privileges of its own.",
      "Storage credentials and external locations are cloud-side constructs that Unity Catalog references but cannot govern.",
      "Views, volumes, functions, external locations, storage credentials, and connections are all securables with their own privileges.",
    ],
    correctIndex: 3,
    explanationEn: `A securable object is anything in Unity Catalog on which privileges can be granted, and the model extends well beyond tables. Views and materialized views carry their own SELECT, volumes carry READ VOLUME and WRITE VOLUME, functions carry EXECUTE, and external locations, storage credentials, and connections sit directly under the metastore with their own privilege types, such as READ FILES and WRITE FILES on external locations. Tables are far from the only securables, views and volumes absolutely have privileges of their own, and storage credentials and external locations are fully governed objects — external locations exist precisely to put cloud paths under READ FILES and WRITE FILES control.`,
    explanationPt: `Um securable é qualquer objeto do Unity Catalog sobre o qual privilégios podem ser concedidos, e o modelo vai muito além das tabelas. Views e materialized views têm SELECT próprio, volumes têm READ VOLUME e WRITE VOLUME, funções têm EXECUTE, e external locations, storage credentials e connections ficam diretamente sob o metastore com tipos de privilégio próprios, como READ FILES e WRITE FILES nos external locations. Tabelas estão longe de ser os únicos securables, views e volumes têm sim privilégios próprios, e storage credentials e external locations são objetos plenamente governados — os external locations existem justamente para colocar caminhos de nuvem sob controle de READ FILES e WRITE FILES.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-036",
    domainCode: 7,
    stem: `Five workspaces share one Unity Catalog metastore, and by default every workspace can see every catalog. A new compliance requirement says one analytics catalog may be exposed to only two of the five workspaces, without splitting it into separate copies.

Which mechanism implements this?`,
    options: [
      "Create a second metastore and replicate the whole catalog into it for the other workspaces",
      "Grant USE CATALOG to the analysts group and rely on group membership per workspace",
      "Convert the catalog's tables to external tables stored in a separate storage account",
      "Workspace-catalog binding: assign the catalog to a restricted list of workspaces",
    ],
    correctIndex: 3,
    explanationEn: `Catalogs are shared with all workspaces attached to the metastore by default, and a workspace-catalog binding restricts that: the catalog is assigned to a specific list of workspaces, so only the two approved workspaces see it, while the data and its governance stay in one place. A second metastore contradicts the one-metastore-per-region model and duplicates data, per-workspace group grants still leave the catalog visible as an object, and external tables change storage location, not workspace visibility.`,
    explanationPt: `Os catálogos são compartilhados com todos os workspaces anexados ao metastore por padrão, e o workspace-catalog binding restringe isso: o catálogo é atribuído a uma lista específica de workspaces, de modo que apenas os dois aprovados o enxergam, enquanto os dados e sua governança ficam num único lugar. Um segundo metastore contraria o modelo de um metastore por região e duplica os dados, grants de grupo por workspace deixam o catálogo visível como objeto, e tabelas externas mudam o local de armazenamento, não a visibilidade por workspace.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-037",
    domainCode: 7,
    stem: `Security policy requires rotating the AWS IAM role that backs the company's lakehouse storage every quarter. The role is attached to a Unity Catalog storage credential that several external locations and external tables depend on. The platform team must implement the rotation without recreating objects or interrupting nightly pipelines. Which approach meets the requirement?`,
    options: [
      "Create a second storage credential, then drop and recreate every external location and table against it during a release window.",
      "Update the existing storage credential with the new IAM role, so external locations and tables keep referencing the same object.",
      "Pause all pipelines during a maintenance window, rotate the role in AWS, and wait for Unity Catalog to rediscover the credential.",
      "Create a new storage credential every quarter, because credentials are immutable once an external location references them.",
    ],
    correctIndex: 1,
    explanationEn: `External locations and external tables depend on a storage credential as a Unity Catalog object; they do not embed the underlying IAM role. Rotation is therefore a metadata update: edit the existing storage credential — in Catalog Explorer, with the Databricks CLI, or through the storage-credentials REST API — to reference the new role ARN, and every dependent external location and table keeps resolving access through the same credential object, with no re-creation and no pipeline downtime. Dropping and recreating locations and tables is unnecessary churn, a maintenance window is not required for a metadata change, and credentials are not immutable: their role, name, comment, and owner can all be updated in place.`,
    explanationPt: `External locations e tabelas externas dependem de uma storage credential como objeto do Unity Catalog; elas não embutem o IAM role subjacente. Rotacionar é, portanto, uma atualização de metadados: edite a storage credential existente — no Catalog Explorer, com a Databricks CLI ou pela REST API de storage-credentials — para referenciar o ARN do novo role, e todos os external locations e tabelas dependentes continuam resolvendo o acesso pelo mesmo objeto de credential, sem recriação e sem downtime para os pipelines. Dropar e recriar locations e tabelas é retrabalho desnecessário, janela de manutenção não é exigida para uma mudança de metadados, e credentials não são imutáveis: role, nome, comment e owner podem ser atualizados no próprio objeto.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-038",
    domainCode: 7,
    stem: `A platform team keeps its production notebooks in a Databricks Git folder cloned from the team's GitHub repository. External auditors must be allowed to open and read the folder's notebooks and run them on sample data, but they must not edit files, create branches, or push changes. How should a workspace admin grant the auditors' group this access?`,
    options: [
      "Grant the auditors CAN RUN on the Git folder: workspace objects like Git folders use their own permission levels (CAN READ, CAN RUN, CAN EDIT, CAN MANAGE).",
      "Grant the auditors SELECT on the Git folder through Unity Catalog, because Git folders are securables governed by the metastore like tables.",
      "Grant the auditors nothing on the folder, because every workspace user can already view, edit, and run any Git folder by default.",
      "Grant the auditors CAN RUN on the catalog's Delta tables, because permissions on a Git folder automatically extend to the data its notebooks read.",
    ],
    correctIndex: 0,
    explanationEn: `Git folders are workspace objects, and access to them is controlled with workspace-level ACLs, not with Unity Catalog privileges. A Git folder offers the permission levels CAN READ, CAN RUN, CAN EDIT, and CAN MANAGE: CAN READ covers listing, viewing, and cloning assets; CAN RUN adds running executable assets; editing files, creating or switching branches, and pushing require CAN EDIT. Granting the auditors CAN RUN therefore delivers exactly view-and-run, with no edit rights. SELECT is a Unity Catalog data privilege for governed tables and views and cannot be granted on a workspace object, regular users receive no default access to Git folders, and permissions on a Git folder never extend to the Delta tables its notebooks read — those are governed by Unity Catalog grants.`,
    explanationPt: `Git folders são objetos do workspace, e o acesso a eles é controlado por ACLs de nível de workspace, não por privilégios do Unity Catalog. Um Git folder oferece os níveis de permissão CAN READ, CAN RUN, CAN EDIT e CAN MANAGE: CAN READ cobre listar, visualizar e clonar os assets; CAN RUN acrescenta executar os assets executáveis; editar arquivos, criar ou trocar branches e fazer push exigem CAN EDIT. Conceder CAN RUN aos auditores entrega exatamente visualizar e executar, sem direitos de edição. SELECT é um privilégio de dados do Unity Catalog para tabelas e views governadas e não pode ser concedido sobre um objeto do workspace; usuários comuns não recebem acesso default a Git folders; e as permissões de um Git folder nunca se estendem às tabelas Delta que seus notebooks leem — essas são governadas por grants do Unity Catalog.`,
    referenceUrl: "https://docs.databricks.com/aws/en/repos/git-folders-concepts",
    referenceTitle: "Git folders concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-039",
    domainCode: 7,
    stem: `A production pipeline reads its database password from the Databricks secret scope etl-secrets. The analysts' group must be able to read an API key stored in that same scope, but the group must not be allowed to change the scope's access rules or overwrite secret values. How should the admin grant the analysts this access?`,
    options: [
      "Grant nothing on the scope, because any workspace user can already read the secrets stored in every secret scope by default.",
      "Grant the group SELECT on the secret scope through Unity Catalog, because secret scope ACLs are inherited automatically from Unity Catalog group privileges.",
      "Grant the group the READ permission on the scope's ACL: READ allows reading secret values, and only MANAGE can change the scope's permissions.",
      "Grant the group MANAGE on the scope, because MANAGE is the permission level that lets principals read secret values.",
    ],
    correctIndex: 2,
    explanationEn: `Secret scopes are governed by their own ACLs, assigned per principal — a user, a service principal, or a group — using the secrets CLI or API, with the permission levels READ, WRITE, and MANAGE. READ lets principals read the scope's secrets and list its keys; WRITE adds writing values; only MANAGE can modify permissions. Granting the analysts' group READ on etl-secrets therefore meets the requirement: the API key is readable, while the scope's ACLs and values stay untouched. There is no blanket default — without an ACL, workspace users cannot read a scope — and secret scope ACLs are not inherited from Unity Catalog group privileges, because they are a separate workspace-level mechanism. MANAGE is not needed for reading; it would let the analysts change the scope's permissions and overwrite values.`,
    explanationPt: `Secret scopes são governados por ACLs próprias, atribuídas por principal — usuário, service principal ou grupo — por meio da CLI ou da API de secrets, com os níveis de permissão READ, WRITE e MANAGE. READ permite ler os secrets do scope e listar suas chaves; WRITE acrescenta a escrita de valores; apenas MANAGE permite modificar permissões. Conceder READ ao grupo dos analistas no scope etl-secrets atende ao requisito: a API key fica legível, enquanto as ACLs e os valores do scope permanecem intactos. Não existe acesso default irrestrito — sem ACL, usuários do workspace não conseguem ler um scope — e as ACLs de secret scope não são herdadas dos privilégios de grupos do Unity Catalog, pois constituem um mecanismo separado, do workspace. MANAGE não é necessário para ler; ele permitiria aos analistas alterar as permissões do scope e sobrescrever valores.`,
    referenceUrl: "https://docs.databricks.com/aws/en/security/secrets",
    referenceTitle: "Manage secrets — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-040",
    domainCode: 7,
    stem: `A contractor's engagement ends today, and the offboarding checklist requires that all access to Unity Catalog data be cut off before the end of the day. An access review confirms that the contractor's privileges on dozens of tables all arrive through membership in three groups; the contractor holds no direct grants. Which action cuts off the contractor's data access completely and verifiably?`,
    options: [
      "Revoke SELECT from each of the three groups on every table they can currently read, working through the dozens of objects one by one before the end of the day.",
      "Wait for the contractor's personal access tokens to expire, which automatically disables the account's data access.",
      "Rename the contractor's user account so that sign-in fails, and leave the group memberships and all grants exactly as they are.",
      "Remove the contractor from the three groups: every privilege arrived through membership, so this single change cuts off all table access and is auditable.",
    ],
    correctIndex: 3,
    explanationEn: `Every privilege the contractor holds arrives through the three groups, and no grant names the contractor directly, so removing the three memberships is the complete fix: with the memberships gone, nothing remains that authorizes a query, and the membership changes are recorded and easy to verify (Databricks documents only a short propagation delay for group updates). Revoking the groups' SELECT table by table would strip access from every other member of those groups and would still risk missing objects before the deadline. Waiting for token expiry is unrelated, because table access comes from group grants, not from the contractor's personal tokens. Renaming the account blocks nothing durably — every membership and grant would stay attached to it.`,
    explanationPt: `Todo privilégio do contractor chega por meio dos três grupos, e nenhum grant o nomeia diretamente, portanto remover as três associações é a correção completa: sem as memberships, não sobra nada que autorize uma query, e as mudanças de associação ficam registradas e são fáceis de verificar (a doc do Databricks menciona apenas um curto atraso de propagação para atualizações de grupo). Revogar o SELECT dos grupos tabela por tabela tiraria o acesso de todos os outros membros desses grupos e ainda correria o risco de esquecer objetos antes do prazo. Esperar a expiração dos tokens é irrelevante, porque o acesso às tabelas vem dos grants dos grupos, não dos tokens pessoais do contractor. Renomear a conta não bloqueia nada de forma durável — todas as memberships e grants continuariam anexados a ela.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-041",
    domainCode: 7,
    stem: `A global company syncs its Databricks groups from its identity provider using automatic identity management. The group data-latam is a nested member of the corporate group data-global, which holds SELECT on the catalog analytics. A data engineer whose only group is data-latam runs a query against a table in analytics. What happens?`,
    options: [
      "The query fails: Databricks groups cannot be nested, so data-latam would have to be flattened into data-global before any grant can apply.",
      "The query succeeds: members of nested groups inherit the parent's permissions, so the SELECT granted to data-global applies to data-latam's members.",
      "The query fails: privileges granted to a group apply only to the users and service principals listed as its direct members.",
      "The query succeeds, but only because Unity Catalog automatically duplicates the parent's grant onto every child group at the moment the nesting is created.",
    ],
    correctIndex: 1,
    explanationEn: `Databricks account groups support nesting, and permissions assigned to a parent group apply to everyone who belongs to it, whether directly or through nested child groups. With automatic identity management, Databricks fetches transitive memberships from the identity provider: the engineer in data-latam is recognized as a member of data-global too, so the SELECT granted to data-global authorizes the query. Nothing is copied onto child groups — a SHOW GRANTS on data-latam would list no privileges, because the single grant lives on the parent. Groups can therefore be nested without flattening them, and grants do not apply only to directly listed members.`,
    explanationPt: `Os grupos de conta do Databricks suportam aninhamento, e as permissões atribuídas a um grupo pai valem para todos que pertencem a ele, direta ou indiretamente, por meio de grupos filhos aninhados. Com o automatic identity management, o Databricks busca as memberships transitivas no provedor de identidade: o engenheiro de data-latam também é reconhecido como membro de data-global, então o SELECT concedido a data-global autoriza a query. Nada é copiado para os grupos filhos — um SHOW GRANTS em data-latam não listaria privilégios, porque o grant único vive no grupo pai. Grupos podem, portanto, ser aninhados sem achatamento, e os grants não valem apenas para os membros diretos listados.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-042",
    domainCode: 7,
    stem: `Finance needs a monthly cost breakdown of Databricks usage by team for chargeback, computed from the lakehouse itself rather than from invoices or the cloud provider's console.

Which approach meets this?`,
    options: [
      "Query system.billing.usage, filtering by workspace and tags, aggregating DBUs and dollars per team",
      "Parse the monthly PDF invoices with a notebook and load the results into a Delta table",
      "Read the cloud provider's billing export, which already itemizes Databricks DBUs per team and workspace",
      "Enable a workspace setting that emails each team leader their DBU total every month",
    ],
    correctIndex: 0,
    explanationEn: `The system tables include billing data: system.billing.usage records usage by SKU, workspace, and tags — including custom tags applied to clusters and jobs — with DBU quantities and dollar amounts, so a monthly chargeback report is a plain SQL aggregation over governed data. Parsing PDF invoices is manual and fragile; the cloud provider's export shows infrastructure costs, not the platform's DBU-level detail; and there is no per-team email setting that replaces an auditable, queryable usage record.`,
    explanationPt: `As system tables incluem dados de billing: a system.billing.usage registra o uso por SKU, workspace e tags — inclusive tags customizadas aplicadas a clusters e jobs — com quantidades de DBU e valores em dólar, de modo que um relatório mensal de chargeback é uma simples agregação SQL sobre dados governados. Parsear faturas em PDF é manual e frágil; o export do provedor de nuvem mostra custos de infraestrutura, não o detalhe em nível de DBU da plataforma; e não existe configuração de e-mail por time que substitua um registro de uso auditável e consultável.`,
    referenceUrl: "https://docs.databricks.com/aws/en/admin/system-tables",
    referenceTitle: "System tables reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-043",
    domainCode: 7,
    stem: `A company runs one Unity Catalog metastore shared by several business domains. Security policy requires that every managed table created in the finance catalog keeps its data files under a storage prefix dedicated to finance (s3://acme-managed/finance/), instead of the metastore root storage used by other domains. How should the platform team configure this?`,
    options: [
      "Spin up a second metastore whose root storage is the finance prefix, because managed storage locations exist only at the metastore level.",
      "Leave the catalog as it is, because managed tables in every catalog are always written to the metastore's root storage location and can never use anything else.",
      "Create the finance catalog with MANAGED LOCATION 's3://acme-managed/finance/', overriding the metastore root storage for that catalog's managed tables.",
      "Create the finance tables as external tables with LOCATION under the finance prefix, because managed locations per catalog work only with external tables.",
    ],
    correctIndex: 2,
    explanationEn: `Unity Catalog lets managed storage be configured hierarchically: the metastore has a root storage location, and a catalog or schema can override it with its own managed location. CREATE CATALOG finance MANAGED LOCATION 's3://acme-managed/finance/' — the path must be covered by an external location, and the creator needs CREATE MANAGED STORAGE on it — places every managed table of that catalog under the finance prefix. A second metastore is not the answer: there is one metastore per region, and catalog-level managed locations exist precisely for this kind of domain separation. The metastore root is only the default, not a mandate. And switching to external tables is unnecessary, because the catalog managed location exists exactly so managed tables land in a dedicated prefix.`,
    explanationPt: `O Unity Catalog permite configurar o storage gerenciado de forma hierárquica: o metastore tem um root storage, e um catálogo ou schema pode sobrescrevê-lo com seu próprio managed location. CREATE CATALOG finance MANAGED LOCATION 's3://acme-managed/finance/' — o caminho precisa estar coberto por um external location, e quem cria precisa de CREATE MANAGED STORAGE nele — faz toda tabela gerenciada desse catálogo gravar sob o prefixo de finance. Um segundo metastore não é a resposta: há um metastore por região, e os managed locations em nível de catálogo existem justamente para essa separação por domínio. O root do metastore é apenas o default, não uma obrigação. E migrar para tabelas externas é desnecessário, porque o managed location por catálogo existe exatamente para que tabelas gerenciadas caiam em um prefixo dedicado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S7-044",
    domainCode: 7,
    stem: `During an architecture review, a new data engineer must explain how three Unity Catalog objects work together for cloud storage: the object that holds the IAM credential, the object that registers a storage path for external tables, and the object that gives notebooks governed access to files. Which explanation is correct?`,
    options: [
      "Volumes have replaced external locations entirely, so a single volume type now covers both the registration of storage paths for tables and practical access to files.",
      "Storage credentials point to the catalogs that use them and carry the privilege to run queries against those catalogs.",
      "External locations store the IAM credentials of every external table registered under them, one credential per table.",
      "Storage credentials hold the IAM credential, external locations register a storage path referencing it, and volumes give governed access to files.",
    ],
    correctIndex: 3,
    explanationEn: `In Unity Catalog, a storage credential is the object that encapsulates the cloud authentication — an IAM role or similar — used to reach a path in cloud storage. An external location registers a specific storage path and references the storage credential that authorizes access to it; external tables are created on paths covered by external locations. A volume is the governed object that gives notebooks and pipelines practical access to files, with READ VOLUME and WRITE VOLUME privileges. External locations have not been replaced by volumes — they remain the object that registers paths for external tables — and storage credentials never point to catalogs or carry query privileges; they only hold cloud authentication.`,
    explanationPt: `No Unity Catalog, a storage credential é o objeto que encapsula a autenticação de nuvem — um IAM role ou similar — usada para alcançar um caminho no cloud storage. Um external location registra um caminho específico de storage e referencia a storage credential que autoriza o acesso a ele; tabelas externas são criadas em caminhos cobertos por external locations. Um volume é o objeto governado que dá a notebooks e pipelines acesso prático aos arquivos, com os privilégios READ VOLUME e WRITE VOLUME. External locations não foram substituídos por volumes — continuam sendo o objeto que registra caminhos para tabelas externas — e as storage credentials nunca apontam para catálogos nem carregam privilégios de consulta; elas apenas guardam a autenticação de nuvem.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S7-045",
    domainCode: 7,
    stem: `A Lakeflow Job writes manifest files directly to the cloud storage path s3://acme-dropzone/manifests/, which is registered in Unity Catalog as the external location acme_dropzone. The job runs under the service principal loader-sp and does not write through any table or volume. Which grant authorizes the job's writes?`,
    options: [
      "Grant the service principal WRITE FILES on the external location acme_dropzone, which authorizes direct writes on the registered path.",
      "Grant the service principal SELECT on the external location acme_dropzone, which is the standard read privilege for governed data objects.",
      "Grant the service principal WRITE VOLUME on the external location acme_dropzone, because volume privileges cover its registered storage paths.",
      "Grant the service principal nothing, because Unity Catalog cannot authorize direct writes to a storage path outside tables and volumes.",
    ],
    correctIndex: 0,
    explanationEn: `External locations have their own privilege set, which includes READ FILES and WRITE FILES — exactly the privileges for reading and writing data directly on the registered cloud path, without going through a table or a volume. GRANT WRITE FILES ON EXTERNAL LOCATION acme_dropzone to the service principal therefore authorizes the job's manifest writes. SELECT is not an external location privilege; it is a data privilege for governed tables and views. WRITE VOLUME applies to volumes, a different securable. And direct path access is not impossible — it is what READ FILES and WRITE FILES are for; READ FILES, for instance, is what COPY INTO and Auto Loader require when they read from a governed path.`,
    explanationPt: `External locations têm seu próprio conjunto de privilégios, que inclui READ FILES e WRITE FILES — exatamente os privilégios para ler e escrever dados diretamente no caminho de nuvem registrado, sem passar por tabela ou volume. Conceder GRANT WRITE FILES ON EXTERNAL LOCATION acme_dropzone ao service principal autoriza, portanto, a escrita dos manifests pelo job. SELECT não é privilégio de external location; é um privilégio de dados para tabelas e views governadas. WRITE VOLUME aplica-se a volumes, um securable diferente. E o acesso direto ao caminho não é impossível — é para isso que READ FILES e WRITE FILES existem; o READ FILES, por exemplo, é o que o COPY INTO e o Auto Loader exigem quando leem de um caminho governado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/",
    referenceTitle: "Manage privileges in Unity Catalog — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S7-046",
    domainCode: 7,
    stem: `During a security review, an auditor asks what the Databricks audit trail actually captures, expecting it to log only SQL queries. The platform lead must answer based on the documented coverage of the audit log system table (system.access.audit). Which answer is accurate?`,
    options: [
      "Only SELECT statements are captured; every other kind of event, including permission changes and object creation, is out of the audit trail's scope.",
      "Only sign-in events are captured; queries run against the lakehouse are recorded solely in query history, never in audit logs.",
      "A broad range of events is captured: logins and logouts, queries, permission changes such as grants, and object changes, each with the acting principal and timestamp.",
      "Permission changes are not captured; audit events record queries and logins but never grants or revokes on governed objects.",
    ],
    correctIndex: 2,
    explanationEn: `The audit log system table records platform activity comprehensively: authentication events such as logins and logouts, the SQL statements that run, permission changes (for example, updatePermissions events under the unityCatalog service), and object lifecycle changes such as creating, updating, or deleting tables. Each event carries the acting principal in user_identity, the timestamp in event_time, and the request parameters. The trail is not limited to SELECT statements — writes, DDL, and administrative commands are logged too — and it is not limited to sign-ins; queries appear both in query history and in the audit trail. Permission changes are exactly the kind of security-relevant event the audit trail exists to capture.`,
    explanationPt: `A audit log system table registra a atividade da plataforma de forma abrangente: eventos de autenticação como logins e logouts, os comandos SQL executados, mudanças de permissão (por exemplo, eventos updatePermissions no serviço unityCatalog) e alterações no ciclo de vida dos objetos, como criar, atualizar ou excluir tabelas. Cada evento traz o principal responsável em user_identity, o timestamp em event_time e os parâmetros da requisição. A trilha não se limita a comandos SELECT — writes, DDL e comandos administrativos também são registrados — e não se limita a logins; as queries aparecem tanto no query history quanto na trilha de auditoria. Mudanças de permissão são exatamente o tipo de evento sensível para o qual a trilha de auditoria existe.`,
    referenceUrl: "https://docs.databricks.com/aws/en/admin/system-tables/audit-logs",
    referenceTitle: "Audit log system table reference — Databricks Docs",
    difficulty: "EASY",
  },
];

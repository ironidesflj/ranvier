import type { SeedQuestion } from "./types";

/**
 * Section 3 — Data Transformation and Modeling (22%)
 * Target: 25 questions total (S3-001 .. S3-025).
 */
export const s3Questions: SeedQuestion[] = [
  {
    key: "S3-001",
    domainCode: 3,
    stem: `A data engineer is building the silver layer of a medallion pipeline. The bronze table catalog.sales.bronze_customers contains a nullable STRING column named region. For catalog.sales.silver_customers, every customer row must be kept, but region must never be NULL in silver — rows without a region must show the value "Unknown".

\`\`\`python
bronze = spark.read.table("catalog.sales.bronze_customers")
silver = <cleaning step>
silver.write.saveAsTable("catalog.sales.silver_customers")
\`\`\`

Which cleaning step meets this requirement?`,
    options: [
      "silver = bronze.fillna('Unknown', subset=['region'])",
      "silver = bronze.fillna(0, subset=['region'])",
      "silver = bronze.dropna(subset=['region'])",
      "silver = bronze.withColumn('region', lit('Unknown'))",
    ],
    correctIndex: 0,
    explanationEn: `fillna with subset=['region'] replaces NULLs with 'Unknown' in that one column and keeps every row. fillna(0) applies only to numeric columns — an integer value never fills a STRING column, so region would stay NULL. dropna deletes the rows whose region is NULL, breaking the keep-every-row requirement. withColumn('region', lit('Unknown')) overwrites the column for all rows, wiping out the real region values. The dictionary form fillna({'region': 'Unknown'}) is an equivalent alternative.`,
    explanationPt: `A chamada fillna com subset=['region'] substitui os NULLs por 'Unknown' apenas nessa coluna e mantém todas as linhas. fillna(0) só se aplica a colunas numéricas — um valor inteiro nunca preenche uma coluna STRING, e region continuaria NULL. dropna remove as linhas com region NULL, violando o requisito de manter todos os clientes. Já withColumn('region', lit('Unknown')) sobrescreve a coluna em todas as linhas, apagando os valores reais de região. A forma de dicionário fillna({'region': 'Unknown'}) é uma alternativa equivalente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-002",
    domainCode: 3,
    stem: `The bronze table catalog.crm.bronze_contacts stores two email columns. primary_email is frequently NULL, and some of those rows have a usable secondary_email. The silver view must expose a single column contact_email that returns primary_email when it is not NULL, otherwise secondary_email, and otherwise the literal 'no-email@company.com'.

\`\`\`sql
SELECT customer_id,
       /* expression here */ AS contact_email
FROM catalog.crm.bronze_contacts
\`\`\`

Which expression implements this fallback logic?`,
    options: [
      "NULLIF(primary_email, secondary_email)",
      "COALESCE('no-email@company.com', primary_email, secondary_email)",
      "COALESCE(primary_email, secondary_email, 'no-email@company.com')",
      "NVL2(primary_email, secondary_email, 'no-email@company.com')",
    ],
    correctIndex: 2,
    explanationEn: `COALESCE returns its first non-NULL argument, so listing the columns from most to least preferred implements the fallback chain exactly. Placing the literal first breaks the logic: a non-NULL constant is always returned immediately, so every row would get 'no-email@company.com'. NULLIF(a, b) returns NULL only when the two arguments are equal — it is not a fallback function. NVL2(c1, c2, c3) returns c2 when c1 IS NOT NULL, which is the reverse of the requirement: it would return secondary_email whenever primary_email exists.`,
    explanationPt: `COALESCE retorna o primeiro argumento não nulo; portanto, listar as colunas da mais para a menos preferida implementa exatamente essa cadeia de fallback. Colocar a literal no início quebra a lógica: uma constante não nula é retornada imediatamente, e todas as linhas receberiam 'no-email@company.com'. NULLIF(a, b) devolve NULL apenas quando os dois argumentos são iguais — não é uma função de fallback. NVL2(c1, c2, c3) retorna c2 quando c1 NÃO é nulo, o inverso do requisito: retornaria secondary_email sempre que primary_email existisse.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-003",
    domainCode: 3,
    stem: `An events bronze table landed event_time as STRING values like '2026-03-14 09:30:00' and amount as STRING values like '125.50'. The silver table must standardize the types: event_time as TIMESTAMP and amount as DOUBLE, keeping the same column names and all other columns unchanged.

\`\`\`python
bronze = spark.read.table("catalog.ops.bronze_events")
silver = <type standardization step>
silver.write.saveAsTable("catalog.ops.silver_events")
\`\`\`

Which step standardizes the data types correctly?`,
    options: [
      "silver = bronze.withColumnRenamed('event_time', 'event_time_ts').withColumnRenamed('amount', 'amount_double').withColumnRenamed('cust', 'customer')",
      "bronze.withColumn('event_time', col('event_time').cast('timestamp')).withColumn('amount', col('amount').cast('double'))",
      "silver = bronze.select(col('event_time').cast('date'), col('amount').cast('double'))",
      "silver = bronze.withColumn('event_time', to_date('event_time'))",
    ],
    correctIndex: 1,
    explanationEn: `withColumn reusing the existing column name replaces that column in place while preserving every other column, and cast('timestamp') / cast('double') convert the ISO-style strings and decimal strings to the target types. Casting to DATE (or using to_date) truncates the time-of-day portion, losing 09:30:00, and to_date also leaves amount as STRING. withColumnRenamed only changes a column's name — the type would stay STRING. A select of just two cast columns would also drop the rest of the schema. This cast-inside-withColumn pattern is the standard bronze-to-silver type standardization step.`,
    explanationPt: `O withColumn reutilizando o nome existente substitui a coluna no lugar, preservando todas as demais, e cast('timestamp') / cast('double') convertem as strings em formato ISO e as strings decimais para os tipos-alvo. Converter para DATE (ou usar to_date) trunca a parte de hora, perdendo 09:30:00 — e to_date ainda deixaria amount como STRING. withColumnRenamed apenas altera o nome da coluna: o tipo continuaria STRING. Um select com apenas duas colunas convertidas também descartaria o restante do schema. Esse padrão de cast dentro do withColumn é a etapa padrão de padronização de tipos entre bronze e silver.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-004",
    domainCode: 3,
    stem: `During ingestion design, a junior engineer proposes dropping rows with NULLs and casting every column to its final type before writing to the bronze table, arguing that the silver pipelines would then "just work" with no cleaning code at all. A senior engineer objects, citing the responsibilities of the medallion architecture layers.

Where does this cleaning work belong, and why?`,
    options: [
      "In the bronze layer, because bronze must store only validated, strongly typed data before any table is published",
      "In the gold layer, because only gold tables are schema-enforced in Unity Catalog",
      "In the source system, because the medallion architecture requires clean data before any ingestion",
      "In the silver layer — bronze should keep raw data as landed so it can be replayed and audited",
    ],
    correctIndex: 3,
    explanationEn: `In the medallion architecture, bronze holds the raw data as it was ingested — replayable and auditable — so the organization can re-derive downstream layers whenever cleaning rules evolve. Cleaning, NULL handling, type standardization, and validation are silver responsibilities, producing the validated, conformed tables that gold then enriches and aggregates for analytics. Dropping rows or casting in bronze would silently destroy the raw history. Gold is not the schema-enforcement point, and Unity Catalog governs tables in all three layers equally.`,
    explanationPt: `Na arquitetura medallion, o bronze guarda os dados brutos exatamente como foram ingeridos — reproduzíveis e auditáveis — para que a organização possa reconstruir as camadas seguintes sempre que as regras de limpeza mudarem. Limpeza, tratamento de nulos, padronização de tipos e validação são responsabilidades do silver, que produz as tabelas validadas e conformadas que o gold então enriquece e agrega para analytics. Descartar linhas ou converter tipos no bronze destruiria silenciosamente o histórico bruto. O gold não é o ponto de aplicação de schema, e o Unity Catalog governa tabelas nas três camadas igualmente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/lakehouse/medallion",
    referenceTitle: "Medallion lakehouse architecture — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-005",
    domainCode: 3,
    stem: `A silver table of customer contacts is usable as long as a customer can be reached by at least one channel. Rows where BOTH email and phone are NULL must be removed. Rows where only one of the two is NULL must be kept, with the NULL value preserved in place.

\`\`\`python
bronze = spark.read.table("catalog.crm.bronze_contacts")
silver = <drop rule>
\`\`\`

Which dropna call implements this rule?`,
    options: [
      "silver = bronze.dropna(how='any', subset=['email', 'phone'])",
      "silver = bronze.dropna(how='all', subset=['email', 'phone'])",
      "silver = bronze.dropna(subset=['email'])",
      "silver = bronze.dropna(thresh=2)",
    ],
    correctIndex: 1,
    explanationEn: `With subset=['email', 'phone'], how='all' removes a row only when every listed column is NULL — exactly the "both missing" rule. how='any', which is also the default, removes a row as soon as one listed column is NULL, discarding customers reachable through a single channel. dropna(subset=['email']) only protects rows that have a non-NULL email and ignores phone entirely. thresh=2 counts non-NULL values across all columns, so a row with NULL email and phone but other populated fields would still survive.`,
    explanationPt: `Com subset=['email', 'phone'], how='all' remove a linha somente quando todas as colunas listadas são NULL — exatamente a regra "os dois ausentes". how='any', que também é o padrão, remove a linha assim que qualquer coluna listada for NULL, descartando clientes alcançáveis por um único canal. dropna(subset=['email']) protege apenas quem tem email não nulo e ignora completamente o phone. Já thresh=2 conta valores não nulos em todas as colunas, então uma linha com email e phone nulos, mas outros campos preenchidos, sobreviveria.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-006",
    domainCode: 3,
    stem: `While validating a silver notebook, an engineer joins two small bronze tables to check key overlap before promoting the pipeline:

\`\`\`python
payments = spark.read.table("catalog.fin.bronze_payments")   # 3 rows: txn 101, 202, 303
refunds   = spark.read.table("catalog.fin.bronze_refunds")   # 4 rows: txn 202, 303, 404, 505

joined = payments.join(refunds, "txn_id", "inner")
print(joined.count())
\`\`\`

What number is printed, and why?`,
    options: [
      "2 — only the txn_id values present in both tables survive the inner join",
      "3 — all payments are preserved because the left table drives an inner join",
      "4 — all refunds are preserved because the right table drives an inner join",
      "7 — an inner join stacks both inputs and removes nothing",
    ],
    correctIndex: 0,
    explanationEn: `An inner join returns only the rows whose join key appears on both sides. Only txn_id 202 and 303 exist in both tables, so the result has 2 rows. The idea that the "left" or "right" table drives the join describes left and right outer joins, which preserve unmatched rows from one side (3 or 4 rows here). Inner joins never stack their inputs — that is union behavior, and 7 is the naive 3+4 sum that ignores key matching.`,
    explanationPt: `Um inner join retorna apenas as linhas cuja chave de junção existe nos dois lados. Somente os txn_id 202 e 303 aparecem nas duas tabelas, então o resultado tem 2 linhas. A ideia de que a tabela "da esquerda" ou "da direita" conduz a junção descreve left e right outer joins, que preservam as linhas sem correspondência de um dos lados (3 ou 4 linhas aqui). Inner joins nunca empilham as entradas — isso é comportamento de union, e 7 é a soma ingênua 3+4 que ignora o casamento de chaves.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-007",
    domainCode: 3,
    stem: `A daily silver job joins about 1 million sales rows to dim_prices, which holds one row per (product_id, store_id) because prices vary by store. After the join runs, the silver table contains about 3 million rows and revenue totals are inflated. The suspicious line:

\`\`\`python
silver = (sales
    .join(dim_prices, "product_id")
    .withColumn("revenue", col("qty") * col("price")))
\`\`\`

What is the most likely cause, and the correct fix?`,
    options: [
      "The sales fact contains duplicate transactions — call dropDuplicates() with no subset before the join",
      "Spark picked the wrong physical join strategy — force a broadcast join with .hint('broadcast') so each sale matches exactly one price",
      "The join key is not unique in dim_prices, so sales fan out one row per store — join on both product_id and store_id",
      "dim_prices contains NULL prices that replicate rows during the join — filter out NULL prices before joining",
    ],
    correctIndex: 2,
    explanationEn: `dim_prices is keyed by (product_id, store_id), so joining on product_id alone matches each sale to one dimension row per store that carries the product — a sale of a product priced in 3 stores is replicated 3 times, inflating both row counts and sums. Adding both keys to the join restores the intended many-to-one relationship. dropDuplicates() with no subset only removes fully identical rows and cannot undo fan-out. A broadcast hint changes the physical strategy, not how many rows match. NULL prices would lower revenue; they never multiply rows.`,
    explanationPt: `dim_prices tem chave (product_id, store_id); unir apenas por product_id casa cada venda com uma linha da dimensão por loja que vende o produto — uma venda de um item precificado em 3 lojas é replicada 3 vezes, inflando contagens e somas. Incluir as duas chaves na junção restaura a relação muitos-para-um desejada. dropDuplicates() sem subset remove apenas linhas totalmente idênticas e não desfaz a multiplicação. Um hint de broadcast muda a estratégia física, não quantas linhas casam. Preços nulos reduziriam a receita; nunca multiplicam linhas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-008",
    domainCode: 3,
    stem: `A nightly job joins a 900 GB transactions DataFrame to a 250 MB currency_rates dimension on currency_code and then aggregates by market. The Spark UI shows a SortMergeJoin whose shuffle of the transactions data dominates the runtime. The rates table fits comfortably in every executor's memory.

\`\`\`python
joined = txns.join(rates, "currency_code")
\`\`\`

Which change most directly avoids shuffling the large DataFrame for this join?`,
    options: [
      "Increase spark.sql.shuffle.partitions so each task shuffles a smaller slice of the transactions data",
      "Call txns.cache() before the join so Spark reuses a shuffle-free copy of the transactions data",
      "Run OPTIMIZE on the currency_rates table to compact its files before the join",
      "Force a broadcast hash join by wrapping the small side: txns.join(broadcast(rates), 'currency_code')",
    ],
    correctIndex: 3,
    explanationEn: `A broadcast hash join ships the small dimension to every executor and streams the large side without shuffling it for the join — the same idea behind spark.sql.autoBroadcastJoinThreshold, whose 10 MB default would never auto-broadcast a 250 MB table, so the explicit broadcast() hint is needed. Raising spark.sql.shuffle.partitions still shuffles all 900 GB, just in smaller pieces. cache() avoids recomputation, not data movement. OPTIMIZE compacts Delta files to speed up reads; it has no effect on join shuffling.`,
    explanationPt: `O broadcast hash join envia a dimensão pequena para todos os executors e processa o lado grande em streaming, sem movê-lo para o shuffle — a mesma ideia do spark.sql.autoBroadcastJoinThreshold, cujo padrão de 10 MB jamais faria broadcast automático de uma tabela de 250 MB; por isso o hint broadcast() explícito é necessário. Aumentar spark.sql.shuffle.partitions ainda embaralha os 900 GB, só em fatias menores. cache() evita recomputação, não movimento de dados. OPTIMIZE compacta arquivos Delta para acelerar leituras; não afeta o shuffle da junção.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-009",
    domainCode: 3,
    stem: `A marketing engineer needs every combination of customer segment (40 rows) and promo code (5,000 rows) for a campaign evaluation job, and writes:

\`\`\`python
result = segments.crossJoin(promos)
\`\`\`

The job will score every resulting pair once per night. What does this produce, and what should the engineer keep in mind?`,
    options: [
      "A 200,000-row Cartesian product (40 x 5,000) — fine here, but cross joins grow as rows-times-rows",
      "5,040 rows — crossJoin stacks both DataFrames the same way a union does",
      "An error, because cross joins require setting spark.sql.crossJoin.enabled to true first",
      "Only the rows where a segment value also appears in the promos DataFrame — crossJoin applies an implicit equality filter",
    ],
    correctIndex: 0,
    explanationEn: `crossJoin performs a Cartesian product: every segment paired with every promo, 40 x 5,000 = 200,000 rows — exactly what this campaign evaluation needs. The caveat is cost: the result size is the product of the inputs, so cross joins on large tables (2 million x 10,000 rows = 20 billion) are almost always a design mistake. crossJoin never stacks rows — that is union behavior (5,040 here) — and it has no matching predicate at all. The spark.sql.crossJoin.enabled flag is a legacy setting that no longer exists in modern Spark; explicit crossJoin() needs no special configuration.`,
    explanationPt: `crossJoin executa um produto cartesiano: cada segmento combinado com cada promoção, 40 x 5.000 = 200.000 linhas — exatamente o que esse job de avaliação de campanha precisa. A ressalva é o custo: o tamanho do resultado é o produto das entradas, então cross joins em tabelas grandes (2 milhões x 10.000 = 20 bilhões de linhas) quase sempre indicam erro de desenho. crossJoin nunca empilha linhas — isso é comportamento de union (5.040 aqui) — e não aplica predicado de casamento algum. O flag spark.sql.crossJoin.enabled é um ajuste legado que não existe mais no Spark atual; o crossJoin() explícito não exige configuração especial.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-010",
    domainCode: 3,
    stem: `Two regional extracts can overlap: the same order row may appear in both files. An engineer combines them expecting SQL UNION semantics, where duplicate rows collapse into one:

\`\`\`python
combined = extract_eu.union(extract_us)
\`\`\`

The result still contains duplicated rows. Why, and how should the code be fixed?`,
    options: [
      "DataFrame.union() deduplicates only when both sides have identical column names — rename the columns first",
      "union() is UNION ALL by design — rows stack positionally; append .distinct() to deduplicate",
      "unionAll() is the deduplicating variant — switch to extract_eu.unionAll(extract_us)",
      "union() runs asynchronously, so duplicates appear until the result is materialized — call .cache() and count() first",
    ],
    correctIndex: 1,
    explanationEn: `Spark's DataFrame.union is explicitly equivalent to SQL UNION ALL: it concatenates rows and keeps duplicates, matching columns by position rather than by name. unionAll() is only a deprecated alias with exactly the same non-deduplicating behavior. In SQL, plain UNION without ALL is the deduplicating form; in PySpark you add .distinct() or dropDuplicates() after the union to get that effect. Renaming columns is irrelevant, and caching has nothing to do with duplicate removal.`,
    explanationPt: `O DataFrame.union do Spark é explicitamente equivalente ao UNION ALL do SQL: concatena linhas e mantém duplicatas, casando as colunas por posição, e não por nome. unionAll() é apenas um alias descontinuado com exatamente o mesmo comportamento, sem deduplicação. No SQL, UNION sem ALL é a forma que deduplica; em PySpark, adiciona-se .distinct() ou dropDuplicates() depois do union para obter esse efeito. Renomear colunas é irrelevante, e cache não tem qualquer relação com a remoção de duplicatas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-011",
    domainCode: 3,
    stem: `Building catalog.sales.silver_customers from bronze, an engineer must: (1) split the STRING column full_name on the single space character into two new STRING columns, first_name and last_name; (2) drop full_name and the PII column ssn; (3) rename cust_id to customer_id.

A teammate proposes:

\`\`\`python
silver = (bronze
    .withColumn("first_name", split(col("full_name"), " "))
    .withColumn("last_name", split(col("full_name"), " "))
    .drop("full_name", "ssn")
    .withColumnRenamed("cust_id", "customer_id"))
\`\`\`

What is wrong with this proposal?`,
    options: [
      "Nothing is wrong — the chain meets all three requirements as written",
      "drop() cannot remove two columns in a single call — full_name and ssn must be dropped in separate drop() calls",
      "split() returns an ARRAY, so the new columns would hold arrays — use .getItem(0) and .getItem(1)",
      "withColumnRenamed('cust_id', 'customer_id') renames in the wrong direction — the arguments are (new, existing)",
    ],
    correctIndex: 2,
    explanationEn: `split(col, pattern) produces an ARRAY<STRING> column, so first_name and last_name would each contain a whole array rather than a string; .getItem(0) and .getItem(1) extract the individual elements (array subscripting works as well). drop('full_name', 'ssn') legitimately removes several columns in one call. withColumnRenamed takes (existing, new), so ('cust_id', 'customer_id') is the correct direction. The remaining steps are fine, which makes the subtle array bug the only real defect in the proposal.`,
    explanationPt: `split(col, padrão) gera uma coluna ARRAY<STRING>; portanto first_name e last_name guardariam um array inteiro, e não uma string. .getItem(0) e .getItem(1) extraem os elementos individuais (a indexação do array também funciona). drop('full_name', 'ssn') remove legitimamente várias colunas em uma única chamada. withColumnRenamed recebe (existente, novo), então ('cust_id', 'customer_id') está na direção correta. As demais etapas estão certas — o que torna o bug sutil do array o único defeito real da proposta.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-012",
    domainCode: 3,
    stem: `The bronze table catalog.web.bronze_search stores an ARRAY<STRING> column tags on each search event. For tag-level analytics, the silver table needs one row per (event_id, tag) pair — an event carrying three tags becomes three rows.

\`\`\`sql
SELECT event_id, /* expression */ AS tag
FROM catalog.web.bronze_search
\`\`\`

Which expression produces one row per array element?`,
    options: [
      "explode(tags)",
      "flatten(tags)",
      "collect_list(tags)",
      "array_distinct(tags)",
    ],
    correctIndex: 0,
    explanationEn: `explode is a generator function: used in a SELECT list, it emits one output row per element of the array — exactly the one-row-per-tag shape required (and it drops rows whose array is empty or NULL). flatten merges a nested array of arrays into a single array within the same row. collect_list is an aggregate that works in the opposite direction, collapsing many rows into one array. array_distinct removes duplicate elements but keeps the result in a single row.`,
    explanationPt: `explode é uma função geradora: usada na lista de SELECT, ela emite uma linha de saída por elemento do array — exatamente o formato de uma linha por tag exigido (e descarta as linhas cujo array é vazio ou NULL). flatten mescla um array aninhado de arrays em um único array, dentro da mesma linha. collect_list é uma agregação que funciona na direção oposta: colapsa várias linhas em um único array. array_distinct remove elementos duplicados, mas mantém tudo em uma única linha.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-013",
    domainCode: 3,
    stem: `A silver pipeline must exclude cancelled orders but keep every other row, including orders whose status is still NULL because they are pending manual review. After running:

\`\`\`python
silver = bronze.filter(col("status") != "CANCELLED")
\`\`\`

QA reports that 612 rows are missing from silver — precisely the rows with NULL status. Why did this happen, and what is the correct fix?`,
    options: [
      "filter() silently ignores rows with NULL in the filtered column — .where() handles NULL predicates correctly, so switch to .where()",
      "The Spark reader dropped the NULL statuses at load time — reload the table with .option('mode', 'PERMISSIVE')",
      "Fill the NULLs before filtering: bronze.fillna('UNKNOWN', subset=['status']) makes every row comparable, so the filter keeps them",
      "The predicate is NULL for NULL statuses and filter() keeps only true — add an isNull() branch or a null-safe operator",
    ],
    correctIndex: 3,
    explanationEn: `Spark uses three-valued logic: comparing NULL != 'CANCELLED' yields NULL, not true, and filter keeps only rows where the predicate evaluates to true — so the NULL-status rows disappear. The fix is an explicit null branch, col('status').isNull() | (col('status') != 'CANCELLED'), or the null-safe operator <=> (eqNullSafe). .where() is a pure alias of filter() and behaves identically. PERMISSIVE mode concerns malformed records during file parsing, not NULLs already stored. fillna would keep the rows but would silently overwrite NULL with a fake status, masking missingness.`,
    explanationPt: `O Spark usa lógica de três valores: comparar NULL != 'CANCELLED' resulta em NULL, e não em true, e o filter mantém apenas as linhas cujo predicado avalia como verdadeiro — por isso as linhas com status NULL desaparecem. A correção é um branch explícito de nulo, col('status').isNull() | (col('status') != 'CANCELLED'), ou o operador null-safe <=> (eqNullSafe). .where() é um simples alias de filter() e se comporta de forma idêntica. O modo PERMISSIVO trata registros corrompidos no parsing de arquivos, não nulos já armazenados. fillna manteria as linhas, mas sobrescreveria NULL por um status falso, mascarando a ausência.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-014",
    domainCode: 3,
    stem: `bronze_orders accumulates re-delivered files: the same order_id appears multiple times with different ingested_at values, and silver must keep exactly the most recent row per order. A teammate proposes:

\`\`\`python
from pyspark.sql.functions import col

latest = (bronze
    .orderBy(col("ingested_at").desc())
    .dropDuplicates(["order_id"]))
\`\`\`

What is the correct assessment of this proposal?`,
    options: [
      "The proposal is correct — orderBy(col('ingested_at').desc()) guarantees that dropDuplicates(['order_id']) keeps the newest row per order, because the sort carries over",
      "dropDuplicates(['order_id']) keeps an arbitrary row, ignoring the sort — use row_number() over a window ordered by ingested_at DESC, keeping rn = 1",
      "dropDuplicates(['order_id']) is missing columns — listing every column of the table would make it keep only the latest row",
      "Replace dropDuplicates(['order_id']) with distinct(), which keeps the last row encountered after an orderBy",
    ],
    correctIndex: 1,
    explanationEn: `dropDuplicates(subset) collapses rows that share the same subset values, but which row survives is non-deterministic — Spark keeps an arbitrary one, and a preceding orderBy does not bind that choice because the optimizer is free to reorder the plan. The deterministic pattern is row_number() over Window.partitionBy('order_id').orderBy(desc('ingested_at')), filtered to rn = 1. Listing all columns (or using distinct()) would only remove rows that are fully identical across every column, which re-delivered rows with different timestamps are not.`,
    explanationPt: `dropDuplicates(subset) colapsa as linhas que compartilham os mesmos valores do subset, mas qual delas sobrevive é não determinístico — o Spark mantém uma linha arbitrária, e um orderBy anterior não garante a escolha, porque o otimizador pode reordenar o plano. O padrão determinístico é row_number() em Window.partitionBy('order_id').orderBy(desc('ingested_at')), filtrando rn = 1. Listar todas as colunas (ou usar distinct()) removeria apenas linhas totalmente idênticas em todas as colunas — o que as linhas reenviadas com timestamps diferentes não são.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-015",
    domainCode: 3,
    stem: `While validating a silver table, an engineer wants a one-call profile of the numeric column amount: count, mean, standard deviation, min, max, and the approximate 25th, 50th, and 75th percentiles — without writing any custom aggregation code.

Which DataFrame method returns all of those statistics?`,
    options: [
      "df.describe('amount')",
      "df.explain()",
      "df.printSchema()",
      "df.summary()",
    ],
    correctIndex: 3,
    explanationEn: `df.summary() returns count, mean, stddev, min, the approximate 25%, 50%, and 75% percentiles, and max — and it even accepts custom percentiles, such as .summary('10%', '90%'). describe() covers only count, mean, stddev, min, and max, with no quartiles at all. explain() prints the query plan and printSchema() prints the schema — neither computes statistics. summary() is therefore the right quick-profiling step when validating silver data before promotion.`,
    explanationPt: `df.summary() retorna count, mean, stddev, min, os percentis aproximados de 25%, 50% e 75% e o max — e ainda aceita percentis customizados, como .summary('10%', '90%'). describe() cobre apenas count, mean, stddev, min e max, sem quartis. explain() imprime o plano da consulta e printSchema() imprime o schema — nenhum deles calcula estatísticas. summary() é, portanto, o passo certo de perfil rápido ao validar dados silver antes da promoção.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference/functions",
    referenceTitle: "PySpark function reference — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-016",
    domainCode: 3,
    stem: `A daily gold KPI reports distinct visitors per date over roughly 800 million events. The exact query below runs for about 25 minutes because counting distinct values forces a massive shuffle to bring all values of each key together:

\`\`\`sql
SELECT event_date, count(DISTINCT visitor_id) AS visitors
FROM catalog.web.silver_events
GROUP BY event_date;
\`\`\`

The dashboard tolerates an error of a few percent in exchange for a much faster query. Which function should replace count(DISTINCT ...)?`,
    options: [
      "count(visitor_id) — counting non-null rows is statistically equivalent to counting unique visitors",
      "size(collect_set(visitor_id)) — collecting the exact set of visitors per date",
      "approx_count_distinct(visitor_id) — a sketch-based approximate distinct count with far less shuffling",
      "percentile_approx(visitor_id, 0.5) — the approximate median visitor id",
    ],
    correctIndex: 2,
    explanationEn: `approx_count_distinct uses HyperLogLog sketches that are cheap to build per partition and merge, avoiding the all-to-all shuffle that exact count(DISTINCT) requires, at the cost of a small, configurable error (the rsd argument; default 0.05). count(visitor_id) counts non-null rows, not unique visitors. size(collect_set(...)) is exact but materializes entire sets in memory, making the shuffle even heavier. percentile_approx computes a median — a completely different statistic from cardinality.`,
    explanationPt: `approx_count_distinct usa sketches HyperLogLog, baratos de construir por partição e de mesclar, evitando o shuffle ponto a ponto que o count(DISTINCT) exato exige — ao custo de um pequeno erro configurável (o argumento rsd; padrão 0,05). count(visitor_id) conta linhas não nulas, não visitantes únicos. size(collect_set(...)) é exato, mas materializa conjuntos inteiros em memória, tornando o shuffle ainda mais pesado. percentile_approx calcula uma mediana — uma estatística completamente diferente de cardinalidade.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-017",
    domainCode: 3,
    stem: `Every night, catalog.ops.order_updates arrives with changed rows for existing order_id keys plus brand-new orders. catalog.ops.silver_orders must reflect the updates in place and contain the new orders — with no duplicate order_id values. All tables are Delta tables governed by Unity Catalog.

Which SQL statement is designed for this requirement?`,
    options: [
      "MERGE INTO catalog.ops.silver_orders AS t USING catalog.ops.order_updates AS s ON t.order_id = s.order_id WHEN MATCHED THEN UPDATE SET t.status = s.status, t.amount = s.amount WHEN NOT MATCHED THEN INSERT *",
      "INSERT INTO catalog.ops.silver_orders SELECT * FROM catalog.ops.order_updates",
      "DELETE FROM catalog.ops.silver_orders WHERE order_id IN (SELECT order_id FROM catalog.ops.order_updates); then INSERT INTO catalog.ops.silver_orders SELECT * FROM catalog.ops.order_updates",
      "CREATE OR REPLACE TABLE catalog.ops.silver_orders AS SELECT * FROM catalog.ops.silver_orders UNION ALL SELECT * FROM catalog.ops.order_updates",
    ],
    correctIndex: 0,
    explanationEn: `MERGE INTO is Delta Lake's upsert: rows matching on order_id are updated in place and unmatched source rows are inserted, atomically in a single statement — exactly the incremental synchronization pattern for silver tables. INSERT INTO blindly appends and would duplicate every changed order. DELETE followed by INSERT is two separate statements, leaving a non-atomic window plus extra rewrite cost. The UNION ALL rewrite stacks old and new rows, producing duplicate order_id values by construction.`,
    explanationPt: `MERGE INTO é o upsert do Delta Lake: as linhas que casam por order_id são atualizadas no lugar e as linhas da fonte sem correspondência são inseridas, de forma atômica, em uma única instrução — exatamente o padrão de sincronização incremental para tabelas silver. INSERT INTO apenas acrescenta e duplicaria cada pedido alterado. DELETE seguido de INSERT são duas instruções separadas, com uma janela não atômica e custo extra de reescrita. A reescrita com UNION ALL empilha linhas antigas e novas, gerando order_id duplicados por construção.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/merge",
    referenceTitle: "Merge data (Delta Lake upsert) — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-018",
    domainCode: 3,
    stem: `On a cluster with 4 workers, a silver aggregation over a 3 GB DataFrame shows 200 shuffle tasks in the Spark UI; most tasks process only a few megabytes, and scheduling overhead dominates the stage time. The team wants fewer, larger tasks. spark.sql.shuffle.partitions is at its default value.

Which statement is accurate?`,
    options: [
      "spark.default.parallelism sets the shuffle partition count for SQL aggregations — lower it to 32 on this cluster",
      "spark.sql.shuffle.partitions (default 200) sets the shuffle partition count — lower it or rely on AQE coalescing",
      "spark.sql.autoBroadcastJoinThreshold caps the byte size of each shuffle partition — raise it so partitions grow larger",
      "spark.executor.memory limits how many tasks an executor can schedule — increase it to reduce the task count",
    ],
    correctIndex: 1,
    explanationEn: `spark.sql.shuffle.partitions controls how many partitions Spark creates when shuffling data for joins and aggregations, and its default is 200 — oversized for a 3 GB aggregation on a 4-worker cluster, which is why tasks are tiny. Lowering it (or letting Adaptive Query Execution coalesce post-shuffle partitions automatically) yields fewer, larger tasks; after any such change, re-measure the stage in the Spark UI before tuning further. spark.default.parallelism affects RDD operations, not SQL shuffle stages. autoBroadcastJoinThreshold sizes broadcast joins, and executor memory affects per-task memory, not the task count.`,
    explanationPt: `spark.sql.shuffle.partitions controla quantas partições o Spark cria ao embaralhar dados para junções e agregações, e o padrão é 200 — grande demais para uma agregação de 3 GB em um cluster com 4 workers, e é por isso que as tarefas ficam minúsculas. Reduzi-lo (ou deixar o Adaptive Query Execution coalescer as partições pós-shuffle automaticamente) gera tarefas menos numerosas e maiores; após qualquer mudança, remedir o estágio no Spark UI antes de continuar ajustando. spark.default.parallelism afeta operações RDD, não estágios de shuffle SQL. autoBroadcastJoinThreshold dimensiona broadcast joins, e a memória do executor afeta a memória por tarefa, não a quantidade de tarefas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/optimizations/aqe",
    referenceTitle: "Adaptive query execution — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-019",
    domainCode: 3,
    stem: `A data engineer compares a query's static plan with its executed plan: a SortMergeJoin became a BroadcastHashJoin, and the number of shuffle partitions in a later stage dropped from 200 to 12 after the first stage completed. The team debates what caused these changes.

Which statement about Adaptive Query Execution (AQE) is correct?`,
    options: [
      "AQE caches intermediate results in Delta Lake and replays them whenever the same query re-runs",
      "AQE only optimizes queries whose source tables are cached in memory — uncached tables always use the static plan, with no runtime re-optimization",
      "AQE re-optimizes at runtime using statistics from completed stages, coalescing partitions and converting sort-merge to broadcast joins",
      "AQE is disabled by default and must be enabled per query with the .hint('aqe') table hint",
    ],
    correctIndex: 2,
    explanationEn: `AQE re-plans queries while they run, using accurate statistics collected at each shuffle or broadcast exchange: it dynamically coalesces post-shuffle partitions (200 down to 12 here), converts sort-merge joins into broadcast hash joins when one side turns out to be small enough, splits skewed partitions, and propagates empty relations. On Databricks it is enabled by default. It does not cache results — that is result caching or materialized views — it does not require cached sources, and it needs no per-query hint.`,
    explanationPt: `O AQE replaneja consultas durante a execução, usando estatísticas precisas coletadas a cada exchange de shuffle ou broadcast: ele coalesce dinamicamente as partições pós-shuffle (aqui, de 200 para 12), converte sort-merge joins em broadcast hash joins quando um lado se revela pequeno o bastante, divide partições enviesadas e propaga relações vazias. No Databricks, ele vem ativado por padrão. Ele não faz cache de resultados — isso é result caching ou materialized views —, não exige fontes em cache nem precisa de hint por consulta.`,
    referenceUrl: "https://docs.databricks.com/aws/en/optimizations/aqe",
    referenceTitle: "Adaptive query execution — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-020",
    domainCode: 3,
    stem: `A shuffle-heavy silver aggregation repeatedly fails with a java.lang.OutOfMemoryError raised inside an executor while tasks build their aggregation buffers; the driver stays healthy. The compute runs a worker configuration with a small heap per executor.

Which configuration change addresses the root cause most directly?`,
    options: [
      "Increase executor memory (larger worker type or higher spark.executor.memory)",
      "Increase spark.driver.memory so the driver can buffer bigger aggregation results",
      "Increase spark.sql.autoBroadcastJoinThreshold so the large table is broadcast to every executor",
      "Decrease spark.executor.memory so Spark automatically splits oversized tasks",
    ],
    correctIndex: 0,
    explanationEn: `The OOM is raised in the executor heap while aggregation buffers are being built, so the direct fix is more memory per executor — a larger worker type or a higher spark.executor.memory setting in the compute configuration — followed by re-measuring the run. Driver memory is irrelevant when the driver is healthy. Broadcasting the large side would copy it into every executor, multiplying memory pressure. Less executor memory would only make tasks fail sooner; splitting skewed tasks is a job for techniques like AQE, not for shrinking the heap.`,
    explanationPt: `O OOM ocorre no heap do executor enquanto os buffers de agregação são construídos; logo, a correção direta é mais memória por executor — um worker maior ou um spark.executor.memory mais alto na configuração do compute — seguida de uma nova medição da execução. A memória do driver é irrelevante quando o driver está saudável. Fazer broadcast da tabela grande a copiaria para todos os executors, multiplicando a pressão de memória. Menos memória por executor só faria as tarefas falharem mais cedo; dividir tarefas enviesadas é papel de técnicas como o AQE, não de reduzir o heap.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Compute configuration reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-021",
    domainCode: 3,
    stem: `A BI dashboard queries a gold aggregation — complex joins plus a GROUP BY over billions of rows — on every page load, and each query takes about 40 seconds. The data only needs to be current as of the last refresh, and the team refreshes analytics hourly. They want a Unity Catalog object whose results are precomputed and stored so that dashboard reads are fast.

Which object should the dashboard query?`,
    options: [
      "A standard view, because views persist query results between accesses",
      "A materialized view, refreshed hourly — precomputed and stored for fast reads",
      "A streaming table, because streaming tables precompute dashboard aggregations from batch tables",
      "A temporary view, because temporary views are visible to every BI session in the workspace",
    ],
    correctIndex: 1,
    explanationEn: `A materialized view caches the precomputed result of its query and refreshes it on a specified interval — hourly here — so dashboard reads scan stored data instead of re-running the heavy aggregation, trading a little freshness for speed. A standard view stores only the query text and recomputes everything on every access, changing nothing. A streaming table is for ingesting and transforming append-only streaming sources incrementally, not for serving batch aggregations. A temporary view is session-scoped and invisible to other BI sessions.`,
    explanationPt: `Uma materialized view armazena em cache o resultado pré-computado da consulta e a atualiza em um intervalo especificado — aqui, de hora em hora — de modo que as leituras do dashboard varrem dados armazenados em vez de reexecutar a agregação pesada, trocando um pouco de frescor por velocidade. Uma view comum guarda apenas o texto da consulta e recalcula tudo a cada acesso, sem mudança alguma. Uma streaming table serve para ingerir e transformar incrementalmente fontes append-only, não para servir agregações batch. Uma view temporária tem escopo de sessão e é invisível para as demais sessões de BI.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ldp/concepts/materialized-views",
    referenceTitle: "Materialized views (Lakeflow pipelines) — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-022",
    domainCode: 3,
    stem: `The analytics team wants catalog.analytics.daily_revenue as a precomputed daily revenue rollup over catalog.sales.gold_orders. The underlying aggregation is expensive, so recomputing it on every dashboard query is unacceptable; BI tools must read the object like a normal table, and the results must be refreshed automatically every night at 02:00 UTC with no manual steps.

Which set of statements achieves this?`,
    options: [
      "CREATE VIEW catalog.analytics.daily_revenue AS SELECT order_date, sum(amount) AS revenue FROM catalog.sales.gold_orders GROUP BY order_date; ALTER VIEW catalog.analytics.daily_revenue ADD SCHEDULE CRON '0 0 2 * * ?' AT TIME ZONE 'UTC';",
      "CREATE OR REFRESH STREAMING TABLE catalog.analytics.daily_revenue SCHEDULE CRON '0 0 2 * * ?' AT TIME ZONE 'UTC' AS SELECT order_date, sum(amount) AS revenue FROM catalog.sales.gold_orders GROUP BY order_date;",
      "CREATE TABLE catalog.analytics.daily_revenue TBLPROPERTIES ('refresh.cron' = '0 0 2 * * ?') AS SELECT order_date, sum(amount) AS revenue FROM catalog.sales.gold_orders GROUP BY order_date;",
      "CREATE MATERIALIZED VIEW catalog.analytics.daily_revenue SCHEDULE CRON '0 0 2 * * ?' AT TIME ZONE 'UTC' AS SELECT order_date, sum(amount) AS revenue FROM catalog.sales.gold_orders GROUP BY order_date;",
    ],
    correctIndex: 3,
    explanationEn: `A materialized view persists the precomputed rollup, and its SCHEDULE clause attaches the nightly refresh: the six-field quartz cron '0 0 2 * * ?' runs at 02:00 in the given time zone (ALTER MATERIALIZED VIEW ... ADD SCHEDULE works too). A view never stores results and takes no refresh schedule. A streaming table is the wrong object — it processes append-only streaming sources, not precomputed batch rollups. A CTAS table is computed exactly once; no table property refreshes it, so an external job would be needed.`,
    explanationPt: `Uma materialized view persiste o rollup pré-computado, e sua cláusula SCHEDULE anexa a atualização noturna: o cron quartz de seis campos '0 0 2 * * ?' executa às 02:00 no fuso informado (ALTER MATERIALIZED VIEW ... ADD SCHEDULE também funciona). Uma view nunca armazena resultados e não aceita agendamento de refresh. Uma streaming table é o objeto errado — processa fontes de streaming append-only, não rollups batch pré-computados. Uma tabela CTAS é calculada uma única vez; nenhuma table property a atualiza, sendo necessário um job externo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-create-materialized-view",
    referenceTitle: "CREATE MATERIALIZED VIEW — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-023",
    domainCode: 3,
    stem: `JSON event files land continuously in cloud storage. The gold table catalog.analytics.gold_site_events must be built incrementally inside a Lakeflow Spark Declarative Pipeline: every refresh must process only the newly arrived files, exactly once, with the pipeline tracking how far it has read.

Which declaration meets these requirements?`,
    options: [
      "CREATE MATERIALIZED VIEW catalog.analytics.gold_site_events AS SELECT * FROM STREAM(read_files('s3://company-raw/site_events/', format => 'json'));",
      "CREATE VIEW catalog.analytics.gold_site_events AS SELECT * FROM STREAM(read_files('s3://company-raw/site_events/', format => 'json'));",
      "CREATE TABLE catalog.analytics.gold_site_events AS SELECT * FROM read_files('s3://company-raw/site_events/', format => 'json'); — then a scheduled job runs INSERT INTO ... SELECT * FROM read_files(...) to append new files",
      "CREATE OR REFRESH STREAMING TABLE catalog.analytics.gold_site_events AS SELECT * FROM STREAM(read_files('s3://company-raw/site_events/', format => 'json'));",
    ],
    correctIndex: 3,
    explanationEn: `A streaming table is a Delta table with support for incremental processing, designed for append-only sources: it processes each input only once and uses checkpoint management, so every refresh resumes from stored progress and handles only new files — read_files must be wrapped in STREAM() for this mode. Materialized views are for precomputed batch transformations over upstream data, not for streaming file ingestion, and views store no data at all. A plain table plus INSERT has no checkpoint: each batch read of read_files re-reads everything, duplicating events unless you track files manually.`,
    explanationPt: `Uma streaming table é uma tabela Delta com suporte a processamento incremental, desenhada para fontes append-only: processa cada entrada apenas uma vez e usa gerenciamento de checkpoint, de modo que cada refresh retoma do progresso armazenado e trata somente os arquivos novos — para esse modo, read_files deve ser envolvida por STREAM(). Materialized views servem a transformações batch pré-computadas sobre dados a montante, não à ingestão de arquivos em streaming, e views não armazenam dado algum. Uma tabela comum mais INSERT não tem checkpoint: cada leitura batch de read_files relê tudo, duplicando eventos, a menos que o controle de arquivos seja manual.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ldp/concepts/streaming-tables",
    referenceTitle: "Streaming tables (Lakeflow pipelines) — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-024",
    domainCode: 3,
    stem: `A team hardening silver tables in Unity Catalog debates how far the database itself will enforce data quality:

- "If we add a PRIMARY KEY, duplicate keys can never be inserted."
- "CHECK constraints only warn the writer; the row is still committed."
- "NOT NULL can only be set at CREATE TABLE time."

Which statement about table constraints in Databricks is correct?`,
    options: [
      "CHECK constraints are advisory — they are recorded in the table schema but never block or roll back a write",
      "PRIMARY KEY constraints reject INSERT statements that would create duplicate key values",
      "NOT NULL and CHECK are enforced on writes; PRIMARY KEY and FOREIGN KEY are informational only",
      "Constraints apply only to external tables; managed tables skip validation entirely",
    ],
    correctIndex: 2,
    explanationEn: `NOT NULL and CHECK are enforced constraints: when a write would violate them, the transaction fails with an error, making them a reliable last line of defense for Silver and Gold tables. PRIMARY KEY and FOREIGN KEY, by contrast, are informational only in Databricks — they document relationships but never reject writes, so duplicate "key" values can still land. Constraints are not frozen at creation time: ALTER TABLE ... ADD CONSTRAINT adds CHECK rules, and ALTER TABLE ... ALTER COLUMN ... SET NOT NULL adds nullability rules later.`,
    explanationPt: `NOT NULL e CHECK são constraints aplicadas: quando uma escrita as violaria, a transação falha com erro — o que as torna uma última linha de defesa confiável para tabelas Silver e Gold. PRIMARY KEY e FOREIGN KEY, em contraste, são apenas informativas no Databricks: documentam relacionamentos, mas nunca rejeitam escritas, então valores de "chave" duplicados ainda podem entrar. As constraints não ficam congeladas na criação: ALTER TABLE ... ADD CONSTRAINT adiciona regras CHECK, e ALTER TABLE ... ALTER COLUMN ... SET NOT NULL adiciona regras de nulidade depois.`,
    referenceUrl: "https://docs.databricks.com/aws/en/tables/constraints",
    referenceTitle: "Table constraints — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-025",
    domainCode: 3,
    stem: `The analytics team defines a gold materialized view in SQL over silver tables. Its data quality rule: margin_pct must be between 0 and 100. Rows that violate the rule must be excluded from the materialized view, and the number of violations must still be recorded as expectation metrics in the event log. The refresh itself must not fail because of bad rows.

Which clause implements this rule?`,
    options: [
      "CONSTRAINT valid_margin EXPECT (margin_pct BETWEEN 0 AND 100) ON VIOLATION FAIL UPDATE",
      "CONSTRAINT valid_margin EXPECT (margin_pct BETWEEN 0 AND 100) ON VIOLATION DROP ROW",
      "CONSTRAINT valid_margin EXPECT (margin_pct BETWEEN 0 AND 100)",
      "CONSTRAINT valid_margin CHECK (margin_pct BETWEEN 0 AND 100)",
    ],
    correctIndex: 1,
    explanationEn: `On declarative pipeline objects such as materialized views and streaming tables, CONSTRAINT name EXPECT (expr) ON VIOLATION ... declares a row-level data quality expectation: DROP ROW removes violating rows and records the violation count in the event log's expectation metrics; FAIL UPDATE aborts the refresh; and omitting ON VIOLATION defaults to warn, retaining violating rows and only counting them. CHECK is a different mechanism — a table constraint enforced on writes, which fails the transaction rather than dropping rows. In Python pipeline code, the equivalents are @dlt.expect_or_drop, @dlt.expect_or_fail, and @dlt.expect.`,
    explanationPt: `Em objetos de pipeline declarativo, como materialized views e streaming tables, CONSTRAINT nome EXPECT (expr) ON VIOLATION ... declara uma expectativa de qualidade no nível da linha: DROP ROW remove as linhas violadoras e registra a contagem de violações nas métricas de expectativa do event log; FAIL UPDATE interrompe o refresh; e omitir ON VIOLATION usa a ação padrão warn, mantendo as linhas violadoras e apenas contando-as. CHECK é outro mecanismo — uma constraint de tabela aplicada nas escritas, que falha a transação em vez de descartar linhas. Em Python, os equivalentes são @dlt.expect_or_drop, @dlt.expect_or_fail e @dlt.expect.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-create-materialized-view",
    referenceTitle: "CREATE MATERIALIZED VIEW — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-026",
    domainCode: 3,
    stem: `During a performance review of a silver pipeline, a reviewer notices that the author registered a Python UDF to uppercase a country code and to split a full name, although both transformations are available as built-in Spark functions. The author asks why the reviewer insists on replacing the UDF with the native functions.

Which explanation is correct?`,
    options: [
      "Built-in functions execute in the optimized engine with no Python serialization and remain visible to the optimizer.",
      "Python UDFs are always faster than built-in functions because they run dedicated code compiled for each transformation.",
      "Built-in functions are exposed only in SQL; PySpark DataFrames must go through a Python UDF for equivalent logic.",
      "Performance is identical for both approaches, so replacing the UDF is purely a matter of coding style preference.",
    ],
    correctIndex: 0,
    explanationEn: `Spark built-in functions are executed by the engine directly in the JVM (and can be further accelerated by Photon), so rows never cross into Python worker processes. A Python UDF serializes every row to an interpreter and back, which is slow, and its body is a black box to the optimizer: Catalyst cannot push it down, combine it with other expressions, or use it in its statistics. Built-ins also exist in PySpark (pyspark.sql.functions), not only in SQL, so a UDF is never required for uppercasing or splitting strings.`,
    explanationPt: `As funções built-in do Spark são executadas pelo engine direto na JVM (e podem ser aceleradas ainda mais pelo Photon), então nenhuma linha precisa cruzar para processos Python. Uma UDF em Python serializa cada linha para um interpretador e de volta, o que é lento, e o corpo da função é uma caixa-preta para o otimizador: o Catalyst não consegue fazer pushdown, combiná-la com outras expressões nem usá-la nas estatísticas. As funções nativas também existem em PySpark (pyspark.sql.functions), não apenas em SQL, logo uma UDF jamais é necessária para maiusculizar ou separar strings.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-027",
    domainCode: 3,
    stem: `A PySpark job reads a Delta table into a DataFrame that currently has 200 partitions spread across the cluster. Before writing the result, the team wants to end up with 8 partitions to avoid producing hundreds of tiny output files, but without paying for a full shuffle of the data.

Which operation should they use?`,
    options: [
      "repartition(8), the only DataFrame operation able to reduce the number of partitions",
      "coalesce(8), which always preserves the current data distribution across the worker nodes",
      "coalesce(8), which merges existing partitions into fewer ones without a full shuffle",
      "either operation, because repartition and coalesce are synonyms that differ only in naming",
    ],
    correctIndex: 2,
    explanationEn: `coalesce(8) is a narrow transformation: Spark combines existing partitions on their current executors and avoids the shuffle entirely, which is exactly what is wanted when only reducing the partition count. repartition(8) performs a full shuffle of the data (it can also increase the number of partitions) and is the right tool only when rebalancing or re-keying the data is required. coalesce does not guarantee an even distribution of data across nodes — it minimizes data movement instead — and the two operations are not synonyms.`,
    explanationPt: `coalesce(8) é uma narrow transformation: o Spark combina as partições existentes nos executors onde elas já estão, sem shuffle algum — exatamente o desejado quando só se quer reduzir a contagem de partições. repartition(8) faz um shuffle completo dos dados (e também serve para aumentar o número de partições) e é a ferramenta certa apenas quando é preciso rebalancear ou re-chavear os dados. coalesce não garante distribuição uniforme dos dados entre os nós — ele minimiza a movimentação — e as duas operações não são sinônimos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-028",
    domainCode: 3,
    stem: `A junior engineer chains several DataFrame operations in a notebook: two withColumn calls, a filter on status, and a select of five columns. Each cell returns almost instantly, and she is surprised that the source table is only read minutes later, when she finally calls count(). She asks her lead what happened.

Which explanation is correct?`,
    options: [
      "Each transformation executed immediately and stored its result; count() only aggregated the precomputed data.",
      "Transformations are lazy and only extend the logical plan; count() is an action that triggers execution.",
      "Actions are lazy as well; only show() forces Spark to execute the plan and read the source data.",
      "The accumulated plan is executed automatically at cluster shutdown, when pending work is flushed to storage.",
    ],
    correctIndex: 1,
    explanationEn: `Spark separates transformations from actions. withColumn, filter, and select are lazy transformations: they only add nodes to a logical plan, so nothing touches the data yet. count() is an action — like collect(), take(), write, or show() — and it is what triggers the actual execution of the whole plan in one pass. That is why every step returned instantly: nothing ran until the action. The plan is never held until shutdown, and show() is not the only action that executes a query.`,
    explanationPt: `O Spark separa transformations de actions. withColumn, filter e select são transformations lazy: apenas adicionam nós ao plano lógico, sem tocar nos dados. count() é uma action — como collect(), take(), write ou show() — e é ela quem dispara a execução real do plano inteiro em uma única passada. Por isso cada etapa retornou instantaneamente: nada rodou até chegar a action. O plano nunca fica retido até o shutdown do cluster, e show() não é a única action que executa uma consulta.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-029",
    domainCode: 3,
    stem: `Two analysts on different teams must share the same SQL definition — a curated customer list built over several silver tables. The definition must live in one governed place: secured with Unity Catalog permissions, centrally versioned, and readable from any workspace attached to the metastore. The analysts use separate notebooks on separate compute.

Which object meets these requirements?`,
    options: [
      "A temporary view (CREATE TEMP VIEW), which lives only inside the session that defines it",
      "A global temporary view (CREATE GLOBAL TEMP VIEW), shared across sessions on the same cluster",
      "A .sql script in a shared folder, which each analyst must open and run in her own session",
      "A view created with CREATE VIEW in a Unity Catalog schema, stored in the metastore and governed with grants",
    ],
    correctIndex: 3,
    explanationEn: `A view created in a Unity Catalog schema is a permanent, catalog-governed object: it is stored in the metastore, secured with GRANT statements like any securable, and visible from every workspace attached to the metastore — which is exactly the cross-workspace, governed sharing the analysts need. A temporary view disappears when its session ends. A global temporary view lives in the global_temp database, shared only by sessions attached to the same cluster, and vanishes when that cluster terminates. A loose .sql file offers no governance, no permissions, and no single version.`,
    explanationPt: `Uma view criada em um schema do Unity Catalog é um objeto permanente e governado: fica armazenada no metastore, é protegida com GRANTs como qualquer securable e fica visível em todos os workspaces anexados ao metastore — exatamente o compartilhamento governado entre workspaces de que as analistas precisam. Uma temporary view desaparece quando a sessão termina. Uma global temporary view vive no database global_temp, é compartilhada apenas entre sessões do mesmo cluster e desaparece quando o cluster termina. Um arquivo .sql solto não oferece governança, permissões nem versão única.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-create-view",
    referenceTitle: "CREATE VIEW — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-030",
    domainCode: 3,
    stem: `Last night, a batch job ran a faulty UPDATE on catalog.sales.orders, overwriting the status column on every row. The faulty commit landed as version 3, and the table is now at version 4. An analyst must produce a report from the table exactly as it existed before that commit, without changing the current data.

How should the analyst read the pre-UPDATE snapshot?`,
    options: [
      "Query the historical snapshot with SELECT * FROM catalog.sales.orders VERSION AS OF 2",
      "Run RESTORE TABLE catalog.sales.orders TO VERSION AS OF 2, then execute the report again",
      "Run the report on the current table with a WHERE clause that filters out the overwritten rows",
      "Read the table's underlying Parquet data files directly from the storage location with Spark",
    ],
    correctIndex: 0,
    explanationEn: `Delta time travel lets a query read any committed snapshot without modifying the table: SELECT ... FROM catalog.sales.orders VERSION AS OF 2 returns the table as it stood at version 2, immediately before the faulty UPDATE (TIMESTAMP AS OF works too). RESTORE TABLE would create a brand-new commit that rolls the data back — it changes the table, which the analyst must not do. A WHERE clause can only filter rows of the current version; it can never recover overwritten values. Reading Parquet files directly bypasses the transaction log and loses snapshot consistency.`,
    explanationPt: `O time travel do Delta permite que uma consulta leia qualquer snapshot commitado sem modificar a tabela: SELECT ... FROM catalog.sales.orders VERSION AS OF 2 devolve a tabela como ela estava na versão 2, imediatamente antes do UPDATE defeituoso (TIMESTAMP AS OF também funciona). RESTORE TABLE criaria um commit novo revertendo os dados — mudaria a tabela, o que a analista não pode fazer. Uma cláusula WHERE só filtra linhas da versão atual; jamais recupera valores sobrescritos. Ler os arquivos Parquet direto ignora o transaction log e perde a consistência de snapshot.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/",
    referenceTitle: "Delta Lake guide — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-031",
    domainCode: 3,
    stem: `An auditor must verify catalog.finance.ledger as it stood 20 days ago. The team runs the time travel query for that snapshot, but it fails with a FILE_NOT_FOUND exception pointing at a data file. The table is vacuumed weekly with the default retention settings, and OPTIMIZE also runs regularly.

What is the most likely cause of the failure?`,
    options: [
      "Time travel preserves every version since table creation, so the failure must come from missing SELECT privileges",
      "VACUUM only compacts small files into larger ones and never deletes any file from storage",
      "VACUUM removed data files older than the default 7-day retention, making older snapshots unreadable",
      "RESTORE TABLE can recover any prior version even after VACUUM has removed the underlying files",
    ],
    correctIndex: 2,
    explanationEn: `The default deletedFileRetentionDuration is 7 days: VACUUM physically removes data files that are no longer referenced by the current table state and are older than the retention window. Once those files are gone, time travel to snapshots older than the window fails with file-not-found errors — and raising the retention property afterwards, or re-ingesting the data, does not bring the deleted files back. VACUUM never compacts files (that is OPTIMIZE's job), RESTORE cannot resurrect deleted files, and this error is not a permissions problem.`,
    explanationPt: `O default de deletedFileRetentionDuration é 7 dias: o VACUUM remove fisicamente os arquivos de dados que não são mais referenciados pelo estado atual da tabela e são mais antigos que a janela de retenção. Depois que esses arquivos somem, o time travel para snapshots mais antigos que a janela falha com erros de file-not-found — e aumentar a propriedade de retenção depois, ou reingerir os dados, não traz os arquivos deletados de volta. VACUUM nunca compacta arquivos (isso é papel do OPTIMIZE), RESTORE não ressuscita arquivos removidos, e esse erro não é um problema de permissão.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/best-practices",
    referenceTitle: "Best practices: Delta Lake — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-032",
    domainCode: 3,
    stem: `A streaming pipeline commits new data to catalog.ops.events every 30 seconds. After a few months, the Delta table holds hundreds of thousands of small files, and dashboard queries have degraded: execution time is dominated by listing and opening files rather than scanning data.

Which maintenance action restores read performance?`,
    options: [
      "Run VACUUM with the default retention settings, so that small files are merged into larger ones",
      "Run OPTIMIZE, which compacts the small files into larger ones for more efficient reads",
      "Rewrite the entire table every night with repartition(1) to produce one giant file",
      "Scale up the compute behind the dashboards while leaving the file layout untouched",
    ],
    correctIndex: 1,
    explanationEn: `OPTIMIZE is the Delta command that compacts small files into larger ones, bin-packing them so readers open far fewer files; on tables with liquid clustering it also re-lays out the data by the clustering keys. VACUUM is the complementary but different command: it deletes files that are no longer referenced by the current table state and are older than the retention threshold — it does not merge or compact anything. Rewriting everything into a single file creates huge write amplification and one file that cannot be read in parallel. More compute cannot fix per-file listing and open overhead.`,
    explanationPt: `OPTIMIZE é o comando do Delta que compacta arquivos pequenos em arquivos maiores, empacotando-os para que as leituras abram muito menos arquivos; em tabelas com liquid clustering, ele também reorganiza os dados pelas clustering keys. VACUUM é o comando complementar, porém diferente: remove arquivos que não são mais referenciados pelo estado atual da tabela e são mais antigos que o limiar de retenção — ele não funde nem compacta nada. Reescrever tudo em um único arquivo gera enorme amplificação de escrita e um arquivo que não pode ser lido em paralelo. Mais compute não conserta o overhead de listagem e abertura por arquivo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/best-practices",
    referenceTitle: "Best practices: Delta Lake — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-033",
    domainCode: 3,
    stem: `Every dashboard query against catalog.sales.orders derives the order date by calling to_date(order_ts) — an expression repeated across dozens of reports over billions of rows. The team wants the derived value computed once, at write time, and physically stored as a column of the table.

Which Delta Lake feature provides this?`,
    options: [
      "A view that computes to_date(order_ts) on every read of the underlying table",
      "A trigger that fires AFTER INSERT on the table and updates the derived column",
      "A dashboard-level expression, so that the calculation stays out of the storage layer",
      "A generated column: order_date DATE GENERATED ALWAYS AS (CAST(order_ts AS DATE))",
    ],
    correctIndex: 3,
    explanationEn: `Delta generated columns are computed once at write time (on INSERT and UPDATE) and stored in the data files: queries that reference order_date read the stored value directly, and queries that filter on the generating expression can even use the stored column for data skipping. A view recomputes to_date on every read. Databricks SQL has no AFTER INSERT triggers — that is an OLTP database mechanism. Keeping the calculation in the dashboard preserves exactly the repeated per-query computation the team is trying to eliminate.`,
    explanationPt: `As generated columns do Delta são computadas uma única vez, no momento da escrita (em INSERT e UPDATE), e ficam armazenadas nos arquivos de dados: consultas que referenciam order_date leem o valor gravado diretamente, e consultas que filtram pela expressão geradora podem até usar a coluna armazenada para data skipping. Uma view recalcula to_date a cada leitura. O Databricks SQL não tem triggers AFTER INSERT — mecanismo típico de bancos OLTP. Manter o cálculo no dashboard preserva exatamente a computação repetida por consulta que o time quer eliminar.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/",
    referenceTitle: "Delta Lake guide — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-034",
    domainCode: 3,
    stem: `An operational database streams its change feed into a bronze table: each row carries the operation (insert, update, delete), a monotonically increasing sequence number, and the changed columns. In a Lakeflow Declarative Pipeline, the team must keep a streaming table in sync with the current source state — deletes included — without writing manual merge logic.

Which construct should the pipeline declare?`,
    options: [
      "A hand-written MERGE INTO statement that joins the change rows to the target on the primary key",
      "An AUTO CDC INTO flow with KEYS and SEQUENCE BY, replacing the former APPLY CHANGES syntax",
      "A row-level expectation that drops invalid change rows as they flow into the target table",
      "A full refresh that recreates the streaming table from scratch whenever a new batch arrives",
    ],
    correctIndex: 1,
    explanationEn: `In a Lakeflow Declarative Pipeline, AUTO CDC INTO (which replaced the former APPLY CHANGES APIs, with the same syntax) declares CDC processing: you create a streaming table and define a flow with the source, KEYS to match rows, and SEQUENCE BY to order the change events — the pipeline then applies inserts, updates, and deletes automatically, with SCD type 1 or 2 semantics. A hand-written MERGE would force the team to own change ordering, delete handling, deduplication, and checkpointing themselves, and MERGE cannot directly consume a streaming source. Expectations only validate rows; they do not apply changes. Full refreshes reprocess everything and lose the incremental guarantee.`,
    explanationPt: `Em um Lakeflow Declarative Pipeline, o AUTO CDC INTO (que substituiu as antigas APIs APPLY CHANGES, com a mesma sintaxe) declara o processamento de CDC: você cria uma streaming table e define um flow com a fonte, KEYS para casar as linhas e SEQUENCE BY para ordenar os eventos de mudança — o pipeline então aplica inserts, updates e deletes automaticamente, com semântica SCD tipo 1 ou 2. Um MERGE escrito à mão obrigaria o time a gerenciar ordenação, tratamento de deletes, deduplicação e checkpointing por conta própria, e o MERGE não consegue consumir diretamente uma fonte de streaming. Expectations apenas validam linhas; não aplicam mudanças. Full refresh reprocessa tudo e perde a garantia incremental.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ldp/cdc",
    referenceTitle: "The AUTO CDC APIs (Lakeflow Declarative Pipelines) — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-035",
    domainCode: 3,
    stem: `A Delta table catalog.sales.payments declares amount as DOUBLE. A new ingestion job builds a DataFrame in which amount is still STRING, with raw values like '125.50', and appends the DataFrame to the table. The job author asks what Delta Lake will do when the write is attempted.

What is the expected behavior?`,
    options: [
      "The write fails: Delta enforces the table schema and rejects a column type that does not match",
      "The write succeeds, storing STRING values that are converted back to DOUBLE whenever readers query",
      "Delta automatically adds a second column, amount_string, to hold the mismatched incoming values",
      "Delta writes only the columns whose types are compatible and silently drops the mismatched one",
    ],
    correctIndex: 0,
    explanationEn: `Delta Lake performs schema enforcement on writes: the DataFrame schema is validated against the table schema, and a column whose type does not match (STRING into DOUBLE) makes the write fail with an error — nothing is partially committed, because writes are atomic. Delta is not schema-on-read: there is no silent per-row coercion at query time, no auto-created companion column, and no silent dropping of mismatched columns. To change the table schema you enable schema evolution (mergeSchema) explicitly, or you cast the column to DOUBLE before writing.`,
    explanationPt: `O Delta Lake faz schema enforcement nas escritas: o schema do DataFrame é validado contra o schema da tabela, e uma coluna cujo tipo não bate (STRING em DOUBLE) faz a escrita falhar com erro — nada é parcialmente commitado, porque as escritas são atômicas. O Delta não é schema-on-read: não há conversão silenciosa por linha no momento da consulta, não há criação automática de coluna extra nem descarte silencioso de colunas incompatíveis. Para mudar o schema da tabela, habilita-se schema evolution (mergeSchema) explicitamente — ou faz-se o cast da coluna para DOUBLE antes de gravar.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/",
    referenceTitle: "Delta Lake guide — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-036",
    domainCode: 3,
    stem: `Before promoting a new PySpark transformation into the nightly production job, an engineer wants to see what Spark intends to do with it — the planned join strategy, the filters, and the projection — without spending cluster resources actually running the query.

Which action gives her this preview?`,
    options: [
      "Call count() after every transformation and compare the elapsed time of each stage",
      "Nothing — lazy evaluation makes the plan unknowable until the query has fully executed",
      "Call df.explain() to print the logical and physical plans without executing anything",
      "Run the job in production and inspect the Spark UI, the only place where plans appear",
    ],
    correctIndex: 2,
    explanationEn: `Because Spark is lazy, the chain of transformations already exists as a plan before anything runs, and df.explain() prints that plan — logical, optimized, and physical — for free, showing join strategies, filter placement, and projections without touching the data. Running count() after each step actually executes work and measures cost rather than showing intent. Lazy evaluation is precisely why the plan IS knowable beforehand. The Spark UI shows executed plans only after a run, and it is not the only place where plans are visible.`,
    explanationPt: `Como o Spark é lazy, a cadeia de transformações já existe como um plano antes de qualquer execução, e df.explain() imprime esse plano — lógico, otimizado e físico — de graça, mostrando estratégias de join, posição dos filtros e projeções sem tocar nos dados. Rodar count() depois de cada etapa executa trabalho de verdade e mede custo, não intenção. A lazy evaluation é justamente o motivo de o plano SER conhecível antes. O Spark UI mostra planos executados somente depois de uma execução, e não é o único lugar onde os planos aparecem.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-037",
    domainCode: 3,
    stem: `A reconciliation job must align catalog.sales.silver_orders with the source extract catalog.sales.latest_orders in one atomic pass: matched orders get their status refreshed, matched orders whose source status is 'CANCELLED' must be removed from the target, and unmatched source orders must be inserted.

\`\`\`sql
MERGE INTO catalog.sales.silver_orders AS t
USING catalog.sales.latest_orders AS s
ON t.order_id = s.order_id
-- WHEN clauses omitted
\`\`\`

Which approach meets all three requirements in this single atomic pass?`,
    options: [
      "Run two MERGE statements in sequence: one that updates matched rows and inserts new ones, then one that deletes the cancelled orders",
      "Use a single MERGE with WHEN MATCHED THEN UPDATE SET * and WHEN NOT MATCHED THEN INSERT *, issuing a separate DELETE for the cancelled orders",
      "Use a single MERGE with WHEN MATCHED AND s.status = 'CANCELLED' THEN DELETE, then WHEN MATCHED THEN UPDATE SET *, then WHEN NOT MATCHED THEN INSERT *",
      "Replace the MERGE with an UPDATE on the matched rows followed by REPLACE WHERE, rewriting the table with the surviving and new orders",
    ],
    correctIndex: 2,
    explanationEn: `A single MERGE can carry multiple whenMatched clauses, evaluated in the order they are declared: putting the conditional WHEN MATCHED AND s.status = 'CANCELLED' THEN DELETE before the unconditional WHEN MATCHED THEN UPDATE SET * removes cancelled orders while every other matched row is updated, and WHEN NOT MATCHED THEN INSERT * adds the new orders — all in one atomic statement. The claim that MERGE cannot delete matched rows is false: WHEN MATCHED THEN DELETE exists precisely for this, so neither a second MERGE nor a separate DELETE is needed. REPLACE WHERE overwrites target rows matching a predicate with a filtered source read; it cannot synchronize per-key updates, selective deletes, and inserts.`,
    explanationPt: `Um único MERGE pode ter várias cláusulas whenMatched, avaliadas na ordem em que são declaradas: colocando o WHEN MATCHED AND s.status = 'CANCELLED' THEN DELETE condicional antes do WHEN MATCHED THEN UPDATE SET * incondicional, os pedidos cancelados são removidos enquanto todos os demais pares casados são atualizados, e o WHEN NOT MATCHED THEN INSERT * acrescenta os novos pedidos — tudo em uma instrução atômica. A alegação de que o MERGE não consegue apagar linhas casadas é falsa: o WHEN MATCHED THEN DELETE existe exatamente para isso, então nem um segundo MERGE nem um DELETE separado são necessários. O REPLACE WHERE sobrescreve as linhas do alvo que casam com um predicado a partir de uma leitura filtrada da fonte; ele não consegue sincronizar updates por chave, deletes seletivos e inserts.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/merge",
    referenceTitle: "Merge data (Delta Lake upsert) — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-038",
    domainCode: 3,
    stem: `Over the past week, catalog.ops.shipments has behaved strangely: row counts shift overnight even though the team's own jobs were idle, and the table version keeps climbing. The engineer needs to determine exactly which operations were committed to the table, when, and by which user or service principal.

Which command gives her this commit-level audit trail?`,
    options: [
      "SHOW TABLES with a filter on the last modified date, which lists only recent writes",
      "A manual read of the _delta_log JSON transaction log files parsed directly from storage",
      "The workspace audit log, which is described as the only existing record of table writes",
      "DESCRIBE HISTORY, which lists every commit with its operation, timestamp, and user",
    ],
    correctIndex: 3,
    explanationEn: `DESCRIBE HISTORY returns the commit history of the Delta table from its transaction log: for each version it shows the operation (WRITE, UPDATE, MERGE, OPTIMIZE, VACUUM, RESTORE, and so on), the timestamp, the user or service principal, and the operation parameters. That is exactly the forensic view needed here, and DESCRIBE DETAIL complements it with current table-level statistics such as size and file count. SHOW TABLES only lists tables in a schema, a raw read of _delta_log files is unsupported and error-prone, and while workspace audit logs record service-level actions, the table-level commit log is DESCRIBE HISTORY.`,
    explanationPt: `O DESCRIBE HISTORY devolve o histórico de commits da tabela Delta a partir do transaction log: para cada versão, ele mostra a operação (WRITE, UPDATE, MERGE, OPTIMIZE, VACUUM, RESTORE etc.), o timestamp, o usuário ou service principal e os parâmetros da operação. É exatamente a visão forense necessária aqui, e o DESCRIBE DETAIL a complementa com estatísticas atuais da tabela, como tamanho e contagem de arquivos. SHOW TABLES apenas lista tabelas de um schema, a leitura crua dos arquivos do _delta_log não é suportada e é propensa a erro, e embora os audit logs do workspace registrem ações de serviço, o log de commits da tabela é o DESCRIBE HISTORY.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/",
    referenceTitle: "Delta Lake guide — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-039",
    domainCode: 3,
    stem: `The source system exports two timestamps as STRING columns: ordered_at and shipped_at, both formatted like '2026-07-02 14:45:00'. In the silver transformation, the team must add fulfillment_days with the number of calendar days between the order date and the ship date, written in Spark SQL.

Which approach should they use?`,
    options: [
      "Parse both columns with to_timestamp(col, 'yyyy-MM-dd HH:mm:ss'), then compute datediff(shipped_at, ordered_at)",
      "Slice fixed character positions with substring() to build year, month, and day, then subtract the dates",
      "Convert both columns with unix_timestamp(), subtract, and divide the difference by 86400",
      "Register a Python UDF, because date parsing requires a library that Spark SQL lacks natively",
    ],
    correctIndex: 0,
    explanationEn: `Spark SQL ships native datetime functions: to_timestamp parses the string into a TIMESTAMP according to the given format, and datediff returns the number of calendar days between two dates — exactly the requirement, since a gap that crosses midnight counts as a day regardless of the hour. substring-based slicing hardcodes character positions, breaks when the format shifts, and still needs date assembly. unix_timestamp arithmetic measures elapsed 24-hour periods rather than calendar days and needs manual flooring. No UDF is needed: the date functions are built in, and a Python library would only slow the pipeline down.`,
    explanationPt: `O Spark SQL traz funções nativas de data: to_timestamp converte a string para TIMESTAMP conforme o formato informado, e datediff devolve o número de dias corridos entre duas datas — exatamente o requisito, pois um intervalo que cruza a meia-noite conta como um dia, independentemente da hora. O fatiamento com substring fixa posições de caracteres, quebra se o formato mudar e ainda exige montar as datas. A aritmética com unix_timestamp mede períodos de 24 horas decorridos, e não dias de calendário, e exige truncamento manual. Nenhuma UDF é necessária: as funções de data são nativas, e uma biblioteca Python só deixaria o pipeline mais lento.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-040",
    domainCode: 3,
    stem: `The table catalog.sales.order_items stores one row per line item, with columns order_id and item. An export job must return exactly one row per order, carrying all of its items in a single ARRAY<STRING> column named items — a native array, not a concatenated string.

Which query shape produces this result?`,
    options: [
      "Explode the item column first, then concatenate the values into one delimited string",
      "SELECT order_id, collect_list(item) AS items FROM catalog.sales.order_items GROUP BY order_id",
      "Pivot the rows into one explicit column per item position, such as item_1 and item_2",
      "It is impossible in pure SQL, because aggregate functions cannot return complex types like arrays",
    ],
    correctIndex: 1,
    explanationEn: `collect_list is a native aggregate function that gathers all values of a group into an ARRAY, making it the exact inverse of explode: GROUP BY order_id with collect_list(item) yields one row per order with an array of its items. Exploding first multiplies rows and moves in the wrong direction, and concatenation would return a STRING rather than an array. A pivot requires fixed, known item positions and produces one scalar column per position. Aggregates can return complex types — collect_list and collect_set return arrays — so no UDF is required.`,
    explanationPt: `collect_list é uma função de agregação nativa que reúne todos os valores de um grupo em um ARRAY — é o inverso exato do explode: GROUP BY order_id com collect_list(item) devolve uma linha por pedido com o array dos seus itens. Explodir primeiro multiplica linhas na direção errada, e a concatenação devolveria uma STRING, não um array. O pivot exige posições de item fixas e conhecidas e gera uma coluna escalar por posição. Agregações podem retornar tipos complexos — collect_list e collect_set devolvem arrays —, logo nenhuma UDF é necessária.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-041",
    domainCode: 3,
    stem: `A nightly sales report joins catalog.sales.facts_sales to catalog.sales.dim_stores on store_id to append each store's region and manager. After the join, the report is missing thousands of sales: several new stores started selling before their dim_stores records were created. The business rule requires every sale to appear in the report even when store attributes are unknown.

Which join change satisfies this rule?`,
    options: [
      "Switch to a LEFT JOIN cautiously — an outer join still discards non-matching rows before combining, so the unregistered stores would keep disappearing",
      "Replace the INNER JOIN with a LEFT JOIN — sales whose store_id has no dimension row are kept, with NULLs filling the store attribute columns",
      "No join change is needed — Spark inspects the table sizes and decides on its own whether INNER or LEFT semantics apply to the query",
      "Keep the INNER JOIN and add an ORDER BY — INNER and LEFT return exactly the same rows and differ only in how the output is sorted",
    ],
    correctIndex: 1,
    explanationEn: `INNER JOIN semantics keep only the rows that find a match on the other side, so every sale from a store that is not yet in dim_stores disappears from the report. A LEFT JOIN from the sales fact to the dimension preserves all sales, padding the missing store attributes with NULLs, which matches the stated business rule; whether to filter those rows afterwards is a business decision, not the join's. Spark never chooses join semantics by table size — the optimizer picks only the physical strategy (sort-merge, broadcast, shuffle hash) for the join type the author wrote. INNER and LEFT do not return the same rows, and ordering is not what distinguishes them.`,
    explanationPt: `Na semântica do INNER JOIN só sobrevivem as linhas que encontram correspondência no outro lado, então toda venda de uma loja que ainda não está em dim_stores desaparece do relatório. Um LEFT JOIN do fato de vendas para a dimensão preserva todas as vendas e preenche os atributos ausentes da loja com NULLs — exatamente a regra de negócio informada; filtrar essas linhas depois é uma decisão de negócio, não do join. O Spark nunca escolhe a semântica do join pelo tamanho das tabelas: o otimizador define apenas a estratégia física (sort-merge, broadcast, shuffle hash) para o tipo de join que o autor escreveu. INNER e LEFT não devolvem as mesmas linhas, e a diferença entre eles não é a ordenação.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-042",
    domainCode: 3,
    stem: `A daily consolidation reads two regional extracts into DataFrames. Both extracts carry the same four columns — order_id, order_date, amount, region — but the EU file delivers them in a different column order than the US file. The combined output must pair every column with its correct data regardless of the position in which each file lists it.

How should the engineer stack the two DataFrames?`,
    options: [
      "eu.union(us) — union() resolves columns by name automatically whenever the two schemas differ in column position",
      "Reorder one DataFrame with an explicit select() first — manually aligning the column positions is the only safe way to combine the extracts",
      "It cannot be done — Spark refuses to combine DataFrames whose columns are not declared in the same order",
      "eu.unionByName(us) — it pairs columns by name between the two DataFrames, so position differences cannot mismatch the data",
    ],
    correctIndex: 3,
    explanationEn: `DataFrame.union() is positional: it stacks the two schemas column by column, in the order they are declared, so a value can silently land under the wrong name when the orders differ. unionByName() resolves each column by name, which is exactly what two extracts with the same fields in different positions need (it can even tolerate missing columns with the allowMissingColumns option). Manual reordering with select() does work, but it is not the only safe path — it adds code for something the engine handles natively. And Spark does not refuse such unions; combining DataFrames with differently ordered columns is fully supported.`,
    explanationPt: `O DataFrame.union() é posicional: ele empilha os dois schemas coluna a coluna, na ordem em que estão declarados, então um valor pode parar silenciosamente sob o nome errado quando as ordens diferem. O unionByName() resolve cada coluna pelo nome — exatamente o que dois extratos com os mesmos campos em posições diferentes precisam (ele ainda tolera colunas ausentes com a opção allowMissingColumns). Reordenar manualmente com select() até funciona, mas não é a única saída segura: só adiciona código para algo que o engine já resolve nativamente. E o Spark não recusa esse union; combinar DataFrames com colunas em ordens diferentes é totalmente suportado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-043",
    domainCode: 3,
    stem: `Yesterday, the query plan for the nightly reconciliation broadcast a 30 MB currency dimension next to a multi-terabyte fact table automatically — no hint appears in the query. Today the same pattern runs as a shuffle-heavy sort-merge join, because the platform team lowered the size threshold that governs automatic broadcasts of small tables in joins.

Which configuration parameter sets that threshold?`,
    options: [
      "spark.sql.autoBroadcastJoinThreshold — the size limit at or below which the planner broadcasts a join side automatically, with no hint required",
      "No parameter is involved — automatic broadcast joins only happen when the query text includes an explicit broadcast() join hint",
      "The broadcast threshold is a fixed engine constant — a platform team cannot raise or lower it through configuration",
      "spark.sql.shufflePartitions — its value determines how large a table must be before the planner stops broadcasting it",
    ],
    correctIndex: 0,
    explanationEn: `spark.sql.autoBroadcastJoinThreshold (default 10 MB) is the planner-level size limit: when Spark's statistics estimate a join side at or below it, that side is broadcast automatically, with no hint in the query. The threshold is a configuration, so the platform team's change explains why yesterday's 30 MB dimension was broadcast and today a smaller table was not. An explicit broadcast() hint still forces broadcasting regardless of size, but a hint is not the only path. spark.sql.shufflePartitions controls the number of shuffle partitions in joins and aggregations, not broadcast decisions. On Databricks, AQE can also convert sort-merge joins into broadcast hash joins at runtime, governed by its own adaptive threshold.`,
    explanationPt: `O spark.sql.autoBroadcastJoinThreshold (default 10 MB) é o limite de tamanho em nível de plano: quando as estatísticas do Spark estimam um lado do join nesse tamanho ou menor, esse lado é transmitido automaticamente, sem nenhum hint na consulta. O limiar é uma configuração — por isso a mudança do time de plataforma explica por que ontem a dimensão de 30 MB foi broadcast e hoje uma tabela menor não foi. Um hint broadcast() explícito ainda força a transmissão independente do tamanho, mas não é o único caminho. Já o spark.sql.shufflePartitions controla o número de partições de shuffle em joins e agregações, não a decisão de broadcast. No Databricks, o AQE também pode converter sort-merge joins em broadcast hash joins em tempo de execução, regido pelo seu próprio limiar adaptativo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/optimizations/aqe",
    referenceTitle: "Adaptive Query Execution — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-044",
    domainCode: 3,
    stem: `In an exploratory notebook, an engineer wants to inspect catalog.events.bronze_events, a table with roughly 200 million rows. She runs the cell below, and a few minutes later the run fails with an out-of-memory error raised on the driver process.

\`\`\`python
rows = spark.read.table("catalog.events.bronze_events").collect()
\`\`\`

Why did this fail, and what is the correct practice?`,
    options: [
      "collect() fans the rows out across the executors for inspection — the driver out-of-memory error must have a different cause, such as network buffers",
      "Prepend coalesce(1) — collapsing the DataFrame into a single partition is what allows collect() to return without exhausting driver memory",
      "collect() ships every row into the driver's own memory — inspect with display(), take(n), or limit(), and keep full-scale processing on the cluster",
      "The driver never holds data in Spark — only executors allocate memory, so the failure proves the executors were undersized for the table",
    ],
    correctIndex: 2,
    explanationEn: `collect() is an action that materializes the entire result on the driver: all 200 million rows are serialized and pulled into that single process's memory, which is why the out-of-memory error was raised there. For inspection, display(), take(n), or limit() return a sample instead of the whole table, and any real processing should stay distributed on the cluster. collect() does not fan rows out across executors — it gathers them in. coalesce(1) only changes the partition count before the action; the full volume still lands on the driver, so it makes the problem worse rather than solving it.`,
    explanationPt: `O collect() é uma action que materializa o resultado inteiro no driver: as 200 milhões de linhas são serializadas e puxadas para a memória desse único processo — por isso o out-of-memory estourou ali. Para inspeção, display(), take(n) ou limit() devolvem uma amostra em vez da tabela inteira, e qualquer processamento de verdade deve continuar distribuído no cluster. O collect() não espalha as linhas pelos executors — ele as concentra. O coalesce(1) só muda a contagem de partições antes da action; o volume completo continua indo para o driver, então piora o problema em vez de resolvê-lo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-045",
    domainCode: 3,
    stem: `A gold aggregate — weekly revenue by region — is currently a plain Delta table that a nightly Lakeflow Job fully rewrites with INSERT OVERWRITE. The team is evaluating replacing it with a materialized view defined in a Lakeflow Declarative Pipeline, and the lead must explain the operational difference between the two approaches.

Which comparison is correct?`,
    options: [
      "A materialized view still requires the team to write, schedule, and maintain the refresh job that keeps its cached results up to date",
      "A plain Delta table refreshes itself on a schedule it owns, so wrapping it in a nightly Lakeflow Job rewrites the same data twice",
      "A materialized view is declarative — the platform refreshes it on its configured schedule, incrementally processing source changes; a table plus job keeps refresh control with the team",
      "Materialized views and Delta tables are the same storage object — the two names only reflect whether a pipeline created them",
    ],
    correctIndex: 2,
    explanationEn: `A materialized view is a declarative pipeline object: you declare the query, and the pipeline that owns it refreshes the cached results on the configured schedule, incrementally processing the rows that changed upstream whenever possible — Databricks even creates the backing pipeline automatically for standalone materialized views, so the team writes no refresh code. A plain table plus a Lakeflow Job is the imperative alternative: the table does nothing by itself, and the team owns the orchestration, the write logic, and failure handling — full control, but full responsibility. The two objects are not the same thing under different names.`,
    explanationPt: `Uma materialized view é um objeto declarativo do pipeline: você declara a consulta, e o pipeline que a mantém atualiza os resultados em cache na agenda configurada, processando incrementalmente as linhas que mudaram na origem sempre que possível — a Databricks chega a criar o pipeline de suporte automaticamente para materialized views standalone, então o time não escreve código de refresh. Uma tabela comum mais um Lakeflow Job é a alternativa imperativa: a tabela não faz nada sozinha, e o time cuida da orquestração, da lógica de escrita e do tratamento de falhas — controle total, responsabilidade total. Os dois objetos não são a mesma coisa com nomes diferentes.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ldp/concepts/materialized-views",
    referenceTitle: "Materialized views (Lakeflow pipelines) — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-046",
    domainCode: 3,
    stem: `The source system resent yesterday's events file, and the bronze table now contains rows that are exactly identical across every column — a full-row duplicate of each event. The silver table must contain exactly one row per event, and for this feed a duplicate means an exact copy of the whole row.

Which PySpark operation removes these duplicated rows?`,
    options: [
      "dropDuplicates() — it removes rows that are identical across all columns; dropDuplicates(['event_id']) is the variant that keeps one row per key",
      "dropDuplicates() cannot run without a column list — Spark requires the deduplication key to be specified explicitly in every invocation",
      "distinct() — it inspects the schema and picks an arbitrary business key, such as event_id, to deduplicate the rows on its own",
      "A row_number() window ranked over all columns — exact duplicates can only be removed by ranking the identical rows and filtering down to rank one",
    ],
    correctIndex: 0,
    explanationEn: `dropDuplicates() with no arguments compares every column and removes full-row duplicates, which is exactly this feed's definition of a duplicate; its column-list form, dropDuplicates(['event_id']), is the tool when one row per business key must survive even if other columns differ. The no-argument form is valid — the column list is optional, not required. distinct() behaves like the no-argument dropDuplicates(): it also compares all columns, so it never chooses an arbitrary key. Window functions such as row_number() are unnecessary here — they matter when you must pick which duplicate to keep, not for removing exact copies.`,
    explanationPt: `O dropDuplicates() sem argumentos compara todas as colunas e remove duplicatas de linha inteira — exatamente a definição de duplicata deste feed; a forma com lista de colunas, dropDuplicates(['event_id']), é a ferramenta quando uma linha por chave de negócio deve sobreviver mesmo com outras colunas diferentes. A forma sem argumentos é válida: a lista de colunas é opcional, não obrigatória. Já o distinct() se comporta como o dropDuplicates() sem argumentos — também compara todas as colunas — e jamais escolhe uma chave arbitrária. Funções de janela como row_number() são desnecessárias aqui: elas importam quando é preciso escolher qual duplicata manter, e não para remover cópias exatas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-047",
    domainCode: 3,
    stem: `A monthly revenue report reads from a table with one row per month and region: the twelve months are values in a month column. The dashboard specification now requires one row per region with a separate output column for each month — Jan, Feb, and so on — each holding that month's revenue total.

Which SQL capability produces this shape directly?`,
    options: [
      "Hand-written conditional aggregation — twelve CASE WHEN expressions are the only way to reshape rows into columns in SQL, one per month",
      "PIVOT — it turns each distinct value of the month column into its own output column, with the aggregation applied in the same statement",
      "UNPIVOT — it rotates the month rows into columns and computes the aggregates while transposing the table",
      "explode — it expands the month values across the width of the result set, giving one column per month in a single pass",
    ],
    correctIndex: 1,
    explanationEn: `PIVOT is the native rows-to-columns operator: each distinct value of the pivoted column becomes a new output column, and the aggregate (sum of revenue) is computed inside the same statement — GROUP BY with PIVOT in SQL, or the DataFrame pivot() API, both work. Hand-written CASE WHEN aggregation can produce the same numbers, but it is not the only way in SQL, which is what the alternative claims. UNPIVOT is the inverse operator — it turns columns into rows. explode expands the elements of an array or map into rows; it never creates columns.`,
    explanationPt: `O PIVOT é o operador nativo de linhas-para-colunas: cada valor distinto da coluna pivô vira uma nova coluna de saída, e a agregação (soma da receita) é calculada dentro da mesma instrução — GROUP BY com PIVOT em SQL, ou a API pivot() do DataFrame, ambos funcionam. Agregação condicional escrita à mão com CASE WHEN até chega nos mesmos números, mas não é a única forma em SQL, como afirma a alternativa. O UNPIVOT é o operador inverso — transforma colunas em linhas. Já o explode expande os elementos de um array ou map em linhas; ele nunca cria colunas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-048",
    domainCode: 3,
    stem: `A gold orders table feeds a dashboard that averages the rating column, and stakeholders want missing ratings to count as 0 instead of NULL. The engineer preparing the aggregation must keep every order row in the output while making each NULL rating read as 0.

Which PySpark operation achieves this?`,
    options: [
      "dropna() on rating — removing the rows where rating is NULL keeps the dashboard free of missing values entirely",
      "fillna(0) on rating — it drops the rows whose rating is NULL, so only genuinely rated orders remain in the output",
      "Registering a Python UDF — no built-in DataFrame operation can substitute a constant for NULL values in a column",
      "fillna(0) on rating — it replaces each NULL rating with 0 while keeping every order row in the DataFrame",
    ],
    correctIndex: 3,
    explanationEn: `fillna() (also na.fill) substitutes a given value for NULLs in the target column: fillna(0) applied to rating turns every missing rating into 0 and keeps all rows, which satisfies both requirements at once, and a subset argument can restrict the replacement to that column. fillna never deletes rows — it is a value substitution, not a filter. dropna() is the opposite tool: it removes rows containing NULLs, so the orders would vanish and the averages would be computed over a smaller population. No UDF is needed: replacing NULLs with a constant is a one-argument native call.`,
    explanationPt: `O fillna() (também na.fill) substitui um valor dado pelos NULLs na coluna de destino: fillna(0) aplicado a rating transforma cada avaliação ausente em 0 e mantém todas as linhas, atendendo aos dois requisitos de uma vez, e o argumento subset pode restringir a substituição a essa coluna. O fillna nunca apaga linhas — é substituição de valor, não filtro. Já o dropna() é a ferramenta oposta: remove as linhas que contêm NULL, então os pedidos sumiriam e as médias seriam calculadas sobre uma população menor. Nenhuma UDF é necessária: trocar NULLs por uma constante é uma chamada nativa de um argumento.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-049",
    domainCode: 3,
    stem: `Phone numbers arrive in the bronze table in five different formats — '(11) 98888-7777', '5511988887777', '+55 11 98888-7777', among others. The silver contract requires every number normalized to E.164, such as +5511988887777. The transformation must run as native Spark expressions in the pipeline, with no custom code registered on the cluster.

Which function fits this requirement?`,
    options: [
      "A Python UDF — regex-based reformatting always requires custom code registered on the cluster before the pipeline can run it",
      "regexp_extract() — Spark's regex functions can only pull matching groups out of a string; rewriting the full value is not supported",
      "regexp_replace() — it matches a pattern with capture groups and rebuilds the string in the normalized form in one native call",
      "split() with a limit — cutting on every non-digit character resolves any phone format in a single pass of the expression",
    ],
    correctIndex: 2,
    explanationEn: `regexp_replace() is a built-in SQL and DataFrame function: it matches a regular expression against the column, uses capture groups to identify the meaningful parts (country code, area code, digits), and rebuilds the value in the target form — no UDF and no custom code registration. regexp_extract() only returns the matched substring; it cannot rewrite the input, and the claim that Spark regex cannot replace is false — regexp_replace is documented alongside it. split() can cut on separators, but it cannot reassemble the pieces into a normalized string or handle the variety of formats in one expression; chained replace() and substring() calls end up brittle.`,
    explanationPt: `O regexp_replace() é uma função built-in de SQL e DataFrame: casa uma expressão regular com a coluna, usa capture groups para identificar as partes relevantes (código do país, DDD, dígitos) e reconstrói o valor no formato alvo — sem UDF e sem registro de código customizado. O regexp_extract() só devolve o trecho que casou; ele não reescreve o valor, e a alegação de que o regex no Spark não sabe substituir é falsa — o regexp_replace está documentado ao lado dele. O split() corta em separadores, mas não remonta as partes numa string normalizada nem dá conta da variedade de formatos numa única expressão; correntes de replace() e substring() viram frágeis.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-050",
    domainCode: 3,
    stem: `A bronze table lands the amount column as STRING, with valid decimals like '125.50' and occasional junk like 'N/A'. The silver job must produce a DECIMAL(10,2) column, and every source row must survive: failed conversions should become NULL so the row can be routed to quarantine. Yesterday's run crashed with a CAST_INVALID_INPUT error on the first 'N/A' value.

Which function meets the requirement?`,
    options: [
      "try_cast(amount AS DECIMAL(10,2)) — it returns NULL for values it cannot convert, preserving the row for quarantine routing",
      "cast(amount AS DECIMAL(10,2)) — Spark substitutes a default 0 whenever the string is not a valid decimal number",
      "rlike() pre-validation — a regex can confirm the format but cannot produce the typed DECIMAL column the silver contract requires",
      "No change is needed — Spark's cast is already lenient and never raises an error when the input string is malformed",
    ],
    correctIndex: 0,
    explanationEn: `try_cast() is the lenient variant of cast(): when a value cannot be converted — an invalid format, invalid characters, or an overflow — it returns NULL instead of raising the error, so the row survives and can be filtered into quarantine afterwards. It belongs to the try_ family (try_divide, try_to_number, try_to_timestamp, and others) that trades a hard failure for a NULL. A plain cast does not substitute a default value: as the crash showed, it raises CAST_INVALID_INPUT on malformed input in this environment. A regex with rlike() can validate the shape of the string, but it still cannot turn it into a typed decimal, so it does not meet the contract on its own.`,
    explanationPt: `O try_cast() é a variante tolerante do cast(): quando um valor não pode ser convertido — formato inválido, caracteres inválidos ou overflow — ele devolve NULL em vez de lançar o erro, então a linha sobrevive e pode ser encaminhada depois para a quarentena. Ele pertence à família try_ (try_divide, try_to_number, try_to_timestamp, entre outras), que troca uma falha dura por um NULL. O cast comum não substitui um valor default: como o crash mostrou, ele lança CAST_INVALID_INPUT sobre entrada malformada neste ambiente. Uma regex com rlike() consegue validar o formato da string, mas ainda não a transforma em um decimal tipado, então não atende ao contrato sozinha.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-051",
    domainCode: 3,
    stem: `Compliance requires that every payment amount be non-negative. An engineer runs the statement below on a Delta table that already holds millions of historical rows, including negative refunds imported from a legacy migration:

\`\`\`sql
ALTER TABLE catalog.finance.payments
  ADD CONSTRAINT chk_amount CHECK (amount >= 0);
\`\`\`

What is the outcome of this statement, and why?`,
    options: [
      "It succeeds — the CHECK applies only to rows written after it is added, and existing rows are never re-validated against it",
      "It fails with a parse error — CHECK constraints are not supported on Delta tables, where only NOT NULL can be enforced",
      "It succeeds — the constraint is created in a disabled, logging-only state and only starts validating once it is enabled",
      "It fails — ADD CONSTRAINT verifies every existing row against the CHECK, and the negative rows block it until they are corrected or removed",
    ],
    correctIndex: 3,
    explanationEn: `When a CHECK constraint is added with ALTER TABLE ADD CONSTRAINT, Databricks verifies that all existing rows satisfy the expression before installing the constraint; the negative migration rows violate amount >= 0, so the statement fails and the table is left unchanged until those rows are corrected, removed, or the constraint is rewritten to allow them (for example, amount >= 0 OR adjustment_type = 'refund'). CHECK constraints are fully supported and enforced on Delta tables — every violating write fails the transaction. There is no disabled or advisory constraint state, and NOT NULL is not the only enforceable constraint.`,
    explanationPt: `Quando uma CHECK constraint é adicionada com ALTER TABLE ADD CONSTRAINT, o Databricks verifica se todas as linhas existentes satisfazem a expressão antes de instalar a constraint; as linhas negativas da migração violam amount >= 0, então o comando falha e a tabela permanece inalterada até que essas linhas sejam corrigidas, removidas, ou a constraint reescrita para aceitá-las (por exemplo, amount >= 0 OR adjustment_type = 'refund'). CHECK constraints são totalmente suportadas e aplicadas em tabelas Delta — toda escrita que viola derruba a transação. Não existe estado desativado ou apenas-de-log para constraints, e NOT NULL não é a única constraint aplicável.`,
    referenceUrl: "https://docs.databricks.com/aws/en/tables/constraints",
    referenceTitle: "Table constraints — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-052",
    domainCode: 3,
    stem: `A new data architect is reviewing the team's medallion pipeline and asks the engineers to state what belongs in the silver layer and what belongs in the gold layer. The team must agree on the canonical responsibility of each layer before designing any new gold tables.

Which statement describes the two layers correctly?`,
    options: [
      "Gold stores the raw records exactly as extracted from the source systems, preserving full source fidelity for audit and future reprocessing",
      "Silver holds cleaned, validated, conformed data, one row per business entity; gold holds the aggregates and metrics that reports consume",
      "Silver is the layer that serves dashboards and BI tools directly, while gold is where newly landed data first arrives for ingestion",
      "The layers are interchangeable copies of the same data — only naming conventions distinguish one from the other",
    ],
    correctIndex: 1,
    explanationEn: `In the medallion architecture each layer has a distinct job. Bronze keeps raw data as ingested. Silver applies data cleaning and validation, producing a refined, conformed dataset that still retains row-level detail — typically one row per business entity, such as a customer or an order. Gold performs dimensional modeling and aggregation, shaping the metrics and summary tables that business analysts, dashboards, and machine learning workloads consume. Swapping the roles (raw data in gold, BI serving in silver) breaks the whole progression of quality, and the layers are not interchangeable copies under different names.`,
    explanationPt: `Na arquitetura medallion cada camada tem um papel distinto. O bronze guarda os dados crus conforme ingeridos. O silver aplica limpeza e validação de dados, produzindo um dataset refinado e conformado que ainda preserva o detalhe de linha — tipicamente uma linha por entidade de negócio, como um cliente ou um pedido. O gold faz modelagem dimensional e agregação, desenhando as métricas e tabelas resumidas que analistas de negócio, dashboards e workloads de machine learning consomem. Trocar os papéis (dado cru no gold, atendimento de BI no silver) quebra toda a progressão de qualidade, e as camadas não são cópias intercambiáveis com nomes diferentes.`,
    referenceUrl: "https://docs.databricks.com/aws/en/lakehouse/medallion",
    referenceTitle: "Medallion lakehouse architecture — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-053",
    domainCode: 3,
    stem: `A silver pipeline must process only the rows that changed in a bronze Delta table since its last run — inserts, updates, and deletes alike — instead of rescanning the whole bronze table every night.

Which mechanism provides the incremental change stream?`,
    options: [
      "Rescan the bronze table nightly and MERGE on the primary key, accepting the full read every time",
      "Read the bronze table as a streaming source, which surfaces updates and deletes as well as inserts",
      "Enable change data feed and read the changes with table_changes, which returns each change with its type",
      "Keep a hand-built control table of processed ids, refreshed by a nightly full scan",
    ],
    correctIndex: 2,
    explanationEn: `Change data feed records row-level changes — inserts, updates, deletes — between versions of a Delta table once enabled, and a downstream job reads them with table_changes (or the streaming readChangeFeed source), receiving each change with its change type and originating commit version. That is exactly the incremental stream the silver pipeline needs. A nightly rescan with MERGE wastes the full read; a plain streaming read of a Delta table surfaces only appended rows, not updates and deletes; and a hand-built control table reproduces poorly what CDF provides natively.`,
    explanationPt: `O change data feed registra as mudanças por linha — inserts, updates e deletes — entre versões de uma tabela Delta, uma vez habilitado, e um job a jusante as lê com table_changes (ou a fonte de streaming readChangeFeed), recebendo cada mudança com seu tipo e a versão do commit de origem. É exatamente o stream incremental de que o pipeline silver precisa. Reescanear com MERGE toda noite desperdiça a leitura completa; a leitura streaming comum de uma tabela Delta só mostra linhas anexadas, não updates e deletes; e uma tabela de controle feita à mão reproduz mal o que o CDF fornece nativamente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/tables/features/change-data-feed",
    referenceTitle: "Use change data feed — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-054",
    domainCode: 3,
    stem: `A bronze events table stores customer details in a nested column, declared as follows:

\`\`\`sql
customer STRUCT<name: STRING, address: STRUCT<city: STRING, country: STRING>>
\`\`\`

The silver table must expose the customer's city as a top-level column. The engineer wants the simplest native way to read that nested field, without flattening or custom code.

Which approach is correct?`,
    options: [
      "Dot notation — select customer.address.city, which resolves nested struct fields natively in SQL and PySpark; arrays use bracket indexing like items[0]",
      "Explode the structs first — a nested field can only be read after the entire struct has been flattened into separate rows of the DataFrame",
      "Rewrite the transformation in SQL — PySpark DataFrames cannot traverse fields that live inside a struct column",
      "Register a Python UDF — native functions cannot reach inside a struct, so the field must be parsed out in custom code",
    ],
    correctIndex: 0,
    explanationEn: `Nested struct fields are first-class citizens in Spark: the dotted path customer.address.city resolves the field directly in both SQL and PySpark (col("customer.address.city") or the equivalent expression), so the silver query is a single select. Array elements are reached with bracket indexing, such as items[0]. No flattening is required — explode is for turning array or map elements into rows, and it would explode the table's grain rather than just expose one field. Structs are equally readable from SQL and from DataFrames, and no UDF is needed: the engine parses the nested schema natively.`,
    explanationPt: `Campos aninhados de struct são cidadãos de primeira classe no Spark: o caminho pontuado customer.address.city resolve o campo direto em SQL e em PySpark (col("customer.address.city") ou a expressão equivalente), então a consulta do silver é um único select. Elementos de array são acessados com indexação por colchetes, como items[0]. Nenhum achatamento é necessário — explode serve para transformar elementos de array ou map em linhas, e ele explodiria a granularidade da tabela em vez de apenas expor um campo. Structs são igualmente legíveis de SQL e de DataFrames, e nenhuma UDF é precisa: o engine interpreta o schema aninhado nativamente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-055",
    domainCode: 3,
    stem: `A data engineer builds an intermediate DataFrame in her notebook: a read of a large Parquet dataset from cloud storage, a join with a 5 GB dimension, a filter to active regions, and a deduplication pass. Five cells later in the same notebook reuse that DataFrame, and each one currently re-runs the whole lineage, taking about six minutes per cell. She wants the reuse to be fast and the memory released when the notebook ends.

Which approach fits?`,
    options: [
      "Call cache() before the first action runs, so that even the initial computation that materializes the DataFrame becomes faster",
      "Call cache() in the very first cell and rely on the cached data surviving cluster termination, so that tomorrow's job run reuses it",
      "Do nothing, because Spark automatically caches every DataFrame in memory after its first action and reuses it for free",
      "Call cache() on the DataFrame, materialize it with an action once, and call unpersist() when the last consuming cell finishes",
    ],
    correctIndex: 3,
    explanationEn: `cache() does not compute anything by itself: it marks the DataFrame, and the data is materialized in memory when the first action runs, so the initial computation still pays the full cost — only the five later cells get the speedup from the reuse. The cache belongs to the cluster's executors and vanishes when the cluster terminates, so no later job run inherits it, and unpersist() is only about freeing memory inside this notebook session. Spark never memoizes DataFrames on its own: without the explicit call, every action re-executes the whole lineage from the source.`,
    explanationPt: `cache() não computa nada por conta própria: ele marca o DataFrame, e os dados são materializados em memória quando a primeira action roda — a computação inicial continua pagando o custo cheio, e apenas as cinco células seguintes ganham velocidade com o reuso. O cache pertence aos executors do cluster e desaparece quando o cluster termina, então nenhuma execução posterior de job o herda; o unpersist() serve apenas para liberar memória dentro da sessão deste notebook. O Spark nunca guarda DataFrames automaticamente: sem a chamada explícita, toda action reexecuta o lineage inteiro a partir da origem.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-056",
    domainCode: 3,
    stem: `Marketing asks the data team for a very specific list: every registered customer who did not place a single order in October. The relevant tables are catalog.sales.customers, with one row per customer, and catalog.sales.orders, with many rows per order. The engineer wants a single PySpark join call that returns exactly those customers and nothing else.

Which join type should the engineer use?`,
    options: [
      "'left_semi', which returns the customers whose key has no match among the orders",
      "'left_anti', which returns the customers whose key has no match among the orders",
      "No native join type can do this; it must be emulated with a LEFT JOIN plus a filter for NULLs on the right side",
      "'left_anti', which deletes the matching order rows from the orders table so that the customers appear unmatched",
    ],
    correctIndex: 1,
    explanationEn: `A left_anti join returns exactly the rows from the left table whose join key has no match in the right table — here, the customers with no October orders. Its mirror image is left_semi, which returns the left rows that DO have a match, so it produces the opposite list. left_anti is a read-only join type: it never deletes or modifies rows of the orders table, it only filters the left side. And a native join type does exist, so emulating it with a LEFT JOIN plus an IS NULL filter is unnecessary, even though that pattern would compute the same set.`,
    explanationPt: `Um left_anti join retorna exatamente as linhas da tabela da esquerda cuja chave de junção não tem correspondência na direita — aqui, os clientes sem pedidos em outubro. Sua imagem espelhada é o left_semi, que devolve as linhas da esquerda que TÊM correspondência, produzindo a lista oposta. left_anti é um tipo de join somente de leitura: nunca apaga nem modifica linhas da tabela de pedidos, apenas filtra o lado esquerdo. E existe sim um tipo de join nativo, de modo que emular com LEFT JOIN mais um filtro IS NULL é desnecessário, ainda que esse padrão calculasse o mesmo conjunto.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-057",
    domainCode: 3,
    stem: `A re-delivered bronze file duplicated customer records: the same customer_id now appears up to three times, and the copies differ in their updated_at values, so no two rows are fully identical. For the silver table, the team must end up with exactly one row per customer_id, and keeping any one of the copies is acceptable. A teammate proposes calling distinct() on the bronze DataFrame.

What is the difference between the two candidate calls?`,
    options: [
      "distinct() compares every column, so rows that differ in updated_at all survive; dropDuplicates(['customer_id']) keeps a single row per key",
      "distinct() and dropDuplicates() are interchangeable, so the teammate's call would already deduplicate on the customer_id key",
      "distinct() accepts a column list, as in distinct('customer_id'), and deduplicates on just the columns passed to it",
      "dropDuplicates(['customer_id']) cannot work by itself; it must be combined with a row_number() window to pick the surviving row",
    ],
    correctIndex: 0,
    explanationEn: `distinct() and dropDuplicates() with no argument compare the entire row, every column, so the duplicated customers — which differ in updated_at — would all survive distinct(). dropDuplicates(['customer_id']) narrows the comparison to the key and keeps a single row per customer_id; because any copy is acceptable, the nondeterministic survivor is fine here. distinct() takes no column list in PySpark, so there is no distinct('customer_id') call. A row_number() window is needed only when the surviving row must be chosen deterministically, for example the row with the latest updated_at.`,
    explanationPt: `distinct() e dropDuplicates() sem argumento comparam a linha inteira, todas as colunas; por isso os clientes duplicados — que diferem em updated_at — sobreviveriam ao distinct(). dropDuplicates(['customer_id']) restringe a comparação à chave e mantém uma única linha por customer_id; como qualquer cópia serve, o sobrevivente não determinístico resolve aqui. distinct() não aceita lista de colunas no PySpark, logo não existe uma chamada distinct('customer_id'). Um window com row_number() só é necessário quando a linha sobrevivente precisa ser escolhida de forma determinística, por exemplo a de maior updated_at.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-058",
    domainCode: 3,
    stem: `An analyst joins customers to loyalty_accounts on customer_id and is surprised to see that customers whose customer_id is NULL disappear from the output. The join call passes no join type:

\`\`\`python
customers.join(loyalty_accounts, "customer_id")
\`\`\`

A teammate argues that switching to a left join will not help, because a NULL key never matches anything anyway. Which statement is correct?`,
    options: [
      "NULL is treated as equal to NULL in the join, so those customers did match loyalty rows that also carry a NULL key",
      "A join whose key column contains NULL fails outright with an error, and those rows were rejected while all the other rows joined normally",
      "NULL never satisfies an equality comparison, so the default inner join drops those rows — a left join would keep them, padded with NULLs",
      "Spark converts NULL keys to empty strings before joining, so the customers survive in the output under a different value",
    ],
    correctIndex: 2,
    explanationEn: `In SQL's three-valued logic, any equality involving NULL evaluates to UNKNOWN, which the join treats as no match: a NULL customer_id matches nothing, not even another NULL. join() with no type argument defaults to an inner join, so the left rows with NULL keys find no match and are dropped — exactly what the analyst observed. Switching to a left join WOULD preserve those rows, padded with NULLs on the loyalty side; the teammate's conclusion is right about the matching but wrong about the left join. No error is ever raised, and Spark performs no implicit conversion of NULL to an empty string.`,
    explanationPt: `Na lógica de três valores do SQL, qualquer igualdade envolvendo NULL avalia para UNKNOWN, que o join trata como não correspondência: um customer_id NULL não casa com nada, nem com outro NULL. join() sem tipo de junção assume inner join por padrão, então as linhas da esquerda com chave NULL ficam sem par e são descartadas — exatamente o que o analista observou. Trocar para left join AS preservaria, preenchidas com NULLs do lado do loyalty; a conclusão do colega está certa sobre o casamento, mas errada sobre o left join. Nenhum erro é levantado, e o Spark não converte implicitamente NULL para string vazia.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-059",
    domainCode: 3,
    stem: `A monthly revenue report must show one row per month with two separate columns, web_revenue and store_revenue. The source is a large orders table with the columns event_month, channel, and amount, and the report must compute both totals in a single pass over the table.

Which construct computes the two metrics in one aggregation?`,
    options: [
      "One query per channel, each filtering WHERE channel = 'web' or WHERE channel = 'store', whose result sets are combined into the report afterwards",
      "GROUP BY channel with SUM(amount), which yields one row per channel carrying that channel's revenue total",
      "PIVOT on channel, which is limited to count aggregations and therefore cannot produce revenue sums per channel",
      "SUM(amount) FILTER (WHERE channel = 'web') and SUM(amount) FILTER (WHERE channel = 'store') within one GROUP BY event_month",
    ],
    correctIndex: 3,
    explanationEn: `The FILTER clause restricts an aggregate to the rows that satisfy its condition, so a single scan of the table feeds both conditional sums under one GROUP BY event_month — the equivalent classic form is SUM(CASE WHEN channel = 'web' THEN amount END). Running one query per channel scans the table once per channel, violating the single-pass requirement. GROUP BY channel changes the output shape to one row per channel instead of one row per month with two columns. And PIVOT is not limited to counts: it accepts arbitrary aggregations, including SUM, so the claim in that option is simply false.`,
    explanationPt: `A cláusula FILTER restringe uma agregação às linhas que satisfazem sua condição; assim, uma única varredura da tabela alimenta as duas somas condicionais sob um único GROUP BY event_month — a forma clássica equivalente é SUM(CASE WHEN channel = 'web' THEN amount END). Rodar uma consulta por canal varre a tabela uma vez por canal, violando o requisito de passada única. GROUP BY channel muda o formato da saída para uma linha por canal, em vez de uma linha por mês com duas colunas. E o PIVOT não se limita a contagens: aceita agregações arbitrárias, incluindo SUM, logo a afirmação dessa opção é simplesmente falsa.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-060",
    domainCode: 3,
    stem: `The bronze orders table stores an ARRAY<STRING> column named coupon_codes. The attribution notebook needs one row per order_id and coupon pair, but many orders carry no coupons at all — their array is empty or NULL — and those orders must still appear in the output, with NULL in the coupon position, so that order totals reconcile.

Which expression should the notebook use?`,
    options: [
      "explode(coupon_codes) — rows whose array is empty or NULL are preserved, with NULL in the generated column",
      "explode_outer(coupon_codes) — rows whose array is empty or NULL are preserved, with NULL in the generated column",
      "posexplode(coupon_codes) — as the positional variant of explode, it is the one that preserves rows with empty or NULL arrays",
      "No generator is safe here — an empty array aborts the query, so orders without coupons must be filtered out before exploding",
    ],
    correctIndex: 1,
    explanationEn: `explode_outer applies outer semantics to the generator: rows whose array is empty or NULL are kept in the output with NULL in the generated column — exactly what the reconciliation needs, since every order still appears, once per coupon or once with NULL. Plain explode silently drops those rows, and posexplode does the same; it only adds a pos column to the pairs it emits. Generators never abort a query because of an empty or NULL array, so pre-filtering the orders would only lose data instead of protecting anything.`,
    explanationPt: `explode_outer aplica semântica outer ao generator: as linhas cujo array é vazio ou NULL permanecem na saída com NULL na coluna gerada — exatamente o que a reconciliação precisa, já que todo pedido continua aparecendo, uma vez por cupom ou uma vez com NULL. O explode comum descarta silenciosamente essas linhas, e o posexplode faz o mesmo; ele apenas acrescenta a coluna pos nos pares que emite. Generators jamais abortam a consulta por causa de um array vazio ou NULL, de modo que pré-filtrar os pedidos só perderia dados, em vez de proteger algo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-061",
    domainCode: 3,
    stem: `A reporting query must return every order, joined to its payment when one exists, while showing only approved payment details:

\`\`\`sql
SELECT o.order_id, p.status
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE p.status = 'APPROVED';
\`\`\`

After running it, the analyst notices that orders without any payment are missing from the results. Why did they disappear, and what is the fix?`,
    options: [
      "The WHERE clause runs after the join: NULL-padded orders fail p.status = 'APPROVED', turning the LEFT JOIN into an inner join — move the predicate to ON",
      "ON and WHERE are interchangeable in outer joins, so the missing orders must have been lost by a different filter somewhere upstream",
      "Spark automatically rewrites WHERE predicates on the right table into the ON clause, so rewriting the query manually is pointless",
      "A LEFT JOIN by definition never returns orders that lack a matching payment; preserving them requires a FULL OUTER JOIN instead",
    ],
    correctIndex: 0,
    explanationEn: `In an outer join, the ON clause decides which rows match, and the WHERE clause filters the already-joined result. Orders without payments do survive the LEFT JOIN, padded with NULLs — but for those rows p.status = 'APPROVED' evaluates to UNKNOWN, and WHERE keeps only TRUE, so the rows vanish and the join behaves exactly like an inner join. Moving the right-table predicate into the ON clause preserves the unmatched orders while still showing only approved payment details. ON and WHERE are not interchangeable in outer joins, Spark performs no such rewrite automatically, and LEFT JOIN is precisely the join that preserves unmatched left rows.`,
    explanationPt: `Em um outer join, a cláusula ON decide quais linhas casam, e a cláusula WHERE filtra o resultado já juntado. Os pedidos sem pagamento sobrevivem ao LEFT JOIN, preenchidos com NULLs — mas, nessas linhas, p.status = 'APPROVED' avalia para UNKNOWN, e o WHERE mantém apenas TRUE; as linhas somem e o join se comporta exatamente como um inner join. Mover o predicado da tabela da direita para o ON preserva os pedidos sem par e ainda mostra apenas detalhes de pagamento aprovados. ON e WHERE não são intercambiáveis em outer joins, o Spark não faz essa reescrita automaticamente, e o LEFT JOIN é justamente o join que preserva as linhas sem correspondência à esquerda.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-062",
    domainCode: 3,
    stem: `The weekly engagement report counts reviews with the expression SELECT count(comment_text) FROM catalog.reviews. The reported number comes out lower than the table's actual row count, and QA confirms that many customers submit a star rating only, leaving comment_text NULL. The report must count every review.

Which expression and explanation are correct?`,
    options: [
      "count(comment_text) counts every row, NULLs included, so the missing reviews must be dropped somewhere else in the pipeline",
      "count(*) skips any row that contains a NULL in one of its columns, so both expressions under-report on nullable tables",
      "count(expr) counts only rows where expr is not NULL; count(*) counts every row, so the report needs count(*) to total all reviews",
      "count(*) and count(col) are equivalent and always return the same number, so the shortfall must come from a stale result cache",
    ],
    correctIndex: 2,
    explanationEn: `count with an expression counts only the rows where that expression is not NULL, so count(comment_text) skips every rating-only review — those rows are exactly the shortfall the report shows. count(*) counts rows regardless of NULLs in any column, and count(1) behaves the same way, so the report should use count(*) or count the non-nullable review_id. The two forms are not equivalent on nullable columns, and nothing downstream dropped the rows: the entire difference comes from NULL handling inside count itself, not from caching or filters.`,
    explanationPt: `count com uma expressão conta apenas as linhas em que a expressão não é NULL, então count(comment_text) pula toda avaliação só com estrelas — essas linhas são exatamente a diferença que o relatório apresenta. count(*) conta linhas independentemente de NULLs nas colunas, e count(1) se comporta da mesma forma; portanto o relatório deve usar count(*) ou contar a coluna review_id, que não é nula. As duas formas não são equivalentes em colunas nullable, e nenhum processo a jusante descartou as linhas: toda a diferença vem do tratamento de NULL dentro do próprio count, não de cache nem de filtros.`,
    referenceUrl: "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions",
    referenceTitle: "Spark SQL built-in functions — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-063",
    domainCode: 3,
    stem: `A nightly reprocessing job was accidentally deployed with this write and, on its first run, replaced an entire silver table with only a partial re-run's worth of data:

\`\`\`python
df.write.mode("overwrite").saveAsTable("catalog.sales.silver_payments")
\`\`\`

The team now wants every reprocessing job to fail loudly instead of touching a table that already exists. Which save mode gives that behavior?`,
    options: [
      "append, which replaces the table's previous contents with each new batch that gets written",
      "overwrite, which refuses to write whenever the target table already contains any data at all",
      "No save mode is needed, because Delta treats the modes as advisory hints and always appends the incoming data atomically",
      "errorIfExists, the default save mode, which makes the write fail if the target table already exists",
    ],
    correctIndex: 3,
    explanationEn: `errorIfExists is the default save mode: when no mode is set, a write to an existing table fails instead of modifying it — the loud failure the team now wants after the incident. append only adds the new batch on top of the existing data and never replaces previous contents. overwrite always replaces the existing data; it does not refuse to write when data is present, and the wiped silver table is the direct proof. Delta also fully honors save modes: they are binding behaviors of the write, not advisory hints that the engine may ignore.`,
    explanationPt: `errorIfExists é o save mode padrão: quando nenhum modo é definido, a escrita em uma tabela existente falha em vez de modificá-la — a falha ruidosa que o time agora quer depois do incidente. append apenas acrescenta o novo lote sobre os dados existentes e nunca substitui o conteúdo anterior. overwrite sempre substitui os dados existentes; ele não se recusa a escrever quando há dados, e a tabela silver apagada é a prova direta. O Delta também honra integralmente os save modes: são comportamentos vinculantes da escrita, não sugestões que o engine pode ignorar.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/best-practices",
    referenceTitle: "Best practices: Delta Lake — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S3-064",
    domainCode: 3,
    stem: `A late-arrival job rebuilds only yesterday's slice of the events table, which is partitioned by event_date. In a single write, it must atomically replace only the rows whose event_date equals '2026-07-02' and leave every other day of the table untouched; the job's output DataFrame contains just the rebuilt day.

Which write approach meets both requirements?`,
    options: [
      "Run DELETE on the day's rows and then INSERT the corrected batch afterwards — each statement is atomic on its own, and together they cover the day",
      "Write with mode('overwrite') and no further options — the whole table is replaced atomically, which also refreshes yesterday's rows",
      "Write with mode('overwrite') and option('replaceWhere', \"event_date = '2026-07-02'\") — only the matching rows are replaced, in one atomic commit",
      "Convert the table to external storage first, because replaceWhere cannot operate on Unity Catalog managed tables",
    ],
    correctIndex: 2,
    explanationEn: `With replaceWhere, an overwrite write replaces only the rows that satisfy the predicate, in a single atomic transaction — the surgical replacement the job needs, leaving the rest of the table untouched. DELETE followed by INSERT is two separate transactions: between them, concurrent readers see the day missing, and a failure after the DELETE leaves the table without yesterday's data. Plain mode('overwrite') replaces the entire table, so a DataFrame holding only the rebuilt day would wipe every other day. And replaceWhere works on Unity Catalog managed tables just as well as on external ones, so no conversion is required.`,
    explanationPt: `Com replaceWhere, uma escrita em modo overwrite substitui apenas as linhas que satisfazem o predicado, em uma única transação atômica — a substituição cirúrgica de que o job precisa, deixando o restante da tabela intocado. DELETE seguido de INSERT são duas transações separadas: entre elas, leitores concorrentes veem o dia ausente, e uma falha após o DELETE deixa a tabela sem os dados de ontem. O mode('overwrite') puro substitui a tabela inteira, então um DataFrame com apenas o dia reconstruído apagaria todos os outros dias. E o replaceWhere funciona em tabelas gerenciadas do Unity Catalog tão bem quanto em externas, logo nenhuma conversão é necessária.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/best-practices",
    referenceTitle: "Best practices: Delta Lake — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-065",
    domainCode: 3,
    stem: `Every night, a MERGE synchronizes catalog.sales.silver_orders with the source extract, updating matched orders and inserting new ones:

\`\`\`sql
MERGE INTO catalog.sales.silver_orders AS t
USING catalog.sales.source_orders AS s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *
\`\`\`

Orders are sometimes deleted in the source, and those deletions must also disappear from silver_orders, in the same atomic statement. Which clause adds this behavior?`,
    options: [
      "WHEN NOT MATCHED BY SOURCE THEN DELETE — it applies to the target rows whose keys have no counterpart in the source table",
      "WHEN NOT MATCHED THEN DELETE — that clause already covers the target rows that are absent from the source",
      "None: every MERGE clause can only act on rows of the source, so unmatched target rows are out of the statement's reach",
      "Deletion is outside MERGE's scope, so schedule a separate DELETE ... WHERE order_id NOT IN (SELECT ...) after every merge runs",
    ],
    correctIndex: 0,
    explanationEn: `The two NOT MATCHED clauses look at opposite sides. WHEN NOT MATCHED fires for source rows that have no counterpart in the target — the inserts already in the merge. WHEN NOT MATCHED BY SOURCE fires for target rows that have no counterpart in the source; there you can DELETE or UPDATE them, which removes the source-deleted orders in the same atomic commit, and an optional AND condition (for example, on a date column) keeps the clause from rewriting the whole target table. A separate DELETE afterwards is unnecessary and gives up the atomicity that the requirement demands.`,
    explanationPt: `As duas cláusulas NOT MATCHED enxergam lados opostos. WHEN NOT MATCHED dispara para as linhas da fonte que não têm correspondência no alvo — os inserts que já estão no merge. WHEN NOT MATCHED BY SOURCE dispara para as linhas do alvo que não têm correspondência na fonte; nelas é possível fazer DELETE ou UPDATE, removendo os pedidos apagados na origem no mesmo commit atômico, e uma condição AND opcional (por exemplo, em uma coluna de data) evita que a cláusula reescreva a tabela alvo inteira. Um DELETE separado depois é desnecessário e abre mão da atomicidade que o requisito exige.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/merge",
    referenceTitle: "Merge data (Delta Lake upsert) — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S3-066",
    domainCode: 3,
    stem: `An ingestion job appends a DataFrame to catalog.sales.customers, an existing Delta table. This week the source schema added a new column, loyalty_tier, and the append now fails Delta's schema enforcement. The team wants the write to succeed by adding the new column to the table, and no existing rows should be rewritten.

Which write option achieves this?`,
    options: [
      "Use .option('overwriteSchema', 'true'), which adds the new column to the table while leaving every previously written row untouched",
      "Use .option('mergeSchema', 'true'), which evolves the table schema additively — the new column is added with no rewrite",
      "Use a TBLPROPERTIES change that turns schema enforcement off permanently, so that no write option is ever needed again",
      "Use mergeSchema, keeping in mind that it also drops table columns that the incoming DataFrame no longer carries",
    ],
    correctIndex: 1,
    explanationEn: `mergeSchema enables additive schema evolution on the write: the new loyalty_tier column is added to the table schema, existing rows are not rewritten, and they simply read as NULL for the new column. overwriteSchema is the full-rewrite path — it replaces the table's schema along with its data, so it does not add a column while preserving the previously written rows. Delta has no table property that turns schema enforcement off; the supported mechanism for additive evolution is exactly this write option. And mergeSchema never removes columns: it only adds new ones, so columns absent from the incoming DataFrame stay in place.`,
    explanationPt: `mergeSchema habilita a evolução aditiva de schema na escrita: a nova coluna loyalty_tier é adicionada ao schema da tabela, as linhas existentes não são reescritas e passam a ler como NULL na coluna nova. overwriteSchema é o caminho de reescrita completa — substitui o schema da tabela junto com os dados, logo não adiciona uma coluna preservando as linhas já gravadas. O Delta não tem table property que desligue o schema enforcement; o mecanismo suportado para evolução aditiva é exatamente esta opção de escrita. E mergeSchema nunca remove colunas: apenas adiciona as novas, então colunas ausentes no DataFrame de entrada permanecem no lugar.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/best-practices",
    referenceTitle: "Best practices: Delta Lake — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-067",
    domainCode: 3,
    stem: `Years of analytics history live as Parquet datasets in the company's cloud storage lake. Governance now requires these datasets to become Delta tables, so that the lakehouse gains ACID transactions and time travel on top of them, but the data files must stay exactly where they are — no copies, no rewrites, no new storage locations.

Which approach meets the requirement?`,
    options: [
      "Run CREATE TABLE AS SELECT over each dataset, copying the rows into newly written Delta files under a managed location",
      "Run CONVERT TO DELTA, which copies the existing Parquet files into the table's managed storage location first",
      "Register the datasets as plain external Parquet tables instead — Parquet already guarantees ACID transactions, so converting them adds nothing",
      "Run CONVERT TO DELTA on each dataset — Delta builds its transaction log over the existing files in place, without copying them",
    ],
    correctIndex: 3,
    explanationEn: `CONVERT TO DELTA — for example CONVERT TO DELTA parquet.\`s3://lake/history/2024/\` — creates a Delta transaction log on top of the existing data files, in place: nothing is copied or rewritten, the files stay at their current location, and the table gains ACID transactions and time travel. A CTAS physically rewrites the data into new files under a new location, violating the requirement. The option describing CONVERT as a copy into managed storage confuses it with a CTAS into a managed table. And plain Parquet has no transaction log, so by itself it provides no ACID guarantees at all.`,
    explanationPt: `CONVERT TO DELTA — por exemplo CONVERT TO DELTA parquet.\`s3://lake/history/2024/\` — cria um transaction log Delta sobre os arquivos de dados existentes, no próprio local: nada é copiado nem reescrito, os arquivos permanecem onde estão e a tabela ganha transações ACID e time travel. Uma CTAS reescreve fisicamente os dados em arquivos novos, em um novo local, violando o requisito. A opção que descreve o CONVERT como uma cópia para o storage gerenciado o confunde com uma CTAS para uma tabela gerenciada. E o Parquet puro não tem transaction log, então por si só não oferece garantias ACID alguma.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/",
    referenceTitle: "Delta Lake guide — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-068",
    domainCode: 3,
    stem: `The development team wants a safe sandbox for risky experiments: a copy of the 100 TB production table catalog.sales.orders that they can transform, rewrite, and even corrupt without consequences. Storage costs must not double, and any commits made on the copy must never affect the production table.

Which approach fits?`,
    options: [
      "CREATE TABLE dev.orders AS SHALLOW CLONE catalog.sales.orders — the clone reuses the existing data files while keeping independent metadata and history",
      "CREATE TABLE dev.orders AS DEEP CLONE catalog.sales.orders — a deep clone shares the underlying data files with the source table",
      "CREATE TABLE dev.orders AS SELECT * FROM catalog.sales.orders — a full physical copy is unavoidable whenever dev writes must remain isolated from production",
      "A shallow clone works only for read-only experiments: it keeps inheriting every later commit made on the source, so dev writes would flow back",
    ],
    correctIndex: 0,
    explanationEn: `A shallow clone copies only metadata — schema, partitioning, table properties — and points at the source's existing data files, so it costs almost no new storage; from the moment it is created it is an independent table with its own history, so commits on the clone never affect production, and vice versa. A deep clone copies both the data and the metadata, duplicating the 100 TB. A CTAS likewise writes a full physical copy, which isolation does not require. A shallow clone also does not keep inheriting later source commits; the one operational caveat is that a VACUUM on the source can invalidate the files the clone references.`,
    explanationPt: `Um shallow clone copia apenas os metadados — schema, particionamento, table properties — e aponta para os arquivos de dados existentes da origem, então consome quase nenhum storage novo; a partir do momento em que é criado é uma tabela independente, com histórico próprio, de modo que commits no clone nunca afetam a produção, e vice-versa. Um deep clone copia dados e metadados, duplicando os 100 TB. Uma CTAS igualmente escreve uma cópia física completa, o que o isolamento não exige. Um shallow clone tampouco herda os commits posteriores da origem; o único cuidado operacional é que um VACUUM na origem pode invalidar os arquivos que o clone referencia.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/",
    referenceTitle: "Delta Lake guide — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S3-069",
    domainCode: 3,
    stem: `A monthly reconciliation must compare the bank statement feed with the ledger: every row from either side must appear in the output, matched rows side by side, and rows present on only one side kept with NULLs on the other.

Which join produces this result?`,
    options: [
      "A FULL OUTER JOIN keeps rows from both sides, matching on keys and filling NULLs otherwise",
      "An INNER JOIN on transaction_id, which guarantees that every row of both sides appears in the result",
      "A LEFT JOIN of bank against ledger, which keeps unmatched ledger rows as NULLs",
      "A UNION of both feeds, which places corresponding rows side by side for comparison",
    ],
    correctIndex: 0,
    explanationEn: `A FULL OUTER JOIN keeps every row from both inputs: where the keys match, the row is combined; where a row exists only on one side, it appears with NULLs for the other side — the exact shape a reconciliation needs. An INNER JOIN discards unmatched rows from both sides, a LEFT JOIN preserves only the left input's unmatched rows, and UNION stacks rows on top of each other rather than placing corresponding values side by side.`,
    explanationPt: `O FULL OUTER JOIN mantém toda linha das duas entradas: onde as chaves casam, a linha é combinada; onde a linha existe de um só lado, ela aparece com NULLs do outro — exatamente o formato que uma reconciliação precisa. O INNER JOIN descarta as linhas sem par dos dois lados, o LEFT JOIN preserva apenas as linhas sem par da entrada da esquerda, e o UNION empilha as linhas uma sobre a outra em vez de colocar os valores correspondentes lado a lado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/pyspark/reference",
    referenceTitle: "PySpark API reference — Databricks Docs",
    difficulty: "MEDIUM",
  },
];

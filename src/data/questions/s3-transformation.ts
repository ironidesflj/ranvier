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
    referenceUrl: "https://docs.databricks.com/aws/en/spark/latest/spark-sql/language-manual/functions",
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
      "silver = bronze.withColumnRenamed('event_time', 'event_time_ts')",
      "silver = bronze.withColumn('event_time', col('event_time').cast('timestamp')).withColumn('amount', col('amount').cast('double'))",
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
      "In the silver layer, because bronze should preserve the raw data as landed so it can be replayed and audited when cleaning rules change",
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
      "The join key is not unique in dim_prices, so each sale matches one row per store that carries the product and rows fan out — join on both product_id and store_id",
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
      "A Cartesian product of 200,000 rows (40 x 5,000) — fine for this job, but cross joins grow as rows-times-rows and explode on large inputs",
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
      "DataFrame.union() is UNION ALL by design — it stacks rows positionally without removing duplicates; append .distinct() or dropDuplicates() to deduplicate",
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
      "split() returns an ARRAY column, so first_name and last_name would hold arrays — .getItem(0) and .getItem(1) are needed to extract the string elements",
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
    referenceUrl: "https://docs.databricks.com/aws/en/spark/latest/spark-sql/language-manual/functions",
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
      "col('status') != 'CANCELLED' evaluates to NULL when status is NULL, and filter() keeps only rows where the predicate is true — add an explicit isNull() branch or use the null-safe operator",
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
      "The proposal is correct — orderBy(col('ingested_at').desc()) guarantees that dropDuplicates(['order_id']) keeps the newest row per order",
      "dropDuplicates(['order_id']) keeps an arbitrary row per key and is not bound by the preceding sort — use row_number() over a window partitioned by order_id and ordered by ingested_at DESC, keeping only rn = 1",
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
    referenceUrl: "https://docs.databricks.com/aws/en/spark/latest/spark-sql/language-manual/functions",
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
      "spark.sql.shuffle.partitions defaults to 200 and controls the partitions used to shuffle data for joins and aggregations — lower it for this data size, or rely on AQE coalescing, and then re-measure in the Spark UI",
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
      "AQE only optimizes queries whose source tables are cached in memory — uncached tables always use the static plan",
      "AQE re-optimizes the query at runtime using statistics from completed stages — it coalesces shuffle partitions, converts sort-merge joins into broadcast hash joins, and splits skewed partitions — and it is enabled by default on Databricks",
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
      "Increase the memory available to executors — pick a larger worker type or raise spark.executor.memory — then re-run and check task metrics in the Spark UI",
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
      "A materialized view with an hourly refresh schedule, because its precomputed results are stored and refreshed automatically",
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
      "CHECK constraints are advisory — they are recorded in the schema but never block a write",
      "PRIMARY KEY constraints reject INSERT statements that would create duplicate key values",
      "NOT NULL and CHECK constraints are enforced on writes, while PRIMARY KEY and FOREIGN KEY constraints are informational only and are not enforced",
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
];

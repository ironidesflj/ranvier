import type { SeedQuestion } from "./types";

/**
 * Section 2 — Data Ingestion and Loading (21%)
 * Target: 24 questions total (S2-001 .. S2-024).
 * All facts verified against the official Databricks docs URLs referenced per question.
 */
export const s2Questions: SeedQuestion[] = [
  {
    key: "S2-001",
    domainCode: 2,
    stem: `A streaming media company is designing its ingestion layer on the Databricks Data Intelligence Platform. It has three sources:

- A legacy billing system that delivers a complete extract of all open invoices every Sunday night
- A partner that drops small CSV files into an Amazon S3 bucket several times per hour
- A website that emits click events continuously to a message bus

Which mapping of ingestion pattern to source is correct?`,
    options: [
      "Billing extract: streaming ingestion; partner CSVs: reload the entire bucket on every run; click events: weekly scheduled batch",
      "All three sources: nightly batch with full reprocessing, because batch processing keeps track of what has already been processed",
      "Billing extract: batch load; partner CSVs: incremental loading of only the newly arrived files; click events: streaming ingestion",
      "Billing extract: incremental load keyed by invoice ID; partner CSVs: stateful streaming deduplication; click events: hourly batch of the previous hour",
    ],
    correctIndex: 2,
    explanationEn: `Batch processing does not track what has already been processed — it processes everything available at run time — which is a natural fit for the weekly full extract. The hourly CSV drops call for incremental loading: COPY INTO or Auto Loader records which files were already loaded and picks up only the new arrivals. The continuous clickstream is the classic streaming case, where data is processed as it arrives with low latency. The other mappings either impose continuous-reading overhead on a weekly snapshot, or add latency where events need to flow in near real time.`,
    explanationPt: `No processamento em batch, o engine não controla o que já foi processado: tudo que está disponível no momento da execução é processado — combinação natural com o extract semanal completo. Os CSVs que chegam de hora em hora pedem carregamento incremental: o COPY INTO ou o Auto Loader registram quais arquivos já foram carregados e capturam apenas as novas chegadas. O clickstream contínuo é o caso clássico de streaming, em que os dados são processados conforme chegam, com baixa latência. As outras combinações impõem overhead de leitura contínua a um snapshot semanal ou adicionam latência onde os eventos precisam fluir em tempo quase real.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-engineering/batch-vs-streaming",
    referenceTitle: "Batch vs. streaming data processing — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-002",
    domainCode: 2,
    stem: `A product manager e-mails the data engineering team a weekly CSV export that lives on her laptop. The team needs its contents in a Unity Catalog-governed Delta table and plans to run this statement once the file is available on a storage path:

\`\`\`sql
COPY INTO main.ops.weekly_orders
FROM '/Volumes/main/ingest/uploads/'
FILEFORMAT = CSV;
\`\`\`

Which approach correctly makes the laptop file available to this statement?`,
    options: [
      "Point the FROM clause at the file path on the product manager's laptop, such as 'C:/exports/orders.csv', because COPY INTO can read any path the analyst can open",
      "Upload the file into a Unity Catalog volume (for example, with the Catalog Explorer upload option) so it lands on a UC-governed cloud storage path that COPY INTO can read",
      "Place the file in the workspace DBFS root with dbutils.fs.put, because DBFS paths are automatically governed by Unity Catalog",
      "Attach the CSV to a notebook cell and run spark.read.csv on the uploaded artifact, since notebook attachments behave like Unity Catalog tables",
    ],
    correctIndex: 1,
    explanationEn: `COPY INTO reads from a file location in cloud object storage — Amazon S3, ADLS, GCS, Azure Blob — or from Unity Catalog volumes through /Volumes paths. A path on an analyst's laptop is not reachable by the compute running the statement, so the recommended pattern for local files is to upload them into a UC volume, which places the data on a governed cloud-storage path that COPY INTO can ingest. The DBFS root is legacy storage that Unity Catalog does not govern, and notebook attachments are not queryable tables.`,
    explanationPt: `O COPY INTO lê de um local de arquivos no cloud object storage — Amazon S3, ADLS, GCS, Azure Blob — ou de volumes do Unity Catalog por meio de caminhos /Volumes. Um caminho no laptop da analista não é acessível ao compute que executa o comando; por isso, o padrão recomendado para arquivos locais é fazer o upload para um volume do UC, o que coloca os dados em um caminho governado no cloud storage que o COPY INTO consegue ingerir. A raiz do DBFS é storage legado que o Unity Catalog não governa, e anexos de notebook não são tabelas consultáveis.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-003",
    domainCode: 2,
    stem: `A data engineer schedules this statement as the single task of a nightly Lakeflow Job. The source folder accumulates Parquet files throughout the day:

\`\`\`sql
COPY INTO main.ops.bookings_raw
FROM 'abfss://landing@storacct.dfs.core.windows.net/bookings/'
FILEFORMAT = PARQUET;
\`\`\`

What happens on a night when no new files have arrived since the last successful run?`,
    options: [
      "The statement completes successfully and loads zero rows, because files that were already loaded by previous runs are skipped",
      "The statement fails with a duplicate-file error, because COPY INTO re-inserts every file in the folder on every run",
      "The statement reloads all files, and the team must schedule a MERGE job afterwards to remove the duplicates",
      "The statement blocks until new files arrive, because COPY INTO behaves like a streaming source waiting for data",
    ],
    correctIndex: 0,
    explanationEn: `COPY INTO is retriable and idempotent: the target table tracks which source files have already been loaded, and those files are skipped on subsequent runs, giving exactly-once file processing by default. Running it again with no new files is a harmless no-op — the statement succeeds and inserts nothing. It does not reload the folder (so there are no duplicates and no deduplication job), and it is a one-shot SQL command, not a streaming source that waits for new arrivals.`,
    explanationPt: `O COPY INTO é reexecutável e idempotente: a tabela de destino rastreia quais arquivos de origem já foram carregados, e esses arquivos são ignorados nas execuções seguintes — processamento de arquivos exactly-once por padrão. Rodá-lo de novo sem arquivos novos é uma operação inofensiva: o comando conclui com sucesso e não insere nada. Ele não recarrega a pasta (logo, sem duplicatas e sem job de deduplicação) e é um comando SQL pontual, não uma fonte de streaming que aguarda novas chegadas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-004",
    domainCode: 2,
    stem: `A team must load JSON booking updates from a Unity Catalog volume with COPY INTO. The producer occasionally adds new fields, so the files do not all share the same schema, and the team wants new fields to appear in the target table automatically instead of causing failures. The target table has not been created yet.

Which approach meets these requirements?`,
    options: [
      "Create the table with an explicit schema listing every column seen so far, so that COPY INTO fails fast whenever a file carries an unexpected field",
      "Create an empty table without declaring columns and set the table property 'delta.columnMapping.mode' = 'name' so unmatched JSON fields map automatically",
      "Read each day's files with spark.read.json, union them with the existing table, and overwrite the table nightly, because COPY INTO cannot handle differing schemas",
      "Create an empty placeholder table without declaring columns, then run COPY INTO with 'mergeSchema' = 'true' in FORMAT_OPTIONS and COPY_OPTIONS so the schema is inferred and merged on each load",
    ],
    correctIndex: 3,
    explanationEn: `This is the documented pattern for loading files with differing schemas: an empty placeholder Delta table plus COPY INTO with mergeSchema enabled in both FORMAT_OPTIONS and COPY_OPTIONS lets Databricks infer the schema and evolve it as new fields show up in the JSON files. COPY INTO explicitly advertises target-table schema inference, mapping, merging, and evolution as capabilities. Failing fast on new fields defeats the requirement; column mapping mode is for renaming or dropping columns, not for merging new JSON fields; and DataFrame overwrites discard the table history.`,
    explanationPt: `Esse é o padrão documentado para carregar arquivos com schemas diferentes: uma tabela Delta de placeholder vazia mais COPY INTO com mergeSchema habilitado em FORMAT_OPTIONS e COPY_OPTIONS permite que o Databricks infira o schema e o evolua conforme novos campos aparecem nos arquivos JSON. O COPY INTO anuncia explicitamente inferência, mapeamento, mesclagem e evolução de schema na tabela de destino como capacidades. Falhar rápido em campos novos contraria o requisito; o column mapping mode serve para renomear ou remover colunas, não para mesclar novos campos JSON; e overwrites com DataFrames descartam o histórico da tabela.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-005",
    domainCode: 2,
    stem: `A newly hired data engineer runs the following statement in a workspace where Unity Catalog manages all data access:

\`\`\`sql
COPY INTO main.ops.shipments
FROM 'abfss://raw@companylake.dfs.core.windows.net/shipments/'
FILEFORMAT = PARQUET;
\`\`\`

The target table exists, but the statement fails with a path access error. What must be configured before COPY INTO can read this location?`,
    options: [
      "A DBFS mount point for the storage account, because COPY INTO can only read paths that are mounted under /mnt",
      "A Unity Catalog storage credential and an external location for the abfss:// path, with READ FILES permission granted to the engineers who run the load",
      "The storage account key embedded directly in the FROM clause, so COPY INTO authenticates on each run",
      "An ingestion gateway deployed next to the storage account's private endpoint",
    ],
    correctIndex: 1,
    explanationEn: `The documented prerequisite for COPY INTO is that an administrator configures data access for ingestion: a Unity Catalog storage credential and an external location that overlays the cloud path, plus the READ FILES privilege for the users running the command. DBFS mounts are the legacy mechanism that Unity Catalog replaces and are not recommended for governed access; COPY INTO has no syntax for inline credentials; and ingestion gateways belong to Lakeflow Connect database connectors, not to file loads.`,
    explanationPt: `O pré-requisito documentado do COPY INTO é que um administrador configure o acesso a dados para ingestão: uma storage credential do Unity Catalog e uma external location que sobreponha o caminho na nuvem, além do privilégio READ FILES para os usuários que executam o comando. Montagens de DBFS são o mecanismo legado que o Unity Catalog substitui — não recomendadas para acesso governado; o COPY INTO não tem sintaxe para credenciais inline; e ingestion gateways pertencem aos conectores de banco de dados do Lakeflow Connect, não a cargas de arquivos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-006",
    domainCode: 2,
    stem: `A team copies this snippet from an old tutorial to ingest JSON files that keep arriving in a Unity Catalog volume:

\`\`\`python
df = (spark.read
  .format("cloudFiles")
  .option("cloudFiles.format", "json")
  .load("/Volumes/main/ingest/events/"))
\`\`\`

The job runs on a schedule, but each run never picks up files that arrived after the very first execution, and no schema inference is configured.

Which change turns this into a working Auto Loader stream with schema inference and evolution?`,
    options: [
      `Switch the reader to spark.readStream.format("cloudFiles") and keep everything else unchanged, because schema inference needs no additional options`,
      `Keep spark.read and add .option("cloudFiles.schemaLocation", ...) to the reader, since the batch reader supports Auto Loader options too`,
      `Use spark.readStream.format("cloudFiles") with the cloudFiles.format option and point cloudFiles.schemaLocation at a durable directory, which is what enables schema inference and evolution`,
      `Replace format("cloudFiles") with format("streamingFiles") and set checkpointLocation on the reader, because schemaLocation only applies to Delta targets`,
    ],
    correctIndex: 2,
    explanationEn: `Auto Loader is a Structured Streaming source: it must be read with spark.readStream.format("cloudFiles") so it can incrementally discover files as they arrive. Specifying cloudFiles.schemaLocation (or providing an explicit schema) is what enables schema inference, and it is also where Auto Loader tracks schema changes over time. A spark.read call reads the directory once with no memory between runs; "streamingFiles" is not a source name; and checkpointLocation is set on the write side, not in the reader.`,
    explanationPt: `O Auto Loader é uma fonte do Structured Streaming: precisa ser lido com spark.readStream.format("cloudFiles") para conseguir descobrir arquivos incrementalmente conforme chegam. Especificar cloudFiles.schemaLocation (ou fornecer um schema explícito) é o que habilita a inferência de schema — e é ali que o Auto Loader acompanha as mudanças de schema ao longo do tempo. Uma chamada spark.read lê o diretório uma única vez, sem memória entre execuções; "streamingFiles" não é um nome de fonte; e checkpointLocation é definido no lado da escrita, não no leitor.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-007",
    domainCode: 2,
    stem: `An Auto Loader stream that feeds a Unity Catalog-governed Delta table failed in the middle of the night after processing part of the incoming file batch. In the morning, the on-call engineer restarts the stream from the same notebook, pointing at the same input directory, checkpoint location, and target table.

What does Auto Loader guarantee after the restart?`,
    options: [
      "It resumes from where it left off: files already recorded in the RocksDB-backed state inside the checkpoint location are not reprocessed, preserving exactly-once semantics into the Delta target",
      "It starts over and re-ingests every file in the input directory, so the on-call engineer must schedule a deduplication job after every recovery",
      "It skips the partially processed files and leaves a gap that must be backfilled manually before the next run",
      "It truncates the target Delta table and reloads all files so the table returns to a consistent state",
    ],
    correctIndex: 0,
    explanationEn: `Auto Loader persists the metadata of discovered files in a scalable key-value store (RocksDB) in the checkpoint location. This state guarantees exactly-once processing: on restart, the stream resumes from where it stopped, and files whose entries are already recorded are not ingested again, so no duplicates appear in the Delta table. Nothing needs to be truncated, reloaded, or deduplicated, and gaps do not occur, because unfinished work is resumed rather than abandoned.`,
    explanationPt: `O Auto Loader persiste os metadados dos arquivos descobertos em um key-value store escalável (RocksDB) dentro do checkpoint location. Esse estado garante processamento exactly-once: ao reiniciar, o stream retoma de onde parou, e arquivos cujas entradas já estão registradas não são ingeridos de novo — nenhuma duplicata aparece na tabela Delta. Não é preciso truncar, recarregar ou deduplicar nada, e não ficam lacunas, porque o trabalho inacabado é retomado em vez de abandonado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-008",
    domainCode: 2,
    stem: `To reduce storage costs, a cloud administrator applies a 30-day lifecycle expiration rule to every prefix under the S3 bucket that hosts an Auto Loader stream's checkpoint directory. The stream has run daily for two months against the same input directory.

What is the impact, and what should the team have done instead?`,
    options: [
      "No impact: the checkpoint is rebuilt automatically from the target table's Delta transaction log on the next run",
      "Auto Loader silently switches to file notification mode because its checkpoint state is missing",
      "Only files from the last 30 days are reprocessed, because Delta time travel caps recovery at 30 days",
      "The stream state is corrupted and the stream must restart from scratch, likely reprocessing files; checkpoints are critical infrastructure that belongs in durable storage such as a dedicated Unity Catalog volume, never under lifecycle policies",
    ],
    correctIndex: 3,
    explanationEn: `The checkpoint stores the stream's progress and file state, and Databricks guidance is to treat it as critical infrastructure. If lifecycle policies delete checkpoint files, the state is corrupted and the stream must restart from scratch — with the input directory unchanged, that can mean reprocessing and duplicated data. Best practice is to store the checkpoint with the stream's output in durable, output-side storage such as a dedicated UC volume, keep a separate checkpoint per stream, and never let lifecycle rules touch it. Checkpoints are not reconstructed from the Delta log, and no automatic mode switch occurs.`,
    explanationPt: `O checkpoint armazena o progresso do stream e o estado dos arquivos, e a orientação do Databricks é tratá-lo como infraestrutura crítica. Se políticas de ciclo de vida apagarem os arquivos de checkpoint, o estado fica corrompido e o stream precisa recomeçar do zero — com o diretório de entrada intacto, isso pode significar reprocessamento e dados duplicados. A prática recomendada é guardar o checkpoint junto da saída do stream, em storage durável como um volume dedicado do UC, usar um checkpoint separado por stream e nunca deixar regras de lifecycle tocá-lo. Checkpoints não são reconstruídos a partir do log do Delta, e não há troca automática de modo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/best-practices",
    referenceTitle: "Auto Loader best practices — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-009",
    domainCode: 2,
    stem: `An Auto Loader stream reads files that land in Amazon S3 at a rate that has grown to hundreds of thousands of files per hour spread over a deep directory tree. The stream uses directory listing mode with a continuous trigger, and monthly cloud bills show ever-increasing S3 LIST request charges. The team can obtain the elevated cloud permissions required for notification setup.

Which change best addresses the cost and scalability problem?`,
    options: [
      "Keep directory listing mode and raise cloudFiles.fetchParallelism so that the directory tree is listed more quickly",
      "Switch the stream to file notification mode, in which a notification service and queue subscribe to file events, scaling to millions of files per hour at lower cost than repeated full listing",
      "Require producers to write into a single flat directory so that each run needs only one LIST call",
      "Replace Auto Loader with a scheduled COPY INTO statement, because COPY INTO lists the directory more cheaply than Auto Loader",
    ],
    correctIndex: 1,
    explanationEn: `In file notification mode, Auto Loader sets up a notification service and a queue that subscribe to file events from the input directory, and Databricks recommends this mode — including file events on external locations — over directory listing for most workloads, especially continuous triggers, where directory listing repeatedly lists the whole directory and drives up LIST API costs. File notification mode scales to millions of files per hour and is faster and more scalable. Tweaking parallelism, flattening the tree, or swapping in COPY INTO does not remove the repeated full-directory listing that causes the cost.`,
    explanationPt: `No modo file notification, o Auto Loader configura um serviço de notificação e uma fila que assinam os eventos de arquivo do diretório de entrada — e o Databricks recomenda esse modo, incluindo file events em external locations, em vez do directory listing para a maioria dos workloads, sobretudo com triggers contínuos, em que o directory listing varre o diretório inteiro repetidamente e encarece as chamadas de LIST. O file notification mode escala para milhões de arquivos por hora e é mais rápido. Ajustar paralelismo, achatar a árvore de diretórios ou trocar por COPY INTO não elimina a listagem completa repetida que causa o custo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/file-notification-mode",
    referenceTitle: "Auto Loader file notification mode — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-010",
    domainCode: 2,
    stem: `A team runs Auto Loader against Amazon S3 in classic file notification mode: they set cloudFiles.useNotifications to true and grant Auto Loader the permissions it needs to create cloud resources in the bucket.

Which resources does Auto Loader create so that newly uploaded files are announced to the stream?`,
    options: [
      "An AWS Lambda function that watches the bucket and writes new object keys to a DynamoDB table that Auto Loader polls",
      "An Amazon Kinesis Data Firehose delivery stream that receives ObjectCreated events and feeds them into an SQS queue",
      "An Amazon SNS topic subscribed to the bucket's object-created notifications, with an Amazon SQS queue that Auto Loader consumes",
      "An Azure Event Grid subscription and an Azure Queue Storage queue, which Databricks uses as its cross-cloud default",
    ],
    correctIndex: 2,
    explanationEn: `On S3, classic file notification mode provisions an AWS SNS topic as the subscription service and an AWS SQS queue as the queue service — resources named with the databricks-auto-ingest prefix. The bucket publishes object-created events to the topic, the queue subscribes to it, and Auto Loader consumes and deletes messages as files are processed (hence the sqs:DeleteMessage permission requirement). Event Grid with Queue Storage is the equivalent pair on Azure storage, and GCS uses Pub/Sub; Lambda, DynamoDB, and Kinesis are not part of this design.`,
    explanationPt: `No S3, o modo clássico de file notification provisiona um tópico AWS SNS como serviço de assinatura e uma fila AWS SQS como serviço de enfileiramento — recursos nomeados com o prefixo databricks-auto-ingest. O bucket publica eventos de objeto criado no tópico, a fila assina esse tópico e o Auto Loader consome e apaga as mensagens conforme processa os arquivos (daí a exigência da permissão sqs:DeleteMessage). Event Grid com Queue Storage é o par equivalente no Azure; no GCS usa-se Pub/Sub; Lambda, DynamoDB e Kinesis não fazem parte desse design.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/file-notification-mode",
    referenceTitle: "Auto Loader file notification mode — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-011",
    domainCode: 2,
    stem: `A bank's security policy forbids creating event notification services or queues in its cloud storage accounts. The data team still wants Auto Loader to ingest new files from a modest source directory that receives a few dozen files per day, with minimal setup.

Which file discovery mode should the team use, and why?`,
    options: [
      "File notification mode with file events, because managed file events require no cloud permission grants at all",
      "Classic file notification mode, because the team can create the queues themselves instead of letting Auto Loader do it",
      "Plain batch reads with spark.read, because Auto Loader cannot run without notification services",
      "Directory listing mode: it is Auto Loader's default and needs no permission configuration beyond read access to the storage path, which suits small directories",
    ],
    correctIndex: 3,
    explanationEn: `Directory listing mode is Auto Loader's default and lets a stream start with no setup beyond access to the data in cloud storage. Databricks guidance positions it for small directories, one-time backfills, or situations where security policies prevent file events; its cost is the LIST API traffic from scanning, which stays modest for a few dozen daily files. File events need a one-time cloud permissions grant and an external location enabled for them; classic notification still requires creating queue resources; and Auto Loader does not depend on notification services to run.`,
    explanationPt: `O directory listing mode é o padrão do Auto Loader e permite iniciar um stream sem nenhuma configuração além do acesso aos dados no cloud storage. A orientação do Databricks o posiciona para diretórios pequenos, backfills pontuais ou cenários em que políticas de segurança impedem file events; o custo fica no tráfego de LIST decorrente da varredura, que é modesto para algumas dezenas de arquivos por dia. File events exigem um grant único de permissões na nuvem e uma external location habilitada; o modo clássico ainda exige criar recursos de fila; e o Auto Loader não depende de serviços de notificação para funcionar.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/directory-listing-mode",
    referenceTitle: "Auto Loader directory listing mode — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-012",
    domainCode: 2,
    stem: `Event files like the one below arrive continuously in a UC volume, and the team starts Auto Loader with schema inference (no explicit schema, cloudFiles.schemaLocation set):

\`\`\`json
{"user_id": 1042, "event_ts": "2026-05-01T10:22:31Z", "amount": 49.9, "profile": {"tier": "gold", "region": "emea"}}
\`\`\`

What schema does Auto Loader infer by default, and how can the team get typed columns such as numbers and timestamps?`,
    options: [
      "All fields — including the nested ones inside profile — are inferred as string, because JSON does not encode types; set cloudFiles.inferColumnTypes to true to let Auto Loader infer types like long, double, and timestamp",
      "user_id becomes long, amount becomes double, event_ts becomes timestamp, and profile becomes a struct, because Auto Loader always samples rows and picks the narrowest matching type",
      "The profile object is rejected, because Auto Loader cannot infer nested structures from JSON files",
      "Top-level fields are strings while nested fields keep their JSON types, so only profile.tier and profile.region are correctly typed",
    ],
    correctIndex: 0,
    explanationEn: `For formats that do not encode data types — JSON, CSV, and XML — Auto Loader infers every column as string, including nested fields, sampling the first 50 GB or 1,000 files to build the schema. Setting cloudFiles.inferColumnTypes to true adopts the DataFrameReader-style behavior of deriving types from the sample, so user_id, amount, and event_ts come back typed while profile still infers as a struct. Nested inference works fine, there is no split behavior where nested fields keep types while top-level ones do not, and schema hints can alternatively pin specific field types.`,
    explanationPt: `Para formatos que não codificam tipos — JSON, CSV e XML — o Auto Loader infere todas as colunas como string, incluindo os campos aninhados, amostrando os primeiros 50 GB ou 1.000 arquivos para montar o schema. Definir cloudFiles.inferColumnTypes como true adota o comportamento do DataFrameReader, derivando tipos da amostra: user_id, amount e event_ts voltam tipados, e profile continua inferido como struct. A inferência aninhada funciona normalmente — não existe um comportamento misto em que só os campos aninhados preservam tipos — e, alternativamente, schema hints podem fixar tipos específicos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-013",
    domainCode: 2,
    stem: `An Auto Loader stream with an inferred schema has run for weeks using only the default schema evolution settings. This morning, the producer adds a new column loyalty_points to the JSON files.

What happens on the next micro-batch, and what does Databricks recommend operationally?`,
    options: [
      "The new column is silently ignored forever; to add it, the team must edit the inferred schema files stored under the schema location",
      "The stream keeps running with the old schema and quietly stores all loyalty_points values in the _rescued_data column, with no interruption at all",
      "Auto Loader adds loyalty_points to the end of the inferred schema and then the stream stops with an UnknownFieldException; after the stream is restarted, processing continues with the updated schema, and Databricks recommends configuring Auto Loader streams with Lakeflow Jobs so they restart automatically",
      "The stream drops the offending files into a bad records path and keeps ingesting the remaining files with the old schema",
    ],
    correctIndex: 2,
    explanationEn: `With the default addNewColumns mode, Auto Loader detects the new column, merges it into the schema stored at the schema location, and then stops the stream with an UnknownFieldException — the data types of existing columns are untouched. The fix is simply restarting the stream, which resumes with the updated schema; because this restart is expected, Databricks recommends wiring Auto Loader streams into Lakeflow Jobs with automatic restarts. Storing new columns in _rescued_data without interruption describes the rescue mode, not the default; schemas are not hand-edited, and files are not diverted to a bad records path for a schema change.`,
    explanationPt: `No modo padrão addNewColumns, o Auto Loader detecta a nova coluna, mescla-a no schema armazenado no schema location e então encerra o stream com um UnknownFieldException — os tipos das colunas existentes não mudam. A correção é simplesmente reiniciar o stream, que retoma com o schema atualizado; como essa reinicialização é esperada, o Databricks recomenda conectar streams do Auto Loader a Lakeflow Jobs com reinício automático. Guardar colunas novas no _rescued_data sem interrupção descreve o modo rescue, não o padrão; schemas não são editados à mão, e arquivos não são desviados para um bad records path por causa de mudança de schema.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-014",
    domainCode: 2,
    stem: `A compliance feed must land in a table whose schema has to stay strictly stable — no automatic column additions. At the same time, the team cannot tolerate ingestion outages when the feed occasionally sends unexpected extra fields, and it wants those values preserved for later inspection.

Which cloudFiles.schemaEvolutionMode setting satisfies all three requirements?`,
    options: [
      "addNewColumns — new fields are merged into the table schema and the stream resumes automatically",
      "rescue — the schema never evolves, the stream never fails due to schema changes, and unexpected fields are recorded in the rescued data column",
      "failOnNewColumns — the stream stops whenever a new field appears and stays down until someone updates the schema or removes the file",
      "addNewColumnsWithTypeWidening — new fields are merged and compatible type changes are widened automatically",
    ],
    correctIndex: 1,
    explanationEn: `The rescue evolution mode is designed exactly for this: Auto Loader never evolves the schema and the stream does not fail due to schema changes, but every new column is recorded in the rescued data column, where the team can inspect the unexpected values later. addNewColumns and its type-widening variant mutate the table schema, violating the stability requirement; failOnNewColumns does keep the schema fixed, but it stops ingestion until a human intervenes, violating the no-outage requirement.`,
    explanationPt: `O modo rescue foi desenhado exatamente para isso: o Auto Loader nunca evolui o schema e o stream não falha por causa de mudanças de schema, mas toda coluna nova é registrada na rescued data column, onde o time pode inspecionar depois os valores inesperados. addNewColumns e sua variante com type widening alteram o schema da tabela, violando o requisito de estabilidade; failOnNewColumns até mantém o schema fixo, mas para a ingestão até uma intervenção humana, violando o requisito de não ter interrupções.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-015",
    domainCode: 2,
    stem: `An Auto Loader stream runs with an inferred schema. In today's batch, some records use a column name with different casing (OrderID instead of order_id), and one field's value does not match the type Auto Loader inferred for it.

Where does this non-conforming data end up?`,
    options: [
      "The affected records are dropped silently; only a row-count discrepancy in the stream metrics hints that something was lost",
      "The stream fails immediately, because case mismatches and type mismatches are fatal errors during schema inference",
      "The mismatched values are redirected to the bad records path that Auto Loader configures by default for every stream",
      "They are captured in the _rescued_data column that Auto Loader adds automatically — a JSON blob holding the non-conforming fields along with the source file path",
    ],
    correctIndex: 3,
    explanationEn: `When Auto Loader infers a schema, it automatically adds a rescued data column named _rescued_data. It captures columns missing from the schema, type mismatches, and case mismatches, storing them as a JSON blob together with the source file path — so no data is silently lost and the stream does not crash. badRecordsPath and the corrupt-record column are for records that cannot be parsed at all, such as malformed JSON, not for case or type mismatches, and they are not created by default.`,
    explanationPt: `Quando o Auto Loader infere um schema, ele adiciona automaticamente uma rescued data column chamada _rescued_data. Ela captura colunas ausentes no schema, divergências de tipo e divergências de caixa (case), guardando tudo como um blob JSON junto com o caminho do arquivo de origem — nada se perde silenciosamente e o stream não cai. O badRecordsPath e a coluna de registros corrompidos servem para registros que não conseguem ser parseados de forma alguma, como JSON malformado — não para diferenças de case ou tipo — e não são criados por padrão.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-016",
    domainCode: 2,
    stem: `Auto Loader is ingesting the JSON events below with schema inference, so every field — nested ones included — is currently a string:

\`\`\`json
{"event_ts": "2026-05-01T10:22:31Z", "amount": "49.90", "user_info": {"id": "1042", "dob": "1990-04-18"}}
\`\`\`

The team wants event_ts read as TIMESTAMP, amount as DOUBLE, and user_info.dob as DATE, while all other fields keep being inferred automatically.

Which Auto Loader option does this?`,
    options: [
      `cloudFiles.schemaHints, for example 'event_ts TIMESTAMP, amount DOUBLE, user_info.dob DATE', which pins the known field types and leaves the rest to inference`,
      `cloudFiles.schemaEvolutionMode set to addNewColumnsWithTypeWidening, which converts inferred strings into native types as data arrives`,
      `cloudFiles.inferColumnTypes together with a full .schema() declaration listing every column, including all nested fields`,
      `cloudFiles.rescuedDataColumn, which casts values rescued from type mismatches back into typed columns`,
    ],
    correctIndex: 0,
    explanationEn: `Schema hints exist precisely for this: cloudFiles.schemaHints takes an SQL-style specification such as 'event_ts TIMESTAMP, amount DOUBLE, user_info.dob DATE' and enforces those types on the inferred schema — including nested field paths — while fields you do not mention continue to be inferred. Type widening only handles compatible type changes like int to long, not string-to-timestamp conversions; supplying a full .schema() replaces inference entirely and disables addNewColumns evolution; and the rescued data column holds data that did not conform rather than casting anything.`,
    explanationPt: `Os schema hints existem exatamente para isso: cloudFiles.schemaHints recebe uma especificação estilo SQL, como 'event_ts TIMESTAMP, amount DOUBLE, user_info.dob DATE', e impõe esses tipos ao schema inferido — incluindo caminhos de campos aninhados — enquanto os campos não mencionados continuam sendo inferidos. O type widening só trata mudanças compatíveis de tipo (como int para long), não conversões de string para timestamp; fornecer um .schema() completo substitui a inferência por inteiro e desativa a evolução addNewColumns; e a rescued data column guarda dados que não aderiram ao schema, em vez de converter algo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-017",
    domainCode: 2,
    stem: `A retailer wants to ingest files from cloud object storage into a Unity Catalog-governed table once per night. The pipeline should start on a schedule, process whatever files have arrived, and then stop, so the team pays only for a short run instead of compute that stays on around the clock.

Which design matches these requirements?`,
    options: [
      `Start a stream with .trigger(processingTime='1 hour') and leave it running continuously, so each micro-batch picks up new files as they arrive`,
      `Configure the stream with .trigger(availableNow=True) so it processes all data available at launch and then stops, and schedule the run with a time-based trigger in a Lakeflow Job`,
      `Run Trigger.Once inside a while loop in a single notebook so the stream never gets a chance to idle`,
      `Skip Auto Loader entirely and use a one-time spark.read.parquet, because Auto Loader cannot be used for scheduled batch-style loads`,
    ],
    correctIndex: 1,
    explanationEn: `Trigger.AvailableNow is the documented way to run a streaming source in an incremental batch style: the query starts, processes everything available at launch, and terminates, with the Lakeflow Job schedule deciding when runs happen. This triggered — rather than continuous — pattern keeps cost low because no compute idles between runs. A processingTime trigger keeps the stream and its compute alive between micro-batches; a while-loop of Trigger.Once leaves a notebook holding resources; and Auto Loader is fully supported for scheduled, batch-style ingestion.`,
    explanationPt: `O Trigger.AvailableNow é a forma documentada de executar uma fonte de streaming em estilo batch incremental: a query inicia, processa tudo que está disponível no lançamento e termina — e o agendamento do Lakeflow Job decide quando cada execução acontece. Esse padrão triggered (em vez de contínuo) mantém o custo baixo porque nenhum compute fica ocioso entre execuções. Um trigger processingTime mantém o stream e o compute dele vivos entre micro-batches; um laço de Trigger.Once deixa um notebook retendo recursos; e o Auto Loader é totalmente suportado para ingestão agendada em estilo batch.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/best-practices",
    referenceTitle: "Auto Loader best practices — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-018",
    domainCode: 2,
    stem: `A logistics company must ingest shipment telemetry from a supplier's bucket: roughly 5,000 new Parquet files per day arriving around the clock, volume growing about 20% per year, and the producer occasionally adds columns. The team wants low operational overhead with schema handled automatically. The SQL-first team lead proposes a scheduled COPY INTO statement that runs every 15 minutes.

What should the data engineering team recommend?`,
    options: [
      "Accept COPY INTO — it scales to any file count and absorbs column changes as long as it runs frequently enough",
      "Replace it with a nightly spark.read.parquet overwrite of the entire bucket, which avoids streaming checkpoints entirely",
      "Use Auto Loader — for example, landing the files into a streaming table — because it tracks processed files incrementally, scales to very large file volumes, and supports schema inference and evolution",
      "Query the supplier's operational database over JDBC instead, because file-based ingestion cannot keep up with around-the-clock arrivals",
    ],
    correctIndex: 2,
    explanationEn: `Auto Loader is built for exactly this profile: it incrementally and efficiently processes new files as they arrive, scales to millions of files per hour and even billions of files for backfills, and detects schema drift with inference and evolution, so added columns are handled without rewrites. COPY INTO suits simple, cheap loads of a small, known set of files — for a more scalable and robust file ingestion experience, Databricks recommends streaming tables backed by Auto Loader. Full-bucket overwrites reprocess everything and lose history, and JDBC is irrelevant when the source is files in a bucket.`,
    explanationPt: `O Auto Loader foi construído exatamente para esse perfil: processa incrementalmente e com eficiência os novos arquivos conforme chegam, escala para milhões de arquivos por hora — e bilhões em backfills — e detecta desvios de schema com inferência e evolução, então colunas novas são tratadas sem reescritas. O COPY INTO é adequado para cargas simples e baratas de um conjunto pequeno e conhecido de arquivos; para uma ingestão de arquivos mais escalável e robusta, o Databricks recomenda streaming tables com Auto Loader. Overwrites do bucket inteiro reprocessam tudo e perdem histórico; e JDBC é irrelevante quando a origem são arquivos num bucket.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-019",
    domainCode: 2,
    stem: `Sales operations needs Salesforce data — accounts, opportunities, and their ongoing changes — replicated into Unity Catalog-governed Delta tables. The requirements are minimal operational overhead, no ingestion code for the team to maintain, change capture from the SaaS source, and full governance on the target tables.

Which approach should the data engineering team prioritize?`,
    options: [
      "A nightly full CSV export from Salesforce into S3, loaded by a scheduled COPY INTO statement",
      "A partner ELT tool deployed on the team's own compute that writes Parquet files to an external location",
      "A custom Structured Streaming job against the Salesforce REST API, owned and maintained by the platform team",
      "The Lakeflow Connect managed SaaS connector for Salesforce, which runs as a serverless, Databricks-operated ingestion pipeline and writes to Unity Catalog-governed streaming tables",
    ],
    correctIndex: 3,
    explanationEn: `Databricks guidance is to start with the most managed layer available: Lakeflow Connect managed connectors build ingestion pipelines that are governed by Unity Catalog and powered by serverless compute, with source-specific authentication, incremental reads (change tracking or a cursor column, as with the Salesforce connector), automated retries, and automated schema evolution. Scheduled full exports lose currency and change history, while self-run partner tooling and custom streaming code shift operational burden onto the team and integrate less tightly with Unity Catalog governance.`,
    explanationPt: `A orientação do Databricks é começar pela camada mais gerenciada disponível: os managed connectors do Lakeflow Connect criam pipelines de ingestão governados pelo Unity Catalog e alimentados por compute serverless, com autenticação específica da origem, leituras incrementais (change tracking ou coluna de cursor, como no conector do Salesforce), retries automáticos e evolução de schema automática. Exportações completas agendadas perdem atualidade e histórico de mudanças, enquanto ferramentas de parceiro executadas por você e código de streaming próprio transferem o custo operacional para o time e integram menos com a governança do Unity Catalog.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-020",
    domainCode: 2,
    stem: `The team configures a Lakeflow Connect managed streaming connector for a Confluent Kafka topic that carries semi-structured JSON order events. Everything must live in Unity Catalog, and the team must not manage any compute for the ingestion.

Which set of components does Lakeflow Connect stand up, and how does the data flow?`,
    options: [
      "A Unity Catalog connection that stores the source credentials, a serverless ingestion pipeline, and Unity Catalog-governed streaming tables as the destination — ingesting incrementally on each run",
      "A job cluster that runs an Auto Loader notebook and writes Parquet files to an external location registered as a foreign catalog",
      "An ingestion gateway virtual machine in the team's VPC plus staging storage that the team must size, patch, and monitor",
      "A Lakeflow Job with a dbt task that materializes the topic into hourly materialized views",
    ],
    correctIndex: 0,
    explanationEn: `Managed streaming connectors use three components: a Unity Catalog connection (a securable that holds the endpoint and credentials), an ingestion pipeline that runs on serverless compute, and destination streaming tables in Unity Catalog. Incremental ingestion applies as well: the first run loads the selected data while change tracking is captured, and later runs read only what changed. No customer-managed compute is involved for streaming connectors, the ingestion gateway belongs to database connectors and is operated by the managed service, and the destination is UC streaming tables — not a foreign Parquet catalog or dbt models.`,
    explanationPt: `Os managed streaming connectors usam três componentes: uma connection do Unity Catalog (securable que guarda o endpoint e as credenciais), um ingestion pipeline que roda em compute serverless e streaming tables de destino no Unity Catalog. A ingestão incremental também se aplica: a primeira execução carrega os dados selecionados enquanto o rastreamento de mudanças é capturado, e as execuções seguintes leem apenas o que mudou. Nenhum compute gerenciado pelo cliente está envolvido para streaming connectors — o ingestion gateway pertence aos database connectors e é operado pelo serviço gerenciado — e o destino são streaming tables no UC, não um catálogo Parquet externo nem modelos dbt.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-021",
    domainCode: 2,
    stem: `A notebook task extracts a 400-million-row table from a PostgreSQL data warehouse over JDBC. The current read runs on a single connection and takes hours:

\`\`\`python
orders = (spark.read.format("jdbc")
  .option("url", jdbc_url)
  .option("dbtable", "sales.orders")
  .option("user", user)
  .option("password", pwd)
  .load())
\`\`\`

How should the team parallelize the read, and what is the effect?`,
    options: [
      "Set numPartitions=8 alone; Spark opens eight simultaneous queries against sales.orders without needing any column or bound options",
      "Add partitionColumn (an indexed, uniformly distributed column) together with lowerBound, upperBound, and numPartitions; Spark then splits the read into multiple concurrent queries over value ranges of that column",
      "Set fetchSize=100000 so each round trip pulls more rows through the existing single connection, which parallelizes the fetch",
      "Set partitionColumn to the primary key and numPartitions=500 to maximize the number of simultaneous queries against the warehouse",
    ],
    correctIndex: 1,
    explanationEn: `By default, the JDBC driver queries the source with a single thread. To parallelize reads, you must describe how to slice the data: partitionColumn names a column with a uniformly distributed value range (ideally indexed in the source database), lowerBound and upperBound define the range, and numPartitions sets how many concurrent range queries — and connections — Spark opens. fetchSize only enlarges the batch of rows returned per round trip, and very high numPartitions values (hundreds) can overwhelm the source database, so Databricks warns against them.`,
    explanationPt: `Por padrão, o driver JDBC consulta a origem com uma única thread. Para paralelizar a leitura, é preciso descrever como fatiar os dados: partitionColumn indica uma coluna com faixa de valores uniformemente distribuída (de preferência indexada no banco de origem), lowerBound e upperBound definem a faixa, e numPartitions determina quantas consultas concorrentes por faixa — e quantas conexões — o Spark abre. O fetchSize apenas aumenta o lote de rows retornado por round trip, e valores muito altos de numPartitions (centenas) podem sobrecarregar o banco de origem, e o Databricks alerta contra isso.`,
    referenceUrl: "https://docs.databricks.com/aws/en/connect/external-systems/jdbc",
    referenceTitle: "JDBC drivers — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-022",
    domainCode: 2,
    stem: `A vendor exposes order data only through a paged REST API that returns JSON documents; there are no file drops and no direct database access. The team must land this data daily into a Unity Catalog-governed table. A junior engineer proposes:

\`\`\`sql
COPY INTO main.ops.orders
FROM 'https://api.vendor.com/v2/orders'
FILEFORMAT = JSON;
\`\`\`

What is the correct approach?`,
    options: [
      "Run the proposed statement with FORMAT_OPTIONS ('header' = 'true') added, so that the HTTP endpoint becomes readable as JSON",
      "Ask the vendor to publish the data to Kafka, because REST API sources cannot be landed in Unity Catalog tables",
      "Register the API URL as a Unity Catalog external location so that COPY INTO treats it as cloud object storage",
      "Write a notebook that calls the API with a REST client, walks the pages, and appends the results to a UC-governed table, then schedule that notebook as a task in a Lakeflow Job",
    ],
    correctIndex: 3,
    explanationEn: `COPY INTO only reads from file locations in cloud object storage — S3, ADLS, GCS, Azure Blob — or Unity Catalog volumes; an HTTPS endpoint is not a valid source, and external locations overlay cloud storage paths rather than APIs. The documented pattern for such sources is exactly the notebook route: JDBC/ODBC or REST clients in notebooks land data into cloud storage or UC-governed tables, with Lakeflow Jobs orchestrating the schedule through notebook tasks and time-based triggers. Kafka is a worthwhile ask, but it is not a prerequisite for landing REST data.`,
    explanationPt: `O COPY INTO só lê de locais de arquivos no cloud object storage — S3, ADLS, GCS, Azure Blob — ou de volumes do Unity Catalog; um endpoint HTTPS não é uma origem válida, e external locations sobrepõem caminhos de cloud storage, não APIs. O padrão documentado para esse tipo de fonte é justamente o caminho via notebook: clientes JDBC/ODBC ou REST em notebooks aterrizam dados no cloud storage ou em tabelas governadas pelo UC, com o Lakeflow Jobs orquestrando o agendamento por meio de notebook tasks e triggers baseados em tempo. Pedir Kafka ao fornecedor pode valer, mas não é pré-requisito para aterrar dados de REST.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/",
    referenceTitle: "Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-023",
    domainCode: 2,
    stem: `A junior engineer tries to start an incremental read of a Kafka topic called orders on a Confluent cluster:

\`\`\`python
df = (spark.read
  .format("confluent")
  .option("bootstrap", "broker1:9092")
  .option("topic", "orders")
  .load())
\`\`\`

The call fails immediately. Which correction correctly starts the streaming read so that the JSON message bodies can be parsed into a Delta table?`,
    options: [
      `Use spark.readStream.format("kafka") with kafka.bootstrap.servers set to the broker list and subscribe set to "orders"; message keys and values arrive as binary columns to cast and parse downstream`,
      `Keep spark.read and just change the format to "kafka"; batch reads automatically become incremental once the result is written to a Delta table`,
      `Use spark.readStream.format("cloudFiles") with cloudFiles.format set to "kafka" so that Auto Loader discovers new messages as they arrive`,
      `Use spark.readStream.format("jdbc") with the broker URL, because Kafka exposes a JDBC interface for external consumers`,
    ],
    correctIndex: 0,
    explanationEn: `Kafka is supported through the dedicated "kafka" Structured Streaming source: spark.readStream.format("kafka") with kafka.bootstrap.servers (a comma-separated host:port list) and subscribe naming the topics. The source returns columns such as key, value, topic, partition, offset, and timestamp, with key and value as binary that must be cast to string and parsed — for example, with from_json — before writing to Delta. A plain spark.read is a batch read; Auto Loader's cloudFiles source reads files in cloud storage, not message buses; and Kafka has no JDBC interface.`,
    explanationPt: `O Kafka é suportado pela fonte dedicada "kafka" do Structured Streaming: spark.readStream.format("kafka") com kafka.bootstrap.servers (lista host:port separada por vírgulas) e subscribe indicando os tópicos. A fonte retorna colunas como key, value, topic, partition, offset e timestamp, com key e value em binário — que precisam ser convertidos para string e parseados (por exemplo, com from_json) antes da escrita no Delta. Um spark.read comum é uma leitura batch; a fonte cloudFiles do Auto Loader lê arquivos no cloud storage, não barramentos de mensagens; e o Kafka não tem interface JDBC.`,
    referenceUrl: "https://docs.databricks.com/aws/en/connect/streaming/kafka/",
    referenceTitle: "Connect to Apache Kafka — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-024",
    domainCode: 2,
    stem: `A company is building its lakehouse on the medallion architecture. Several sources feed the first layer: Parquet files in Amazon S3, events from Kafka, and Salesforce data through Lakeflow Connect. Before any transformation is applied, the engineers must agree on what this first layer should contain.

Which statement best describes what belongs in that first layer?`,
    options: [
      "Joins and aggregations across the sources, so that downstream layers only need lightweight filtering",
      "Cleaned, deduplicated, and validated records, so later layers can assume the data is already correct",
      "The raw source data landed essentially as-is and appended incrementally, preserving the original state as the single source of truth that enables reprocessing and auditing",
      "Aggregated KPIs for executives, while the raw data stays in an archive bucket outside Unity Catalog",
    ],
    correctIndex: 2,
    explanationEn: `The first layer of the medallion architecture is bronze: raw data ingestion. It contains and maintains the raw state of each source in its original format, grows through incremental appends, serves as the single source of truth, and enables reprocessing and auditing by retaining history — which is why Databricks recommends limiting cleanup and validation there. Cleaning, deduplication, and joins belong to the silver layer, while aggregation and dimensional modeling for business consumers belong to the gold layer.`,
    explanationPt: `A primeira camada da arquitetura medallion é a bronze: ingestão de dados brutos. Ela contém e preserva o estado bruto de cada fonte em seu formato original, cresce por meio de appends incrementais, funciona como fonte única da verdade e habilita reprocessamento e auditoria ao reter o histórico — por isso o Databricks recomenda limitar limpeza e validação nessa camada. Limpeza, deduplicação e joins pertencem à camada silver, enquanto agregações e modelagem dimensional para consumidores de negócio pertencem à camada gold.`,
    referenceUrl: "https://docs.databricks.com/aws/en/lakehouse/medallion",
    referenceTitle: "Medallion architecture — Databricks Docs",
    difficulty: "EASY",
  },
];

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
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into",
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
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into",
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
      "Create an empty table without declaring columns, then run COPY INTO with 'mergeSchema' = 'true' in FORMAT_OPTIONS and COPY_OPTIONS",
    ],
    correctIndex: 3,
    explanationEn: `This is the documented pattern for loading files with differing schemas: an empty placeholder Delta table plus COPY INTO with mergeSchema enabled in both FORMAT_OPTIONS and COPY_OPTIONS lets Databricks infer the schema and evolve it as new fields show up in the JSON files. COPY INTO explicitly advertises target-table schema inference, mapping, merging, and evolution as capabilities. Failing fast on new fields defeats the requirement; column mapping mode is for renaming or dropping columns, not for merging new JSON fields; and DataFrame overwrites discard the table history.`,
    explanationPt: `Esse é o padrão documentado para carregar arquivos com schemas diferentes: uma tabela Delta de placeholder vazia mais COPY INTO com mergeSchema habilitado em FORMAT_OPTIONS e COPY_OPTIONS permite que o Databricks infira o schema e o evolua conforme novos campos aparecem nos arquivos JSON. O COPY INTO anuncia explicitamente inferência, mapeamento, mesclagem e evolução de schema na tabela de destino como capacidades. Falhar rápido em campos novos contraria o requisito; o column mapping mode serve para renomear ou remover colunas, não para mesclar novos campos JSON; e overwrites com DataFrames descartam o histórico da tabela.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into",
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
      "A Unity Catalog storage credential and an external location for the path, with READ FILES granted",
      "The storage account key embedded directly in the FROM clause, so COPY INTO authenticates on each run",
      "An ingestion gateway deployed next to the storage account's private endpoint",
    ],
    correctIndex: 1,
    explanationEn: `The documented prerequisite for COPY INTO is that an administrator configures data access for ingestion: a Unity Catalog storage credential and an external location that overlays the cloud path, plus the READ FILES privilege for the users running the command. DBFS mounts are the legacy mechanism that Unity Catalog replaces and are not recommended for governed access; COPY INTO has no syntax for inline credentials; and ingestion gateways belong to Lakeflow Connect database connectors, not to file loads.`,
    explanationPt: `O pré-requisito documentado do COPY INTO é que um administrador configure o acesso a dados para ingestão: uma storage credential do Unity Catalog e uma external location que sobreponha o caminho na nuvem, além do privilégio READ FILES para os usuários que executam o comando. Montagens de DBFS são o mecanismo legado que o Unity Catalog substitui — não recomendadas para acesso governado; o COPY INTO não tem sintaxe para credenciais inline; e ingestion gateways pertencem aos conectores de banco de dados do Lakeflow Connect, não a cargas de arquivos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into",
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
      `Use spark.readStream.format("cloudFiles") with cloudFiles.format and a durable cloudFiles.schemaLocation for schema inference and evolution`,
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
      "It resumes where it left off: files already recorded in checkpoint state are not reprocessed, preserving exactly-once semantics",
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
      "Auto Loader silently switches to file notification mode and re-lists the entire input directory tree on every micro-batch, because its checkpoint state has gone missing",
      "Only files from the last 30 days are reprocessed, because Delta time travel caps recovery at 30 days",
      "The stream state is corrupted and it must restart from scratch, likely reprocessing files; checkpoints belong in durable storage outside lifecycle rules",
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
      "Switch to file notification mode: file events go to a queue that the stream consumes, scaling far beyond listing",
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
      "Directory listing mode: the default, needing no cloud permissions beyond read access to the storage path",
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
      "All fields — including nested ones — are inferred as string; set cloudFiles.inferColumnTypes to true to infer types like long, double, and timestamp",
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
      "Auto Loader adds loyalty_points and the stream stops with UnknownFieldException; a restart resumes it with the new schema",
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
      "They land in the _rescued_data column Auto Loader adds automatically — non-conforming fields plus the source file path",
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
      `cloudFiles.schemaHints, e.g. 'event_ts TIMESTAMP, amount DOUBLE, user_info.dob DATE' — pins known types, infers the rest`,
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
      `Use .trigger(availableNow=True): process all available data, then stop — scheduled via a time-based trigger in a Lakeflow Job`,
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
      "Use Auto Loader (e.g. a streaming table): incremental file tracking, very large scale, and schema inference with evolution",
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
      "A custom Structured Streaming job against the Salesforce REST API, owned and maintained by the platform team, with the team patching and scaling its compute",
      "The Lakeflow Connect managed Salesforce connector: serverless, Databricks-operated, landing in UC-governed streaming tables",
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
      "A Unity Catalog connection for credentials, a serverless pipeline, and UC-governed streaming tables as destination",
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
      "Add partitionColumn (indexed, uniform), lowerBound, upperBound, and numPartitions; Spark runs concurrent range queries",
      "Set fetchSize=100000 so each round trip pulls more rows through the existing single connection, which parallelizes the fetch",
      "Set partitionColumn to the primary key and numPartitions=500 to maximize the number of simultaneous queries against the warehouse",
    ],
    correctIndex: 1,
    explanationEn: `By default, the JDBC driver queries the source with a single thread. To parallelize reads, you must describe how to slice the data: partitionColumn names a column with a uniformly distributed value range (ideally indexed in the source database), lowerBound and upperBound define the range, and numPartitions sets how many concurrent range queries — and connections — Spark opens. fetchSize only enlarges the batch of rows returned per round trip, and very high numPartitions values (hundreds) can overwhelm the source database, so Databricks warns against them.`,
    explanationPt: `Por padrão, o driver JDBC consulta a origem com uma única thread. Para paralelizar a leitura, é preciso descrever como fatiar os dados: partitionColumn indica uma coluna com faixa de valores uniformemente distribuída (de preferência indexada no banco de origem), lowerBound e upperBound definem a faixa, e numPartitions determina quantas consultas concorrentes por faixa — e quantas conexões — o Spark abre. O fetchSize apenas aumenta o lote de rows retornado por round trip, e valores muito altos de numPartitions (centenas) podem sobrecarregar o banco de origem, e o Databricks alerta contra isso.`,
    referenceUrl: "https://docs.databricks.com/aws/en/archive/connectors/jdbc",
    referenceTitle: "Query databases using JDBC — Databricks Docs",
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
      "Write a notebook that pages through the API and appends to a UC-governed table, scheduled as a Lakeflow Job task",
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
      `Use spark.readStream.format("kafka") with kafka.bootstrap.servers and subscribe set to "orders"; parse the binary columns downstream`,
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
      "Joins and aggregations across all the sources, so that downstream layers only need lightweight filtering to serve consumers",
      "Cleaned, deduplicated, and validated records, so later layers can assume the data is already correct",
      "The raw source data landed as-is and appended incrementally, preserving the original state as the source of truth",
      "Aggregated KPIs for executives, while the raw data stays in an archive bucket outside Unity Catalog",
    ],
    correctIndex: 2,
    explanationEn: `The first layer of the medallion architecture is bronze: raw data ingestion. It contains and maintains the raw state of each source in its original format, grows through incremental appends, serves as the single source of truth, and enables reprocessing and auditing by retaining history — which is why Databricks recommends limiting cleanup and validation there. Cleaning, deduplication, and joins belong to the silver layer, while aggregation and dimensional modeling for business consumers belong to the gold layer.`,
    explanationPt: `A primeira camada da arquitetura medallion é a bronze: ingestão de dados brutos. Ela contém e preserva o estado bruto de cada fonte em seu formato original, cresce por meio de appends incrementais, funciona como fonte única da verdade e habilita reprocessamento e auditoria ao reter o histórico — por isso o Databricks recomenda limitar limpeza e validação nessa camada. Limpeza, deduplicação e joins pertencem à camada silver, enquanto agregações e modelagem dimensional para consumidores de negócio pertencem à camada gold.`,
    referenceUrl: "https://docs.databricks.com/aws/en/lakehouse/medallion",
    referenceTitle: "Medallion architecture — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-025",
    domainCode: 2,
    stem: `A new Auto Loader stream must ingest events from a landing directory that already holds two years of history: about one million small JSON files produced by a decommissioned legacy platform. Going forward, only a few dozen new files arrive each day. The stream's very first micro-batch tried to absorb the entire backlog at once and the job ran out of memory. How should the team bound the initial load?`,
    options: [
      "Split the source directory into one prefix per year and run one Auto Loader stream per year, all in parallel",
      "Set cloudFiles.maxFilesPerTrigger to a fixed cap, so each micro-batch ingests at most that many files and the backlog drains gradually",
      "Turn cloudFiles.useNotifications off for the first run, because file notification mode is what forces huge micro-batches",
      "Raise the worker count on the job cluster so the single first micro-batch has enough memory to process the whole backlog",
    ],
    correctIndex: 1,
    explanationEn: `cloudFiles.maxFilesPerTrigger rate-limits ingestion: each micro-batch processes at most that many files (the default is 1000), so a large historical backlog is absorbed as a sequence of bounded batches instead of one giant task set. Splitting the directory by year multiplies streams and checkpoints to maintain without ever limiting the size of a batch. cloudFiles.useNotifications selects the file discovery mode — queue events versus directory listing — and has no effect on how much data a micro-batch carries. Adding workers gives the same oversized micro-batch more executors; the backlog still lands in a single batch.`,
    explanationPt: `O cloudFiles.maxFilesPerTrigger limita o ritmo da ingestão: cada micro-batch processa no máximo esse número de arquivos (o default é 1000), então um backlog histórico grande é absorvido como uma sequência de lotes limitados, e não em um único conjunto gigante de tasks. Dividir o diretório por ano multiplica streams e checkpoints a manter, sem nunca limitar o tamanho de um lote. O cloudFiles.useNotifications escolhe o modo de descoberta de arquivos — eventos em fila versus directory listing — e não afeta quanto dado cada micro-batch carrega. Adicionar workers dá mais executores ao mesmo micro-batch gigante: o backlog continua chegando de uma vez só.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-026",
    domainCode: 2,
    stem: `A team starts a new Auto Loader stream on a bucket that already contains three years of legacy extracts from a retired system. Those historical files will be loaded once by a separate backfill script; the stream itself must capture only the files that arrive from its first run onward. How should the stream be configured so the legacy extracts are never ingested?`,
    options: [
      "Delete the legacy extracts from the bucket before starting the stream, so the first run finds nothing old to pick up",
      "Use COPY INTO for this table instead, because COPY INTO always skips files that already existed in the folder before its very first execution",
      "Create the target table with a date filter on ingestion time, which Auto Loader honors when it discovers new files",
      "Set cloudFiles.includeExistingFiles to false, so the first run ignores files already in the bucket and ingests only new arrivals",
    ],
    correctIndex: 3,
    explanationEn: `Auto Loader processes everything already present in the input directory on its first run by default. Setting cloudFiles.includeExistingFiles to false changes exactly that: the stream starts from a clean slate and only picks up files that arrive after it starts. COPY INTO does not help here — its deduplication tracks files that it has itself already loaded, so a first execution loads every pre-existing file. Auto Loader applies no ingestion-time date filter inherited from the target table, and deleting the legacy extracts is a destructive workaround that ruins the bucket's role as an archive of record.`,
    explanationPt: `Por padrão, o Auto Loader processa na primeira execução tudo o que já existe no diretório de entrada. Definir cloudFiles.includeExistingFiles como false muda exatamente isso: o stream começa de um estado limpo e captura apenas os arquivos que chegarem depois do seu início. O COPY INTO não resolve — sua deduplicação rastreia arquivos que ele mesmo já carregou, então uma primeira execução carrega todos os arquivos pré-existentes. O Auto Loader não aplica nenhum filtro de data herdado da tabela-alvo na descoberta de arquivos, e apagar os extratos legados é uma solução destrutiva que compromete o papel do bucket como arquivo histórico.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-027",
    domainCode: 2,
    stem: `An online retailer's operational data lives in a MySQL database: product catalog, inventory, and orders. The analytics platform needs an initial copy of every table in Unity Catalog-governed tables, followed by continuous replication of inserts, updates, and row deletions as they happen, with no ingestion code for the data team to write or operate. Which approach meets these requirements?`,
    options: [
      "A Lakeflow Connect database connector: it takes an initial snapshot of each table and then streams ongoing changes, including deletes, into Unity Catalog-governed streaming tables",
      "A scheduled COPY INTO statement that reads the MySQL tables directly and appends their new rows into a Delta table every night",
      "A nightly Lakeflow Job that reads full table snapshots over JDBC and overwrites the target Delta tables with each night's copy",
      "A Lakeflow Connect Kafka connector pointed at the MySQL server, so row changes flow from the database into a streaming table",
    ],
    correctIndex: 0,
    explanationEn: `Lakeflow Connect database connectors, such as the MySQL connector, are built for exactly this pattern: an initial snapshot of each selected table, then continuous change data capture that replicates inserts, updates, and deletes into Unity Catalog-governed streaming tables, with Databricks operating the ingestion. COPY INTO loads files from cloud storage into Delta tables and cannot query a database at all. Nightly JDBC reads with overwrite deliver one full snapshot per day — not change replication as it happens — and the team must write and operate the code. The Kafka connector consumes Kafka topics, not a MySQL server, so pointing it at a database is the wrong source type.`,
    explanationPt: `Os database connectors do Lakeflow Connect, como o conector de MySQL, foram feitos exatamente para esse padrão: snapshot inicial de cada tabela selecionada e, depois, change data capture contínuo que replica inserts, updates e deletes para streaming tables governadas pelo Unity Catalog, com a Databricks operando a ingestão. O COPY INTO carrega arquivos de cloud storage para tabelas Delta e não consegue consultar um banco. Leituras JDBC noturnas com overwrite entregam um snapshot completo por dia — não é replicação de mudanças conforme acontecem — e o time precisa escrever e operar o código. O conector de Kafka consome tópicos Kafka, e não um servidor MySQL: apontá-lo para o banco é o tipo errado de fonte.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-028",
    domainCode: 2,
    stem: `A team defines a streaming table in a Lakeflow Declarative Pipeline using the read_files table-valued function over a landing directory, and the table's refresh schedule runs every 15 minutes. Files land in that directory around the clock. A new engineer assumes each refresh re-reads the entire directory and worries about duplicate rows. What does each scheduled refresh actually process?`,
    options: [
      "Only the files that have arrived since the last successful refresh, because the streaming table keeps durable state tracking what it has already ingested",
      "Every file in the directory, with duplicate rows removed afterwards by a deduplication step that the pipeline runs automatically",
      "Nothing, until an external scheduler updates a control table listing which files the previous refresh already consumed",
      "Only new files if the table was declared with AUTO CDC INTO; streaming tables fed by read_files always reload in full",
    ],
    correctIndex: 0,
    explanationEn: `A streaming table is backed by a streaming query whose progress lives in durable checkpoint state, so each refresh — scheduled or manual — picks up only the data that arrived since the last successful refresh and appends it incrementally; nothing is re-read, and no deduplication is needed. No external control table is required, because the pipeline itself manages the state that remembers what was already consumed. AUTO CDC INTO is unrelated to this behavior: it applies change events from a CDC source to a target table, while streaming tables fed by read_files are incremental on their own.`,
    explanationPt: `Uma streaming table é sustentada por uma streaming query cujo progresso fica em um estado de checkpoint durável; por isso cada refresh — agendado ou manual — captura somente os dados que chegaram desde o último refresh bem-sucedido e os adiciona incrementalmente: nada é relido e nenhuma deduplicação é necessária. Não é preciso tabela de controle externa, porque o próprio pipeline gerencia o estado que lembra o que já foi consumido. O AUTO CDC INTO não tem relação com esse comportamento: ele aplica eventos de mudança de uma origem CDC a uma tabela-alvo, enquanto streaming tables alimentadas por read_files já são incrementais por si mesmas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ldp/concepts/streaming-tables",
    referenceTitle: "Streaming tables (Lakeflow pipelines) — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-029",
    domainCode: 2,
    stem: `A Lakeflow Job runs an Auto Loader stream on a job cluster and terminates the cluster after each run. The stream's checkpointLocation points at a scratch path on storage that the job wipes and recreates empty whenever a new cluster starts. Every morning, the target Delta table contains duplicate rows re-ingested from the full landing directory. Where is the configuration error?`,
    options: [
      "The checkpointLocation points at ephemeral storage; the checkpoint must live in durable cloud storage, in a location dedicated to this stream alone",
      "The checkpointLocation is fine as configured, because the DBFS root of the workspace is the recommended default location for production stream state",
      "The checkpointLocation is irrelevant, because checkpoints are optional when the stream writes its output into a Delta table",
      "The checkpointLocation can be any random path, because Auto Loader rebuilds an equivalent checkpoint from the target table on every run",
    ],
    correctIndex: 0,
    explanationEn: `The checkpoint holds the stream's progress — which files were already ingested and where processing stopped — so it must sit in durable cloud storage, such as a dedicated Unity Catalog volume, and each stream needs its own checkpoint location that is never shared or recycled. A path that is wiped between runs turns every restart into a first run: the whole directory is re-ingested and duplicates appear. The workspace DBFS root is not recommended for production data, checkpoints are required for exactly-once semantics even when the target is a Delta table, and Auto Loader never reconstructs a checkpoint from the target table.`,
    explanationPt: `O checkpoint guarda o progresso do stream — quais arquivos já foram ingeridos e onde o processamento parou — e, por isso, deve ficar em cloud storage durável, como um Unity Catalog volume dedicado, e cada stream precisa do seu próprio checkpoint location, nunca compartilhado nem reciclado. Um caminho apagado entre execuções transforma cada reinício em uma primeira execução: o diretório inteiro é reingerido e surgem duplicatas. O DBFS root do workspace não é recomendado para dados de produção, checkpoints são obrigatórios para a semântica exactly-once mesmo quando o alvo é uma tabela Delta, e o Auto Loader nunca reconstrói um checkpoint a partir da tabela-alvo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/best-practices",
    referenceTitle: "Auto Loader best practices — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-030",
    domainCode: 2,
    stem: `A team's ingestion notebooks currently reference raw files by full s3:// URIs, with long-lived cloud credentials pasted directly into the code. The governance program now requires that every landing location be a centrally governed path, that no cloud credentials appear in notebooks, and that access be granted and revoked through one central permission model. Where should the landing files be stored?`,
    options: [
      "In the current bucket as is, with instance profiles referenced inside each notebook and updated by hand whenever the cloud credentials rotate",
      "In the bucket through DBFS mounts configured with cloud credentials on the cluster, the traditional pattern for production landing areas",
      "In a Unity Catalog volume, using /Volumes/catalog/schema/volume paths governed by READ VOLUME and WRITE VOLUME privileges",
      "In a public bucket with anonymous access enabled, so the notebooks can keep using plain s3:// URLs without credential management",
    ],
    correctIndex: 2,
    explanationEn: `Unity Catalog volumes provide governed storage for non-tabular data: files live under /Volumes/catalog/schema/volume paths, access is mediated by Unity Catalog privileges such as READ VOLUME and WRITE VOLUME, and no cloud credentials are needed in code, because access rides on the identities that Unity Catalog manages. Instance profiles referenced notebook by notebook keep credential handling scattered through the codebase. DBFS mounts are a legacy mechanism that bypasses central governance. A public bucket removes credentials only by removing security altogether.`,
    explanationPt: `Os Unity Catalog volumes oferecem storage governado para dados não tabulares: os arquivos ficam sob caminhos /Volumes/catalog/schema/volume, o acesso é mediado por privilégios do Unity Catalog como READ VOLUME e WRITE VOLUME, e nenhuma credencial de nuvem é necessária no código, porque o acesso acontece pelas identidades que o Unity Catalog gerencia. Instance profiles referenciados notebook por notebook deixam o tratamento de credenciais espalhado pelo código. DBFS mounts são um mecanismo legado que contorna a governança central. Já um bucket público elimina as credenciais eliminando a segurança.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-031",
    domainCode: 2,
    stem: `One shared landing directory receives deliveries from many producers: clickstream exports, audit logs, invoice images, and order events, all mixed in the same path. Only the files named with the pattern orders-*.csv may ever reach the orders table; everything else must be ignored automatically, with no manual file handling between runs. Which ingestion approach meets this requirement?`,
    options: [
      "A COPY INTO statement with a PATTERN clause of orders-*.csv, so only the files whose names match the pattern are loaded",
      "A staging load of every file in the directory, followed by a DELETE that removes the rows originating from non-order files",
      "A manual archive step that moves every non-order file to another prefix before each run, leaving only the matching files in place",
      "An Auto Loader stream with cloudFiles.pathGlobFilter set to orders-*.csv, so only files matching the glob pattern are ingested",
    ],
    correctIndex: 3,
    explanationEn: `Auto Loader supports cloudFiles.pathGlobFilter, a glob pattern that filters which files the stream picks up, so non-matching files are never discovered or ingested in the first place. COPY INTO has no filename-pattern clause — PATTERN does not exist in its syntax — and it loads every not-yet-loaded file it finds in the source path. Loading everything into staging and deleting afterwards forces one table to hold many unrelated, shifting schemas and wastes compute. Moving files by hand between runs reintroduces the manual toil the requirement explicitly forbids.`,
    explanationPt: `O Auto Loader suporta o cloudFiles.pathGlobFilter, um glob pattern que filtra quais arquivos o stream captura, então arquivos que não casam com o padrão nunca são descobertos nem ingeridos. O COPY INTO não tem cláusula de padrão de nome de arquivo — PATTERN não existe na sintaxe dele — e carrega cada arquivo ainda não carregado que encontrar no caminho de origem. Carregar tudo em staging e apagar depois obriga uma tabela a acomodar vários schemas sem relação e mutantes, além de desperdiçar compute. Mover arquivos manualmente entre execuções reintroduz o trabalho manual que o requisito proíbe explicitamente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-032",
    domainCode: 2,
    stem: `A Lakeflow Job task calls a partner REST API that uses OAuth 2.0 client-credentials authentication: the task presents a client ID and a long-lived client secret to obtain a short-lived access token at runtime. The security team requires that the secret be stored in one managed place, referenced from the task without the value appearing in run history or logs. Where should the client secret be stored?`,
    options: [
      "As a string parameter on the Lakeflow Job, so the task reads the secret from its parameter list at the start of every run",
      "In a Databricks secret scope, fetched at runtime with dbutils.secrets.get, which redacts the value in output and logs",
      "In an environment variable set in the cluster's Spark configuration, where it is readable by anyone who can attach to that cluster",
      "In the Git folder repository that holds the pipeline code, with branch permissions restricted to the data engineering team",
    ],
    correctIndex: 1,
    explanationEn: `Databricks secret scopes exist for exactly this case: the secret is stored once in a managed scope, the task references it by scope and key with dbutils.secrets.get, and the platform redacts the value in notebook output and logs, so it never surfaces in plain text. A job string parameter is visible in the Jobs UI and stored with every run's configuration. An environment variable in the cluster's Spark configuration can be read by any user who can attach to that cluster. A secret committed to a Git folder persists in version history even after it is removed from the latest revision.`,
    explanationPt: `Os secret scopes do Databricks existem exatamente para esse caso: o segredo é guardado uma única vez em um scope gerenciado, a tarefa o referencia por scope e chave com dbutils.secrets.get, e a plataforma mascara o valor no output do notebook e nos logs — ele nunca aparece em texto puro. Um parâmetro de string do job fica visível na UI de Jobs e é armazenado na configuração de cada execução. Uma variável de ambiente na configuração do cluster pode ser lida por qualquer usuário capaz de se anexar a ele. E um segredo commitado em um Git folder persiste no histórico de versões mesmo depois de removido da revisão mais recente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/security/secrets",
    referenceTitle: "Manage secrets — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-033",
    domainCode: 2,
    stem: `An operations dashboard queries a Delta table that must never be more than a few minutes out of date. The team runs an Auto Loader stream on always-on compute and wants a new micro-batch to run every 60 seconds, around the clock, without manual intervention. Which trigger configuration produces that behavior?`,
    options: [
      "Use .trigger(processingTime='1 minute'): the query schedules continuous micro-batches, each starting about one minute after the previous",
      "Use .trigger(availableNow=True) with a one-minute interval: the stream processes whatever is available and then starts again every minute",
      "Use .trigger(processingTime='1 minute') for discovery only: Auto Loader scans for files faster, while micro-batches follow the default cadence",
      "Use no trigger at all: streams default to batch execution, so the table only advances when someone runs a manual refresh command",
    ],
    correctIndex: 0,
    explanationEn: `processingTime is the interval of a continuous micro-batch trigger: with '1 minute', the query schedules a new micro-batch roughly every minute, indefinitely, which is what a dashboard with a minutes-level freshness target needs. Trigger.AvailableNow is the opposite style: it processes everything available in a single run and then terminates the query — a fit for scheduled, batch-style executions, not for around-the-clock freshness. processingTime is not a file-discovery tuning; it directly schedules micro-batch execution. With no trigger set, a stream still processes data continuously as it arrives — it never waits for a manual command.`,
    explanationPt: `O processingTime é o intervalo do trigger contínuo de micro-batches: com '1 minute', a query agenda um novo micro-batch aproximadamente a cada minuto, por tempo indeterminado — exatamente o que um dashboard com meta de frescor em minutos exige. O Trigger.AvailableNow é o estilo oposto: processa tudo o que está disponível em uma única execução e então encerra a query, o que serve para execuções agendadas em estilo batch, não para frescor contínuo. O processingTime não é um ajuste de descoberta de arquivos; ele agenda diretamente a execução dos micro-batches. E, sem trigger configurado, um stream continua processando dados conforme chegam — nunca espera um comando manual.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-034",
    domainCode: 2,
    stem: `A company runs several Lakeflow Connect managed connectors, and three of them read from PostgreSQL databases that all accept the same service-account credential. The platform team wants to store that credential exactly once, reference it from each connector, and guarantee that engineers who configure or use the connectors can never see the secret value itself. Where do Lakeflow Connect managed connectors hold their source credentials?`,
    options: [
      "In a workspace-backed secret scope that every engineer who configures a connector must be granted permission to read",
      "In plaintext variables defined in the team's Automation Bundle and versioned in Git together with the pipeline definitions",
      "In a Unity Catalog connection created with CREATE CONNECTION; connectors reference it and the stored secret stays hidden",
      "In a personal access token issued to each engineer, shared with teammates whenever someone joins or leaves the team",
    ],
    correctIndex: 2,
    explanationEn: `Managed connectors in Lakeflow Connect authenticate through Unity Catalog connections: a CREATE CONNECTION statement stores the endpoint and credential once as a securable object, connectors reference that connection by name, and the secret values are redacted, so engineers working with the connector never see them. A secret scope would have to be opened to everyone who configures a connector, exposing the raw value. Bundle variables put the secret permanently into Git history. Personal access tokens belong to individuals — they are revoked when people leave, which breaks pipelines and is the opposite of a shared service credential.`,
    explanationPt: `Os managed connectors do Lakeflow Connect autenticam por meio de connections do Unity Catalog: um CREATE CONNECTION armazena endpoint e credencial uma única vez como objeto securable, os conectores referenciam essa connection pelo nome, e os valores secretos ficam mascarados — quem trabalha com o conector nunca os vê. Um secret scope precisaria ser aberto para todos que configuram conector, expondo o valor cru. Variáveis de bundle colocam o segredo permanentemente no histórico do Git. Já os personal access tokens pertencem a indivíduos: são revogados quando as pessoas saem, o que quebra pipelines e é o oposto de uma credencial de serviço compartilhada.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-035",
    domainCode: 2,
    stem: `A streaming table created with read_files over a landing directory has been live for weeks. A faulty transformation in the pipeline polluted its contents; the source files are still intact in cloud storage, and the transformation has now been fixed. The team decides to rebuild the table with a full refresh. Which statement describes what REFRESH TABLE ... FULL REFRESH does?`,
    options: [
      "It re-executes only the micro-batches whose output the faulty transformation affected, leaving every correctly loaded batch untouched in the table",
      "It discards the streaming state that tracks processed data and reprocesses everything from the source, fully re-deriving the table",
      "It drops and recreates the table schema before reloading, resetting column types and constraints to their original definitions",
      "It fires automatically whenever the source schema changes, so issuing it manually after fixing a transformation is redundant",
    ],
    correctIndex: 1,
    explanationEn: `A full refresh throws away the streaming table's progress state — the checkpoint that records which source data was already processed — and reprocesses all of the source data from the beginning, completely re-deriving the table's contents with the current pipeline definition. It does not cherry-pick the micro-batches that a bug touched, it does not touch the table's schema definition, because the fix was in transformation logic rather than DDL, and it never fires on its own: a breaking source schema change can require a full refresh, but the team must issue the statement explicitly.`,
    explanationPt: `O full refresh descarta o estado de progresso da streaming table — o checkpoint que registra quais dados da fonte já foram processados — e reprocessa todos os dados da origem desde o início, rederivando por completo o conteúdo da tabela com a definição atual do pipeline. Ele não escolhe os micro-batches que o bug afetou, não mexe na definição de schema da tabela — o conserto estava na lógica da transformação, não no DDL — e nunca dispara sozinho: uma mudança incompatível de schema na fonte pode exigir um full refresh, mas é o time quem precisa executar o statement explicitamente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ldp/concepts/streaming-tables",
    referenceTitle: "Streaming tables (Lakeflow pipelines) — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-036",
    domainCode: 2,
    stem: `A scheduled Lakeflow Job runs this statement every night to load the day's files into a reporting table:

\`\`\`sql
COPY INTO main.ops.deliveries_raw
FROM '/Volumes/main/ops/landing/deliveries/'
FILEFORMAT = CSV;
\`\`\`

Last night the run failed halfway through, when it hit a corrupted file after several valid files had already been read. What is the state of the target table this morning?`,
    options: [
      "Unchanged: COPY INTO is atomic, no partial data was committed, and a rerun after the fix loads all still-pending files",
      "Partially loaded: the valid files read before the corruption were committed, and a rerun resumes from the file after the corrupted one",
      "Empty: the failed statement rolled the table back to its creation state, and the next successful run reloads everything from scratch",
      "Locked: the failed run marked every listed file as loaded, so the team must purge the copy history before it can retry",
    ],
    correctIndex: 0,
    explanationEn: `COPY INTO is atomic and idempotent: if the statement fails midway, no partial data is committed, so the target table is exactly as it was before the run started. Files are recorded as loaded only when the load commits, so a rerun after the corrupted file is fixed picks up every pending file, including the valid ones that were read before the failure. Nothing is rolled back to an empty or newly created state, and no manual purge of copy history is ever required to retry the load.`,
    explanationPt: `O COPY INTO é atômico e idempotente: se o statement falha no meio, nenhum dado parcial é commitado, e a tabela-alvo fica exatamente como estava antes de a execução começar. Os arquivos só são registrados como carregados quando a carga faz commit, então uma reexecução depois de corrigir o arquivo corrompido retoma todos os arquivos pendentes — inclusive os válidos que já haviam sido lidos antes da falha. Nada é revertido para um estado vazio ou recém-criado, e nunca é preciso limpar manualmente o histórico de cópia para tentar a carga de novo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-037",
    domainCode: 2,
    stem: `A company's gold layer ends with a nightly aggregated orders table that a legacy planning system can only consume from its own PostgreSQL database. Right after the aggregation finishes each night, the table's full contents must be delivered into a PostgreSQL table that the legacy system reads. How should the team deliver the gold table into PostgreSQL?`,
    options: [
      "Run COPY INTO against the PostgreSQL table, because COPY INTO moves data between Delta tables and any external SQL database",
      "Share the gold table using Delta Sharing: the open protocol automatically materializes it as a table inside the PostgreSQL database",
      "Schedule a notebook that displays the aggregation results and exports them to CSV, letting the legacy team load the file by hand",
      "Add a task that writes the DataFrame with .format('jdbc'), passing the PostgreSQL URL, credentials, and save mode as options",
    ],
    correctIndex: 3,
    explanationEn: `Spark ships a JDBC writer: a DataFrame can be written with .format('jdbc') plus options such as url, dbtable, user, and password, choosing append or overwrite as the save mode — the standard way to push a finished gold table into an external operational database from a scheduled task. COPY INTO only loads files from cloud storage into Delta tables and cannot write to PostgreSQL. Delta Sharing lets external consumers read shared tables; it does not replicate or materialize data inside someone else's database. A manual CSV export is a hand-off, not an automated nightly delivery.`,
    explanationPt: `O Spark traz um writer JDBC: um DataFrame pode ser gravado com .format('jdbc') mais opções como url, dbtable, user e password, escolhendo append ou overwrite como save mode — o jeito padrão de empurrar uma gold table pronta para um banco operacional externo a partir de uma tarefa agendada. O COPY INTO apenas carrega arquivos de cloud storage para tabelas Delta e não escreve no PostgreSQL. O Delta Sharing permite que consumidores externos leiam tabelas compartilhadas; ele não replica nem materializa dados dentro do banco de outra pessoa. E a exportação manual de CSV é uma entrega manual, não uma entrega noturna automatizada.`,
    referenceUrl: "https://docs.databricks.com/aws/en/archive/connectors/jdbc",
    referenceTitle: "Query databases using JDBC — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-038",
    domainCode: 2,
    stem: `A finance tool exports nightly CSV files, each starting with a header row of column names. The team loads them with the statement below, and the first run produced generic columns such as _c0 whose values are header text like transaction_id, with every data row shifted. Which change makes the load treat the first line of each file as a header?

\`\`\`sql
COPY INTO main.finance.payments_raw
FROM '/Volumes/main/finance/landing/payments/'
FILEFORMAT = CSV;
\`\`\``,
    options: [
      "Keep the statement unchanged: COPY INTO detects header rows automatically in every supported file format",
      "Add FORMAT_OPTIONS ('header' = 'true') so the reader treats each file's first line as column names instead of data",
      "Run a preprocessing job that removes the first line of every CSV file in the landing volume before each nightly load runs",
      "Change FILEFORMAT to JSON, because CSV files do not accept format options such as header handling",
    ],
    correctIndex: 1,
    explanationEn: `By default the CSV reader used by COPY INTO treats every line as data, so the header row was ingested as the first record and columns received generated names such as _c0. Passing FORMAT_OPTIONS ('header' = 'true') tells the CSV reader that each file starts with column names, which are then used for the schema and skipped during the load. Header handling is an explicit option, not something COPY INTO detects on its own. Deleting first lines with a preprocessing job is fragile and mutates the raw landing data. CSV fully supports format options like header, delimiter, and mergeSchema, so switching to JSON is unnecessary.`,
    explanationPt: `Por padrão, o leitor de CSV usado pelo COPY INTO trata todas as linhas como dados: a linha de cabeçalho foi carregada como o primeiro registro e as colunas receberam nomes gerados como _c0. Passar FORMAT_OPTIONS ('header' = 'true') avisa o leitor de que cada arquivo começa com nomes de colunas, que passam a ser usados para o schema e descartados na carga. Tratar cabeçalho é uma opção explícita, não uma detecção automática do COPY INTO. Apagar a primeira linha com um job de pré-processamento é frágil e altera os dados brutos da área de chegada. CSV aceita format options como header, delimiter e mergeSchema, portanto trocar para JSON é desnecessário.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-039",
    domainCode: 2,
    stem: `An insurance data source delivers one complete extract at 02:00 every night, and nothing changes during the day. Analysts refresh their dashboards once each morning, and no downstream consumer needs intraday data. A stakeholder asks why the team is not building a streaming pipeline like a competitor did. What should drive the choice between streaming and batch processing here?`,
    options: [
      "The freshness requirement: daily refresh satisfies every consumer, so scheduled batch is simpler and cheaper; streaming pays off only when data must arrive within minutes",
      "Industry fashion: streaming is always the recommended modern architecture for new data platforms, regardless of any actual latency requirement",
      "Engine unification: because Databricks runs batch and streaming on one unified engine, every ingestion must now be written as a continuous streaming job",
      "Data volume alone: the decision depends exclusively on how many bytes the source produces each night, never on how fresh consumers need the data",
    ],
    correctIndex: 0,
    explanationEn: `The deciding factor is the freshness, or latency, requirement. Databricks documents that batch processing keeps logic simple and suits latency needs from hours down to minutes, while streaming earns its cost only when data must arrive within seconds or minutes. Because every consumer is happy with a morning refresh, a scheduled batch load is the simpler and cheaper design. Streaming is not a badge of modern architecture; it adds state, operational overhead, and cost. The unified engine still lets you run triggered, batch-style workloads, and volume alone never determines the choice — a huge nightly extract is still a batch workload.`,
    explanationPt: `O fator decisivo é o requisito de frescor (latência). A documentação do Databricks registra que o processamento em batch mantém a lógica simples e atende latências de horas até minutos, enquanto o streaming só se justifica quando os dados precisam chegar em segundos ou poucos minutos. Como todo consumidor está satisfeito com o refresh matinal, uma carga batch agendada é o desenho mais simples e barato. Streaming não é um selo de arquitetura moderna: adiciona estado, custo operacional e complexidade. O motor unificado permite executar workloads disparados, estilo batch, e o volume sozinho nunca decide a escolha — um extrato noturno gigante continua sendo um workload batch.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-engineering/batch-vs-streaming",
    referenceTitle: "Batch vs. streaming data processing — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-040",
    domainCode: 2,
    stem: `A supplier landing directory has accumulated more than 40,000 small CSV files over two years of daily deliveries. The nightly COPY INTO run keeps getting slower: most of its time now goes into discovering which files in the path are new and which were already loaded. Total daily volume is modest. What should the team conclude about this slowdown?`,
    options: [
      "No structural limit: COPY INTO handles any file count without degradation, so the slowdown must come from warehouse sizing, not ingestion design",
      "File size only: compacting the thousands of small files into fewer large ones solves everything, because file count never drives ingestion cost",
      "Scale mismatch: COPY INTO suits small to medium sets of files, while Auto Loader is built for this scale, handling millions of files efficiently",
      "Mode mismatch: Auto Loader only serves always-on, real-time streaming, so it cannot replace a nightly batch-style incremental load",
    ],
    correctIndex: 2,
    explanationEn: `COPY INTO works best for small to medium sets of files: on every run it lists the source path and reconciles what it finds against what it has already loaded, so its discovery and tracking work grows with the total file count. Databricks recommends streaming tables, backed by Auto Loader, whenever file ingestion needs to be more scalable and robust, and Auto Loader is documented to scale to millions of files per hour and billions of files overall. The slowdown is a file-count problem, so warehouse sizing and file compaction do not address it, and Auto Loader also serves batch-style incremental loads through Trigger.AvailableNow — a nightly run is no obstacle.`,
    explanationPt: `O COPY INTO funciona melhor com conjuntos pequenos a médios de arquivos: a cada execução ele lista o caminho de origem e reconcilia o que encontra com o que já carregou, então o trabalho de descoberta e rastreamento cresce com a contagem total de arquivos. A Databricks recomenda streaming tables, apoiadas no Auto Loader, quando a ingestão de arquivos precisa ser mais escalável e robusta, e o Auto Loader está documentado como capaz de escalar para milhões de arquivos por hora e bilhões de arquivos no total. A lentidão é um problema de contagem de arquivos, então dimensionar o warehouse ou compactar arquivos não resolve; e o Auto Loader também atende cargas incrementais estilo batch com Trigger.AvailableNow — a execução noturna não é obstáculo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-041",
    domainCode: 2,
    stem: `For months, a nightly COPY INTO has loaded new files from a landing volume into main.ops.bookings. During a schema dispute, an engineer drops and re-creates the table with the correct columns. The next run reloads every file still present in the landing directory, duplicating months of history. Where does COPY INTO keep its record of already-loaded files?`,
    options: [
      "In a workspace-level ingestion service that tracks every loaded file globally, shared by all tables that read from the same cloud storage account",
      "In the source path itself: each landing directory maintains its own tracking metadata, independent of whichever table the data lands in",
      "In the Auto Loader checkpoint directory that backs the job, which should have been backed up before the table was re-created",
      "In the target table's Delta transaction log: dropping and re-creating the table destroyed the loaded-file history, so everything was reloaded",
    ],
    correctIndex: 3,
    explanationEn: `COPY INTO is idempotent against its target table: the record of which files have already been loaded lives in the target's Delta transaction log, which is why reruns skip files loaded on previous nights. Dropping and re-creating the table produced a brand-new, empty history — the loaded-file state disappeared with the old table, so the next run saw every file in the landing directory as new and reloaded it, duplicating history. There is no workspace-global ingestion registry, the source directory carries no tracking metadata of its own, and checkpoints belong to Auto Loader streaming queries, not to COPY INTO statements.`,
    explanationPt: `O COPY INTO é idempotente em relação à tabela-alvo: o registro de quais arquivos já foram carregados vive no transaction log Delta da tabela de destino, e é por isso que reexecuções pulam os arquivos das noites anteriores. Fazer drop e recriar a tabela gerou um histórico novo e vazio — o estado de arquivos carregados desapareceu junto com a tabela antiga, então a execução seguinte viu cada arquivo do diretório como novidade e recarregou tudo, duplicando o histórico. Não existe um registro global de ingestão no workspace, o diretório de origem não guarda metadados de rastreamento e checkpoints pertencem a streaming queries do Auto Loader, não ao COPY INTO.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-042",
    domainCode: 2,
    stem: `A partner REST API returns orders in pages, and every response includes a next_page cursor. A nightly Lakeflow Job must fetch only orders that are new since the previous run, because reprocessing old pages wastes API quota. The job restarts on failures and its compute terminates after each run. How should the ingestion position carry over between runs?`,
    options: [
      "Replay from the first page every night and let a MERGE against the target re-deduplicate the whole order history again on every run",
      "Persist the newest cursor in a small Delta control table, read it at start, and pass it to the next run as a job parameter",
      "Write the cursor to a file on the job cluster's driver disk, which survives across runs even though the cluster itself terminates",
      "Store nothing: the partner API remembers each client's last position on the server side, so the job can simply ask for whatever orders are new",
    ],
    correctIndex: 1,
    explanationEn: `The job owns its own position: write the newest cursor (or the highest order id or timestamp seen) into a small Delta control table at the end of each successful run, and read it back — for example as a job parameter — at the start of the next run. Delta storage is durable, so the position survives cluster termination, job failures, and reruns. Replaying from the first page wastes API quota and repeats the whole merge every night. A file on the driver's local disk is lost when the job cluster terminates, and the partner API keeps no per-client position between calls.`,
    explanationPt: `O job é dono da própria posição: grave o cursor mais recente (ou o maior id ou timestamp de pedido visto) numa pequena tabela de controle Delta ao final de cada execução bem-sucedida e leia-o de volta — por exemplo como job parameter — no início da execução seguinte. O armazenamento Delta é durável, então a posição sobrevive ao encerramento do cluster, a falhas e a reexecuções. Reproduzir desde a primeira página desperdiça cota de API e repete todo o merge todas as noites. Um arquivo no disco local do driver se perde quando o cluster do job termina, e a API do parceiro não guarda a posição de cada cliente entre chamadas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-043",
    domainCode: 2,
    stem: `A nightly job pages through a partner events API that occasionally times out. The job's retry logic can re-request a page, so the same event_id sometimes arrives twice in one night; the API cannot promise exactly-once delivery. Each event must appear exactly once in the target Unity Catalog table. Which design makes this ingestion reliable?`,
    options: [
      "Pause the pipeline until the partner can guarantee exactly-once delivery for every event_id, before writing anything into the table",
      "Append the raw responses with plain INSERT INTO and require analysts to filter duplicate event_ids out of every downstream dashboard and report",
      "Accept at-least-once delivery and write idempotently: MERGE INTO the target on event_id, updating matches and inserting rows that are new",
      "Disable the job's retry logic so a timed-out call is never repeated, accepting that lost responses mean permanently missing events",
    ],
    correctIndex: 2,
    explanationEn: `Unreliable HTTP delivery is the normal case, so the pipeline should assume at-least-once and make the write idempotent. A MERGE INTO ... ON event_id updates the row when the event already exists and inserts it when it does not, so a page fetched twice produces the same single row both times. Waiting for the partner to guarantee exactly-once delivery blocks the pipeline on something outside your control. Pushing deduplication onto consumers contaminates every dashboard and report that reads the table. Disabling retries trades occasional duplicates for permanent data loss whenever a response never arrives.`,
    explanationPt: `Entregas HTTP instáveis são o cenário normal, então o pipeline deve assumir at-least-once e tornar a escrita idempotente. Um MERGE INTO ... ON event_id atualiza a linha quando o evento já existe e insere quando não existe, de modo que uma página buscada duas vezes produz a mesma linha única nas duas vezes. Esperar que o parceiro garanta entrega exactly-once bloqueia o pipeline em algo fora do seu controle. Empurrar a deduplicação para os consumidores contamina todos os dashboards e relatórios que leem a tabela. Desabilitar as retentativas troca duplicatas ocasionais por perda definitiva de dados sempre que uma resposta não chega.`,
    referenceUrl: "https://docs.databricks.com/aws/en/delta/merge",
    referenceTitle: "Merge data (Delta Lake upsert) — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-044",
    domainCode: 2,
    stem: `A data platform team is cataloguing the ingestion options available through Lakeflow Connect for an architecture review. One column of their catalogue must record who operates each connector: they want zero infrastructure to run themselves for standard enterprise sources, while accepting that some niche sources will run on the team's own compute.

Which classification matches how Lakeflow Connect organizes its connectors?`,
    options: [
      "Managed connectors are Databricks-hosted and operated; community connectors are open-source packages the team runs itself",
      "Every connector in the Lakeflow Connect catalog is hosted and operated by Databricks on serverless compute, so the team runs no infrastructure",
      "Community connectors are operated by Databricks on the team's behalf at no additional charge",
      "The catalog covers only databases and object storage; SaaS and streaming sources need custom code",
    ],
    correctIndex: 0,
    explanationEn: `Lakeflow Connect organizes ingestion by source type — databases and CDC, SaaS applications, files, streaming, and query-based sources. Managed connectors are the ones Databricks hosts and operates: the team selects tables or topics and the data lands in Unity Catalog-governed tables with no infrastructure to run. Community connectors, by contrast, are open-source connector packages the team includes and runs inside its own pipelines, and when nothing fits, teams build custom ingestion with Spark or SQL. Not everything is Databricks-operated, community connectors are not a free managed service, and the catalog reaches well beyond databases and files.`,
    explanationPt: `O Lakeflow Connect organiza a ingestão por tipo de fonte — bancos de dados e CDC, aplicações SaaS, arquivos, streaming e fontes baseadas em query. Os managed connectors são aqueles que a Databricks hospeda e opera: o time seleciona tabelas ou tópicos e os dados aterrissam em tabelas governadas pelo Unity Catalog, sem infraestrutura para rodar. Já os community connectors são pacotes open-source que o time inclui e executa dentro dos seus próprios pipelines; e, quando nada serve, os times constroem ingestão customizada com Spark ou SQL. Nem tudo é operado pela Databricks, community connectors não são um serviço gerenciado gratuito, e o catálogo vai muito além de bancos e arquivos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-045",
    domainCode: 2,
    stem: `A Structured Streaming query reads a 12-partition Kafka topic that feeds a Delta table. During traffic spikes, single micro-batches grow enormous and overwhelm the cluster. The team wants to cap how much data each micro-batch consumes and asks what controls the number of concurrent read tasks. Which configuration answers both concerns?`,
    options: [
      "Executor count: read parallelism depends only on how many workers the cluster has, and the topic's partition layout plays no role",
      "Topic repartitioning: changing the partition layout is the only throttling mechanism, because Spark exposes no rate-limiting option for Kafka",
      "Manual pacing: Kafka sources cannot be rate-limited in Spark at all, so an operator must pause and resume the query during spikes",
      "Offset cap: set kafka.maxOffsetsPerTrigger to bound each micro-batch; read tasks follow the topic's partitions, raised by minPartitions",
    ],
    correctIndex: 3,
    explanationEn: `kafka.maxOffsetsPerTrigger is the rate-limiting option of the Kafka source: it caps how many offsets a single micro-batch may consume, which flattens the spikes. Read parallelism is determined by the topic's partitions — the source creates one read task per topic-partition — and can be raised with minPartitions; adding executors alone does not create more read tasks. Changing the topic's partition layout changes its parallelism but is not a throttling mechanism, and Kafka streams can absolutely be rate-limited in Spark.`,
    explanationPt: `kafka.maxOffsetsPerTrigger é a opção de limitação de ritmo da fonte Kafka: ela limita quantos offsets um único micro-batch pode consumir, o que achata os picos. O paralelismo de leitura é determinado pelas partições do tópico — a fonte cria uma task de leitura por partição do tópico — e pode ser aumentado com minPartitions; só adicionar executors não cria mais tasks de leitura. Mudar o layout de partições do tópico altera o paralelismo, mas não é um mecanismo de throttling, e streams Kafka podem, sim, ter ritmo limitado no Spark.`,
    referenceUrl: "https://docs.databricks.com/aws/en/connect/streaming/kafka/",
    referenceTitle: "Connect to Apache Kafka — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-046",
    domainCode: 2,
    stem: `A bronze streaming table in a Lakeflow pipeline ingests device events. Rows with a null device_id arrive occasionally; they must never reach the table, but the team wants the failure counts visible in pipeline metrics. The current definition is:

\`\`\`sql
CREATE OR REFRESH STREAMING TABLE main.bronze.device_events
AS SELECT * FROM STREAM read_files('/Volumes/main/bronze/devices/');
\`\`\`

How should the pipeline handle the invalid rows?`,
    options: [
      "Add an expectation with the default warn action: invalid rows still land in the table, and only failure counts appear as metrics",
      "Add a CONSTRAINT ... EXPECT (device_id IS NOT NULL) ON VIOLATION DROP ROW clause: invalid rows are dropped and their count is logged",
      "Leave the definition as is and filter WHERE device_id IS NOT NULL in every downstream dashboard and query that reads the table",
      "Direct all raw events into a separate quarantine table and have an on-call engineer delete the invalid rows manually after every pipeline refresh",
    ],
    correctIndex: 1,
    explanationEn: `Expectations are the built-in mechanism for this exact need. The default warn action only records failures — invalid rows still land in the table — so it does not meet the requirement. Adding a CONSTRAINT ... EXPECT (device_id IS NOT NULL) ON VIOLATION DROP ROW clause drops violating rows before they are written, while the count of dropped rows is logged with the dataset's metrics and shown in the pipeline UI and event log. Filtering in downstream dashboards leaves the bad rows in bronze, and a manually tended quarantine table is neither automated nor tracked by metrics.`,
    explanationPt: `As expectations são o mecanismo nativo exatamente para essa necessidade. A ação padrão warn apenas registra falhas — as linhas inválidas continuam entrando na tabela — e, portanto, não atende ao requisito. Incluir a cláusula CONSTRAINT ... EXPECT (device_id IS NOT NULL) ON VIOLATION DROP ROW descarta as linhas violadoras antes da escrita, enquanto a contagem de linhas descartadas fica registrada nas métricas do dataset e aparece na UI do pipeline e no event log. Filtrar nos dashboards a jusante deixa as linhas ruins no bronze, e uma tabela de quarentena cuidada manualmente não é automatizada nem acompanhada por métricas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ldp/concepts/streaming-tables",
    referenceTitle: "Streaming tables (Lakeflow pipelines) — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-047",
    domainCode: 2,
    stem: `A producer team can deliver its event feed either as Avro or as raw XML files, and it asks the ingestion team which formats can be loaded directly into Delta tables with COPY INTO or Auto Loader — without any custom parsing code — before they commit to a serialization.

Which answer is accurate for the current platform?`,
    options: [
      "Only CSV and JSON load natively; Avro and XML must both be converted to Parquet before ingestion",
      "Avro requires a Lakeflow Connect database connector, while XML loads directly with COPY INTO",
      "Both load natively: formats include CSV, JSON, XML, Avro, ORC, Parquet, text, and binary files",
      "Auto Loader reads XML, but COPY INTO is limited to CSV, JSON, and Parquet sources",
    ],
    correctIndex: 2,
    explanationEn: `Both COPY INTO and Auto Loader support a common set of file formats natively: CSV, JSON, XML, Avro, ORC, Parquet, text, and binary files. The team can therefore ingest either feed — Avro or XML — as a plain file source, with schema inference or an explicit schema, and no custom parsing step. No pre-conversion to Parquet is required, Avro is a plain file format rather than a database connector concern, and the supported-format sets of COPY INTO and Auto Loader are not split the way the distractors describe.`,
    explanationPt: `Tanto o COPY INTO quanto o Auto Loader suportam nativamente um conjunto comum de formatos de arquivo: CSV, JSON, XML, Avro, ORC, Parquet, text e binary files. O time pode, portanto, ingerir qualquer um dos feeds — Avro ou XML — como fonte de arquivos simples, com inferência de schema ou schema explícito, sem nenhuma etapa de parsing customizada. Não é preciso converter para Parquet antes, o Avro é um formato de arquivo e não um caso de conector de banco, e os conjuntos de formatos suportados por COPY INTO e Auto Loader não são divididos do modo descrito pelos distratores.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/copy-into",
    referenceTitle: "Get started using COPY INTO — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-048",
    domainCode: 2,
    stem: `Files land in a Unity Catalog volume at unpredictable hours: some days at 08:00, some at 23:00, and some days not at all. Consumers want each delivery loaded shortly after it arrives, but the team rejects an always-on stream and refuses fixed-interval scans that mostly find nothing. Which design ingests every delivery soon after it lands?`,
    options: [
      "A Lakeflow Job with a file arrival trigger on the volume, running Auto Loader with Trigger.AvailableNow: each run wakes on arrival, processes pending files, and stops",
      "An always-on stream with trigger(processingTime='1 minute') on continuous compute, so a micro-batch checks for new files every minute around the clock",
      "A cron schedule firing every five minutes that runs COPY INTO over the whole directory, accepting that most runs find nothing new",
      "A scheduled job whose Trigger.AvailableNow step runs alongside a parallel always-on stream, because AvailableNow requires an active query to work",
    ],
    correctIndex: 0,
    explanationEn: `A file arrival trigger fires the Lakeflow Job when new files land in the monitored Unity Catalog volume or external location — the feature exists precisely for irregular arrivals that defeat efficient scheduling. The job's task runs Auto Loader with Trigger.AvailableNow, which processes every file that is currently available and then stops, giving incremental, exactly-once ingestion with no always-on compute. A processingTime stream pays for idle compute around the clock; a five-minute cron mostly runs empty and duplicates the trigger's purpose; and AvailableNow is a trigger mode of its own that needs no parallel stream.`,
    explanationPt: `Um file arrival trigger dispara o Lakeflow Job quando novos arquivos chegam ao volume do Unity Catalog ou ao external location monitorado — o recurso existe exatamente para chegadas irregulares que atrapalham o agendamento eficiente. A tarefa do job roda o Auto Loader com Trigger.AvailableNow, que processa todos os arquivos disponíveis no momento e então encerra, entregando ingestão incremental com semântica exactly-once e sem compute sempre ativo. Um stream com processingTime paga compute ocioso 24 horas por dia; um cron de cinco minutos quase sempre roda vazio e duplica o propósito do trigger; e AvailableNow é um modo de trigger próprio, que não precisa de nenhum stream paralelo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/file-arrival-triggers",
    referenceTitle: "Trigger jobs when new files arrive — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-049",
    domainCode: 2,
    stem: `Two teams each start their own Auto Loader stream over the same landing directory, writing to the same Delta table, main.bronze.clicks. Each stream has its own checkpoint location and its own Lakeflow Job. Days later, the table holds exactly two copies of every ingested file. Why did the duplicates appear, and what is the correct fix?`,
    options: [
      "Delta Lake should have detected the distinct checkpoints and deduplicated the writes; the duplicates point to a corrupted transaction log instead",
      "Auto Loader refuses a second stream targeting the same table with a lock error, so one of the jobs must have silently skipped its files",
      "Each stream tracks its own progress, so both discovered and ingested the same files; run a single stream per table or merge the sources",
      "The producer uploaded every file twice into the landing directory, because separate stream writers can never create duplicates by design",
    ],
    correctIndex: 2,
    explanationEn: `Each Auto Loader stream is an independent streaming query with its own checkpoint, and each one discovers and ingests files on its own; nothing in Delta Lake coordinates two writers or deduplicates their appends. Pointing two streams at the same landing directory and the same table means every file is read twice and appended twice. The fix is one stream per target table, or a single stream that unions the sources. There is no lock error between separate streams, and a producer that wrote each file once cannot explain exactly two copies of everything.`,
    explanationPt: `Cada stream do Auto Loader é uma streaming query independente, com checkpoint próprio, e cada uma descobre e ingere arquivos por conta própria; nada no Delta Lake coordena dois escritores nem deduplica seus appends. Apontar duas streams para o mesmo diretório de chegada e a mesma tabela significa que cada arquivo é lido duas vezes e gravado duas vezes. A correção é uma única stream por tabela-alvo, ou uma stream só que una as fontes. Não há erro de lock entre streams separadas, e um produtor que gravou cada arquivo uma vez não explica exatamente duas cópias de tudo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/best-practices",
    referenceTitle: "Auto Loader best practices — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-050",
    domainCode: 2,
    stem: `A landing bucket holds three years of historical files that must be loaded into a new table exactly once by a dedicated backfill run. After that run completes, ongoing arrivals must be captured incrementally by an Auto Loader stream, without reprocessing a single historical file and without backfill flags in the streaming code.

Which design meets both requirements?`,
    options: [
      "Point the Auto Loader stream at the whole bucket with a low cloudFiles.maxFilesPerTrigger and let it chew through history first",
      "Load history with COPY INTO and keep using COPY INTO nightly, because Auto Loader would reload everything anyway",
      "Run one backfill batch with COPY INTO over the history, then start Auto Loader with cloudFiles.includeExistingFiles set to false",
      "Start the stream first and run the backfill afterwards, since Auto Loader skips files loaded by other tools",
    ],
    correctIndex: 2,
    explanationEn: `With cloudFiles.includeExistingFiles set to false, Auto Loader's first run deliberately ignores everything already present in the input path, so the stream starts clean and only picks up files that arrive after it starts. The historical load is therefore done by a separate, one-time batch — COPY INTO over the historical files — before the stream starts, and the two phases never overlap. Streaming the whole bucket would reprocess history slowly through streaming machinery; continuing with COPY INTO nightly forgoes Auto Loader's incremental efficiency for ongoing arrivals; and Auto Loader does not consult what other tools loaded — running the backfill after the stream starts would double-load files the stream had not yet consumed.`,
    explanationPt: `Com cloudFiles.includeExistingFiles definido como false, a primeira execução do Auto Loader ignora deliberadamente tudo o que já existe no caminho de entrada, então o stream começa limpo e captura apenas os arquivos que chegarem depois do seu início. A carga histórica fica, portanto, para um batch único e separado — COPY INTO sobre os arquivos históricos — antes de o stream iniciar, e as duas fases nunca se sobrepõem. Transmitir o bucket inteiro reprocessaria o histórico devagar pela via de streaming; seguir com COPY INTO noturno abre mão da eficiência incremental do Auto Loader para as chegadas contínuas; e o Auto Loader não consulta o que outras ferramentas carregaram — rodar o backfill depois do stream duplicaria arquivos que o stream ainda não consumiu.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-051",
    domainCode: 2,
    stem: `An engineer with a background in classic Kafka consumers is setting up a Structured Streaming read from a Confluent Kafka topic and asks where the reading position — which offsets have already been consumed — is maintained for the stream, since that determines what happens after a restart.

What should the team tell them?`,
    options: [
      "In the query's checkpoint on durable storage: offsets are committed every batch, so restarts resume from it",
      "In the broker's consumer-group offsets topic, exactly like an application using the classic Kafka consumer",
      "In memory on the driver, which means every restart begins from the earliest offset unless configured otherwise",
      "In a Databricks-managed table that the team must inspect and repair manually after failures",
    ],
    correctIndex: 0,
    explanationEn: `Structured Streaming persists a streaming query's progress — including the Kafka offsets each batch has consumed — in the checkpoint location on durable cloud storage. On restart, the query resumes from that checkpoint, so no batch is reprocessed and no offset is skipped. It deliberately does not delegate offset tracking to the Kafka consumer-group mechanism, nothing lives only in driver memory, and there is no manually maintained offsets table: the checkpoint is the single source of truth, which is also why the checkpoint location must be stable and exclusive to the query.`,
    explanationPt: `O Structured Streaming persiste o progresso da streaming query — incluindo os offsets do Kafka consumidos em cada batch — no checkpoint location, em cloud storage durável. No restart, a query retoma desse checkpoint: nenhum batch é reprocessado e nenhum offset é pulado. Ele deliberadamente não delega o rastreamento de offsets ao mecanismo de consumer group do Kafka, nada vive apenas na memória do driver e não existe tabela de offsets mantida manualmente — o checkpoint é a fonte única da verdade, e é também por isso que o checkpoint location deve ser estável e exclusivo da query.`,
    referenceUrl: "https://docs.databricks.com/aws/en/connect/streaming/kafka/",
    referenceTitle: "Structured Streaming from Kafka — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-052",
    domainCode: 2,
    stem: `During an ingestion review, the team lists their sources: PostgreSQL, Salesforce, Confluent Kafka, Google Analytics, and a niche SaaS recruiting tool with no Databricks-provided connector. For that last source, they are evaluating vendors from the Databricks partner ecosystem rather than writing custom code.

What role do partner connectors play here?`,
    options: [
      "Partner connectors replace Unity Catalog governance for the sources they ingest, so no grants apply to their tables",
      "Partner connectors are required for every SaaS source, including well-covered ones like Salesforce",
      "Partner connectors extend coverage to sources without a managed connector, through established ecosystem vendors",
      "Partner connectors run only inside Lakeflow Jobs, executing as notebook tasks within the job graph",
    ],
    correctIndex: 2,
    explanationEn: `Partner connectors fill the coverage gap: when a source has no managed connector in the Lakeflow Connect catalog, ingestion products from Databricks technology partners — established data-integration vendors — can deliver that data into the lakehouse. They complement, rather than replace, native options: Salesforce already has a managed connector, so a partner is not required there; ingested tables still land under Unity Catalog governance; and partner products run on their own infrastructure, not as notebook tasks inside a job.`,
    explanationPt: `Os partner connectors preenchem a lacuna de cobertura: quando uma fonte não tem managed connector no catálogo do Lakeflow Connect, produtos de ingestão de parceiros tecnológicos da Databricks — os grandes fornecedores de integração de dados — podem entregar esses dados ao lakehouse. Eles complementam, e não substituem, as opções nativas: o Salesforce já tem managed connector, logo não é preciso parceiro ali; as tabelas ingeridas continuam sob a governança do Unity Catalog; e os produtos de parceiros rodam em sua própria infraestrutura, não como tarefas de notebook dentro de um job.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-053",
    domainCode: 2,
    stem: `Alongside the tabular feeds, a document-processing pipeline receives scanned invoices, signature images, and PDF contracts that downstream jobs will process but that will never be queried as rows and columns. The governance program still requires this data to live under Unity Catalog access control.

Where should these non-tabular files be stored?`,
    options: [
      "As binary blobs embedded in a Delta table column, with one row created per document",
      "In a Unity Catalog volume: /Volumes paths are governed by volume privileges",
      "In the workspace's DBFS root, which Unity Catalog also governs by default",
      "They cannot be governed at all, because Unity Catalog only manages tables",
    ],
    correctIndex: 1,
    explanationEn: `Unity Catalog volumes are the governed home for non-tabular data: files land under /Volumes/catalog/schema/volume paths, and access is controlled with volume privileges such as READ VOLUME and WRITE VOLUME, giving the document pipeline the same central governance as tables — without forcing structured rows. Embedding binaries in a Delta table bloats the table and fights the format's design; the workspace DBFS root is not governed by Unity Catalog and is not for production data; and Unity Catalog governs far more than tables — volumes, and the paths they expose, are first-class securables.`,
    explanationPt: `Os volumes do Unity Catalog são o lar governado para dados não tabulares: os arquivos ficam sob caminhos /Volumes/catalog/schema/volume e o acesso é controlado por privilégios de volume como READ VOLUME e WRITE VOLUME — o pipeline de documentos ganha a mesma governança central das tabelas, sem precisar forçar linhas estruturadas. Embutir binários numa coluna de tabela Delta incha a tabela e vai contra o desenho do formato; o DBFS root do workspace não é governado pelo Unity Catalog e não é para dados de produção; e o Unity Catalog governa muito além de tabelas — os volumes, e os caminhos que expõem, são securables de primeira classe.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-054",
    domainCode: 2,
    stem: `A business analyst has produced a one-off CSV extract on their laptop and needs it available to the whole team for a shared analysis. The team's storage is fully governed by Unity Catalog, the analyst has no cloud console access, and emailing the file around is against policy.

How should the file reach the team?`,
    options: [
      "Email the CSV to the data engineering team, who each load it locally into their own sessions",
      "Attach the file to a notebook's revision history so teammates can check it out",
      "Push the CSV to a public cloud location and share the URL with the team",
      "Upload it via Catalog Explorer into a Unity Catalog volume and share the governed path",
    ],
    correctIndex: 3,
    explanationEn: `Catalog Explorer lets a user with the right privileges upload a file directly into a Unity Catalog volume from the workspace UI: the analyst drags the CSV in, the file lands under a /Volumes path, and the team reads it with access granted through volume privileges — no cloud console, no credentials, and no ungoverned copies. Email produces scattered local copies with no governance; a notebook's revision history is for code, not shared datasets; and a public bucket removes access control rather than solving it.`,
    explanationPt: `O Catalog Explorer permite que um usuário com os privilégios certos faça upload de um arquivo diretamente para um volume do Unity Catalog pela UI do workspace: a analista arrasta o CSV, o arquivo aterrissa sob um caminho /Volumes e o time o lê com acesso concedido por privilégios de volume — sem console de nuvem, sem credenciais e sem cópias sem governança. O e-mail gera cópias locais dispersas e ingovernadas; o histórico de revisões de um notebook é para código, não para datasets compartilhados; e um bucket público remove o controle de acesso em vez de resolvê-lo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/",
    referenceTitle: "What is Unity Catalog? — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S2-055",
    domainCode: 2,
    stem: `A feed has a strict schema contract with the producing team: the ingested table must contain exactly the agreed columns, and anything the producer adds outside the contract must be captured for review rather than silently appearing in the table. The ingestion uses Auto Loader.

How should the stream be configured?`,
    options: [
      "Supply the agreed schema explicitly with evolution off; unexpected columns then land in the rescued data column",
      "Use schema inference with default evolution, so new columns appear immediately and visibly in the table for review",
      "Let inference run without a schema location, which freezes the schema on the first file read",
      "Set evolutionMode to addNewColumns and review the table's history after each run for surprises",
    ],
    correctIndex: 0,
    explanationEn: `With an explicit schema supplied to Auto Loader and schema evolution left off, the enforced schema is exactly the contract: files are parsed against it, and columns that do not match the contract — new, renamed, or mistyped — are set aside into the rescued data column for review instead of altering the table. Inference with default evolution would surface new columns immediately, violating the contract; a missing schema location with inference is simply a misconfiguration of the evolution workflow; and addNewColumns is the opposite of what the contract demands.`,
    explanationPt: `Com um schema explícito fornecido ao Auto Loader e a evolução de schema desativada, o schema enforceado é exatamente o contrato: os arquivos são parseados contra ele e as colunas que não casam com o contrato — novas, renomeadas ou com tipo errado — vão parar na rescued data column para revisão, em vez de alterar a tabela. Inferência com evolução default faria colunas novas aparecerem imediatamente, violando o contrato; rodar inferência sem schema location é simplesmente uma má configuração do fluxo de evolução; e addNewColumns é o oposto do que o contrato exige.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-056",
    domainCode: 2,
    stem: `A managed database connector will replicate data from a production PostgreSQL instance into Unity Catalog. Of the roughly forty schemas in the instance, the team is only allowed to replicate twelve specific tables, and those tables must land in the ops schema of the main catalog — not wherever a default would put them.

What must the team configure?`,
    options: [
      "The connector's table selection (the twelve approved tables) plus the destination catalog and schema for the replicas",
      "Nothing beyond credentials: a managed connector replicates the full database by definition, with a fixed destination",
      "The source table list only, because Unity Catalog always chooses destinations automatically per connector",
      "A separate workspace per replicated table, so each lands under its own governance boundary",
    ],
    correctIndex: 0,
    explanationEn: `Managed connectors are configured with an explicit scope: the team selects which source tables the connector replicates — the twelve approved tables, not the whole database — and chooses the destination catalog and schema in Unity Catalog where the replicated tables are created. The selection is part of the connector's configuration, and changing it is a deliberate operation, which is exactly what a replication approval process wants. Full-database replication is not forced, destinations are configured rather than automatic, and per-table workspaces are not a governance pattern the platform uses.`,
    explanationPt: `Os managed connectors são configurados com um escopo explícito: o time seleciona quais tabelas de origem o conector replica — as doze aprovadas, não o banco inteiro — e escolhe o catálogo e o schema de destino no Unity Catalog onde as tabelas replicadas são criadas. A seleção faz parte da configuração do conector, e mudá-la é uma operação deliberada — exatamente o que um processo de aprovação de replicação exige. A replicação total do banco não é imposta, os destinos são configurados em vez de automáticos, e workspaces por tabela não são um padrão de governança da plataforma.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-057",
    domainCode: 2,
    stem: `A nightly JDBC extraction reads a 200-million-row table from an external database and then filters it down to the last three days inside Spark. Network costs are enormous, and the external database is barely coping with the full scans.

Which change pushes the filtering work to the source database?`,
    options: [
      "Increase numPartitions so the extraction parallelizes across more JDBC connections and the full scan finishes faster",
      "Wrap the predicate into the dbtable subquery, so the source database applies it before returning rows",
      "Cache the DataFrame before filtering, so the second run skips the JDBC read",
      "Convert the read to Auto Loader and let it discover only the new rows",
    ],
    correctIndex: 1,
    explanationEn: `When the dbtable option of the JDBC reader is given a subquery — the filtering predicate included — the source database evaluates the predicate and returns only the matching rows: predicate pushdown moves the work to where the data lives, cutting transfer and scan cost on both sides. More partitions parallelize the same full scan and make the source's situation worse; caching only avoids repeating an expensive read, not the read itself; and Auto Loader reads files from cloud storage, not databases.`,
    explanationPt: `Quando a opção dbtable do leitor JDBC recebe uma subquery — com o predicado de filtro incluído — o banco de origem avalia o predicado e devolve apenas as linhas que casam: o predicate pushdown move o trabalho para onde os dados vivem, cortando o custo de transferência e de varredura nos dois lados. Aumentar o número de partições apenas paraleliza a mesma varredura completa e piora a situação do banco de origem; o cache evita repetir a leitura cara, mas não evita a leitura em si; e o Auto Loader lê arquivos de cloud storage, não bancos de dados.`,
    referenceUrl: "https://docs.databricks.com/aws/en/archive/connectors/jdbc",
    referenceTitle: "Query databases using JDBC — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S2-058",
    domainCode: 2,
    stem: `A data provider delivers files inside a Hive-style directory layout — year=2026/month=10/day=27/part-001.json — and the ingestion team wants the year, month, and day values to become real columns of the target table without parsing file paths by hand.

Which Auto Loader capability provides this?`,
    options: [
      "pathGlobFilter, with a glob pattern per date component applied once per ingestion",
      "A UDF that splits the input path column on the equals sign and the year, month, and day tokens in every file",
      "Partition inference: Auto Loader derives partition columns from the directory layout of the files",
      "It is not possible, because directory layout information is discarded during ingestion",
    ],
    correctIndex: 2,
    explanationEn: `Auto Loader can infer partition columns directly from a Hive-style directory layout: with partition discovery, the year, month, and day encoded in the paths become columns of the ingested data, without any hand-written path parsing. A glob filter selects which files are read, not what becomes a column; a UDF that re-parses paths re-implements what the source already provides; and the claim that layout information is lost is the opposite of how partition discovery works.`,
    explanationPt: `O Auto Loader consegue inferir colunas de partição diretamente de um layout de diretórios estilo Hive: com a partition discovery, os valores de ano, mês e dia codificados nos caminhos viram colunas dos dados ingeridos, sem nenhum parsing de caminho escrito à mão. Um glob filter seleciona quais arquivos são lidos, não o que vira coluna; uma UDF que reparseia caminhos reimplementa o que a fonte já fornece; e a afirmação de que a informação de layout é perdida é o oposto de como a partition discovery funciona.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/",
    referenceTitle: "What is Auto Loader? — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S2-059",
    domainCode: 2,
    stem: `A producing system can publish its events either as a continuous stream to a Kafka topic or as files dropped into cloud storage every few minutes. The consuming lakehouse team must choose one path, and both would technically work.

Which consideration should drive the choice?`,
    options: [
      "Requirements decide: Kafka for low-latency continuous streams; file drops for simpler operation and reprocessing",
      "Kafka should always be preferred, because it is the more modern protocol for publishing and moving event data",
      "File-based ingestion cannot be incremental and always reloads the full history on every single run",
      "The choice has no downstream effect, so either path is operationally equivalent",
    ],
    correctIndex: 0,
    explanationEn: `Both paths are legitimate ingestion patterns, and the decision rests on requirements: if consumers need seconds-to-minutes freshness and are prepared to operate a continuously running stream, the Kafka topic fits; if minutes-to-hours freshness is acceptable, file drops with Auto Loader or COPY INTO give simpler operations, natural batching, and easy reprocessing of history. Dismissing either path categorically — "always Kafka" or "files can't be incremental" — is wrong, and the choice absolutely shapes the consumer's architecture, from compute that stays warm to how replay works.`,
    explanationPt: `Os dois caminhos são padrões legítimos de ingestão, e a decisão repousa nos requisitos: se os consumidores precisam de frescor de segundos a minutos e estão dispostos a operar um stream contínuo, o tópico Kafka serve; se frescor de minutos a horas é aceitável, os file drops com Auto Loader ou COPY INTO dão operação mais simples, batching natural e reprocessamento fácil do histórico. Descartar categoricamente qualquer um dos caminhos — "sempre Kafka" ou "arquivos não são incrementais" — está errado, e a escolha molda sim a arquitetura do consumidor, do compute que fica quente à forma de replay.`,
    referenceUrl: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/",
    referenceTitle: "Lakeflow Connect connector concepts — Databricks Docs",
    difficulty: "EASY",
  },
];

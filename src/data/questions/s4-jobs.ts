import type { SeedQuestion } from "./types";

/**
 * Section 4 — Working with Lakeflow Jobs (16%)
 * 18 questions (S4-001 .. S4-018), authored in Task 1-a.
 * Facts verified against the official docs pages referenced per question.
 */
export const s4Questions: SeedQuestion[] = [
  {
    key: "S4-001",
    domainCode: 4,
    stem: `A Lakeflow Job contains four tasks: \`ingest\` (notebook task), \`validate\` (SQL task), \`enrich\` (pipeline task), and \`publish\` (dashboard task). \`validate\` and \`enrich\` each depend only on \`ingest\`. \`publish\` depends on both \`validate\` and \`enrich\`, and every dependency uses the default run-if condition. In the latest run, \`ingest\` succeeded, but \`validate\` failed.

What is the expected behavior?`,
    options: [
      "The run is canceled immediately, so enrich and publish never start",
      "Enrich runs, and publish also runs because one of its two dependencies succeeded",
      "Enrich runs because it depends only on ingest, and publish is skipped because one of its dependencies failed",
      "Both enrich and publish are skipped, because Lakeflow Jobs stops all tasks after any failure",
    ],
    correctIndex: 2,
    explanationEn: `Lakeflow Jobs executes tasks according to the DAG of dependencies. Enrich depends only on ingest, so it still runs after validate fails — parallel branches are independent. Publish uses the default run-if condition (all dependencies succeeded), so a failed dependency causes it to be skipped. A single task failure does not cancel the run: independent branches continue, skipped tasks are recorded as skipped, and the run finishes in a failed state. Jobs never stop all tasks after any failure, and partial success of dependencies does not satisfy an all-succeeded condition.`,
    explanationPt: `O Lakeflow Jobs executa as tarefas de acordo com o DAG de dependências. Enrich depende apenas de ingest, então continua rodando mesmo com a falha de validate — branches paralelos são independentes. Publish usa a condição padrão de run-if (todas as dependências com sucesso), então uma dependência falha faz com que ele seja marcado como skipped. A falha de uma única tarefa não cancela a execução: os branches independentes continuam, as tarefas puladas são registradas como skipped e o run termina com estado de falha. O Jobs nunca para todas as tarefas após qualquer falha, e o sucesso parcial das dependências não satisfaz a condição de todas com sucesso.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/control-flow",
    referenceTitle: "Control the flow of tasks within Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-002",
    domainCode: 4,
    stem: `A nightly Lakeflow Job loads data with several tasks. No matter whether those loading tasks succeed or fail, the team must always archive the temporary landing directory at the end of the run. They plan to add a final cleanup task that depends on all loading tasks.

Which run-if dependency should the cleanup task use?`,
    options: [
      "All succeeded, so the cleanup runs after every dependency completes without error",
      "At least one succeeded, so the cleanup runs whenever any loading task finishes successfully",
      "None failed, which is the only condition that guarantees the cleanup task always runs",
      "All done, which runs the cleanup task once its dependencies have finished, regardless of their outcomes",
    ],
    correctIndex: 3,
    explanationEn: `Run-if conditions determine when a downstream task runs based on the outcome of upstream tasks. "All done" runs the task after its dependencies have completed, whether they succeeded or failed — exactly what an always-run cleanup needs. "All succeeded" (the default) and "None failed" both skip the cleanup precisely when there are failures, and "At least one succeeded" still skips it when every dependency fails. Cleanup work that must happen on every run should therefore depend on "All done."`,
    explanationPt: `As condições run-if determinam quando uma tarefa downstream executa com base no resultado das tarefas a montante. "All done" executa a tarefa depois que suas dependências terminaram, tenham tido sucesso ou falha — exatamente o que uma limpeza que precisa rodar sempre exige. "All succeeded" (o padrão) e "None failed" pulam a limpeza justamente quando há falhas, e "At least one succeeded" ainda a pula quando todas as dependências falham. Um trabalho de limpeza que precisa acontecer em toda execução deve, portanto, depender de "All done".`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/control-flow",
    referenceTitle: "Control the flow of tasks within Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-003",
    domainCode: 4,
    stem: `A notebook task in a Lakeflow Job calls a partner REST API that intermittently returns HTTP 503 errors. The team wants the task to be re-run automatically up to three times before it is marked as failed. The task also has a timeout configured.

How should the team meet this requirement?`,
    options: [
      "In the task's advanced settings, click Add next to Retries and set the retry count and interval — with a timeout set, the timeout applies to each retry",
      "Set the job's Maximum concurrent runs to 3, so failed attempts are replaced by fresh runs",
      "Wrap the notebook in a For each task with three iterations that re-invokes it on failure",
      "Configure a failure notification destination that triggers Run now whenever a failure email arrives",
    ],
    correctIndex: 0,
    explanationEn: `Retries are an advanced task setting: after configuring the number of retries and the interval (measured between the start of the failed run and the retry), the task automatically restarts up to that number of times on error before being marked failed. Retries are designed for transient errors such as 503 responses. If both Timeout and Retries are configured, the timeout applies to each retry attempt. Maximum concurrent runs controls parallel job runs, For each iterates over parameter values rather than failures, and notifications only inform — none of them re-executes the task.`,
    explanationPt: `Retries são uma configuração avançada da tarefa: após definir o número de retries e o intervalo (medido entre o início da execução que falhou e o retry), a tarefa reinicia automaticamente até esse número de vezes em caso de erro antes de ser marcada como failed. Retries são feitos para erros transitórios, como respostas 503. Se Timeout e Retries estiverem configurados, o timeout se aplica a cada tentativa. Maximum concurrent runs controla execuções paralelas do job, o For each itera sobre valores de parâmetros e não sobre falhas, e notificações apenas informam — nada disso reexecuta a tarefa.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-004",
    domainCode: 4,
    stem: `The first task in a Lakeflow Job, named qc, ends with \`dbutils.jobs.taskValues.set(key = "bad_records", value = bad_count)\`. If bad_records is greater than zero, the quarantine notebook must run; otherwise the publish notebook must run.

How should the data engineer implement this branching?`,
    options: [
      "Add a For each task whose inputs are the values true and false, and let a wrapper notebook decide which path to call",
      "Add an If/else condition task with the expression {{tasks.qc.values.bad_records}} > 0, then make quarantine depend on the true outcome and publish depend on the false outcome",
      "Add quarantine with a run-if condition of All failed and publish with All succeeded, both depending on qc",
      "Pass bad_records as a job parameter to both notebooks and let each notebook exit early when it should not run",
    ],
    correctIndex: 1,
    explanationEn: `The If/else condition task adds boolean branching to the task graph. Its operands can reference task values, job parameters, or dynamic values, so an expression such as {{tasks.qc.values.bad_records}} > 0 evaluates the count set by the qc task. Tasks added below the If/else task depend on the true outcome by default, and selecting the false outcome configures the else branch — quarantine then runs when the condition is true and publish when it is false. Run-if conditions react to task success or failure, not to values, and hiding branching inside notebooks keeps it out of the job graph and run history.`,
    explanationPt: `A tarefa If/else condition adiciona branching booleano ao grafo de tarefas. Seus operandos podem referenciar task values, parâmetros do job ou dynamic values, então uma expressão como {{tasks.qc.values.bad_records}} > 0 avalia a contagem definida pela tarefa qc. As tarefas adicionadas abaixo da tarefa If/else dependem do resultado true por padrão, e selecionar o resultado false configura o ramo else — quarantine roda quando a condição é verdadeira e publish quando é falsa. As condições run-if reagem a sucesso ou falha de tarefas, não a valores; e esconder o branching dentro dos notebooks o mantém fora do grafo do job e do histórico de execuções.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/tasks/if-else",
    referenceTitle: "Add branching logic to a job with the If/else task — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-005",
    domainCode: 4,
    stem: `A Lakeflow Job task named agg ends with:

\`\`\`python
dbutils.jobs.taskValues.set(key = "row_count", value = result_count)
\`\`\`

result_count is the Python float \`12.0\`. An If/else condition task evaluates \`{{tasks.agg.values.row_count}} == 12\`, and the engineer expects the true branch to run — but the condition evaluates to false.

Why did this happen, and which comparison behaves numerically?`,
    options: [
      "Task values lose precision when serialized, so == is unreliable; >= has the same precision problem",
      "If/else conditions accept only boolean task values, so numeric conditions silently evaluate to false",
      "The == and != operators compare operands as strings, so 12.0 does not equal 12; the >, >=, <, and <= operators perform numeric comparisons, so >= 12 would evaluate to true",
      "The If/else task failed to read the value, because task values cannot store numbers",
    ],
    correctIndex: 2,
    explanationEn: `In If/else condition tasks, == and != perform string comparison of their operands: 12.0 == 12 is false because "12.0" and "12" differ as strings. The relational operators >, >=, <, and <= perform numeric comparisons — 12.0 >= 12 evaluates to true. Task values may be numeric, string, or boolean; only values expressible as JSON are allowed, and nothing is lost to rounding. Non-numeric values are serialized to strings (for example, booleans become "true" or "false"), which is why equality checks should compare consistent string formats or use numeric operators.`,
    explanationPt: `Nas tarefas If/else condition, os operadores == e != comparam os operandos como strings: 12.0 == 12 é falso porque "12.0" e "12" são diferentes como texto. Já os operadores relacionais >, >=, < e <= fazem comparação numérica — 12.0 >= 12 avalia como verdadeiro. Task values podem ser numéricos, strings ou booleanos; somente valores expressáveis como JSON são permitidos, e nada se perde por arredondamento. Valores não numéricos são serializados como strings (por exemplo, booleanos viram "true" ou "false"), e por isso checagens de igualdade devem comparar formatos de string consistentes ou usar operadores numéricos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/tasks/if-else",
    referenceTitle: "Add branching logic to a job with the If/else task — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S4-006",
    domainCode: 4,
    stem: `A team maintains a cleaning notebook that takes a table name as a parameter. They want one Lakeflow Job to run this notebook once for each of six bronze tables — sales, orders, returns, customers, products, and suppliers — with at most two iterations running at the same time.

Which approach should they use?`,
    options: [
      "A For each task whose Inputs is a JSON array of the table names, a nested notebook task referencing {{input.table}}, and Concurrency set to 2",
      "A For each task containing six nested For each tasks, one per table, sharing a single concurrency setting",
      "Six If/else condition tasks, one per table, each branching to the cleaning notebook",
      "One notebook task that loops over the six table names in Python and applies the cleaning logic sequentially",
    ],
    correctIndex: 0,
    explanationEn: `The For each task runs a nested task in a loop, passing a different set of parameters to each iteration. Inputs accepts a JSON array of values (for example, an array of objects like {"table": "sales"}), the nested notebook references each element with {{input.table}}, and the Concurrency setting caps how many iterations run in parallel — the default is 1, so the team must set it to 2. The nested task must be a standard task type, and one For each task cannot contain another. A Python loop inside a single task would serialize the work and hide per-table runs from monitoring, retries, and repair.`,
    explanationPt: `A tarefa For each executa uma tarefa aninhada em loop, passando um conjunto diferente de parâmetros a cada iteração. O Inputs aceita um array JSON de valores (por exemplo, um array de objetos como {"table": "sales"}), o notebook aninhado referencia cada elemento com {{input.table}} e a configuração de Concurrency limita quantas iterações rodam em paralelo — o padrão é 1, então a equipe deve definir 2. A tarefa aninhada precisa ser de um tipo padrão, e um For each não pode conter outro. Um loop em Python dentro de uma única tarefa serializaria o trabalho e esconderia as execuções por tabela do monitoramento, dos retries e do repair.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/tasks/for-each",
    referenceTitle: "Use a For each task to run another task in a loop — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-007",
    domainCode: 4,
    stem: `The first task in a Lakeflow Job, named load_raw, ends with:

\`\`\`python
dbutils.jobs.taskValues.set(key = "ingested_rows", value = raw_df.count())
\`\`\`

The next task, validate_counts, must use that number as the expected row count in its own parameters.

How should validate_counts receive the value?`,
    options: [
      "Task values become global variables that every subsequent task in the job can read directly",
      "Call dbutils.jobs.taskValues.set() again inside validate_counts, using the same key",
      "Read the value with spark.conf.get('ingested_rows') in the downstream task",
      "Reference it in the task parameters with the dynamic value {{tasks.load_raw.values.ingested_rows}}",
    ],
    correctIndex: 3,
    explanationEn: `Task values pass information between tasks in a job: a task sets a key with dbutils.jobs.taskValues.set(), and downstream tasks reference the value with the dynamic value pattern {{tasks.<task_name>.values.<value_name>}} in their parameters. This works for every task type that supports parameters, including SQL tasks, and the value is displayed in the output pane of the task run details. Task values are not global variables, are not re-set where they are consumed, and are not Spark configurations — they are an explicit hand-off between named tasks.`,
    explanationPt: `Os task values passam informações entre as tarefas de um job: uma tarefa define uma chave com dbutils.jobs.taskValues.set() e as tarefas seguintes referenciam o valor com o padrão de dynamic value {{tasks.<nome_da_tarefa>.values.<nome_do_valor>}} em seus parâmetros. Isso funciona para todo tipo de tarefa que aceita parâmetros, incluindo tarefas SQL, e o valor aparece no painel de saída dos detalhes da execução da tarefa. Task values não são variáveis globais, não são redefinidos onde são consumidos e não são configurações do Spark — são uma passagem explícita de valor entre tarefas nomeadas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/task-values",
    referenceTitle: "Use task values to pass information between tasks — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-008",
    domainCode: 4,
    stem: `A notebook task in a Lakeflow Job must receive a processing date and an environment name. The notebook already starts with:

\`\`\`python
batch_date = dbutils.widgets.get("batch_date")
env = dbutils.widgets.get("env")
\`\`\`

How should the data engineer configure the task so the notebook receives these values?`,
    options: [
      "Declare the two values with dbutils.jobs.taskValues.set() in a task that runs before the notebook",
      "Add batch_date and env as key-value Parameters on the notebook task",
      "Store the values as environment variables on the job cluster and read them with os.environ",
      "Set the values as Spark configurations in the task's advanced options",
    ],
    correctIndex: 1,
    explanationEn: `Notebook tasks accept Parameters as key-value pairs, and the notebook reads them with dbutils.widgets.get(). The parameters travel with each run, can be overridden for one-off executions, and appear in the run's details. Task values are set inside a running task, not before it; cluster environment variables are not how job parameters reach a notebook and would not appear in the run history. Spark configurations tune the engine (for example, shuffle partitions) and are not a channel for passing task inputs.`,
    explanationPt: `Tarefas de notebook aceitam Parameters como pares chave-valor, e o notebook os lê com dbutils.widgets.get(). Os parâmetros acompanham cada execução, podem ser sobrescritos em execuções pontuais e aparecem nos detalhes do run. Task values são definidos dentro de uma tarefa em execução, não antes dela; variáveis de ambiente do cluster não são a forma de parâmetros de job chegarem ao notebook e não apareceriam no histórico da execução. Configurações do Spark ajustam o motor (por exemplo, shuffle partitions) e não são um canal para passar entradas da tarefa.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/tasks/notebook",
    referenceTitle: "Notebook task for jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-009",
    domainCode: 4,
    stem: `A team is building a Lakeflow Job with three steps: (1) run a saved Databricks SQL query that aggregates yesterday's orders into a reporting table; (2) run an update of an existing Lakeflow Spark Declarative Pipelines (formerly Delta Live Tables) pipeline that rebuilds the silver layer; (3) refresh a published dashboard so BI users see updated results.

Which task types should they configure for these steps?`,
    options: [
      "A SQL task, a Pipeline task, and a Dashboard task",
      "Three notebook tasks that call spark.sql(), dbutils, and displayHTML() respectively",
      "A single For each task that loops over the three assets",
      "Three Run Job tasks, one per asset, chained by dependencies",
    ],
    correctIndex: 0,
    explanationEn: `Lakeflow Jobs provides dedicated task types for these common steps: a SQL task runs a saved query against a SQL warehouse, a Pipeline task runs an update of an existing Lakeflow pipeline (including pipelines that maintain materialized views and streaming tables), and a Dashboard task refreshes the results of a published dashboard as part of the job. Re-implementing these steps in notebooks loses the native integration and per-task monitoring; a For each task iterates one nested task over parameter sets; and Run Job tasks execute other jobs, not queries, pipelines, or dashboards.`,
    explanationPt: `O Lakeflow Jobs oferece tipos de tarefa dedicados para essas etapas comuns: uma tarefa SQL executa uma consulta salva em um SQL warehouse, uma tarefa Pipeline roda uma atualização de um pipeline Lakeflow existente (incluindo pipelines que mantêm materialized views e streaming tables) e uma tarefa Dashboard atualiza os resultados de um dashboard publicado como parte do job. Reimplementar esses passos em notebooks perde a integração nativa e o monitoramento por tarefa; o For each itera uma única tarefa aninhada sobre conjuntos de parâmetros; e as tarefas Run Job executam outros jobs — não consultas, pipelines ou dashboards.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-010",
    domainCode: 4,
    stem: `A Lakeflow Job includes a SQL task that runs a saved query against Unity Catalog tables, alongside notebook tasks that run on a classic job cluster. Before approving the job, the workspace admin wants to confirm exactly which compute resource the SQL task will use.

Which statement is correct?`,
    options: [
      "The SQL task runs on the job's classic job cluster if one is configured, and fails otherwise",
      "The SQL task starts its own Lakeflow pipeline to execute the query",
      "The SQL task runs against a SQL warehouse — a serverless SQL warehouse is recommended, and a pro SQL warehouse is also supported",
      "The SQL task runs on whatever all-purpose cluster is currently attached to the SQL editor",
    ],
    correctIndex: 2,
    explanationEn: `SQL tasks execute against SQL warehouses, not Spark job clusters: the recommended compute is a serverless SQL warehouse, and a pro SQL warehouse is also supported; the warehouse is selected in the task configuration. Classic job clusters serve notebook, Python, JAR, and other Spark-based tasks. Pipelines manage their own compute in the pipeline definition, and an all-purpose cluster attached to an editor is never used by a scheduled task. This separation lets SQL steps in a job scale independently of the Spark tasks around them.`,
    explanationPt: `As tarefas SQL são executadas em SQL warehouses, e não em job clusters Spark: o compute recomendado é um serverless SQL warehouse, e um pro SQL warehouse também é suportado; o warehouse é escolhido na configuração da tarefa. Job clusters clássicos atendem tarefas de notebook, Python, JAR e outras tarefas baseadas em Spark. Os pipelines gerenciam o próprio compute na definição do pipeline, e um cluster all-purpose conectado a um editor nunca é usado por uma tarefa agendada. Essa separação permite que as etapas SQL de um job escalem independentemente das tarefas Spark ao redor delas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/compute",
    referenceTitle: "Compute for Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-011",
    domainCode: 4,
    stem: `A Lakeflow Job on classic compute has four tasks that run sequentially, and each task is configured with its own job cluster. Every task spends several minutes waiting for its cluster to start before doing any work. The team wants to reduce this startup overhead within each run.

What should they do?`,
    options: [
      "Configure the tasks to share one jobs compute resource, which starts when the first task using it begins and terminates after the final task using it runs",
      "Replace the job clusters with one all-purpose cluster that stays running between job runs",
      "Add artificial dependencies so that all four clusters start in parallel before the tasks run",
      "Increase the worker count on each job cluster so that cluster startup finishes sooner",
    ],
    correctIndex: 0,
    explanationEn: `Multiple tasks in a job can be configured to use the same jobs compute resource: it starts when the first task configured to use it begins and terminates after the final task configured to use it runs, so sharing reduces the latency associated with start-up times. A shared job cluster is scoped to a single job run and cannot be used by other jobs or runs of the same job. Keeping an all-purpose cluster running is not recommended for production jobs and adds idle cost, and neither extra workers nor extra dependencies eliminate the per-task cluster launches.`,
    explanationPt: `Várias tarefas de um job podem ser configuradas para usar o mesmo recurso de jobs compute: ele inicia quando a primeira tarefa que o utiliza começa e termina depois da última tarefa que o utiliza, de modo que o compartilhamento reduz a latência de inicialização. Um job cluster compartilhado tem escopo de uma única execução do job e não pode ser usado por outros jobs nem por outras execuções do mesmo job. Manter um cluster all-purpose rodando não é recomendado para jobs de produção e gera custo de ociosidade; e nem mais workers nem dependências extras eliminam os lançamentos de cluster por tarefa.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/compute",
    referenceTitle: "Compute for Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-012",
    domainCode: 4,
    stem: `A Lakeflow Job runs every 30 minutes on a schedule, and each run takes about 40 minutes. The team notices that some scheduled runs never execute: while a previous run is still active, the new run appears as skipped. The job was created with the Jobs REST API, and queueing was not enabled.

What is the cause, and how can the team fix it?`,
    options: [
      "The scheduler enforces a 10-second minimum interval between runs and drops anything closer; the schedule must be shortened",
      "The job's Maximum concurrent runs defaults to 1, so extra runs are skipped; raise the setting to allow overlapping runs, or enable queueing to hold runs until capacity is free",
      "Scheduled jobs cannot overlap by design; convert the trigger to a continuous trigger to serialize the runs",
      "Skipped runs indicate an invalid cron expression; the schedule must be rewritten in Quartz cron syntax",
    ],
    correctIndex: 1,
    explanationEn: `By default, the maximum concurrent runs for a new job is 1: when a scheduled run attempts to start while the limit is reached, Databricks skips it. Raising Maximum concurrent runs (under Advanced settings) allows runs of the same job to overlap — appropriate when runs are frequent and long. Enabling queueing instead holds new runs for up to 48 hours until capacity frees up, rather than skipping them; it is on by default only for jobs created through the UI after April 15, 2024. The 10-second scheduler minimum is unrelated to a 30-minute schedule, and the cron expression is valid.`,
    explanationPt: `Por padrão, o máximo de execuções simultâneas de um novo job é 1: quando uma execução agendada tenta iniciar com o limite atingido, a Databricks a marca como skipped. Aumentar o Maximum concurrent runs (em Advanced settings) permite que execuções do mesmo job se sobreponham — adequado quando os runs são frequentes e longos. Já habilitar o queueing mantém as novas execuções em fila por até 48 horas até haver capacidade, em vez de pulá-las; ele só vem ativado por padrão em jobs criados pela UI após 15 de abril de 2024. O intervalo mínimo de 10 segundos do scheduler não se relaciona a um agendamento de 30 minutos, e a expressão cron é válida.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-013",
    domainCode: 4,
    stem: `A vendor drops CSV files into an Amazon S3 bucket at unpredictable times — sometimes several times a day, sometimes not for days. Today a cron job runs every 30 minutes and usually finds nothing new. The workspace has Unity Catalog enabled, and the bucket is registered as a Unity Catalog external location.

Which change best fits this data availability pattern?`,
    options: [
      "Keep the scheduled trigger but move it to every minute, to shrink the window for missed files",
      "Switch to a continuous trigger so the job is always running and picks up files immediately",
      "Replace the scheduled trigger with a file arrival trigger on the external location path",
      "Use a table update trigger on the Delta table that the job writes",
    ],
    correctIndex: 2,
    explanationEn: `File arrival triggers start a job run when new files arrive in a monitored Unity Catalog external location or volume — a direct fit for irregular arrivals, because the job runs when data actually lands instead of on a fixed cadence. The requirements are already satisfied: Unity Catalog is enabled and the path is a registered external location. Only new files trigger runs, and the trigger pairs naturally with Auto Loader for exactly-once ingestion. A continuous trigger keeps compute always active; polling every minute wastes runs; and a table update trigger reacts to changes in tables, not to raw file arrivals.`,
    explanationPt: `Os gatilhos de file arrival iniciam uma execução do job quando novos arquivos chegam a um external location ou volume do Unity Catalog monitorado — encaixe direto para chegadas irregulares, pois o job roda quando os dados realmente chegam, e não numa cadência fixa. Os pré-requisitos já estão atendidos: Unity Catalog habilitado e o caminho registrado como external location. Somente arquivos novos disparam execuções, e o gatilho combina naturalmente com o Auto Loader para ingestão exactly-once. Um trigger continuous mantém compute sempre ativo; rodar a cada minuto desperdiça execuções; e o table update trigger reage a mudanças em tabelas, não à chegada de arquivos brutos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/file-arrival-triggers",
    referenceTitle: "Trigger jobs when new files arrive — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-014",
    domainCode: 4,
    stem: `A file arrival trigger monitors a landing directory in a Unity Catalog volume. Files arrive in bursts: each batch of 20-30 files lands within about a minute, and batches are separated by hours. The team wants every complete batch processed by a single job run, and no more than one run every 15 minutes.

Which advanced options should they set on the trigger?`,
    options: [
      "Minimum time between triggers = 900 seconds only — runs are rate-limited, but a run can start as soon as the first files of a batch are detected, before the batch finishes landing",
      "Wait after last change = 60 seconds only — batches are debounced, but nothing caps the frequency when batches arrive close together",
      "Minimum time between triggers = 0 and Wait after last change = 0 — Databricks batches arrivals automatically by default",
      "Minimum time between triggers = 900 seconds and Wait after last change = 60 seconds",
    ],
    correctIndex: 3,
    explanationEn: `The two advanced options implement complementary rate controls. Wait after last change in seconds is a debounce: the trigger waits that long after the most recent arrival, and each new file resets the timer, so a run starts only after a batch has finished landing (60 seconds covers gaps inside a batch, while hours between batches prevent merging). Minimum time between triggers in seconds is a cooldown that caps run creation at one per interval (900 seconds = 15 minutes). Together they satisfy both requirements; each alone leaves one unmet, and zero values simply disable the controls.`,
    explanationPt: `As duas opções avançadas implementam controles complementares. Wait after last change em segundos é um debounce: o gatilho espera esse tempo após a chegada mais recente e cada arquivo novo reinicia o cronômetro, de modo que a execução só começa depois que o lote termina de chegar (60 segundos cobrem os intervalos dentro do lote, e as horas entre lotes evitam fusão). Minimum time between triggers em segundos é um cooldown que limita a criação de execuções a uma por intervalo (900 segundos = 15 minutos). Juntas atendem aos dois requisitos; isoladas, cada uma deixa um requisito de fora — e valores zero apenas desativam os controles.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/file-arrival-triggers",
    referenceTitle: "Trigger jobs when new files arrive — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S4-015",
    domainCode: 4,
    stem: `Two upstream teams independently update the Unity Catalog Delta tables sales.orders and sales.customers at unpredictable times. A downstream Lakeflow Job must run only after both tables have been updated since the previous run. The team wants to avoid an always-on cluster and does not control how the upstream teams write their data.

Which trigger should the job use?`,
    options: [
      "A scheduled trigger that runs every 10 minutes and checks both tables for new commits in a notebook",
      "A table update trigger monitoring both tables, configured to run when all monitored tables are updated",
      "A file arrival trigger on the cloud storage paths that back both tables",
      "Two jobs with a table update trigger on each table, chained by a Run Job task",
    ],
    correctIndex: 1,
    explanationEn: `A table update trigger monitors one or more tables and starts a run when they change; with multiple tables, the All tables are updated option requires every monitored table to change before triggering — exactly the requirement. It runs the job when new data is ready, with no continuously running cluster and no knowledge of the upstream write processes. Unity Catalog Delta tables are supported sources. Schedule-based polling re-implements what the trigger already provides; file arrival triggers cannot monitor table storage paths (which must not contain external tables); and chained jobs add complexity without an all-tables guarantee.`,
    explanationPt: `Um table update trigger monitora uma ou mais tabelas e inicia uma execução quando elas mudam; com várias tabelas, a opção All tables are updated exige que todas as tabelas monitoradas se alterem antes de disparar — exatamente o requisito. Ele roda o job quando os novos dados estão prontos, sem cluster continuamente ativo e sem precisar conhecer os processos que gravam os dados a montante. Tabelas Delta no Unity Catalog são fontes suportadas. Fazer polling por agendamento recria o que o gatilho já oferece; o file arrival trigger não monitora caminhos de armazenamento de tabelas (que não podem conter external tables); e jobs encadeados adicionam complexidade sem a garantia de todas as tabelas atualizadas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/trigger-table-update",
    referenceTitle: "Trigger jobs when source tables are updated — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-016",
    domainCode: 4,
    stem: `A compliance report must be generated every day at 06:00 UTC, using whatever data exists at that moment — even if no new data arrived overnight — and it must never run more than once per day. Data arrival times vary widely.

Which trigger type should this job use?`,
    options: [
      "A file arrival trigger on the landing zone, because data-driven triggers are always preferable to time-based ones",
      "A table update trigger on the report's source tables, with a 24-hour minimum time between triggers",
      "A continuous trigger that regenerates the report whenever the previous run finishes",
      "A scheduled trigger with a cron expression that fires daily at 06:00 UTC",
    ],
    correctIndex: 3,
    explanationEn: `This requirement is defined by time, not by data availability: the report must run at a fixed moment whether or not new data arrived, and exactly once per day. A scheduled (cron) trigger fits directly — time-based triggers suit deadline-driven work that is independent of arrival patterns. File arrival and table update triggers are data-driven: if no data arrives, no run happens and the 06:00 deadline is missed, and a minimum time between triggers is a rate control, not a fixed execution time. A continuous trigger would rerun the report many times per day.`,
    explanationPt: `Esse requisito é definido por tempo, e não pela disponibilidade de dados: o relatório deve rodar em um momento fixo, tenha ou não chegado dado novo, e exatamente uma vez por dia. Um trigger scheduled (cron) encaixa diretamente — gatilhos baseados em tempo servem para trabalhos orientados a prazo, independentes do padrão de chegada dos dados. File arrival e table update são data-driven: sem dados novos, nenhuma execução acontece e o prazo das 06:00 é perdido — e o mínimo de tempo entre gatilhos é um controle de taxa, não um horário fixo. Um trigger continuous reexecutaria o relatório muitas vezes por dia.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/triggers",
    referenceTitle: "Automate jobs with schedules and triggers — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-017",
    domainCode: 4,
    stem: `A Lakeflow Job has task retries configured. The on-call data engineer notices that when a task fails on its first attempt but succeeds on a retry, no notification is ever sent — the team learns about these incidents later, from downstream consumers. They want to be notified after every failed task attempt, including attempts that will be retried.

What should they change?`,
    options: [
      "Add another job-level failure notification with a different email address",
      "Switch the notification destination from email to a webhook, which bypasses retry suppression",
      "Add failure notifications on the task itself, because job-level notifications are not sent while failed tasks are being retried",
      "Enable Mute notifications until the last retry on the existing job-level notification",
    ],
    correctIndex: 2,
    explanationEn: `Job-level failure notifications are not sent when failed tasks are retried: a run that recovers through retries can finish successfully, so no job-level failure event fires. Task-level notifications — added in the task pane when editing a task — are sent for task runs, so they notify after every failed attempt, including attempts that later succeed on retry. Adding more job-level destinations or switching to webhooks does not change this behavior; webhooks are just another destination type. Mute notifications until the last retry does the opposite of the goal, silencing notifications until the final attempt.`,
    explanationPt: `As notificações de falha em nível de job não são enviadas quando tarefas com falha estão sendo repetidas: um run que se recupera via retries pode terminar com sucesso, então nenhum evento de falha do job é disparado. As notificações em nível de tarefa — adicionadas no painel da tarefa ao editá-la — são enviadas para as execuções das tarefas e, portanto, notificam após cada tentativa com falha, inclusive as que depois têm sucesso no retry. Adicionar mais destinos no nível do job ou mudar para webhook não altera esse comportamento; webhook é apenas mais um tipo de destino. Já Mute notifications until the last retry faz o oposto do objetivo, silenciando as notificações até a última tentativa.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/notifications",
    referenceTitle: "Add notifications on a job — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S4-018",
    domainCode: 4,
    stem: `A Lakeflow Job with eight tasks failed during last night's run: tasks 1-4 succeeded, task 5 failed because of a bad record that has now been fixed in the source, and tasks 6-8 were skipped. Re-running tasks 1-4 is expensive because they re-ingest a full day of data.

What is the most efficient way to recover?`,
    options: [
      "Run now, which re-executes all eight tasks from the beginning",
      "Repair run on the failed run, which re-runs only the unsuccessful task 5 and the dependent tasks 6-8",
      "Repair run on the failed run, which re-runs only task 5 and leaves tasks 6-8 permanently skipped",
      "Clone the job, delete tasks 1-4 from the clone, and run the clone manually",
    ],
    correctIndex: 1,
    explanationEn: `Repair run re-runs the subset of unsuccessful tasks — failed, canceled, or skipped — together with their dependent tasks, while successful tasks are not re-run. That matches this recovery exactly: only task 5 and the skipped tasks 6-8 execute, avoiding the expensive re-ingestion in tasks 1-4. Two cautions from the docs: a repair re-runs each unsuccessful task from the beginning and does not make tasks idempotent, so append-style writes can duplicate data; and if tasks share a job cluster, the repair creates a new job cluster for the re-run. Run now repeats everything, and deleting tasks from a clone permanently changes the job definition.`,
    explanationPt: `O Repair run reexecuta o subconjunto de tarefas sem sucesso — falhas, canceladas ou puladas — junto com suas tarefas dependentes, sem rodar novamente as tarefas bem-sucedidas. É exatamente esta recuperação: somente a tarefa 5 e as tarefas puladas 6-8 executam, evitando a reingestão cara das tarefas 1-4. Duas ressalvas da documentação: o repair reinicia cada tarefa sem sucesso do começo e não torna as tarefas idempotentes, então escritas do tipo append podem duplicar dados; e se as tarefas compartilham um job cluster, o repair cria um novo job cluster para a reexecução. Run now repete tudo, e deletar tarefas num clone altera definitivamente a definição do job.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/repair-job-failures",
    referenceTitle: "Troubleshoot and repair job failures — Databricks Docs",
    difficulty: "HARD",
  },
];

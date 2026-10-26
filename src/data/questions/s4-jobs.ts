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
      "Enrich runs — it depends only on ingest; publish is skipped since a dependency failed",
      "Both enrich and publish are skipped, because Lakeflow Jobs stops every task in the run after any single task fails",
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
      "At least one succeeded, so the cleanup runs whenever any loading task finishes successfully, even if others are still running",
      "None failed, which is the only condition that guarantees the cleanup task always runs",
      "All done — the cleanup runs once its dependencies finish, regardless of their outcomes",
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
      "In the task's advanced settings, click Add next to Retries and set the retry count and interval",
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
      "Add an If/else task with {{tasks.qc.values.bad_records}} > 0, with quarantine on true and publish on false",
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
      "== and != compare as strings, so 12.0 does not equal 12; >, >=, <, and <= are numeric",
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
      "A For each task with a JSON array of the table names as Inputs, a nested notebook using {{input.table}}, and Concurrency 2",
      "A For each task containing six nested For each tasks, one per table, all sharing a single concurrency setting that the team tunes per run",
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
      "The SQL task runs on the job's classic job cluster if one is configured, and fails otherwise when no cluster is attached",
      "The SQL task starts its own Lakeflow pipeline to execute the query",
      "The SQL task runs against a SQL warehouse — serverless is recommended, and pro is also supported",
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
      "Have the four tasks share a single jobs compute resource for the whole run",
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
      "Maximum concurrent runs defaults to 1 and extra runs are skipped — raise it, or enable queueing",
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
      "Switch the notification destination from email to a webhook, which bypasses retry suppression and always fires immediately",
      "Add failure notifications on the task itself — job-level ones stay silent during retries",
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
  {
    key: "S4-019",
    domainCode: 4,
    stem: `A production Lakeflow Job that publishes Unity Catalog tables was created by a senior data engineer who left the company last month. His user account has since been removed, and the job's nightly runs now fail with permission errors when reading the source tables. The job's code and schedule are correct.

What should the team change to make the job independent of any person's account?`,
    options: [
      "Set the job's Run as identity to a production service principal that holds the required table grants",
      "Set Run as to the new team lead now, and to whoever leads the team after each reorganization",
      "Leave Run as empty, since production jobs automatically run with the permissions of whoever triggered them",
      "Grant the departed engineer's user account the workspace admin role so that its permissions are never removed again",
    ],
    correctIndex: 0,
    explanationEn: `By default, a Lakeflow Job runs as its creator: the creator is set as both owner and Run as user, and every run — including its tasks — is evaluated against that user's privileges. When the account is removed or loses grants, runs fail even though the job definition is fine. Databricks recommends running production jobs as a service principal: job runs then use that identity's permissions, which are managed independently of any employee's lifecycle. Reassigning Run as to another person repeats the same problem at the next reorganization; jobs never inherit the triggering user's permissions, because Run now runs still assume the Run as identity; and granting a workspace admin role violates least privilege without fixing the identity lifecycle.`,
    explanationPt: `Por padrão, um Lakeflow Job roda como seu criador: o criador é definido como owner e como Run as user, e toda execução — inclusive suas tarefas — é avaliada contra os privilégios desse usuário. Quando a conta é removida ou perde grants, as execuções falham, ainda que a definição do job esteja correta. A Databricks recomenda rodar jobs de produção como um service principal: as execuções passam a usar as permissões dessa identidade, gerenciadas de forma independente do ciclo de vida de qualquer pessoa. Reatribuir o Run as a outro usuário repete o problema na próxima reorganização; jobs nunca herdam as permissões de quem os dispara, pois o Run now continua assumindo a identidade do Run as; e conceder papel de workspace admin viola o princípio do menor privilégio e não resolve o ciclo de vida da identidade.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/privileges",
    referenceTitle: "Manage permissions on Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-020",
    domainCode: 4,
    stem: `A team maintains a shared Python module, data_prep.py, which lives in the team's Git repository and is reviewed through pull requests. Several production pipelines depend on it. They are adding a task to a Lakeflow Job that must execute this file exactly as it exists on the main branch, with no manual copies.

How should the task be configured?`,
    options: [
      "Paste the module's current code into a notebook task and refresh that copy by hand whenever the module changes",
      "Copy data_prep.py into the workspace first, because Lakeflow Jobs can only execute notebook tasks",
      "Use a Python script task with the Git provider as its source, pointing to data_prep.py on the main branch",
      "Run the script manually in a terminal on an attached cluster and load the exported CSV files afterward",
    ],
    correctIndex: 2,
    explanationEn: `Lakeflow Jobs support many task types beyond notebooks, including Python script and Python wheel. A Python script task runs a .py file, and setting its source to the Git provider makes the task execute the file from the remote repository at the configured reference — the versioned, reviewed code, with no workspace copy involved. Pasting the code into a notebook creates a second copy that drifts from the repository, exactly the failure mode the team wants to eliminate. The claim that jobs can only execute notebooks is false, and running scripts interactively on an attached cluster is manual, unscheduled, and invisible to the job's run history.`,
    explanationPt: `Os Lakeflow Jobs suportam muitos tipos de tarefa além de notebooks, incluindo Python script e Python wheel. Uma tarefa Python script executa um arquivo .py e, ao definir o source como Git provider, a tarefa executa o arquivo do repositório remoto na referência configurada — ou seja, o código versionado e revisado, sem nenhuma cópia no workspace. Colar o código num notebook cria uma segunda cópia que diverge do repositório, exatamente o modo de falha que a equipe quer eliminar. A afirmação de que jobs só executam notebooks é falsa; e rodar scripts interativamente num cluster anexado é manual, não é agendado e fica invisível no histórico de execuções do job.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-021",
    domainCode: 4,
    stem: `A data engineering team must run a Lakeflow Job at 02:00 every weekday, Monday through Friday, so that reporting tables are fresh before analysts arrive. In the job's schedule settings, they open the cron expression editor to type the schedule by hand.

Which expression should they enter?`,
    options: [
      "0 2 * * MON-FRI",
      "0 0 2 * * 1-5",
      "MON-FRI 02:00",
      "0 0 2 ? * MON-FRI *",
    ],
    correctIndex: 3,
    explanationEn: `Databricks job schedules use Quartz cron syntax, not the five-field Unix crontab. Quartz fields are seconds, minutes, hours, day-of-month, month, day-of-week, and an optional year, so 0 0 2 ? * MON-FRI * fires at 02:00:00 every Monday through Friday. The ? is required in the day-of-month field here: Quartz rejects expressions that constrain both day fields, which is why 0 0 2 * * 1-5 fails with an error such as "Support for specifying both a day-of-week AND a day-of-month parameter is not implemented". 0 2 * * MON-FRI is five-field Unix syntax that Quartz cannot parse, and MON-FRI 02:00 is a human-readable summary, not a cron expression.`,
    explanationPt: `Os agendamentos de jobs na Databricks usam a sintaxe Quartz cron, e não o crontab Unix de cinco campos. Os campos do Quartz são segundos, minutos, horas, dia do mês, mês, dia da semana e um ano opcional; por isso 0 0 2 ? * MON-FRI * dispara às 02:00:00 de segunda a sexta. O ? é obrigatório no campo de dia do mês neste caso: o Quartz rejeita expressões que restringem os dois campos de dia — por isso 0 0 2 * * 1-5 falha com um erro como "Support for specifying both a day-of-week AND a day-of-month parameter is not implemented". Já 0 2 * * MON-FRI é a sintaxe Unix de cinco campos, que o Quartz não interpreta; e MON-FRI 02:00 é apenas um resumo legível, não uma expressão cron.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S4-022",
    domainCode: 4,
    stem: `A task in a production Lakeflow Job got stuck in an infinite loop over the weekend. Nobody was watching, and the job stayed in the running state for three days, holding compute and blocking downstream pipelines. The team wants a stuck run like this to be stopped and marked as failed automatically.

What should they configure?`,
    options: [
      "Nothing — Lakeflow Jobs offer no timeout setting, so a stuck run must be detected and canceled manually",
      "The job cluster's auto-termination setting, which terminates compute that has been idle for the configured minutes",
      "A timeout on scheduled runs only, because runs started manually with Run now are allowed to run indefinitely",
      "A Timeout setting on the job or the task, so that exceeding the limit stops the run with a Timed Out status",
    ],
    correctIndex: 3,
    explanationEn: `Lakeflow Jobs have an optional Timeout setting at both the job level and the task level. A run that exceeds the configured limit is stopped by Databricks and its status is set to Timed Out — a failed run state — which is exactly the automatic termination the team needs. Without a timeout configured, runs have no time limit at all. Auto-termination does not help here: it fires only when compute sits idle, while a task spinning in a loop keeps the cluster busy for as long as the run lives. And the timeout is not tied to the trigger type — it applies to every run of the job, scheduled or started with Run now.`,
    explanationPt: `Os Lakeflow Jobs têm uma configuração opcional de Timeout tanto no nível do job quanto no nível da tarefa. Uma execução que excede o limite configurado é interrompida pela Databricks e recebe o status Timed Out — um estado de falha — exatamente a terminação automática que a equipe precisa. Sem timeout configurado, as execuções não têm limite de tempo algum. O auto-termination não resolve aqui: ele dispara somente quando o compute fica ocioso, enquanto uma tarefa em loop infinito mantém o cluster ativo e ocupado indefinidamente. E o timeout não depende do tipo de trigger — vale para toda execução do job, agendada ou iniciada com Run now.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-023",
    domainCode: 4,
    stem: `When a nightly Lakeflow Job fails, the team already receives an email notification. Operations, however, also needs every failure recorded in its own incident system, which exposes an HTTP endpoint, and the on-call rotation must be paged through PagerDuty. All of this should happen automatically as part of the run.

How can the team meet this requirement?`,
    options: [
      "Keep email as the notification, since Databricks cannot target external systems, and let the incident system poll the jobs API",
      "Add a webhook destination to the job's failure notification, so that Databricks posts a JSON payload to the endpoint",
      "Add a final task that calls the incident system's endpoint itself at the end of every run",
      "Switch the job to a file arrival trigger, because webhook notifications only work for event-triggered jobs",
    ],
    correctIndex: 1,
    explanationEn: `Job and task notifications are not limited to email. An administrator can define system destinations — Slack, Microsoft Teams, PagerDuty, or a generic HTTP webhook — and you attach them to notification events such as run failure. When the event fires, Databricks sends an HTTP POST with a JSON payload (event types such as jobs.on_failure) to the configured endpoint, so external systems and paging tools are invoked automatically. A task that makes the HTTP call itself only runs inside the job graph and would be skipped precisely in the runs that fail, email is not the only native channel, and webhooks are independent of how the job is triggered.`,
    explanationPt: `As notificações de jobs e tarefas não se limitam a e-mail. Um administrador pode definir system destinations — Slack, Microsoft Teams, PagerDuty ou um HTTP webhook genérico — e você as associa a eventos de notificação como falha de execução. Quando o evento dispara, a Databricks envia um HTTP POST com um payload JSON (tipos de evento como jobs.on_failure) para o endpoint configurado, de modo que sistemas externos e ferramentas de paging sejam acionados automaticamente. Uma tarefa que faça a chamada HTTP por conta própria só roda dentro do grafo do job e seria pulada justamente nas execuções que falham; e-mail não é o único canal nativo; e webhooks independem de como o job é disparado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/notifications",
    referenceTitle: "Add notifications on a job — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-024",
    domainCode: 4,
    stem: `The production version of an ETL notebook lives on the release branch of the team's GitHub repository. Today, a team member copies the notebook into the workspace by hand before each release, and last week's job ran a stale copy that missed two reviewed fixes. The next release must run exactly the reviewed code, with no manual steps.

How should the notebook task be configured?`,
    options: [
      "Keep the manual copy, but add a release checklist that verifies the workspace version before each run",
      "Leave the task pointing at the workspace, because jobs can only execute notebooks stored there",
      "Set the task's Source to the Git provider and point it at the notebook on the release branch",
      "Point the task at a /Repos workspace path and trust each developer to pull the release branch before the run",
    ],
    correctIndex: 2,
    explanationEn: `Notebook tasks can take their source from the workspace or from a remote Git repository. With the Git provider option, the task references the repository, the reference (branch or tag), and the notebook's relative path, and the job executes the notebook exactly as it exists at that reference — no hand-made copy, so a stale version cannot run by mistake. Databricks explicitly recommends the Git provider and a remote repository for versioning assets scheduled with jobs. A checklist still relies on humans, jobs are not restricted to workspace notebooks, and a /Repos path runs whatever is currently checked out locally — the same stale-copy risk with extra steps.`,
    explanationPt: `Tarefas de notebook podem ter como source o workspace ou um repositório Git remoto. Com a opção Git provider, a tarefa referencia o repositório, a referência (branch ou tag) e o caminho relativo do notebook, e o job executa o notebook exatamente como ele existe naquela referência — sem cópia manual, tornando impossível rodar uma versão desatualizada por engano. A Databricks recomenda explicitamente o Git provider e um repositório remoto para versionar assets agendados em jobs. Um checklist continua dependendo de pessoas; jobs não se restringem a notebooks do workspace; e um caminho /Repos executa o que estiver checked out localmente — o mesmo risco de cópia desatualizada, com etapas a mais.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/tasks/notebook",
    referenceTitle: "Notebook task for jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-025",
    domainCode: 4,
    stem: `A Lakeflow Job runs ingest, transform, and publish as a linear chain. The team must add an alerting task that runs only when the ingest task fails — it must never run when the pipeline succeeds. The alerting code is ready; only the task's wiring is missing.

How should the alerting task be wired into the job?`,
    options: [
      "Depends on ingest with the Run if condition All failed, so it runs only when ingest has failed",
      "No dependencies — it runs in every run, queries the previous run's outcome through the API, and exits early on success",
      "Depends on publish with the default Run if condition, closing the chain after every successful run",
      "A second, identical job that contains only the alerting task and is triggered by hand when the first job fails",
    ],
    correctIndex: 0,
    explanationEn: `Run if conditions gate a downstream task on the outcome of its dependencies. Wiring the alerting task to ingest with All failed — or At least one failed, which is equivalent for a single dependency — makes it run exactly when the upstream ingestion has failed; when the condition is not met, Databricks marks the task as Excluded, so it never runs on a green pipeline. Attaching the alert to publish would mean it never runs on an ingest failure, because tasks downstream of a failure are skipped. An always-running task that polls outcomes through the API wastes compute and duplicates platform behavior, and a hand-triggered second job adds manual toil and drift.`,
    explanationPt: `As condições Run if controlam a execução de uma tarefa downstream com base no resultado de suas dependências. Ligar a tarefa de alerta ao ingest com All failed — ou At least one failed, equivalente para uma única dependência — faz com que ela rode exatamente quando a ingestão a montante falha; quando a condição não é atendida, a Databricks marca a tarefa como Excluded, então ela nunca roda num pipeline de sucesso. Ligar o alerta ao publish significaria que ele nunca rodaria numa falha do ingest, pois tarefas a jusante de uma falha são puladas. Uma tarefa que roda sempre e consulta desfechos pela API desperdiça compute e duplica um comportamento da plataforma; e um segundo job disparado à mão adiciona trabalho manual e drift.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/control-flow",
    referenceTitle: "Control the flow of tasks within Lakeflow Jobs — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S4-026",
    domainCode: 4,
    stem: `A daily Lakeflow Job must fire at 06:00 in the company's Sao Paulo office (America/Sao_Paulo). The platform team in Paris created the schedule, so its timezone is Europe/Paris and its cron fires at 11:00 — 06:00 in Sao Paulo during the European summer. In late October, Europe ended daylight saving time, and the job began firing at 07:00 local.

How does the team make the firing time deterministic?`,
    options: [
      "Set the schedule's timezone to America/Sao_Paulo, so the cron is always resolved in Sao Paulo time",
      "Keep Europe/Paris and edit the cron hour by hand twice a year, when European clocks change",
      "Set spark.sql.session.timeZone to America/Sao_Paulo in the job's tasks, so the scheduler fires in local time",
      "Leave the timezone alone, because a job's cron automatically follows the local timezone of the engineer who created it",
    ],
    correctIndex: 0,
    explanationEn: `A job schedule is a pair: a Quartz cron expression plus an explicit timezone setting, and the firing time is always resolved against that timezone. Brazil has not observed daylight saving time since 2019, so anchoring the schedule to America/Sao_Paulo makes a 06:00 cron fire at 06:00 every day of the year. The drift came from resolving the expression in Europe/Paris, where the UTC offset changed in October. Hand-editing the cron twice a year is fragile and will eventually be forgotten. spark.sql.session.timeZone only affects how timestamps are interpreted inside queries — it has no effect on the scheduler. Schedules do not silently follow anyone's local timezone; the timezone is an explicit setting on the schedule.`,
    explanationPt: `Um agendamento de job é um par: uma expressão Quartz cron mais uma configuração explícita de timezone, e o horário de disparo é sempre resolvido em relação a esse timezone. O Brasil não adota horário de verão desde 2019, portanto ancorar o schedule em America/Sao_Paulo faz um cron de 06:00 disparar às 06:00 todos os dias do ano. O desvio veio de resolver a expressão em Europe/Paris, onde o offset em relação ao UTC mudou em outubro. Ajustar o cron à mão duas vezes por ano é frágil e um dia será esquecido. O spark.sql.session.timeZone afeta apenas a interpretação de timestamps dentro das queries — nenhum efeito sobre o scheduler. Schedules não seguem silenciosamente o fuso local de ninguém; o timezone é uma configuração explícita do agendamento.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-027",
    domainCode: 4,
    stem: `A Lakeflow Job orchestrates an end-to-end flow: a notebook task lands raw files, then a Lakeflow Declarative Pipeline must process the new data, and a final task exports the curated tables. The team is now adding the middle step to the job.

How does the pipeline take part in this job?`,
    options: [
      "As a Pipeline task, which always triggers a full refresh of the pipeline before processing",
      "It cannot, because pipelines run only as standalone objects with their own schedules",
      "As a notebook task that re-runs the pipeline's source notebook inside the job",
      "As a Pipeline task that selects the pipeline and triggers a refresh — incremental by default",
    ],
    correctIndex: 3,
    explanationEn: `Pipeline is a standard task type in Lakeflow Jobs: you select an existing pipeline, and when the task runs it triggers a refresh of that pipeline as part of the job's task graph, respecting dependencies like any other task. The refresh is incremental by default — only new data is processed — while a full refresh is an explicit, optional choice in the task settings. Pipelines can also run on their own schedules, but they integrate directly as job tasks, so the standalone-only claim is wrong. Re-running the pipeline's source notebook as a notebook task bypasses the pipeline's declarative engine and duplicates its logic inside the job.`,
    explanationPt: `Pipeline é um tipo de tarefa padrão nos Lakeflow Jobs: você seleciona um pipeline existente e, quando a tarefa executa, ela dispara um refresh desse pipeline como parte do grafo de tarefas do job, respeitando dependências como qualquer outra tarefa. O refresh é incremental por padrão — apenas os dados novos são processados —, e o full refresh é uma escolha explícita e opcional nas configurações da tarefa. Pipelines também podem rodar com seus próprios schedules, mas se integram diretamente como tarefas de job, então a afirmação de que só funcionam standalone está errada. Reexecutar o notebook de origem do pipeline como uma tarefa de notebook contorna o motor declarativo do pipeline e duplica a lógica dentro do job.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-028",
    domainCode: 4,
    stem: `A nightly Lakeflow Job takes a processing_date parameter whose default is the current date. Late this evening, an on-call engineer must reprocess yesterday's data exactly once, and tomorrow's scheduled run must continue using the default. The job definition itself may not change.

What should the engineer do?`,
    options: [
      "Edit the job's default parameter to yesterday's date, start the run, and revert the default before the nightly schedule fires",
      "Clone the job into a one-off reprocess version with the new date, run it, and delete the clone afterwards",
      "Start the run with Run now with different parameters, passing processing_date for that run only",
      "Deploy a new bundle target that sets the parameter, since parameter values can only change through a deployment",
    ],
    correctIndex: 2,
    explanationEn: `Run now with different parameters — from the workspace UI, the CLI, or the run-now API — triggers a single run with parameter overrides that apply only to that run. The job definition, including its defaults, stays untouched, so tomorrow's schedule behaves exactly as before. Editing the default mutates the production job and depends on someone remembering to revert it before the next run, which is how permanent configuration drift starts. A cloned job is a duplicate that must be maintained and cleaned up, and parameter values can be overridden at run time without any deployment, so a new bundle target is unnecessary machinery for a one-off rerun.`,
    explanationPt: `O Run now with different parameters — pela UI do workspace, pela CLI ou pela API de run-now — dispara uma única execução com sobrescritas de parâmetros que valem apenas para essa execução. A definição do job, inclusive seus valores padrão, permanece intacta, então o schedule de amanhã se comporta exatamente como antes. Editar o valor padrão altera o job de produção e depende de alguém lembrar de reverter antes da próxima execução — é assim que nasce o drift permanente de configuração. Um job clonado é uma duplicata que precisa ser mantida e apagada; e valores de parâmetro podem ser sobrescritos em tempo de execução sem nenhum deploy, portanto um novo target do bundle é um mecanismo desnecessário para uma reexecução pontual.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-029",
    domainCode: 4,
    stem: `A Lakeflow Job's transformations require pandas 2.x. The team has been prototyping on a shared cluster that other teams also depend on, and that cluster has pandas 1.5 pinned — upgrading it would break the other teams' workloads. The job is about to go to production.

Where should pandas 2.x be installed for this job?`,
    options: [
      "On the shared cluster, after warning the other teams and having them retest their pipelines",
      "With %pip install at the top of the job's notebook, which fixes the version for every job the same way",
      "Nowhere, because pinned libraries are not supported on job clusters, so the code must avoid pandas 2.x",
      "On the job's own job cluster, whose library list is isolated from the compute other teams share",
    ],
    correctIndex: 3,
    explanationEn: `Job compute is dedicated to a single job: the job's cluster carries its own configuration, including its list of installed libraries. Installing pandas 2.x on the job cluster makes it available to this job's tasks, while the shared cluster — and every other team depending on it — stays untouched. Installing on the shared cluster would change the library for everyone, which is exactly what must not happen. Libraries installed with %pip from a notebook apply only to that notebook's session: they do not persist across sessions and do not affect other jobs or clusters. And job clusters do support pinned libraries, so the "nowhere" option describes a limitation that does not exist.`,
    explanationPt: `O compute de job é dedicado a um único job: o cluster do job carrega sua própria configuração, incluindo sua lista de bibliotecas instaladas. Instalar pandas 2.x no job cluster o torna disponível para as tarefas deste job, enquanto o cluster compartilhado — e todas as outras equipes que dependem dele — permanece intocado. Instalar no cluster compartilhado mudaria a biblioteca para todos, exatamente o que não pode acontecer. Bibliotecas instaladas com %pip num notebook valem apenas para a sessão daquele notebook: não persistem entre sessões e não afetam outros jobs ou clusters. E job clusters suportam bibliotecas com versão fixa, portanto a opção "em nenhum lugar" descreve uma limitação que não existe.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Configure clusters — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-030",
    domainCode: 4,
    stem: `A Lakeflow Job starts with a notebook task, \`pick_tables\`, which scans operational metadata and computes the exact list of bronze tables that need a rebuild — a different list every night:

\`\`\`python
dbutils.jobs.taskValues.set(key = "tables", value = tables)
\`\`\`

The next step must run the rebuild notebook once for every table in that list. How should the For each task that follows \`pick_tables\` be configured?`,
    options: [
      "Point its Inputs field at the task value reference {{tasks.pick_tables.values.tables}}, so the loop follows the list pick_tables produced",
      "Copy the table names from last night's run into the Inputs field as a static JSON array, and edit the job whenever the list changes",
      "Hardcode a master table list in the job definition, because For each inputs cannot reference values from other tasks",
      "Drop the For each task and use a single notebook task that reads the array from pick_tables and loops over the tables with a Python while loop",
    ],
    correctIndex: 0,
    explanationEn: `Lakeflow Jobs let a For each task consume values produced at run time: a preceding task publishes the array with dbutils.jobs.taskValues.set, and the For each task references it in its Inputs field with {{tasks.pick_tables.values.tables}}, so each iteration receives one element of exactly the list that pick_tables computed. Task value references also lift the size limit — the value behind the reference can reach 48 KB, while literal JSON typed into the Inputs box is capped at 5,000 characters. Pasting last night's list freezes a stale snapshot that drifts from the real metadata and needs manual edits, and the claim that For each inputs cannot reference other tasks is false — task values and job parameters are both supported sources. A Python while loop inside a single notebook task would work functionally, but it hides each table's iteration from the run history, monitoring, retries, and repair that the For each task exposes.`,
    explanationPt: `Os Lakeflow Jobs permitem que uma tarefa For each consuma valores produzidos em tempo de execução: a tarefa anterior publica o array com dbutils.jobs.taskValues.set, e a tarefa For each o referencia no campo Inputs com {{tasks.pick_tables.values.tables}}, de modo que cada iteração recebe um elemento exatamente da lista que pick_tables calculou. Referências a task values também elevam o limite de tamanho — o valor por trás da referência pode chegar a 48 KB, enquanto o JSON digitado direto no campo Inputs fica limitado a 5.000 caracteres. Colar a lista da noite anterior congela um snapshot desatualizado, que diverge dos metadados reais e exige edições manuais; e a afirmação de que os inputs do For each não podem referenciar outras tarefas é falsa — task values e job parameters são fontes suportadas. Um loop while em Python dentro de uma única tarefa de notebook até funcionaria, mas esconderia a iteração de cada tabela do histórico de execuções, do monitoramento, dos retries e do repair que a tarefa For each expõe.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/tasks/for-each",
    referenceTitle: "Use a For each task to run another task in a loop — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-031",
    domainCode: 4,
    stem: `An operations dashboard is published in the workspace, and the first analyst to open it each morning waits while all of its queries run from scratch. The team already runs a scheduled Lakeflow Job that finishes refreshing the underlying tables by 07:00, and they want the dashboard's results ready before analysts arrive at 08:00.

What should the team add to this job?`,
    options: [
      "Nothing, because a published dashboard refreshes its results only when a user opens it, and no job task can change that",
      "A Dashboard task after the table refresh, which refreshes the published dashboard's results as a step of the job",
      "A notebook task that exports the dashboard to a PDF every morning, because only an export forces the dashboard's queries to run",
      "A Dashboard task that publishes a new copy of the dashboard on every run, so analysts always open a freshly published version",
    ],
    correctIndex: 1,
    explanationEn: `Lakeflow Jobs include a Dashboard task type whose purpose is to refresh the results of an existing published dashboard as part of a job. Adding it after the table refresh tasks runs the dashboard's queries and leaves its results materialized before analysts arrive; the task refreshes with the dashboard's default SQL warehouse or one selected in the task, and subscribers can even receive an email when the refresh completes. The belief that published dashboards only update when someone opens them, with no job-driven option, is not true — the Dashboard task is exactly that option. Exporting the dashboard to a PDF from a notebook is not a refresh mechanism for keeping the dashboard warm, and the Dashboard task never publishes a new dashboard on each run: it refreshes the single published dashboard selected in its configuration.`,
    explanationPt: `Os Lakeflow Jobs incluem um tipo de tarefa Dashboard cujo propósito é atualizar (refresh) os resultados de um dashboard publicado existente como parte de um job. Ao adicioná-la depois das tarefas de atualização das tabelas, as consultas do dashboard executam e seus resultados ficam materializados antes da chegada dos analistas; a tarefa atualiza com o SQL warehouse padrão do dashboard ou com um warehouse escolhido na configuração, e os subscribers podem até receber um email quando o refresh termina. A ideia de que dashboards publicados só atualizam quando alguém os abre, sem nenhuma opção acionada por job, não procede — a tarefa Dashboard é exatamente essa opção. Exportar o dashboard para PDF a partir de um notebook não é um mecanismo de refresh que deixe o dashboard aquecido; e a tarefa Dashboard nunca publica um dashboard novo a cada execução: ela atualiza o único dashboard publicado selecionado em sua configuração.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-032",
    domainCode: 4,
    stem: `A Lakeflow Job runs two slow loads in parallel after the same extract task: load_customers and load_orders have no dependency on each other, and both must stay concurrent to fit the nightly window. A final task, run_quality_checks, must execute exactly once, only after both loads have completed successfully.

How should run_quality_checks be wired?`,
    options: [
      "Chain extract, load_customers, load_orders, and run_quality_checks in a strict line, because only linear chains can make a task wait for two others",
      "Attach run_quality_checks to whichever load finishes first, and let it start as soon as that single branch completes",
      "Split the checks into two tasks, one per branch, because a single task cannot depend on more than one upstream task",
      "Make run_quality_checks depend on both load_customers and load_orders, keeping the default All succeeded run-if condition",
    ],
    correctIndex: 3,
    explanationEn: `The Depends on setting of a task accepts multiple upstream tasks, so run_quality_checks can list both load_customers and load_orders as dependencies. With the default All succeeded run-if condition, it then runs exactly once, only after every dependency has run and succeeded — the standard way to converge parallel branches in the job DAG. A strictly linear chain would also enforce an order, but it serializes work that must stay concurrent to fit the nightly window and rests on the false premise that only linear chains can wait for two tasks. Dependencies are fixed in the job definition, so a task cannot bind itself to whichever branch finishes first — and starting after only one load would run the checks against incomplete data. Splitting the checks per branch relies on the same false limitation: one task depending on several tasks is fully supported.`,
    explanationPt: `A configuração Depends on de uma tarefa aceita múltiplas tarefas a montante, então run_quality_checks pode listar load_customers e load_orders como dependências. Com a condição run-if padrão All succeeded, ela executa exatamente uma vez, somente depois que todas as dependências rodaram com sucesso — a forma padrão de convergir branches paralelos no DAG do job. Uma cadeia estritamente linear também imporia uma ordem, mas serializa um trabalho que precisa permanecer concorrente para caber na janela noturna e se apoia na premissa falsa de que só cadeias lineares podem esperar por duas tarefas. As dependências são fixas na definição do job, portanto uma tarefa não pode se ligar ao branch que terminar primeiro — e começar após apenas uma carga executaria as checagens com dados incompletos. Dividir as checagens por branch repousa na mesma limitação falsa: uma tarefa depender de várias tarefas é totalmente suportado.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-033",
    domainCode: 4,
    stem: `A Lakeflow Job has six tasks — notebooks, one Python script, and one SQL file — that all live in the same GitHub repository on the release branch. Setting the repository and branch on every task is repetitive, and last month two tasks were accidentally pointed at different branches.

How should the job's source be configured?`,
    options: [
      "Configure the repository and branch once as the job's Git source, and have tasks reference only paths relative to the repository root",
      "Repeat the full repository URL and branch on every task, since each task must carry its own complete source settings",
      "Skip Git for this job, because remote Git sources can only be configured on individual tasks, never at the job level",
      "Rewrite the SQL file task as a notebook task, because jobs that use a Git source cannot include SQL tasks",
    ],
    correctIndex: 0,
    explanationEn: `Lakeflow Jobs support a Git source at the job level: in the Job details pane, Add Git settings configures the remote repository and a single reference — branch, tag, or commit — for the whole job. Tasks then point only to their source paths, which must be relative to the repository root, and when a run begins Databricks snapshots the configured reference so every task in that run executes the same version of the code — ending branch drift between tasks. Repeating the full repository URL and branch on each task is exactly the error-prone toil this removes, and it is not required. Remote Git sources are not restricted to the task level, and SQL files are among the task types that support remote Git repositories — alongside notebooks, Python scripts, and dbt projects — so the SQL task needs no rewrite.`,
    explanationPt: `Os Lakeflow Jobs suportam uma fonte Git no nível do job: no painel Job details, a opção Add Git settings configura o repositório remoto e uma única referência — branch, tag ou commit — para o job inteiro. As tarefas passam a apontar apenas para os caminhos dos seus códigos, que devem ser relativos à raiz do repositório, e, quando uma execução começa, a Databricks tira um snapshot da referência configurada, garantindo que todas as tarefas daquele run executem a mesma versão do código — o que elimina a divergência de branches entre tarefas. Repetir a URL completa do repositório e o branch em cada tarefa é exatamente o trabalho manual propenso a erro que isso elimina, e não é obrigatório. Fontes Git remotas não se restringem ao nível da tarefa, e arquivos SQL estão entre os tipos de tarefa que suportam repositórios Git remotos — ao lado de notebooks, Python scripts e projetos dbt — portanto a tarefa SQL não precisa ser reescrita.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-034",
    domainCode: 4,
    stem: `A data engineer is editing a production Lakeflow Job in which the notebook task B already depends on the notebook task D. To make the two steps verify each other's output, the engineer adds a dependency in the opposite direction, configuring task D to depend on task B as well, and clicks Save.

What is the result?`,
    options: [
      "The cycle is accepted, and the two tasks re-run in a loop until both finally succeed",
      "The cycle is accepted, but the loop executes only once per run, after which the job continues with the downstream tasks",
      "The dependency is accepted because both tasks are notebooks, and notebook tasks are allowed to close dependency cycles",
      "The configuration is rejected: task dependencies must form a directed acyclic graph, and a cycle cannot be saved",
    ],
    correctIndex: 3,
    explanationEn: `Task dependencies in a Lakeflow Job form a directed acyclic graph (DAG): each dependency points from a downstream task to an upstream one, and the graph can never contain a cycle, because the platform would have no valid order in which to start the tasks. A dependency that closes a loop — task D depending on task B while task B already depends on task D — is therefore invalid, and Databricks rejects it instead of saving the job. Lakeflow Jobs have no loop-until-success execution mode; re-running failed work is what task retry policies are for. A cycle also never executes just once and then continues, and the task type changes nothing: notebook tasks follow the same DAG constraints as SQL, script, or pipeline tasks.`,
    explanationPt: `As dependências entre tarefas de um Lakeflow Job formam um grafo acíclico dirigido (DAG): cada dependência aponta de uma tarefa a jusante para uma a montante, e o grafo jamais pode conter um ciclo, pois a plataforma não teria uma ordem válida para iniciar as tarefas. Uma dependência que fecha um loop — a tarefa D dependendo da tarefa B quando a tarefa B já depende da tarefa D — é, portanto, inválida, e a Databricks a rejeita em vez de salvar o job. Os Lakeflow Jobs não têm modo de execução em loop até o sucesso; reexecutar um trabalho que falhou é para isso que existem as políticas de retry da tarefa. Um ciclo também nunca executa uma única vez e segue adiante, e o tipo de tarefa não muda nada: tarefas de notebook seguem as mesmas restrições de DAG que tarefas SQL, de script ou de pipeline.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-035",
    domainCode: 4,
    stem: `A data engineering team runs the same preparation pipeline for a morning report. Business users need it at 06:00 from Monday through Friday, while the Saturday data cut happens later, so the pipeline must run at 08:00 on Saturdays. The team wants one job definition, one run history, and one place to change the code.

How should the job be configured to fire on both schedules?`,
    options: [
      "Add two scheduled triggers to the job: a weekday 06:00 cron and a Saturday 08:00 cron",
      "Clone the job into two identical jobs, each with its own schedule, and maintain both in parallel",
      "Keep a single trigger, because one Quartz cron expression can fire at different times on different days",
      "Leave the weekly schedule as-is and rely on its automatic retries to produce the Saturday 08:00 run",
    ],
    correctIndex: 0,
    explanationEn: `A Lakeflow Job can hold multiple triggers, including more than one scheduled trigger: each scheduled trigger has its own Quartz cron expression and time zone, can be paused and resumed independently, and starts a run whenever it fires, so a weekday 06:00 trigger plus a Saturday 08:00 trigger covers the mixed pattern in one job (currently in Beta, with up to five triggers per job). Cloning the job instead creates two definitions to keep in sync and splits the run history. No single Quartz cron expression can fire at different hours on different days, because field values combine as a cross product: listing both hours with MON-SAT would fire at both times on all six days. Retries only re-attempt failed task runs and never create new firings on other days.`,
    explanationPt: `Um Lakeflow Job pode ter múltiplos triggers, incluindo mais de um trigger agendado: cada trigger agendado tem sua própria expressão Quartz cron e seu timezone, pode ser pausado e reativado de forma independente e inicia uma execução sempre que dispara — assim, um trigger de 06:00 nos dias úteis mais um de 08:00 no sábado cobre o padrão misto em um único job (hoje em Beta, com até cinco triggers por job). Clonar o job, ao contrário, cria duas definições para manter sincronizadas e divide o histórico de execuções. Nenhuma expressão Quartz cron única dispara em horas diferentes em dias diferentes, porque os campos combinam como produto cartesiano: listar as duas horas com MON-SAT dispararia nos dois horários nos seis dias. E as retries apenas reexecutam tarefas que falharam — nunca criam novos disparos em outros dias.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/triggers",
    referenceTitle: "Automate jobs with schedules and triggers — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-036",
    domainCode: 4,
    stem: `A platform team's master Lakeflow Job coordinates the company's onboarding flow. One step must launch the partner team's onboarding job, wait for its outcome, and let downstream tasks in the master job run only if that job succeeded. The partner's job stays owned and scheduled by the partner team.

How should the master job trigger the partner's job?`,
    options: [
      "Use a notebook task that calls the Jobs REST API to start the partner's job and poll for its result",
      "Use a pipeline task pointing at the partner's job, since pipeline tasks can execute any existing job",
      "Use a Run Job task that starts the partner's job, so its outcome becomes a step in the master DAG",
      "Use a manual handoff, because Lakeflow Jobs cannot launch other jobs in a managed way",
    ],
    correctIndex: 2,
    explanationEn: `The Run Job task is the built-in way to run another workspace job as a step of the master job: the child run appears in the master's task graph, its success or failure becomes the task's status, downstream tasks can depend on that outcome, and parameters can be pushed to the child much like Run now with different parameters. Databricks blocks circular dependencies and caps Run Job nesting at three levels. Calling the Jobs REST API from a notebook does start the partner's job, but the child run is invisible to the master's DAG: the notebook must poll, and downstream tasks cannot gate on the child's success. The pipeline task updates a Lakeflow Declarative Pipeline, not an arbitrary job. Managed job-to-job execution exists, so a manual handoff needlessly gives up observability.`,
    explanationPt: `A tarefa Run Job é a forma nativa de executar outro job do workspace como um passo do job master: a execução filha aparece no grafo de tarefas do master, seu sucesso ou falha vira o status da tarefa, tarefas a jusante podem depender desse resultado e parâmetros podem ser repassados ao job filho de modo parecido com o Run now with different parameters. A Databricks bloqueia dependências circulares e limita o aninhamento de tarefas Run Job a três níveis. Chamar a Jobs REST API de um notebook até inicia o job do parceiro, mas a execução filha fica invisível ao DAG do master: o notebook precisaria fazer polling, e as tarefas a jusante não podem se condicionar ao sucesso do filho. A tarefa de pipeline atualiza um Lakeflow Declarative Pipeline, não um job arbitrário. E a execução gerenciada de job para job existe, então o handoff manual abre mão da observabilidade sem necessidade.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-task",
    referenceTitle: "Configure and edit tasks in Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-037",
    domainCode: 4,
    stem: `A Lakeflow Job declares a job-level parameter target_date, and one of its notebook tasks declares a task parameter with the same key target_date but a different default. An on-call engineer then triggers the job with Run now, passing their own value for target_date.

Which value does that task receive?`,
    options: [
      "The task parameter's default, because task-level settings are always the most specific",
      "The job parameter's default, because job-level settings override everything including Run now",
      "An error at run time: declaring the same parameter key at two levels is rejected by the platform",
      "The Run now value wins; below that, the job-level parameter beats the task parameter on a shared key",
    ],
    correctIndex: 3,
    explanationEn: `Job parameter pushdown defines the precedence: a value passed with Run now applies to that run and wins outright; below that, when a job parameter and a task parameter share a key, the job-level parameter takes precedence and is pushed down into the task. So the on-call engineer's Run now value is what the task sees — and if they had not passed one, the job-level default would override the task's own default. Same-key declarations are legal, not a run-time error, and task-level defaults are precisely what pushdown overrides.`,
    explanationPt: `O job parameter pushdown define a precedência: um valor passado com Run now vale para aquela execução e vence de forma absoluta; abaixo disso, quando um parâmetro do job e um parâmetro da tarefa compartilham a mesma chave, o parâmetro de nível de job prevalece e é empurrado para a tarefa. Portanto o valor do Run now do plantonista é o que a tarefa vê — e, se ele não tivesse passado nada, o default de nível de job sobrescreveria o default da própria tarefa. Declarar a mesma chave em dois níveis é permitido, não é erro em runtime, e os defaults da tarefa são exatamente o que o pushdown sobrescreve.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S4-038",
    domainCode: 4,
    stem: `Governance rules at a company state that compute used by Lakeflow Jobs must follow approved shapes: permitted node types and a maximum worker count. The platform team wants these rules enforced automatically whenever engineers configure compute for their jobs, not reviewed case by case.

What should the platform team do?`,
    options: [
      "Apply a compute policy to the job compute, so permitted node types and size limits are enforced",
      "Document the approved shapes in the team wiki, because compute policies apply only to interactive all-purpose compute",
      "Rely on automatic inheritance, because every job takes the compute policy of the engineer who created it",
      "Cap the number of clusters per workspace, because compute policies control only how many clusters can exist",
    ],
    correctIndex: 0,
    explanationEn: `Compute policies are sets of rules that limit the configuration options available when compute resources are created, and they govern job compute exactly as they govern all-purpose compute. Attaching the approved policy to the job compute restricts and validates settings such as node types and worker counts, so the governance rules are enforced at configuration time without case-by-case review. The other options rest on false premises: policies are not limited to interactive all-purpose clusters; a policy is selected on the compute configuration, never inherited from the job's creator; and policies define the shape of a configuration, not how many clusters a workspace may hold.`,
    explanationPt: `Compute policies são conjuntos de regras que limitam as opções de configuração disponíveis quando recursos de compute são criados, e valem para o job compute exatamente como valem para o compute all-purpose. Vincular a policy aprovada ao job compute restringe e valida configurações como tipos de nó e contagem de workers, então as regras de governança passam a valer no momento da configuração, sem revisão caso a caso. As demais alternativas partem de premissas falsas: policies não se limitam a clusters all-purpose interativos; a policy é selecionada na configuração do compute, nunca herdada de quem criou o job; e policies definem o formato da configuração, não quantos clusters o workspace pode ter.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Configure clusters — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-039",
    domainCode: 4,
    stem: `A team is migrating an old ETL process to Lakeflow Jobs. Today one long notebook chains five processing stages with %run: each stage calls the next notebook, everything shares a single execution, and a failure in stage three means rerunning the whole chain the next morning.

What is the main benefit of rebuilding this chain as separate notebook tasks in one job?`,
    options: [
      "The ability to keep a single shared execution, since chained %run notebooks are the recommended pattern for production",
      "The ability to keep the %run chain, because jobs cannot run notebooks as separate tasks",
      "The ability to retry, monitor, and branch each stage independently, and rerun only the failed stage",
      "The ability to preserve %run behavior exactly, with less configuration to maintain than separate tasks",
    ],
    correctIndex: 2,
    explanationEn: `As separate notebook tasks, each stage becomes a node in the job's DAG with its own run status, retry and timeout settings, and notifications; stages without dependencies between them can run in parallel; dependencies can be made conditional with run-if conditions or If/else tasks; and a failure can be repaired by re-running only the failed stage. With %run, the called notebook runs inside the same execution context, so the whole chain is one opaque run: no per-step monitoring, no parallelism, and every recovery restarts from the first notebook. Chained %run calls are convenient for interactive work but are not the recommended production pattern, jobs can run notebooks as tasks, and a task graph gives more control than %run, not less.`,
    explanationPt: `Como notebook tasks separadas, cada estágio vira um nó no DAG do job, com status de execução próprio, configurações próprias de retry e timeout e notificações próprias; estágios sem dependências entre si podem rodar em paralelo; dependências podem se tornar condicionais com run-if ou tarefas If/else; e uma falha pode ser reparada reexecutando apenas o estágio que falhou. Com %run, o notebook chamado roda no mesmo contexto de execução, então a cadeia inteira é uma única execução opaca: sem monitoramento por passo, sem paralelismo e com toda recuperação recomeçando do primeiro notebook. Cadeias de %run são convenientes para trabalho interativo, mas não são o padrão recomendado para produção; jobs podem, sim, rodar notebooks como tarefas; e um grafo de tarefas dá mais controle que o %run, não menos.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/tasks/notebook",
    referenceTitle: "Notebook task for jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-040",
    domainCode: 4,
    stem: `A source system that feeds a nightly Lakeflow Job will undergo maintenance tomorrow, and the team decides the job should not fire while the data is unstable. Today's run has already started and is still in progress. The job definition, its run history, and next week's schedule must all be preserved.

What should the team do?`,
    options: [
      "Cancel the in-progress run immediately, because pausing a job also kills every run that is still active",
      "Pause the job's scheduled trigger: it stops starting new runs, and the active run still finishes",
      "Remove the schedule from the job definition and re-enter it by hand after the maintenance window",
      "Delete the job and rebuild it after maintenance, because stopping firings requires deleting the job",
    ],
    correctIndex: 1,
    explanationEn: `Pausing the job's scheduled trigger stops it from starting new runs, while any run already in progress continues to completion; the schedule, the job definition, and the run history stay intact, and the trigger can be resumed later, picking up the same schedule as before. That is exactly the temporary hold the team needs for the maintenance window. Pausing never cancels active runs, so there is no reason to kill the in-progress run. Removing the schedule edits the job definition and forces a manual rebuild afterwards, and deleting the job destroys the definition and history outright — neither is required to stop tomorrow's firing.`,
    explanationPt: `Pausar o trigger agendado do job faz com que ele deixe de iniciar novas execuções, enquanto qualquer execução já em andamento continua até ser concluída; o schedule, a definição do job e o histórico de execuções permanecem intactos, e o trigger pode ser reativado depois, voltando ao mesmo agendamento de antes. É exatamente a suspensão temporária que a equipe precisa para a janela de manutenção. Pausar nunca cancela execuções ativas, então não há motivo para matar a execução em andamento. Remover o schedule edita a definição do job e exige uma reconstrução manual depois; e deletar o job destrói a definição e o histórico — nenhum dos dois é necessário para impedir o disparo de amanhã.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/configure-job",
    referenceTitle: "Configure and edit Lakeflow Jobs — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S4-041",
    domainCode: 4,
    stem: `The first task in a Lakeflow Job runs a SQL task that computes yesterday's totals; a downstream notebook task needs that number as a parameter, but the SQL task does not use dbutils, so it cannot set a task value itself.

How can the SQL task's output reach the notebook task?`,
    options: [
      "Have the SQL task write the value with dbutils.jobs.taskValues.set in a trailing statement",
      "Pull it with a dynamic value reference like {{tasks.totals.output.first_row.yesterday_total}}",
      "Recompute the total in the notebook with an identical SQL query against the same tables",
      "Declare the number as a job parameter and edit the job definition manually every single night",
    ],
    correctIndex: 1,
    explanationEn: `SQL tasks expose their results through output options, and downstream tasks consume them with dynamic value references — expressions like {{tasks.<task-name>.output.first_row.<column>}} that resolve when the downstream task starts, pulling the number straight from the upstream SQL execution. dbutils.jobs.taskValues.set is a Python-notebook API and cannot run inside a SQL task; recomputing the query duplicates work and can drift; and a job parameter is a job-level constant, not a per-run channel for one task's result.`,
    explanationPt: `As tarefas SQL expõem seus resultados por meio de opções de saída, e as tarefas a jusante os consomem com dynamic value references — expressões como {{tasks.<nome-da-tarefa>.output.first_row.<coluna>}} resolvidas quando a tarefa a jusante inicia, puxando o número direto da execução SQL a montante. O dbutils.jobs.taskValues.set é uma API de notebook Python e não roda dentro de uma tarefa SQL; recomputar a query no notebook duplica trabalho e pode divergir; e um job parameter é uma constante de nível de job, não um canal por execução para o resultado de uma tarefa.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/dynamic-value-references",
    referenceTitle: "Use dynamic value references — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S4-042",
    domainCode: 4,
    stem: `A downstream Lakeflow Job must refresh whenever two specific upstream tables change — sales.orders and sales.returns — but a third table in the same schema, sales.staging, changes constantly and must never trigger the job.

How should the table update trigger be configured?`,
    options: [
      "Monitor the whole sales schema, and cancel any run that was triggered by sales.staging",
      "Select sales.orders and sales.returns as the trigger's monitored tables, so only they fire the job",
      "Add a filter in the job's first task that checks which table changed before continuing",
      "Rely on the default behavior, because table update triggers always watch every table in the source schema",
    ],
    correctIndex: 1,
    explanationEn: `A table update trigger is configured with an explicit list of monitored tables: the job fires when updates land on the selected tables — here sales.orders and sales.returns — and sales.staging is simply not in the list, so its constant changes never trigger anything. Monitoring a whole schema and cancelling afterwards wastes runs and races with data changes; filtering inside the first task still means the job fires on every staging update; and the monitored-table list is exactly the feature that makes the "always every table" claim false.`,
    explanationPt: `O table update trigger é configurado com uma lista explícita de tabelas monitoradas: o job dispara quando aterrissam atualizações nas tabelas selecionadas — aqui sales.orders e sales.returns — e a sales.staging simplesmente não entra na lista, então suas mudanças constantes nunca disparam nada. Monitorar o schema inteiro e cancelar depois desperdiça execuções e corre contra as mudanças de dados; filtrar dentro da primeira tarefa ainda significa que o job dispara a cada atualização da staging; e a lista de tabelas monitoradas é exatamente o recurso que torna falsa a afirmação do "sempre todas as tabelas".`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/trigger-table-update",
    referenceTitle: "Trigger a job when a table updates — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S4-043",
    domainCode: 4,
    stem: `A team configures a file arrival trigger by pasting the raw cloud URL of an S3 bucket where a vendor drops CSV files: s3://vendor-drops/incoming/. The trigger setup fails, and the team asks what location it can actually monitor.

What is the requirement?`,
    options: [
      "Any s3:// path works as long as the bucket is in the same region as the workspace",
      "Triggers can only watch workspace DBFS paths, so the vendor must upload everything to /FileStore instead",
      "The raw bucket URL works if the team also pastes AWS access keys into the job definition",
      "File arrival triggers monitor a Unity Catalog volume or registered external location path, not arbitrary URLs",
    ],
    correctIndex: 3,
    explanationEn: `File arrival triggers are wired to governed storage: the monitored location is a path inside a Unity Catalog volume or a registered external location that Unity Catalog already knows how to authorize — pasting an arbitrary s3:// URL does not resolve, which is why the setup failed. The fix is to register the vendor bucket path as an external location (or expose it through a volume) and point the trigger at that governed path. Region alone does not make a raw URL usable, /FileStore is workspace-local scratch storage, and embedding cloud keys in a job definition is exactly the anti-pattern governance forbids.`,
    explanationPt: `Os file arrival triggers são ligados a storage governado: o local monitorado é um caminho dentro de um Unity Catalog volume ou de um external location registrado, que o Unity Catalog já sabe autorizar — colar uma URL s3:// arbitrária não resolve, e por isso a configuração falhou. A correção é registrar o caminho do bucket do fornecedor como external location (ou expô-lo por um volume) e apontar o trigger para esse caminho governado. A região sozinha não torna uma URL crua utilizável, o /FileStore é armazenamento rascunho local do workspace, e embutir chaves de nuvem na definição do job é exatamente o antipadrão que a governança proíbe.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/file-arrival-triggers",
    referenceTitle: "Trigger a job when a file arrives — Databricks Docs",
    difficulty: "MEDIUM",
  },
];

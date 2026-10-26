import type { SeedQuestion } from "./types";

/**
 * Section 6 — Troubleshooting, Monitoring, and Optimization (10%)
 * Target: 12 questions (S6-001 .. S6-012).
 */
export const s6Questions: SeedQuestion[] = [
  {
    key: "S6-001",
    domainCode: 6,
    stem: `A scheduled Lakeflow Job that loads nightly sales data used to complete in about 18 minutes. Over the past month, runs have crept up to 45 minutes and more. Before investigating causes, the on-call engineer wants to confirm whether this is a steady trend or a one-off spike.

Where should the engineer look first, and what will it show?`,
    options: [
      "The job's run history in the Jobs UI, comparing recent run durations against the earlier baseline",
      "The Ganglia metrics of the job cluster, aggregated across all jobs that shared that cluster over the past month",
      "The query history of the workspace's SQL warehouses, filtered by the job owner",
      "The workspace audit logs, filtered by the job's service principal",
    ],
    correctIndex: 0,
    explanationEn: `The run history view is the first stop for performance trends: it shows each run's state, start time, and duration, so the engineer can compare current durations with the historical baseline and see whether degradation is gradual (for example, growing data volume or small files) or a single bad run. Ganglia shows cluster-level resource metrics, SQL query history only covers SQL warehouse queries, and audit logs record control-plane actions, not run durations.`,
    explanationPt: `O histórico de execuções é o primeiro ponto para tendências de performance: ele mostra o estado, o horário de início e a duração de cada run, permitindo comparar as durações atuais com a baseline histórica e identificar se a degradação é gradual (por exemplo, crescimento de volume ou small files) ou um único run ruim. O Ganglia exibe métricas de recursos do cluster; o histórico de queries cobre apenas SQL warehouses; e os logs de auditoria registram ações do plano de controle, não durações de runs.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/diagnose-job-performance",
    referenceTitle: "Diagnose job performance — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S6-002",
    domainCode: 6,
    stem: `A Lakeflow Job has the task graph ingest → validate → enrich → publish. In the latest run, \`ingest\` succeeded, \`validate\` failed after four minutes, and \`enrich\` and \`publish\` never started — the task graph shows them as skipped.

What does the task graph reveal, and what is the immediate cause?`,
    options: [
      "enrich is misconfigured: its skipped status means its own task parameters failed validation before launch",
      "Failed validate blocks the rest: enrich and publish wait on upstream success and were skipped",
      "The job ran out of compute: the scheduler skipped the tasks because no workers were available to launch them",
      "enrich and publish were skipped because they were disabled in the job definition during the last edit",
    ],
    correctIndex: 1,
    explanationEn: `In the DAG-based task graph, each task runs when its dependency conditions are met — by default, all upstream tasks must succeed. When validate failed, enrich and everything downstream were skipped, and the graph pinpoints the single failed task as the blocker rather than a capacity or configuration problem. Tasks skipped by dependency differ from disabled tasks in the UI, and no worker shortage is implied.`,
    explanationPt: `No grafo de tarefas baseado em DAG, cada task roda quando suas condições de dependência são atendidas — por padrão, todos os upstream devem ter sucesso. Quando validate falhou, enrich e todo o restante a jusante foram marcados como skipped, e o grafo aponta a única task com falha como bloqueadora, e não um problema de capacidade ou configuração. Tasks puladas por dependência são distintas de tasks desabilitadas na UI, e não há qualquer falta de workers.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/monitor",
    referenceTitle: "Monitor Lakeflow Jobs — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S6-003",
    domainCode: 6,
    stem: `A nightly Lakeflow Job with six tasks failed at \`transform_customers\` (task 4) because a partner delivered a malformed file. Tasks 1-3 succeeded, and tasks 5-6 were skipped. The partner has now re-delivered a corrected file, and the team wants tonight's data finished as quickly as possible without recomputing work that already succeeded.

What should the team do?`,
    options: [
      "Trigger a brand-new run of the job and let it recompute tasks 1 through 6 from scratch",
      "Run the transform_customers notebook manually on an all-purpose cluster, copy the resulting tables into place, and then trigger a new run",
      "Re-run the failed run with repair — it re-runs the failed task and its dependents, preserving succeeded tasks",
      "Delete the failed run so that the job's next scheduled trigger retries the full pipeline automatically",
    ],
    correctIndex: 2,
    explanationEn: `A repair run re-runs the failed tasks and the downstream tasks that depend on them, reusing the successful tasks' results instead of recomputing them — exactly the minimal path to finish tonight's data. A full new run wastes the work already done, manual notebook runs bypass the job's orchestration and configuration, and deleting a run never schedules a retry of anything.`,
    explanationPt: `Um repair run re-executa as tasks que falharam e as tasks a jusante que dependem delas, reaproveitando os resultados das tasks bem-sucedidas em vez de recomputá-las — exatamente o caminho mínimo para completar os dados da noite. Um novo run completo desperdiça o trabalho já feito, execuções manuais de notebook contornam a orquestração e a configuração do job, e deletar um run jamais agenda qualquer retry.`,
    referenceUrl: "https://docs.databricks.com/aws/en/jobs/repair-job-failures",
    referenceTitle: "Repair Lakeflow Job run failures — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S6-004",
    domainCode: 6,
    stem: `A PySpark job joins a 4 TB events table with a small dimension table on \`user_id\`. One stage has 200 tasks: 199 finish in under two minutes, but one task runs for 38 minutes. The stage-level summary metrics show:

\`\`\`text
Shuffle read size per task:  min 14 MB  |  median 32 MB  |  max 7.9 GB
Task duration:               min 21 s   |  median 48 s   |  max 38 min
\`\`\`

What is the most likely diagnosis?`,
    options: [
      "Too few shuffle partitions: all tasks are uniformly too large, so spark.sql.shuffle.partitions should be increased to shrink every task",
      "Disk spill: the stage is dominated by spilling shuffle data to local disk, which the duration column reveals",
      "A broadcast timeout: the small table exceeded the broadcast threshold and the join fell back to a shuffle",
      "Data skew on user_id: one partition received 7.9 GB of shuffle data versus a 32 MB median, producing a single long-running straggler task",
    ],
    correctIndex: 3,
    explanationEn: `The signature of data skew is a maximum shuffle read that dwarfs the median while sibling tasks finish quickly — here one task holds 7.9 GB against a 32 MB median, meaning a few hot user_id values concentrated in one partition. Remedies include Adaptive Query Execution's skew join handling and salting the skewed keys. Too few partitions would show uniformly large tasks; spill appears in the spill (disk) metrics; and a broadcast fallback shows in the query plan, not as a single straggler.`,
    explanationPt: `A assinatura do data skew é um shuffle read máximo que anula a mediana enquanto as demais tasks terminam rápido — aqui uma task carrega 7,9 GB contra uma mediana de 32 MB, ou seja, poucos valores "quentes" de user_id se concentraram numa única partição. Os remédios incluem o tratamento de skew joins do Adaptive Query Execution e a aplicação de salting nas chaves enviesadas. Poucas partições gerariam tasks uniformemente grandes; spill apareceria nas métricas de spill em disco; e um fallback de broadcast aparece no plano de consulta, não como um único straggler.`,
    referenceUrl: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage",
    referenceTitle: "Investigate long-running stages in the Spark UI — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S6-005",
    domainCode: 6,
    stem: `A pipeline joins a large fact table with a dimension table on a heavily skewed key. The team cannot rewrite the join right now and wants Spark to mitigate the skew automatically at runtime.

What does Adaptive Query Execution (AQE) provide for this case?`,
    options: [
      "AQE converts every skewed sort-merge join into a broadcast join using the smaller table's runtime statistics",
      "AQE's skew join optimization splits oversized partitions into smaller ones processed in parallel",
      "AQE caches the skewed partitions in memory on the executors so that repeated reads avoid the shuffle",
      "AQE disables the join and rewrites it as a union of per-key filters generated from table statistics",
    ],
    correctIndex: 1,
    explanationEn: `AQE re-optimizes query plans using runtime shuffle statistics collected after each shuffle stage. Its skew join handling identifies oversized partitions and splits them into sub-partitions so several tasks share the skewed work — no code changes needed, and it is on by default in recent Databricks Runtime alongside partition coalescing and sort-merge-to-broadcast conversion. The other options describe mechanisms that AQE does not use.`,
    explanationPt: `O AQE reotimiza os planos de consulta usando estatísticas de shuffle coletadas em tempo de execução após cada estágio. Seu tratamento de skew joins identifica partições grandes demais e as divide em subpartições, de modo que várias tasks compartilhem o trabalho enviesado — sem mudanças de código — e está habilitado por padrão em versões recentes do Databricks Runtime, junto com a coalescência de partições e a conversão de sort-merge para broadcast. As demais opções descrevem mecanismos que o AQE não usa.`,
    referenceUrl: "https://docs.databricks.com/aws/en/optimizations/aqe",
    referenceTitle: "Adaptive Query Execution — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S6-006",
    domainCode: 6,
    stem: `In the Spark UI, a stage's tasks report large Spill (Disk) values — tens of GB spilled across the stage — and the stage takes three times longer than its siblings. Executor garbage-collection time is elevated, but no single task is disproportionately larger than the others.

What does the spill indicate, and what is a reasonable remedy?`,
    options: [
      "The local SSDs are saturating; replace instance storage with network-attached volumes that can grow beyond the node's own disks",
      "The Delta table has too many small files; run OPTIMIZE to compact them before the next run",
      "Shuffle data per task exceeds executor memory, so it spills to disk — raise memory per executor or shuffle partitions",
      "Spill means the DBIO disk cache is active; disable the cache to free disk space for shuffle files",
    ],
    correctIndex: 2,
    explanationEn: `Spill (Disk) in stage metrics means an executor's memory could not hold a task's shuffle data, so Spark serialized it to local disk — slow, but not fatal. Remedies target the memory pressure: worker instances with more memory per executor, or more shuffle partitions so each task processes a smaller slice. Spill is not an SSD problem, small files show up as many tiny tasks rather than disk spill, and the DBIO cache is unrelated to shuffle spill.`,
    explanationPt: `Spill (Disk) nas métricas do estágio significa que a memória do executor não comportou os dados de shuffle da task, então o Spark os serializou no disco local — lento, mas não fatal. As correções atacam a pressão de memória: workers com mais memória por executor ou mais partições de shuffle para que cada task processe uma fatia menor. Spill não é problema de SSD; small files aparecem como muitas tasks minúsculas, não como spill em disco; e o DBIO cache não tem relação com o spill de shuffle.`,
    referenceUrl: "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/",
    referenceTitle: "Spark UI guide — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S6-007",
    domainCode: 6,
    stem: `A team is creating a new Delta table for order line items. Queries almost always filter on \`order_date\` and \`customer_id\`. The team's older tables use Hive-style partitioning on a date column plus nightly \`OPTIMIZE ... ZORDER BY\` jobs, and the team plans to copy that design.

What does Databricks currently recommend for this new table?`,
    options: [
      "Liquid Clustering with order_date and customer_id as keys — incremental layout, no ZORDER jobs",
      "Hive-style partitioning on customer_id, because clustering keys must have low cardinality to be effective",
      "Hive-style partitioning on both order_date and customer_id, so every query prunes at least one partition directory",
      "No layout optimization at all: rely on Delta's file-level statistics, which are recomputed on every write",
    ],
    correctIndex: 0,
    explanationEn: `For new tables, Databricks recommends Liquid Clustering instead of partitioning or ZORDER: you declare clustering keys, and the data layout is maintained incrementally as data is written and optimized — flexible and resilient to cardinality. Partitioning on a high-cardinality key like customer_id creates a small-files problem, partitioning on both columns multiplies directories, and skipping layout optimization wastes the data skipping that clustering provides.`,
    explanationPt: `Para tabelas novas, a Databricks recomenda Liquid Clustering em vez de particionamento ou ZORDER: declaram-se clustering keys e o layout dos dados é mantido incrementalmente conforme os dados são escritos e otimizados — flexível e resiliente à cardinalidade. Particionar por uma chave de alta cardinalidade como customer_id gera um problema de small files; particionar pelas duas colunas multiplica os diretórios; e abrir mão da otimização de layout desperdiça o data skipping que o clustering oferece.`,
    referenceUrl: "https://docs.databricks.com/aws/en/tables/clustering",
    referenceTitle: "Use Liquid Clustering for tables — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S6-008",
    domainCode: 6,
    stem: `A Delta table was created with Liquid Clustering using \`CLUSTER BY (region, order_date)\`. Usage has shifted: most queries now filter by \`customer_id\`, and region filters are rare. The table holds several years of data that must not be rewritten wholesale.

How can the clustering keys be adapted?`,
    options: [
      "They cannot be changed: clustering keys are fixed at table creation, so the team must copy the data into a new table clustered by the new keys",
      "Run OPTIMIZE orders ZORDER BY (customer_id) to layer ZORDER columns on top of the existing clustering",
      "Recreate the table with CREATE OR REPLACE TABLE orders CLUSTER BY (region, customer_id) and reinsert all rows during the next maintenance window",
      "Run ALTER TABLE orders CLUSTER BY (region, customer_id): new keys apply to new writes, and OPTIMIZE re-clusters incrementally",
    ],
    correctIndex: 3,
    explanationEn: `Clustering keys are mutable: ALTER TABLE ... CLUSTER BY swaps the keys, and the new layout is applied incrementally — new data is clustered by the new keys, and later OPTIMIZE runs (or predictive optimization) re-cluster existing data over time, with no wholesale rewrite. This flexibility is a core advantage of Liquid Clustering over partition columns, which are immutable and require rebuilding the table. ZORDER is not layered onto clustered tables.`,
    explanationPt: `Clustering keys são mutáveis: ALTER TABLE ... CLUSTER BY troca as chaves e o novo layout é aplicado incrementalmente — os dados novos passam a ser clusterizados pelas novas chaves, e OPTIMIZEs posteriores (ou a predictive optimization) reclusterizam os dados existentes ao longo do tempo, sem reescrita integral. Essa flexibilidade é uma vantagem central do Liquid Clustering sobre colunas de particionamento, que são imutáveis e exigem reconstruir a tabela. ZORDER não é sobreposto a tabelas clusterizadas.`,
    referenceUrl: "https://docs.databricks.com/aws/en/tables/clustering",
    referenceTitle: "Use Liquid Clustering for tables — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S6-009",
    domainCode: 6,
    stem: `A small platform team schedules dozens of manual Lakeflow Jobs to run OPTIMIZE and VACUUM on Unity Catalog managed Delta tables. Runs get skipped whenever the on-call rotation changes, and table performance decays unpredictably. They have heard that Databricks can handle this maintenance automatically.

What does predictive optimization provide?`,
    options: [
      "It forecasts query workloads and pre-materializes the most frequent gold-layer joins as streaming tables",
      "Databricks runs OPTIMIZE and VACUUM automatically on UC managed tables based on usage patterns",
      "It predicts cluster node failures and pre-emptively migrates jobs to healthy workers",
      "It analyzes table growth trends and emails capacity recommendations to the data engineering team",
    ],
    correctIndex: 1,
    explanationEn: `Predictive optimization is a Unity Catalog capability for managed tables: Databricks observes query and table statistics and proactively runs the maintenance that pays off — OPTIMIZE, including liquid clustering layout, and VACUUM — where and when each table needs it, replacing hand-scheduled maintenance jobs. It does not materialize joins, manage compute health, or produce capacity reports; those options describe other features or nothing at all.`,
    explanationPt: `A predictive optimization é uma capacidade do Unity Catalog para tabelas managed: a Databricks observa as estatísticas de queries e tabelas e executa proativamente a manutenção que compensa — OPTIMIZE, incluindo o layout do liquid clustering, e VACUUM — onde e quando cada tabela precisa, substituindo jobs de manutenção agendados manualmente. Ela não materializa joins, não gerencia a saúde do compute nem gera relatórios de capacidade; essas opções descrevem outros recursos — ou nada.`,
    referenceUrl: "https://docs.databricks.com/aws/en/optimizations/predictive-optimization",
    referenceTitle: "Predictive optimization — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S6-010",
    domainCode: 6,
    stem: `A shuffle-heavy aggregation job fails repeatedly with \`java.lang.OutOfMemoryError: Java heap space\` on the executors. The Spark UI shows long garbage-collection pauses and heavy spill on the failing stage, and the cluster uses the smallest general-purpose worker type, with each node running multiple concurrent tasks.

What is the most effective fix?`,
    options: [
      "Increase driver memory, because the driver's heap backs every executor task on the cluster",
      "Decrease spark.sql.shuffle.partitions so that fewer tasks run concurrently and the total memory demand of the stage drops accordingly",
      "Bigger workers (more memory per executor) plus more shuffle partitions, so each task handles less data",
      "Disable the Spark UI for this job to release the executor heap consumed by the event timeline",
    ],
    correctIndex: 2,
    explanationEn: `An executor out-of-memory error means a task's heap cannot hold its working data. On Databricks, executor memory scales with the worker instance type, so the durable fix is larger, memory-rich workers; adding shuffle partitions shrinks each task's slice and eases the pressure. Driver memory only helps driver-side OOM, for example when collecting large results. Fewer partitions make each task bigger and worsen OOM, and disabling the Spark UI does not free executor heap.`,
    explanationPt: `Um out-of-memory em executor significa que o heap da task não comporta seus dados de trabalho. Na Databricks, a memória do executor acompanha o tipo de instância do worker; logo, a correção duradoura são workers maiores e com mais memória — e mais partições de shuffle reduzem a fatia de cada task, aliviando a pressão. Memória de driver só resolve OOM do lado do driver, por exemplo ao coletar resultados grandes. Menos partições aumentam cada task e pioram o OOM, e desligar o Spark UI não libera heap de executor.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/cluster-config-best-practices",
    referenceTitle: "Cluster configuration best practices — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S6-011",
    domainCode: 6,
    stem: `After a platform change, every new job cluster terminates during launch. The cluster event log shows an \`INIT_SCRIPTS_FAILED\` event, and the team recently added an init script that points pip at an internal package mirror whose TLS certificate expired last night.

What is the cause, and how is it fixed?`,
    options: [
      "The init script fails during node startup, so Databricks terminates the cluster before Spark launches",
      "The Databricks Runtime version conflicts with the cluster's Spark settings; pin the previous version",
      "Executors run out of memory at boot because the init script pre-loads libraries into the heap",
      "The cloud provider has no capacity for the instance type; launch the cluster in a different availability zone",
    ],
    correctIndex: 0,
    explanationEn: `Init scripts run on every node as it starts; a non-zero exit aborts node setup and the cluster terminates with an INIT_SCRIPTS_FAILED event, which is exactly what the event log shows. The details are in the init script's logs, and the fix is repairing the script or the expired certificate, then relaunching. Capacity problems and runtime mismatches produce different events and would not correlate with the script change; executors have no user heap at bootstrap time.`,
    explanationPt: `Init scripts rodam em cada node na inicialização; um exit diferente de zero aborta a configuração do node e o cluster termina com um evento INIT_SCRIPTS_FAILED — exatamente o que o event log mostra. Os detalhes estão nos logs do init script, e a correção é arrumar o script ou o certificado expirado e reiniciar o cluster. Problemas de capacidade ou incompatibilidade de runtime geram outros eventos e não teriam relação com a mudança no script; executors não têm heap de usuário no bootstrap.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Configure clusters — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S6-012",
    domainCode: 6,
    stem: `A job ran unchanged for months on a shared cluster whose \`pandas\` cluster library was pinned to 1.5.3. Last week, another team updated the cluster's libraries to pandas 2.2.0 for their own pipeline. Since then, this job's tasks fail immediately with an \`AttributeError\` when the code calls \`DataFrame.append\`.

What happened, and what is the best-practice fix?`,
    options: [
      "The cluster's Spark version was silently downgraded during the library update; pin the previous Spark version to restore the job",
      "The other team's pipeline rewrote the job's input files into a format the reader no longer understands",
      "The job hits out-of-memory while importing pandas; move it to larger workers",
      "A library version conflict — pandas 2.2.0 removed the API this job uses; give the job its own cluster or pinned libraries",
    ],
    correctIndex: 3,
    explanationEn: `DataFrame.append was removed in pandas 2.0, so upgrading the shared cluster's library broke code written against the 1.x API — a classic library conflict on shared compute. The failure is immediate and code-level, not data- or memory-related. Best practice is to isolate workloads, for example job-scoped clusters with pinned library versions, so that one team's upgrade cannot break another team's pipeline.`,
    explanationPt: `DataFrame.append foi removido no pandas 2.0; o upgrade da biblioteca no cluster compartilhado quebrou um código escrito para a API 1.x — o clássico conflito de bibliotecas em compute compartilhado. A falha é imediata e de código, não de dados nem de memória. A boa prática é isolar os workloads, por exemplo com clusters dedicados ao job e versões de bibliotecas fixadas, para que o upgrade de um time não quebre o pipeline de outro.`,
    referenceUrl: "https://docs.databricks.com/aws/en/compute/configure",
    referenceTitle: "Configure clusters — Databricks Docs",
    difficulty: "EASY",
  },
];

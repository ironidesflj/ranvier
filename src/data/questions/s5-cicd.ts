import type { SeedQuestion } from "./types";

/**
 * Section 5 — Implementing CI/CD (10%)
 * Target: 12 questions (S5-001 .. S5-012).
 */
export const s5Questions: SeedQuestion[] = [
  {
    key: "S5-001",
    domainCode: 5,
    stem: `A data engineer maintains the notebooks for a sales pipeline in a Databricks Git Folder (formerly Repos) connected to the team's GitHub repository. They need to add a new validation step to the \`silver_orders\` notebook, and team policy requires a peer review of every change before it lands on \`main\`.

Which workflow should the engineer follow entirely from the workspace UI?`,
    options: [
      "From the Git Folder: create a branch, edit and commit the notebook, push, then create a pull request against main",
      "Edit the notebook directly on main, push the change immediately, and rely on the workspace file version history to roll back if the reviewer later objects",
      "Export the notebook as a source file, edit it in a local IDE, and email the modified file to the reviewer before copying it back into the Git Folder",
      "Clone the notebook into a personal workspace folder, collect review comments on the clone, and then overwrite the main notebook with the approved version",
    ],
    correctIndex: 0,
    explanationEn: `Databricks Git Folders support the whole review workflow inside the workspace: create or switch branches, edit, commit with a message, push to the Git provider, and create pull requests that open on the provider for review. Option 1 bypasses the review gate and treats version history as a rollback mechanism. Options 2 and 3 break the link between the repository and the folder, so the Git provider stops being the source of truth and a later pull would clobber the manual copies.`,
    explanationPt: `Os Databricks Git Folders suportam o fluxo completo de revisão dentro do workspace: criar ou alternar branches, editar, commitar com mensagem, enviar ao provedor Git e criar pull requests que abrem no provedor para revisão. A opção 1 contorna o controle de revisão e trata o histórico de versões apenas como mecanismo de rollback. As opções 2 e 3 rompem o vínculo entre repositório e pasta, deixando de manter o provedor Git como fonte da verdade — um pull futuro sobrescreveria as cópias manuais.`,
    referenceUrl: "https://docs.databricks.com/aws/en/repos/git-operations-with-repos",
    referenceTitle: "Git operations with Git folders — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-002",
    domainCode: 5,
    stem: `A data engineer is refactoring ingestion notebooks on the \`feature/dq-checks\` branch checked out in their Git Folder. While waiting for CI, they must also reproduce a bug that a teammate already fixed on the \`hotfix/schema-fix\` branch, running both branches' notebooks in the same workspace at the same time to compare outputs.

What should the engineer do?`,
    options: [
      "Keep switching the existing Git Folder between feature/dq-checks and hotfix/schema-fix whenever they need to execute the other branch's code",
      "Create an additional Git Folder for the same repo with hotfix/schema-fix checked out, so both branches coexist in the workspace",
      "Run a %git checkout hotfix/schema-fix command as the first cell of the buggy notebook to load the teammate's version for that notebook only",
      "Ask the teammate to merge the fix into feature/dq-checks so that both changes can be tested in a single branch",
    ],
    correctIndex: 1,
    explanationEn: `A Git Folder holds one checked-out branch at a time, so a single folder cannot run two branches simultaneously — switching branches swaps the folder's file contents. The documented way to work with multiple branches at once is to create additional Git folders for the same repository, each checked out to a different branch; the two sets of notebooks then live side by side in the workspace. There is no %git checkout magic command, and merging the hotfix into the feature branch would mix unreviewed changes into the refactoring work.`,
    explanationPt: `Cada Git Folder mantém um só branch feito checkout por vez; uma única pasta não executa dois branches simultaneamente, pois alternar o branch troca o conteúdo dos arquivos. A forma documentada de trabalhar com múltiplos branches ao mesmo tempo é criar Git folders adicionais para o mesmo repositório, cada um em um branch diferente — assim os dois conjuntos de notebooks coexistem lado a lado no workspace. Não existe magic command %git checkout, e fazer merge do hotfix no branch de feature misturaria mudanças sem revisão no trabalho de refatoração.`,
    referenceUrl: "https://docs.databricks.com/aws/en/repos/git-folders-concepts",
    referenceTitle: "Git folders concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-003",
    domainCode: 5,
    stem: `A team stores all pipeline code in Git Folders backed by an Azure DevOps repository. Policy forbids direct pushes to \`main\`: every change must be reviewed in a pull request on the Git provider. A junior engineer has just finished work on the branch \`feature/mart-fix\` inside their Git Folder and must open the PR for the team's reviewers.

Which action meets the requirement directly from the workspace?`,
    options: [
      "Grant the reviewers Can Read permission on the Git Folder so they can open the branch and approve the changes there",
      "Merge feature/mart-fix into main locally in the Git Folder, push the merge, and then create a PR to revert it if reviewers object",
      "Push the branch from the Git Folder and create the PR from its pull request option — it opens on Azure DevOps",
      "Export the branch as a DBC archive and attach it to a review ticket for the team's sign-off",
    ],
    correctIndex: 2,
    explanationEn: `Databricks Git integration can open pull requests straight from the Git Folder UI: after committing and pushing the branch, the engineer compares it against main and creates the PR, which opens on the Git provider (here Azure DevOps) where review and merge happen. Git Folder permissions govern who can access the repository, not code review. Merging before opening the PR defeats the review gate, and a DBC archive is only a static snapshot — neither action produces a provider pull request.`,
    explanationPt: `A integração Git da Databricks abre pull requests direto da UI do Git Folder: depois de commitar e enviar o branch, o engenheiro o compara com a main e cria o PR, que abre no provedor Git (aqui, o Azure DevOps), onde acontecem revisão e merge. Permissões do Git Folder controlam quem acessa o repositório, não a revisão de código. Fazer merge antes de abrir o PR anula o controle de revisão, e um arquivo DBC é apenas um snapshot estático — nenhum dos dois gera um pull request no provedor.`,
    referenceUrl: "https://docs.databricks.com/aws/en/repos/git-operations-with-repos",
    referenceTitle: "Git operations with Git folders — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-004",
    domainCode: 5,
    stem: `A team owns one ETL codebase that runs in dev, test, and prod workspaces, and each workspace uses a different SQL warehouse for the job's SQL tasks. The bundle's task references a variable wherever the warehouse is used:

\`\`\`yaml
resources:
  jobs:
    nightly_orders:
      tasks:
        - task_key: load
          sql_task:
            warehouse_id: \${var.warehouse_id}
\`\`\`

The rest of the bundle defines the variable and the targets (the test target follows the same pattern as prod):

\`\`\`yaml
variables:
  warehouse_id:
    default: "9d4e8f1a2b6c"
    description: SQL warehouse to use for SQL tasks

targets:
  dev:
    default: true
  prod:
    variables:
      warehouse_id: "e2f1c9d4a7b3"
\`\`\`

How does this design serve three environments from a single codebase?`,
    options: [
      "Every databricks bundle deploy pauses and prompts the engineer to type the warehouse ID for the target being deployed",
      "The variable is resolved when the job runs, reading the correct warehouse from each workspace's environment configuration",
      "The team maintains three copies of this bundle, each hardcoding its own warehouse_id, and deploys the copy that matches the environment",
      "Variables resolve per target at deploy time — dev uses the default, prod uses its override, resources stay identical",
    ],
    correctIndex: 3,
    explanationEn: `Automation Bundles resolve variables for the target being deployed. The variables block supplies defaults, and a value declared inside a target — like the prod warehouse ID — overrides the default only for that target. Deploying with -t dev resolves the reference to the default warehouse; deploying with -t prod resolves it to the prod value, while the job definition stays byte-for-byte identical. Nothing is prompted during deployment, values are not deferred to run time, and keeping three hard-coded copies of the bundle is exactly the drift-prone practice that targets and variables exist to avoid.`,
    explanationPt: `Automation Bundles resolvem as variáveis conforme o target em deploy. O bloco variables define os defaults, e um valor declarado dentro de um target — como o ID do warehouse de prod — sobrescreve o default apenas naquele target. Um deploy com -t dev resolve a referência para o warehouse padrão; com -t prod, resolve para o valor de prod, mantendo a definição do job idêntica. Nada é perguntado durante o deploy, os valores não são adiados para a execução, e manter três cópias fixas do bundle é justamente a prática propensa a drift que targets e variáveis existem para evitar.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/overrides",
    referenceTitle: "Overrides for Automation Bundles — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-005",
    domainCode: 5,
    stem: `A team's bundle defines a Lakeflow Spark Declarative Pipeline (formerly DLT) with one notebook library at the root, and the prod target overrides the \`libraries\` list:

\`\`\`yaml
bundle:
  name: etl_bundle

resources:
  pipelines:
    sales_silver:
      name: sales_silver
      libraries:
        - notebook:
            path: ./src/dlt_silver.ipynb

targets:
  prod:
    resources:
      pipelines:
        sales_silver:
          libraries:
            - notebook:
                path: ./prod/dlt_silver.ipynb
\`\`\`

After running \`databricks bundle deploy -t prod\`, which notebook does the deployed pipeline use?`,
    options: [
      "Both ./src/dlt_silver.ipynb and ./prod/dlt_silver.ipynb, because target-level lists are merged with root-level lists",
      "Only ./prod/dlt_silver.ipynb, because sequence (list) settings in a target replace the root-level list instead of merging with it",
      "Only ./src/dlt_silver.ipynb, because root-level resource definitions always take precedence over target overrides of any resource setting",
      "The deploy fails with a duplicate-resource error because sales_silver is defined in two places",
    ],
    correctIndex: 1,
    explanationEn: `Bundle overrides are applied by value type. Mapping (dictionary) fields are merged key by key, with the target's values winning; sequence (list) fields are replaced wholesale by the target's list. libraries is a sequence, so the prod target's single notebook replaces the root-level list, and the deployed pipeline runs only ./prod/dlt_silver.ipynb. There is no duplicate-resource error: re-declaring part of a resource inside a target is the intended pattern for tailoring one definition to each environment.`,
    explanationPt: `Os overrides de bundle são aplicados conforme o tipo do valor. Campos de mapeamento (dicionário) são mesclados chave a chave, com o valor do target vencendo; já campos de sequência (lista) são substituídos integralmente pela lista do target. libraries é uma sequência, então o notebook único do target prod substitui a lista raiz e o pipeline implantado executa apenas ./prod/dlt_silver.ipynb. Não há erro de recurso duplicado: redeclarar parte de um recurso dentro de um target é justamente o padrão pretendido para adaptar uma definição a cada ambiente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/overrides",
    referenceTitle: "Overrides for Automation Bundles — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S5-006",
    domainCode: 5,
    stem: `A data engineering team supports dev, test, and prod workspaces. Today an administrator recreates the team's Lakeflow Job, its notebooks, and a Lakeflow Spark Declarative Pipeline in each workspace by clicking through the UI, and the definitions drift apart between environments. The team wants the environment definitions to live in Git and be deployed consistently.

Which Databricks capability is designed for this?`,
    options: [
      "Automation Bundles: YAML definitions of jobs, pipelines, and notebooks in Git, deployed per target via the CLI",
      "Workspace export and import of DBC archives between workspaces, executed manually by an administrator for each release",
      "A meta Lakeflow Job whose notebook tasks call the Jobs REST API to create the team's other jobs in each workspace",
      "Copying the Delta table data between workspaces so that each environment rebuilds the pipeline from the same files",
    ],
    correctIndex: 0,
    explanationEn: `An Automation Bundle is a package of deployable workspace assets — Lakeflow Jobs, Lakeflow Spark Declarative Pipelines, notebooks, and other resources — described in YAML next to the code and versioned in Git. Targets model dev, test, and prod with variables and overrides, and the Databricks CLI validates and deploys the same definitions to each environment, removing manual UI drift. DBC exports are manual and lossy, a meta-job that creates jobs through the REST API is brittle and unreviewable, and copying table data never reproduces pipeline definitions.`,
    explanationPt: `Um Automation Bundle é um pacote de assets implantáveis do workspace — Lakeflow Jobs, Lakeflow Spark Declarative Pipelines, notebooks e outros recursos — descritos em YAML junto ao código e versionados em Git. Targets modelam dev, test e prod com variáveis e overrides, e a Databricks CLI valida e faz deploy das mesmas definições em cada ambiente, eliminando o drift manual pela UI. Exportações DBC são manuais e com perda de fidelidade; um meta-job que cria jobs via REST API é frágil e sem revisão; e copiar dados de tabelas jamais reproduz as definições do pipeline.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-007",
    domainCode: 5,
    stem: `In a CI workflow, this command just completed with no errors reported:

\`\`\`bash
databricks bundle validate -t prod
\`\`\`

The next step is to create or update the bundle's Lakeflow Job and pipeline in the production workspace so that they match the definitions in the repository.

Which command performs this step?`,
    options: [
      "databricks bundle push -t prod",
      "databricks jobs create --json-file databricks.yml",
      "databricks bundle deploy -t prod",
      "databricks bundle run -t prod",
    ],
    correctIndex: 2,
    explanationEn: `databricks bundle deploy builds and deploys the bundle's resources to the target workspace: it creates or updates the job and pipeline, uploads the referenced notebooks and files, and applies the target's variable values. bundle push only syncs the bundle's files to the workspace — it deploys no resources. bundle run executes an already-deployed resource, and jobs create expects Jobs API JSON, not a bundle configuration file.`,
    explanationPt: `databricks bundle deploy constrói e implanta os recursos do bundle no workspace do target: cria ou atualiza o job e o pipeline, envia os notebooks e arquivos referenciados e aplica os valores de variáveis do target. bundle push apenas sincroniza os arquivos do bundle com o workspace — não implanta recursos. bundle run executa um recurso já implantado, e jobs create espera JSON da API de Jobs, não um arquivo de configuração de bundle.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/cli",
    referenceTitle: "Databricks CLI — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-008",
    domainCode: 5,
    stem: `A GitHub Actions workflow runs on every pull request that touches the team's Automation Bundle. The team wants the check to fail before any production resource changes when the bundle has schema errors, invalid resource fields, or variables that cannot be resolved for the prod target.

Which command should the workflow run?`,
    options: [
      "databricks bundle lint --target prod --output json",
      "databricks bundle plan --target prod",
      "yamllint databricks.yml",
      "databricks bundle validate --target prod",
    ],
    correctIndex: 3,
    explanationEn: `databricks bundle validate parses the bundle configuration, checks the resource definitions, and resolves variables and target overrides, reporting errors without changing anything in the workspace — the recommended pre-deploy gate in CI. Bundles have no lint or plan subcommands. A generic YAML linter such as yamllint only catches indentation and syntax mistakes; it would happily pass invalid field names, unsupported resource types, and unresolved variables straight through to production.`,
    explanationPt: `databricks bundle validate faz o parse da configuração do bundle, verifica as definições de recursos e resolve variáveis e overrides do target, reportando erros sem alterar nada no workspace — é o gate recomendado antes do deploy em CI. Bundles não têm subcomandos lint nem plan. Um linter genérico de YAML, como o yamllint, só captura problemas de indentação e sintaxe; ele aprovaria tranquilamente campos inválidos, tipos de recurso não suportados e variáveis sem resolução, deixando tudo passar para produção.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/jobs-tutorial",
    referenceTitle: "Tutorial: Deploy a Lakeflow Job with an Automation Bundle — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-009",
    domainCode: 5,
    stem: `A nightly GitHub Actions workflow deploys the team's Automation Bundle to production. The workflow must authenticate to the Databricks workspace without any human interaction, and the security team has banned personal access tokens that belong to individual engineers in CI systems.

Which setup should the team use for the Databricks CLI in the workflow?`,
    options: [
      "Embed the credentials of a shared admin user in the workflow definition and run databricks auth login interactively at the start of every run",
      "Create a service principal, then set DATABRICKS_HOST, DATABRICKS_CLIENT_ID, and DATABRICKS_CLIENT_SECRET as environment variables",
      "Rotate a personal access token borrowed from a different engineer each month and store it as the workflow's secret",
      "Run the CLI from a VM in the same VPC as the workspace so that network proximity replaces authentication",
    ],
    correctIndex: 1,
    explanationEn: `Databricks recommends service principals for automation. The CLI authenticates non-interactively when the workspace host and the service principal's OAuth client ID and secret are provided through environment variables, so nightly deploys run with a stable machine identity — no human login and no individual behind the token. Interactive auth login cannot run unattended in CI, monthly token rotation still ties automation to a person, and network proximity to the workspace never replaces authentication.`,
    explanationPt: `A Databricks recomenda service principals para automação. A CLI autentica de forma não interativa quando o host do workspace e o client ID e o secret OAuth do service principal são fornecidos via variáveis de ambiente; assim os deploys noturnos rodam com uma identidade de máquina estável — sem login humano e sem uma pessoa por trás do token. Um auth login interativo não roda sem atendimento em CI; rotacionar tokens de engenheiros ainda vincula a automação a indivíduos; e proximidade de rede jamais substitui autenticação.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/cli",
    referenceTitle: "Databricks CLI — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-010",
    domainCode: 5,
    stem: `A CI workflow just deployed the team's bundle to the dev target. As a smoke test, the workflow must start the deployed Lakeflow Job whose bundle resource key is \`ingest_orders\`, capture its outcome, and fail the workflow if the run errors.

Which command starts the job from the bundle?`,
    options: [
      "databricks bundle run ingest_orders --target dev",
      "databricks bundle trigger ingest_orders --target dev",
      "databricks jobs run-now --job-name ingest_orders",
      "databricks bundle validate ingest_orders --target dev --execute",
    ],
    correctIndex: 0,
    explanationEn: `databricks bundle run <resource-key> --target dev resolves the resource by its key in the bundle's dev target, starts it, and streams output so CI can fail on error — ideal for smoke tests. There is no trigger subcommand and no --execute flag on validate, which only checks configuration. The Jobs API's run-now expects the job's numeric ID and has no notion of bundle targets or resource keys.`,
    explanationPt: `databricks bundle run <chave-do-recurso> --target dev resolve o recurso pela sua chave no target dev do bundle, inicia a execução e transmite a saída, permitindo que o CI falhe em caso de erro — ideal para smoke tests. Não existe subcomando trigger nem flag --execute em validate, que apenas valida a configuração. O run-now da API de Jobs espera o ID numérico do job e não conhece targets nem chaves de recursos de bundle.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/jobs-tutorial",
    referenceTitle: "Tutorial: Deploy a Lakeflow Job with an Automation Bundle — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-011",
    domainCode: 5,
    stem: `A data engineering team's bundle stores the Unity Catalog location for its pipeline in a variable, and the pipeline resource references that variable. The prod target assigns the variable its own value:

\`\`\`yaml
bundle:
  name: finance_etl

variables:
  catalog:
    default: dev_main

targets:
  prod:
    variables:
      catalog: prod_main
\`\`\`

\`\`\`yaml
resources:
  pipelines:
    finance_silver:
      catalog: \${var.catalog}
\`\`\`

The engineer validates the bundle, then runs \`databricks bundle deploy -t prod\` from the terminal. In which catalog do the deployed pipeline's tables land?`,
    options: [
      "In dev_main, because a variable's default value always wins over target-level values",
      "The deploy pauses and prompts the engineer to choose the catalog interactively",
      "In prod_main, because the prod target's variable value overrides the default when deploying that target",
      "Nowhere — the deploy fails because catalog is declared both as a default and in the prod target",
    ],
    correctIndex: 2,
    explanationEn: `Bundle variables accept a default value plus per-target values, and the target-level value wins when that target is deployed. Deploying -t prod resolves \${var.catalog} to prod_main; the same code deployed to the default dev target would use dev_main. Declaring a default and a target value for the same variable is the intended mechanism, not a conflict, and bundle deployments never prompt for values interactively.`,
    explanationPt: `Variáveis de bundle aceitam um valor default e valores por target, e o valor do target vence quando esse target é implantado. Um deploy com -t prod resolve \${var.catalog} como prod_main; o mesmo código implantado no target dev padrão usaria dev_main. Declarar um default e um valor de target para a mesma variável é o mecanismo pretendido, e não um conflito — e deploys de bundle jamais pedem valores interativamente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-012",
    domainCode: 5,
    stem: `A team's \`prod\` target declares no \`mode\`. After deploying it, the job appears in the Jobs UI with a \`[dev]\` marker appended to its name, and the job runs under the identity of whichever engineer executed the deploy. The team wants production resources with exact names running under a stable identity.

What should they change in the bundle?`,
    options: [
      "Set mode: production on the dev target and remove the dev target's default: true",
      "Keep the bundle as is and rename the job in the Jobs UI after every production deploy",
      "Split the job into a separate bundle that only the dev team deploys, leaving the current bundle for production",
      "Set mode: production and run_as (service principal) on the prod target — exact names, stable identity",
    ],
    correctIndex: 3,
    explanationEn: `Without a mode, targets default to development mode, which is designed for individual experimentation: deployed resource names get a dev marker and run_as can fall back to the deploying user. mode: production treats the target as shared production: it requires an explicit run_as setting — a service principal is best practice — and deploys resources with their exact names. Renaming in the UI is overwritten by the next deploy, and splitting the bundle only adds drift.`,
    explanationPt: `Sem um mode, todo target usa o modo development (o padrão), pensado para experimentação individual: os nomes dos recursos implantados ganham um marcador de dev e o run_as pode cair no usuário que fez o deploy. mode: production trata o target como produção compartilhada: exige um run_as explícito — a boa prática é um service principal — e implanta os recursos com os nomes exatos. Renomear pela UI é sobrescrito no próximo deploy, e dividir o bundle só cria mais drift.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes",
    referenceTitle: "Automation Bundle deployment modes — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S5-013",
    domainCode: 5,
    stem: `A newly hired data engineer wants to start adopting Automation Bundles for the team's Lakeflow Jobs and pipelines. They need a first bundle project on their laptop — a databricks.yml plus starter resource definitions — but have never written bundle YAML and do not want to assemble the project files by hand. Which action gets them a working scaffold the fastest?`,
    options: [
      "Copy a full databricks.yml example out of the Databricks documentation and adapt its fields by hand each time the team starts a new project",
      "Ask a workspace administrator to create the bundle in the workspace UI, because bundles cannot be created locally",
      "Connect a remote Git repository to the workspace first, because databricks bundle init will not run without an existing repository",
      "Run databricks bundle init, pick one of the Databricks-provided default templates, and answer the prompts that generate the project files",
    ],
    correctIndex: 3,
    explanationEn: `The documented fast path to a first bundle project is a template. databricks bundle init presents the Databricks-provided default templates, asks a short series of questions to initialize project variables, and generates the project folder complete with databricks.yml and starter resource files. Bundles can also be created manually, but adapting an example copied out of the documentation field by field is slower and error-prone. bundle init runs entirely on the local machine, so bundles are not limited to the workspace UI, and it requires no Git repository — version control only becomes relevant when the project is later pushed and deployed.`,
    explanationPt: `O caminho documentado mais rápido para um primeiro bundle é um template. O databricks bundle init apresenta os templates padrão fornecidos pela Databricks, faz uma breve série de perguntas para inicializar as variáveis do projeto e gera a pasta do projeto completa, com o databricks.yml e os arquivos de recursos iniciais. Bundles também podem ser criados manualmente, mas adaptar campo a campo um exemplo copiado da documentação é mais lento e propenso a erro. O bundle init roda inteiramente na máquina local — bundles não se limitam à UI do workspace — e não exige repositório Git: o controle de versão só entra em cena quando o projeto é enviado e implantado depois.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-014",
    domainCode: 5,
    stem: `A team's CI pipeline deploys every open pull request as its own Automation Bundle target — pr_142, pr_143, and so on — creating a disposable copy of the pipeline's Lakeflow Job and notebooks in a shared dev workspace. Pull request 142 has just been merged, and the pipeline must clean up that PR's deployment completely, leaving no orphaned jobs, notebooks, or artifacts, without touching other pull requests' resources. What should the merge step run?`,
    options: [
      "Delete the shared dev workspace after every merge and let the next pull request deployment recreate everything inside it",
      "Run nothing in the merge step — the PR deployment's job cluster auto-terminates after its runs, removing the deployed resources with it",
      "Run databricks bundle destroy and accept its side effect of permanently deleting the bundle's source files and Git repository",
      "Run databricks bundle destroy -t pr_142, which deletes the job, files, and artifacts that this target's deployment created",
    ],
    correctIndex: 3,
    explanationEn: `A bundle's identity is the combination of bundle name, target, and workspace, so databricks bundle destroy -t pr_142 deletes exactly the resources that target deployed: the PR's job, its uploaded notebooks and files, and its artifacts. The command prompts for confirmation and supports --auto-approve for non-interactive CI use, while every other target's resources in the shared workspace stay untouched. Cluster auto-termination only reclaims compute; it never removes deployed jobs or artifacts, so doing nothing leaves orphans behind. destroy also never deletes the bundle's source files or any Git repository — it reclaims deployed workspace resources only — and deleting an entire workspace to retire one PR is destructive overkill.`,
    explanationPt: `A identidade de um bundle é a combinação de nome do bundle, target e workspace; por isso o databricks bundle destroy -t pr_142 apaga exatamente os recursos implantados por aquele target: o job do PR, seus notebooks e arquivos enviados e seus artefatos. O comando pede confirmação e aceita --auto-approve para uso não interativo em CI, enquanto os recursos dos demais targets no workspace compartilhado ficam intactos. A auto-terminação de clusters só recupera compute; nunca remove jobs ou artefatos implantados, então não fazer nada deixa órfãos para trás. O destroy também jamais apaga os arquivos-fonte do bundle nem repositório Git — ele recupera apenas os recursos implantados no workspace — e deletar um workspace inteiro para aposentar um PR é um exagero destrutivo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-015",
    domainCode: 5,
    stem: `A team deploys one Automation Bundle to dev and prod targets. In dev only, the group data_team must hold CAN_MANAGE_RUN on the bundle's Lakeflow Job so members can trigger and monitor runs; in prod the group must receive nothing. The team wants the grant applied automatically on every deploy and reviewed in Git like the rest of the configuration. How should this be set up?`,
    options: [
      "Add a permissions entry granting data_team the CAN_MANAGE_RUN level on the job resource within the dev target of the bundle",
      "Have an administrator grant CAN_MANAGE_RUN to data_team from the job's Permissions tab in the dev workspace UI after every deploy",
      "Make data_team a workspace admin in the dev workspace so its members can run every job there without bundle changes",
      "Skip permissions in the bundle, because bundle permissions mappings can only grant view-level access such as CAN_VIEW",
    ],
    correctIndex: 0,
    explanationEn: `Automation Bundle configuration supports permissions mappings, both at the top level and per resource inside a target, each entry naming a user, group, or service principal and a permission level. Adding data_team with the CAN_MANAGE_RUN level to the job resource within the dev target applies the grant on every deploy of that target and keeps it versioned in Git next to the code, while prod remains untouched. Manual grants from the workspace Permissions tab live outside Git: they skip code review and drift whenever someone forgets to repeat them. Workspace admin is far more access than running one job requires, and the permissions mapping is not view-only — job resources accept run and manage levels such as CAN_MANAGE_RUN and CAN_MANAGE.`,
    explanationPt: `A configuração de Automation Bundles suporta mapeamentos permissions, tanto no nível raiz quanto por recurso dentro de um target, e cada entrada nomeia um usuário, grupo ou service principal e um nível de permissão. Adicionar data_team com o nível CAN_MANAGE_RUN ao recurso do job dentro do target dev aplica o grant em cada deploy daquele target e o mantém versionado no Git junto com o código, enquanto o prod permanece intocado. Grants manuais pela aba Permissions do workspace vivem fora do Git: não passam por code review e sofrem drift sempre que alguém esquece de repeti-los. Workspace admin é muito mais acesso do que executar um job exige, e o mapeamento permissions não é somente leitura — recursos de job aceitam níveis como CAN_MANAGE_RUN e CAN_MANAGE.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-016",
    domainCode: 5,
    stem: `A team's Automation Bundle has grown into a single 600-line databricks.yml: two Lakeflow Jobs, one pipeline, and per-environment overrides for dev, test, and prod all live in one file that reviewers struggle to read. The engineers want resource definitions in their own files, with each target spelling out only what differs from the root definitions. How should the bundle be restructured?`,
    options: [
      "Keep everything in one databricks.yml, because the bundle specification recommends keeping all resource definitions and targets together in a single configuration file",
      "Move the job and pipeline definitions into resource files listed in the include mapping; targets inherit root definitions and override only what changes",
      "Create a separate bundle per environment, duplicating the job and pipeline definitions in each one to keep the files short",
      "Give up on splitting the file: a bundle cannot reference other files, so the single databricks.yml must simply be reorganized internally",
    ],
    correctIndex: 1,
    explanationEn: `databricks.yml is the one required configuration file, but it can reference other files through the include mapping, and Databricks explicitly recommends splitting a growing bundle this way for modularization and reuse: job and pipeline definitions go into their own resource files, and target definitions can move into separate files as well. Targets inherit the top-level resources and override only the settings that differ per environment, so anything not restated falls back to the root definition. A monolithic file is therefore not the recommended layout, and one duplicated bundle per environment recreates exactly the drift and copy-paste divergence that bundles are meant to eliminate. Includes are fully supported.`,
    explanationPt: `O databricks.yml é o único arquivo de configuração obrigatório, mas pode referenciar outros arquivos pelo mapeamento include, e a Databricks recomenda explicitamente dividir assim um bundle que cresceu, para modularização e reuso: as definições de jobs e pipelines vão para seus próprios arquivos de recursos, e os targets também podem morar em arquivos separados. Os targets herdam os recursos do nível raiz e sobrescrevem apenas o que difere por ambiente — tudo que não é redeclarado cai de volta na definição raiz. Um arquivo monolítico, portanto, não é o layout recomendado, e um bundle duplicado por ambiente recria exatamente o drift e a divergência de copiar e colar que os bundles existem para eliminar. Includes são totalmente suportados.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-017",
    domainCode: 5,
    stem: `A nightly GitHub Actions workflow authenticates as the service principal ci-deployer and runs databricks bundle deploy -t prod, creating and updating the team's Lakeflow Jobs and pipelines in the production workspace. Security policy requires machine identities to hold the narrowest access that still lets the pipeline deploy successfully. Which privilege assignment satisfies the policy?`,
    options: [
      "Make ci-deployer an account admin, so the nightly deploy can never fail because of a missing permission",
      "Rely on inheritance: a service principal automatically holds the permissions of the engineer who authored the bundle",
      "Grant ci-deployer only what the deployment needs: privileges to create and manage its jobs and pipelines, plus required catalog and schema access",
      "Assign no privileges at all, because bundle deployments run under the workspace identity rather than the signed-in principal",
    ],
    correctIndex: 2,
    explanationEn: `Databricks best practice is a dedicated deployment service principal with minimal access: it should hold only the privileges the deployment itself needs — creating and updating the jobs and pipelines the bundle defines, plus any Unity Catalog access those steps require, such as USE CATALOG or CREATE SCHEMA — and nothing broader. Making an automation identity an account admin violates least privilege and turns every leaked workflow credential into a workspace- and account-wide blast radius. Service principals inherit nothing from the bundle's author; their rights must be granted to the principal itself. And deploys do not run under an anonymous workspace identity: the CLI authenticates as ci-deployer, so with no privileges the deployment simply fails.`,
    explanationPt: `A boa prática da Databricks é um service principal dedicado para deploy, com acesso mínimo: ele deve ter apenas os privilégios que o próprio deploy exige — criar e atualizar os jobs e pipelines que o bundle define, mais qualquer acesso ao Unity Catalog que essas etapas requeiram, como USE CATALOG ou CREATE SCHEMA — e nada mais amplo. Tornar uma identidade de automação account admin viola o privilégio mínimo e transforma qualquer credencial de workflow vazada em um raio de explosão do workspace e da conta. Service principals não herdam nada do autor do bundle; os direitos precisam ser concedidos ao próprio principal. E deploys não rodam sob uma identidade anônima do workspace: a CLI autentica como ci-deployer, então sem privilégios o deployment simplesmente falha.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S5-018",
    domainCode: 5,
    stem: `A data engineer fixes a null-handling bug in the silver_orders notebook inside the team's Git folder, which is cloned from the team's remote repository and has the feature/null-fix branch checked out. They finish the edit and must send the change to the remote repository so a teammate can review it, without leaving the Databricks workspace. What should the engineer do?`,
    options: [
      "Open the Git dialog, review the highlighted changes, add a commit message, and click Commit & Push to send the branch to the remote",
      "Push the change with Git on a local machine, because the workspace UI can edit notebooks but cannot push commits",
      "Save the notebook and wait: the Git folder commits every change automatically and pushes it to the checked-out branch",
      "Use the Git dialog only to browse the branch history, because it shows past commits but cannot create new ones",
    ],
    correctIndex: 0,
    explanationEn: `The Git dialog is the workspace UI for Git operations in a Git folder. It highlights changed notebooks and files, lets the engineer visually compare the diff before committing, requires a commit message, and its Commit & Push action commits the work to the working branch and pushes it to the remote repository — all without leaving the workspace. Saving a notebook never creates a commit by itself: commits are explicit actions that always require a message. The dialog is not a history-only view either — it also creates branches, pulls changes, and resolves merge conflicts. Using a local terminal is possible but unnecessary here, because this workspace-integrated Git workflow is exactly what Git folders provide.`,
    explanationPt: `O Git dialog é a interface do workspace para operações Git em um Git folder. Ele destaca os notebooks e arquivos alterados, permite comparar visualmente o diff antes de commitar, exige uma mensagem de commit e, com a ação Commit & Push, faz o commit no branch de trabalho e envia o push ao repositório remoto — tudo sem sair do workspace. Salvar um notebook sozinho nunca cria commit: commits são ações explícitas que sempre exigem mensagem. O dialog também não é uma visão apenas de histórico — ele cria branches, faz pull de mudanças e resolve conflitos de merge. Usar um terminal local é possível, mas desnecessário aqui, pois esse fluxo Git integrado ao workspace é exatamente o que os Git folders oferecem.`,
    referenceUrl: "https://docs.databricks.com/aws/en/repos/git-operations-with-repos",
    referenceTitle: "Git operations with Git folders — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-019",
    domainCode: 5,
    stem: `A data engineer uses the Databricks CLI on a laptop that runs commands against both the team's development workspace and the production workspace. They are tired of re-typing credentials and want a fast, explicit way to choose which workspace a command targets. How should the engineer configure the CLI?`,
    options: [
      "Rely on the browser session signed in to the workspace, since the CLI can only reach that one workspace",
      "Add a named configuration profile per workspace to ~/.databrickscfg and select it with --profile or -p",
      "Accept a single host per machine, because the CLI supports only one workspace URL in its configuration",
      "Avoid environment variables entirely, because DATABRICKS_HOST and DATABRICKS_TOKEN are not recognized by the CLI",
    ],
    correctIndex: 1,
    explanationEn: `The Databricks CLI reads its settings from named configuration profiles in the ~/.databrickscfg file, and any command can select one with the --profile or -p flag — the documentation uses exactly this DEV/PROD profile pattern for switching between development and production workspaces. Environment variables such as DATABRICKS_HOST and DATABRICKS_TOKEN are a fully supported alternative and sit in the CLI's authentication order of evaluation, so they are anything but ignored. The CLI never depends on a browser session: it is a local tool that calls the REST API directly. And one machine can hold any number of profiles, each pointing at a different workspace host, so a single-host limit does not exist.`,
    explanationPt: `A Databricks CLI lê suas configurações de perfis nomeados no arquivo ~/.databrickscfg, e qualquer comando seleciona um deles com a flag --profile ou -p — a documentação usa exatamente esse padrão de perfis DEV/PROD para alternar entre workspaces de desenvolvimento e produção. Variáveis de ambiente como DATABRICKS_HOST e DATABRICKS_TOKEN são uma alternativa totalmente suportada e fazem parte da ordem de avaliação de autenticação da CLI, portanto não são ignoradas. A CLI nunca depende de uma sessão de navegador: é uma ferramenta local que chama a REST API diretamente. E uma máquina pode ter quantos perfis quiser, cada um apontando para um workspace diferente, então o limite de um único host não existe.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/cli",
    referenceTitle: "Databricks CLI — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-020",
    domainCode: 5,
    stem: `A team's CI log shows this command completing successfully, with no target specified:

\`\`\`bash
databricks bundle validate
\`\`\`

A junior engineer expected the command to fail without -t and is surprised that the output mentions target dev. Why did the command validate the dev target?`,
    options: [
      "It validates all targets declared in the bundle configuration one after another in a single pass",
      "It errors out, because every bundle command requires an explicit --target option",
      "It uses the target marked default: true in the bundle configuration, which is dev here",
      "It always validates the production target first, because that is the safest default",
    ],
    correctIndex: 2,
    explanationEn: `When a bundle command such as validate runs without -t or --target, the CLI uses the target declared with default: true in the bundle configuration files. In the documented examples it is the dev target that carries default: true, which is exactly why the log shows dev being validated with no error — the deployer can even skip -t dev for that reason. The command never sweeps through every declared target in one pass, and it does not fail for lack of a target, because the declared default makes one unnecessary. It also does not silently pick prod: safety plays no role in target selection; only the default flag in the YAML does.`,
    explanationPt: `Quando um comando de bundle como o validate roda sem -t ou --target, a CLI usa o target declarado com default: true nos arquivos de configuração do bundle. Nos exemplos da documentação, é o target dev que carrega default: true — exatamente por isso o log mostra o dev sendo validado sem erro; por esse motivo, inclusive, dá para omitir o -t dev. O comando nunca varre todos os targets declarados de uma vez nem falha por falta de target, pois o default declarado torna isso desnecessário. Ele também não escolhe prod por segurança: a seleção depende apenas da flag default no YAML.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-021",
    domainCode: 5,
    stem: `A team's Automation Bundle defines one Lakeflow Job and its notebooks. The team promotes releases through development, staging, and production workspaces and must guarantee that the exact code revision that passed staging tests is what runs in production. Which promotion approach provides that guarantee?`,
    options: [
      "Keep a separate branch per environment, so each workspace always deploys its own copy of the code",
      "Merge the development branch straight into the production branch whenever a release is due",
      "Deploy staging's workspace files to production by copying the tested folders in the workspace UI",
      "Deploy the same bundle commit to each target in turn; only target-level variables and overrides differ between environments",
    ],
    correctIndex: 3,
    explanationEn: `Bundles are promoted by deploying the same committed bundle code to each target in sequence — dev, then test, then prod — with per-environment differences expressed only as target-level variables and overrides. That is what makes the guarantee work: the definitions that passed staging are the ones that reach production because they come from the same commit, and production mode can even validate that deploys run from the expected Git branch. A branch per environment lets the code drift apart, so staging results stop proving anything about production. Merging development straight into production skips the tested path entirely. Copying folders between workspaces is not a promotion mechanism at all: it desynchronizes the deployed resources from the bundle and from Git.`,
    explanationPt: `Bundles são promovidos implantando o mesmo código commitado do bundle em cada target em sequência — dev, depois test, depois prod — com as diferenças por ambiente expressas apenas em variáveis e overrides do nível do target. É isso que faz a garantia funcionar: as definições que passaram pelo staging são as mesmas que chegam à produção porque vêm do mesmo commit, e o production mode inclusive valida que os deploys rodam a partir do branch Git esperado. Um branch por ambiente deixa o código divergir, então o resultado do staging deixa de provar algo sobre a produção. Mergear development direto em production pula completamente o caminho testado. Copiar pastas entre workspaces não é mecanismo de promoção: dessincroniza os recursos implantados do bundle e do Git.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-022",
    domainCode: 5,
    stem: `A company's data platform runs on Bitbucket, and the platform lead wants to manage pipeline notebooks in Databricks Git folders connected to the company's Bitbucket repositories. Before planning the rollout, the lead asks which Git providers Git folders support. What is the correct answer?`,
    options: [
      "GitHub, GitLab, Azure DevOps (Azure Repos), Bitbucket Cloud, and Bitbucket Server and Data Center are all supported",
      "Only GitHub repositories can be connected, so the team must mirror its Bitbucket repositories to GitHub",
      "GitLab and Bitbucket require a third-party connector purchased from a Databricks partner",
      "Any Git hosting service works with no restrictions, including self-hosted servers on any network",
    ],
    correctIndex: 0,
    explanationEn: `Git folders integrate natively with a documented list of providers. On the cloud side that includes GitHub (including the GitHub Enterprise offerings), GitLab and GitLab Enterprise Edition, Atlassian Bitbucket Cloud, Microsoft Azure DevOps (Azure Repos), and AWS CodeCommit; on-premises support covers Bitbucket Server and Data Center, GitHub Enterprise Server, GitLab Self-Managed, and Azure DevOps Server. So Bitbucket works out of the box, GitLab needs no partner connector, and GitHub is far from the only option. The no-restrictions claim is also wrong: providers outside the supported list are at best an unguaranteed fallback, and self-managed servers can additionally require URL allowlisting or a proxy for connectivity.`,
    explanationPt: `Os Git folders integram nativamente com uma lista documentada de provedores. No lado cloud, isso inclui GitHub (incluindo as ofertas GitHub Enterprise), GitLab e GitLab Enterprise Edition, Atlassian Bitbucket Cloud, Microsoft Azure DevOps (Azure Repos) e AWS CodeCommit; o suporte on-premises cobre Bitbucket Server e Data Center, GitHub Enterprise Server, GitLab Self-Managed e Azure DevOps Server. Ou seja, o Bitbucket funciona nativamente, o GitLab não exige conector de parceiro e o GitHub está longe de ser a única opção. A alegação de ausência de restrições também está errada: provedores fora da lista são, na melhor das hipóteses, um fallback sem garantia, e servidores self-managed podem exigir ainda allowlist de URLs ou um proxy de conectividade.`,
    referenceUrl: "https://docs.databricks.com/aws/en/repos/git-folders-concepts",
    referenceTitle: "Git folders concepts — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-023",
    domainCode: 5,
    stem: `A team deploys one Automation Bundle to three targets: dev, test, and prod. Each target is a different Databricks workspace, and the team must keep each environment's deployed files and state separate so deployments never collide. Where should the per-environment workspace host and paths be defined?`,
    options: [
      "In fixed global paths that every target shares, because one bundle uses one workspace location",
      "In three separate bundles, one per environment, each shipping its own folder layout",
      "In each target's workspace mapping, declaring that environment's host together with root_path and artifact_path",
      "Nowhere: the workspace is chosen by whichever configuration profile happens to be active in the deployer's terminal",
    ],
    correctIndex: 2,
    explanationEn: `The workspace mapping is overridable per target, so each environment's target can declare its own host together with root_path and artifact_path (and related paths such as state_path). That pins every deployment to its own workspace and its own bundle directory tree, which is what keeps files, artifacts, and deployment state from colliding across dev, test, and prod. The paths are not fixed globally, and one bundle per environment is exactly the copy-paste duplication that bundles exist to avoid. Relying on the deployer's active terminal profile makes the destination depend on who runs the deploy — the documentation recommends declaring host in the target precisely for portability and predictability.`,
    explanationPt: `O mapeamento workspace é sobrescrevível por target, então o target de cada ambiente pode declarar seu próprio host junto com root_path e artifact_path (e caminhos correlatos, como o state_path). Isso prende cada deployment ao seu workspace e à sua própria árvore de diretórios do bundle — é o que impede a colisão de arquivos, artefatos e estado de deployment entre dev, test e prod. Os caminhos não são fixos globalmente, e um bundle por ambiente é exatamente a duplicação de copiar e colar que os bundles existem para evitar. Depender do profile ativo no terminal de quem faz o deploy faz o destino variar conforme a pessoa que executa — a documentação recomenda declarar host no target justamente por portabilidade e previsibilidade.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S5-024",
    domainCode: 5,
    stem: `An Automation Bundle deploys a Lakeflow Job whose Python task must call an external API with a bearer token. Security policy forbids the token from appearing in any versioned file or in the deployed job's visible configuration. The bundle files live in Git. How should the task get the token?`,
    options: [
      "Declare a bundle variable for the token and pass its value with --var each time the pipeline deploys",
      "Point a task environment variable at a secret scope with a reference like {{secrets/scope/key}}, resolved at run time",
      "Commit a placeholder string in the YAML and have the CI pipeline rewrite the file with sed right before the deploy step runs",
      "Keep the token directly in the YAML, since the team's Git repository is private to the platform group",
    ],
    correctIndex: 1,
    explanationEn: `Databricks secrets are the documented home for sensitive values: the token is stored in a workspace secret scope, and the task references it with the {{secrets/<scope>/<key>}} syntax — for example in an environment variable or a Spark configuration property — so the value is resolved when the job runs and never appears in the YAML, in Git, or in the deployed definition. A bundle variable supplied through --var is a real mechanism, but its value is materialized into the deployed job configuration at deploy time, where it is readable without secret redaction, which the policy forbids. Rewriting the YAML with sed makes the token transit the pipeline's files and logs. And a private repository is no protection: the history retains the token and every clone holder can read it.`,
    explanationPt: `Os Databricks secrets são o local documentado para valores sensíveis: o token fica armazenado em um secret scope do workspace e a tarefa o referencia pela sintaxe {{secrets/<scope>/<key>}} — por exemplo em uma variável de ambiente ou em uma propriedade de configuração do Spark — de modo que o valor é resolvido quando o job roda e nunca aparece no YAML, no Git nem na definição implantada. Uma variável de bundle alimentada via --var é um mecanismo real, mas seu valor é materializado na configuração do job implantado no momento do deploy, onde pode ser lido sem a redação de secrets — o que a política proíbe. Reescrever o YAML com sed faz o token transitar por arquivos e logs do pipeline. E repositório privado não protege: o histórico retém o token e qualquer pessoa com um clone consegue lê-lo.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-025",
    domainCode: 5,
    stem: `A company keeps all of its data products in one large monorepo. The orders team only needs the /products/orders directory — its notebooks and job definitions — available in a Databricks Git folder, not the entire repository. How should the team create the Git folder?`,
    options: [
      "Create it normally: a Git folder always clones the full repository, and unused directories must simply be ignored",
      "Tell the team that monorepos are not supported and the product must move to its own repository",
      "Maintain a mirror repository that contains only the orders product, and connect the Git folder to the mirror",
      "Enable sparse checkout when creating it and set the cone pattern to /products/orders, cloning only that subset",
    ],
    correctIndex: 3,
    explanationEn: `When a Git folder is created, the Create Git folder dialog offers a sparse checkout mode: a client-side setting that clones only a subset of the repository's directories using a cone pattern — useful for monorepos and also the remedy when a repository nears Git folders' size limits. Setting the cone pattern to /products/orders brings just that directory into the workspace, and the pattern stays editable later under Settings > Advanced > Cone patterns. A full clone is therefore not forced, monorepos are explicitly supported, and maintaining a mirror repository is redundant hand-rolled work for a capability the product provides natively.`,
    explanationPt: `Ao criar um Git folder, o diálogo Create Git folder oferece o sparse checkout mode: um ajuste do lado cliente que clona apenas um subconjunto dos diretórios do repositório usando um cone pattern — útil para monorepos e também o recurso indicado quando um repositório se aproxima dos limites de tamanho dos Git folders. Definir o cone pattern como /products/orders traz somente esse diretório para o workspace, e o padrão continua editável depois em Settings > Advanced > Cone patterns. Um clone completo, portanto, não é obrigatório, monorepos são explicitamente suportados e manter um repositório espelho é trabalho manual redundante para uma capacidade que o produto oferece nativamente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/repos/git-folders-concepts",
    referenceTitle: "Git folders concepts — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-026",
    domainCode: 5,
    stem: `While developing ingestion notebooks locally in an IDE, a data engineer wants their local project folder and a folder in the Databricks workspace to stay in step as files change, and asks whether the CLI's sync command keeps both sides identical. What does databricks sync actually do?`,
    options: [
      "It synchronizes one way, local directory to workspace folder; edits made in the workspace never flow back",
      "It synchronizes in both directions, keeping the local project folder and the workspace folder identical at all times",
      "It replaces Automation Bundle deployments, pushing project files straight into production workspaces",
      "It copies local files into DBFS paths such as dbfs:/tmp, since it cannot write to workspace folders",
    ],
    correctIndex: 0,
    explanationEn: `The sync command group performs one-way synchronization of file changes from a local directory to a folder in the remote workspace — the documentation states plainly that it cannot synchronize changes from a workspace folder back to the local machine. It is a development convenience, with --watch available for continuous syncing, not a deployment mechanism: it moves files but creates no jobs or pipelines, so it cannot replace Automation Bundle deployments. It also writes only to workspace user files under /Users; it cannot target DBFS paths, which require a different utility. Keeping both sides automatically identical is simply not what this command does.`,
    explanationPt: `O grupo de comandos sync faz sincronização unidirecional das mudanças de arquivos de um diretório local para uma pasta no workspace remoto — a documentação afirma com todas as letras que ele não consegue sincronizar mudanças de uma pasta do workspace de volta para a máquina local. É um recurso de conveniência para desenvolvimento, com --watch para sincronização contínua, e não um mecanismo de deployment: ele move arquivos, mas não cria jobs nem pipelines, então não substitui deploys com Automation Bundles. Ele também grava apenas em arquivos de usuário do workspace sob /Users; não alcança caminhos DBFS, que exigem outro utilitário. Manter os dois lados automaticamente idênticos simplesmente não é o que esse comando faz.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/cli",
    referenceTitle: "Databricks CLI — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-027",
    domainCode: 5,
    stem: `A new data engineer has only seen the Databricks CLI used to deploy Automation Bundles and assumes that bundles are all it is for. The team lead wants to correct this with an accurate description of what the CLI covers. Which description is accurate?`,
    options: [
      "The CLI is a bundle-only tool: it validates, deploys, and runs Automation Bundles and nothing else",
      "The CLI runs exclusively inside the Databricks workspace and cannot be installed on a laptop",
      "The CLI wraps the platform's REST APIs, managing clusters, jobs, pipelines, files, permissions, and more",
      "The workspace UI can do everything the CLI does just as conveniently, so the CLI adds no real capability for teams",
    ],
    correctIndex: 2,
    explanationEn: `The Databricks CLI is a general-purpose client that wraps the Databricks REST APIs, which expose endpoints for modifying or requesting information about account and workspace objects: command groups cover clusters, jobs, pipelines, workspace file export and import, permissions, secrets, and more, from a local terminal or automation scripts — bundles are just one part of it. It installs on a laptop and runs from CI just as well; it does not live inside the workspace, although a web terminal can host it too. And the UI is not an equivalent substitute: point-and-click actions cannot be captured in scripts, pipelines, or version-controlled automation the way CLI commands can.`,
    explanationPt: `A Databricks CLI é um cliente de propósito geral que envolve as REST APIs da Databricks, que expõem endpoints para modificar ou consultar objetos da conta e do workspace: os grupos de comandos cobrem clusters, jobs, pipelines, exportação e importação de arquivos do workspace, permissions, secrets e mais, do terminal local ou de scripts de automação — bundles são apenas uma parte disso. Ela se instala num laptop e roda igualmente bem a partir de CI; não vive dentro do workspace, embora um web terminal também possa hospedá-la. E a UI não é um substituto equivalente: ações de apontar e clicar não podem ser capturadas em scripts, pipelines ou automação versionada como os comandos da CLI podem.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/cli",
    referenceTitle: "Databricks CLI — Databricks Docs",
    difficulty: "EASY",
  },
  {
    key: "S5-028",
    domainCode: 5,
    stem: `A team's Automation Bundle defines a Lakeflow Job whose notebook task references a project file, notebook_path: ../src/ingest.py. The bundle deploys to the dev target for the first time, and an engineer asks where ingest.py ends up so they can trace what the job actually runs. Where do the bundle's files go at deploy time?`,
    options: [
      "The job reads the file straight from the Git provider at run time, so no copy ever lands in the workspace",
      "The deploy uploads the files into the target workspace's bundle paths, and the deployed job points at those copies",
      "The files stay on the engineer's machine, and the job fetches them from there whenever it runs",
      "The deploy creates a Git folder in the target workspace that holds the project's files for the deployed job to pull from",
    ],
    correctIndex: 1,
    explanationEn: `A bundle deploy uploads the project's files into the target workspace under the bundle's own workspace paths — root_path, with the files and build artifacts under file_path and artifact_path; in the tutorial's flow the deployed notebook lands under .bundle/<project>/<target>/files. The deployed job's task then points at that uploaded workspace copy, which is what actually runs. The files do not remain only on the laptop: workspace compute cannot reach a developer's machine. Jobs that pull task code straight from a Git provider are a different setup, not what a deploy of local bundle project files does; and deploys upload files to the bundle's paths rather than creating a Git folder in the workspace.`,
    explanationPt: `O deploy de um bundle faz upload dos arquivos do projeto para o workspace do target, sob os próprios caminhos de workspace do bundle — o root_path, com os arquivos e artefatos de build sob file_path e artifact_path; no fluxo do tutorial, o notebook implantado fica sob .bundle/<project>/<target>/files. A tarefa do job implantado aponta então para essa cópia enviada no workspace, e é ela que roda de fato. Os arquivos não ficam apenas no laptop: o compute do workspace não alcança a máquina de um desenvolvedor. Jobs que puxam o código da tarefa direto de um provedor Git são outra configuração, não o que um deploy de arquivos locais do bundle faz; e deploys enviam os arquivos para os caminhos do bundle, e não para um Git folder criado no workspace.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S5-029",
    domainCode: 5,
    stem: `Minutes after a routine deploy of the prod target, dashboards show that a change in the release broke a downstream metric. The team must restore production to the last-known-good version of the bundle quickly and cleanly. What should they do?`,
    options: [
      "Run databricks bundle rollback -t prod to restore the previous deployment automatically",
      "Delete the affected jobs and pipelines in the production workspace and let the owning teams rebuild them by hand",
      "Select the last-known-good deployment from the versions the bundle keeps in the workspace and re-apply it",
      "Revert the bad commit in Git and redeploy prod; the bundle then overwrites the resources with the restored code",
    ],
    correctIndex: 3,
    explanationEn: `Bundles have no rollback command: the CLI offers init, validate, deploy, run, destroy, and related commands — nothing that restores a previous deployment. The documented recovery path runs through Git: revert the commit that introduced the regression, then deploy the prod target again, and the deploy overwrites the deployed resources with the restored code, keeping the workspace consistent with the bundle. Manually deleting jobs and pipelines in the UI leaves the environment half-configured and outside bundle management, and bundles do not keep a menu of previously deployed versions to re-apply — the version history that matters is the one in the repository, which is exactly what redeploying from the reverted commit uses.`,
    explanationPt: `Bundles não têm comando de rollback: a CLI oferece init, validate, deploy, run, destroy e comandos correlatos — nada que restaure um deployment anterior. O caminho de recuperação documentado passa pelo Git: reverta o commit que introduziu a regressão e faça o deploy do target prod de novo; o deploy sobrescreve os recursos implantados com o código restaurado, mantendo o workspace consistente com o bundle. Apagar jobs e pipelines manualmente na UI deixa o ambiente meia-configurado e fora da gestão do bundle, e bundles não mantêm um menu de versões implantadas para reaplicar — o histórico de versões que importa é o do repositório, que é exatamente o que o redeploy a partir do commit revertido utiliza.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "MEDIUM",
  },
  {
    key: "S5-030",
    domainCode: 5,
    stem: `One bundle serves several CI pipelines, and each runner needs a slightly different value for the same setting — for example, the catalog prefix the deployed pipeline writes to. The team wants to keep a single databricks.yml and avoid per-pipeline copies of the configuration. How can the differing values be supplied?`,
    options: [
      "Declare the differing values as bundle variables and supply each runner's values through BUNDLE_VAR_-prefixed environment variables",
      "Hardcode every value, because bundle configuration files cannot read anything from the environment",
      "Generate a different databricks.yml for each pipeline, with each runner's value written into its own file",
      "Use environment variables only to choose the workspace host, because that is the only setting they can affect",
    ],
    correctIndex: 0,
    explanationEn: `Bundle variables are deployment-time values, interpreted when the bundle is validated and deployed. The team declares the differing settings as variables, and each machine or CI runner supplies its values through environment variables whose names start with BUNDLE_VAR_ — or with --var on the command — so one YAML file serves many environments. Environment input is therefore fully supported, and it applies to any declared variable, not only to the workspace host. Hand-writing a databricks.yml per pipeline recreates exactly the duplication and drift the team wants to avoid, and hardcoding values closes off the documented environment-driven path entirely.`,
    explanationPt: `As variáveis de bundle são valores de tempo de deployment, interpretadas quando o bundle é validado e implantado. O time declara os ajustes que diferem como variáveis, e cada máquina ou runner de CI fornece seus valores por meio de variáveis de ambiente cujos nomes começam com BUNDLE_VAR_ — ou com --var no comando — de modo que um único arquivo YAML atenda a vários ambientes. A entrada por variáveis de ambiente, portanto, é totalmente suportada e vale para qualquer variável declarada, não somente para o host do workspace. Escrever à mão um databricks.yml por pipeline recria exatamente a duplicação e o drift que o time quer evitar, e hardcodar valores fecha completamente o caminho documentado via ambiente.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/bundles/",
    referenceTitle: "What are Databricks Automation Bundles — Databricks Docs",
    difficulty: "HARD",
  },
  {
    key: "S5-031",
    domainCode: 5,
    stem: `A GitHub Actions runner runs Databricks CLI commands on every merge to main. DATABRICKS_HOST is already set to the workspace URL, the team has created the service principal ci-release with an OAuth secret, and the workflow must act as that service principal with no interactive sign-in. What must still be configured on the runner?`,
    options: [
      "A weekly calendar reminder for an engineer to run databricks auth login interactively on the runner",
      "The username and password of a platform engineer as workflow variables for the CLI to authenticate with",
      "The service principal's client ID and secret as DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET, so the CLI runs OAuth M2M",
      "A personal access token that belongs to a human administrator, because service principals cannot authenticate the Databricks CLI",
    ],
    correctIndex: 2,
    explanationEn: `OAuth machine-to-machine (M2M) authentication is the documented way for services and automation to use the Databricks CLI without interactive user sign-in: the service principal's client ID and OAuth secret are set as the DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET environment variables, and the CLI runs an OAuth client credential flow that authenticates it as ci-release, with DATABRICKS_HOST already supplying the workspace URL. Interactive auth login belongs to the user-to-machine flow: it is browser-based and its tokens expire in under an hour, which no weekly reminder can sustain on an unattended runner. The CLI has no username-and-password authentication type at all, and a human's personal access token would run the commands as that human, not as the service principal.`,
    explanationPt: `A autenticação OAuth machine-to-machine (M2M) é a forma documentada de serviços e automação usarem a Databricks CLI sem login interativo de usuário: o client ID e o OAuth secret do service principal são definidos como as variáveis de ambiente DATABRICKS_CLIENT_ID e DATABRICKS_CLIENT_SECRET, e a CLI executa um fluxo de credenciais de cliente OAuth que a autentica como ci-release, com o DATABRICKS_HOST já fornecendo a URL do workspace. O auth login interativo pertence ao fluxo user-to-machine: é baseado em navegador e seus tokens expiram em menos de uma hora, o que nenhum lembrete semanal sustenta num runner sem atendimento. A CLI não tem nenhum tipo de autenticação por usuário e senha, e um personal access token de uma pessoa faria os comandos rodarem como essa pessoa, não como o service principal.`,
    referenceUrl: "https://docs.databricks.com/aws/en/dev-tools/cli",
    referenceTitle: "Databricks CLI — Databricks Docs",
    difficulty: "HARD",
  },
];

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
];

# plan.md — autorizado, pendente, adiado e fora de escopo

## Autorizado (em curso)

- **v1.4.1** (lote fechado 2026-10-26, spec própria): os 4 ajustes de UI do
  fundador pós-comparação v1.3.1 × app antigo — pills preenchidas de domínio
  + dificuldade em estudo/revisão, fundo colorido sutil (mais discreto que o
  antigo) no certo/errado, bloco de explicação + fonte preenchido na cor do
  resultado, e tamanho de leitura do app antigo de volta (15/16px) no lugar
  da escala 20–32px do patch v1.1 §5.
- **Reparo de produção** (executado pelo GPT local do fundador, com receita do
  `../DEPLOY.md`): Vercel envs → `bun run build:vercel` → Neon
  `db:generate:prod` + `db:push:prod` + seed → redeploy → `/api/health` deve
  retornar `{"status":"ok","db":"ok","certifications":1,"questions":116}`.
- **Publicação da v1.4.1** após o reparo (bundle/patch/zip desta leva quando
  o fundador pedir).

## Fechado (entregue)

- **v1.4.0** (2026-10-26): patch de design v1.1 aplicado — raio 6/10/14/20 +
  sombras, explicação na revisão, barras de sessão presas, controles na
  barra, shuffle por tentativa, multi-cert com "em breve", % colorida por
  domínio. O contrato de fonte 20–32px foi depois revisto pelo fundador
  ("ainda gigante") e substituído por 15/16px na v1.4.1.

## Pendente (próximos passos naturais)

- V2 — flashcards.
- V2 — trilhas de estudo personalizadas.
- Novas certificações em produção (a UI "em breve" já lista: **AI-900**,
  **DP-900**, **PL-300**, **SC-900**, **AZ-104**) — arquitetura multi-cert
  pronta desde a v1.4.0 (`ranvier:cert`, seletor, progresso por cert por
  construção); entrar com blueprint + banco de questões próprio.
- Atualizar o dossiê da equipe de design (o guia Noos e o patch v1.1 ainda
  descrevem Ranvier como "Azure · AZ-900"; o app real é Databricks DBDEA —
  o patch v1.1 foi adaptado na aplicação).
- Avaliar traço do símbolo animado no carregamento (600–800ms, patch v1.1
  §14) — opcional, decisão do fundador.

## Notas técnicas ao modelo construtor (pedido do fundador 2026-10-26)

O designer marcou os feedbacks nº 2 e nº 5 como **[dados]** ("não se
resolvem com CSS"). Diagnóstico pós-auditoria e estado:

- **Nota A (explicação sumia após finalizar)** — o snapshot do servidor JÁ
  persistia explicação e fonte por questão (`ReviewQuestion` em
  `getAttemptDetail`); o defeito era apresentacional (a view de revisão não
  renderizava o bloco). **Corrigido em código na v1.4.0** (prop `ReviewState`
  no `QuestionCard`). Regra permanente: o DTO de resultado/revisão NUNCA pode
  descartar `explanation*` e `reference*`.
- **Nota B (gabarito por posição)** — o viés de tamanho já estava em 10%
  (v1.3.1); o resíduo era de POSIÇÃO (sem shuffle). **Corrigido em código na
  v1.4.0** (`src/lib/option-order.ts`): ordem embaralhada por tentativa com
  semente estável; o protocolo grava/corrige índice CANÔNICO e a UI traduz.
  Regra permanente: gabarito viaja por índice/ID canônico, nunca por posição
  exibida; quando as alternativas ganharem `optionId` no banco, trocar a
  semente de índice para ID mantendo a interface.

## Adiado (com motivo)

- **Pausar o simulado** (guia §"Pausar"): muda regra de negócio do exame
  cronometrado; exige spec própria com decisão do fundador sobre como o tempo
  pausado conta. Reabrir quando houver decisão.
- **Glossário bilíngue**: fora do escopo do patch de identidade; entra no V2.
- **Domínio canônico `noos.study`**: registrar e trocar o fallback dos
  deep-links (`NEXT_PUBLIC_NOOS_HUB_URL`).

## Dívidas conhecidas (impacto · motivo de aceitação · condição de reabertura)

1. **Material de divulgação do link (OG/social preview)** — pedido do fundador
   2026-10-25 ("criar material de divulgação que vai atrelado ao link do app,
   diferentes plataformas, aquela imagem que vai junto ao link").
   Impacto: compartilhar o link hoje não traz imagem/cartão de prévia
   (Open Graph/Twitter Card incompletos), o que reduz cliques e reconhecimento
   de marca. Motivo de aceitação: exige decisão de design (arte por plataforma,
   monograma + bilhete de exame), produção de imagem e metadados — não é
   mudança de uma linha; ficou registrado como dívida em vez de embarcar
   sem spec. Condição de reabertura: próxima rodada de design/lançamento
   (spec curta: og:image 1200×630, twitter:card summary_large_image, ícone
   Apple-touch, arte clara/escura, textos PT/EN, nenhuma métrica inventada).
2. **Campo extra `db:"ok"` no `/api/health`** (divergência literal do contrato
   documentado; superconjunto inofensivo) — documentado no DEPLOY.md.
3. **`noos.study` ainda não existe** (deep-links no fallback vercel.app).

## Fora de escopo (nunca)

- Dumps ou reprodução de itens reais de exame (NDA).
- Rastreamento de usuários ou login de terceiros (Google/Microsoft/GitHub).
- Anúncios durante estudo/simulado ativos; anúncios só config-gated.
- Vender dados ou progresso; ranking/streak/avatar/confete (anti-filosofia
  do patch §1).

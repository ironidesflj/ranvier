# current-state.md — estado verificado

Última atualização: **2026-10-27 · v1.6.0** (lote: transparência de
privacidade + performance de carregamento + prep.ts portátil; spec:
`spec-v1.6.0-privacy-performance.md`). Lote anterior: v1.5.1 = OG/social
preview (não publicada — embarcou na v1.6.0); v1.5.0 = Convergência Axon
(fatias 2, 3 e 4 sobre o pacote `@ironidesflj/axon`, publicada). Lotes mais
antigos: v1.3.x = identidade visual; v1.4.0 = patch de design v1.1; v1.4.1 =
4 ajustes de UI do fundador.

## Versão e artefatos

- App: **v1.6.0** (`src/lib/version.ts` = fonte única; `package.json`,
  `public/sw.js`, `public/offline.html` no mesmo lote).
- Banco: 300 questões (S1=19, S2=59, S3=69, S4=43, S5=31, S6=33, S7=46),
  1 certificação (Databricks Data Engineer Associate, blueprint May/2026),
  IDs públicas congeladas RAN-DBDEA-00001..00300, 6 simulados disjuntos.
  **Sem mudanças de schema e de questões** na v1.5.0/v1.5.1/v1.6.0 (só
  contrato/versão/metadados/UI).
- PWA: manifest (tema papel #f7fbf9), sw.js stale-while-revalidate
  (`ranvier-v1.6.0`), offline.html, ícones com monograma R.
- Social preview (v1.5.1→v1.6.0): og:image 1200×630 "bilhete de exame"
  (`public/og/`, gerada por `bun run og`), twitter summary_large_image,
  canonical + og:locale pt_BR/en_US no `layout.tsx`.
- Privacidade no app (v1.6.0): seção "Privacidade e segurança" no Sobre (5
  fatos auditados) + reasseguro no modal de login com link para o Sobre.
- `/api/health`: `{"status":"ok","db":"ok","certifications":1,"questions":300}`
  confirmado em produção e no sandbox.

## Auditoria do banco — data_fixed_v2

- Pacote auditado em 27/10/2026: 116/116 gabaritos aprovados, 57/57
  referências oficiais válidas, IDs RAN-DBDEA-00001..00116 íntegros e zero
  achados críticos.
- Aplicadas as correções do pacote `data_fixed_v2.zip`: URLs canônicas de
  COPY INTO, funções Spark SQL e JDBC; normalização de metadados; e
  reequilíbrio das alternativas em 76 questões, sem alterar gabaritos,
  enunciados, explicações, referências ou dificuldades.
- A validação local confirmou 116 questões, 0 erros e 0 warnings (à época do
  pacote v2; a expansão para 300 questões foi entregue e publicada — ver
  "Verificado na expansão DBDEA v4" e produção `questions: 300`).

## Documentação pública sincronizada

- Regra permanente: toda atualização publicada do Ranvier deve manter o
  `README.md` e os metadados públicos **About** do GitHub alinhados com o estado
  atual do app, sempre em inglês. O README é a referência detalhada; o About é
  o resumo curto, com website e tópicos coerentes. Nenhuma versão é considerada
  documentalmente fechada sem revisar os dois.

## Consumidores do Axon

- `@ironidesflj/axon@0.2.1` linkado com pin exato (package.json + lockfile).
  **Fatias adotadas (v1.5.0, 2026-10-27):** 1 (link, inerte por desenho),
  2 (IDs na escrita — `generateId`/`validateId` com `reason` no log),
  3 (checksum canônico `computeChecksum` + `contentVersion` opcional no
  seed) e 4 (manifesto validado pelo parser do hub `parseManifest` +
  `verifyChecksum`, tolerância zero, no `ci.yml` e no `manifest.yml`).
  Fatia 5: formato de deep-link adotado (ID no rodapé + botão Comunidade +
  badge); flip para o domínio canônico pendente de env
  (`NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study`) na Vercel.
- Estado vivo do ecossistema: `docs/sdd/fatias-dossie.md` (instantâneo
  trazido pelo fundador, atualizado nesta adoção).

## Verificado na v1.6.0 (evidência no worklog Task 16)

- **Privacidade no app**: seção no Sobre com 5/5 pontos renderizados (EN e
  PT, DOM conferido) — só fatos auditados (hash scrypt ilegível, dados
  mínimos, zero terceiros/ads hoje, anônimo local-first, exclusão LGPD com
  cascade); reasseguro no modal de login + link que navega ao Sobre (`#/sobre`).
- **Performance**: **1 única chamada de catalog** na carga limpa (contada no
  log do servidor — antes eram 2, pt+en); `langReady` gate + staleTime 24h
  nos 4 consumidores; `/api/catalog` responde com
  `cache-control: public, s-maxage=300, stale-while-revalidate=86400`.
- **prep.ts portátil** (fix do fundador adotado e melhorado): raiz via
  `import.meta.dir`, banco canônico `src/data` (data_fixed não existe mais no
  repo), url_check.tsv opcional, expansion auto-criada; allowlist regenerada
  (76 URLs, preservação intacta) e **gate PASS strict depois da regeneração**.
- **Popup v1.6.0** (3 itens — OG + privacidade + velocidade), PT/EN, 1× por
  versão (localStorage `1.6.0`).
- Incidente sandbox: SQLite local zerado às 16:18 (fora do lote; nenhuma
  operação do lote toca DB) → reseed idempotente → health 300 → POST
  attempts 201 → simulado re-verificado. Produção (Neon) intocada.
- QA navegador: simulado "Questão 1 de 45" (`#/simulado/{id}`), mobile 375
  sem overflow, zero erros de console/página; lint 0 · tsc 0 ·
  validate:manifest 300/0/0 · validate:questions 300 · ci:gate --strict
  PASS · red team 17/17.

## Verificado na v1.5.1 (evidência no worklog Task 14)

- **v1.5.0 publicada pelo fundador**: GitHub + Vercel `READY`; produção
  conferida ao vivo — `/api/health` = `questions:300` e `/manifest.jsonl`
  byte-idêntico ao do sandbox (300 linhas, checksums canônicos, linha 1
  `sha256:95e20047…`); `validate:manifest` no sandbox = 300 válidas / 0
  rejeitadas / 0 divergentes sob o parser do hub.
- **OG/social preview** (dívida #1 fechada): arte clara + gêmea escura
  auditadas visualmente (VLM) — textos legíveis, tipografia de marca na
  renderização, sem sobreposição/corte; `<head>` servido com og:image
  absoluta (+width/height/alt), og:locale pt_BR + en_US, twitter card
  summary_large_image, canonical; `/og/og-image.png` 200 (image/png,
  72.396 bytes).
- **Popup v1.5.1** (1 item — cartão de prévia ao compartilhar), PT/EN, 1×
  por versão (localStorage `1.5.1`), não reaparece após reload.
- QA navegador: fluxo do simulado intacto (Questão 1 de 45, resposta, próxima,
  saída com confirmação), mobile 375 sem overflow, zero erros de
  console/página; lint 0 · tsc 0 · validate:manifest 300/0/0 ·
  validate:questions 300 · ci:gate --strict PASS.

## Verificado na v1.5.0 (evidência no worklog Task 13)

- **Checksums canônicos**: `public/manifest.jsonl` regenerado com
  `computeChecksum` do pacote (array canônico `[statement, options, answer,
  reference]`) — antes da correção, a auditoria provou 300/300 divergentes
  contra o contrato (algoritmo local serializava objeto). Validado:
  `parseManifest` 300 ok / 0 rejeitadas / 0 divergências; checksum linha 1 =
  `sha256:95e20047…`.
- **CI com o parser do hub**: `scripts/validate-manifest.ts` (novo) roda no
  `ci.yml` e no `manifest.yml`; o gerador se auto-valida antes de escrever
  (tolerância zero para quem publica). `schema.ts` zod local removido.
- **`version` do manifesto real**: campo opcional `contentVersion` no
  `SeedQuestion` (ausente = 1) — correção de typo em questão publicada bumpa
  o campo, a ID nunca muda.
- **Deep-link com guard**: `discussionUrl` valida a ID via `validateId`
  (constitution §3 — falha em render, não no clique do aluno).
- **v1.5.0 + popup** anunciando a expansão (300 questões, 6 simulados, ID
  pública estável), PT/EN, 1× por versão; README reescrito em inglês.
- QA navegador: popup EN+PT, estudo até graduado, ID no rodapé, Comunidade →
  `{base}/{lang}/q/{ID}`, badge → home, zero erros de console, 375 sem
  overflow; lint/tsc/validate/gate/red-team verdes.

## Verificado na v1.4.1 (mantido)

- **Fim da letra gigante**: pergunta e alternativas voltaram ao tamanho de
  leitura do app antigo — stem Newsreader 15px@<640 / 16px ≥640 (medido no
  navegador), alternativas 15/16px, min-h 54px, raio 10; aplica a simulado,
  estudo e revisão (a v1.4.0 usava 20/26/32px por breakpoint).
- **Pills preenchidas de domínio + dificuldade** no estudo e na revisão,
  logo abaixo da linha "QUESTÃO N/TOTAL" (fundo surface-2 medido
  rgb(238,244,241) no claro / rgb(24,32,32) no escuro); simulado segue
  chrome-less (v1.1 §10.1).
- **Certo/errado com fundo colorido sutil**: alternativa correta com
  preenchimento verde-suave + borda verde; escolha errada com vermelho-suave
  + borda; neutras ficam brancas com 60% de opacidade; tags textuais
  "correta"/"sua resposta" mantidas (cor nunca sozinha). Tokens
  `--noos-success-soft/-line` e `--noos-danger-soft/-line` (7–8% claro /
  12–13% escuro) — intencionalmente mais discretos que o antigo, como
  pedido.
- **Explicação + fonte em bloco preenchido**: no estudo (feedback) E na
  revisão pós-final, na cor do resultado (verde/vermelho suave), lead serif
  "Correta."/"A correta é D.", corpo sans, "Fonte oficial" em mono com
  link externo.
- Popup de novidades v1.4.1 com os 4 pontos (PT/EN), 1× por versão.
- QA navegador (desktop 1440 + mobile 375, claro e escuro, PT e EN):
  pills visíveis e preenchidas; cores corretas no acerto e no erro em ambos
  os temas; bloco de explicação com fonte na revisão; 16px/15px medidos;
  simulado sem pills; sem overflow horizontal no mobile; zero erros de
  console; lint/tsc limpos.

## Verificado na v1.4.0 (mantido)

- **Mix antigo × atual**: escala de raio por função (6/10/14/20) + sombras
  de repouso/flutuação — alternativas 10px, letra A–D 6px, bilhete e cards
  14px, sheet 20px; réguas e filetes retos.
- **Explicação na revisão restaurada** (nota A era apresentacional: o DTO já
  carregava explicação/fonte): 45/45 blocos com explicação + fonte na
  revisão do simulado, 10/10 na de estudo; sobrevive a reload.
- **Contrato da pergunta**: em 15px@375 / 16px ≥640 (v1.4.1; o patch v1.1
  §5 de 20–32px foi revisto pelo fundador — "ainda gigante" — a favor do
  tamanho de leitura do app antigo).
- **Barras de sessão presas** em exame (Início/confirmação, cert · modo,
  posição, relógio + dreno), estudo (Início → resumo, stats) e resultado
  (Início, laudo · cert, score, Topo) — Início sempre à mão.
- **Controles na barra** (TopBar em toda tela + landing): PT/EN, tema e
  Entrar/conta; Ajustes secundário (rail pé + sheet "Mais" no mobile com
  alvos 44px); "Continuar" no bilhete da landing.
- **Shuffle por tentativa** (`option-order.ts`): Fisher-Yates semeado por
  attemptId+questionId; protocolo canônico intacto; mapeamento conferido
  contra o banco (resposta/correta/graduada 100% consistentes); tentativas
  antigas continuam válidas.
- **Multi-cert**: `certSlug` ativo persistido (`ranvier:cert`), seletor na
  barra + "Trocar certificação" no bilhete, 5 certificações "em breve"
  (AI-900, DP-900, PL-300, SC-900, AZ-104) não clicáveis; troca com sessão
  em andamento pede confirmação (dormente).
- **Porcentagem colorida por domínio** no resultado (verde ≥ corte /
  vermelho < corte, barra acompanha) — pedido direto do fundador, divergência
  consciente do patch do design.
- Popup de novidades 1×/versão (1.4.0) com conteúdo PT/EN dos 7 pontos.
- QA navegador: 375/768/1440 sem overflow (1 bug de token longo corrigido no
  markdown `p`: `break-words`), zero erros de console, APIs 200/201, lint e
  tsc limpos, `validate:questions` OK.

## Verificado na v1.3.1 (mantido)

- Viés de tamanho nas alternativas: "correta é a mais longa" **12%
  (14/116)**; 0 flags LONG/SHORT; histórico preservado.
- "by Noos" no rodapé como link (decisão do fundador 2026-10-25); 1× por
  tela; topo sem assinatura.
- Seção "Como o Ranvier ajuda você" na landing (agora com raio 14 +
  sombra de repouso).
- Código nas questões quebra linha < 768px; componentes ReactMarkdown em
  constante de módulo (scroll preservado).
- Modo estudo exige ≥1 domínio; todos pré-marcados.

## Verificado na expansão DBDEA v4 (300 questões)

- Banco publicado como fonte canônica em `src/data`: 300 questões, registry
  completo `RAN-DBDEA-00001`–`RAN-DBDEA-00300` e 6 simulados disjuntos.
- Distribuição: S1 19, S2 59, S3 69, S4 43, S5 31, S6 33, S7 46.
- Gate estrito aprovado com 0 achados; red team aprovado em 17/17 mutações.
- Viés de alternativa correta mais longa: 18,3%, abaixo do limite de 40%.
- O CI executa validação, gate estrito e red team em todo push/PR.
- Após o deploy, o Neon precisa ser atualizado com `bun scripts/seed.ts`; a
  confirmação de saúde deve esperar `questions: 300`.

## Limitações conhecidas (honestas)

1. **Deploy exige conferência de saúde após cada alteração de infraestrutura**
   (incidente resolvido em 2026-10-24: a produção chegou a retornar 500 nas
   queries de DB). O procedimento permanente é executar `curl /api/health`
   após redeploy e confirmar `status: ok`, `db: ok`, `certifications: 1` e
   `questions: 300`; a receita de reparo permanece em `../DEPLOY.md` §4/§5/§11.
2. SW stale-while-revalidate: primeira visita offline sem cache prévio não tem
   catálogo (comportamento esperado do SWR; visitantes que já usaram o app
   têm cache).
3. Exame retomado conserva o deadline do servidor (correto para prova
   cronometrada).
4. Item "Revisão" do rail sem estado ativo (ação transitória — conhecido).
5. Deep-links usam o fallback `noos-hub.vercel.app` até o env
   `NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study` ser setado na Vercel (o hub
   canônico já está no ar; o flip acompanha a Fase 1 — primeiro manifesto
   commitado — para não acender link que 404).
6. Multi-cert com UMA certificação disponível: o seletor existe e a
   arquitetura está pronta, mas trocar de fato só será exercitável quando a
   segunda certificação entrar em produção (guarda de confirmação dormente).
7. "Em breve" é lista constante no cliente (`src/data/soon-certs.ts`) — quando
   uma certificação entra no banco, sai da lista manualmente (catálogo do
   servidor continua a fonte da verdade para as disponíveis).

## Onde estão as evidências

- `worklog.md` (registro vivo, Task IDs 0–16) — diffs, comandos, medições.
- `download/ranvier-v1.3.1.*` (bundle/patch/zip) — artefatos da leva anterior
  (cada leva gera os próprios artefatos quando o fundador pedir).
- `docs/sdd/fatias-dossie.md` — instantâneo do ecossistema Noos trazido pelo
  fundador (27/out/2026), atualizado nas adoções de fatia.

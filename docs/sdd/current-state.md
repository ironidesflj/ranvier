# current-state.md — estado verificado

Última atualização: **2026-10-26 · v1.4.1** (lote: os 4 ajustes de UI
pedidos pelo fundador comparando a v1.3.1 × app antigo — pills preenchidas,
fundo colorido sutil no certo/errado, bloco de explicação preenchido, fim
da letra gigante; spec: `spec-v1.4.1-founder-feedback.md`). Lotes
anteriores: v1.3.0 = identidade visual; v1.3.1 = 1º lote de feedback;
v1.4.0 = patch de design v1.1 sobre os 7 feedbacks.

## Versão e artefatos

- App: **v1.4.1** (`src/lib/version.ts` = fonte única; `package.json`,
  `public/sw.js`, `public/offline.html` no mesmo lote).
- Banco: 116 questões (S1=8, S2=24, S3=25, S4=18, S5=12, S6=12, S7=17),
  1 certificação (Databricks Data Engineer Associate, blueprint May/2026),
  IDs públicas congeladas RAN-DBDEA-00001..00116. **Sem mudanças de schema
  e de questões** neste lote (apenas apresentação).
- PWA: manifest (tema papel #f7fbf9), sw.js stale-while-revalidate
  (`ranvier-v1.4.1`), offline.html, ícones com monograma R.
- `/api/health`: `{"status":"ok","db":"ok","certifications":1,"questions":116}`
  confirmado em produção e no sandbox.

## Auditoria do banco — data_fixed_v2

- Pacote auditado em 27/10/2026: 116/116 gabaritos aprovados, 57/57
  referências oficiais válidas, IDs RAN-DBDEA-00001..00116 íntegros e zero
  achados críticos.
- Aplicadas as correções do pacote `data_fixed_v2.zip`: URLs canônicas de
  COPY INTO, funções Spark SQL e JDBC; normalização de metadados; e
  reequilíbrio das alternativas em 76 questões, sem alterar gabaritos,
  enunciados, explicações, referências ou dificuldades.
- A validação local confirmou 116 questões, 0 erros e 0 warnings. A expansão
  recomendada para aproximadamente 300 questões é roadmap, não bloqueio da
  versão atual.

## Documentação pública sincronizada

- Regra permanente: toda atualização publicada do Ranvier deve manter o
  `README.md` e os metadados públicos **About** do GitHub alinhados com o estado
  atual do app, sempre em inglês. O README é a referência detalhada; o About é
  o resumo curto, com website e tópicos coerentes. Nenhuma versão é considerada
  documentalmente fechada sem revisar os dois.

## Consumidores do Axon

- `@ironidesflj/axon@0.2.1` está linkado com pin exato no `package.json` e no
  lockfile. Esta primeira fatia formaliza o Ranvier como consumidor do pacote;
  validação de IDs, checksum e manifesto ainda será adotada separadamente,
  atrás de feature flags, sem alterar o acervo nesta etapa.

## Verificado na v1.4.1 (evidência no worklog Task 10)

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
5. Deep-links usam o fallback `noos-hub.vercel.app` até `noos.study` existir.
6. Multi-cert com UMA certificação disponível: o seletor existe e a
   arquitetura está pronta, mas trocar de fato só será exercitável quando a
   segunda certificação entrar em produção (guarda de confirmação dormente).
7. "Em breve" é lista constante no cliente (`src/data/soon-certs.ts`) — quando
   uma certificação entra no banco, sai da lista manualmente (catálogo do
   servidor continua a fonte da verdade para as disponíveis).

## Onde estão as evidências

- `worklog.md` (registro vivo, Task IDs 0–9) — diffs, comandos, medições.
- `download/ranvier-v1.3.1.*` (bundle/patch/zip) — artefatos da leva anterior
  (a leva v1.4.0 gera os próprios artefatos quando o fundador pedir).

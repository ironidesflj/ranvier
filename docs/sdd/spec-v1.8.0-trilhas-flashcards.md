# Spec v1.8.0 — Trilhas de estudo + Sessão de flashcards V2

**Status: APROVADA E IMPLEMENTADA.** Aprovada pelo fundador em 27/out/2026
("gostei, pode seguir") e implementada no mesmo dia (worklog Task 21 —
código completo e verificado no sandbox; aguarda sync GitHub + deploy com
passo de banco, receita em `docs/DEPLOY.md` §5, nota v1.8.0). **Correção
descoberta em QA e embarcada no lote:** o service worker aplicava
stale-while-revalidate a TODOS os GETs de `/api/*`, inclusive os
owner-scoped (attempts/progress/flashcards/trails/me) — os contadores
ficavam "uma fetch atrás" exatamente nos fluxos que motivaram o redesign.
O SW agora trata dados públicos (catalog/health) com SWR e dados por dono
com **network-first + fallback offline** (§13).
**Data:** 27/out/2026 · **Posição no roadmap:** "V2 — trilhas de estudo
personalizadas" (plan.md). O fundador juntou à trilha um pedido de revisão
dos flashcards: *"não gostei não. Não vi diferença entre os flashcards e o
modo estudo. Pergunta e resposta, mesma coisa. Faz um estudo aí e melhore a
sessão."*

**Contexto de versão:** a v1.7.0 (flashcards) está implementada no sandbox,
porém **nunca publicada** (aguardava sync GitHub + deploy com passo de
banco). O desenho da *sessão* foi rejeitado pelo fundador **antes** de
qualquer deploy — logo, esta spec **substitui o desenho da sessão** e os
flashcards chegam à produção pela primeira vez já no formato V2. A tabela
`FlashcardState`, o algoritmo SRS, o merge no login e o cascade LGPD da
v1.7.0 **permanecem intactos** (§3.4) — o que muda é a experiência do cartão.

---

## PARTE I — O ESTUDO: por que o fundador está certo

### 1 · Diagnóstico factual da sessão v1.7.0

A sessão de flashcards implementada reutiliza o `QuestionCard` com as **4
alternativas clicáveis**, o botão **"Confirmar"**, a correção **server-side**
e o bloco de feedback — exatamente o mesmo fluxo do modo Estudar. A única
diferença percebida pelo aluno é a fila SRS ("N para hoje") e a linha
"próxima revisão". A spec v1.7.0 §2 fez essa escolha conscientemente ("a
novidade é o agendamento, não a ocultação") e listou a variante *frente sem
alternativas* como descartada. A experiência do fundador reabre a variante —
e o diagnóstico técnico confirma a percepção: **os dois modos treinam a
mesma habilidade (reconhecimento) no mesmo ritmo, com a mesma interação.**

### 2 · O que a pesquisa de aprendizagem diz

- **Prática de recuperação (testing effect):** tentar lembrar fortalece a
  memória mais do que reler ou reconhecer — Roediger & Karpicke (2006,
  *Psychological Science*) é o resultado clássico; Karpicke & Blunt (2011,
  *Science*) mostram o mesmo contra estratégias elaborativas.
- **Reconhecimento ≠ evocação:** um teste de múltipla escolha é
  *reconhecimento* — as alternativas funcionam como deixa (cue). Um
  flashcard clássico é *evocação livre* — sem deixa. Evocação é mais difícil
  e é justamente essa dificuldade que produz retenção superior (as
  "dificuldades desejáveis" de Bjork). Comparações diretas de formato
  (ex.: Kang, McDermott & Roediger, 2007) favorecem a prática de evocação
  em testes atrasados.
- **Nuance honesta:** múltipla escolha **com** feedback também ensina — o
  problema da v1.7.0 não era "ineficaz", era **redundante com o Estudar**.
  E como a prova é de múltipla escolha, praticar o formato tem valor real
  (o Estudar e o Exame fazem isso). A conclusão de desenho não é "um
  formato é melhor", é **cada modo deve treinar uma coisa diferente**:
  quem *evoca* a resposta reconhece instantaneamente na prova; o contrário
  não vale — quem só reconhece pode não evocar. Flashcards ficam com o
  trabalho de **construir a memória por baixo do formato da prova**.
- **Espaçamento:** o SRS (efeito de espaçamento — Cepeda et al., 2006,
  meta-análise) já está implementado e **não era a queixa** — permanece.
- **Princípio da informação mínima** (Wozniak, *20 Rules*): o cartão ideal é
  atômico; o nosso é do tamanho de uma questão de prova (limitação assumida
  da regra "zero conteúdo novo" — §10).
- **Metacognição:** autoavaliação binária com regra clara é honesta e sem
  fricção; os 4 botões do Anki (again/hard/good/easy) são fricção para
  iniciante. A nota binária continua — quem a dá passa a ser o aluno (§3.2).
- **Ritmo:** o valor diário de um SRS vem de sessões curtas e rápidas
  (padrão consolidado do Anki: revelar → julgar → próximo). A v1.7.0
  manteve o passo pesado do Estudar (marcar → confirmar → ler feedback →
  próximo). A V2 troca o passo do cartão.

### 3 · Divisão de trabalho entre os modos (a resposta ao "mesma coisa")

| Modo | Recuperação | Quem julga | Ritmo | Trabalho do modo |
|---|---|---|---|---|
| Estudar | Reconhecimento (4 clicáveis) | Servidor | Médio | Praticar o formato da prova |
| Exame | Reconhecimento, cronometrado | Servidor | Prova | Medir |
| **Trilhas (novo)** | Reconhecimento c/ feedback | Servidor | Médio | **Ensinar em sequência, com progresso** |
| Flashcards v1.7.0 | Reconhecimento (= Estudar) | Servidor | = Estudar | *redundante — a queixa* |
| **Flashcards V2** | **Evocação livre (sem alternativas)** | **O aluno (binário)** | **Rápido, auto-avança** | **Construir a memória de longo prazo** |

---

## PARTE II — Sessão de flashcards V2

### 3.1 · A frente do cartão (a mudança central)

- **282 de 300 cartões: frente = só o enunciado.** Chips de
  domínio/dificuldade + stem (markdown, componente existente) + instrução
  discreta de primeira sessão ("responda de cabeça e vire o cartão"). O
  aluno tenta **evocar** a resposta; **nenhuma alternativa aparece**.
- **18 de 300 cartões: as alternativas são afirmações a avaliar** — o
  enunciado termina em "Which statement is correct/accurate?" e as 4
  alternativas **são o conteúdo** (afirmações sobre o cenário). Sem elas a
  frente fica mal definida ("lembrar… o quê, exatamente?"). Nesses cartões
  as 4 afirmações aparecem na frente **como parte do enunciado** — lista
  não-clicável, com letras A–D, no mesmo embaralhamento por sessão que o
  verso usa (nota B). O aluno aponta mentalmente a verdadeira e vira.
  Lista curada por chave estável (constante em `src/lib`, **zero mudança no
  seed**): S1-006, S1-009, S1-011, S1-012, S2-024, S2-035, S3-018, S3-019,
  S3-024, S3-052, S3-058, S4-010, S7-002, S7-008, S7-013, S7-017, S7-022,
  S7-031. O draw devolve por cartão um booleano `frontIncludesOptions`
  computado no servidor — o cliente não decide nada.
- O resto do layout muda para "cartão": conteúdo em card próprio, respirado,
  na linguagem visual do app (raio 14 + sombra de repouso — tokens
  existentes). **Sem animação de flip** — a troca frente→verso é imediata
  (o traço/§14 segue excluído por decisão do fundador; nada aqui o reabre).

### 3.2 · O fluxo do cartão (revelar → julgar → próximo)

1. **Frente:** única ação primária **"Ver resposta"** (o botão "Pular" da
   v1.7.0 **deixa de existir**: virar o cartão já é o ato de ver; não saber
   se resolve com "Errei" no passo seguinte — modelo Anki, um passo a menos).
2. **Verso:** o gabarito **destacado entre as 4 alternativas** (ordem de
   exibição da sessão, mesma tradução índice↔posição de hoje), a explicação
   no idioma da interface, a referência oficial e o rodapé com a ID pública
   (costura Noos existente).
3. **Julgamento (autoavaliação binária):** dois botões — **"Errei"** e
   **"Acertei"** — com a **projeção SRS impressa no próprio botão** (padrão
   do Anki, honesto): `[ Errei · volta hoje ] [ Acertei · amanhã ]` /
   `… · em N dias`. As projeções vêm **calculadas no servidor** no reveal
   (§4) — mesma fonte de verdade do `srs.ts`.
4. **Auto-avançar:** julgar = avançar para o próximo cartão imediatamente
   (sem botão "Próximo"). Ritmo-alvo: um cartão a cada 10–20 segundos;
   sessão de 20 cartões em poucos minutos.
5. **Teclado (desktop):** Espaço/Enter = ver resposta · **1** = Errei ·
   **2** = Acertei. Sem conflito com scroll (preventDefault com sessão
   ativa); documentado no rodapé discreto da primeira sessão.
6. **Re-entrada:** "Errei" volta para o fim da fila **1× por cartão**
   (garantia de término, igual à v1.7.0), marcado com ↻ no cabeçalho.
7. **Encerramento:** resumo honesto (vistas · acertos · re-entradas) +
   "volte amanhã" quando a fila esvazia. **Zero streak/XP/confete** (patch
   §1) — o máximo de gamificação segue sendo o número factual.
8. Barra de sessão presa (§10.1: Início sempre à mão, Cartão N/M com M
   crescendo nas re-entradas, acertos ao vivo, barra de progresso) — igual
   à v1.7.0.

**Semântica honesta:** quem vira o cartão e fecha sem julgar **não
registra revisão** — o cartão continua devido/na fila de novas. O SRS só
avança com o julgamento (igual ao Anki). A autoavaliação é do aluno e não
há como auditá-la — é ferramenta de estudo, não prova; a regra binária
clara ("Acertei = você diria a resposta certa de cabeça") é a mitigação.

### 3.3 · Configuração (sem mudanças de produto)

Escopo mixed/due/new + quantidade 10/20/30/50 (padrão 20) + números
factuais do dono — tudo como na v1.7.0. A UI de config permanece.

### 3.4 · O que NÃO muda nos flashcards

- **`src/lib/srs.ts` intocado** (SM-2 simplificado: errei = ease −0,20 piso
  1,3, reps=0, due AGORA; acerto = 1d → 3d → ×ease, teto 180d). As
  projeções do §3.2 usam a própria `applyReview` duas vezes (função pura,
  sem persistir) — zero código novo de algoritmo.
- **Tabela `FlashcardState` intocada** (as linhas do sandbox são válidas: a
  semântica "lembr/não lembrou" é a mesma — só quem dá a nota muda).
- **Merge no login e cascade LGPD** — intocados (iguais à v1.7.0).
- **Draw:** devidas primeiro (mais atrasadas), novas embaralhadas, limite
  1–50, `domainCodes` aceito (UI não expõe — §10) — igual.

### 3.5 · Mudanças de API

1. `GET /api/flashcards` — **igual** (summary por dono; sem cache de borda).
2. `POST /api/flashcards/draw` — igual, com um campo a mais por cartão:
   `{ cards: (PublicQuestion & { frontIncludesOptions: boolean })[] }`.
   `PublicQuestion` (contrato do Estudar) permanece intocado.
3. **NOVO** `POST /api/flashcards/reveal` `{ questionId }` → `{ correctIndex,
   explanationEn, explanationPt, referenceUrl?, referenceTitle?,
   projection: { wrong: { intervalDays }, right: { intervalDays } } }` —
   **leitura sem escrita**; devolve o verso e as duas projeções (0 dias =
   "hoje"; o cliente formata no idioma com plural correta).
4. `POST /api/flashcards/grade` `{ questionId, remembered: boolean }` →
   `{ intervalDays, reps, lapses, nextDueAt }` — **substitui** o
   `POST /api/flashcards/review` da v1.7.0 (que nunca foi publicado; ver §9).
   Aplica o SRS e devolve o vencimento.
- Rate limits (mesma família): draw 60/5min · reveal 300/5min · grade
  300/5min.
- **Modelo de ameaça inalterado:** o gabarito viaja **após o reveal** — a
  mesma exposição que a v1.7.0 já tinha com "Pular" (e que o Estudar tem
  com qualquer resposta): 1 chamada por questão já bastava para scraper.
  Tudo server-side, rate-limited.
- **Custo por cartão:** 1 leitura (reveal) + 1 escrita (grade) — contra 1
  escrita na v1.7.0. Leitura por PK é barata; com o pooler do Neon (§9)
  fica irrelevante. Registrado para o acoplamento com o passo (a).

---

## PARTE III — Trilhas de estudo

### 5.1 · O problema que as trilhas resolvem

"Por onde começo? Quanto falta? O que estudar hoje?" — hoje o aluno novato
abre o Estudar (prática livre, embaralhada, ele escolhe domínios) sem
nenhuma sequência sugerida. **Trilha = currículo ordenado sobre as 300
questões existentes** (zero conteúdo novo): sequência, rampa de
dificuldade, progresso persistente por domínio e um ponto de continuação
claro. Trilha **ensina** (reconhecimento + feedback imediato por questão,
na máquina existente do Estudar); flashcard **mantém** (evocação + SRS) —
os dois novos modos se completam sem se overlap.

### 5.2 · Os fatos (banco real, blueprint May/2026)

7 trilhas = 7 domínios oficiais. Ordem = ordem do blueprint; progresso
global **ponderado pelo peso oficial** de cada domínio:

| # | Trilha | Peso | Questões | E/M/H |
|---|---|---|---|---|
| 1 | Plataforma Databricks Intelligence | 6% | 19 | 8/10/1 |
| 2 | Ingestão e Carregamento | 21% | 59 | 14/33/12 |
| 3 | Transformação e Modelagem | 22% | 69 | 15/35/19 |
| 4 | Lakeflow Jobs | 16% | 43 | 10/25/8 |
| 5 | CI/CD | 10% | 31 | 8/16/7 |
| 6 | Troubleshooting, Monitoramento, Otimização | 10% | 33 | 9/16/8 |
| 7 | Governança e Segurança | 15% | 46 | 10/26/10 |

- **Ordem interna da trilha:** rampa de dificuldade (EASY→MEDIUM→HARD),
  desempate pela chave estável (S2-001…). Determinística, auditável, sem
  tocar no seed.
- **Tranches:** a trilha percorre em sessões de 10/20/30/50 (padrão 20) —
  mesma granularidade das outras configs do app.

### 5.3 · Progresso 100% DERIVADO — zero tabela nova

- **Questão "concluída" na trilha** = existe `AttemptAnswer.correct = true`
  deste dono (userId XOR anonId) para ela — **em qualquer modo** (trilha,
  estudo, simulado). Os modos conversam: acertou no simulado, avançou na
  trilha. Sem duplicação de estado, sem migração, sem surface nova de LGPD
  (attempts já cascateiam no DELETE /account).
- **"Continuar"** = primeira questão não-concluída na ordem da trilha —
  também derivado. Recarregar/trocar de aparelho não perde o ponto.
- Trilha concluída (todas acertadas ≥1×) → estado **Concluída**; CTAs
  honestos: "praticar livre" (vai ao Estudar) e lembrete de que o domínio
  entra no sorteio normal dos flashcards/simulado.
- Consulta: 1 query agregada por dono+certificação (answers corretas →
  set de questionIds) + contagens por domínio — índices existentes
  (`AttemptAnswer.questionId`, índices de dono em `Attempt`).

### 5.4 · Sessão de trilha (modo TRAIL — reuso da máquina do Estudar)

- `POST /api/attempts` ganha o modo **`"TRAIL"`** (`Attempt.mode` é
  `String`, **sem migração**): exige `domainCode` único + `limit`; seleciona
  as **não-concluídas** na ordem da rampa (§5.2) e cria o attempt como o
  Estudar faz (sem deadline, feedback imediato por questão, resposta
  server-side — `toPublicQuestion`, gabarito nunca no draw).
- Resposta errada em trilha: entra na fila de **Revisão** existente
  (wrong-questions) — máquina atual, nada novo.
- Encerramento de tranche: resumo honesto (X corretas de Y · trilha em
  Z%) + "Continuar trilha" enquanto houverem não-concluídas.

### 5.5 · API

1. **NOVO** `GET /api/trails?certSlug&lang` → `{ overallPercent (ponderado
   pelos pesos oficiais), trails: [{ code, name, namePt, weightPercent,
   outline: string[] (bullets oficiais no idioma pediu), total,
   completed, state: "not_started"|"in_progress"|"complete", nextUp: { key
   } | null }] }` — leitura derivada (§5.3), zod + rateLimit como sempre,
   sem cache de borda (payload por dono).
2. `POST /api/attempts` com `mode: "TRAIL"` (§5.4) — extensão da rota
   existente; `GET /api/attempts/{id}` e o fluxo de respostas **reusados
   sem mudança**.
- Rate limit de trails junto ao family do catalog/summary (leitura leve).

### 5.6 · UI

- **Nova view `trilhas`** + hash `#/trilhas` (PT/EN — "Trilhas"/"Trails").
- **Cabeçalho "Rota {shortName}"**: percentual ponderado factual + "próxima
  trilha"; ao concluir 100% → CTA para o **simulado** ("rota completa —
  meça no simulado").
- **Card por trilha** (raio 14, sombra de repouso): nome no idioma, peso
  oficial (%), 2 bullets do outline oficial (EN/PT já no seed de domínios),
  barra factual `completed/total`, estado e CTA (Iniciar · Continuar ·
  Concluída). Lista longa → `max-h` com scroll e scrollbar estilizada
  (padrão do app).
- **Rail:** Trilhas passa a ser o **1º destino** (Trilhas · Estudar ·
  Flashcards · Exame · Progresso, Revisão transitória como hoje; Ajustes no
  pé). Mobile: 6 botões + Mais — o mesmo layout que a Task 19 já QA'ou no
  375. Ícone: `Route` (lucide).
- **Home:** o bilhete ganha **um** CTA factual de trilha ("Trilhas ·
  34%" ou "Continuar: Ingestão · 12/59"; sem trilha iniciada → "Comece
  pela rota · 300 questões") — abaixo do Continuar/Flashcards existentes.
- **Progresso:** bloco pequeno "Rota" com o percentual ponderado + link
  para `#/trilhas` (números que já existem; nada inventado).

---

## 6 · i18n, versão e artefatos

- Blocos novos `trails.*` e ajustes no `flashcards.*` (reveal/grade,
  botões com projeção, dica de teclado) — PT/EN, mesmas chaves, dict as
  const, plurais corretos ("em 1 dia/amanhã/em N dias", "questão/questões").
- **Bump v1.8.0 nas 5 casas:** `version.ts` · `package.json` ·
  `public/sw.js` (`ranvier-v1.8.0`) · `public/offline.html` · popup
  whatsNew com **2 itens** PT/EN (trilhas com progresso; flashcards no
  formato de evocação com autoavaliação).

## 7 · O que NÃO muda (contratos intocados)

- **Banco de questões, seed, manifesto, IDs, checksums:** zero mudanças —
  `validate:questions` 300 · `validate:manifest` 300/0/0.
- **Schema do banco: ZERO migração** (nem tabela nova, nem coluna — trilha
  é derivada e `mode` é String; FlashcardState segue como na v1.7.0).
- **Login/auth** (decisão registrada), **Estudar** e **Exame** (trilha é
  modo novo; o Estudar perde nada), **SRS** (§3.4), merge/cascade LGPD.
- **Anti-filosofia** (patch §1): nenhum streak/XP/confete/ranking; só
  números factuais.
- Animação §14 segue **excluída** (decisão do fundador; reanálise dele).

## 8 · Plano de verificação

Gates: `bun run lint` · `bunx tsc --noEmit` · `bun run validate:questions`
(300) · `bun scripts/validate-manifest.ts` (300/0/0) · `bun run ci:gate
--strict`.

QA navegador (agent-browser, sessão limpa): fluxo anônimo completo de
flashcards V2 (draw → frente SEM alternativas → ver resposta → gabarito
destacado → Errei/Acerte com projeção nos botões → auto-avançar → re-entrada
do errado 1× → resumo); **um dos 18 cartões flagiados desenhado com as
afirmações na frente** (forççar via scope=new até sair, ou seed de estado);
teclado Espaço/1/2 no desktop; virar-e-abandonar sem julgar → carta segue
devida (summary confere); trilhas: view com 7 cards factuais, iniciar
tranche, acertar tudo → progresso da trilha e da rota sobem, "continuar"
pula as concluídas, acerto vindo do Estudar também conta; PT/EN (plurais e
projeções); Home CTAs coerentes com o estado; Progresso bloco Rota; merge
anônimo→conta; DELETE /account (attempts já cascateiam — trilha deriva,
flashcardState cascade); mobile 375 com 6 botões + Mais sem overflow; popup
v1.8.0 2 itens 1×; zero erro de console; latência de reveal/grade no dev.

## 9 · Nota de deploy (v1.7.0 nunca publicada — caminho recomendado)

1. **Publicar a v1.8.0 direto** (sync GitHub → `bun run db:push:prod`
   [cria `FlashcardState`, o passo pendente da v1.7.0 — nada além disso] →
   redeploy). Publicar a v1.7.0 antes seria publicar uma sessão que o
   fundador já rejeitou — não recomendado; tecnicamente possível, a v1.8.0
   apenas substitui os endpoints `/review`→`/reveal`+`/grade`.
2. Pós-deploy: `/api/health` 300 · `/api/flashcards` = `{newCount: 300}` ·
   `/api/trails` responde 7 trilhas 0 concluídas · popup 1×.
3. **Pooler do Neon (passo (a)) reiterado pela 3ª vez**: com a V2 cada
   cartão = 1 leitura + 1 escrita, e trilha adiciona leituras derivadas —
   sem pooler, cada operação paga handshake.

## 10 · Variantes avaliadas e descartadas (reabertura fácil)

- *Frente sempre com alternativas não-clicáveis (uniforme)* — perderia a
  evocação em 94% dos cartões; a lista de 18 resolve o caso real.
- *3º botão "Quase"* — mapearia para "errei" no SRS; fricção sem ganho.
- *Cartões de conceito/cloze autorais* — decisão de conteúdo (300 itens
  novos), futura; a regra "zero conteúdo novo" segue.
- *Trilha adaptativa por fraqueza* — precisa de analytics de tentativas;
  V3+ (a "personalização" atual = ponto de continuação + progresso reais).
- *Flashcards filtrados por domínio na UI* — a API aceita `domainCodes`;
  UI fica para quando doer.
- *FSRS/substituir o SM-2* — o algoritmo não era a queixa; segue local.
- *Fila offline de revisões com replay* — limitação documentada, V3+.

## 11 · Esforço estimado

Um lote similar à v1.7.0: API (reveal/grade/flag + trails + ramo TRAIL) +
duas frentes de UI (reescrita da fase de sessão dos flashcards + view de
trilhas com rail/Home/Progresso) + i18n/bump/QA. Executável em uma sessão
de trabalho após a aprovação.

## 13 · Correção do service worker (descoberta em QA, embarcada no lote)

**O defeito:** o `public/sw.js` tratava TODO GET de `/api/*` com
stale-while-revalidate — inclusive endpoints **owner-scoped**
(`/api/attempts`, `/api/progress`, `/api/flashcards`, `/api/trails`,
`/api/auth/me`). O SW devolvia a resposta em cache e atualizava em segundo
plano: cada leitura servia o estado "uma fetch atrás". Sintoma reproduzido
no QA: responder uma questão de trilha → resultados → Trilhas ainda
mostrava o progresso antigo. O mesmo defeito latente atingia o resumo de
flashcards da v1.7.0 e o "Continuar" da Home (mascarado por corridas de
timing nos QAs anteriores).

**A correção (embarcada na v1.8.0):**
- Dados **públicos** e dono-independentes (`/api/catalog`, `/api/health`,
  manifesto) — mantém stale-while-revalidate (leitura instantânea offline +
  refresh em segundo plano; são iguais para todo visitante e vêm da borda).
- Dados **owner-scoped** — **network-first com fallback de cache**: online
  o contador reflete a última resposta/avaliação imediatamente; offline o
  cache preserva a leitura (objetivo nº 2 do SW mantido).
- Mutações seguem intocadas (nunca passaram pelo SW).

**Nota de deploy:** visitantes com o SW antigo trocam para o novo ao fechar
as abas (ciclo de vida sem `skipWaiting`, por design — nunca interrompe
sessão aberta); a ativação limpa os caches antigos. Documentada na nota
v1.8.0 do `docs/DEPLOY.md` §5.

# Spec v1.10.0 — Flashcards offline (fila de julgamentos)

**Status: APROVADA E IMPLEMENTADA** (lote de código Task 24, 28/out/2026).
Aprovada pelo fundador ("specs aprovadas") junto com a v1.9.0 — ambas
embarcaram no mesmo redeploy (o popup da v1.10.0 carrega os 2 itens para
quem saltou a v1.9.0). Escrita em 28/out/2026 (Task 23), após o fundador
aprovar a direção ("Seguir com glossario e offline flashcards").

**Additive implementation notes (worklog Task 24):**
- `POST /sync` aceita `certSlug` OPCIONAL e devolve `{ applied, skipped,
  summary }` — `skipped` reporta eventos cuja questão não existe mais
  (nunca descarte silencioso; toast próprio no cliente) e `summary` devolve
  o resumo fresco da cert ativa (uma viagem em vez de duas).
- O fold do sync usa o `occurredAt` de cada evento como instante da revisão
  (histórico honesto: julgou ontem com intervalo de 1 dia → vence hoje) e
  escreve UMA vez por carta distinta (O(cartas) escritas, não O(eventos)).
- Projeção de carta re-entrante ("Errei" nesta sessão): computada no cliente
  com `srs.ts` puro (wrong=0/right=1 — determinístico pós-lapse).
- Gatilho de sync adicional: MOUNT da view com fila pendente (abrir o app
  conta como foco) além de online/foco/fim-de-sessão.

---

## 1 · Problema

Os flashcards exigem rede **por carta**: draw, reveal e grade são chamadas
ao servidor. Metade do valor de um app de flashcards é usar em qualquer
lugar — metrô, avião, roaming. Objetivo: **sessão iniciada online continua
offline**; julgamentos acumulam numa fila local e sincronizam quando a rede
volta. O draw continua exigindo rede (a fila nasce do estado SRS do
servidor — decisão honesta documentada).

## 2 · Modelo de ameaça — a análise honesta (o núcleo desta spec)

**Hoje:** o gabarito viaja no `/reveal`, carta a carta, só na viragem.
**Offline exige:** o payload do reveal (gabarito + explicações + projeções)
presente no dispositivo **desde o draw** — até 50 cartas por sessão.

**Por que é aceitável:** a avaliação de flashcard é **auto-declarada**
(Errei/Acertei é o aluno falando de si) — não existe correção server-side
para proteger. Quem inspecionar o devtools para ver o gabarito antes de
virar está só sabotando o próprio treino de evocação. O que permanece
intocado e server-side: **Estudar e Exame** (correção por índice
canônico, nunca offline, nunca pré-buscada). A análise fica registrada
aqui e no código (comentário no serviço).

**Variante descartada:** criptografar o payload com chave entregue
carta-a-carta por endpoint — proteção do usuário contra si mesmo, com
custo de complexidade alto e nenhuma ameaça real fechada.

## 3 · Contratos de API

- **`POST /draw` passa a devolver a carta completa** para o cliente:
  `frontIncludesOptions` (como hoje) **+ `correctIndex` +
  `explanationEn/Pt` + `referenceUrl/Title` + `projection
  {wrong,right}`** (o payload do reveal embutido, até 50 cartas). O
  cliente **vira localmente** — reveal vira leitura de memória, sem
  chamada (online ou offline, um só caminho de código).
- **`/reveal` deixa de ser chamado pelo app** (endpoint mantido: API
  publicada, marcação "deprecated" nos comentários; remoção só em
  versão futura com aviso).
- **`/grade` permanece** a escrita online (usado quando há rede —
  comportamento atual).
- **NOVO `POST /api/flashcards/sync`**: `{ events: [{ questionId,
  remembered, occurredAt }] }` (zod, ≤200 eventos, rate limit novo
  `flashcardsSync 120/5min`). Aplica cada evento em ordem como um
  review (mesma `gradeFlashcard`, sem o retorno por carta); responde
  `{ applied, summary }`. 200 = cliente limpa a fila.

## 4 · Fila local e sincronização

- **localStorage `ranvier:fc-queue`**: `[{ questionId, remembered,
  occurredAt }]`, cap **200** (descarta o mais antigo com toast de
  aviso — cap nunca silently drop).
- Julgar offline (ou com fetch falhando): SM-2 **local** para projeção
  imediata (as funções puras de `src/lib/srs.ts` passam a ser
  importadas também no cliente — zero duplicação) + evento na fila.
- **Gatilhos de sync:** `navigator.onLine` vira true, foco da aba,
  fim de sessão. Sync = um POST; em 200: limpa fila, invalida o
  resumo, toast factual ("N julgamentos sincronizados").
- **Conflito multi-dispositivo:** eventos aplicam sobre o estado
  corrente no servidor, em ordem de chegada — mesmo contrato de hoje
  para quem usa duas abas. Uso simultâneo 2 dispositivos + offline =
  limitação documentada (o evento tardio aplica por cima; SM-2 se
  corrige no próximo ciclo).
- **Dupla aplicação** (resposta 200 perdida após o servidor aplicar):
  janela de milissegundos; consequência = 1 passo extra de SM-2 numa
  carta autoavaliada. **Aceito e documentado.** Variante estrita
  (tabela de `eventId` único): custo de schema por risco residual
  mínimo — descartada, reabertura fácil.

## 5 · UI — honestidade sobre o estado da rede

- Sessão mostra **badge factual** no rodapé quando offline (ou fetch
  falhou): "Offline · N julgamentos na fila" (PT) / "Offline · N
  grades queued" (EN). Online com fila pendente: "N na fila · tenta
  sincronizar…".
- Fluxo da sessão **idêntico** online/offline (um só caminho — §3):
  Espaço vira (local), 1/2 julga (local + fila ou POST).
- Resumo de fim de sessão: linha extra factual quando houver fila
  ("3 julgamentos serão sincronizados quando você voltar online").
- **Draw offline:** bloqueado com mensagem honesta ("a fila de cartas
  nasce no servidor — abra a sessão online") + botão retry.
- SW intocado nas estratégias da auditoria (owner-scoped = network-only;
  o sync é POST — nunca passou pelo SW).

## 6 · i18n, versão e artefatos

- Bloco `flashcards.offline.*` PT/EN (badge, fila pendente, resumo,
  draw bloqueado, toasts).
- Bump **v1.10.0** nas 5 casas + popup **1 item** ("Flashcards offline:
  sessões iniciadas online continuam sem rede; julgamentos sincronizam
  sozinhos ao voltar").

## 7 · O que NÃO muda

`srs.ts` (matemática — só ganha import no cliente), tabela
`FlashcardState`, merge, cascade, Estudar/Exame (correção server-side),
rate limits existentes, `/reveal` no ar, SW da auditoria, question
bank/manifesto/IDs.

## 8 · Plano de verificação (QA sandbox)

1. Gates completos + selftest.
2. API (curl): draw com payload completo (50 cartas: gabarito +
   projeções; **zero** gabarito de cartas fora da sessão); sync com 3
   eventos → banco com 3 reviews aplicados; sync vazio → 200; zod
   rejeita >200 eventos; rate limit conta.
3. Navegador (sessão limpa, PT e EN): sessão normal online (regressão —
   reveal local, grade POST imediato); devtools **offline** no meio da
   sessão: Espaço vira, 1/2 julgam, badge "Offline · N na fila", resumo
   com pendências; **online de novo**: sync automático, toast, resumo
   do flashcards reflete (network-first pós-auditoria); dupla aba
   (2 julgamentos concorrentes — ordem de chegada); cap 200 (seed de
   201 eventos → toast de descarte); draw offline bloqueado com retry;
   mobile 375; zero erros de console.

## 9 · Nota de deploy

Redeploy simples, **sem passo de banco** (nenhuma tabela nova — a fila é
localStorage; o sync usa a `FlashcardState` existente). Verificação
pós-deploy: iniciar sessão, cortar a rede, virar 2 cartas, voltar a
rede, conferir o toast e o "Para hoje" no resumo.

## 10 · Variantes avaliadas e descartadas (reabertura fácil)

- **IndexedDB** em vez de localStorage — capacidade que 200 eventos
  pequenos não precisam.
- **Sync carta-a-carta** em vez de lote — N POSTs, N janelas de falha.
- **Draw offline** (estado SRS espelhado no cliente) — o servidor é a
  fonte da verdade do agendamento; duplicar é fonte de conflito.
- **Background Sync API** do SW — suporte irregular, complexidade.
- **eventId + tabela dedup** — ver §4 (risco residual mínimo).
- **Payload criptografado** — ver §2 (proteção contra si mesmo).

# Spec v1.7.0 — Flashcards com repetição espaçada

**Status: APROVADA E IMPLEMENTADA.** Aprovada pelo fundador em 27/out/2026
("aprovado, exceto a animação. Preciso reanalisar ela depois") — o traço
animado do símbolo (patch v1.1 §14) foi **excluído do escopo por decisão do
fundador** e segue como reanálise pendente no plan.md. Código implementado e
verificado no sandbox no mesmo dia (worklog Task 19); aguarda sync GitHub +
deploy com passo de banco (receita em `docs/DEPLOY.md` §5, nota v1.7.0).
**Data:** 27/out/2026 · **Posição no roadmap:** primeiro item de produto após
privacidade+performance (v1.6.0). Fundador definiu ordem em 27/out/2026:
"pode seguir na ordem que preferir; próxima certificação fica por último
quando não tiver mais nada pra mexer no app" — logo, flashcards → trilhas →
(avaliação do traço §14) → … → nova certificação.

---

## 1 · Contexto e pedido

"V2 — flashcards" consta no plan.md desde o início. O pedido desta spec:
transformar o banco de 300 questões DBDEA em um **modo de estudo por cartões
com repetição espaçada (SRS)** — o recurso clássico de app de prova que o
Ranvier ainda não tem, e o de maior valor diário para quem está se preparando.

**Por que agora:** privacidade (v1.6.0) e performance (v1.6.0 + pooled, passo
do mantenedor) estão fechados; o hub (Fase 1/2) ficou nas mãos do fundador
para depois; sobra espaço de produto puro — e flashcards não depende de
ninguém além do app.

## 2 · O que é um "cartão" (decisão de produto)

**1 questão do banco = 1 cartão.** Dia 1 são 300 cartões PT/EN, sem autoração
de conteúdo novo, sem tocar no seed, no manifesto ou em qualquer ID.

- **Frente:** chips de domínio + dificuldade, o **enunciado em inglês** (como
  na prova — questões são EN por construção do banco; só a explicação é
  bilíngue) e as **4 alternativas visíveis e tocáveis**.
- **Interação:** o aluno toca a alternativa que acredita correta (recall
  ativo) → o **servidor** avalia → o cartão **vira** mostrando a escolha
  marcada, o gabarito, a explicação no idioma da interface e a referência.
- **"Pular":** revela o verso sem resposta; conta como **errei** para o SRS
  (mesma semântica de questão não respondida = incorreta na prova).
- **A novidade é o agendamento, não a ocultação:** manter as alternativas na
  frente é fiel ao formato da prova e reaproveita a interação que o aluno já
  conhece do modo Estudar. O valor novo é o **SRS**: cada cartão volta na
  hora certa (amanhã, em 3 dias, em uma semana…).

**Alternativas avaliadas e descartadas para V1** (podem voltar como variante):
- *Frente sem alternativas* (recall puro, sem pistas): mais difícil, mas
  ambíguo com enunciados de cenário longos; ficaria como opção de modo em V2.
- *Cartões de conceito* (frente "o que é X?", verso definição): exigiria
  autoração de ~300 itens novos de conteúdo — decisão de conteúdo, não de
  código; adia para quando o fundador quiser investir nisso.
- *Auto-avaliação em 4 botões* (estilo Anki: errei/difícil/bom/fácil): o
  acerto server-side já dá a nota; botões extras são fricção. A "sorte" entre
  2 alternativas é ruído aceitável para V1 (documentado; revisitável).

## 3 · SRS — SM-2 simplificado, LOCAL no app

`src/lib/srs.ts` (~40 linhas, zero dependências, funções puras testáveis):

- **Nota = correção do servidor:** acertou → "sabia"; errou/pulou → "errei".
- **Parâmetros** (constantes nomeadas, ajustáveis):
  - `ease` inicial **2,5** · mínimo **1,3** · passo **−0,20** por "errei"
    (acerto não aumenta o ease em V1 — SM-2 clássico simplificado);
  - intervalos: 1º acerto → **1 dia**; 2º → **3 dias**; a partir do 3º →
    `intervalo anterior × ease`; **teto 180 dias** (curso de prova, não
    repositório vitalício);
  - "errei": `reps = 0`, `lapses + 1`, `ease −0,20` (piso 1,3),
    **due = agora** → o cartão **re-entra na fila da própria sessão** e segue
    devido hoje mesmo se o aluno recarregar a página.
- **Nada de streak/XP/confete** (anti-filosofia do patch §1). O máximo de
  "gamificação" aqui é um número factual: "12 cartões para hoje".

**Por que SM-2 local e não no pacote Axon:** o dossiê das fatias é explícito
— "SM-2 não está no pacote; sobe só quando doer em dois apps". O Synapse
ainda não precisa de SRS; quando precisar, a função pura sobe para o Axon com
a mesma assinatura. Registrado aqui para o futuro agent não "corrigir" isso.

## 4 · Modelo de dados

Nova tabela (mesmo padrão de dono do `Attempt` — userId **XOR** anonId):

```prisma
model FlashcardState {
  id             String    @id @default(cuid())
  userId         String?
  user           User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  anonId         String?
  questionId     String
  question       Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  ease           Float     @default(2.5)
  intervalDays   Int       @default(0)
  reps           Int       @default(0)
  lapses         Int       @default(0)
  dueAt          DateTime  @default(now())
  lastReviewedAt DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([userId, dueAt])
  @@index([anonId, dueAt])
}
```

- **LGPD:** cascade no `User` → `DELETE /account` apaga o estado de
  flashcards junto (o texto da seção Privacidade continua 100% verdadeiro).
- **Unicidade por dono+questão é garantida no serviço** (`findFirst` por
  dono+questão → update ou create), como o `AttemptAnswer` faz — índice
  único composto com NULL não é portável entre SQLite/Postgres no Prisma.
- **Merge no login** (extensão do merge que a Task 3 fez para attempts):
  no login, linhas `anonId` viram `userId`. Colisão (usuário já tem estado
  para a mesma questão): **mantém a linha com mais `reps`**; empate → mantém
  a existente do usuário; a perdedora é apagada. Determinístico e sem
  perder histórico.
- **Sem tabela de sessão V1:** a fila de cartões é client-side; o estado
  persistente é por cartão. (Histórico de revisões individuais — analytics
  de flashcards — fica como opção futura; nada de métrica inventada na UI.)

## 5 · API (padrões do repo: zod + rateLimit + ownerWhere + ServiceError)

1. `GET /api/flashcards?certSlug=…` → `{ dueCount, newCount, totalCards }`
   — resumo para a entrada da Home. **Sem cache de borda** (payload por
   dono, diferente do catalog público). Uma query barata com índice
   `(userId, dueAt)` / `(anonId, dueAt)`.
2. `POST /api/flashcards/draw` `{ certSlug, domainCodes?, limit? (1–50,
   default 20), scope: "mixed" | "due" | "new" }` → `{ cards:
   PublicQuestion[] }` — devidas primeiro, depois novas, até o limite;
   embaralhadas. **Reusa `toPublicQuestion`** (sem `correctIndex` — o
   contrato de segurança segue idêntico).
3. `POST /api/flashcards/review` `{ questionId, selectedIndex: 0–3 | null }`
   → `AnswerFeedback` + `{ nextDueAt, intervalDays, reps, lapses }` —
   avalia, aplica o SRS e devolve o verso do cartão.

- Rate limits novos (`flashcards-draw`, `flashcards-review`) calibrados para
  sessão de 50 cartões: draw ~12/min; review ~120/min.
- **Modelo de ameaça inalterado (honesto):** revelar o gabarito após
  "pular" não enfraquece nada que já existia — o modo Estudar revela o
  gabarito após *qualquer* resposta (1 chamada por questão já bastava para
  scraper). Continua tudo server-side, rate-limited, com custo de escrita
  por linha.

## 6 · UI

- **Nova view `flashcards`** no union `View` + hash `#/flashcards` (PT e EN
  — mesmo nome, como "flashcards" é empréstimo nos dois idiomas).
- **Navegação:** item novo no rail principal (Estudar · **Flashcards** ·
  Exame · Progresso · Revisão) + CTA no bilhete da Home com o número factual
  ("12 para hoje · Flashcards"). QA explícito de 5 itens no mobile 375.
- **Frente:** barra de sessão presa (padrão patch §10: Início sempre à mão,
  contador "3/20"), chips domínio/dificuldade, stem em markdown (componente
  existente), alternativas em botões 44px, ação secundária "Pular".
- **Verso:** escolha marcada vs gabarito destacado (verde/vermelho, tokens
  existentes), explicação markdown no idioma da interface, link de
  referência, linha SRS factual ("Próxima revisão: em 3 dias"), rodapé com a
  ID pública (mesma costura Noos do QuestionCard), botão "Próximo".
- **Fim de sessão:** resumo honesto (vistas · acertos · re-entradas) e
  "volte amanhã" quando a fila esvazia — **zero** confete/streak.
- **Progresso:** bloco pequeno na view Progresso — cartões em rotação,
  para hoje, maduros (intervalo ≥ 21d). Apenas números que existem na tabela.
- **Offline/PWA:** draw e review exigem rede (correção é server-side);
  estado offline segue o padrão `QueryError`/`offline.html` existente.
  Fila offline de revisões fica para V2 (limitação documentada, não
  escondida).
- **Skeleton + QueryError + mobile 375 + zero erro de console** — critérios
  de aceite idênticos aos das views existentes.

## 7 · i18n, versão e artefatos

- Bloco `flashcards.*` completo PT/EN (títulos, chips, botões, resumo de
  sessão, empty states, linha "próxima revisão" com pluralização correta).
- **Bump v1.7.0 nas 5 casas:** `version.ts` · `package.json` · `public/sw.js`
  (cache `ranvier-v1.7.0`) · `public/offline.html` · popup whatsNew com
  **1 item** PT/EN (flashcards com repetição espaçada).

## 8 · O que NÃO muda (contratos intocados)

- **Banco de questões, seed, validador, manifesto:** zero mudanças —
  `validate:questions` segue 300, `validate:manifest` segue 300/0/0 byte a
  byte. Nenhuma ID, checksum ou `contentVersion` é afetado.
- **Login/auth:** nada (decisão do fundador registrada — login fica como está).
- **Constituição/Noos:** nenhum fetch ao hub em runtime; a ID pública no
  rodapé do cartão usa a montagem de URL já existente (formato adotado,
  badge só acende com a Fase 1/2 do fundador).
- **Modo Estudar/Exame:** intocados (flashcards é modo novo, não refactor).

## 9 · Plano de verificação (pré-aprovação → pós-código)

Gates: `bun run lint` · `bunx tsc --noEmit` · `bun run validate:questions`
(300) · `bun scripts/validate-manifest.ts` (300/0/0) · `bun run ci:gate
--strict` · `ci:gate:selftest`.

QA navegador (agent-browser, roteiro): fluxo completo anônimo (draw →
responder certo → responder errado → pular → re-entrada do "errei" na mesma
sessão → resumo); contagem "N para hoje" na Home coerente com o estado;
PT/EN em tudo (incluindo pluralização); merge anônimo→conta (login com
estado pré-existente — regra de colisão); DELETE /account apaga
flashcardState (verificação em sandbox); mobile 375 sem overflow com 5
itens no rail; popup v1.7.0 1× por versão; zero erro de console; latência
de review medida no dev sandbox.

## 10 · Receita de deploy (DIFERE da v1.6.0: tem passo de banco)

1. Sync do lote para o GitHub (como sempre).
2. **`bun run db:push:prod`** (ou `prisma db push --schema
   prisma/schema.prod.prisma` no Neon) — cria a tabela `FlashcardState`.
   Aditiva, sem risco a dados existentes (nenhuma tabela atual é alterada).
3. Redeploy padrão; conferir `/api/health` = 300 · `GET /api/flashcards`
   responde `{ dueCount: 0, newCount: 300, totalCards: 300 }` para visitante
   novo.
4. (Recomendação repetida do lote anterior: `DATABASE_URL` pooled do Neon —
   **com flashcards importa mais**, porque cada revisão é uma escrita no
   banco; sem pooler, cada virada de cartão paga handshake de conexão.)

## 11 · Fora de escopo deste lote (variantes futuras documentadas)

Frente sem alternativas (modo recall puro) · auto-avaliação manual · fila
offline com replay · SM-2 promovido ao Axon (quando 2 apps precisarem) ·
cartões de conceito autoral · exportar/importar estado · analytics por
revisão.

## 12 · Esforço estimado

Um lote de código de tamanho similar ao v1.4.0: backend (schema + serviço +
3 rotas + merge no login) + UI (view + rail + CTA Home + bloco Progresso) +
i18n/bump/QA. Executável em uma sessão de trabalho após a aprovação.

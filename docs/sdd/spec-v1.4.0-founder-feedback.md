# spec-v1.4.0-founder-feedback.md — patch v1.4.0 (feedback pós-identidade)

Data: 2026-10-26 · Fonte: feedbacks do fundador comparando a v1.3.1 (sandbox,
identidade Noos) com a versão anterior ao ar, consolidados pelo designer no
`ranvier-patch.md`/`ranvier-patch.html` (patch de design v1.1). Todos os 7
pontos + 4.b aplicados; divergências conscientes documentadas abaixo.

## Entrada (feedback do fundador, na ordem)

1. **Mix antigo × atual** — "a pessoa gostava muito do anterior… consegue
   fazer um mix entre o antigo e o atual?"
2. **Explicação some após finalizar** — "as questões perderam a explicação,
   tanto na correta quanto na incorreta."
3. **Letra gigante na questão** — "no anterior tinha o tamanho correto."
4. **Cabeçalho fixo** — "havia um cabeçalho fixo… pra voltar ao início tem
   que subir tudo de novo pra encontrar o botão 'início'."
   4.b. **Controles na barra** — "PT/EN, dark/light, entrar, tudo foi pra
   ajustes, e o botão ajustes não aparece na tela inicial… os toggles na
   barra ficava melhor, especialmente o entrar."
5. **Gabarito** — "no modo estudo a [resposta] certa é quase sempre a
   [mesma]. simulado foi corrigido mas não tá perfeito."
6. **Multi-certificação** — "muito data engineer associate centered. Onde e
   como ficaria o seletor… já poderia deixar umas próximas como em breve."
   (referência ao Duolingo: foco total na escolhida, com volta fácil.)
7. **Porcentagem com cor** (não enviado ao design) — "o desempenho por
   domínio não tem mais a porcentagem com cor, vermelho, verde."

## Decisões de implementação

### 1 · Matéria — "o instrumento tem tato" (patch v1.1 §3/§6)
- Escala de raio por função: **6px** (chip/etiqueta/letra A–D), **10px**
  (botão/campo/alternativa — `--radius`), **14px** (bilhete, folha de
  configuração, cards da landing, dropdown), **20px** (sheet/modal mobile).
  Réguas, filetes de leitura e barras de 3px continuam retos.
- Sombras: `--shadow-rest` (1px) em bilhete/config/cards; `--shadow-float`
  reservado a barra fixa/dropdown/sheet/aviso. Nada de sombra colorida.
- Aplicado em: `globals.css` (escala substitui os `calc()`), `question-card`
  (alternativa 10 / letra e tags 6), `home-view` (bilhete + cards 14 + repouso),
  `study-view` (folha de configuração 14 + repouso).

### 2 · Explicação na revisão (nota A — era de DADOS na origem, não de CSS)
- Diagnóstico: o DTO do servidor (`ReviewQuestion`) JÁ persistia e retornava
  `explanationEn/Pt`, `referenceUrl/Title` para tentativas concluídas — o
  snapshot exigido pela nota A já existia. O defeito era 100% apresentacional:
  `QuestionCard` só renderizava a correção com o prop `feedback` (estudo).
- Correção: prop `review` estendido (`ReviewState`) carrega explicação e
  fonte; o bloco de correção renderiza em estudo E revisão. `results-view`
  passa o snapshot completo. Revisão pós-exame: **45/45** blocos com
  explicação + fonte (verificado no navegador); sobrevive a reload (fonte =
  API, não estado de tela).

### 3 · Contrato da pergunta (patch v1.1 §5)
- `text-[20px] min-[700px]:text-[26px] min-[1024px]:text-[30px]
  min-[1440px]:text-[32px]`, `leading-[1.35]`, `tracking-[-0.012em]`,
  `max-w-[48ch]`, serifa Newsreader, nunca utilitário de heading.
  Verificado: 20px@375, 26px@768, 32px@1440.

### 4 · Barra de sessão presa (patch v1.1 §10)
- **Exame** (chrome-less): [Início (confirma saída)] [cert · Simulado]
  [Questão N/45] [relógio mono tabular] [Entregar] + régua/dreno fixa.
  Mobile 52px. `certShortName` adicionado ao DTO `AttemptDetail`.
- **Estudo**: barra presa sob a barra superior com [Início (resumo seguro)]
  [cert · Modo Estudo] [acertos] [Encerrar] + régua de progresso.
- **Resultado**: barra presa com [Início (→ home)] [laudo · cert] [score]
  [Topo (rola ao topo)] — resolve literalmente "subir tudo de novo pra
  achar o botão início".
- `html { scroll-padding-top: 96px }` (foco nunca escondido atrás da barra).

### 4.b · Controles de volta à barra (patch v1.1 §8 + nota E)
- Nova `TopBar` em TODAS as telas internas + landing: certificação à
  esquerda (seletor), PT/EN + tema + Entrar/conta à direita. `LangSeg`
  esconde abaixo de 430px (regra do próprio mockup do designer) e vive no
  sheet "Mais" com alvos de 44px.
- Rail: 4 destinos (Estudar, Exame, Progresso, Revisão) + **Ajustes
  secundário no pé** (11px, muted, acima da versão).
- Mobile: bottom nav de 4 + **Mais** (sheet: idioma, tema, conta, Ajustes).
- Conta: sem sessão = "Entrar" (modal); com sessão = iniciais + menu
  (Ajustes, Sair) — nunca os dois. "Continuar" (retomar sessão) migrou do
  header para o bilhete da landing (mockup §7.4).

### 5 · Gabarito por posição canônica + shuffle (nota B)
- Viés de TAMANHO já corrigido na v1.3.1 (81%→10%); o resíduo percebido era
  de POSIÇÃO: alternativas nunca eram embaralhadas.
- `src/lib/option-order.ts`: Fisher-Yates semeado por `hash(attemptId:
  questionId)` (FNV-1a + mulberry32) — ordem reproduzível ao recarregar,
  retomar e revisar. O protocolo continua gravando/corrigindo **índice
  canônico**; a UI traduz canônico ↔ exibido em estudo, exame, retomada e
  revisão (tentativas pré-shuffle continuam válidas: a ordem deriva só de
  attemptId+questionId). Verificação cruzada contra o banco: resposta
  exibida/correta/graduada coincidem em 100% nos fluxos testados.
- Nota para o modelo construtor (pedido do fundador): quando as alternativas
  ganharem `optionId` estável no banco, trocar a semente de índice para ID
  mantendo a mesma interface (comentário no arquivo).

### 6 · Multi-certificação (patch v1.1 §9 + nota D)
- `certSlug` ativo no store (localStorage `ranvier:cert`, default DBDEA,
  hidratado pós-mount para evitar mismatch de SSR); todas as views resolvem
  a certificação ATIVA do catálogo com fallback.
- `CertSelectorMenu` (dropdown Radix): disponível (DBDEA, "atual") + **em
  breve** (AI-900, DP-900, PL-300, SC-900, AZ-104 — nomes reais, chip,
  não clicáveis, sem data) — `src/data/soon-certs.ts`. Gatilho compacto na
  barra e botão "Trocar certificação" no bilhete.
- Troca durante sessão: confirmação com "Retomar depois" (patch §9.5;
  dorante hoje com 1 certificação, arquitetura pronta).
- Progresso por certificação: **inerente ao modelo** (tentativa → questão →
  certificação; nenhuma consulta agrega). Migração (nota D): histórico
  existente é DBDEA = default — nada a migrar.
- Bilhete da landing ganha a linha "AI-900 · DP-900 · PL-300 · em breve".

### 7 · Porcentagem com cor (feedback que o design não recebeu)
- `results-view`: valor por domínio passa a `9/10 · 90%` com **90% colorido**
  (verde ≥ corte / vermelho < corte, tokens `--noos-success/danger`) e a
  barra de 3px acompanha a cor. Divergência consciente do patch §12 do
  design ("barras em ink azul") — o pedido direto do fundador prevalece.

## Divergências conscientes em relação ao patch do design (e por quê)

| Patch do design | Implementado | Motivo |
|---|---|---|
| "by Noos" no cabeçalho, mono, sem link | Mantido no **rodapé como link** | Decisão explícita do fundador 2026-10-25 ("pode voltar a ser link, no rodapé, solicitação minha") — não reverter coisas resolvidas |
| Rota de revisão separada `/resultado/revisao?q=` | Revisão single-page com filtros (todas/erradas) | Arquitetura atual já QA'd; a dor real (explicação + Início) foi resolvida sem refactor arriscado |
| Exemplos AZ-900 (40q/45min) | DBDEA real (45q/90min, banco 116) | O dossiê do design descreve um app Azure; o produto real é Databricks |
| Copy de referência do H1/lead | Copy atual PT/EN mantida | Já localizada e aprovada; troca seria churn sem ganho |

## Não implementado do patch (fora do escopo deste lote)

- Traço do símbolo animado ao carregar (600–800ms) — movimento opcional,
  fica para avaliação do fundador em rodada própria.
- Métrica "porcentagem correta" na barra do estudo além dos acertos atuais.

## Aceite (verificado no navegador — ver worklog Task 9)

Popup 1×/versão 1.4.0 e não reaparece; PT/EN+tema+Entrar na barra em toda
tela (desktop e mobile); Ajustes secundário (rail pé + sheet Mais); seletor
de certificação com 5 "em breve" não clicáveis; pergunta 20/26/32px;
alternativa raio 10 + letra 6; explicação+fonte em 45/45 na revisão do
simulado e 10/10 na de estudo; barras de sessão presas (exame/estudo/
resultado) com Início sempre à mão; porcentagem por domínio colorida
(verde/vermelho, claro e escuro); shuffle reproduzível e gabarito
canônico conferido contra o banco; 375/768/1440 sem overflow horizontal
(1 bug de token longo corrigido no markdown); zero erros de console;
APIs 200/201; lint/tsc/validate limpos.

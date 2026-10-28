# plan.md — autorizado, pendente, adiado e fora de escopo

## Autorizado (em curso)

- ~~Deploy da v1.6.0~~ — **concluído pelo fundador e verificado ao vivo**
  (worklog Task 17: health 300, OG 200, manifesto byte-idêntico, borda HIT
  ~35ms, 1 fetch de catalog, privacidade PT/EN, popup 3 itens, mobile sem
  overflow, zero erros de console). O passo (a) — `DATABASE_URL` pooled do
  Neon (`-pooler.` no host) — segue pendente no console da Vercel (maior
  ganho restante para chamadas autenticadas; com flashcards V2 passará a
  pesar ainda mais, pois cada revisão será uma escrita no banco).
- **Fase 1 — acender o hub** (passo do mantenedor, fora do repo do app):
  committar o conteúdo de `public/manifest.jsonl` como `manifestos/RAN.jsonl`
  no repo do hub; o deploy seguinte acende 300 páginas PT/EN em
  `noos.study/{lang}/q/{ID}` + redirects de alias + sitemap. **Timing definido
  pelo fundador em 27/out/2026: "2 e 3 eu farei depois, quando eu for mexer
  no noos" — sem urgência.**
- **Fase 2 — fatia 5 completa**: setar `NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study`
  nas envs da Vercel junto/com o hub aceso (badge e Comunidade apontam ao
  canônico vivo). Idem timing acima.
- **v1.7.0 — Flashcards com repetição espaçada**: spec **APROVADA pelo
  fundador em 27/out/2026** ("aprovado, exceto a animação") e **implementada
  no mesmo dia** (worklog Task 19 — código completo e verificado no sandbox;
  nunca publicada). A animação do símbolo (§14) foi **excluída do lote por
  decisão do fundador**: "preciso reanalisar ela depois" — segue como item
  pendente abaixo. **Pós-implementação:** o fundador experimentou a sessão e
  **rejeitou o desenho dela antes do deploy** ("não vi diferença entre os
  flashcards e o modo estudo — pergunta e resposta, mesma coisa") — o
  desenho da sessão é substituído pela spec v1.8.0 (abaixo); a tabela
  `FlashcardState`, o SRS, o merge e o cascade permanecem válidos.
- **v1.8.0 — Trilhas de estudo + Sessão de flashcards V2**: spec
  **APROVADA pelo fundador em 27/out/2026** ("gostei, pode seguir") e
  **implementada no mesmo dia** (worklog Task 21 — código completo e
  verificado no sandbox; aguarda sync GitHub + deploy com passo de banco,
  receita em `docs/DEPLOY.md` §5/nota v1.8.0). Conteúdo: (I) estudo que
  confirmou a crítica do fundador (v1.7.0 = reconhecimento igual ao Estudar)
  e redesign da sessão para **evocação livre** (frente sem alternativas em
  282/300 cartões; 18 cartões "statement-selection" mantêm as afirmações na
  frente como enunciado; fluxo revelar → julgar (Errei/Acerte com projeção
  SRS nos botões) → auto-avançar; sem botão Pular; teclado 1/2;
  API /reveal + /grade); (II) **trilhas** = 7 domínios oficiais como
  currículo ordenado (rampa E→M→H, tranches de 10–50) com progresso
  **100% derivado de AttemptAnswer** (zero tabela nova) e modo TRAIL no
  attempt existente. **Correção embarcada (QA):** SW network-first para
  dados owner-scoped (spec §13 — contadores ficavam uma fetch atrás).
  Deploy: v1.8.0 direto (passo de banco da FlashcardState embutido — a
  sessão rejeitada da v1.7.0 nunca chega à produção).
- **v1.8.1 — Emenda do verso dos flashcards**: feedback do fundador
  **pós-deploy da v1.8.0 em produção** (28/out/2026: passos 1–5 feitos —
  sync GitHub, db:push:prod, redeploy, verificações, Neon pooled; "testei
  aqui tá ok, mas os flashcards — ao clicar em ver resposta aparece 4
  opções, com a 'correta' isso não faz o menor sentido. Só tem que aparecer
  a resposta do card"). Implementada no mesmo dia (worklog Task 22, spec
  v1.8.0 §14): o verso renderiza RESPOSTA (texto da alternativa correta;
  letra nas 18 statement-selection) + EXPLICAÇÃO + fonte + ID — as 4
  alternativas e a repetição do enunciado saem do verso. 100%
  frontend/i18n, sem passo de banco; bump v1.8.1 + popup 1 item.
  **Decisão registrada (28/out/2026): AZ-900 é a próxima certificação**
  (ainda por último na fila, por ordem anterior do fundador — ver
  Pendente).

## Fechado (entregue)

- **v1.6.0** (2026-10-27, spec `spec-v1.6.0-privacy-performance.md`,
  **publicada e verificada ao vivo** — Task 17): transparência de
  privacidade (seção "Privacidade e segurança" no Sobre com
  5 fatos auditados + reasseguro no modal de login com link) + performance
  (fim do duplo fetch de catalog via `langReady`, staleTime 24h, cache de
  borda s-maxage no `/api/catalog`) + fix de portabilidade do `prep.ts`
  (caminhos relativos + banco canônico `src/data`) + bump v1.6.0 com popup
  de 3 itens (inclui o anúncio do OG da v1.5.1 não publicada). Decisão do
  fundador registrada: login permanece como está (ver Adiado).
- **v1.5.1** (2026-10-27, spec `spec-v1.5.1-og-preview.md`, não publicada —
  embarcou na v1.6.0): fechamento da dívida #1 — OG/social preview completo: arte "bilhete de exame" 1200×630
  clara (a og:image) + gêmea escura como ativo, geradas por pipeline
  determinístico SVG→sharp (`bun run og`) com tipografia de marca;
  `metadataBase`/canonical/og:image(+alt/dimensões)/og:locale pt_BR+en_US/
  twitter summary_large_image; og:description com os números reais; bump
  v1.5.1 + popup de 1 item (compartilhar com cartão de prévia).
- **v1.5.0** (2026-10-27, spec `spec-v1.5.0-axon-convergence.md`):
  Convergência Axon — fatias 2 (IDs via `generateId`/`validateId` com
  `reason`), 3 (`computeChecksum` canônico + `contentVersion` opcional) e 4
  (manifesto validado pelo parser do hub, tolerância zero, no CI) adotadas
  sobre o pacote `@ironidesflj/axon@0.2.1`; deep-link com guard de ID;
  bump v1.5.0 + popup da expansão (300 questões, 6 simulados) + README em
  inglês. **Aplicada no GitHub e publicada pelo fundador em 2026-10-27**
  (CI/Red Team/manifest workflow aprovados; produção com health 300 e
  manifesto canônico — verificação independente no worklog Task 14).
- **v1.4.1** (2026-10-26): os 4 ajustes de UI do fundador — pills preenchidas,
  fundo colorido sutil, bloco de explicação preenchido, 15/16px no lugar da
  escala 20–32px.
- **v1.4.0** (2026-10-26): patch de design v1.1 aplicado — raio 6/10/14/20 +
  sombras, explicação na revisão, barras de sessão presas, controles na
  barra, shuffle por tentativa, multi-cert com "em breve", % colorida por
  domínio. O contrato de fonte 20–32px foi depois revisto pelo fundador
  ("ainda gigante") e substituído por 15/16px na v1.4.1.
- **Reparo de produção + publicação da expansão** (executado pelo GPT local
  do fundador): produção verificada ao vivo com `questions: 300` em
  2026-10-27.
- **Adoção do estado canônico** (Task 11): sandbox byte-equivalente ao repo
  do fundador (v1.4.1 + banco 300 + CI gate + Axon pin).

## Pendente (próximos passos naturais)

- **Performance de carregamento** (pedido do fundador 2026-10-27): diagnóstico
  medido em produção (worklog Task 15) — shell rápido, gargalo na camada de
  dados (~500ms quente / 1,4–2,4s frio ×2 chamadas na 1ª visita). **Feitos
  na v1.6.0**: (b) cache de borda no catalog, (c) fim do duplo fetch,
  (d) staleTime 24h. **Resta**: (a) env `DATABASE_URL` pooled do Neon (passo
  do deploy, maior ganho para chamadas autenticadas) e (e) bootstrap inline
  no HTML (opcional, só se o diagnóstico persistir após (a)).
- ~~V2 — flashcards~~ → **implementado na v1.7.0** (ver Autorizado; sessão
  redesenhada na spec v1.8.0).
- ~~V2 — trilhas de estudo personalizadas~~ → **spec escrita (v1.8.0,
  junto com o redesign da sessão de flashcards), aguardando aprovação do
  fundador** — ver Autorizado.
- Novas certificações em produção (a UI "em breve" já lista: **AI-900**,
  **DP-900**, **PL-300**, **SC-900**, **AZ-104**) — arquitetura multi-cert
  pronta desde a v1.4.0 (`ranvier:cert`, seletor, progresso por cert por
  construção); entrar com blueprint + banco de questões próprio.
  **Ordem definida pelo fundador 27/out/2026: POR ÚLTIMO — "quando não
  tiver mais nada pra mexer no app".** **Escolha definida 28/out/2026:
  a próxima é a AZ-900 (Azure Fundamentals)** — e o login Microsoft entra
  junto com a 1ª certificação Microsoft (ver seção Autenticação).
- ~~Atualizar o dossiê da equipe de design~~ — **parte in-repo fechada na
  Task 18** (`docs/sdd/fatias-dossie.md` §§1–2 corrigidos: DBDEA, IDs reais,
  registro marcado como desatualizado; nota no §6 sobre os exemplos az-900
  do guia). O que resta é **externo ao repo**: o guia Noos e o patch v1.1
  pertencem à equipe de design — encaminhar a correção quando conveniente
  (não bloqueia nada; a adaptação já está documentada na spec v1.4.0).
- ~~Avaliar traço do símbolo animado no carregamento~~ — **avaliado na
  Task 18** (patch v1.1 §14): desenhar o traço do símbolo via
  `stroke-dashoffset` (600–800ms) na primeira carga/skeletons é **viável,
  pequeno (1 componente + keyframes, 2 temas) e sem conflito com a
  anti-filosofia** (movimento de marca ≠ recompensa). Ponto honesto
  pós-v1.6.0: a carga ficou rápida (borda ~35ms) e a animação duraria mais
  que a espera — precisa cortar no ready (máx ~800ms, nunca atrasa
  conteúdo, respeita `prefers-reduced-motion`). **Decisão do fundador
  27/out/2026: EXCLUÍDA da v1.7.0 — "preciso reanalisar ela depois"**;
  fica este item como lembrete vivo da reanálise pendente (embarcar em
  lote futuro ou engavetar de vez).

## Propostas aguardando decisão do fundador

- **Login social opcional (GitHub / Google / Microsoft)** — pedido do
  fundador 2026-10-27 ("queria mudar esse formato de cadastro pra
  git/microsoft/google, o que for melhor. Mais seguro pra todos, não?").
  Análise completa no worklog Task 15; resumo:
  - O que OAuth REALMENTE melhora: elimina senhas no app (menos superfície,
  fim de credential stuffing), herda MFA do provedor, menos fricção.
  - Trade-offs honestos: o provedor passa a ver cada login (horário/frequência
    — para app de preparação de prova, anonimato tem valor pedagógico);
    dependência de conta de terceiro (bloqueio no Google = perda de conta);
    LGPD exige transparência sobre transferência internacional; 3 provedores
    = 3 registros/secrets/fluxos para manter.
  - Recomendação registrada: OAuth como **opção adicional** (email+senha e o
    modo 100% anônimo permanecem — a filosofia anonymous-first fica intacta);
    começar com **GitHub + Google** (público dev DBDEA hoje + alcance no
    Brasil), adicionar **Microsoft** junto com a 1ª certificação Microsoft
    (AI-900/DP-900 — o aluno já terá conta Microsoft para o exame real).
  - **É emenda de constituição**: o item "Rastreamento de usuários ou login de
    terceiros (Google/Microsoft/GitHub)" está hoje em "Fora de escopo (nunca)".
    A revogação é prerrogativa do fundador e deve ser registrada como ADR na
    spec quando decidir. A linha só sai de lá com decisão explícita.
  - Implementação (a decidir na spec): NextAuth v4 (padrão, menos risco) vs
    extensão manual do auth atual no estilo do repo (scrypt/HMAC/rate-limit
    já auditados por Red Team) — ambos viáveis; media de esforço.

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

- **Login social opcional (GitHub/Google/Microsoft)** — pedido do fundador
  2026-10-27, **adiado por decisão do fundador no mesmo dia** ("deixar o
  login do jeito que ta", seguindo a recomendação). A análise completa e a
  recomendação (OAuth como opção adicional, GitHub+Google primeiro,
  Microsoft junto com a 1ª cert Microsoft) estão no worklog Task 15 e na
  seção "Propostas" abaixo — reabrir quando o fundador quiser. Nota: o item
  "login de terceiros" segue em "Fora de escopo (nunca)" — revogar é
  emenda de constituição com ADR.
- **Pausar o simulado** (guia §"Pausar"): muda regra de negócio do exame
  cronometrado; exige spec própria com decisão do fundador sobre como o tempo
  pausado conta. Reabrir quando houver decisão.
- **Glossário bilíngue**: fora do escopo do patch de identidade; entra no V2.
- ~~**Domínio canônico `noos.study`**~~: resolvido como tarefa viva — o domínio
  existe e o hub está no ar; resta o flip de env (Autorizado, Fase 2).

## Dívidas conhecidas (impacto · motivo de aceitação · condição de reabertura)

1. ~~**Material de divulgação do link (OG/social preview)**~~ — **fechado na
   v1.5.1** (spec `spec-v1.5.1-og-preview.md`): og:image 1200×630 (arte clara
   "bilhete de exame"; gêmea escura como ativo), twitter card
   summary_large_image, apple-touch (já existia), textos PT/EN, zero métricas
   inventadas. Segue como follow-up natural (não dívida): cards por idioma
   quando houver rotas por idioma.
2. **Campo extra `db:"ok"` no `/api/health`** (divergência literal do contrato
   documentado; superconjunto inofensivo) — documentado no DEPLOY.md.
3. **Flip do domínio canônico pendente**: `noos.study` já está no ar (hub
   v10.2 + registry), mas o app continua apontando ao fallback até o env
   `NEXT_PUBLIC_NOOS_HUB_URL` ser setado na Vercel (Fase 2, acima) — por
   decisão de sequência: não acender link que 404 antes do primeiro
   manifesto no hub.

## Fora de escopo (nunca)

- Dumps ou reprodução de itens reais de exame (NDA).
- Rastreamento de usuários ou login de terceiros (Google/Microsoft/GitHub).
- Anúncios durante estudo/simulado ativos; anúncios só config-gated.
- Vender dados ou progresso; ranking/streak/avatar/confete (anti-filosofia
  do patch §1).

# plan.md — autorizado, pendente, adiado e fora de escopo

## Autorizado (em curso)

- **Deploy da v1.5.1** (fundador/GPT local, receita `docs/DEPLOY.md`): redeploy
  padrão na Vercel — sem mudança de schema/questões/DB. Confirmar
  `/api/health` = `questions:300` (inalterado) e `/og/og-image.png` = 200.
  (O deploy da v1.5.0 foi concluído em 2026-10-27 — produção confirmada ao
  vivo com health 300 e checksums canônicos no `/manifest.jsonl`, linha 1
  `sha256:95e20047…`.)
- **Fase 1 — acender o hub** (passo do mantenedor, fora do repo do app):
  committar o conteúdo de `public/manifest.jsonl` como `manifestos/RAN.jsonl`
  no repo do hub; o deploy seguinte acende 300 páginas PT/EN em
  `noos.study/{lang}/q/{ID}` + redirects de alias + sitemap.
- **Fase 2 — fatia 5 completa**: setar `NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study`
  nas envs da Vercel junto/com o hub aceso (badge e Comunidade apontam ao
  canônico vivo).

## Fechado (entregue)

- **v1.5.1** (2026-10-27, spec `spec-v1.5.1-og-preview.md`): fechamento da
  dívida #1 — OG/social preview completo: arte "bilhete de exame" 1200×630
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

# spec-v1.3.1-founder-feedback.md

Spec do lote v1.3.1 — feedback do fundador após a rodada QA/UX da v1.3.0
(mensagem de 2026-10-25). Formato: 8 blocos do Anexo A do guia Noos v1.1.

## 01 · Problema e objetivo

Quem: o fundador, usando o app e revisando os guias. Situações:

1. "By Noos" não aparece no rodapé — pedido tanto no patch quanto no
   checklist de lançamento do guia ("'by Noos', versão e política local-first
   aparecem no rodapé"), e a assinatura deixou de ser link contra a vontade
   dele ("pode voltar a ser link, no rodapé, solicitação minha").
2. A seção "Como o Ranvier ajuda você" existia no Ranvier anterior e foi
   removida na v1.3.0 — o fundador gostava dela e a quer de volta.
3. Sem aviso de novidades: atualizações chegam sem que o estudante saiba o
   que mudou.
4. Em questões com código, no celular, a barra de rolagem horizontal "não
   parava no lugar — passava pro lado e voltava automaticamente ao início".
5. Em estudo, a resposta maior costuma ser a correta (viés de tamanho).
6. Dúvida: sem domínio marcado + start, puxa todos os domínios?
7. Registrar dívida futura: material de divulgação atrelado ao link (OG).
8. O Anexo SDD do guia foi ou vai ser aplicado?

## 02 · Estado atual (com evidência)

1. v1.3.0 resolveu a divergência patch×guia colocando a assinatura no TOPO
   (rail); o rodapé ficou sem "by Noos" — contraria o checklist do guia.
2. Seção removida na v1.3.0 (redesign da landing); strings i18n sobreviveram.
3. Inexistente.
4. `markdown.tsx`: `components={{...}}` inline → identidade nova a cada render
   → ReactMarkdown remonta a árvore quando a tela-pai re-renderiza (timer do
   exame ticka 1×/s) → `<pre>` destruído → `scrollLeft` volta a 0. Além disso
   `overflow-x-auto` no mobile depende de barra horizontal frágil ao toque.
5. Medição (`scripts/option-length-report.ts`): correta é a mais longa em
   **81% (94/116)**; 67 questões com razão > 1,3 (pior 2,44×).
6. `study-view.tsx`: `domainCodes: length ? selected : undefined` → vazio =
   sem filtro = todos (comportamento implícito, UI desatada do efeito).
7. Nenhum registro formal.
8. Recomendação (d) do JOB 1 adiada ("migração gradual").

## 03 · Decisão e escopo (autorizado pelo fundador na mesma mensagem)

1. **"by Noos" vai para o rodapé de conteúdo** (landing + shell), como
   **link** para o hub (`hubHomeUrl(lang)`), mono 13 px + símbolo 14 px,
   alvo 44 px, 1× por tela; topo fica só com monograma + "Ranvier". ADR:
   decisão do fundador sobrepõe o "nunca como ação" do guia §02.
2. Restaurar "Como o Ranvier ajuda você" com 4 cards hairline (sem raio/sombra,
   ícone discreto app-ink), strings i18n existentes PT/EN.
3. `WhatsNewDialog` na tela inicial: abre quando `localStorage
   "ranvier:whatsnew:seen" !== APP_VERSION`; fechar registra a versão;
   conteúdo = 5 novidades PT/EN; `src/lib/version.ts` = fonte única.
4. Código: (a) mapa de componentes do ReactMarkdown hoisted para o escopo de
   módulo (fixa a causa-raiz da remontagem); (b) abaixo de md o `<pre>` usa
   `whitespace-pre-wrap break-words` (sem scrollbar horizontal no celular);
   desktop mantém `overflow-x-auto` + `overscroll-x-contain`.
5. Rebalancear alternativas dos 7 arquivos S1–S7 (7 editores paralelos):
   encurtar a correta sem perder precisão e/ou alongar distratores com detalhe
   verificavelmente errado; meta razão 0,85–1,2; proibido mudar
   key/stem/correctIndex/ordem/referências/dificuldade; re-seed idempotente
   (atualiza por chave, IDs públicas intactas, histórico preservado).
6. Modo estudo: todos pré-marcados (já era) + **exigir ≥1 domínio** para
   habilitar "Iniciar sessão", com aviso textual — comportamento explícito.
   Resposta direta ao fundador: antes vazio = todos (sem filtro); agora não
   existe mais o estado vazio ambíguo.
7. Dívida registrada em `plan.md` § Dívidas conhecidas (OG/social preview,
   com impacto/motivo/condição de reabertura).
8. **Anexo SDD aplicado**: `docs/sdd/` criado no formato do Anexo A
   (README/constitution/current-state/plan + esta spec).

Componentes afetados: `noos-badge.tsx`, `ranvier-app.tsx`, `home-view.tsx`,
`whats-new-dialog.tsx` (novo), `markdown.tsx`, `study-view.tsx`,
`results-view.tsx`, `i18n.ts`, `version.ts` (novo), `src/data/questions/*.ts`
(7), `package.json`, `public/sw.js`, `public/offline.html`, `docs/sdd/*` (5).

## 04 · Fora de escopo

- Produção das artes OG (só o registro da dívida) — exige decisão de design.
- Pausa do simulado; glossário bilíngue (continuam adiados no `plan.md`).
- Reordenação/embaralhamento de alternativas em runtime (quebraria o histórico
  de tentativas, que guarda índice; o viés de POSIÇÃO já é uniforme —
  28/32/28/28 — o problema era o tamanho).
- Qualquer mudança na lógica de exames, gabarito server-side, IDs, deep-links.

## 05 · Invariantes

- Estado do usuário preservado: progresso, tentativas e fila de revisão
  intactos (edição de texto de alternativa não invalida `selectedIndex`
  guardado; ordem e correctIndex inalterados).
- IDs públicas RAN-DBDEA imutáveis; re-seed atualiza por chave.
- Correção continua server-side; gabarito não exposto.
- Sem interrupção na tela de questão (popup só na landing).
- Local-First mantido; PWA continua funcionando offline.

## 06 · Aceitação e fidelidade

1. Rodapé mostra "by Noos" clicável (abre hub em nova aba) junto de
   Local-First + versão; topo sem assinatura; 1× por tela em landing e shell.
2. Landing contém "Como o Ranvier ajuda você" com os 4 cards (PT/EN).
3. Popup aparece 1× na primeira visita pós-atualização; recarregar não
   mostra de novo; muda a versão → mostra de novo.
4. Em 375 px, questão com código longo não gera scrollbar horizontal
   (scrollWidth == clientWidth); no desktop a rolagem lateral persiste estável
   durante o tick do timer (1 min de exame sem reset de `scrollLeft`).
5. Relatório de comprimento: 0 flags LONG/SHORT; correta-é-a-mais-longa
   ≤ ~15%; `validate-questions.ts` sem erros; `/api/health` 116 questões.
6. Sem domínio marcado → botão desabilitado + aviso; com ≥1 → inicia
   sessão só daqueles domínios.
7. `docs/sdd/` existe com os 5 arquivos; dívida OG registrada.
8. Lint/tsc zerados; zero erros de console; PT/EN sem vazamento.

## 07 · Verificação e riscos

- Comandos: `bun scripts/validate-questions.ts`,
  `bun scripts/option-length-report.ts`, `bun scripts/seed.ts` (após edições),
  `bun run lint`, `bunx tsc --noEmit`, `curl /api/health`, agent-browser
  (desktop 1440 + mobile 375): golden path estudo/exame + popup + rodapé +
  wrap de código.
- Riscos: (a) edição de conteúdo introduzir distrator arguível — mitigado por
  regra "só adicionar o que for verificavelmente errado; na dúvida, encurtar a
  correta" + validação estrutural; (b) regressão de foco/a11y nos footers —
  verificação de tab/outline; (c) popup assustar usuário novo — cópia
  tranquiliza ("uma vez por atualização"); (d) recuperação: reverter o commit
  restaura o estado anterior sem tocar em dados (seed é idempotente).

## 08 · Evidência e fechamento

- Métricas antes→depois do banco: 81% → 12% correta-é-a-mais-longa; 0 flags.
- Diff revisado: 7 arquivos de questões (só strings de opções), componentes
  citados, docs novos. Comandos e resultados no `worklog.md` (Task 8-x).
- Estado: local (sandbox) + commit v1.3.1; publicação em produção depende do
  reparo do banco (plano § Autorizado).
- Pendências: arte OG (dívida 1), publicação.

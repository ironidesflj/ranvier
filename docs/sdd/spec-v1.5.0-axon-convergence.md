# Spec v1.5.0 — Convergência Axon (fatias 2, 3 e 4) + publicação da expansão

**Data:** 2026-10-27 · **Status:** entregue e verificado (evidência no `worklog.md`, Task 13)

## Origem (decisão do fundador)

Após o relatório de comparação roadmap × dossiê de fatias (Task 12), que provou
empíricamente a divergência de checksum (300/300 linhas: algoritmo local
serializava o snapshot como objeto; o contrato do pacote trava array
`[statement, options, answer, reference]`) e a validação de CI por zod local em
vez do parser do hub, o fundador autorizou a execução:

> "sim. PS: (as 300 questoes ja estao no ar)"

O PS confirmou o estado de produção (`questions: 300`, verificado ao vivo) — a
correção dos checksums tinha de acontecer **antes** do primeiro manifesto ser
commitado no hub, quando ainda é gratuita (depois viraria quebra de contrato).

## Escopo executado

1. **Fatia 2 — IDs na escrita.** `src/lib/axon` deixa de ser implementação
   paralela (F1 in-repo, v0.1.0) e vira costura sobre o pacote
   `@ironidesflj/axon@0.2.1`: `generate-manifest.ts` emite IDs novas via
   `generateId("RAN", exam, lastIssued)`; `validate-questions.ts` e o gerador
   validam o registry com `validateId`, **logando o `reason`** de cada rejeição
   (critério de aceite da fatia). `GLI-` continua eterno como alias e segue
   proibido no campo `id` — nunca houve GLI- publicada (registry nasceu em RAN-,
   `aliases: []` em 100% das linhas).
2. **Fatia 3 — Checksum e version canônicos.** O gerador usa
   `computeChecksum(snapshot)` do pacote — o algoritmo TRAVADO sobre o array
   canônico. `version` deixa de ser hardcode: campo opcional `contentVersion`
   no `SeedQuestion` (ausente = 1; correção de typo em questão publicada bumpa
   o campo; a ID nunca muda). Banco e seed intactos — o campo vive só no
   manifesto.
3. **Fatia 4 — Manifesto validado pelo parser do hub, tolerância zero.** O
   gerador re-parseia o arquivo serializado com `parseManifest` e verifica
   checksum linha a linha com `verifyChecksum` ANTES de escrever; novo script
   `scripts/validate-manifest.ts` (idem + invariante app-side: toda linha
   mapeia para o id-registry) rodando no `ci.yml` E no `manifest.yml`.
   `schema.ts` local (zod) foi removido — o parser do pacote é o contrato.
4. **Fatia 5 — guard de deep-link.** `discussionUrl` valida a ID com
   `validateId` antes de montar a URL (constitution §3: link quebrado em ID
   publicada é violação de contrato — falha em render, não no clique). A ID no
   rodapé da questão (o "pode desde já" do dossiê §6) já existia.
5. **v1.5.0.** Bump sincronizado (`version.ts`, `package.json`, `sw.js`
   `ranvier-v1.5.0`, `offline.html`) + popup de novidades PT/EN anunciando a
   expansão (300 questões, 6 simulados, ID pública estável) — a primeira
   menção versionada da expansão, que tinha sido publicada sob o rótulo 1.4.1.
   README reescrito em inglês (regra permanente de doc pública).

## Aceitação (verificada)

- [x] `bun scripts/generate-manifest.ts` → 300 questões, **300 ok · 0
      rejeitadas · 0 divergências** pelo parser do hub; checksum da linha 1 =
      `sha256:95e20047…` (o mesmo que o pacote recalculava na auditoria da
      Task 12 — prova da convergência).
- [x] `bun run validate:manifest` → válido sob o parser do hub, zero
      tolerância; adicionado ao CI (`ci.yml` + `manifest.yml`).
- [x] `bun run validate:questions` → 0 erros / 0 warnings (300 questões),
      rejeições de ID agora com `reason`.
- [x] `bun run ci:gate` → PASS (strict), 0 findings; red team selftest 17/17.
- [x] `bun run lint` + `bunx tsc --noEmit` → limpos.
- [x] QA navegador: popup v1.5.0 (EN e PT, 3 itens, 1× por versão); fluxo de
      estudo até o estado graduado; ID `RAN-DBDEA-00063` no rodapé; botão
      Comunidade → `https://noos-hub.vercel.app/en/q/RAN-DBDEA-00063` (base
      fallback — `NEXT_PUBLIC_NOOS_HUB_URL` segue sem override no sandbox);
      badge "by Noos" → home do hub; zero erros de console; APIs 200/201 no
      dev.log; mobile 375 sem overflow horizontal.
- [x] `/api/health` → `{"status":"ok","db":"ok","certifications":1,"questions":300}`.

## O que NÃO mudou

- Banco de questões, enunciados, gabaritos, explicações, referências, seed,
  schema do banco, DTOs, tentativas antigas, IDs publicadas
  (`RAN-DBDEA-00001..00300`), registry (append-only, sem renumeração).
- UI do app (além do texto do popup de novidades) e fluxos de uso.
- Pin do pacote (continua `0.2.1` exato; subir a `0.2.2` é opcional — só docs).
- Nenhuma linha de GLI- foi introduzida; `aliases` permanece `[]` em todas as
  linhas.

## Próximos passos do mantenedor (fora do app)

1. **Deploy da v1.5.0** (Vercel) — leva o manifesto com checksums canônicos ao
   ar; conferir `/api/health` (questions: 300) e `/manifest.jsonl`.
2. **Fase 1 — acender o hub:** committar o conteúdo de
   `public/manifest.jsonl` como `manifestos/RAN.jsonl` no repo do hub
   (`noos-hub`); o deploy seguinte acende 300 páginas PT/EN em
   `noos.study/{lang}/q/{ID}` + redirects de alias + sitemap.
3. **Fase 2 — fatia 5 completa:** setar `NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study`
   nas envs da Vercel (badge e Comunidade passam a apontar ao canônico vivo).

# Ranvier — dossiê de contexto: o app, as fatias e o hub

**Para quem é este documento:** qualquer agent ou assistente (Claude, GPT,
Gemini, outro) que vá trabalhar no repositório do app **Ranvier** e que não
conheça o ecossistema **Noos**. Se você foi apontado para evoluir o app e não
faz ideia do que sejam "fatias", `RAN-DBDEA-00042` ou `GLI-` — está tudo aqui.

**Como usar:** cole este arquivo **inteiro** como primeira mensagem da sessão.
Depois: (1) leia as fontes canônicas do §3; (2) confirme o estado real no
repo; (3) proponha o trabalho da fatia escolhida com o mantenedor. Se a
janela de colagem for pequena, cole pelo menos o §11 (bloco mínimo).

**Versão 1 · 27/out/2026** — estado verificado ao vivo nesta data. O CAMINHO
das fatias pertence ao guia canônico (§3); a LEI pertence à constitution (§3).
Este dossiê manda apenas em **estado** e **ponteiros**. Em conflito:
**constitution > guia > este dossiê**.

> **ATUALIZAÇÃO 27/out/2026 (noite) — correção factual + v1.6.0 no ar:** este
> dossiê herdava do guia o exemplo “AZ-900” e chegava a dizer que o app era
> “questões da prova AZ-900 (Cloud)” — **erro**: o produto real é **DBDEA
> (Databricks Certified Data Engineer Associate)**, IDs `RAN-DBDEA-00001..00300`,
> aliases vazios. Corrigido nos §§1–2 com nota no §6. Também já está no ar o
> lote v1.6.0 (privacidade in-app + performance: cache de borda no catalog,
> fim do duplo fetch, staleTime 24h; OG/social preview da v1.5.1 embarcou
> nele — ver `docs/sdd/spec-v1.6.0-privacy-performance.md`).

> **ATUALIZAÇÃO 27/out/2026 (tarde) — app Ranvier, lote v1.5.0:** as fatias
> **2, 3 e 4 foram ADOTADAS** (ver §4). O gerador de manifesto agora emite
> IDs via `generateId`/`validateId` (com `reason` no log), checksums via
> `computeChecksum` (algoritmo canônico — o manifesto anterior divergia em
> 300/300 linhas e foi regenerado ANTES de qualquer publicação ao hub),
> `version` real via campo opcional `contentVersion`, e o CI valida com
> `parseManifest` + `verifyChecksum` (tolerância zero, `scripts/validate-manifest.ts`
> no `ci.yml` e no `manifest.yml`). Pin permanece 0.2.1. Próximo gatilho:
> Fase 1 (committar `manifestos/RAN.jsonl` no hub) + Fase 2 (env
> `NEXT_PUBLIC_NOOS_HUB_URL=https://noos.study`).

---

## 1. O problema que este dossiê resolve

O Ranvier não nasceu sozinho. Ele é o app consumidor #1 de um contrato
público (o pacote `@ironidesflj/axon`) e de um hub já no ar (`noos.study`) —
mas quase nada disso aparece dentro do repo do app, e o que aparece (um pin
solitário no lockfile, uma linha no `current-state.md`) não conta a história.
Um agent que enxerga só o repo não sabe: por que as IDs têm o formato
`RAN-AZ900-00042`, o que significa o prefixo legado `GLI-`, o que já foi
adotado, nem o que o hub já tem pronto esperando pelo app. Este documento
existe para fechar exatamente essa lacuna — ele é a transferência de memória
entre quem desenhou o contrato e quem vai evoluir o app.

## 2. O ecossistema em 90 segundos

- **Noos** — a marca-mãe. Hub público bilíngue em **https://noos.study**
  (PT/EN), repositório `ironidesflj/noos-hub` (privado), deploy Vercel
  **estático com build step** (sem função, sem rewrite — plano C, v10.2).
- **Axon** — a biblioteca compartilhada **`@ironidesflj/axon`**, publicada no
  npm (atual: **0.2.2**). Contém: gerador/validador de IDs, schema do
  `manifest.jsonl`, checksum SHA-256 e helpers de deep-link. É **o contrato**
  entre os apps e o hub. Zero dependência de runtime; **nunca** é serviço —
  sempre pacote linkado no build.
- **Ranvier** — o app deste dossiê: questões da prova **DBDEA (Databricks
  Certified Data Engineer Associate)** — IDs reais `RAN-DBDEA-00001..00300` —, no
  ar em **https://ranvier-seven.vercel.app/#/**, gerenciador de pacotes
  **Bun**. É o **consumidor #1 do Axon** (out/2026) — o precedente de tudo.
- **Synapse** — app irmão (ISTQB/CTFL), também em produção.
- **Você (agent)** cuida do repo do app. Hub e Axon têm manutenção própria:
  você **não mexe neles** — você consome o contrato.

Registro oficial da família (fonte única de status, viva):
**https://noos.study/noos.registry.json** — RAN: "em produção". ⚠️ O registro
ainda lista domínio "Cloud"/alias `GLI-` para RAN — **desatualizado** (o app
real é DBDEA, aliases vazios); correção no lado do hub é pendência do
mantenedor. Biblioteca `@ironidesflj/axon` 0.2.2 "publicada".

## 3. Fontes canônicas PÚBLICAS (leia antes de duvidar deste dossiê)

| O quê | URL | Papel |
|---|---|---|
| Guia de adoção — as 5 fatias verbatim | `https://unpkg.com/@ironidesflj/axon@0.2.2/docs/guia-de-adocao.md` | O CAMINHO |
| Constitution — a lei (IDs, manifesto, deep-link) | `https://unpkg.com/@ironidesflj/axon@0.2.2/constitution.md` | Lei máxima |
| CHANGELOG do pacote | `https://unpkg.com/@ironidesflj/axon@0.2.2/CHANGELOG.md` | Versões |
| Pacote no npm (página humana) | `https://www.npmjs.com/package/@ironidesflj/axon` | Publicação |
| Pacote no npm (API, máquina) | `https://registry.npmjs.org/@ironidesflj/axon/latest` | Versão vigente |
| Hub | `https://noos.study` | Site + rota `/q/{ID}` |
| Registro da família | `https://noos.study/noos.registry.json` | Status oficial |
| Spec da página de questão | `https://noos.study/spec-pagina-de-questao.md` | Como o hub serve |

Todas verificadas respondendo 200 em 27/out/2026 (a página do npm rejeita
bots com 403 — o conteúdo existe; use a API para consulta de máquina).

## 4. Estado verificado (27/out/2026)

**No app (Ranvier):**

- **Fatia 1 ADOTADA** (out/2026): `@ironidesflj/axon@0.2.1` com **pin exato**
  (`bun.lock`), registrada em `docs/sdd/current-state.md` do próprio app.
  A fatia é **inerte por desenho**: dependência linkada, **nada importado**,
  zero mudança em banco, seed ou questões. App no ar e funcional — o deploy
  da fatia 1 foi verificado externamente.
- Por que o pin está em 0.2.1 e não 0.2.2: a 0.2.2 é **só documentação** (o
  guia de adoção passou a embarcar no tarball). A API de código não muda
  desde a 0.2.0. Subir o pin é **opcional e sem pressa** — nada depende
  disso para as fatias seguintes.
- **Fatias 2, 3 e 4 ADOTADAS** (27/out/2026, lote v1.5.0 do app): o gerador
  de manifesto (`scripts/generate-manifest.ts`) e o validador do banco agora
  consomem o pacote diretamente — `generateId`/`validateId` (rejeições com
  `reason` no log), `computeChecksum` canônico (o manifesto foi regenerado:
  a versão anterior divergia em 300/300 checksums), `parseManifest` +
  `verifyChecksum` com **tolerância zero** no CI (`scripts/validate-manifest.ts`
  roda no `ci.yml` e no `manifest.yml`; o gerador também se auto-valida
  antes de escrever). `version` do manifesto é real (campo opcional
  `contentVersion` no seed; ausente = 1). Detalhes:
  `docs/sdd/spec-v1.5.0-axon-convergence.md`.
- **Fatia 5 — formato adotado, flip pendente**: a ID já aparece no rodapé da
  questão (corpo mono), o botão Comunidade e o badge já montam URLs no
  formato canônico `{base}/{lang}/q/{ID}` com validação de ID via pacote;
  a base segue o fallback até o env `NEXT_PUBLIC_NOOS_HUB_URL` apontar para
  `https://noos.study` (flip junto com a Fase 1).

**No hub (noos.study):**

- **v10.2 no ar** (plano C): a rota **`/q/{ID}` existe e é 100% estática** —
  zero funções, zero rewrites; tudo é arquivo gerado no build. Verificada
  externamente por impressão digital de arquivo (commit `bdf5d57`).
- **Zero manifestos = zero páginas**: hoje qualquer URL `/q/…` responde 404
  do hub (comportamento previsto). A primeira linha de
  `manifestos/RAN.jsonl` commitada no repo do hub **acende as páginas no
  deploy seguinte** — canônicas PT/EN em 200, redirects para aliases,
  sitemap crescendo.

## 5. ATENÇÃO — o que o guia publicado ainda não sabe

O guia no tarball (texto fixado em 26/out/2026) diz, na fatia 5: *"a página
`/q/{ID}` ainda não existe (Fase 2 do hub)"*. **Isso envelheceu em menos de
um dia.** O estado de hoje é:

- A rota **existe** desde a v10.2 — implementada, refinada e verificada no
  ar. Canônica: 200 estática. Alias: página de redirect (meta refresh 0s +
  canonical + `noindex,follow`, salto único). Forma sem idioma: salto único
  para PT. ID desconhecida: 404 do hub. Sitemap: cresce com cada canônica,
  sem alias.
- O que **ainda vale** daquele aviso: **sem manifesto no ar, o link do badge
  dá 404** — a regra de UX ("link visível que 404 é ruim") continua mandando.
  Na prática: o badge só **acende** junto com o primeiro manifesto real.
- Consequência: a **fatia 4 do app virou o gatilho de tudo**. Publicar o
  artefato `manifest.jsonl` destrava o hub inteiro — e o lado de lá já está
  pronto, verificado, esperando.

## 6. As cinco fatias, no código do Ranvier

Resumo executivo. O detalhe com exemplos de código mora no guia (§3) — em
conflito, o guia vence. Cada fatia entra **sozinha, atrás de feature flag**,
e nenhuma toca o banco de questões por si só.

> **Nota sobre os exemplos deste §6:** eles citam `az-900`/`RAN-AZ900-…`
porque **transcrevem os exemplos didáticos do guia** (o mecanismo é o mesmo
para qualquer prova). No Ranvier **real**, a prova normalizada é `dbdea` —
as IDs publicadas são `RAN-DBDEA-00001..00300`, o campo `aliases` está vazio
e `GLI-` nunca foi publicada.

**Fatia 1 — Linkar** ✅ **FEITA.** Pin exato + lockfile commitado + registro
no current-state. Aceitação já batida: lint, typecheck e CI verdes;
comportamento do app idêntico.

**Fatia 2 — IDs na escrita** ✅ **FEITA** (v1.5.0). A flag `axon-ids` não foi
necessária: a adoção substituiu a implementação local equivalente sem
mudança de comportamento observável (registry imutável preservado;
rejeições agora logam `reason`).
- Toda ID nova nasce pelo Axon: `generateId('RAN', 'az-900', 41)` →
  `"RAN-AZ900-00042"` (prova normalizada). Toda ID passa por `validateId`
  antes de salvar; o `reason` da rejeição vai para o log.
- A ID **canônica** usa sempre o prefixo oficial `RAN-`. `GLI-` é **alias
  histórico**: valida com `validateAliasId`, mora no campo `aliases` e é
  **rejeitada no campo `id`** — proposital (a oficial é a canônica).
- O mapeamento `GLI-AZ900-00012 ↔ RAN-AZ900-00042` é **dado do app, por
  questão** — uma tabela no banco do emissor; os sequenciais são
  independentes. `aliasOf(alias, canonica)` valida o par; o Axon não guarda
  a tabela.
- `generateId` é puro: o contador (`lastIssued`) é do app — o Axon nunca
  emite nem guarda estado.
- **Aceitação:** nenhuma ID entra no banco sem passar por
  `validateId`/`generateId`; rejeições logadas com `reason`; legadas
  preservadas em `aliases` para sempre.

**Fatia 3 — Checksum e version** ✅ **FEITA** (v1.5.0). `computeChecksum` do
pacote no gerador; manifesto regenerado ANTES de qualquer publicação ao hub
(a divergência anterior — objeto × array — nunca saiu do app). `version`
real: campo opcional `contentVersion` no seed (ausente = 1).
- No salvar/editar de questão: `version += 1` e
  `checksum = computeChecksum(snapshot)` — formato `"sha256:<64 hex>"`,
  SHA-256 sobre o JSON canônico de `[statement, options, answer, reference]`.
- O algoritmo é **travado**: mudança nele é MAJOR com aviso de 90 dias. É o
  mesmo checksum que o hub vai conferir — o calculado hoje é o válido amanhã.
- **Aceitação:** todo save/edit grava `version` e `checksum`; o app (ou um
  teste do CI) recusa edição sem os dois.

**Fatia 4 — Manifesto no CI** ✅ **FEITA** (v1.5.0). `parseManifest` +
`verifyChecksum` linha a linha, tolerância zero — no gerador (antes de
escrever) e no CI (`scripts/validate-manifest.ts` no `ci.yml` e no
`manifest.yml`). **Este é o gatilho do hub — manifesto pronto para o
mantenedor committar como `manifestos/RAN.jsonl`.**
- O CI publica um artefato `manifest.jsonl`: **uma linha por questão, os 9
  campos** (`id, exam, topics, difficulty, lang, version, checksum,
  aliases, snapshot`), aliases incluídas.
- Valida com o **mesmo parser que o hub usará**:
  `parseManifest(conteudo)` — qualquer `Rejection{lineNumber, reason}`
  **falha o CI** (zero tolerância para quem publica; tolerar linha suja é
  direito do lado do hub) — e `verifyChecksum(q.snapshot, q.checksum)` linha
  a linha.
- **Aceitação:** o CI falha se qualquer linha for rejeitada ou checksum
  divergir; o artefato sai a cada build.

**Fatia 5 — Badge e deep-link** · formato adotado (v1.5.0); falta o flip de env
- As URLs já são contrato estável:
  `canonicalUrl('RAN-AZ900-00042', 'pt')` → `https://noos.study/pt/q/RAN-AZ900-00042`;
  `fallbackUrl(…)` → domínio vercel.app (plano B).
- **Pode desde já (JÁ IMPLEMENTADO no app):** a ID no rodapé da questão
  (corpo mono, discreta — é ela que o aluno copia para citar) e a montagem
  de URL no formato canônico com validação de ID via pacote.
- **Badge:** `href` = canônico, **zero fetch ao hub em runtime** (link, não
  dependência — §3 da constitution). Acender só quando o primeiro manifesto
  estiver no ar (ver §5).
- **Aceitação:** badge aponta para o canônico; sem fetch em runtime.

**Armadilhas conhecidas** (do guia): `GLI-` no campo `id` é rejeitada;
`generateId` não guarda contador (sem estado entre chamadas, por construção);
a fatia 4 **pressupõe** as fatias 2 e 3 (o manifesto carrega IDs válidas e
checksums de verdade); **SM-2 não está no pacote** — decisão deliberada,
sobe só quando doer em dois apps.

## 7. O fluxo ponta a ponta (por que as fatias existem)

O aluno resolve a questão no app e cita a questão pela URL pública do hub.
A cadeia completa:

1. O app emite a ID (`RAN-…`) no salvar — **fatia 2** — e grava
   checksum/version — **fatia 3**.
2. O CI do app publica `manifest.jsonl` — **fatia 4**.
3. O mantenedor committa o manifesto como `manifestos/RAN.jsonl` no repo do
   hub.
4. O build do hub gera: canônica 200 (PT/EN), redirects de alias, sitemap
   +1 — páginas no ar em `noos.study/{lang}/q/{ID}`.
5. O badge na questão aponta para a canônica — **fatia 5**.

O hub **nunca** puxa do app em runtime — a relação é **link, não
dependência**. O registro do hub (`noos.registry.json`) já aponta a volta:
o campo `url` de RAN alimenta o link "volta ao app" nas páginas `/q/`.

## 8. Regras inegociáveis (constitution, resumida em 6 linhas)

1. **Pin exato** (sem `^` nem `~`), lockfile commitado, versão registrada no
   `current-state.md` de quem consome.
2. **Cada fatia entra sozinha, atrás de feature flag.** Não existe big-bang.
3. **MAJOR do pacote nunca quebra ID publicada** — IDs, aliases e deep-links
   são para sempre.
4. **`GLI-` vale para sempre como alias**; novas IDs nascem `RAN-`.
5. O banco de questões **não migra de repo** nesta fase.
6. O Axon **nunca emite ID nem guarda estado**; nunca serviço — sempre
   pacote linkado no build.

## 9. Roteiro sugerido para você (agent)

1. Leia as fontes do §3 — guia de adoção e constitution, no mínimo.
2. Confira o estado **real** no repo: `bun.lock` (pin exato 0.2.1?),
   `docs/sdd/current-state.md` (registro da fatia 1?), flags existentes.
3. Escolha com o mantenedor a próxima fatia: **2 e 3 são internas** (sem
   dependência do hub, podem andar juntas em flags separadas); a **4
   destrava o hub** (e é o gatilho das páginas públicas); a **5 fecha o
   ciclo** (só acende com o primeiro manifesto no ar).
4. Implemente atrás de flag, honrando os critérios de **aceitação** de cada
   fatia (§6).
5. Reporte sempre: o que mudou, qual flag, como validar e — importante —
   **o que NÃO mudou** (banco, seed, questões, IDs publicadas).
6. Ao concluir qualquer fatia, registre no `docs/sdd/current-state.md` do
   app. É lá que vive o estado federado: **não existe quadro central** —
   cada repo carrega o seu registro.

## 10. Precedência e manutenção deste dossiê

- Em conflito: **constitution > guia de adoção > este dossiê** (o dossiê só
  manda em estado e ponteiros, nunca em como fazer).
- Este é um instantâneo de 27/out/2026. Ao adotar a próxima fatia,
  atualize-o.
- **Recomendação ao mantenedor:** commitar este arquivo como
  `docs/sdd/fatias-dossie.md` no repo do Ranvier. Assim, todo agent futuro
  lê o contexto direto do repo — e a memória deixa de depender de colagem
  em sessão. (O repo do app é privado: nenhum risco de exposição.)

## 11. Bloco mínimo (se a janela de colagem for pequena)

```text
App: Ranvier (questões DBDEA/Databricks, Bun, ranvier-seven.vercel.app) — família Noos.
Contrato: pacote @ironidesflj/axon no npm (pin exato 0.2.1; nunca serviço).
Já adotado: fatias 1–4 (1 link; 2 IDs na escrita via generateId/validateId
com reason; 3 checksum canônico computeChecksum + contentVersion; 4
manifest.jsonl validado no CI pelo parser do hub, zero rejeições — 300 linhas,
RAN-DBDEA-00001..00300, aliases vazios, GLI- nunca publicada).
Falta: fatia 5 completa = flip de env NEXT_PUBLIC_NOOS_HUB_URL→noos.study,
junto com a Fase 1: committar manifestos/RAN.jsonl no hub (300 páginas
acendem no deploy seguinte).
Hub: rota /q/{ID} PRONTA e 100% estática (v10.2, out/2026); hoje 404 porque
não há manifesto; acende no primeiro manifestos/RAN.jsonl commitado no hub.
Leia antes de agir: https://unpkg.com/@ironidesflj/axon@0.2.2/docs/guia-de-adocao.md
Não fazer: big-bang; GLI- no campo id; migrar o banco; fetch ao hub em
runtime; mexer no pin sem motivo.
```

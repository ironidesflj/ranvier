# spec-v1.6.0-privacy-performance.md — Transparência de privacidade + performance de carregamento

Data: 2026-10-27 · Lote: **v1.6.0** · Status: implementado e verificado no
sandbox (ver "Verificação" e worklog Task 16).

## Pedidos e decisões

- **Fundador (2026-10-27)**: "pode seguir na ordem que preferir" → ordem
  escolhida: performance (como recomendado) + o pedido explícito deste lote:
  *"Inclua essa informação de segurança no app, avisando que o cadastro é
  seguro, que eu não tenho acesso, lgpd etc."*
- **Login social**: o fundador decidiu **deixar o login como está** ("vou
  seguir seu conselho por enquanto"). A linha "login de terceiros" PERMANECE
  em "Fora de escopo (nunca)" do plan.md — intocada; a análise/proposta fica
  documentada para reabertura futura.
- **Fix do GPT local do fundador**: `scripts/ci_gate/prep.ts` tinha caminhos
  absolutos `/home/z/my-project` (quebrava em qualquer outra máquina). Adotado
  e melhorado: além dos caminhos relativos, o script agora lê o **banco
  canônico** (`src/data/questions` + `src/data/guide.ts`) — a versão anterior
  lia `scripts/data_fixed/data`, que NÃO existe mais no repo (na máquina do
  fundador existe uma cópia antiga de 116 questões → geraria digest de stems
  incompleto para dedup de novos lotes).

## 1. Transparência de privacidade (o pedido explícito)

Princípio de copy: **só afirmações verdadeiras e verificáveis no código**
(auditoria factual na Task 15). A frase "não temos acesso aos seus dados" foi
deliberadamente NÃO usada — o mantenedor é admin do banco (acesso técnico
existe); a promessa correta e defensável é outra: **a senha é ilegível até
para a manutenção** (hash scrypt salgado), e **os dados nunca vão para
terceiros**. Isso transmite a mesma segurança sem criar promessa falsa.

- **Seção "Privacidade e segurança" no Sobre** (entre Metodologia e Autor):
  5 pontos com ícones próprios (KeyRound/Mail/EyeOff/Ghost/Trash2):
  1. senha → hash salgado scrypt, ilegível e irreversível até para a manutenção;
  2. dados mínimos — e-mail (nome opcional), só progresso de estudo;
  3. sem rastreadores/analytics, **sem anúncios hoje** ("hoje" porque ads são
     config-gated por constituição), nada compartilhado ou vendido;
  4. anônimo por padrão — progresso no navegador; conta só para sincronizar;
  5. LGPD — exclusão self-service a qualquer momento em Ajustes, com cascade
     (apaga tentativas e respostas, sem órfãos).
- **Reasseguro no modal de login/cadastro** (o ponto exato da decisão):
  filete + cadeado + "Sua senha vira um hash que ninguém consegue ler — nem a
  manutenção do projeto. Sem terceiros, sem venda de dados." + link "Saiba
  como protegemos seus dados" → fecha o modal e navega ao Sobre (hash router).
- PT/EN completos no i18n.

## 2. Performance de carregamento (menu da Task 15, itens b/c/d)

Diagnóstico medido em produção: shell rápido (TTFB 30ms, load 186ms), gargalo
na camada de dados — catalog ~500ms quente / 1,4–2,4s frio, chamado DUAS
vezes na primeira visita. Correções em código neste lote:

- **(c) Fim do duplo fetch**: `LanguageProvider` expõe `langReady` (flipa no
  mesmo efeito que resolve o idioma persistido/navegador pós-hidratação); as
  queries de catalog esperam `enabled: langReady` — exatamente UMA chamada
  dispara, já no idioma resolvido. Sem risco de hydration mismatch
  (resolução continua pós-hidratação, como antes).
- **(d) `staleTime` 24h** nos 4 consumidores de catalog (home, study, cert,
  cert-selector): o conteúdo só muda quando o banco muda (deploy/reseed).
  `isLoading`→`isPending` (React Query v5) para o skeleton continuar correto
  durante o gate.
- **(b) Cache de borda no `/api/catalog`**: `Cache-Control: public,
  s-maxage=300, stale-while-revalidate=86400` — payload público por idioma;
  tira o round-trip de DB (~500ms) do caminho do primeiro hit de visitantes
  sem cookie. Nota: requisições COM cookie (retornantes) podem não usar o
  cache de função da Vercel — o ganho estrutural para esses é o item (a).
- **(a) Connection string pooled do Neon** (`-pooler.` no host) — **passo do
  mantenedor**, zero código (só env na Vercel). É o maior ganho isolado para
  as chamadas autenticadas (attempts/me). Incluído na receita de deploy abaixo.
- **(e) bootstrap inline** — permanece opcional/não feito (mudança maior,
  só com spec própria se o diagnóstico persistir após (a)).

## 3. Bump v1.6.0 + prep.ts portátil

- Versão: `version.ts`, `package.json`, `sw.js` (`ranvier-v1.6.0`),
  `offline.html` — mesmo lote (regra do SDD).
- Popup whats-new PT/EN com **3 itens** (cartão de compartilhamento +
  transparência de privacidade + carregamento mais rápido): a v1.5.1 (OG) não
  chegou a ser publicada — se o fundador sincronizar direto para a v1.6.0, o
  usuário de 1.5.0 vê tudo de uma vez; se publicar 1.5.1 e depois 1.6.0, só
  há redundância inofensiva no popup.
- `scripts/ci_gate/prep.ts`: raiz resolvida via `import.meta.dir` (funciona
  de qualquer cwd/máquina); banco canônico `src/data`; `url_check.tsv`
  opcional; `scripts/expansion/` criada automaticamente. Verificado:
  allowlist regenerada com 76 URLs (preservação intacta), digest com 300
  stems, **gate PASS strict depois da regeneração**.

## Incidente de sandbox (registrado com honestidade)

O SQLite local (`db/custom.db`) foi zerado às 16:18 (entre tasks; nenhuma
operação deste lote toca o banco — a API respondeu honestamente "vazio").
Correção padrão: `bun run db:seed` (idempotente) → health = 300 → POST
/api/attempts = 201 → fluxo do simulado re-verificado no navegador.
**Produção (Neon) não foi afetada.**

## Verificação (evidência no worklog Task 16)

- Gates: lint 0 · tsc 0 · validate:questions 300 · validate:manifest 300/0/0 ·
  ci:gate --strict PASS (0 findings) · red team selftest 17/17.
- Navegador: **1 única chamada de catalog** na carga limpa (contada no log do
  servidor — antes eram 2; as 2 entradas do network log do browser são a
  mediação do service worker, 1 hit real); popup v1.6.0 (3 itens, 1×/versão);
  seção Privacidade com 5/5 pontos (EN e PT, DOM verificado); reasseguro no
  modal + link navega ao Sobre; simulado iniciado ("Questão 1 de 45",
  `#/simulado/{id}`); mobile 375 sem overflow; zero erros de console/página;
  `cache-control: public, s-maxage=300, stale-while-revalidate=86400` no
  response do catalog.

## Deploy (receita do mantenedor)

1. Sincronizar o lote (código v1.6.0 + prep.ts + `scripts/generate-icons.ts`
   e `scripts/generate-og.ts` commitados — ver worklog Task 16).
2. **Env `DATABASE_URL`**: trocar pela connection string **pooled** do Neon
   (host com `-pooler.`) — item (a), o maior ganho para chamadas autenticadas.
3. Redeploy padrão (sem passo de DB — nada de schema/questões mudou) e
   conferir: `/api/health` = 300 · `/og/og-image.png` = 200 ·
   `/api/catalog?lang=pt` com `cache-control: s-maxage` no header.

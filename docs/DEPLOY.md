# Ranvier — Guia de Implantação (DEPLOY.md)

**Versão:** 1.0.0 · **Data:** 2026-10-23 · **Status:** Documento operacional (complementa `docs/SDD.md` e `worklog.md`)
**Pilha alvo:** GitHub → **Neon Postgres** → **Vercel** · **Executor-alvo:** o "GPT local" do fundador, com acesso à pasta do projeto e conexão git.
**Autor do produto:** Ironides Junior — <https://github.com/ironidesflj> · <https://www.linkedin.com/in/ironjunior/>

> **Convenções deste guia:**
> - Placeholders em `<MAIÚSCULAS>` — substitua pelo valor real e **nunca** escreva segredos em arquivo versionado (`.env`, commits, chats).
> - Todos os comandos foram escritos para rodar a partir da raiz do clone (`ranvier/`), com **bun** instalado.
> - Se um passo falhar, vá direto à seção **11. Troubleshooting** antes de improvisar.
> - Nenhuma etapa deste guia cobre o hub Noos em si — o Ranvier **não depende do hub em runtime** (anti-SPOF). O hub consome o `manifest.jsonl` publicado por CI, no build dele.

---

## 1. Visão geral e pré-requisitos

### 1.1 O que está sendo implantado

- **Ranvier** ("by Noos") — app gratuito de estudos/simulados para a certificação **Databricks Certified Data Engineer Associate**, parte do ecossistema **Noos** (hub: `noos.study`, com fallback gratuito `https://noos-hub.vercel.app`).
- **Stack:** Next.js 16 (App Router, rota única `/` com hash-routing), TypeScript, Tailwind 4, shadcn/ui, Prisma.
- **Banco:** SQLite no sandbox (`prisma/schema.prisma`) · **produção = Neon Postgres** (`prisma/schema.prod.prisma`, mesmos models, provider `postgresql`). Os dois arquivos são mantidos sincronizados a cada mudança de model — se você alterar um, altere o outro.
- **Contrato do hub:** `public/manifest.jsonl` (116 linhas, uma por questão, com ID pública `RAN-DBDEA-#####` e checksum) — servido como arquivo estático e publicado por CI (seção 7).
- **Regras do ecossistema que o deploy preserva:** núcleo de estudo **gratuito para sempre, sem paywall**; o app é dono das questões e do progresso, o hub é dono das discussões; anúncios (se habilitados) **apenas** na página de resultado e zonas estáticas de rodapé; privacidade: **sem rastreamento individual** (analytics no máximo agregado/anônimo).

### 1.2 Contas necessárias (todas com free tier suficiente)

| Conta | Onde | Uso |
|---|---|---|
| GitHub | <https://github.com> (conta `ironidesflj`) | Repo-fonte + CI do manifest |
| Neon | <https://neon.tech> | Postgres gerenciado (free tier) |
| Vercel | <https://vercel.com> (plano Hobby, grátis) | Build + hosting + serverless |

### 1.3 Ferramentas locais

- **bun** ≥ 1.x — instalar: `curl -fsSL https://bun.sh/install | bash` (reabrir o terminal depois; conferir com `bun --version`).
- **git** — `git --version` (qualquer versão recente serve).
- `openssl` (para gerar `SESSION_SECRET`) e `curl` (verificações) — presentes em Linux/macOS por padrão.

### 1.4 Smoke test local (opcional, mas recomendado)

Confirme que o projeto roda no sandbox antes de mexer em produção (a partir da raiz):

```bash
bun install                     # dependências (+ postinstall gera o client Prisma sqlite)
bun run db:push                 # cria/atualiza o SQLite local (db/custom.db, via .env)
bun scripts/seed.ts             # seed idempotente: 1 certificação + 7 domínios + 116 questões
bun scripts/validate-questions.ts   # deve terminar com 0 erros (estrutura + IDs públicas)
bun run dev                     # http://localhost:3000
```

> Num clone **fresco** (sem `.env`): `cp .env.example .env` antes do `db:push`. Se você já tem a pasta do projeto com `.env` e `db/` funcionando, ignore.

---

## 2. Preparar o repositório GitHub

### 2.1 Estado atual do repo (verificado em 2026-10-23)

- Branch ativa: `main`.
- `.gitignore` **já cobre** `.env*`, `db/`, `dev.log`, `server.log`, `*.log`, `node_modules`, `.next/` — ou seja, **segredos e banco local não sobem** (a correção do vazamento histórico já foi aplicada: `.env` e `db/custom.db` foram removidos do índice).
- **Pendência real:** os arquivos da adaptação Noos Fase 1 ainda estão **não-commitados** (`.github/`, `LICENSE`, `LICENSE-CONTENT.md`, `prisma/schema.prod.prisma`, `public/manifest.jsonl`, `public/brand/`, `scripts/generate-manifest.ts`, `src/components/app/noos-badge.tsx`, `src/data/questions/id-registry.ts`, `src/lib/axon/`, `src/lib/site.ts`, `src/styles/` + modificações). Eles **precisam** entrar no commit — o CI do manifest e o build de produção dependem deles.
- **Higiene recomendada antes do push público:** artefatos de sandbox estão trackeados (`tool-results/`, `.zscripts/`, `examples/`, `mini-services/`, `download/`, `tests/`, `Caddyfile`, `cli_readme.md`, `upload/`). Não quebram nada, mas não pertencem a um repo público.

### 2.2 Higiene (recomendado — decisão do fundador)

```bash
# 1) deixar de trackear artefatos de sandbox (arquivos continuam no disco)
git rm -r --cached tool-results .zscripts examples mini-services download tests upload Caddyfile cli_readme.md 2>/dev/null || true

# 2) ignorá-los daqui em diante
printf '\n# sandbox artifacts (not part of the product)\ntool-results/\n.zscripts/\nexamples/\nmini-services/\ndownload/\ntests/\nupload/\nCaddyfile\ncli_readme.md\n' >> .gitignore
```

> **Ressalva:** o `worklog.md` é o histórico vivo do projeto e deve continuar versionado — mas ele cita contas de teste usadas no sandbox. Leia-o uma vez com olhos de "isto vai ficar público?" antes do go-live.

### 2.3 Commit inicial da Fase 1 e push

No GitHub (web): **New repository** → nome sugerido **`ranvier`** → owner `ironidesflj` → **Private** durante o setup (flip para Public no lançamento, se desejar — as licenças MIT + CC BY-SA 4.0 já estão no repo) → **não** inicializar com README/license (já existem no projeto).

De volta ao terminal, na raiz:

```bash
# 3) conferir que NADA sensível está trackeado (a saída deve ser vazia)
git ls-files | grep -E '^\.env|^db/|dev\.log|server\.log' || echo "OK: nada sensível trackeado"

# 4) commitar a Fase 1 (adaptação Noos) — ajuste a mensagem a gosto
git add -A
git commit -m "feat(noos): Ranvier Phase 1 — brand, public IDs, manifest contract, prod schema, licenses"

# 5) conectar ao remoto e publicar
git remote add origin https://github.com/ironidesflj/ranvier.git
git push -u origin main
```

**Verificação:** a página do repo mostra `LICENSE` (MIT), `LICENSE-CONTENT.md` (CC BY-SA 4.0), `.github/workflows/manifest.yml` e `public/manifest.jsonl`. O primeiro push contém `src/data/questions/**`, então o workflow **manifest** vai rodar uma vez (seção 7) — deve ficar **verde** terminando em `manifest.jsonl unchanged — nothing to publish.` (o manifesto atual já está commitado). Se ficar vermelho: seção 11.

---

## 3. Criar o banco Neon Postgres

1. Acesse <https://neon.tech> → sign up (pode usar login GitHub).
2. **New Project** → nome sugestivo (ex.: `ranvier`) → escolha a **região** mais próxima da região das funções da Vercel (a latência de *cada query* depende disso; ex.: projeto Neon em US East ↔ funções Vercel em Washington `iad1`). O free tier basta.
3. No dashboard do projeto → **Connection Details** → copie a **connection string *pooled*** (o host contém `-pooler`). Ela tem a forma:

```
postgresql://<USUARIO>:<SENHA>@<HOST>-pooler.<REGIAO>.aws.neon.tech/<DB>?sslmode=require
```

> **Regras de ouro:**
> - Use sempre a string **pooled** com `sslmode=require` — é ela que vai para a Vercel (functions serverless abrem muitas conexões curtas; o pooler do Neon aguenta isso no free tier).
> - Guarde-a num gerenciador de senhas. **Não** comite, **não** cole em chat/issue.
> - Se o Prisma reclamar de conexão via pooler, anexe `&pgbouncer=true&connection_limit=1` (compatibilidade com PgBouncer).
> - Onde ela é usada: (a) variável `DATABASE_URL` na Vercel (passo 4); (b) prefixo `DATABASE_URL="..."` em comandos pontuais locais (passo 5). **Nunca** substitua permanentemente o `.env` local (o sandbox usa SQLite).

---

## 4. Importar na Vercel

1. <https://vercel.com> → sign up/login com GitHub → autorize o acesso ao repo `ironidesflj/ranvier`.
2. **Add New… → Project** → **Import** o repositório `ranvier`.
3. **Framework Preset:** Next.js (detectado automaticamente — não mude).
4. **Build Command — OVERRIDE obrigatório** (campo "Override" em Build & Output Settings):

```
bun run build:vercel
```

> **Por quê:** `build:vercel` = `prisma generate --schema prisma/schema.prod.prisma && next build`. Ou seja: na Vercel o client Prisma é gerado a partir do **schema de produção (Postgres)** antes do `next build` — e não a partir do `prisma/schema.prisma` (SQLite, sandbox). Sem isso, o build gera o client errado e o deploy quebra em runtime com engine mismatch. (Mesmo que o `postinstall` (`prisma generate`, schema sqlite) rode no install, a geração explícita do `build:vercel` acontece **depois** e é ela que vale para o build.)

5. **Install Command:** padrão — a Vercel detecta **bun** via `bun.lock`/`package.json` e roda `bun install`. Se por qualquer motivo aparecer `npm install`, sobrescreva para `bun install`. (Não é preciso "instalar bun na Vercel": a plataforma já o provê no builder.)
6. **Environment Variables** (escopo **Production**; adicione também em Preview se quiser testar PRs):

| Variável | Valor | Obrigatória? |
|---|---|---|
| `DATABASE_URL` | `<SUA_CONNECTION_STRING_NEON_POOLED>` (com `sslmode=require`) | **Sim** |
| `SESSION_SECRET` | saída de `openssl rand -hex 32` (gere agora, guarde no gerenciador de senhas) | **Sim em prod** — assina (HMAC) os cookies `ct_anon`/`ct_session`. **Nunca** reutilize o valor do sandbox. Os nomes dos cookies são internos e **não devem ser renomeados**. |
| `NEXT_PUBLIC_NOOS_HUB_URL` | `https://noos-hub.vercel.app` (default; explícito aqui para facilitar a troca futura) | Não (tem default) |
| `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `NEXT_PUBLIC_ADSENSE_SLOT_RESULTS`, `NEXT_PUBLIC_ADSENSE_SLOT_GUIDE` | *(vazio — ads desligados por padrão; ver seção 8)* | Não |

7. **Região:** Settings → Functions → Region — deixe alinhada à região escolhida no Neon (passo 3) para minimizar latência de query.
8. **Deploy** → acompanhe o build (≈ 2–4 min). Concluir com sucesso é esperado **mesmo com o banco vazio** — mas até o passo 5 o app vai responder erro/erro silencioso em `/api/catalog` e não iniciará sessões de estudo. Isso é normal.

**Verificação parcial:** abra `https://<SEU_APP>.vercel.app/` — a página carrega (shell + tema). `/api/catalog` ainda **não** serve JSON até o passo 5.

---

## 5. Inicializar o banco de produção

A partir da máquina com o clone (raiz do projeto), com `bun` instalado. **Ordem importa** — cada passo existe por um motivo:

```bash
# (0) dependências em dia
bun install

# (1) regenera o client Prisma com o schema de PRODUÇÃO (provider postgresql)
bun run db:generate:prod

# (2) cria as tabelas no Neon (usa o schema prod; SEM --accept-data-loss, por design)
DATABASE_URL="<SUA_CONNECTION_STRING_NEON_POOLED>" bun run db:push:prod

# (3) popula: 1 certificação + 7 domínios + 116 questões (idempotente)
DATABASE_URL="<SUA_CONNECTION_STRING_NEON_POOLED>" bun scripts/seed.ts

# (4) VERIFICAÇÃO: deve imprimir "questions: 116" (roda enquanto o client prod está ativo)
DATABASE_URL="<SUA_CONNECTION_STRING_NEON_POOLED>" bun -e 'const {PrismaClient}=require("@prisma/client");const db=new PrismaClient();db.question.count().then(async n=>{console.log("questions:",n);console.log("certifications:",await db.certification.count());await db.$disconnect()})'

# (5) VOLTA o client local para o schema SQLite — sem isto, `bun run dev` quebra (engine mismatch)
bun run db:generate
```

**Por quê de cada passo:**

- **(1)** o client Prisma é gerado *por provider*. `db:generate:prod` troca o engine para Postgres — é o que faz os passos 2–4 falarem Postgres de verdade. Rodar `db:push:prod`/`seed` com o client sqlite gera erro de engine.
- **(2)–(3)** o prefixo `DATABASE_URL="..."` vale **só para aquele comando** — o `.env` local (SQLite) permanece intacto. `db:push:prod` aponta para `prisma/schema.prod.prisma` e **não** carrega `--accept-data-loss` (decisão deliberada: perda de dados em prod deve ser explícita — lá existem progressos reais de usuários). O seed é idempotente: upsert por `key`, IDs públicas vêm do registry congelado (`src/data/questions/id-registry.ts`) — seguro re-rodar para propagar edições de conteúdo.
- **(5)** **não pule este passo.** Depois de usar o client Postgres, a máquina local precisa voltar ao client SQLite (o mesmo estado em que `postinstall`/`db:generate` a deixam). Sintoma clássico de quem esqueceu: `bun run dev` ou queries locais falhando com engine mismatch / erro de conexão estranho.

> **Após este passo não é preciso rebuild/redeploy na Vercel** — as funções conectam ao Neon a cada invocação, em runtime.

> **Manutenção futura:** sempre que um model mudar, atualize **os dois schemas** (`prisma/schema.prisma` e `prisma/schema.prod.prisma`), e re-aplique em prod com os passos (1)→(3) desta seção. Cuidado: `prisma db push` aplica o schema como está — um model removido/alterado pode **droppar colunas e tabelas**. Revise o diff do schema antes de rodar contra o banco com dados reais.

---

## 6. Verificação pós-deploy

Substitua `https://<SEU_APP>.vercel.app` pela URL final do projeto.

```bash
# 1) a rota única responde 200
curl -sS -o /dev/null -w "%{http_code}\n" https://<SEU_APP>.vercel.app/

# 2) o catálogo responde JSON (certificação DBDEA com domínios; SEM campos de gabarito)
curl -sS https://<SEU_APP>.vercel.app/api/catalog | head -c 400

# 2b) saúde do banco — deve retornar {"status":"ok","db":"ok",..."questions":116}
#     503/db:error = DATABASE_URL ausente/errada, engine errado (build sem build:vercel) ou schema não-aplicado (db:push:prod) → ver §5 e §11
curl -sS -w "\nHTTP %{http_code}\n" https://<SEU_APP>.vercel.app/api/health

# 3) o contrato do hub serve as 116 questões
curl -sS https://<SEU_APP>.vercel.app/manifest.jsonl | wc -l          # → 116
curl -sS https://<SEU_APP>.vercel.app/manifest.jsonl | head -c 120    # → começa com {"id":"RAN-DBDEA-00001",...
curl -sS https://<SEU_APP>.vercel.app/manifest.jsonl | tail -n 1 | head -c 60   # → ...{"id":"RAN-DBDEA-00116",...

# 4) headers de segurança estão ativos (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, ...)
curl -sSI https://<SEU_APP>.vercel.app/ | grep -iE 'x-frame|x-content-type|referrer-policy'

# 5) PWA: manifest, service worker, ícones e fallback offline respondem
curl -sS -o /dev/null -w "manifest %{http_code}\n" https://<SEU_APP>.vercel.app/manifest.webmanifest
curl -sSI https://<SEU_APP>.vercel.app/sw.js | grep -i 'cache-control'      # → no-cache, no-store, must-revalidate
curl -sS -o /dev/null -w "icon-192 %{http_code}\n" https://<SEU_APP>.vercel.app/icons/icon-192.png
curl -sS -o /dev/null -w "apple-touch %{http_code}\n" https://<SEU_APP>.vercel.app/icons/apple-touch-icon.png
curl -sS -o /dev/null -w "offline %{http_code}\n" https://<SEU_APP>.vercel.app/offline.html
```

No **navegador** (o teste que importa — client-side):

- [ ] Home carrega com o tema dark por padrão; **toggle claro/escuro** funciona nos dois sentidos (badge "by Noos" troca a marca positivo/negativa entre os temas).
- [ ] **PT/EN**: com o browser em PT → UI em português; trocar para EN e recarregar **mantém** EN (persistência via `localStorage` chave `ct-lang`); questões permanecem **em inglês** nos dois idiomas (formato do exame real).
- [ ] **Iniciar sessão de estudo** (modo estudo): resposta com feedback imediato (correta/incorreta + explicação bilíngue + referência oficial) — confirma banco populado **e** correção server-side funcionando.
- [ ] **Iniciar simulado**: 45 questões, timer de 90 min, nota e review ao final.
- [ ] **Comunidade** (botão na questão): abre `https://noos-hub.vercel.app/pt/q/RAN-DBDEA-00001` (UI em PT) ou `https://noos-hub.vercel.app/en/q/RAN-DBDEA-00001` (UI em EN) — deep-link ancorado pela ID pública.
- [ ] Rodapé: badge **by Noos** (marca 16 px mobile / 20 px desktop + texto *by Noos* 11/13 px, itálico, cor suave) ao lado do nome **Ranvier** — nome do app prevalece.
- [ ] **PWA — instalar**: no Chrome/Edge desktop ou Android, a faixa **"Estude até sem internet"** aparece abaixo do hero (ou o ícone de instalar na omnibox); instalar → o app abre em janela própria pelo ícone. No iPhone (Safari): botão **Instalar app** → diálogo com os 3 passos *Adicionar à Tela de Início*.
- [ ] **PWA — offline**: com o app instalado (ou após 1ª visita), desligar o Wi-Fi/lost network e abrir o app → Home carrega offline (shell + dados já vistos; criar novas sessões exige conexão — comportamento esperado).

Se **qualquer** item falhar → seção 11 antes de prosseguir.

---

## 7. Pipeline do manifest (CI)

### 7.1 O que o workflow faz (`.github/workflows/manifest.yml`)

**Gatilhos:** push em `main` que toque `src/data/questions/**`, `src/data/certifications.ts`, `src/lib/axon/**` ou `scripts/generate-manifest.ts` — além de execução manual (`workflow_dispatch`).

**Passos:** checkout → instala bun → `bun install --frozen-lockfile` → `bun scripts/validate-questions.ts` (validação estrutural do banco + IDs públicas) → `bun scripts/generate-manifest.ts` (regenera `public/manifest.jsonl`) → se o arquivo mudou, **commita de volta no `main`** (autor `ranvier-manifest-bot`, mensagem `chore(manifest): publish question bank snapshot [skip ci]`) → o push do bot dispara o deploy da Vercel, que publica o manifesto como arquivo estático em `https://<SEU_APP>.vercel.app/manifest.jsonl`.

**Opcional:** se o repo secret `HUB_DEPLOY_HOOK_URL` estiver definido, o workflow faz `POST` no hook ao final — o hub re-ingere o manifesto imediatamente em vez de esperar o build agendado dele. Sem o secret, nada quebra (o hub continua ingerindo no próprio cronograma).

**Por design (anti-SPOF):** zero acoplamento de runtime — o hub ingere o arquivo no build **dele**; se este repo ou o app caírem, o hub segue servindo o último manifesto ingerido. E o workflow **falha alto** se alguma questão estiver sem ID registrada (registry é append-only **local**, nunca em CI).

### 7.2 Como verificar

- GitHub → aba **Actions** → workflow **manifest** verde no último push relevante.
- No histórico de commits do `main`, o commit do bot aparece quando o banco mudou.
- `curl -sS https://<SEU_APP>.vercel.app/manifest.jsonl | wc -l` → **116** (hoje).
- Divergência local × deploy: `diff <(curl -sS https://<SEU_APP>.vercel.app/manifest.jsonl) public/manifest.jsonl` → vazio.

### 7.3 Como adicionar novas questões (receita exata)

```bash
# 1) edite/adicione questões em src/data/questions/s1-platform.ts … s7-governance.ts
#    (key no formato S#-###; 4 opções; correctIndex 0-3; referenceUrl oficial docs.databricks.com)

# 2) atribui as novas IDs públicas (append-only: RAN-DBDEA-00117, 00118, …) ao registry imutável
bun scripts/generate-manifest.ts --assign

# 3) ATUALIZE a contagem esperada no validador se as totais por domínio mudarem:
#    scripts/validate-questions.ts → const expected = { 1: 8, 2: 24, 3: 25, 4: 18, 5: 12, 6: 12, 7: 17 }
#    (hoje: 116 no total; o validador ERRA se as contagens divergirem — de propósito)

# 4) valide o banco inteiro
bun scripts/validate-questions.ts

# 5) propague para o SQLite local (idempotente — atualiza conteúdo por key)
bun run db:push && bun scripts/seed.ts

# 6) commit e push → CI valida, regenera o manifest, commita de volta e a Vercel redeploya
git add -A && git commit -m "content: +N questões (domínio S#)" && git push origin main

# 7) propague para o Neon (produção) — a sequência completa da seção 5, passos (1)–(3) e (5)
```

**Regras do registry (imutáveis):** ID publicada **nunca** é renomeada nem reciclada; questão removida vira *epitaph* (a entrada permanece no registry e o manifest a reporta como warning — o número nunca é reusado); correção de typo **mantém** a ID (bump de `version`); rewrite ganha **nova** ID. O `--assign` apenas **anexa** a próxima sequência livre — nunca renumera.

---

## 8. Google AdSense (opcional)

**Estado padrão: DESLIGADO.** `AdSlot` renderiza `null` enquanto `NEXT_PUBLIC_ADSENSE_CLIENT` (ou o slot da posição) estiver vazio — nenhum código do Google é carregado.

**Política de colocação (Carta Noos — não negociável):** anúncio **somente** na página de **resultado** e nas **zonas estáticas de rodapé** (posições `home` / `results` / `guide`). **Nunca** entre o estudante e a resposta, **nunca** durante simulado/estudo ativos. Blocos sempre rotulados ("Advertisement/Publicidade").

**Como habilitar (quando decidir):**

1. Conta aprovada no Google AdSense → anotar o publisher id (`ca-pub-XXXXXXXXXXXXXXXX`).
2. Criar 3 blocos de anúncio → anotar os ids de slot.
3. Vercel → Project → Settings → Environment Variables (Production):
   - `NEXT_PUBLIC_ADSENSE_CLIENT` = `ca-pub-…`
   - `NEXT_PUBLIC_ADSENSE_SLOT_HOME` = slot id da home
   - `NEXT_PUBLIC_ADSENSE_SLOT_RESULTS` = slot id da página de resultados
   - `NEXT_PUBLIC_ADSENSE_SLOT_GUIDE` = slot id do guia
4. **Redeploy** (variáveis `NEXT_PUBLIC_*` são embutidas no bundle cliente **no build** — mudar env sem rebuild não tem efeito).

> **Pré-requisito prático:** o AdSense não aprova sites em `*.vercel.app` — exige domínio próprio (ver seção 9 e SDD §11/§12f). Alternativa sem anúncios já cabida no app: GitHub Sponsors (perfil `github.com/ironidesflj` já linkado no rodapé/Sobre).

---

## 9. Domínio próprio (futuro)

- **O app não precisa de domínio para funcionar** — a URL da Vercel basta. O **hub** é quem tem domínio canônico: `noos.study` (a registrar; aponta para o hub, não para o Ranvier).
- Até `noos.study` existir, badge e deep-links usam o fallback gratuito `https://noos-hub.vercel.app` (default de `NEXT_PUBLIC_NOOS_HUB_URL` — nenhum deploy precisa disso agora).
- **Quando `noos.study` existir:** Vercel → Environment Variables → trocar `NEXT_PUBLIC_NOOS_HUB_URL` para `https://noos.study` → redeploy. Badge, link do Sobre e deep-links Comunidade (`{base}/{lang}/q/{id}`) passam a apontar ao domínio canônico — formato inalterado.
- **Domínio próprio do app (opcional, ex. para AdSense):** Vercel → Settings → Domains → adicionar e apontar os DNS conforme as instruções da Vercel.

---

## 10. Go-live checklist (Tabela 6 do Guia de Adaptação, adaptada ao repo)

Cada item tem verificação **objetiva**. Marque só o que passou. \(☐ = a fazer\)

### Itens técnicos

| ☐ | Item | Como verificar (objetivo) |
|---|---|---|
| ☐ | **Badge "by Noos"** — 11–13 px, endosso 32–40% do nome, dois temas | Rodapé em **claro e escuro**: marca compacta com ~12 px (positivo no claro, negativo no escuro) + texto *by Noos* a **9 px** (nome do app no rodapé está a 24 px → 37,5%, dentro da faixa). Inspecionar elemento: `text-[9px]` + imgs `width=12 height=12`. A palavra é "Noos" — sem acento, sem CAPS, sem tradução, em qualquer idioma. |
| ☐ | **Nome do app prevalece** | "Ranvier" é o título/hero em toda tela; o badge aparece **uma única vez** (rodapé), em cor suave (`text-muted-foreground`), nunca como título nem botão primário. |
| ☐ | **Cor de domínio #246cad** | Botões/acentos primários em claro: inspecionar → `--primary` resolve para `--noos-ranvier` = `#246cad` (em dark, variante noturna da mesma família de matiz). `view-source:` da home contém `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#246cad">`. |
| ☐ | **IDs públicas em 100% das questões** | `curl -sS https://<SEU_APP>.vercel.app/manifest.jsonl \| wc -l` → **116**; primeira linha `RAN-DBDEA-00001`, última `RAN-DBDEA-00116` (formato `RAN-DBDEA-#####`). Local: `bun scripts/validate-questions.ts` → 0 erros. |
| ☐ | **manifest.jsonl publicado por CI** | Aba Actions: workflow **manifest** verde no último push de conteúdo; arquivo publicado contém os campos completos por linha — `id`, `exam`, `topics`, `difficulty`, `lang`, `version`, `checksum` (`sha256:…`), `aliases`, `snapshot` — e as 116 linhas casam com `public/manifest.jsonl` local (`diff` vazio). |
| ☐ | **Deep-link Comunidade funcional** | Num card de questão, clicar Comunidade → abre `https://noos-hub.vercel.app/pt/q/RAN-DBDEA-00001` (UI PT) ou `https://noos-hub.vercel.app/en/q/RAN-DBDEA-00001` (UI EN). Até `noos.study` existir, o fallback é a URL canônica esperada. |
| ☐ | **Política de idioma** | Primeira visita com device PT → UI PT; device EN → UI EN; troca manual **persiste** após reload (`localStorage` `ct-lang`); questões sempre EN; `document.documentElement.lang` reflete o idioma (`pt-BR`/`en`). |
| ☐ | **Anúncios conforme a política** | Padrão: `NEXT_PUBLIC_ADSENSE_CLIENT` vazio → `view-source:` **sem** `adsbygoogle` e sem bloco de anúncio em nenhuma tela. Se habilitado: blocos **apenas** na página de resultados e zonas estáticas de rodapé (home/guide), rotulados, **nunca** dentro de estudo/simulado ativos. |
| ☐ | **Privacidade** | Sem rastreamento individual: cookies do app = apenas `ct_anon` e `ct_session` (httpOnly — conferir em DevTools → Application → Cookies); nenhum analytics individual; nada além do AdSense (se habilitado) carrega script de terceiro. |
| ☐ | **Zero concorrentes nomeados** | Varrer a UI renderizada e a página Sobre/Fontes: nenhum app/plataforma concorrente de estudo citado; fontes = apenas documentação oficial Databricks (`docs.databricks.com`). |
| ☐ | **Licenças** | Repo público contém `LICENSE` (MIT — código) e `LICENSE-CONTENT.md` (CC BY-SA 4.0 — conteúdo). Decisão já tomada antes do lançamento: **nada a decidir, só verificar presença**. |
| ☐ | **Núcleo gratuito para sempre** | Percorrer o fluxo completo anônimo: estudo + simulado + progresso **sem paywall, sem cadastro obrigatório** (login é opcional, só para sincronizar). |

### Itens jurídico-administrativos (paralelo, fora do escopo técnico — responsabilidade do fundador)

| ☐ | Item |
|---|---|
| ☐ | Depósitos **INPI**: marca **Noos** (classes 41+42) **antes**, depois marca **Ranvier** (41+42) |
| ☐ | Depósitos internacionais **EUIPO/USPTO** — depois dos depósitos INPI |
| ☐ | **Registrar o domínio `noos.study`** e apontá-lo ao hub (não ao app) |
| ☐ | Licenças definidas antes do lançamento público — ✔ **já decidido**: conteúdo **CC BY-SA 4.0** + código **MIT** |

> Recomendação de sequência: completo nos itens técnicos → itens jurídicos em andamento (INPI pode tramitar após o lançamento, mas o depósito deve ser protocolado) → flip do repo para Public (se desejado) → divulgação.

---

## 11. Troubleshooting

| Sintoma | Causa provável | Correção |
|---|---|---|
| **Build da Vercel falha com erro de tipo** | `next.config.ts` tem `typescript.ignoreBuildErrors: false` — o build quebra alto em erro de tipo (por design) | Local: `bunx tsc --noEmit` → corrigir os erros apontados → commit/push. Nunca "resolver" ligando `ignoreBuildErrors`. |
| **Erro de engine Prisma / conexão absurda no dev local** (ex.: quer conectar o Neon com client sqlite, ou o SQLite com engine postgres) | Client Prisma gerado com o schema errado para o contexto | Regenerar o client certo: local/sandbox → `bun run db:generate`; antes de mexer no Neon → `bun run db:generate:prod`. Cenário clássico: pulou o passo (5) da seção 5. |
| **500 em `/api/catalog`, `/api/attempts` etc. em produção** (sintoma no app: aba Certification com erro, Study Mode "carregando para sempre", simulado com "erro de comunicação com o servidor") | `DATABASE_URL` ausente/errada na Vercel, engine errado (build sem o override `bun run build:vercel`), ou banco Neon sem schema/seed (seção 5 não executada) | **Diagnosticar primeiro:** `curl https://<SEU_APP>.vercel.app/api/health` → `db:error` confirma a camada de banco. Vercel → Settings → Environment Variables (conferir a string pooled com `sslmode=require`) → se env estava errada ou o build não usou `build:vercel`, corrigir e redeploy; se banco vazio, rodar a sequência completa da seção 5. Logs: Deployments → Functions. |
| **Login/sessão não persistem; erro sobre secret/assinatura; cookies "inválidos"** | `SESSION_SECRET` ausente em produção | `openssl rand -hex 32` → definir na Vercel → redeploy. Os nomes `ct_anon`/`ct_session` são internos e **não devem ser renomeados**. |
| **CI manifest vermelho com `no public ID registered for <key>`** | Questão nova sem ID no registry (o CI **não** atribui IDs — append-only é local) | `bun scripts/generate-manifest.ts --assign` → conferir `src/data/questions/id-registry.ts` (nova entrada `RAN-DBDEA-00117+`) → `bun scripts/validate-questions.ts` → commit/push. |
| **CI manifest vermelho com `Domain S#: expected N, got M`** | Contagens por domínio divergem do esperado — o validador tem `expected` com valores atuais | Atualizar `const expected` em `scripts/validate-questions.ts` para as novas contagens (e conferir que a distribuição continua fiel aos pesos oficiais do exame). |
| **Erro de conexão/timeouts do Prisma contra o Neon** | Pooler + serverless sem configuração de compatibilidade | Confirmar que está usando a string **pooled** com `sslmode=require`; se persistir, anexar `&pgbouncer=true&connection_limit=1`. |
| **Vercel rodou `npm install` em vez de `bun install`** | Detecção de package manager falhou | Build & Output Settings → Install Command → override para `bun install` (o `bun.lock` está no repo). |
| **Deploy atualizou, mas o hub ainda mostra dados antigos** | O hub ingere o manifesto no build **dele** (agendado) — sem acoplamento de runtime | Aguardar o ciclo do hub, ou definir o repo secret `HUB_DEPLOY_HOOK_URL` (hook de deploy do hub) para o CI notificá-lo a cada publicação. |
| **`bun run db:push:prod` recusa/pergunta sobre perda de dados** | O script de prod **não** usa `--accept-data-loss` (decisão deliberada — protege progresso real de usuários) | Revisar o diff do schema com calma. Se a mudança for realmente destrutiva e imprescindível, rodar `bunx prisma db push --schema prisma/schema.prod.prisma --accept-data-loss` **explicitamente**, ciente do que isso apaga. Considere um dump antes (`pg_dump`) — o free tier do Neon tem PITR limitado. |
| **App deployou "vazio" (sem questões) logo após o import** | Ordem natural: o deploy acontece antes da inicialização do banco | Executar a seção 5. Nenhum redeploy é necessário depois dela. |

---

## Referências cruzadas

- `docs/SDD.md` — arquitetura, segurança (gabarito server-side, rate-limit, sessão anônima + merge), política de ads, ADRs. (§12 do SDD descreve um fluxo de deploy mais antigo, com troca manual do provider no `schema.prisma` — **este guia o substitui**: a Fase 1 introduziu `prisma/schema.prod.prisma` + `build:vercel`, sem editar o schema do sandbox.)
- `.env.example` — nomes canônicos das variáveis (fonte da verdade para `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_NOOS_HUB_URL`, `NEXT_PUBLIC_ADSENSE_*`).
- `.github/workflows/manifest.yml` — pipeline do contrato do hub.
- `worklog.md` — histórico vivo (decisões, Red Team, correções).
- Guia de Adaptação Noos–Ranvier Fase 1 (`upload/arquivo2_extracted/Noos-Ranvier-Guia-de-Adaptacao.pdf`) — regras do ecossistema e Tabela 6 (checklist de lançamento).

*Mantenha este documento sincronizado com mudanças de deploy: ele é parte do contrato "nada se perde".*

# spec-v1.5.1-og-preview.md — OG/social preview (fechamento da dívida #1)

Data: 2026-10-27 · Lote: **v1.5.1** · Status: implementado e verificado no
sandbox (ver "Verificação" e worklog Task 14).

## Pedido e gatilho

Dívida #1 do `plan.md` — pedido do fundador de 2026-10-25: *"criar material de
divulgação que vai atrelado ao link do app, diferentes plataformas, aquela
imagem que vai junto ao link"*. Condição de reabertura registrada: "próxima
rodada de design/lançamento". O gatilho disparou: a v1.5.0 publicou as 300
questões e a Fase 1 (manifesto no hub) vai acender 300 páginas públicas — é
exatamente agora que links do Ranvier passam a ser compartilhados.

Spec curta acordada na própria dívida: og:image 1200×630, twitter:card
summary_large_image, ícone Apple-touch, arte clara/escura, textos PT/EN,
nenhuma métrica inventada.

## O que embarcou

1. **`scripts/generate-og.ts`** (novo; `bun run og`) — gera a arte de
   compartilhamento como SVG determinístico → PNG via sharp (render 2× +
   downscale lanczos3; texto mono pequeno fica nítido em card de feed).
   Idempotente, no estilo do `generate-icons.ts`. Tipografia de marca
   (Newsreader, Instrument Sans, IBM Plex Mono) resolvida via fontconfig —
   as TTFs do Google Fonts precisam estar instaladas (ver "Reprodutibilidade").
2. **`public/og/og-image.png`** (1200×630, ~71 KB) — a og:image. Design
   "bilhete de exame" sobre o papel da marca: fileira de identidade (tile do
   favicon + wordmark Newsreader + BY NOOS), sobrancelha com o nome da
   certificação (mono azul), headline PT em duas linhas (segunda em itálico),
   linha EN, **linha de axônio** com nós (o nó de Ranvier é o azul — motivo da
   marca e aceno ao pacote Axon adotado na v1.5.0), fileira de fatos em mono,
   e faixa-bilhete com picotado + entalhes laterais carregando o aviso
   não-oficial/sem-afiliação (PT/EN) e GRÁTIS · FREE. Marca d'água sutil do
   monograma completo (perna interrompida + nó) à direita.
3. **`public/og/og-image-dark.png`** — gêmea escura (tinta clara sobre
   #0a0f10, nó azul-claro #8ab8e8). **Não é usada pelos crawlers** — og:image
   não troca por tema; fica como ativo para rotas por idioma no futuro ou
   reuso pelo hub.
4. **Metadados no `layout.tsx`**: `metadataBase` (origem de produção),
   `alternates.canonical`, `openGraph.images` com width/height/alt descritivo,
   `og:url`, `og:locale pt_BR` + `alternateLocale en_US`, `twitter.card
   summary_large_image` (título/descrição herdam do openGraph), og:description
   reescrita com os números reais (300 questões autorais com referência
   oficial, 6 simulados completos). **Sem `twitter:site`/`creator`** — o
   projeto não tem handle; zero metadados inventados.
5. **Bump v1.5.1** no mesmo lote (regra do SDD): `src/lib/version.ts`,
   `package.json`, `public/sw.js` (`ranvier-v1.5.1`), `public/offline.html`.
   Popup whats-new PT/EN com 1 item (cartão de prévia ao compartilhar) — pelo
   desenho do fundador, o aviso descreve as novidades de toda atualização.

## Decisões (e por quê)

- **Arte clara é A og:image**: crawlers não trocam imagem por
  `prefers-color-scheme`; papel da marca lê bem em chat claro e escuro. A
  escura existe como ativo — "arte clara/escura" da spec fica satisfeita com o
  par, e o uso é documentado aqui.
- **PT como `og:locale` primário** com en_US alternativo: o app tem URL única
  (hash router, i18n no cliente) — o card é um só; PT espelha o idioma padrão
  e o público inicial. Microcopy bilíngue NA arte (headline PT + linha EN)
  cobre o leitor EN. Quando existirem rotas por idioma, cards por idioma
  viram um follow-up natural.
- **Sem URL na arte**: plataformas exibem o domínio sob o card de qualquer
  forma; a arte sobrevive a um futuro domínio custom sem regeneração.
- **Zero métricas inventadas**: os únicos números na arte e na descrição são
  os reais — 300 questões, 6 simulados, PT/EN, gratuito, sem cadastro.
- **OG fora do precache do SW**: é ativo de crawler, não shell do app — o SW
  não precisa aquecer 71 KB que o aluno nunca renderiza.
- **Apple-touch já existia** (`icons/apple-touch-icon.png`, 180×180, gerado
  pelo pipeline de ícones desde a v1.3.x) — item da spec curta já satisfeito;
  conferido no metadata `icons.apple`.

## Reprodutibilidade (nota operacional)

O gerador depende das fontes de marca no fontconfig — sem elas o texto cai em
DejaVu (visivelmente errado; sempre conferir o output). Instalação usada
neste fechamento: TTFs do Google Fonts em
`~/.local/share/fonts/ranvier-og/` (Newsreader 400/500/600 + itálica,
Instrument Sans 400/500/600/700, IBM Plex Mono 400/500/600) + `fc-cache -f`.
Os pesos Medium/SemiBold expõem fam próprias ("Instrument Sans Medium",
"IBM Plex Mono Medium") — usadas pelo nome porque o casamento de peso do
librsvg é menos confiável que o do fontconfig.

## Verificação (evidência no worklog Task 14)

- Auditoria visual (VLM) das duas variantes: todos os textos legíveis e na
  ordem, sem sobreposição/corte, serifa no headline + mono nos metadados +
  sans na linha EN (fontes de marca confirmadas na renderização), tile +
  wordmark, faixa com picotado/entalhes legíveis, marca d'água sutil; sem
  defeitos.
- `<head>` servido: og:title/description/url/image(+w/h/alt)/locale(+alt)/type,
  twitter:card/title/description, canonical absoluto — conferidos via curl e
  no DOM vivo.
- `/og/og-image.png`: 200, `image/png`, 72.396 bytes.
- Popup v1.5.1 (EN e PT), 1× por versão (`ranvier:whatsnew:seen: 1.5.1`),
  não reaparece após reload.
- Fluxo dourado intacto: simulado iniciado (Questão 1 de 45), resposta,
  próxima, saída com confirmação; mobile 375 sem overflow; zero erros de
  console/página.
- Gates: lint 0 · tsc 0 · `validate:manifest` 300/0/0 · `validate:questions`
  300 · `ci:gate --strict` PASS (0 findings).

## Deploy

Sem mudança de schema/questões/DB: redeploy padrão na Vercel (o cache do SW
renova pelo bump `ranvier-v1.5.1`). Verificação pós-deploy: `curl /api/health`
= 300 questões (inalterado) e `curl -I /og/og-image.png` = 200. O card pode
ser conferido em https://www.opengraph.xyz ou similar (ferramenta externa
opcional; os metadados já foram verificados no HTML servido).

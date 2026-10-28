# spec-v1.10.1-symbol-orbital-splash.md — Novo Símbolo (Topologia Orbital 'R') & Abertura Silenciosa (`RanvierSplash`)

Data: 2026-10-28 · Lote: **v1.10.1** (evolução de identidade visual sobre a v1.10.0) · Status: **APROVADA E IMPLEMENTADA**.

## 1. Pedido, Problema e Conceito

O item *"Reanalisar a animação §14 do símbolo"* estava pendente no `plan.md` por decisão do fundador em 27/out/2026. Ao revisitar o símbolo em 28/out/2026, o fundador diagnosticou o problema central do monograma anterior (`stroke-width="10"`, retas simples `M38 94V26`):

1. **Discrepância de linguagem com a marca-mãe Noos:** Enquanto o `noos-mark.svg` possui a sofisticação de um instrumento óptico/astronômico (contraste entre arcos estruturais `2.4px` e elipses orbitais `1.1px` com `opacity=".5"`, micro-nós sobre interseções reais e rastro cinético de partículas), o antigo `R` do Ranvier parecia um traço monolinear básico sem personalidade própria.
2. **A Ideia e o Conceito do Novo Símbolo — Topologia Orbital 'R' (Câmara de Bolhas / Diagrama de Feynman):**
   - O símbolo mantém a leitura imediata da letra **R**, mas a constrói como um **diagrama físico de condução saltatória e trajetória de partículas em campo magnético** (parentesco direto com a esfera armilar/orbital do Noos):
     - **A Haste Meridional ($L_{\text{spine}}$ & $E_1$):** Um eixo vertical firme ($x = 34, y \in [20, 100]$) envolvido por um cilindro meridional elíptico ($c_x=34, c_y=60, r_x=9, r_y=40$), tangente nos polos Norte $(34, 20)$ e Sul $(34, 100)$ — representando o filamento axial do axônio.
     - **O Dipolo Orbital do Bojo ($E_2, E_3$):** Duas órbitas elípticas gêmeas centradas em $(58, 42)$ ($r_x=33, r_y=16$) rotacionadas simetricamente por $-16^\circ$ e $+16^\circ$. Sua interseção leste exata define o ápice do bojo em $(87.55, 42.00)$.
     - **O Bojo Estrutural $C^1$-Contínuo ($C_{\text{bowl}}$):** Duplo arco elíptico que parte horizontalmente do Polo Norte $(34, 20)$, tangencia verticalmente o ápice do dipolo $(87.55, 42.00)$ e converge para o **Nó Receptor Pré-Salto $(54.00, 62.00)$**.
     - **O Círculo Magnético de Larmor ($C_{\text{larmor}}$, $R = 88.25$):** Em uma câmara de bolhas, uma partícula carregada sob campo magnético descreve um arco circular de raio de Larmor. Uma única circunferência de raio exato $R = 88.25$ centrada em $(12.25, 139.75)$ governa toda a dinâmica do salto:
       1. Guia tracejado pré-nodal da haste $(34.00, 54.22)$ até o Nó Receptor $(54.00, 62.00)$;
       2. **A Fenda (Gap) do Nó de Ranvier** entre $(54, 62)$ e $(65, 69)$, onde **não há linha sólida contínua** — o potencial de ação salta no vácuo ionizando duas partículas quânticas sobre o arco de Larmor: $K_1(57.64, 64.07)$ e $K_2(60.46, 65.83)$;
       3. **O Nó de Ignição de Ranvier $A_1(65.00, 69.00)$** (`var(--ranvier-node)` — `#246cad` no claro, `#8ab8e8` no escuro), de onde dispara a **perna balística azul** sobre o mesmo arco de Larmor até o pé terminal $A_2(90.00, 98.00)$.
   - **Erro residual zero ($0.00\text{ px}$):** Todos os 14 nós repousam sobre interseções ou tangentes analíticas exatas das curvas geradoras.

---

## 2. As 3 Escalas Ópticas (`RanvierMark`)

Assim como o Noos separa `noos-mark.svg` (esfera orbital completa) de `noos-compact.svg` (redução para favicon), o componente `RanvierMark` (`src/components/app/ranvier-mark.tsx`) opera em 3 escalas ópticas:

1. **`variant="full"` ($\ge 48\text{px}$, abertura, editorial e marca d'água OG):**
   - Grade `viewBox="0 0 120 120"`, malha orbital `1.1px` (`opacity="0.48"`), traços estruturais `2.4px`, 10 nós de interseção estruturais + 2 quanta no gap ($K_1, K_2$) + Nó de Ranvier $A_1$ (`r="3.2"`) e terminal $A_2$ (`r="2.2"`).
2. **`variant="ui"` (default, $18\text{–}36\text{px}$ — `LandingHeader` $20\text{px}$, `Rail` $20\text{px}$, `TopBar` $18\text{px}$):**
   - Recorte óptico `viewBox="14 12 92 96"` (aumenta o corpo útil do `R` para `83%` da caixa, casando com a altura da tipografia `Newsreader` ao lado).
   - Traço estrutural elevado para `5.2` (`~1.08px` reais em $20\text{px}$), órbita única de assinatura (`rotate(-16 58 42)`, `strokeWidth={2.2}`) para manter o contra-forma do bojo limpo, e vão livre de `1.48px` reais no Gap de Ranvier.
3. **`variant="compact"` ($16\text{px}$ — favicon e ícones de launcher):**
   - Traço `7.5` (`1.0px` exato em $16\times 16$), órbita única `3.2` e compensação óptica do gap entre $(52.00, 62.31)$ e $(68.00, 71.34)$.

---

## 3. Abertura Silenciosa em Tela Cheia (`RanvierSplash`)

Seguindo a direção estética definida pelo fundador:
> *"A tela toda em branco (ou tela escura), e o símbolo surgindo, e por último a barra embaixo surgindo junto com o by Noos. Mais nada na tela."*

### 3.1. Regras de Apresentação e Pureza
- **Zero poluição visual:** A tela de abertura (`fixed inset-0 z-50 grid place-items-center bg-background`) exibe **exclusivamente** o fundo do tema (`#f7fbf9` no claro ou `#0a0f10` no escuro), o símbolo puro no centro (`116×120px`, `viewBox="0 0 116 120"` para alinhar o centro de massa óptico $x = 58$ com o eixo da assinatura), sem caixas/cards ao redor, sem títulos e sem botões.
- **Zero redundância na `HomeView`:** O Hero da `HomeView` permanece 100% tipográfico (Eyebrow mono $\to$ H1 Newsreader $\to$ Lead $\to$ CTAs), sem repetir o símbolo grande em cima do texto (evitando duplicidade com o `BrandLockup` da `LandingHeader`).

### 3.2. Cronograma Físico (`2,58s` de desenho + `~1,5s` de contemplação = `4,05s` até fade, `4,6s` total)
1. **Fase I — Calibração da Câmara Orbital (`120ms – 1050ms`):** O cilindro meridional $E_1$ e o dipolo $E_2/E_3$ desenham-se via `stroke-dashoffset` (`cubic-bezier(0.22, 1, 0.36, 1)`), seguidos pelos micro-nós de interseção e pelo guia de Larmor.
2. **Fase II — Condução Mielínica & Frenagem Capacitiva (`260ms – 1260ms`):** A haste e o bojo $C^1$ são percorridos por uma frente de onda azul (`var(--ranvier-node)`) que desacelera ao carregar o Nó Receptor $(54, 62)$.
3. **Fase III — O Salto Quântico no Vácuo (`1100ms – 1880ms`):** Sem linha contínua no gap, duas ondas concêntricas de despolarização expandem-se em $(59.5, 65.5)$ enquanto os quanta $K_1$ e $K_2$ ionizam em sequência.
4. **Fase IV — Ignição Pós-Nodal & Disparo Balístico de Larmor (`1340ms – 2080ms`):** O Nó de Ranvier $(65, 69)$ acende com halo translúcido e dispara a perna balística azul até $(90, 98)$.
5. **Fase V — Barra Horizontal + `by Noos` por Último (`1880ms – 2580ms`):** Um filete horizontal minimalista (`32px × 1px`) expande-se do centro (`1880ms – 2500ms`) simultaneamente à entrada suave da assinatura `[o] by Noos` (`1940ms – 2580ms`) logo abaixo.
6. **Contemplação Pós-Animação & Dissolução (`2580ms – 4600ms`):** Ao plano original de `3,6s` foi acrescentado `+1,0s` (`1000ms`) de pausa pós-animação para o estudante apreciar o desenho completo (`fadeTimer = 4050ms`), seguido de um *fade-out* suave de `550ms` (`doneTimer = 4600ms`) revelando a `HomeView`.
   - Clicar em qualquer ponto da tela encerra a cortina imediatamente.
   - Executada 1× por carregamento do app (`splashShownInSpaSession`), sem interromper trocas internas de aba (`Estudar` $\leftrightarrow$ `Início`).
   - Respeita `@media (prefers-reduced-motion: reduce)`.

---

## 4. Ativos Atualizados no Lote

- `src/components/app/ranvier-mark.tsx` (`RanvierMark` nas 3 escalas + `RanvierSplash`)
- `src/components/app/ranvier-app.tsx` (montagem de `<RanvierSplash />` na abertura da landing)
- `public/brand/ranvier-mark.svg`, `public/brand/ranvier-mark-negative.svg`, `public/brand/ranvier-mark-compact.svg`, `public/brand/ranvier-icon.svg`, `public/favicon.svg` (e espelhos em `identidade/assets_ranvier-*.svg`)
- `public/icons/*` e `public/og/*` (regerados via `scripts/generate-icons.ts` e `scripts/generate-og.ts`)
- `public/offline.html` e `docs/preview/animated-mark.html`

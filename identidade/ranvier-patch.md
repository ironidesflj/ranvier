# Ranvier — patch de identidade v1.0

**Destino:** https://ranvier-seven.vercel.app
**Sistema:** Noos · guia de aplicação dos apps v1.1
**Escopo:** landing, shell, tela de questão e resultado.
**Regra:** preserve a lógica do produto; troque pele, hierarquia e estados.

## 1. Conceito — o salto

O nome vem do nó de Ranvier: a interrupção na bainha de mielina onde o impulso elétrico não caminha — ele salta de nó em nó. A identidade inteira deriva daí.

O Ranvier é um instrumento de exame, não um app de consumo. Ele deve parecer uma folha de prova bem impressa: papel, hairlines, serifa na pergunta, precisão nos números, silêncio em volta.

Três consequências:

1. Uma questão ocupa a tela. Nada compete com a pergunta.
2. A prova vem antes da opinião: toda correção mostra a fonte.
3. O progresso é medido em nós vencidos, não em minutos de tela.

Não é: curso, dashboard, ranking, streak, avatar, confete, gamificação. Se um elemento existe só para entreter, ele sai.

Não altere: a lógica de exames, o banco de questões, o progresso local, os IDs públicos, os deep-links ou o contrato Axon.

## 2. O que remover do app atual

- Gradiente no título do hero.
- Blob desfocado no fundo.
- Ícone de sparkles.
- Cards `rounded-xl` com sombra.
- Check genérico no lugar da letra da alternativa.
- Roxo ou índigo de template.
- Hero centralizado.
- Emoji.
- Qualquer controle de demonstração, seletor de viewport ou badge de "prévia" dentro da interface do produto.

## 3. Tokens

```css
:root {
  --bg: #f7fbf9;
  --surface: #ffffff;
  --surface-2: #eef4f1;
  --fg: #0e1b1c;
  --muted: #525d5e;
  --border: #d9e0de;
  --border-strong: #7f8b89;
  --app: #246cad;
  --app-ink: #1b5285;
  --app-solid: #1b5285;
  --app-on-solid: #ffffff;
  --app-soft: color-mix(in oklab, var(--app) 9%, var(--surface));
  --app-line: color-mix(in oklab, var(--app) 38%, var(--surface));
  --success: #1f7a4d;
  --danger: #9b2f24;
  --font-display: 'Newsreader', 'Iowan Old Style', Georgia, serif;
  --font-body: 'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  color-scheme: light;
}

[data-theme="dark"] {
  --bg: #0a0f10;
  --surface: #121919;
  --surface-2: #182020;
  --fg: #e4e9e8;
  --muted: #929a99;
  --border: #2c3535;
  --border-strong: #5f6b69;
  --app-ink: #8ab8e8;
  --app-solid: #8ab8e8;
  --app-on-solid: #07110f;
  --success: #7fd3a5;
  --danger: #f09383;
  --app-soft: color-mix(in oklab, var(--app) 15%, var(--surface));
  --app-line: color-mix(in oklab, var(--app) 40%, var(--surface));
  color-scheme: dark;
}
```

Regras de cor:

- `--app` (#246cad) é identidade e preenchimento.
- Texto, links e ação usam `--app-ink` (#1b5285 · 7,8:1 sobre o papel).
- O accent verde do Noos não entra no app.
- No escuro, o azul de texto é #8ab8e8 (9,3:1 sobre #0a0f10).
- Proibido: gradiente, sombra decorativa, segundo accent, azul como cor de sucesso.

## 4. Símbolo

Monograma R em grade 120, traço 10, cantos redondos. A perna é interrompida entre 36% e 62%; o nó (5,6/120) ocupa a lacuna. Bowl e haste ficam íntegros.

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-labelledby="ran-title">
  <title id="ran-title">Ranvier</title>
  <g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round">
    <path d="M38 94V26"/>
    <path d="M38 26h22a20 20 0 0 1 0 40H38"/>
    <path d="M60 66l6.4 6.4"/>
    <path d="M82 88l6 6"/>
  </g>
  <circle cx="73.8" cy="79.8" r="2.8" fill="#246cad"/>
</svg>
```

Compacto (16–23 px, favicon e app icon): mesma geometria, perna inteira, sem nó.

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-labelledby="ran-c-title">
  <title id="ran-c-title">Ranvier — compacto</title>
  <g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round">
    <path d="M38 94V26"/>
    <path d="M38 26h22a20 20 0 0 1 0 40H38"/>
    <path d="M60 66l28 28"/>
  </g>
</svg>
```

Regras:

- Área de respiro: 1/4 da altura do símbolo.
- Completo a partir de 24 px; compacto de 16 a 23 px.
- App icon: tile #246cad, monograma compacto em #f7fbf9, raio 26/120 (ou máscara do sistema).
- Nunca aplicar a esfera Noos, gradiente, contorno duplo ou sombra.
- Lockup: [símbolo] **Ranvier** `by Noos`. "by Noos" em 34% do nome no lockup principal e 9–10 px no chrome compacto. Uma vez por tela.
- O símbolo nunca substitui a palavra em títulos; sozinho, só quando o app já está identificado.

## 5. Tipografia

| Papel | Fonte | Tamanho / linha | Tracking |
|---|---|---|---|
| Pergunta | Newsreader 400 | 30–34 / 1,25 | -0,015em |
| Título de tela | Newsreader 300 | 36–48 / 1,05 | -0,03em |
| Alternativa | Instrument Sans 400 | 16–17 / 1,45 | 0 |
| Corpo | Instrument Sans 400 | 15–16 / 1,6 | 0 |
| Rótulo de UI | Instrument Sans 500 | 12 / 1,3 | 0,02em |
| Metadado | IBM Plex Mono 400 | 10–11 / 1,4 | 0,08em, caixa alta |
| Tempo / ID | IBM Plex Mono 500 | 12–28 / 1 | -0,01em, tabular |

Regras:

- A pergunta é sempre serifa. Nunca sans.
- Botão e alternativa são sempre sans. Nunca serifa.
- Mono só para tempo, IDs, contadores e metadados.
- Máximo de três tamanhos visíveis por tela.
- Caixa alta exige tracking ≥ 0,06em.
- Corpo de explicação entre 58 e 68 caracteres por linha.
- Nada de texto justificado.

## 6. Landing

Estrutura:

1. Header: monograma 20 px + "Ranvier" (Newsreader 20) + "by Noos" (mono 9,5). Links Exames, Progresso, Sobre. CTA "Continuar" discreto.
2. Hero à esquerda: eyebrow mono com o exame; H1 serif de até 2 linhas; lead de até 3 linhas.
3. Ações: "Começar simulado" (primária #1b5285) e "Ver exames" (secundária com borda).
4. Bilhete de exame à direita: código, nome, 40 questões, 45 min, última sessão. Sem card arredondado, sem sombra.
5. Linha de prova: "Questões comentadas com fonte. Progresso salvo no dispositivo."
6. Rodapé: exames disponíveis e versão. O endosso "by Noos" aparece uma vez, no cabeçalho.

Copy de referência:

- H1: "Cada questão é um salto."
- Lead: "Simulados comentados para certificações Azure. Você responde, erra, entende e segue."
- CTA: "Começar simulado".

Proibido: gradiente no H1, blob, sparkles, hero centralizado, card com sombra.

## 7. Shell

- Rail de 208 px, fundo `--surface`, hairline à direita.
- Marca no topo: monograma 18 px + "Ranvier" + "by Noos".
- Destinos: Estudar, Exame, Progresso, Revisão, Ajustes. Item ativo: barra de 2 px #246cad + fundo `--app-soft` + texto `--app-ink`.
- Cabeçalho de sessão: exame, sessão, tempo total, "Encerrar" (ghost).
- Conteúdo: 720 px para questão; 960 px para resultado.
- Rodapé do rail: versão em mono.
- Mobile ≤ 620 px: sem rail; bottom nav de 5 destinos, alvos de 44 px, safe-area.
- O app abre no exame, não em dashboard.

Proibido: sidebar com widgets, cards de estatística na home, tema escuro como padrão, controles de layout.

## 8. Tela de questão

Ordem vertical:

1. Régua de tempo no topo, de ponta a ponta: ticks a cada 2%, majors a cada 10%, dreno da direita para a esquerda, leitura `22:30` em mono tabular. O tempo é a única coisa que se move.
2. Metadados: `QUESTÃO 07 / 40` à esquerda; domínio e nível à direita.
3. Pergunta em Newsreader 32/1,25, largura máxima 48ch.
4. Alternativas em linhas de 54 px, letra A–D em mono dentro de um quadrado de 26 px. Hover: borda `--border-strong`. Selecionada: borda `--app` + fundo `--app-soft`.
5. Rodapé: "Confirmar resposta" (desabilitado até selecionar), "Pular" ghost, atalhos `A–D · Enter` em mono.
6. Após confirmar: opção correta com tag "correta"; opção errada escolhida com tag "sua resposta"; explicação com fio superior, lead serif, corpo e fonte em mono.

Estados: sem seleção, selecionada, correta, incorreta, pulada, tempo esgotado.

Proibido: check grande, confete, som, pop-up, timer piscando, progresso arco-íris.

## 9. Resultado

- Laudo em papel, não troféu.
- Nota em mono grande (56–84) + `/ 40` em muted; status com ponto verde discreto; linha de corte.
- Breakdown por domínio com barras de 3 px em `--app-ink`, valores tabulares.
- Lista "Revisar" com IDs `RAN-AZ900-00000` e tópicos, em mono.
- Ações: "Revisar 9 questões" (primária), "Novo simulado" (secundária).
- Rodapé: data, duração, versão do simulado em mono.
- Proibido: confete, anel colorido, emoji, ranking, badge de "parabéns".

## 10. Estados e microcopy

- Vazio: "Nenhum simulado ainda. Escolha um exame para começar." + CTA.
- Carregando: esqueleto com a mesma altura do conteúdo; sem spinner central.
- Erro: "Não foi possível carregar este exame." + "Tentar de novo" + código do erro em mono.
- Offline: "Você está offline. O simulado em andamento continua salvo neste dispositivo."
- Tempo esgotado: "Tempo encerrado. Suas respostas foram salvas." + "Ver resultado".
- Resposta correta: "Correta." / incorreta: "A correta é B — Microsoft Entra ID."

## 11. Movimento

- Durações 180–240 ms, `ease-out`. Nada de bounce.
- Movimento permitido: o dreno da régua, o traço do símbolo ao carregar (600–800 ms, uma vez), a troca de estado da alternativa.
- `prefers-reduced-motion`: desligar o traço e o dreno animado; manter o número.
- Nenhum parallax, blob animado, gradiente em movimento ou confete.

## 12. Acessibilidade

- Corpo ≥ 4,5:1; UI ≥ 3:1. Pares medidos: ink/papel 7,8:1; branco/ink 8,1:1; ink escuro/fundo escuro 9,3:1.
- Alvos ≥ 44 px; foco visível de 2 px em `--app-ink` com offset 2.
- Teclado: Tab nas alternativas, setas para mover, Enter para confirmar, `A–D` como atalho.
- `aria-live="polite"` para o resultado da correção e o tempo.
- Régua decorativa com `aria-hidden`; o tempo também em texto.
- `lang="pt-BR"` e `lang="en"` em termos estrangeiros quando necessário.
- Não usar cor como único sinal: sempre acompanhar de texto ("correta", "sua resposta").
- Respeitar zoom de 200% e 320 px de largura sem scroll horizontal.

## 13. Ordem de implementação

1. Tokens e fontes.
2. Símbolo (SVG completo + compacto + favicon).
3. Shell e rail.
4. Landing.
5. Tela de questão (régua, alternativas, correção).
6. Resultado.
7. Estados vazio/carregando/erro/offline.
8. Remover resíduos do app atual (seção 2).
9. Testar dark mode, 320 px, teclado e reduced motion.

## 14. Critérios de aceite

- [ ] Nenhum gradiente, blob ou sombra decorativa.
- [ ] H1, pergunta e resultado em Newsreader; botões e alternativas em Instrument Sans.
- [ ] #246cad só como identidade/preenchimento; texto em #1b5285.
- [ ] Contraste AA em claro e escuro.
- [ ] Símbolo com interrupção e nó; compacto abaixo de 24 px.
- [ ] Uma questão por tela; nenhum painel compete.
- [ ] Régua de tempo funcional e legível.
- [ ] Alternativas com letra e tag textual no reveal.
- [ ] Resultado sem confete, anel ou emoji.
- [ ] "by Noos" uma vez por tela.
- [ ] 320–1440 px sem scroll horizontal.
- [ ] Teclado, foco e reduced motion testados.
- [ ] Estados vazio, carregando, erro e offline implementados.
- [ ] Nenhuma métrica inventada na interface.

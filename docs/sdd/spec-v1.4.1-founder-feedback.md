# spec-v1.4.1-founder-feedback.md — os 4 ajustes de UI do fundador

Data: 2026-10-26 · Lote: v1.4.1 (patch pequeno, só apresentação)
Origem: mensagem do fundador comparando a v1.3.1 (sandbox) com o app
antigo em produção. O print anexado não chegou ao canal; a referência de
tamanho usada foi o app antigo em produção (corpo normal de leitura).

## Pedidos e entrega

### 1. Pills preenchidas de domínio + dificuldade (revisão/estudo)

> "abaixo da questao x, aparecia o dominio tal, e dificuldade, os dois com
> fundo preenchido. eu gostava disso, traz de volta."

- `QuestionCard` ganhou `showMeta` (v1.4.0 tinha os metadados como texto
  corrido à direita; agora são duas pills `rounded-full` com fundo
  `bg-surface-2`).
- Ligado em `study-view` e `results-view` (revisão). O simulado fica
  chrome-less (v1.1 §10.1 — sem metadados duplicados em cima da pergunta).
- Domínio mostra código + nome ("Domínio 5 · Implementando CI/CD");
  dificuldade vem das strings i18n existentes.

### 2. Certo/errado com fundo colorido — mais sutil que o antigo

> "TRaz o fundo colorido, mas pode ser mais sutil, cores nao tao fortes
> quanto o antigo."

- Tokens novos em `noos-tokens.css`: `--noos-success-soft/-line` e
  `--noos-danger-soft/-line` — color-mix 7–8% sobre a superfície no claro,
  12–13% no escuro (o antigo usava ~10% de emerald/destructive; este é
  propositalmente mais discreto).
- Alternativa correta: fundo success-soft + borda success + letra A–D
  preenchida em verde + tag textual "correta".
- Escolha errada: fundo danger-soft + borda danger + letra vermelha + tag
  "sua resposta".
- Neutras pós-correção: brancas com opacidade 60% (foco no que importa).
- Cor nunca é o único sinal (tags textuais + letra preenchida mantidas).

### 3. Explicação + fonte em bloco preenchido

> "a explicacao com a fonte tambem vinha dentro de um preenchimento. Traz
> de volta"

- O container de correção usa `success-soft`/`danger-soft` conforme o
  resultado, borda na cor, raio 10.
- Lead serif ("Correta." / "A correta é D.") na cor do resultado; corpo em
  sans 15/16px; "Fonte oficial" em mono com link externo.
- Presente no modo estudo (feedback imediato) E na revisão pós-final
  (v1.1 §11 já garantia; agora com o preenchimento).

### 4. Fim da letra gigante

> "as letras no atual ainda continuam gigante. Utiilize o print anexo pra
> ver o tamanho da letra e aplique no atual. Seja simulado, estudo,
> revisao. Onde tiver a letra gigante, corrija"

- A escala do patch v1.1 §5 (20/26/32px por breakpoint) foi substituída
  pelo tamanho de leitura do app antigo: **stem 15px < 640px, 16px ≥ 640**
  (Newsreader, medida 68ch, leading 1.55); **alternativas 15/16px** em
  linhas de 54px; explicações idem.
- Vale para simulado, estudo e revisão (todos usam o `QuestionCard`).
- O que NÃO mudou: Newsreader como display, títulos de tela (text-2xl/3xl
  font-light), nota do laudo em mono grande (números, não texto corrido) —
  esses seguem a identidade Noos e não eram alvo do feedback.

## Fora de escopo / decisões

- Sem mudanças de banco, schema, questões ou DTO — lote 100%
  apresentacional.
- Versão bumped para 1.4.1 em `version.ts`/`package.json`/`sw.js`/
  `offline.html`; popup de novidades reescrito com os 4 pontos (PT/EN).
- Print anexado não disponível no canal: tom de 15/16px calibrado contra o
  app antigo em produção (v1.2.x).

## Critérios de aceite (verificados no navegador)

1. [x] Pills com fundo preenchido visíveis em estudo e revisão (claro e
       escuro), ausentes no simulado.
2. [x] Acerto: preenchimento verde-suave + borda; erro: vermelho-suave;
       tom perceptível mas mais discreto que o antigo.
3. [x] Bloco de explicação + fonte preenchido na cor do resultado, no
       estudo e na revisão.
4. [x] Stem/alternativas medidos em 16px desktop e 15px@375, nos três
       modos.
5. [x] Zero regressões: mobile 375 sem overflow horizontal, dark mode OK,
       PT/EN OK, zero erros de console, lint/tsc limpos, `/api/health` ok.

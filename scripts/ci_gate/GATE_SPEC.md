# GATE_SPEC — Quality Gate do Banco DBDEA (Comitê de Qualidade)

**Versão:** 1.0 · 27/10/2026 · **Status: APROVADO pelo comitê (9/9 papéis) + Red Team**

O gate transforma a auditoria de censo (v1/v2) em **trava de integração contínua**: nenhum lote de
questões entra no banco sem passar pelas mesmas checagens que aprovaram as 116 questões atuais.
Ele não substitui a revisão humana do comitê — ele **elimina a classe de defeitos mecânicos**
para que a revisão humana foque no que só humanos pegam: semântica, precisão técnica e qualidade
de distratores.

---

## 1. Como rodar

```bash
# local (qualquer alteração em data/)
bun scripts/ci_gate/gate.ts [baseDir] [--strict] [--out arquivo.json] [--quiet]

# red team (prova que o gate falha quando deve)
bun scripts/ci_gate/selftest.ts
```

- `baseDir` padrão: `scripts/data_fixed/data` (árvore canônica corrigida).
- **Exit codes:** `0` = PASS · `1` = FAIL — é isto que o CI consome.
- `--strict`: MÉDIO também bloqueia (recomendado no trunk; PRs de conteúdo podem rodar sem).
- Saída JSON estável (`gate_result.json`) com findings, estatísticas e veredito.

### Integração CI (GitHub Actions)

```yaml
name: question-bank-gate
on: [pull_request]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun scripts/ci_gate/gate.ts data --strict
```

### Gancho local (pre-push)

```bash
bun scripts/ci_gate/gate.ts --strict || echo "BLOQUEADO pelo gate do comitê"
```

---

## 2. Política de severidade

| Severidade | Comportamento | Uso |
|---|---|---|
| **CRIT** | Bloqueia sempre | Integridade estrutural (chaves, gabarito, registry, viabilidade de simulado) |
| **ALTO** | Bloqueia sempre | Qualidade psicométrica e de referência (viés de comprimento, duplicatas, URL, blueprint) |
| **MÉDIO** | Avisa; bloqueia com `--strict` | Degradáveis (epitáfios, concentração leve, desequilíbrio EN/PT) |
| **BAIXO** | Informativo | Higiene (aspas curvas, NBSP, stems longos) |

## 3. Matriz de checagens × donos (assinaturas)

Limiares entre parênteses. **Família** = chave estável usada pelo CI e pelo selftest.

### Question Bank Lead — *chaves, registry e capacidade*
| Família | Sev | Regra |
|---|---|---|
| `KEY_DUP` | CRIT | chave de questão duplicada entre arquivos |
| `KEY_FORMAT` | ALTO | chave fora do padrão `S{1-7}-NNN` |
| `KEY_GAP` | ALTO | gap na sequência de chaves de um domínio |
| `REGISTRY_ORPHAN` | CRIT | questão sem entrada no id-registry (nunca ganharia publicId) |
| `REGISTRY_EPITAPH` | MÉDIO | entrada de registry sem questão (confirmar remoção intencional) |
| `REGISTRY_DUP_ID` | CRIT | publicId duplicado |
| `REGISTRY_FORMAT` | ALTO | publicId fora do padrão `RAN-DBDEA-NNNNN` |
| `REGISTRY_ORDER` | MÉDIO | registry fora de ordem crescente |
| `REGISTRY_GAP` | MÉDIO | lacunas na sequência pública (confirmar epitáfos) |

### DB & Schema Architect — *shape dos seeds*
| Família | Sev | Regra |
|---|---|---|
| `OPTIONS_SHAPE` | CRIT | `options` ≠ 4 elementos |
| `OPTIONS_DUP` | CRIT | alternativas duplicadas na mesma questão |
| `OPTIONS_TRIVIAL` | CRIT | alternativa vazia/trivial (<5 chars) |
| `CORRECT_INDEX` | CRIT | `correctIndex` fora de 0–3 |
| `DIFFICULTY_VALUE` | ALTO | dificuldade fora de EASY/MEDIUM/HARD |
| `DOMAIN_MISMATCH` | CRIT | `domainCode` diverge do arquivo em que a questão vive |
| `MARKDOWN_FENCE` | ALTO | bloco de código não fechado em stem/explicação |
| `CONTROL_CHARS` | ALTO | caracteres de controle no texto |
| `WINDOWS_CR` | MÉDIO | CR no fim de linha |
| `MARKDOWN_CURLY` / `NBSP` | BAIXO | aspas tipográficas / espaço NBSP |

### QA & Psychometrics Lead — *justiça do item*
| Família | Sev | Regra |
|---|---|---|
| `BIAS_LENGTH` | ALTO (>40%) / MÉDIO (>33%) | alternativa correta sistematicamente a mais longa |
| `BIAS_RATIO` | MÉDIO (>1,25×) | comprimento médio da correta vs distratores |
| `LEN_HOMOGENEITY` | BAIXO (>3×) | correta mais que o triplo do distrator mais curto |
| `INDEX_BALANCE` | MÉDIO (fora de 10–40%) | concentração global do gabarito em um índice |
| `GABARITO_CONCENTRATION` | MÉDIO (>45%) | concentração de gabaritos por domínio |
| `DIFFICULTY_MIX` | MÉDIO (fora de 10–65%) | mix global de dificuldade |
| `DUP_JACCARD` | ALTO (≥0,70) / MÉDIO (>0,55) | stems quase duplicados no mesmo domínio |
| `ITEM_WRITING` | ALTO | "all/none of the above" |

### SME / Cert Architect — *fidelidade ao exame*
| Família | Sev | Regra |
|---|---|---|
| `BLUEPRINT_DEVIATION` | ALTO (>4pp) | participação do domínio vs peso oficial do blueprint |
| `SIMULADO_INFEASIBLE` | CRIT | pool do domínio menor que a cota de um simulado de 45 questões |

### Security Engineer — *superfície de referências*
| Família | Sev | Regra |
|---|---|---|
| `REFERENCE_DOMAIN` | ALTO | referenceUrl fora de `docs.databricks.com` |
| `URL_ALLOWLIST` | ALTO | referenceUrl fora da allowlist verificada |
| `GUIDE_URL_DOMAIN` / `GUIDE_URL_ALLOWLIST` | ALTO / MÉDIO | idem para links do guia de estudos |

### UX Lead + Technical Writer — *legibilidade e bilíngue*
| Família | Sev | Regra |
|---|---|---|
| `EXPLANATION_SHORT` | ALTO (<200 chars) | explicação rasa demais para study-mode |
| `EXPLANATION_BALANCE` | MÉDIO (razão <0,35) | EN/PT suspeitosamente desbalanceadas |
| `PLACEHOLDER` | CRIT | TODO/TBD/lorem ipsum |
| `REFERENCE_TITLE` | MÉDIO | título de referência ausente |
| `STEM_QUESTION` | MÉDIO | stem sem interrogação |
| `STEM_LONG` | BAIXO (>130 palavras) | cenário prolixo |

### Data Pipeline Engineer — *execução*
Saida JSON estável, exit codes 0/1, sem dependências externas (bun puro), `--strict`/`--out`/`--allowlist`
parametrizáveis, importável como lib (`runGate()`) para o selftest. Assinado.

### Red Team — *prova por mutação (selftest.ts)*
Matriz de **17 casos** sobre cópias da árvore real (27/10/2026): baseline limpo, chave duplicada,
domainCode divergente, órfã de registry, publicId duplicado, correctIndex inválido, explicação PT vazia,
**viés de comprimento inflado em 55 questões**, URL fora da allowlist, URL fora do domínio,
stems idênticos, desvio de blueprint (−6 questões S7), aspas curvas (detecta sem bloquear),
epitáfio de registry (só bloqueia com --strict, nas duas variantes) e exit codes do CLI (0/1).
**Resultado: 17/17 capturadas — APROVADO.** Duas correções foram necessárias no PRÓPRIO selftest
(guard de escape olhando o bloco inteiro; off-by-one no split das opções), achadas pelo próprio
ensaio — a matriz permanece como regressão permanente.

## 4. Política da allowlist (62 URLs)

1. Fonte: as 57 URLs do banco + 5 do guia, todas verificadas on-line na auditoria v1 (curl + asserção
   de conteúdo) e **revalidadas hoje (27/10/2026): 62/62 HTTP 200** (`allowlist_check.tsv`).
2. Nova URL só entra após: HTTP 200 + leitura do conteúdo que sustenta a claim + registro no log.
3. URLs do banco DEVEM vir daqui (o campo `referenceUrl` do `types.ts` já documenta isso).

## 5. Limites conhecidos (parecer honesto do Red Team)

O gate é **necessário, não suficiente**. Ele não avalia: corretude técnica da claim (SME),
plausibilidade real dos distratores (SME), naturalidade da tradução PT (Tech Writer), suficiência
pedagógica da explicação (UX) nem cobertura de sub-tópico do blueprint (SME). Por isso, todo lote
novo continua passando pelo funil do comitê: **redação → revisão SME → gate → veredito com Red Team
com poder de veto.** O gate garante que o funil comece limpo, não que ele seja desnecessário.

## 6. Baseline no momento da aprovação

`116 questões · registry 116/116 · viés de comprimento 12,1% (limite 40%) · razão de médias 1,02 ·
gabarito 28/32/28/28 · dificuldade 30/51/19% · 2 simulados disjuntos possíveis · 0 findings.`

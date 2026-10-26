# constitution.md — regras permanentes

Regras que nenhuma mudança pode quebrar. Valem mais que uma suíte verde:
descrevem a promessa que o app faz ao usuário.

## Princípios de método (guia Noos v1.1, Anexo A)

1. **Uma pessoa responde.** Mudanças de escopo e publicação têm responsável e
   autorização vigente (o fundador).
2. **Evidência vence relato.** Toda tarefa fecha com diff, resultado de
   comando, teste ou verificação repetível.
3. **Uma fase, um conceito.** Ideia adicional entra no `plan.md` e recebe
   decisão própria.
4. **A implementação cumpre a decisão.** Mudança de decisão é justificada e
   registrada antes de redefinir a entrega.
5. **Fidelidade vence teste verde.** Nenhum teste passando justifica remover
   acesso, alterar regra de negócio ou ampliar escopo.
6. **Bug corrigido ganha guarda.** Proteção permanente cobre o comportamento
   que falhou (ex.: `scripts/option-length-report.ts` guarda o viés de
   tamanho nas alternativas corrigido na v1.3.1).
7. **O estado do usuário é invariante.** Progresso, rascunho e conteúdo local
   são preservados; nunca apagar dados para resolver bug de atualização.
8. **Documentação e verificação fazem parte da entrega.** SDD, versão e
   checagens no mesmo lote do commit.

## Invariantes do produto (guia Noos v1.1)

| Invariante | Como verificar | Se falhar |
|---|---|---|
| Local-First | Abrir e responder offline; recarregar e conferir rascunho | Progresso perdido |
| ID imutável | Abrir deep-link antigo após renomear prova | Link morto, histórico órfão |
| Manifesto válido | Fixture inválida deve ser rejeitada sem quebrar o resto | Ingestão parcial silenciosa |
| Deep-link | Abrir rota canônica com o hub indisponível | Questão inacessível |
| Fonte oficial | Revisar origem da explicação e versão no catálogo | Confiança quebrada |
| Sem interrupção | Nada entre pergunta e resposta: sem paywall, anúncio ou pop-up na tela de questão | Contrato de estudo rompido |

## Constituição do Ranvier (decisões do fundador, vigentes)

- **Anti-dump**: questões 100% autorais, cenário no estilo do exame, referência
  oficial por questão; nunca reproduzir itens reais/NDA.
- **Questões sempre em inglês** (formato do exame real); interface e explicações
  PT-BR/EN.
- **Correção server-side**: o gabarito nunca vai para o cliente antes da
  resposta; `correctIndex` só volta depois de responder.
- **Anônimo primeiro**: tudo funciona sem conta (progresso em cookie de sessão
  anônima); login opcional só sincroniza progresso — e-mail/senha, sem
  rastreamento, sem login de terceiros.
- **Blueprint fiel**: distribuição do simulado espelha os pesos oficiais do
  Exam Guide May/2026; nenhuma métrica inventada na interface (70% é referência
  comunitária, rotulada com honestidade).
- **Identidade papel-de-prova** (patch Ranvier v1.0 + guia Noos v1.1): sem
  gradiente, sombra decorativa, emoji ou confete; pergunta em serifa;
  mono só para tempo/IDs/metadados; tema claro padrão.
- **Assinatura "by Noos"** (decisão do fundador 2026-10-25): vive no rodapé de
  conteúdo — uma vez por tela, nunca nas duas pontas — e **é link para o hub do
  ecossistema** (sobrepõe o "nunca como ação" do guia §02; é endosso de
  origem, não CTA de produto).
- **Aviso de novidades** (decisão do fundador 2026-10-25): popup na tela
  inicial a cada atualização, descrevendo as novidades, uma única vez por
  usuário por versão (localStorage). Nunca durante questão/simulado.
- **Anúncios** config-gated (`NEXT_PUBLIC_ADSENSE_CLIENT`), nunca nas telas de
  estudo/exame ativos.

## Exceções e dívidas

Exceção aceita precisa de nome, motivo e prazo — registrado em `plan.md`
(§ Dívidas conhecidas). Nunca remover asserção para obter verde.

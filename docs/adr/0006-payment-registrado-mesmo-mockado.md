# ADR-0006 — Manter model Payment mesmo com pagamento simulado

## Status
Aceito

## Contexto
O pagamento não envolve transação financeira real (PDF oficial). Isso levantou a
dúvida se valeria a pena ter uma tabela própria para isso, ou resolver só como uma
função determinística sem persistência. O PRD detalhado modela um `Payment` explícito
como parte do modelo de dados oficial.

## Decisão
Manter um `model Payment` simples (id, valor, status aprovado/recusado, timestamp),
relacionado um-para-um com `Reservation`. Não há suporte a múltiplas tentativas de
pagamento por reserva nesta versão.

## Alternativas consideradas
- Sem tabela própria, resultado refletido só no `Reservation.status`: mais simples,
  mas diverge do modelo de dados documentado no PRD e perde o registro de que uma
  tentativa de pagamento ocorreu.

## Consequências
Se um fluxo de nova tentativa de pagamento for necessário no futuro, a relação
precisará mudar de um-para-um para um-para-muitos.
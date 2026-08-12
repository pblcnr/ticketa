# ADR-0004 — Reservation e Ticket como models separados, um Ticket por unidade

## Status
Aceito

## Contexto
Uma reserva pode ser recusada no pagamento, caso em que nenhum ingresso deve existir
(seção 15 do PDF oficial). O PRD também especifica que cada ingresso tem seu próprio
identificador/token seguro.

## Decisão
`Reservation` e `Ticket` são models distintos. `Ticket` referencia a `Reservation` de
origem. Uma reserva de quantidade N gera N registros de `Ticket`, cada um com seu
próprio `code` (código curto legível) e `qrToken` (token seguro do QR).

## Alternativas consideradas
- Um único model cobrindo os dois estágios: geraria campos de ingresso sempre nulos
  em toda reserva não confirmada, e não resolveria a necessidade de múltiplos QR Codes
  por reserva.

## Consequências
Validação na portaria opera sempre por `Ticket` individual, nunca pela `Reservation`
como um todo — o que é o comportamento correto exigido pelo fluxo de entrada.
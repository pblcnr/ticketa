# ADR-0005 — Conta de portaria vinculada a um evento específico

## Status
Aceito

## Contexto
O papel Portaria não tem signup público. É preciso decidir como essas contas nascem,
e o retorno de validação do PDF inclui explicitamente o estado "evento errado",
sugerindo que uma portaria está associada a um evento específico, não ao sistema
inteiro.

## Decisão
O organizador dono de um evento cria a conta de portaria para aquele evento. Cada
evento tem no máximo uma portaria vinculada (relação um-para-um), e uma portaria nova
é criada para cada evento novo — não reaproveitada entre eventos.

## Alternativas consideradas
- Portaria vinculada ao organizador (podendo validar qualquer evento dele): mais
  simples, mas cria ambiguidade sobre qual evento uma portaria genérica deveria
  validar.

## Consequências
O endpoint de criação de portaria precisa validar não só o papel (Organizador), mas
também que o organizador autenticado é dono do evento-alvo — checagem de posse do
recurso, não só de papel.
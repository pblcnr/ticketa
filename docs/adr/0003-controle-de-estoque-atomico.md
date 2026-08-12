# ADR-0003 — Controle de estoque via decremento atômico

## Status
Aceito

## Contexto
Duas reservas simultâneas não podem, juntas, ultrapassar a capacidade do evento
(RF10, RNF05). A abordagem de "ler estoque disponível, depois decidir se reserva"
como dois passos separados é vulnerável a condição de corrida.

## Decisão
`Event.stock` é um campo próprio, decrementado através de uma única instrução SQL
atômica (`UPDATE ... SET stock = stock - :qtd WHERE stock >= :qtd`). Se a atualização
afetar zero linhas, não havia estoque suficiente.

## Alternativas consideradas
- Calcular disponibilidade dinamicamente somando reservas ativas a cada consulta: exige
  transação `SERIALIZABLE` ou `SELECT ... FOR UPDATE` para ter a mesma segurança, com
  mais complexidade e sem ganho real para o escopo do MVP.

## Consequências
Todo caminho que cancela ou expira uma reserva precisa devolver a quantidade ao
`stock` explicitamente, ou o número fica dessincronizado do estado real das reservas.
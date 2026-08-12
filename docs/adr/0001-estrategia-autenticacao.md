# ADR-0001 — Estratégia de autenticação: Supabase Auth + tabela de perfil própria

## Status
Aceito

## Contexto
O sistema precisa autenticar três papéis distintos (Organizador, Cliente, Portaria),
mantendo as regras de autorização críticas no backend (NestJS), conforme exigido pelo
PRD. O Supabase oferece autenticação gerenciada, mas não tem conceito nativo de "papel
de negócio" por usuário.

## Decisão
Usar o Supabase Auth para cadastro de credenciais e emissão de JWT. O papel do usuário
não fica no Supabase Auth — fica numa tabela própria (`profiles`), gerenciada via
Prisma, referenciando o mesmo UUID gerado pelo Supabase Auth. Toda rota protegida
valida o JWT e consulta o papel nessa tabela através de um Guard no NestJS.

## Alternativas consideradas
- Auth própria no NestJS (Passport + JWT + bcrypt): mais controle e aprendizado, mas
  maior superfície de erro de segurança dentro do prazo de 7 dias.

## Consequências
Menos código de autenticação para manter; autorização por papel depende inteiramente
da tabela `profiles` estar sempre consistente com o Supabase Auth.
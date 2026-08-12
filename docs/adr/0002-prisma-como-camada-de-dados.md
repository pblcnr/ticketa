# ADR-0002 — Prisma ORM direto no Postgres, em vez de supabase-js

## Status
Aceito

## Contexto
O Supabase oferece um client (`supabase-js`) com REST autogerado sobre o Postgres. O
sistema também precisa de transações e locks explícitos para o controle de estoque,
que é o requisito não-funcional de maior risco do projeto (RNF05).

## Decisão
Usar Prisma ORM (v7) conectado diretamente ao Postgres do Supabase via `DATABASE_URL`,
para todas as tabelas de negócio. O `supabase-js` é usado exclusivamente para operações
de Auth (criação de usuário via API admin), não para dados.

## Alternativas consideradas
- `supabase-js` para tudo: mais simples de configurar, mas o query builder é limitado
  para expressar as transações atômicas que o controle de estoque exige.

## Consequências
Uma dependência a mais no projeto; em compensação, transações de banco ficam sob
controle direto do código, com migrations versionadas e explícitas.
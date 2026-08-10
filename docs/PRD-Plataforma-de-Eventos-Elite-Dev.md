# PRD — Plataforma de Eventos e Ingressos

**Versão:** 1.0  
**Status:** Planejamento / MVP  
**Projeto:** Desafio Elite Dev 2026  
**Stack:** React + Vite, Node.js + NestJS, Supabase  
**Arquitetura:** Monólito  
**Organização:** Feature-based + Clean Code

---

## 1. Visão do produto

A aplicação será uma **plataforma de eventos e ingressos** na qual organizadores poderão criar e gerenciar eventos a partir de informações obtidas de uma API externa de shows ou filmes, enquanto clientes poderão descobrir eventos, reservar ingressos, realizar um pagamento simulado e receber um ingresso digital com QR Code.

Na entrada do evento, usuários com o papel de **Portaria** poderão validar os ingressos por meio da leitura do QR Code ou pela digitação manual do código.

O fluxo principal será:

**API externa → Organizador → Evento publicado → Cliente → Reserva → Pagamento → Ingresso → QR Code → Portaria → Validação**

O objetivo é construir um MVP funcional de ponta a ponta, priorizando um fluxo simples, completo e tecnicamente consistente.

---

## 2. Problema

A solução deve centralizar o ciclo de criação, venda e validação de ingressos para eventos.

O sistema precisa resolver principalmente:

- criação e publicação de eventos;
- disponibilização de ingressos;
- controle de estoque;
- prevenção de venda acima da capacidade;
- reserva e pagamento;
- emissão de ingresso;
- identificação segura do ingresso;
- compartilhamento do ingresso;
- validação na portaria;
- prevenção de utilização duplicada.

Como a modalidade escolhida será **pista**, não haverá mapa de assentos. O cliente informará apenas a quantidade de ingressos desejada.

---

## 3. Objetivo do produto

### Objetivo principal

Construir um **MVP funcional de ponta a ponta** de uma plataforma de eventos que permita demonstrar todo o ciclo de vida de um ingresso:

> **Criar evento → Publicar → Comprar → Pagar → Receber ingresso → Compartilhar → Validar**

O objetivo não é construir uma plataforma comercial completa, mas demonstrar uma solução tecnicamente consistente, organizada e bem documentada.

---

## 4. Objetivos específicos

### Para o cliente

- Encontrar eventos publicados.
- Visualizar informações do evento.
- Escolher a quantidade de ingressos.
- Realizar uma reserva.
- Efetuar pagamento simulado.
- Receber o ingresso.
- Visualizar seus ingressos.
- Acessar o QR Code.
- Compartilhar o ingresso através de um link.
- Ter seu ingresso validado na entrada.

### Para o organizador

- Criar eventos.
- Utilizar dados provenientes de uma API externa.
- Definir data, local, capacidade e preço.
- Publicar eventos.
- Gerenciar eventos publicados.

### Para a portaria

- Acessar a tela de validação.
- Ler QR Code pela câmera.
- Digitar manualmente o código como alternativa.
- Receber retorno claro sobre a validade.
- Impedir reutilização de ingressos.

---

# 5. Personas e papéis

O sistema possuirá três papéis distintos:

## 5.1 Cliente

Pessoa que deseja participar de um evento.

**Necessidades:**

- Descobrir eventos.
- Saber preço, data e local.
- Comprar ingressos.
- Ter acesso fácil ao ingresso.
- Apresentar o ingresso na entrada.

## 5.2 Organizador

Pessoa responsável pela criação e gerenciamento dos eventos.

**Necessidades:**

- Criar eventos rapidamente.
- Utilizar informações de shows/filmes existentes.
- Definir capacidade e preço.
- Acompanhar a disponibilidade dos ingressos.

## 5.3 Portaria

Usuário responsável por validar ingressos no momento da entrada.

**Necessidades:**

- Validar rapidamente um ingresso.
- Utilizar câmera ou código manual.
- Saber imediatamente se o ingresso é válido.
- Identificar ingressos já utilizados.

---

# 6. Escopo do MVP

## 6.1 Autenticação

O sistema deverá possuir autenticação para os três papéis:

- Cliente;
- Organizador;
- Portaria.

Após autenticar, o sistema deverá identificar o papel do usuário e permitir somente as funcionalidades correspondentes.

### Fora do escopo

Recuperação de senha não faz parte do MVP.

---

# 7. Eventos

## 7.1 Catálogo externo

O organizador deverá conseguir montar um evento utilizando informações provenientes de uma API externa.

O desafio permite utilizar:

- Ticketmaster Discovery API;
- TMDb;
- ou ambas.

### Decisão do MVP

Para reduzir o escopo, utilizar uma única API externa.

A escolha definitiva deverá ser registrada posteriormente em um ADR/README.

---

## 7.2 Criação do evento

O organizador deverá conseguir selecionar um item do catálogo externo e transformá-lo em um evento da plataforma.

### Campos mínimos

| Campo | Obrigatório |
|---|---|
| Título | Sim |
| Descrição | Sim |
| Data | Sim |
| Local | Sim |
| Capacidade | Sim |
| Preço | Sim |
| Imagem | Opcional |
| Referência externa | Sim |

---

## 7.3 Status do evento

O evento poderá possuir os seguintes estados:

```text
DRAFT
PUBLISHED
CANCELLED
FINISHED
```

Para o MVP, o fluxo principal será:

```text
DRAFT → PUBLISHED → FINISHED
```

O estado `CANCELLED` pode ser implementado como melhoria futura.

---

# 8. Navegação de eventos

O cliente deverá conseguir visualizar os eventos publicados.

Cada evento deverá apresentar pelo menos:

- título;
- imagem;
- data;
- local;
- preço;
- disponibilidade.

### Busca e filtros

Busca e filtros são considerados opcionais.

Para o MVP:

- **Busca:** recomendada.
- **Filtros avançados:** podem ficar para uma segunda etapa.

---

# 9. Compra de ingressos

Como o modelo escolhido é **pista**, o cliente não selecionará lugares individuais.

O fluxo será:

```text
Evento
  ↓
Selecionar quantidade
  ↓
Ver resumo
  ↓
Reservar
  ↓
Pagamento
  ↓
Confirmação
  ↓
Ingresso
```

## 9.1 Seleção da quantidade

O cliente deverá informar a quantidade de ingressos.

Exemplo:

```text
Evento: Show XYZ

R$ 80,00 por ingresso

Quantidade:
[-]  2  [+]

Subtotal: R$ 160,00

[Continuar]
```

O sistema deverá impedir:

- quantidade menor que 1;
- quantidade maior que a disponibilidade;
- compra acima da capacidade do evento.

---

# 10. Controle de estoque

O sistema deverá garantir que a capacidade do evento não seja ultrapassada.

Exemplo:

```text
Capacidade: 100

Ingressos vendidos: 97

Disponíveis: 3
```

Um cliente não poderá comprar 4 ingressos.

Duas compras simultâneas também não poderão consumir o mesmo estoque.

### Regra de negócio

```text
availableTickets = capacity - soldTickets
```

A atualização do estoque deverá ser feita de maneira **atômica no banco**, e não apenas através de uma validação no frontend.

Essa decisão é importante para demonstrar consistência em cenários de concorrência.

---

# 11. Reserva

A reserva representa a intenção de compra antes da confirmação do pagamento.

Uma reserva deverá possuir:

- cliente;
- evento;
- quantidade;
- valor unitário;
- valor total;
- status;
- data de criação;
- data de expiração.

### Status

```text
PENDING
CONFIRMED
CANCELLED
EXPIRED
```

Fluxo:

```text
PENDING
   ↓
Pagamento aprovado
   ↓
CONFIRMED
```

Ou:

```text
PENDING
   ↓
Pagamento recusado
   ↓
CANCELLED
```

---

# 12. Pagamento simulado

O pagamento deverá ser simulado, contemplando tanto confirmação quanto recusa.

Não será necessário integrar um gateway real.

### Fluxo

```text
Checkout
   ↓
Pagamento
   ↓
┌───────────────┐
│               │
Aprovado      Recusado
│               │
↓               ↓
Ingresso       Reserva
gerado         cancelada
```

Para fins de demonstração, a interface poderá oferecer:

```text
[ Simular pagamento aprovado ]

[ Simular pagamento recusado ]
```

Isso torna o comportamento determinístico durante a avaliação.

---

# 13. Ingresso

Após o pagamento aprovado, o sistema deverá gerar um ingresso.

O ingresso deverá estar associado a:

- cliente;
- evento;
- reserva;
- código único;
- status;
- data de emissão.

### Status

```text
VALID
USED
CANCELLED
```

---

# 14. QR Code

Cada ingresso deverá possuir um QR Code.

O QR Code não deverá conter informações sensíveis ou facilmente manipuláveis.

Uma abordagem recomendada para o MVP é utilizar um **token aleatório criptograficamente seguro** como identificador do ingresso.

Fluxo conceitual:

```text
Ticket
   ↓
Secure Random Token
   ↓
QR Code
```

Na validação:

```text
QR Code
   ↓
API
   ↓
Token
   ↓
Ingresso
   ↓
Validação
```

---

# 15. Meus ingressos

O cliente deverá possuir uma área:

> **Meus ingressos**

Cada ingresso deverá apresentar:

- evento;
- data;
- local;
- quantidade;
- código;
- QR Code;
- status.

Exemplo:

```text
┌──────────────────────────────┐
│ SHOW XYZ                     │
│                              │
│ 15/09/2026                   │
│ São Paulo - SP               │
│                              │
│ 2 ingressos                  │
│                              │
│          [ QR CODE ]         │
│                              │
│ Código: A8F2-91KX            │
│                              │
│ [ Compartilhar ingresso ]    │
└──────────────────────────────┘
```

---

# 16. Compartilhamento

O cliente poderá compartilhar um ingresso através de um link gerado pela aplicação.

Exemplo conceitual:

```text
/eventos/ingressos/{publicToken}
```

O link deverá permitir visualizar informações suficientes para identificar o ingresso, mas não deverá expor dados pessoais desnecessários do proprietário.

---

# 17. Portaria

A portaria terá uma tela dedicada à validação.

## Método 1 — QR Code

```text
[ câmera ]

Aponte o QR Code
para a câmera
```

## Método 2 — Manual

```text
Código do ingresso:

[ A8F2-91KX ]

[ Validar ]
```

---

# 18. Validação do ingresso

A API deverá verificar:

1. O ingresso existe?
2. O ingresso pertence ao evento correto?
3. O ingresso está válido?
4. O ingresso já foi utilizado?

## Válido

```text
✓ INGRESSO VÁLIDO

Evento:
Show XYZ

Ingresso autorizado.
```

## Inválido

```text
✕ INGRESSO INVÁLIDO

O ingresso não existe ou não é válido.
```

## Já utilizado

```text
⚠ INGRESSO JÁ UTILIZADO

Este ingresso já foi validado anteriormente.
```

## Evento errado

```text
✕ EVENTO INCORRETO

Este ingresso não pertence a este evento.
```

---

# 19. Regra crítica: ingresso não pode ser utilizado duas vezes

A validação deverá ser atômica.

Fluxo:

```text
Ticket VALID
     ↓
Validar
     ↓
Ticket USED
```

Se duas requisições tentarem validar o mesmo ingresso simultaneamente, somente uma deverá conseguir alterar o estado para `USED`.

---

# 20. Arquitetura

## 20.1 Arquitetura geral

A aplicação será construída como um **monólito modular**.

```text
┌──────────────────────────────────────┐
│              Frontend                │
│          React + Vite                │
└──────────────────┬───────────────────┘
                   │ HTTP/REST
                   ↓
┌──────────────────────────────────────┐
│               Backend                │
│             NestJS                   │
│                                      │
│  Auth                                │
│  Users                               │
│  Events                              │
│  Reservations                        │
│  Payments                            │
│  Tickets                             │
│  Gate                                │
│  External Catalog                    │
└───────────┬──────────────┬───────────┘
            │              │
            ↓              ↓
      ┌──────────┐    ┌──────────────┐
      │ Supabase │    │ API Externa  │
      │ Database │    │ Ticketmaster │
      │   Auth   │    │ / TMDb       │
      └──────────┘    └──────────────┘
```

---

# 21. Supabase

O Supabase será utilizado como infraestrutura de PostgreSQL e autenticação, mantendo o NestJS como camada responsável pelas regras de negócio.

Fluxo recomendado:

```text
React
  ↓
NestJS
  ↓
Service
  ↓
Repository
  ↓
Supabase/PostgreSQL
```

Operações críticas, como reserva, controle de estoque, pagamento e validação, deverão passar pelo backend.

Isso evita colocar regras de negócio críticas diretamente no frontend.

---

# 22. Estrutura Feature-based

Uma possível estrutura:

```text
backend/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── events/
    │   ├── catalog/
    │   ├── reservations/
    │   ├── payments/
    │   ├── tickets/
    │   └── gate/
    │
    ├── shared/
    │   ├── database/
    │   ├── guards/
    │   ├── decorators/
    │   ├── exceptions/
    │   └── utils/
    │
    └── main.ts
```

Cada feature poderá seguir uma separação semelhante:

```text
events/
├── controllers/
├── services/
├── repositories/
├── dto/
├── entities/
└── events.module.ts
```

A ideia é manter as responsabilidades isoladas por domínio.

---

# 23. Principais módulos

| Módulo | Responsabilidade |
|---|---|
| Auth | Login e autenticação |
| Users | Usuários e papéis |
| Events | Criação e gerenciamento |
| Catalog | Integração com API externa |
| Reservations | Reservas e estoque |
| Payments | Pagamento simulado |
| Tickets | Emissão e compartilhamento |
| Gate | Validação dos ingressos |

---

# 24. Modelo de dados inicial

## User

```text
id
name
email
role
created_at
```

Roles:

```text
ORGANIZER
CUSTOMER
GATE
```

## Event

```text
id
external_id
title
description
date
location
capacity
available_tickets
price
image_url
status
organizer_id
created_at
updated_at
```

## Reservation

```text
id
customer_id
event_id
quantity
unit_price
total_price
status
expires_at
created_at
```

## Ticket

```text
id
reservation_id
event_id
customer_id
code
qr_token
status
used_at
created_at
```

## Payment

```text
id
reservation_id
amount
status
created_at
```

Status:

```text
APPROVED
DECLINED
```

---

# 25. Integração com API externa

A integração deverá ser isolada dentro da feature `catalog`.

Exemplo conceitual:

```text
CatalogController
       ↓
CatalogService
       ↓
CatalogProvider
       ↓
Ticketmaster/TMDb
```

Isso evita acoplar o restante da aplicação à API escolhida.

No futuro, seria possível trocar:

```text
TicketmasterProvider
```

por:

```text
TmdbProvider
```

sem alterar a lógica de criação dos eventos.

---

# 26. API REST — MVP

## Auth

```http
POST /auth/login
```

## Events

```http
GET    /events
GET    /events/:id
POST   /events
PATCH  /events/:id
POST   /events/:id/publish
```

## Catalog

```http
GET /catalog/search
GET /catalog/:id
```

## Reservations

```http
POST /reservations
GET  /reservations/:id
POST /reservations/:id/cancel
```

## Payments

```http
POST /payments
```

## Tickets

```http
GET /tickets
GET /tickets/:id
GET /tickets/share/:token
```

## Gate

```http
POST /gate/validate
```

---

# 27. Fluxo principal do MVP

## Compra

```text
Cliente
   │
   ├── Login
   │
   ├── Visualiza eventos
   │
   ├── Seleciona evento
   │
   ├── Seleciona quantidade
   │
   ├── Cria reserva
   │
   ├── Realiza pagamento
   │
   ├── Pagamento aprovado
   │
   └── Ingresso gerado
```

## Entrada

```text
Cliente
   │
   └── Apresenta QR Code
              │
              ↓
          Portaria
              │
              ↓
         Validação
              │
       ┌──────┴──────┐
       ↓             ↓
    Válido         Inválido
       │
       ↓
    USED
```

---

# 28. Requisitos funcionais

| ID | Requisito |
|---|---|
| RF01 | Usuário deve conseguir autenticar |
| RF02 | Sistema deve diferenciar os três papéis |
| RF03 | Cliente deve visualizar eventos publicados |
| RF04 | Cliente deve visualizar preço, data e local |
| RF05 | Organizador deve consultar catálogo externo |
| RF06 | Organizador deve criar eventos |
| RF07 | Organizador deve publicar eventos |
| RF08 | Cliente deve selecionar quantidade de ingressos |
| RF09 | Sistema deve controlar disponibilidade |
| RF10 | Sistema deve impedir venda acima da capacidade |
| RF11 | Cliente deve criar uma reserva |
| RF12 | Sistema deve simular pagamento aprovado |
| RF13 | Sistema deve simular pagamento recusado |
| RF14 | Sistema deve gerar ingresso após pagamento aprovado |
| RF15 | Sistema deve gerar QR Code |
| RF16 | Cliente deve visualizar seus ingressos |
| RF17 | Cliente deve compartilhar ingresso |
| RF18 | Portaria deve validar QR Code |
| RF19 | Portaria deve permitir código manual |
| RF20 | Sistema deve identificar ingresso inválido |
| RF21 | Sistema deve identificar ingresso já utilizado |
| RF22 | Sistema deve identificar evento incorreto |
| RF23 | Sistema deve impedir dupla validação |

---

# 29. Requisitos não funcionais

### RNF01 — Arquitetura

A aplicação deverá utilizar arquitetura monolítica modular.

### RNF02 — Código

O backend deverá seguir princípios de Clean Code.

### RNF03 — Organização

O código deverá ser organizado por feature/domínio.

### RNF04 — Segurança

Operações sensíveis deverão ocorrer no backend.

### RNF05 — Consistência

Operações de estoque e validação deverão ser protegidas contra concorrência.

### RNF06 — Documentação

O projeto deverá possuir README contendo instruções de instalação, configuração e execução.

### RNF07 — Dados de demonstração

O sistema deverá possuir dados seed para:

- 1 organizador;
- 2 clientes;
- 1 usuário de portaria;
- pelo menos 1 evento publicado;
- ingressos disponíveis.

---

# 30. Critérios de aceite do MVP

O MVP será considerado funcional quando for possível executar o seguinte cenário sem intervenção manual no banco:

## Cenário 1 — Organizador

1. Login como organizador.
2. Consultar catálogo externo.
3. Selecionar um item.
4. Criar evento.
5. Definir data, local, capacidade e preço.
6. Publicar evento.

## Cenário 2 — Cliente

1. Login como cliente.
2. Visualizar evento.
3. Selecionar quantidade.
4. Criar reserva.
5. Simular pagamento aprovado.
6. Receber ingresso.
7. Visualizar QR Code.

## Cenário 3 — Portaria

1. Login como portaria.
2. Abrir tela de validação.
3. Ler QR Code.
4. Receber resultado "válido".
5. Tentar utilizar novamente.
6. Receber resultado "já utilizado".

## Cenário 4 — Pagamento recusado

1. Cliente seleciona evento.
2. Cria reserva.
3. Simula pagamento recusado.
4. Sistema informa falha.
5. Ingresso não é emitido.

---

# 31. Fora do MVP

Para proteger o prazo de 7 dias, algumas funcionalidades não serão prioridade.

## Não implementar inicialmente

- mapa de assentos;
- revenda de ingressos;
- aplicativo mobile;
- recuperação de senha;
- envio por e-mail;
- nota fiscal;
- gateway de pagamento real.

## Possíveis melhorias

- cancelamento com devolução ao estoque;
- dashboard do organizador;
- filtros avançados;
- mapa de assentos;
- atualização de disponibilidade em tempo real;
- Docker Compose;
- testes mais abrangentes;
- deploy.

---

# 32. Priorização

## P0 — Obrigatório

```text
Auth
Eventos
API externa
Compra
Reserva
Estoque
Pagamento simulado
Ingresso
QR Code
Compartilhamento
Portaria
Validação
Seed
README
```

## P1 — Diferencial

```text
Busca
Filtros
Dashboard simples
Testes automatizados
Deploy
```

## P2 — Se sobrar tempo

```text
Cancelamento
Devolução ao estoque
Dashboard avançado
Realtime
Docker Compose
```

---

# 33. Estratégia de implementação

## Dia 1 — Fundação

- criar monorepo ou estrutura do projeto;
- React + Vite;
- NestJS;
- Supabase;
- configuração de ambiente;
- banco;
- autenticação;
- estrutura Feature-based.

## Dia 2 — Eventos

- integração com API externa;
- catálogo;
- criação de eventos;
- publicação;
- listagem.

## Dia 3 — Compra

- seleção de quantidade;
- reserva;
- controle de estoque;
- checkout.

## Dia 4 — Pagamento + ingresso

- pagamento simulado;
- emissão do ingresso;
- QR Code;
- "Meus ingressos".

## Dia 5 — Portaria

- tela de validação;
- leitura do QR;
- entrada manual;
- regras de validação;
- prevenção de dupla utilização.

## Dia 6 — Qualidade

- tratamento de erros;
- validações;
- testes;
- UX;
- responsividade;
- seed;
- refinamento visual.

## Dia 7 — Entrega

- deploy;
- README;
- documentação das decisões;
- documentação do uso de IA;
- revisão;
- testes do fluxo completo;
- commits finais.

---

# 34. Definição de pronto

Uma feature será considerada pronta quando:

- [ ] fluxo principal funciona;
- [ ] regras de negócio estão no backend;
- [ ] erros são tratados;
- [ ] validações existem;
- [ ] código segue a organização definida;
- [ ] não existem dados críticos controlados somente pelo frontend;
- [ ] fluxo foi testado manualmente;
- [ ] testes automatizados foram adicionados quando aplicável;
- [ ] documentação está atualizada.

---

# 35. Métrica de sucesso

Como esse é um desafio técnico e não um produto comercial real, a principal métrica do MVP será:

> **O avaliador consegue executar o fluxo completo de criação, compra e validação de um ingresso sem precisar configurar ou manipular dados manualmente?**

O fluxo de sucesso será:

```text
Organizador
    ↓
Cria evento
    ↓
Publica
    ↓
Cliente encontra
    ↓
Compra
    ↓
Pagamento aprovado
    ↓
Ingresso gerado
    ↓
QR Code
    ↓
Portaria
    ↓
Ingresso validado
```

---

# 36. Decisões arquiteturais

As decisões abaixo deverão ser documentadas como ADRs no projeto.

## ADR-001 — Monólito modular

**Decisão:** utilizar um monólito modular.

**Motivo:** o escopo do MVP é reduzido e o desafio possui prazo de sete dias. A arquitetura evita a complexidade operacional de microsserviços.

## ADR-002 — Feature-based

**Decisão:** organizar o código por domínio/feature.

**Motivo:** manter responsabilidades relacionadas próximas e facilitar a evolução do sistema.

## ADR-003 — Supabase

**Decisão:** utilizar Supabase como infraestrutura de PostgreSQL e autenticação, mantendo o NestJS como camada de regras de negócio.

**Motivo:** reduzir infraestrutura necessária sem transferir regras de negócio críticas para o frontend.

## ADR-004 — Pista

**Decisão:** utilizar ingressos por quantidade em vez de mapa de assentos.

**Motivo:** reduzir complexidade e priorizar o fluxo ponta a ponta dentro do prazo do desafio.

## ADR-005 — Pagamento simulado

**Decisão:** utilizar pagamento simulado.

**Motivo:** o desafio não exige uma transação financeira real e o objetivo é demonstrar o fluxo de confirmação e recusa.

## ADR-006 — API externa

**Decisão:** isolar a integração externa através de uma abstração de provider.

**Motivo:** evitar acoplamento da regra de negócio à API escolhida e facilitar sua substituição.

---

# 37. Próximos artefatos

Após este PRD, recomenda-se produzir:

1. modelo completo do banco Supabase/PostgreSQL;
2. relacionamentos entre tabelas;
3. diagrama da arquitetura;
4. contratos dos endpoints REST;
5. estrutura exata de pastas do NestJS e React;
6. regras de negócio de reserva e estoque;
7. estratégia do QR Code;
8. fluxos de autenticação e autorização;
9. ordem de implementação das features;
10. checklist de desenvolvimento para os 7 dias.

Esses artefatos deverão complementar o PRD e servir como blueprint de implementação do MVP.

---

## Referência

**Desafio Elite Dev 2026 — Plataforma de Eventos e Ingressos**

O PRD foi elaborado com base no documento do desafio fornecido para o projeto, incorporando as decisões de escopo informadas pelo desenvolvedor: fluxo de ingressos em pista, objetivo de documentação e planejamento do MVP, arquitetura monolítica, Clean Code, organização Feature-based e uso de React + Vite, NestJS e Supabase.

# Ticketa

Plataforma de eventos e ingressos desenvolvida como solução do **Desafio Elite Dev 2026**. Organizadores publicam eventos a partir do catálogo Ticketmaster, clientes reservam e pagam ingressos (simulado), e a portaria valida os códigos na entrada.

O enunciado oficial do desafio está versionado em [`docs/Desafio-Elite-Dev-2026.pdf`](docs/Desafio-Elite-Dev-2026.pdf). O PRD detalhado e as decisões arquiteturais estão em [`docs/`](docs/).

O repositório é um monólito modular com `backend/` (API NestJS) e `frontend/` (SPA React) na raiz, ao lado de `docs/`.

## Stack tecnológica

**Backend:** NestJS, Prisma, Supabase (Postgres + Auth), Ticketmaster Discovery API

**Frontend:** React, Vite, Tailwind CSS, React Router, React Hook Form + Zod

**Testes:** Jest (backend), Vitest (frontend)

**Organização do código**

- `backend/src/modules/` — domínios por feature: `auth`, `catalog`, `events`, `reservations`, `tickets`, `gate`, `users`
- `backend/src/shared/` — infraestrutura compartilhada: Prisma, Supabase, guards, decorators
- `frontend/src/features/` — features por papel/fluxo: `auth`, `catalog-browse`, `events`, `reservations`, `tickets`, `gate`
- `frontend/src/shared/` — API client, componentes de layout e estilos globais

## Pré-requisitos

- **Node.js 22 LTS** (ou superior compatível). O projeto não possui `.nvmrc`; o backend usa `@types/node` 22 e o frontend exige Node ≥ 20.19 (Vite 8).
- **pnpm** — gerenciador de pacotes usado em ambos os workspaces.
- **Conta Supabase** — projeto próprio com Postgres e Auth habilitados.
- **API key da Ticketmaster Discovery API** — para busca de eventos no catálogo externo.

## Configuração do backend

1. Clone o repositório e entre na pasta do backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Copie o arquivo de exemplo e preencha as variáveis:

   ```bash
   cp .env.example .env
   ```

   | Variável | Descrição |
   |---|---|
   | `DATABASE_URL` | Connection string do Postgres do Supabase (modo `postgresql://...`) |
   | `SUPABASE_URL` | URL base do projeto Supabase |
   | `SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase Auth |
   | `SUPABASE_SERVICE_ROLE_KEY` | Chave service role do Supabase (operações administrativas no Auth) |
   | `TICKETMASTER_API_KEY` | Chave da Ticketmaster Discovery API |
   | `PORT` | *(opcional)* Porta HTTP da API; padrão `3000` |

4. Aplique as migrations e gere o client Prisma:

   ```bash
   pnpm exec prisma migrate deploy
   pnpm exec prisma generate
   ```

5. Inicie o servidor em modo desenvolvimento:

   ```bash
   pnpm run start:dev
   ```

6. Confirme que a API está respondendo em **http://localhost:3000**.

## Configuração do frontend

1. Em outro terminal, entre na pasta do frontend:

   ```bash
   cd frontend
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Copie o arquivo de exemplo:

   ```bash
   cp .env.example .env
   ```

   | Variável | Descrição |
   |---|---|
   | `VITE_API_URL` | URL base da API Ticketa; padrão `http://localhost:3000` |

4. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm run dev
   ```

5. Acesse **http://localhost:5173** no navegador.

## Dados de teste (seed)

As contas abaixo já existem no banco de produção/demo do projeto. Não há script de seed automatizado — os usuários foram criados manualmente pela própria aplicação.

| Papel | E-mail | Senha |
|---|---|---|
| Organizador | organizador@ticketa.dev | Seed!23456 |
| Cliente 1 | cliente1@ticketa.dev | Seed!23456 |
| Cliente 2 | cliente2@ticketa.dev | Seed!23456 |
| Portaria | portaria@ticketa.dev | Seed!23456 |

Ao logar como **organizador@ticketa.dev**, pelo menos um evento publicado com ingressos disponíveis já estará visível em "Meus Eventos".

## Como testar o site

Certifique-se de que backend e frontend estão rodando localmente (ou use o deploy, quando disponível).

### Como Organizador (`organizador@ticketa.dev`)

1. Faça login em `/login`. Você será redirecionado para **Meus Eventos** (`/organizer/events`).
2. Explore os eventos já publicados com estoque disponível.
3. Crie um evento novo:
   - Clique em criar evento e busque no catálogo Ticketmaster (`/organizer/events/new`).
   - Escolha um item da lista, preencha os campos restantes (capacidade, preço, etc.) e **publique** o evento.
4. No detalhe do evento (`/organizer/events/:id`), **credencie uma portaria** — informe e-mail e senha de uma conta com papel Portaria (por exemplo, `portaria@ticketa.dev` ou uma conta criada para esse fim).

### Como Cliente (`cliente1@ticketa.dev` ou `cliente2@ticketa.dev`)

1. Faça login. Você cairá na listagem pública de **Eventos** (`/events`).
2. Use a busca e o filtro de disponibilidade para encontrar um evento publicado com estoque.
3. Abra o detalhe do evento, escolha a quantidade de ingressos e **reserve**.
4. Na tela de checkout (`/reservations/:id`), simule o pagamento:
   - **Aprovado** — gera o(s) ingresso(s) e confirma a reserva.
   - **Recusado** — mostra o caminho alternativo sem emitir ingresso.
5. Acesse **Meus Ingressos** (`/tickets`):
   - Copie o código do ingresso.
   - Teste o link de compartilhamento (abra em aba anônima; a rota é `/tickets/share/:qrToken`).

### Como Portaria (conta credenciada no passo do organizador, ou `portaria@ticketa.dev` se já vinculada a um evento)

1. Faça login. Você será redirecionado direto para a tela de **Validação** (`/gate/validate`).
2. Cole ou digite o código copiado no passo do cliente e valide — o resultado esperado é **válido**.
3. Valide o **mesmo código novamente** — o resultado esperado é **já utilizado**.

## Testes automatizados

**Backend** (a partir de `backend/`):

```bash
pnpm run test
```

Cobertura focada na lógica crítica de negócio:

- **Reservas** — decremento atômico de estoque e regras de concorrência
- **Eventos** — autorização do organizador dono do evento
- **Portaria** — validação de código, vínculo com o evento correto e bloqueio de uso duplicado

**Frontend** (a partir de `frontend/`):

```bash
pnpm run test
```

Cobertura focada em:

- **Catálogo** — filtro de eventos por busca e disponibilidade
- **Auth** — schemas de formulário e roteamento pós-login por papel
- **Eventos** — validação de schemas de formulário do organizador

Para lint e build, use `pnpm run lint` e `pnpm run build` em cada pasta.

## Deploy

Link da aplicação em produção: **[https://ticketa-tau.vercel.app]**

## Limitações conhecidas e decisões de escopo

- **Cancelamento de reserva com devolução ao estoque** não foi implementado. O status `EXPIRED` existe no schema, mas não há lógica de expiração automática de reservas pendentes.
- **Leitura de QR Code via câmera** não foi implementada. A validação na portaria é feita por digitação ou colagem manual do código, que atende ao requisito mínimo do desafio (câmera com alternativa manual; implementamos a alternativa).
- **Testes automatizados** cobrem lógica crítica de negócio, mas não são full coverage nem incluem testes end-to-end.
- Decisões arquiteturais relevantes estão documentadas como ADRs em [`docs/adr/`](docs/adr/).

## Uso de IA

O desenvolvimento contou com IA em duas frentes:

- **Claude (chat)** — atuou como tech lead/tutor: ajudou a interpretar o PRD, tomar e documentar decisões arquiteturais (registradas nos ADRs), revisar código linha a linha antes de aprovar cada mudança e montar instruções de implementação detalhadas.
- **Cursor** — executou essas instruções, implementando o código seguindo os padrões e decisões já definidos.

Nenhuma implementação foi aceita sem revisão: todo código gerado passou por leitura crítica antes de ser incorporado ao projeto.

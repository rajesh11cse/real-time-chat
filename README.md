# Real-time Chat System (Monorepo)

> NOTE: This README and the initial project scaffold are AI-generated and should be reviewed and adapted before production use.

This monorepo hosts a scalable real-time chat system composed of:

- `backend/user-service` – NestJS GraphQL API for authentication and user management.
- `backend/chat-service` – NestJS GraphQL API for chat rooms, messages, and subscriptions.
- `frontend` – React + Apollo Client SPA for chat UI.

## Requirements

- Node.js 20+
- Docker Desktop (for `docker compose`)

## Services & endpoints (via nginx)

- **Frontend**: `http://localhost/`
- **User GraphQL**: `http://localhost/api/user/graphql`
- **Chat GraphQL**: `http://localhost/api/chat/graphql` (also WebSocket for subscriptions)

## Local dev (recommended)

1) Install dependencies:

```bash
npm install
```

2) Build everything:

```bash
npm run build
```

## Run with Docker

Start the stack (builds images as needed):

```bash
docker compose up --build
```

Stop the stack:

```bash
docker compose down
```

## E2E test

With the stack running via nginx on localhost:

```bash
npm run test:e2e
```

## Environment variables

See `.env.example` for the full set. Key ones:

- `JWT_SECRET`
- `USER_DB_URL`
- `CHAT_DB_URL`
- `REDIS_HOST`, `REDIS_PORT`


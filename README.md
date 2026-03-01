# Real-time Chat System

A scalable real-time chat application built as a monorepo. Users can register, log in, create or join rooms, and exchange messages **live** (no page refresh). The system runs with **multiple backend instances** and uses **Redis** so real-time delivery works across instances.

---

## Table of contents

1. [How to build and run](#1-how-to-build-and-run)
2. [Project structure](#2-project-structure)
3. [Architecture: why and how services work](#3-architecture-why-and-how-services-work)
4. [Services in detail](#4-services-in-detail)
5. [Flows and examples](#5-flows-and-examples)
6. [Configuration](#6-configuration)
7. [Testing](#7-testing)
8. [Trade-offs and limitations](#8-trade-offs-and-limitations)

---

## 1. How to build and run

### Prerequisites

- **Node.js 20+** (for local build/run)
- **Docker Desktop** (for running the full stack with `docker compose`)

### Option A: Run everything with Docker (recommended)

From the **repository root**:

**Step 1 – Install dependencies (optional; only if you build locally later)**

```bash
npm install
```

**Step 2 – Start the full stack**

```bash
docker compose up --build -d
```

This builds all images (user-service, chat-service, frontend) and starts:

- Two PostgreSQL databases (user, chat)
- Redis
- Two user-service instances
- Two chat-service instances
- Frontend (static app served on port 3000 inside the network)
- Nginx on port 80 (reverse proxy and load balancer)

**Step 3 – Open the app**

- **App (UI):** [http://localhost/](http://localhost/)
- **User GraphQL:** [http://localhost/api/user/graphql](http://localhost/api/user/graphql)
- **Chat GraphQL (HTTP + WebSocket):** [http://localhost/api/chat/graphql](http://localhost/api/chat/graphql)

**Step 4 – Stop the stack**

```bash
docker compose down
```

### Option B: Build and run locally (without Docker for app code)

**Step 1 – Install dependencies**

```bash
npm install
```

**Step 2 – Build all packages**

```bash
npm run build
```

**Step 3 – Start infrastructure only with Docker (Postgres + Redis)**

```bash
docker compose up -d postgres-user postgres-chat redis
```

**Step 4 – Run backends and frontend locally**

In separate terminals from the repo root:

```bash
npm run start:user    # User service on port 4001
npm run start:chat    # Chat service on port 4002
npm run start:frontend # Vite dev server (e.g. port 5173)
```

Set env vars for the backends (or use a `.env` file) as in [Configuration](#6-configuration). For the frontend to talk to the backends when not using nginx, point it at `http://localhost:4001/graphql` and `http://localhost:4002/graphql` (see frontend env in config).

### Rebuild only the frontend (Docker)

If you changed only the frontend:

```bash
docker compose build frontend
docker compose up -d frontend
```

---

## 2. Project structure

```
real-time-chat/
├── backend/
│   ├── user-service/     # Auth & user management (NestJS, GraphQL)
│   │   ├── src/
│   │   ├── db/init.sql
│   │   ├── Dockerfile
│   │   └── package.json
│   └── chat-service/    # Rooms, messages, real-time subscriptions (NestJS, GraphQL)
│       ├── src/
│       ├── db/init.sql
│       ├── Dockerfile
│       └── package.json
├── frontend/            # React + Apollo Client (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── apollo/
│   │   ├── graphql/
│   │   └── index.css
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # All services and networks
├── nginx.conf           # Reverse proxy, load balancing, WebSocket
├── package.json         # Root workspace (build scripts)
└── README.md
```

- **Monorepo:** One repo, multiple packages (`backend/user-service`, `backend/chat-service`, `frontend`). Root `package.json` uses npm workspaces; `npm run build` builds all of them.

---

## 3. Architecture: why and how services work

### Why multiple services?

- **User service** – Handles identity (register, login) and issues JWTs. Keeps user data separate from chat data and allows scaling/auth changes independently.
- **Chat service** – Handles rooms, members, messages, and **real-time subscriptions**. Uses its own database and Redis so chat can scale and stay decoupled from auth.
- **Frontend** – Single React app that talks to both backends via GraphQL (user for auth, chat for rooms and messages).
- **Nginx** – Single entry point (port 80). Routes `/` to the frontend, `/api/user/graphql` to user-service, `/api/chat/graphql` to chat-service. Also load-balances and proxies WebSocket for subscriptions.

### Why two instances per backend?

The app is designed to run **2+ instances** of user-service and chat-service (as in `docker-compose`). Nginx distributes requests across them so that:

- One instance failing does not take down the whole API.
- Traffic is spread for better throughput.

For **chat**, real-time must work even when User A hits one instance and User B another. That is solved with **Redis Pub/Sub**: when one instance saves a message, it publishes an event to Redis; every chat instance (including the one holding User B’s WebSocket) receives it and pushes the message to the right subscriber.

### How real-time works (no polling)

1. User opens a room → frontend opens a **WebSocket** to `/api/chat/graphql` and sends a GraphQL **subscription** (`messageAdded(roomId)`).
2. The chat instance that handles that WebSocket subscribes to Redis for new messages in that room.
3. When someone (same or another user) sends a message, the instance that handles the **mutation** saves it to Postgres and **publishes** to Redis.
4. All chat instances (including the one with the WebSocket) receive the event from Redis and push it to clients that subscribed to that `roomId`.
5. The frontend receives the event over the WebSocket and appends the message to the list. No polling.

---

## 4. Services in detail

### 4.1 User service (`backend/user-service`)

- **Role:** Register users, log in, issue JWT tokens. All chat requests (and the frontend) use this JWT to identify the user.
- **Stack:** NestJS, GraphQL (Apollo), TypeORM, PostgreSQL, Passport JWT, bcrypt.
- **DB:** `userdb` (Postgres). Schema in `db/init.sql` (e.g. `users` with `username`, `display_name`, `password_hash`).
- **Endpoints (via nginx):** `POST http://localhost/api/user/graphql` with GraphQL body (e.g. `mutation { login(input: {...}) { accessToken user { id username displayName } } }`).
- **Instances:** Two (user-service-1, user-service-2). Nginx round-robins between them. No shared state except the DB.

### 4.2 Chat service (`backend/chat-service`)

- **Role:** Rooms (create, list), join room, send message, **subscribe to new messages** in a room. Persists rooms and messages; real-time via GraphQL subscriptions over WebSocket.
- **Stack:** NestJS, GraphQL (Apollo), TypeORM, PostgreSQL, Redis (graphql-redis-subscriptions), graphql-ws, JWT validation (same secret as user-service).
- **DB:** `chatdb` (Postgres). Schema in `db/init.sql` (e.g. `rooms`, `room_members`, `messages`).
- **Redis:** Used as Pub/Sub. When a message is created, the service publishes to a topic; every chat instance subscribes, so every instance can push to its connected WebSocket clients.
- **Endpoints:**
  - **HTTP:** `POST http://localhost/api/chat/graphql` for queries and mutations (e.g. `createRoom`, `joinRoom`, `sendMessage`, `messages`).
  - **WebSocket:** Same path `ws://localhost/api/chat/graphql` for subscriptions (e.g. `messageAdded(roomId)`). Nginx upgrades the connection and uses long timeouts.
- **Instances:** Two (chat-service-1, chat-service-2). Nginx uses **ip_hash** for chat so a given client’s HTTP and WebSocket tend to hit the same instance; Redis ensures the other instance still gets new messages and can deliver to its clients.

### 4.3 Frontend (`frontend`)

- **Role:** UI for login/register, room selection, and chat. Calls user-service for auth and chat-service for rooms and messages; uses **subscriptions** for live messages.
- **Stack:** React, Vite, Apollo Client, GraphQL. Two Apollo clients: one for user (auth only), one for chat (queries, mutations, **subscriptions**). Chat client uses a **split link**: subscription operations go over WebSocket, the rest over HTTP.
- **Build:** `npm run build` produces static files (e.g. `dist/`). In Docker, the frontend container serves them (e.g. with `serve`). Nginx serves the app at `/`.

### 4.4 Nginx

- **Role:** Reverse proxy and load balancer. Single entry at port 80.
- **Routes:**
  - `/` → frontend container (e.g. port 3000).
  - `/api/user/graphql` → user-service upstream (4001), round-robin.
  - `/api/chat/graphql` → chat-service upstream (4002), **ip_hash**; **WebSocket** upgrade and long timeouts so subscriptions stay open.
- **File:** `nginx.conf` in the repo root, mounted into the nginx container.

### 4.5 PostgreSQL (postgres-user, postgres-chat)

- **postgres-user:** Database `userdb` for user-service. Initialized with `backend/user-service/db/init.sql`.
- **postgres-chat:** Database `chatdb` for chat-service. Initialized with `backend/chat-service/db/init.sql`.
- **Ports:** 5433 (user) and 5434 (chat) on the host for debugging; services inside Docker use default 5432.

### 4.6 Redis

- **Role:** Pub/Sub for chat. Chat instances publish “new message” events and subscribe to the same topic so all instances can push to their WebSocket clients.
- **Port:** 6379 (host and container).

---

## 5. Flows and examples

### 5.1 User registers and logs in

1. User opens [http://localhost/](http://localhost/). Frontend shows login/register form.
2. User clicks “Need an account? Register”, fills username, display name, password, submits.
3. Frontend sends GraphQL **mutation** to **user-service** at `/api/user/graphql`:

   ```graphql
   mutation Register($input: RegisterInput!) {
     register(input: $input) {
       accessToken
       user { id username displayName }
     }
   }
   ```

4. User-service creates the user, returns JWT and user. Frontend stores the token (e.g. in `localStorage` as `chat_jwt`) and shows the room selector.

**Login** is the same idea with a `login` mutation and `LoginInput` (username, password).

### 5.2 User creates or joins a room

1. From the room selector, user either:
   - Creates a room (e.g. name “General”) → frontend sends `createRoom(name)` to **chat-service**; then joins that room implicitly, or
   - Joins by room ID → frontend sends `joinRoom(roomId)` to chat-service.
2. Both flows require the **JWT** in the `Authorization` header. Chat-service validates the JWT (same secret as user-service) and knows the user id.
3. Frontend then navigates to the chat view for that room (room id + name).

### 5.3 User sends a message and others see it in real time

1. **Send message:** User types and clicks Send. Frontend sends **mutation** to chat-service:

   ```graphql
   mutation SendMessage($roomId: ID!, $content: String!) {
     sendMessage(roomId: $roomId, content: $content) {
       id roomId senderId content createdAt
     }
   }
   ```

2. Chat-service (one of the two instances) saves the message in Postgres and **publishes** to Redis: topic `MESSAGE_ADDED_TOPIC`, payload `{ messageAdded: message, roomId }`.
3. **Subscription:** The other user (and the sender) already have an active **subscription** on the same room:

   ```graphql
   subscription MessageAdded($roomId: ID!) {
     messageAdded(roomId: $roomId) {
       id roomId senderId content createdAt
     }
   }
   ```

   Their frontend opened a **WebSocket** to `/api/chat/graphql` and sent this subscription. The chat instance that holds that WebSocket is subscribed to Redis. When the message is published, that instance (or the same one if sender and receiver share it) gets the event from Redis, runs the subscription filter by `roomId`, and pushes the new message to the client.
4. Frontend receives the subscription payload and appends the message to the list → **no refresh, real-time**.

**Meaning of “real-time” here:** The message is delivered over the existing WebSocket as soon as it is published (same or different chat instance via Redis). There is no polling.

---

## 6. Configuration

### Environment variables

| Service        | Variable       | Meaning / example |
|----------------|----------------|-------------------|
| user-service   | `PORT`         | HTTP port, e.g. `4001`. |
| user-service   | `USER_DB_URL`  | Postgres URL for user DB, e.g. `postgres://user:userpass@postgres-user:5432/userdb`. |
| user-service   | `JWT_SECRET`   | Secret to sign JWTs. **Must match** chat-service. |
| chat-service   | `PORT`         | HTTP port, e.g. `4002`. |
| chat-service   | `CHAT_DB_URL`  | Postgres URL for chat DB, e.g. `postgres://chat:chatpass@postgres-chat:5432/chatdb`. |
| chat-service   | `JWT_SECRET`   | Same value as user-service (to validate tokens). |
| chat-service   | `REDIS_HOST`  | Redis host, e.g. `redis`. |
| chat-service   | `REDIS_PORT`  | Redis port, e.g. `6379`. |
| frontend (build) | `VITE_USER_GRAPHQL_HTTP` | User GraphQL path, e.g. `/api/user/graphql`. |
| frontend (build) | `VITE_CHAT_GRAPHQL_HTTP` | Chat GraphQL path, e.g. `/api/chat/graphql`. |

In `docker-compose.yml` these are set so that services reach each other by Docker service name (e.g. `postgres-user`, `redis`). For local runs (no Docker for app), use `localhost` and host ports (e.g. 5433, 5434, 6379) in the URLs.

### Changing databases or Redis

- **Postgres (user):** Change `POSTGRES_*` in the `postgres-user` service and set `USER_DB_URL` in user-service to the same credentials and host/port.
- **Postgres (chat):** Same for `postgres-chat` and `CHAT_DB_URL` in chat-service.
- **Redis:** Change `REDIS_HOST` / `REDIS_PORT` in chat-service if you use another host/port.

---

## 7. Testing

- **E2E (with stack running):** From repo root, with the app and nginx running on localhost (e.g. `docker compose up -d`):

  ```bash
  npm run test:e2e
  ```

  This runs the configured end-to-end tests (e.g. sending and receiving a message).

- **Unit / integration:** Add tests under each package (e.g. `backend/user-service/src/**/*.spec.ts`, `backend/chat-service/src/**/*.spec.ts`) and run with the NestJS test runner or your chosen test script.

---

## 8. Trade-offs and limitations

- **Auth on WebSocket:** The chat subscription does not require auth in this setup so that both clients reliably get 101 and receive events. Mutations (e.g. send message) and queries (e.g. messages, join room) remain protected by JWT. For stricter security, subscription auth can be re-enabled once WebSocket context (e.g. `connectionParams`) is correctly passed and validated.
- **Sticky sessions:** Chat uses **ip_hash** in nginx so a client tends to hit the same chat instance. This helps subscription consistency; Redis still ensures messages are delivered even when sender and receiver are on different instances.
- **Scaling:** Adding more than two instances is supported: add more containers in `docker-compose` and list them in the nginx upstreams. Same Redis and DB are shared.
- **Production:** This README and default config are for local/development. For production, use strong `JWT_SECRET`, HTTPS, proper DB backups, and restrict Redis/DB access.

---

## Summary

| Step | Command / action |
|------|------------------|
| 1. Start stack | `docker compose up --build -d` |
| 2. Open app | [http://localhost/](http://localhost/) |
| 3. Register / log in | Use the form (user-service) |
| 4. Create or join room | Use room selector (chat-service) |
| 5. Chat in real time | Send messages; other users in the same room see them live via WebSocket subscription. |

All services are described above with their role, how they interact, and how to configure them. The system is designed so that **real-time chat works with multiple backend instances** using Redis Pub/Sub and a single frontend and nginx entry point.

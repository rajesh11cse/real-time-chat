# AI-generated Dockerfile for chat-service (NestJS + GraphQL Subscriptions)
# Build context must be repo root so tsconfig.base.json is available
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy base tsconfig so "extends": "../../tsconfig.base.json" resolves
COPY tsconfig.base.json ./
COPY backend/chat-service/package*.json ./backend/chat-service/
COPY backend/chat-service/tsconfig.json ./backend/chat-service/
COPY backend/chat-service/nest-cli.json ./backend/chat-service/

WORKDIR /usr/src/app/backend/chat-service
RUN npm install --only=production && npm install --save-dev typescript @nestjs/cli

COPY backend/chat-service/src ./src

RUN npx nest build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/backend/chat-service/dist ./dist
COPY --from=build /usr/src/app/backend/chat-service/package*.json ./
RUN npm install --only=production

EXPOSE 4002

CMD ["node", "dist/main.js"]


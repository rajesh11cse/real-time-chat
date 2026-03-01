# AI-generated Dockerfile for user-service (NestJS + GraphQL)
# Build context must be repo root so tsconfig.base.json is available
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy base tsconfig so "extends": "../../tsconfig.base.json" resolves
COPY tsconfig.base.json ./
COPY backend/user-service/package*.json ./backend/user-service/
COPY backend/user-service/tsconfig.json ./backend/user-service/
COPY backend/user-service/nest-cli.json ./backend/user-service/

WORKDIR /usr/src/app/backend/user-service
RUN npm install --only=production && npm install --save-dev typescript @nestjs/cli

COPY backend/user-service/src ./src

RUN npx nest build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/backend/user-service/dist ./dist
COPY --from=build /usr/src/app/backend/user-service/package*.json ./
RUN npm install --only=production

EXPOSE 4001

CMD ["node", "dist/main.js"]


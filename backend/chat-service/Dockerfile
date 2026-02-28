# AI-generated Dockerfile for chat-service (NestJS + GraphQL Subscriptions)
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production && npm install --save-dev typescript @nestjs/cli

COPY tsconfig.json nest-cli.json ./
COPY src ./src

RUN npx nest build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm install --only=production

EXPOSE 4002

CMD ["node", "dist/main.js"]


# AI-generated Dockerfile for React + Vite frontend
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Speed up install; show progress (first run can take 2-5 min)
ENV npm_config_audit=false
ENV npm_config_fund=false
COPY package*.json ./
RUN npm install --prefer-offline --no-audit --no-fund

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm install --only=production --no-audit --no-fund

EXPOSE 3000

# Serve static build (vite is dev-only; use serve in production)
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]


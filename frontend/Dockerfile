# AI-generated Dockerfile for React + Vite frontend
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json vite.config.ts ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json vite.config.ts ./
RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]


# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.19.0

# Base stage with shared configurations
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
RUN corepack enable pnpm

# Development dependencies stage
FROM base AS deps

RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 && \
  rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build stage
FROM deps AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run build

# Production stage
FROM base AS runner
WORKDIR /app

ARG LOG_LEVEL
ARG WEBHOOK_PROXY_URL
ARG APP_ID
ARG WEBHOOK_SECRET
ARG PRIVATE_KEY
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG PERSPECTIVE_API_KEY
ARG GROQ_API_KEY
ARG MONGODB_URI
ARG PORT

ENV NODE_ENV=production \
  LOG_LEVEL=${LOG_LEVEL:-debug} \
  WEBHOOK_PROXY_URL=${WEBHOOK_PROXY_URL} \
  APP_ID=${APP_ID} \
  WEBHOOK_SECRET=${WEBHOOK_SECRET} \
  PRIVATE_KEY=${PRIVATE_KEY} \
  GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID} \
  GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET} \
  PERSPECTIVE_API_KEY=${PERSPECTIVE_API_KEY} \
  GROQ_API_KEY=${GROQ_API_KEY} \
  MONGODB_URI=${MONGODB_URI} \
  PORT=${PORT:-4000}

# Copy only necessary files from build stage
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4000

CMD ["pnpm", "exec", "probot", "run", "./dist/index.cjs"]

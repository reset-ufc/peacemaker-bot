# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.19.0

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
ARG APP_ID
ARG PORT

ENV NODE_ENV=production \
  LOG_LEVEL=${LOG_LEVEL:-debug} \
  APP_ID=${APP_ID} \
  PORT=${PORT:-4000} \
  HOST=0.0.0.0

# Copy only necessary files from build stage
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4000

CMD ["pnpm", "exec", "probot", "run", "./dist/index.cjs"]

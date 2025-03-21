# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.1

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

RUN pnpm install

# Build stage
FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm run build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy build output from build stage
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 4000

CMD ["pnpm", "run", "start"]
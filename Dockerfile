# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.1

# Base stage with shared configurations
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Production stage
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system appuser --ingroup appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000
CMD ["npm", "start"]
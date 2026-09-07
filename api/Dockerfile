# ─── Stage 1: Builder ───────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer cache)
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install all deps (including devDeps for build)
RUN npm install --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

# Build NestJS
RUN npm run build

# ─── Stage 2: Runner ────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy built output and Prisma client + CLI
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Non-root user for security
RUN addgroup -S tokogroup && adduser -S tokouser -G tokogroup

# Buat folder upload dan beri kepemilikan ke tokouser
# Harus dilakukan SETELAH user dibuat agar chown valid
RUN mkdir -p upload/photo upload/document upload/other upload/report \
    && chown -R tokouser:tokogroup /app

USER tokouser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/v1/health || exit 1

# Apply any pending migrations before starting the server. `migrate deploy`
# only applies migrations already committed under prisma/migrations — it
# never generates new ones from a schema diff — and is idempotent (skips
# migrations already recorded as applied), so it's safe to run on every
# boot/restart (Railway, docker-compose, etc).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

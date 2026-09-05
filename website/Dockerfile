# ─── Stage 1: Builder ───────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ─── Stage 2: Runner ────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S tokogroup && adduser -S tokouser -G tokogroup

# Next.js "standalone" output already contains only the files needed at runtime
COPY --from=builder --chown=tokouser:tokogroup /app/.next/standalone ./
COPY --from=builder --chown=tokouser:tokogroup /app/.next/static ./.next/static
COPY --from=builder --chown=tokouser:tokogroup /app/public ./public

USER tokouser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]

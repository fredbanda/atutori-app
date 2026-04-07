FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ── deps ──────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── builder ───────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy env vars to satisfy module-level validation during build
ENV BETTER_AUTH_SECRET=build-placeholder \
    BETTER_AUTH_URL=http://localhost:3000 \
    DATABASE_URL=postgresql://placeholder \
    DATABASE_URL_UNPOOLED=postgresql://placeholder \
    REDIS_URL=redis://placeholder \
    KV_REST_API_URL=https://placeholder \
    KV_REST_API_TOKEN=placeholder \
    NEXT_PUBLIC_APP_URL=http://localhost:3000

RUN pnpm prisma generate
RUN pnpm build

# ── runner ────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

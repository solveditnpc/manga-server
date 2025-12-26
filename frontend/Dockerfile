# ---------- Base ----------
FROM node:24.11-slim AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---------- Runtime ----------
FROM node:24.11-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd -r nextjs \
 && useradd -r -g nextjs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

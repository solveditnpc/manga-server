# ---------- Base ----------
FROM node:24.11-slim AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Prisma Infra Base ----------
FROM base AS prisma-cli
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json ./

RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate

# ---------- Migrate ----------
FROM prisma-cli AS users-db-migrate
CMD ["npx", "prisma", "migrate", "deploy"]

# ---------- ADD ADMIN ----------
FROM prisma-cli AS users-admin-seed

CMD ["npx", "prisma", "db", "seed"]
# ---------- Build ----------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma Client
RUN npx prisma generate

COPY . .

# Build Next.js
RUN pnpm build

# ---------- Runtime ----------
FROM node:24.11-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd -r nextjs 
RUN useradd -r -g nextjs nextjs  

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir /database
RUN chown -R nextjs:nextjs /database 

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "chown -R 1000:1000 /database && exec node server.js"]
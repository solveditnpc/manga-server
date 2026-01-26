# ---------- Base ----------
FROM node:24.11-slim AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Migrate ----------
FROM base AS migrate-db
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json ./

RUN apt-get update -y && apt-get install -y openssl

CMD ["npx", "prisma", "migrate", "deploy"]

# ---------- Build ----------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

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
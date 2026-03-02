# ---- Base ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN NODE_OPTIONS="--max-old-space-size=2048" npm install --legacy-peer-deps --ignore-scripts && npm cache clean --force

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (override with --build-arg or docker-compose)
ARG NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3003
ARG NEXT_PUBLIC_DEFAULT_LANGUAGE=en
ARG NEXT_PUBLIC_ENABLE_MULTI_LANG=false
ARG NEXT_PUBLIC_AVAILABLE_LANGUAGES=en
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ARG NEXT_PUBLIC_GOOGLE_MAP_API_KEY=
ARG NEXT_PUBLIC_VERSION=6.8.0
ARG REVALIDATE_DURATION=120

ENV NEXT_PUBLIC_REST_API_ENDPOINT=$NEXT_PUBLIC_REST_API_ENDPOINT
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_DEFAULT_LANGUAGE=$NEXT_PUBLIC_DEFAULT_LANGUAGE
ENV NEXT_PUBLIC_ENABLE_MULTI_LANG=$NEXT_PUBLIC_ENABLE_MULTI_LANG
ENV NEXT_PUBLIC_AVAILABLE_LANGUAGES=$NEXT_PUBLIC_AVAILABLE_LANGUAGES
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GOOGLE_MAP_API_KEY=$NEXT_PUBLIC_GOOGLE_MAP_API_KEY
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION
ENV REVALIDATE_DURATION=$REVALIDATE_DURATION

# Disable Next.js telemetry during build, limit memory
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN npm run build

# ---- Production ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output + static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy i18n config needed at runtime
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

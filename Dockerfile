# ─── Build Stage ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build args become env vars at build time (NEXT_PUBLIC_* are baked in)
ARG NEXT_PUBLIC_REST_API_ENDPOINT
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_DEFAULT_LANGUAGE=en
ARG NEXT_PUBLIC_ENABLE_MULTI_LANG=false
ARG NEXT_PUBLIC_AVAILABLE_LANGUAGES=en
ARG NEXT_PUBLIC_USE_FIXPARTS=true
ARG NEXT_PUBLIC_FIXPARTS_API_URL

ENV NEXT_PUBLIC_REST_API_ENDPOINT=$NEXT_PUBLIC_REST_API_ENDPOINT
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_DEFAULT_LANGUAGE=$NEXT_PUBLIC_DEFAULT_LANGUAGE
ENV NEXT_PUBLIC_ENABLE_MULTI_LANG=$NEXT_PUBLIC_ENABLE_MULTI_LANG
ENV NEXT_PUBLIC_AVAILABLE_LANGUAGES=$NEXT_PUBLIC_AVAILABLE_LANGUAGES
ENV NEXT_PUBLIC_USE_FIXPARTS=$NEXT_PUBLIC_USE_FIXPARTS
ENV NEXT_PUBLIC_FIXPARTS_API_URL=$NEXT_PUBLIC_FIXPARTS_API_URL

RUN npm run build

# ─── Production Stage ─────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what Next.js needs to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

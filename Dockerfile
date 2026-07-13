# Production multi-stage image
# Build:  docker build -t perternakan:prod .
# Run:    see docker-compose.prod.yml

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public env (optional; override with --build-arg)
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Next needs these present at build for some Payload/Next paths; real secrets come at runtime
ARG PAYLOAD_SECRET=build-time-placeholder-min-32-characters
ARG DATABASE_URI=postgresql://postgres:postgres@localhost:5432/perternakan
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV DATABASE_URI=$DATABASE_URI

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Prefer Next standalone output when available
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/payload.config.ts ./payload.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/app ./app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Media uploads persist outside the container when a volume is mounted here
RUN mkdir -p /app/media && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Production: serve optimized build (schema via migrations / push=false)
CMD ["npm", "run", "start"]

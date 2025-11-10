# Use Node.js 20 alpine as base image
FROM node:20-alpine AS deps
# Install dependencies only when needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json ./
# Always use npm for Docker builds to avoid lockfile issues
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Install TypeScript for building with next.config.ts
RUN npm install typescript @types/node --no-save

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Install curl for health check
RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./server
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create .next directory and set permissions
RUN mkdir -p .next && chown nextjs:nodejs .next

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Add health check with proper error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server/server.js"]
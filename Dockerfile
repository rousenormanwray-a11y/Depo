# ChainGive Backend - Railway Dockerfile (Root Level)
# Build from repository root for Railway deployment

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from backend subdirectory
COPY chaingive-backend/package*.json ./
COPY chaingive-backend/package-lock.json ./
COPY chaingive-backend/prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy all backend source code
COPY chaingive-backend/ .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY chaingive-backend/package*.json ./
COPY chaingive-backend/package-lock.json ./
COPY chaingive-backend/prisma ./prisma/

RUN npm ci --omit=dev && \
    npx prisma generate && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]

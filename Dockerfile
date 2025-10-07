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

# Expose port (Railway provides PORT env variable)
EXPOSE ${PORT:-8080}

# No HEALTHCHECK in Dockerfile - Railway manages health checks via railway.json

# Start the application
CMD ["node", "dist/server.js"]

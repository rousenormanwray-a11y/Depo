# ChainGive Backend - Simple Dockerfile
# Build context: chaingive-backend directory

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run migrations and start server
CMD npx prisma migrate deploy && node dist/server.js

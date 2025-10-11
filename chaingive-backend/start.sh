#!/bin/bash
# ChainGive Backend Start Script for Railway

set -e

echo "🚀 Starting ChainGive Backend..."

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Start the application
echo "✅ Starting server..."
exec node dist/server.js

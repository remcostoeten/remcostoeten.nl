#!/bin/bash

# Vercel deployment script using bun
set -e

echo "🚀 Starting Vercel deployment with bun..."

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
  echo "❌ Error: vercel.json not found. Please run from the project root."
  exit 1
fi

# Check if bun is installed
if ! command -v bun &> /dev/null; then
  echo "❌ Error: bun is not installed. Please install bun first."
  exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
bun run clean

# Install dependencies
echo "📦 Installing dependencies with bun..."
bun install --frozen-lockfile

# Build the frontend
echo "🏗️ Building frontend with bun..."
bun run build:frontend

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
if [ "$1" == "--production" ] || [ "$1" == "-p" ]; then
  npx vercel --prod
else
  npx vercel
fi

echo "✅ Deployment complete!"
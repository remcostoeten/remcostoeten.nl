#!/bin/bash

# Full deployment script for both frontend and backend
set -e

echo "🚀 Starting full deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run from the project root."
  exit 1
fi

# Parse arguments
PRODUCTION=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --production|-p)
      PRODUCTION=true
      shift
      ;;
    --backend-only|-b)
      BACKEND_ONLY=true
      shift
      ;;
    --frontend-only|-f)
      FRONTEND_ONLY=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --production, -p    Deploy to production (default: preview)"
      echo "  --backend-only, -b  Deploy only backend"
      echo "  --frontend-only, -f Deploy only frontend"
      echo "  --help, -h          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Function to deploy backend
deploy_backend() {
  echo "🔧 Deploying backend..."
  cd apps/fastapi.backend.remcostoeten.nl

  if [ -f "./scripts/deploy.sh" ]; then
    ./scripts/deploy.sh
    echo "✅ Backend deployment completed"
  else
    echo "❌ Backend deploy script not found. Skipping backend deployment."
  fi

  cd ../..
}

# Function to deploy frontend
deploy_frontend() {
  echo "🎨 Deploying frontend..."

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
  if [ "$PRODUCTION" = true ]; then
    npx vercel --prod
  else
    npx vercel
  fi

  echo "✅ Frontend deployment completed"
}

# Main deployment logic
if [ "$BACKEND_ONLY" = true ]; then
  deploy_backend
elif [ "$FRONTEND_ONLY" = true ]; then
  deploy_frontend
else
  echo "🔄 Deploying both frontend and backend..."

  # Deploy backend first (in background)
  deploy_backend &
  BACKEND_PID=$!

  # Deploy frontend
  deploy_frontend &
  FRONTEND_PID=$!

  # Wait for both deployments to complete
  wait $BACKEND_PID
  echo "✅ Backend deployment finished"

  wait $FRONTEND_PID
  echo "✅ Frontend deployment finished"
fi

echo "🎉 Full deployment completed successfully!"

if [ "$PRODUCTION" = true ]; then
  echo "🌐 Your sites are live in production!"
else
  echo "🌐 Your preview sites are ready!"
fi
#!/bin/bash

# Development setup script
echo "🚀 Setting up development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Generate database
echo "🗄️ Setting up database..."
npm run gen

# Seed database (optional)
echo "🌱 Seeding database..."
npm run seed:home

echo "✅ Development setup complete!"
echo "Run 'npm run dev' to start the development server"

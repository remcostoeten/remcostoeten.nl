#!/bin/bash

# Quick deployment script for Vercel
echo "🚀 Starting deployment process..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    echo "git branch -M main"
    echo "git remote add origin YOUR_GITHUB_REPO_URL"
    echo "git push -u origin main"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Ensure all changes are committed
echo "📝 Checking git status..."
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    git status --short
    exit 1
fi

# Push to master branch
echo "📤 Pushing to master branch..."
git push origin master

# Test production database connection
echo "🗄️  Testing production database connection..."
if DATABASE_URL=$(grep '^DATABASE_URL=' .env.production 2>/dev/null | cut -d '=' -f2- | tr -d '"'); then
    export DATABASE_URL
    npm run deploy:setup-db
else
    echo "⚠️  No .env.production found, skipping database test"
fi

# Push database schema if needed
echo "📊 Pushing database schema..."
npm run db:push

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. ✅ Database is ready (Neon)"
echo "2. Add environment variables in Vercel dashboard from .env.production"
echo "3. Test your API: https://your-project.vercel.app/api/health"
echo "4. Update CORS with your frontend URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

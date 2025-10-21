#!/bin/bash

# Simple cleanup script for analytics before merge/push
# Removes localhost/development views from production data

echo "🧹 Cleaning up analytics data..."

# Go to backend directory
cd apps/fastapi.backend.remcostoeten.nl

if [ -f "scripts/analytics_manager.py" ]; then
    echo "📊 Running analytics cleanup..."
    python scripts/analytics_manager.py interactive
else
    echo "⚠️ Analytics manager not found - skipping cleanup"
fi

cd - > /dev/null

echo "✅ Cleanup complete!"
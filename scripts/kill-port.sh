#!/bin/bash

# Script to kill processes using specific ports
# Usage: ./scripts/kill-port.sh [port]

if [ $# -eq 0 ]; then
    echo "Usage: $0 [port_number]"
    echo "Example: $0 3334"
    exit 1
fi

PORT=$1

echo "🔍 Checking for processes using port $PORT..."

# Find processes using the port
PIDS=$(lsof -ti :$PORT)

if [ -z "$PIDS" ]; then
    echo "✅ Port $PORT is free!"
    exit 0
fi

echo "⚠️  Found processes using port $PORT:"
lsof -i :$PORT

echo ""
echo "🔥 Killing processes..."

for PID in $PIDS; do
    echo "Killing process $PID..."
    kill $PID 2>/dev/null && echo "✅ Killed $PID" || echo "❌ Failed to kill $PID"
done

echo "✅ Done!"

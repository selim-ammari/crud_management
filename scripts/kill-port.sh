#!/bin/bash
# Script to kill processes running on a specific port

PORT=${1:-5000}

echo "Checking for processes on port $PORT..."

PIDS=$(lsof -ti:$PORT)

if [ -z "$PIDS" ]; then
  echo "No processes found on port $PORT"
  exit 0
fi

echo "Found processes: $PIDS"
echo "Killing processes on port $PORT..."

for PID in $PIDS; do
  kill -9 $PID 2>/dev/null && echo "Killed process $PID" || echo "Failed to kill process $PID"
done

sleep 1

# Verify
REMAINING=$(lsof -ti:$PORT)
if [ -z "$REMAINING" ]; then
  echo "✅ Port $PORT is now free"
else
  echo "⚠️  Some processes may still be running: $REMAINING"
fi


#!/bin/bash

# Polar's Shack Proxy Server Startup Script

echo "🚀 Starting Polar's Shack Proxy Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory
mkdir -p logs

# Set environment variables
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3001}

echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"

# Start the server
if [ "$NODE_ENV" = "development" ]; then
    echo "🔧 Starting in development mode with nodemon..."
    npm run dev
else
    echo "🏭 Starting in production mode..."
    npm start
fi

#!/bin/bash

# Vercel Deployment Script for ham-exam
set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting Vercel deployment for ham-exam..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Login to Vercel (uncomment if needed)
# vercel login

# Pull current project configuration if this is a linked project
if [ -f ".vercel/project.json" ]; then
    echo "🔄 Pulling project settings..."
    vercel pull --yes
fi

# Build the project
echo "🏗️ Building the project..."
npm run build

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
if [ "$1" = "--prod" ] || [ "$1" = "-p" ]; then
    echo "🌍 Deploying to production..."
    vercel --prod --token=$VERCEL_TOKEN
else
    echo "🧪 Deploying to preview/staging..."
    vercel --token=$VERCEL_TOKEN
fi

echo "✅ Deployment completed successfully!"
echo "🎉 Your ham-exam application is now deployed."
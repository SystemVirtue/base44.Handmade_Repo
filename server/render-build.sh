#!/bin/bash
set -e

echo "🔧 Starting DJAMMS Backend Build Process..."

echo "📦 Installing yt-dlp..."
pip3 install --user yt-dlp

echo "🔍 Verifying yt-dlp installation..."
yt-dlp --version

echo "📦 Installing Node.js dependencies..."
npm ci --only=production

echo "✅ Build complete!"

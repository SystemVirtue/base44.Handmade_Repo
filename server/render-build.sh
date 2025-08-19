#!/bin/bash
set -e

echo "🔧 Starting DJAMMS Backend Build Process..."

echo "📦 Installing Node.js dependencies..."
npm ci --only=production

echo "📦 Installing yt-dlp..."
python3 -m pip install yt-dlp --break-system-packages

echo "🔍 Verifying yt-dlp installation..."
yt-dlp --version

echo "✅ Build complete!"

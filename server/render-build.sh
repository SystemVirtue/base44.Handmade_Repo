#!/bin/bash
set -e

echo "🔧 Starting DJAMMS Backend Build Process..."

# Update package lists
echo "📦 Updating package lists..."
apt-get update -qq

# Install system dependencies
echo "🛠️ Installing system dependencies..."
apt-get install -y -qq python3 python3-pip ffmpeg curl

# Install yt-dlp
echo "🎥 Installing yt-dlp..."
pip3 install yt-dlp --quiet

# Verify yt-dlp installation
echo "✅ Verifying yt-dlp installation..."
yt-dlp --version

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --only=production --silent

echo "🎉 Build complete! Backend is ready for deployment."

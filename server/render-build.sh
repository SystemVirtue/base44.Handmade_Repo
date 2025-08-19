#!/bin/bash
set -e

echo "Installing system dependencies..."
apt-get update
apt-get install -y python3 python3-pip ffmpeg

echo "Installing yt-dlp..."
pip3 install yt-dlp

echo "Verifying yt-dlp installation..."
yt-dlp --version

echo "Installing Node.js dependencies..."
npm ci --only=production

echo "Build complete!"

FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg curl

# Install yt-dlp
RUN pip3 install yt-dlp

# Verify yt-dlp installation
RUN yt-dlp --version

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S djamms -u 1001 -G nodejs

# Change ownership
RUN chown -R djamms:nodejs /app
USER djamms

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# Expose port (Render uses PORT env var)
EXPOSE $PORT

CMD ["npm", "start"]

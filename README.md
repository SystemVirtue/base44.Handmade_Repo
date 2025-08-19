# DJAMMS - Digital Jukebox Audio Management & Music System

![DJAMMS Logo](https://img.shields.io/badge/DJAMMS-v3.28.12-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

DJAMMS is a comprehensive digital jukebox and audio management system that provides seamless music streaming, playlist management, and zone-based audio control. Built with React and powered by yt-dlp for YouTube integration.

## Features

- 🎵 **YouTube Video Search & Streaming** - Direct video search without API keys
- 🎧 **Multi-Zone Audio Management** - Control different audio zones independently
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🎚️ **Advanced Audio Controls** - Volume, crossfade, and audio processing
- 📋 **Playlist Management** - Create, edit, and manage playlists
- 🔄 **Queue Management** - Dynamic queue with scheduling features
- 🎨 **Themeable UI** - Multiple themes and customizable interface
- 📊 **Analytics & Monitoring** - Usage statistics and performance monitoring
- 🔧 **Circuit Breaker Pattern** - Resilient backend connectivity
- 🌐 **Production Ready** - Optimized for deployment

## Architecture

DJAMMS uses a modern architecture with separate frontend and backend services:

```
┌─────────────────┐    ┌─────────────────────┐    ┌────────────────┐
│   Frontend      │    │   Backend API       │    │   yt-dlp       │
│   (React/Vite)  │◄──►│   (Express.js)      │◄──►│   (Binary)     │
│   Port 3000     │    │   Port 3001         │    │   System       │
└─────────────────┘    └─────────────────────┘    └────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- yt-dlp binary (for YouTube functionality)

### Local Development

```bash
# 1. Clone the repository
git clone <repository-url>
cd djamms-music-management

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server && npm install && cd ..

# 4. Install yt-dlp (optional, for YouTube features)
# Ubuntu/Debian:
sudo apt install yt-dlp
# macOS:
brew install yt-dlp
# Windows: Download from https://github.com/yt-dlp/yt-dlp/releases

# 5. Start backend server (Terminal 1)
npm run server

# 6. Start frontend development server (Terminal 2)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment on Render.com

### Overview

Render.com provides an excellent platform for deploying DJAMMS with both frontend and backend services. This guide covers complete deployment setup.

### Prerequisites

- [Render.com account](https://render.com) (free tier available)
- GitHub repository with your DJAMMS code
- Basic familiarity with environment variables

---

## 📦 Backend Deployment (API Server)

The backend handles YouTube video processing and needs to be deployed first.

### Step 1: Create Backend Service

1. **Login to Render.com**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Choose "Connect a repository"
   - Select your GitHub repository
   - Click "Connect"

3. **Configure Service**
   ```yaml
   Name: djamms-backend
   Region: Oregon (US West) # or closest to your users
   Branch: main # or your default branch
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

### Step 2: Configure Environment Variables

In the Render dashboard, add these environment variables:

```env
NODE_ENV=production
YT_DLP_API_PORT=10000
```

### Step 3: Add Dockerfile (Recommended)

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

# Install yt-dlp and dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg curl
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

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${YT_DLP_API_PORT:-10000}/health || exit 1

EXPOSE 10000

CMD ["npm", "start"]
```

### Step 4: Custom Build Script (Alternative)

If not using Docker, create `server/render-build.sh`:

```bash
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
```

Make it executable and update service settings:
```yaml
Build Command: chmod +x render-build.sh && ./render-build.sh
```

### Step 5: Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note the service URL: `https://djamms-backend-xxx.onrender.com`
4. Test health endpoint: `https://your-backend-url.onrender.com/health`

**Expected Response:**
```json
{
  "status": "ok",
  "service": "yt-dlp API",
  "version": "2025.08.11",
  "timestamp": "2025-08-18T23:30:59.161Z"
}
```

---

## 🌐 Frontend Deployment (Static Site)

### Step 1: Create Static Site Service

1. **In Render Dashboard**
   - Click "New +" → "Static Site"
   - Connect the same repository

2. **Configure Build Settings**
   ```yaml
   Name: djamms-frontend
   Branch: main
   Root Directory: . (leave empty)
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

### Step 2: Environment Variables

Add these environment variables:

```env
VITE_YT_DLP_API_URL=https://djamms-backend-xxx.onrender.com
VITE_APP_NAME=DJAMMS
NODE_VERSION=18
```

**⚠️ Important:** Replace `djamms-backend-xxx.onrender.com` with your actual backend URL from Step 5 above.

### Step 3: Configure Redirects

Create `public/_redirects` file for SPA routing:

```
/*    /index.html   200
```

### Step 4: Deploy Frontend

1. Click "Create Static Site"
2. Wait for build and deployment
3. Access your app at: `https://djamms-frontend-xxx.onrender.com`

---

## ⚙️ Advanced Configuration

### Custom Domain

1. **In Render Dashboard**
   - Go to your frontend service
   - Click "Settings" → "Custom Domains"
   - Add your domain (e.g., `djamms.yourdomain.com`)

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: djamms
   Value: djamms-frontend-xxx.onrender.com
   ```

### Environment-Specific Settings

#### Production Environment Variables

**Frontend:**
```env
VITE_YT_DLP_API_URL=https://your-backend.onrender.com
VITE_APP_NAME=DJAMMS Production
VITE_DEBUG_MODE=false
```

**Backend:**
```env
NODE_ENV=production
YT_DLP_API_PORT=10000
CORS_ORIGINS=https://your-frontend.onrender.com,https://djamms.yourdomain.com
```

### Scaling Configuration

#### Backend Scaling
```yaml
# In Render dashboard
Instance Type: Starter ($7/month) or Standard ($25/month)
Auto-scaling: Enable
Min Instances: 1
Max Instances: 3
```

#### Performance Optimization
```env
# Backend optimizations
NODE_ENV=production
UV_THREADPOOL_SIZE=128
```

---

## 🔧 Troubleshooting Deployment

### Backend Issues

#### yt-dlp Not Found
```bash
# Check build logs for:
ERROR: yt-dlp command not found

# Solution: Ensure Dockerfile includes:
RUN pip3 install yt-dlp
```

#### Port Binding Issues
```bash
# Error: EADDRINUSE port already in use

# Solution: Use Render's PORT variable
# Update server/yt-dlp-api.js:
const PORT = process.env.PORT || process.env.YT_DLP_API_PORT || 3001;
```

#### Build Timeout
```bash
# Error: Build exceeded time limit

# Solution: Optimize Dockerfile
# Use multi-stage build or cached layers
```

### Frontend Issues

#### Environment Variables Not Working
```bash
# Error: VITE_YT_DLP_API_URL is undefined

# Solution: Ensure variables start with VITE_
# Rebuild service after adding variables
```

#### API Connection Failed
```bash
# Error: Failed to fetch from backend

# Check:
1. Backend service is running: https://your-backend.onrender.com/health
2. CORS configuration includes frontend domain
3. Environment variable has correct backend URL
```

#### Build Failures
```bash
# Error: npm ERR! peer dep missing

# Solution: Clear cache and rebuild
# Or add .nvmrc file with Node version:
echo "18" > .nvmrc
```

### Performance Issues

#### Slow Backend Response
```bash
# Render free tier has limited CPU
# Consider upgrading to paid tier for production

# Optimize yt-dlp calls:
# - Enable caching
# - Limit concurrent requests
# - Use lower quality formats
```

#### Cold Starts
```bash
# Free tier services sleep after 15 minutes
# Solutions:
1. Upgrade to paid tier
2. Implement keep-alive ping
3. Use Render cron jobs for warming
```

---

## 📊 Monitoring & Maintenance

### Health Checks

**Backend Health:**
```bash
curl https://your-backend.onrender.com/health
```

**Frontend Health:**
```bash
curl -I https://your-frontend.onrender.com
```

### Logs and Monitoring

1. **Render Dashboard**
   - View real-time logs
   - Monitor CPU/Memory usage
   - Set up alerts

2. **Application Monitoring**
   ```env
   # Add error tracking
   VITE_SENTRY_DSN=your_sentry_dsn
   ```

### Updates and Maintenance

1. **Auto-Deploy**
   - Render auto-deploys on git push
   - Configure deploy hooks if needed

2. **Manual Deploy**
   - Use "Manual Deploy" button in dashboard
   - Deploy specific commits or branches

3. **Rollback**
   - View deployment history
   - One-click rollback to previous versions

---

## 💰 Cost Estimation

### Free Tier Limits
- **Static Sites**: Free forever, custom domain included
- **Web Services**: 750 hours/month free (enough for 1 service)
- **Limitations**: Services sleep after 15 min inactivity

### Paid Tier Benefits
- **Starter Plan ($7/month)**:
  - No sleeping
  - Faster builds
  - Priority support
  
- **Standard Plan ($25/month)**:
  - More CPU/RAM
  - Auto-scaling
  - Better performance

### Recommended Setup
- **Development**: Free tier (frontend + backend)
- **Production**: Paid backend + free frontend
- **Enterprise**: Both services on paid tiers

---

## 🛠️ Additional Configuration

### Security Enhancements

```env
# Backend security
CORS_ORIGINS=https://your-domain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Frontend security
VITE_CSP_POLICY=default-src 'self'
```

### Performance Optimization

```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip3 install yt-dlp
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
```

---

## 📚 Additional Resources

- [Backend Setup Guide](./BACKEND_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [yt-dlp Setup](./YT_DLP_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

- **Issues**: GitHub Issues
- **Documentation**: Check the `/docs` folder
- **Community**: GitHub Discussions

---

## 🚀 Quick Deploy Button

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Note**: The deploy button will guide you through the setup process automatically.

---

**Happy Streaming! 🎵**

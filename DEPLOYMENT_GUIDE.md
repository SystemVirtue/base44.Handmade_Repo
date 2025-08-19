# DJAMMS Deployment Guide

This guide covers deploying DJAMMS with the yt-dlp backend integration.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────────┐    ┌────────────────┐
│   Frontend      │    │   Backend API       │    │   yt-dlp       │
│   (React/Vite)  │◄──►│   (Express.js)      │◄──►│   (System)     │
│   Port 3000     │    │   Port 3001         │    │   Binary       │
└─────────────────┘    └─────────────────────┘    └────────────────┘
```

## Deployment Options

### Option 1: Development (Local)

**Prerequisites:**
- Node.js 18+
- yt-dlp installed system-wide

**Steps:**
```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Start backend API
npm run server

# 3. Start frontend (new terminal)
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Option 2: Production (Separate Servers)

#### Frontend Deployment

**Build:**
```bash
npm run build
```

**Deploy to:**
- Netlify, Vercel, GitHub Pages
- Static hosting service
- CDN + Object Storage

**Environment Variables:**
```env
VITE_YT_DLP_API_URL=https://your-api-domain.com
```

#### Backend Deployment

**Requirements:**
- yt-dlp binary installed
- Node.js 18+ runtime

**Deploy to:**
- Railway, Render, Fly.io
- VPS with PM2
- Docker container
- Serverless functions (with yt-dlp layer)

**Environment Variables:**
```env
YT_DLP_API_PORT=3001
NODE_ENV=production
```

### Option 3: Single Server (Nginx)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (static files)
    location / {
        root /var/www/djamms/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
```

## Platform-Specific Instructions

### Railway

**backend deployment:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "healthcheckPath": "/health"
  }
}
```

### Render

**render.yaml:**
```yaml
services:
  - type: web
    name: djamms-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    healthCheckPath: /health
    envVars:
      - key: YT_DLP_API_PORT
        value: 10000
```

### Fly.io

**fly.toml:**
```toml
app = "djamms-backend"

[build]
  builder = "heroku/buildpacks:20"

[[services]]
  http_checks = []
  internal_port = 3001
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

### Docker

**Dockerfile (Backend):**
```dockerfile
FROM node:18-alpine

# Install yt-dlp
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip3 install yt-dlp

WORKDIR /app
COPY server/package*.json ./
RUN npm install --production

COPY server/ .

EXPOSE 3001

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - YT_DLP_API_PORT=3001
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

## Environment Configuration

### Frontend (.env)
```env
# Required: Backend API URL
VITE_YT_DLP_API_URL=https://your-backend-api.com

# Optional: Other settings
VITE_APP_NAME=DJAMMS
VITE_DEBUG_MODE=false
```

### Backend (.env)
```env
# Optional: API server port
YT_DLP_API_PORT=3001

# Optional: Node environment
NODE_ENV=production

# Optional: CORS origins
CORS_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

## Troubleshooting

### Frontend Issues

**"Backend API not available" Error:**
1. Check `VITE_YT_DLP_API_URL` environment variable
2. Verify backend server is running and accessible
3. Check CORS configuration
4. Test backend health: `curl https://your-api.com/health`

**Build Errors:**
1. Clear cache: `rm -rf node_modules .vite dist && npm install`
2. Check Node.js version (requires 18+)
3. Verify all dependencies are installed

### Backend Issues

**"yt-dlp not available" Error:**
1. Install yt-dlp: `pip install yt-dlp`
2. Verify installation: `yt-dlp --version`
3. Check PATH environment variable
4. For Docker: ensure yt-dlp is in container

**Port Issues:**
1. Check if port 3001 is available
2. Use different port with `YT_DLP_API_PORT`
3. Check firewall rules
4. Verify proxy configuration

**Performance Issues:**
1. Enable caching (included by default)
2. Use CDN for frontend
3. Scale backend horizontally
4. Consider rate limiting

### Network Issues

**CORS Errors:**
```javascript
// backend: server/yt-dlp-api.js
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

**Timeout Errors:**
1. Increase fetch timeout in frontend
2. Optimize yt-dlp format selection
3. Use caching for repeated requests

## Security Considerations

### Production Checklist

- [ ] Use HTTPS for all connections
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Monitor API usage
- [ ] Keep yt-dlp updated
- [ ] Use environment variables for secrets
- [ ] Enable request logging
- [ ] Set up health monitoring

### Rate Limiting Example

```javascript
// Add to backend
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Monitoring

### Health Checks

**Backend Health:**
```bash
curl https://your-api.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "yt-dlp API",
  "version": "2025.08.11",
  "timestamp": "2025-08-18T23:30:59.161Z"
}
```

### Logging

**Frontend Errors:**
- Check browser console
- Monitor network requests
- Use error tracking (Sentry, etc.)

**Backend Logs:**
- Monitor application logs
- Check yt-dlp execution logs
- Track API response times

## Cost Optimization

### Free Tier Options

**Frontend:**
- Netlify (100GB bandwidth)
- Vercel (100GB bandwidth)
- GitHub Pages (1GB storage)

**Backend:**
- Railway (512MB RAM, limited hours)
- Render (512MB RAM, 750 hours)
- Fly.io (3 shared CPUs, 256MB RAM)

### Scaling Strategies

1. **CDN**: Use CloudFlare for frontend
2. **Caching**: Implement Redis for backend cache
3. **Load Balancing**: Multiple backend instances
4. **Database**: Store popular video metadata

## Migration from YouTube API

### Advantages
- ✅ No API keys or quotas
- ✅ Better reliability
- ✅ More video information
- ✅ Direct streaming URLs
- ✅ No rate limiting

### Considerations
- Backend infrastructure required
- yt-dlp dependency
- Deployment complexity
- Server costs for backend

---

Need help? Check the project documentation or create an issue on GitHub.

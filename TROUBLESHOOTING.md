# DJAMMS Troubleshooting Guide

## Common Errors and Solutions

### "Failed to fetch" - Backend API Not Available

**Error:** `TypeError: Failed to fetch` when accessing YouTube search

**Symptoms:**
- YouTube search shows "Backend API Unavailable"
- Console errors about API requests failing
- Service status shows connection errors

**Solutions:**

#### Development Environment
1. **Start the backend server:**
   ```bash
   npm run server
   ```

2. **Verify backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Check if yt-dlp is installed:**
   ```bash
   yt-dlp --version
   ```

#### Production Environment
1. **Check API URL configuration:**
   - Verify `VITE_YT_DLP_API_URL` environment variable
   - Ensure it points to your deployed backend

2. **Deploy backend server:**
   - Backend must be deployed separately
   - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

3. **Test backend health:**
   ```bash
   curl https://your-backend-url.com/health
   ```

### "yt-dlp not available" - Binary Missing

**Error:** Backend responds with yt-dlp not found

**Solutions:**
1. **Install yt-dlp:**
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install yt-dlp
   
   # macOS
   brew install yt-dlp
   
   # pip
   pip install yt-dlp
   ```

2. **Verify installation:**
   ```bash
   yt-dlp --version
   ```

3. **Check PATH:** Ensure yt-dlp is in system PATH

### CORS Errors

**Error:** Cross-origin request blocked

**Symptoms:**
- Browser console shows CORS errors
- Requests fail from deployed frontend

**Solutions:**
1. **Update backend CORS configuration:**
   ```javascript
   // In server/yt-dlp-api.js
   app.use(cors({
     origin: ['https://your-frontend-domain.com'],
     credentials: true
   }));
   ```

2. **Add environment variable:**
   ```env
   CORS_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
   ```

### Port Conflicts

**Error:** Backend fails to start on port 3001

**Solutions:**
1. **Check if port is in use:**
   ```bash
   lsof -i :3001
   ```

2. **Use different port:**
   ```bash
   YT_DLP_API_PORT=3002 npm run server
   ```

3. **Update frontend API URL:**
   ```env
   VITE_YT_DLP_API_URL=http://localhost:3002
   ```

### Search Not Working

**Error:** Search returns no results or errors

**Solutions:**
1. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3001/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "test", "maxResults": 1}'
   ```

2. **Check yt-dlp functionality:**
   ```bash
   yt-dlp --dump-single-json "ytsearch1:test"
   ```

3. **Update yt-dlp:**
   ```bash
   pip install -U yt-dlp
   ```

### Deployment Issues

#### Frontend Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules .vite dist
npm install
npm run build
```

#### Backend Deployment Fails
1. **Check Node.js version:** Requires 18+
2. **Verify yt-dlp in deployment environment**
3. **Check deployment logs for errors**

#### Environment Variables Not Working
1. **Verify variable names:** Must start with `VITE_` for frontend
2. **Restart development server** after adding variables
3. **Check build process** includes environment variables

### Performance Issues

#### Slow Search Results
1. **Check backend caching:** Should cache for 5 minutes
2. **Verify yt-dlp performance:** Test locally
3. **Monitor network requests:** Use browser dev tools

#### High Memory Usage
1. **Clear cache periodically:** Backend includes automatic cleanup
2. **Limit concurrent requests:** Consider rate limiting
3. **Optimize yt-dlp options:** Use lower quality settings

### Browser Console Errors

#### React/Vite Errors
1. **Update dependencies:**
   ```bash
   npm update
   ```

2. **Clear browser cache:** Hard refresh (Ctrl+Shift+R)

3. **Check browser compatibility:** Requires modern browser

#### Network Errors
1. **Check network connectivity**
2. **Verify HTTPS/HTTP configuration**
3. **Test with browser network tools**

## Debug Mode

### Enable Debug Logging

**Frontend:**
```javascript
// In browser console
localStorage.setItem('debug', 'true');
// Reload page
```

**Backend:**
```bash
DEBUG=* npm run server
```

### API Testing

**Test Backend Health:**
```bash
curl -v http://localhost:3001/health
```

**Test Search:**
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "music", "maxResults": 2}' \
  | jq '.'
```

**Test Video Details:**
```bash
curl http://localhost:3001/api/video/dQw4w9WgXcQ | jq '.'
```

## Getting Help

### Information to Include

When reporting issues, please include:

1. **Environment:**
   - Operating system
   - Node.js version
   - Browser version
   - yt-dlp version

2. **Configuration:**
   - Environment variables
   - API URLs
   - Deployment method

3. **Error Messages:**
   - Browser console errors
   - Backend server logs
   - Network request details

4. **Steps to Reproduce:**
   - What you were trying to do
   - Expected vs actual behavior
   - Minimal reproduction case

### Common Commands for Diagnostics

```bash
# System information
node --version
npm --version
yt-dlp --version

# Service status
curl http://localhost:3001/health

# Network connectivity
ping your-backend-domain.com

# Process information
ps aux | grep node
lsof -i :3001

# Logs
tail -f server.log
```

### Reset to Clean State

**Development:**
```bash
# Stop all processes
pkill -f "node"

# Clean installation
rm -rf node_modules server/node_modules
npm install
cd server && npm install && cd ..

# Restart services
npm run server &
npm run dev
```

**Production:**
```bash
# Redeploy frontend
npm run build
# Upload dist/ to hosting

# Restart backend
pm2 restart djamms-backend
# Or restart your deployment service
```

---

Still having issues? Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or create an issue with the diagnostic information above.

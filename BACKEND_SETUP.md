# Backend API Setup for yt-dlp Integration

The application now uses a **backend API server** to handle yt-dlp operations, resolving the browser compatibility issues.

## Architecture

```
Frontend (React/Vite) ←→ Backend API Server ←→ yt-dlp binary
     Port 3000                Port 3001         System binary
```

## Quick Start

### 1. Install yt-dlp System Binary

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install yt-dlp
```

**macOS:**
```bash
brew install yt-dlp
```

**Windows:**
Download from: https://github.com/yt-dlp/yt-dlp/releases

**Verify installation:**
```bash
yt-dlp --version
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Start Backend Server

```bash
# From project root
npm run server

# Or directly in server directory
cd server && npm start
```

The backend API will start on `http://localhost:3001`

### 4. Start Frontend Development Server

```bash
# In a new terminal, from project root
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Returns service status and yt-dlp version.

### Search Videos
```
POST /api/search
Content-Type: application/json

{
  "query": "search terms",
  "maxResults": 25,
  "order": "relevance"
}
```

### Get Video Details
```
GET /api/video/:videoId
```

### Get Playlist Info
```
GET /api/playlist/:playlistId
```

### Get Streaming URL
```
GET /api/stream/:videoId
```

## Configuration

### Environment Variables

Create `.env` file in the project root:

```env
# Backend API URL (optional, defaults to http://localhost:3001)
VITE_YT_DLP_API_URL=http://localhost:3001

# Backend server port (optional, defaults to 3001)
YT_DLP_API_PORT=3001
```

## Development

### Running Both Services

For development, you'll need both servers running:

```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Frontend
npm run dev
```

### Testing the API

Test backend API health:
```bash
curl http://localhost:3001/health
```

Test search functionality:
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test music", "maxResults": 5}'
```

## Production Deployment

### Option 1: Separate Servers

Deploy frontend and backend separately:

1. **Frontend**: Build and deploy static files
   ```bash
   npm run build
   # Deploy dist/ folder to your static hosting
   ```

2. **Backend**: Deploy API server
   ```bash
   cd server
   npm install --production
   npm start
   ```

### Option 2: Single Server with Reverse Proxy

Use nginx or similar to serve both:

```nginx
# Frontend
location / {
  root /path/to/dist;
  try_files $uri $uri/ /index.html;
}

# Backend API
location /api/ {
  proxy_pass http://localhost:3001;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

## Troubleshooting

### "Backend API not available"

1. **Check if backend is running**: `curl http://localhost:3001/health`
2. **Check yt-dlp installation**: `yt-dlp --version`
3. **Check server logs**: Look at terminal running `npm run server`
4. **Port conflicts**: Ensure port 3001 is available

### "yt-dlp not available"

1. **Install yt-dlp system binary** (see installation steps above)
2. **Check PATH**: Ensure yt-dlp is in system PATH
3. **Permissions**: Ensure yt-dlp executable has proper permissions

### Search Not Working

1. **Test API directly**: Use curl commands above
2. **Check CORS**: Ensure backend allows frontend origin
3. **Network connectivity**: Ensure YouTube is accessible from server

### Performance Issues

1. **Caching**: API includes 5-minute caching for better performance
2. **Format selection**: Limited to 720p for faster extraction
3. **Concurrent requests**: Backend handles multiple requests efficiently

## Error Handling

The system includes comprehensive error handling:

- **Frontend**: Graceful fallback when backend unavailable
- **Backend**: Detailed error responses with timestamps
- **Caching**: Reduces load on yt-dlp and YouTube
- **Logging**: Full request/response logging for debugging

## Security Considerations

- **CORS**: Configured to allow frontend origin only
- **Rate limiting**: Consider adding rate limiting for production
- **Input validation**: All user inputs are validated
- **Error disclosure**: Error messages don't expose sensitive information

## Migration Notes

- **No API keys needed**: System works without YouTube API credentials
- **No quotas**: Unlimited searches and video access
- **Better reliability**: Less prone to API changes and rate limits
- **Simplified deployment**: No external API dependencies

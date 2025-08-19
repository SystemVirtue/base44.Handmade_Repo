/**
 * Backend API Server for yt-dlp Operations
 * Handles YouTube video extraction using yt-dlp on the server side
 */

import express from 'express';
import cors from 'cors';
import youtubeDl from 'youtube-dl-exec';

const app = express();
const PORT = process.env.PORT || process.env.YT_DLP_API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Cache for storing results
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

// Helper function to set cached data
function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const version = await youtubeDl('--version');
    res.json({
      status: 'ok',
      service: 'yt-dlp API',
      version: version.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'yt-dlp API',
      error: 'yt-dlp not available',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Search videos endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, maxResults = 25, order = 'relevance' } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid query parameter'
      });
    }

    // Check cache first
    const cacheKey = `search_${query}_${maxResults}_${order}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`Cache hit for search: "${query}"`);
      return res.json(cached);
    }

    console.log(`Searching YouTube with yt-dlp: "${query}"`);
    
    // Use yt-dlp to search YouTube
    const searchUrl = `ytsearch${maxResults}:${query}`;
    
    const searchResults = await youtubeDl(searchUrl, {
      dumpSingleJson: true,
      skipDownload: true,
      format: 'best[height<=720]',
      writeInfoJson: false,
      writeDescription: false,
      writeThumbnail: false,
      writeSubtitles: false,
      writeAutoSub: false,
    });

    // Handle both single result and array of results
    const entries = Array.isArray(searchResults.entries) 
      ? searchResults.entries 
      : searchResults.entries 
        ? [searchResults.entries]
        : [searchResults];

    // Process results into standardized format
    const videos = entries
      .filter(entry => entry && entry.id && entry.title)
      .map(entry => processVideoData(entry))
      .filter(video => video !== null);

    const result = {
      videos,
      totalResults: videos.length,
      resultsPerPage: videos.length,
      query,
      timestamp: new Date().toISOString()
    };

    // Cache the results
    setCachedData(cacheKey, result);
    
    console.log(`Found ${videos.length} videos for query: "${query}"`);
    res.json(result);
    
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get video details endpoint
app.get('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({
        error: 'Video ID is required'
      });
    }

    // Check cache first
    const cacheKey = `video_${videoId}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`Cache hit for video: ${videoId}`);
      return res.json(cached);
    }

    console.log(`Getting video details: ${videoId}`);
    
    const videoUrl = videoId.startsWith('http') 
      ? videoId 
      : `https://www.youtube.com/watch?v=${videoId}`;

    const videoData = await youtubeDl(videoUrl, {
      dumpSingleJson: true,
      skipDownload: true,
      format: 'best[height<=720]',
    });

    const video = processVideoData(videoData);
    
    if (!video) {
      return res.status(404).json({
        error: 'Video not found or unavailable'
      });
    }

    // Cache the result
    setCachedData(cacheKey, video);
    
    res.json(video);
    
  } catch (error) {
    console.error(`Failed to get video details for ${req.params.videoId}:`, error);
    res.status(500).json({
      error: 'Failed to get video details',
      message: error.message,
      videoId: req.params.videoId,
      timestamp: new Date().toISOString()
    });
  }
});

// Get playlist endpoint
app.get('/api/playlist/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    if (!playlistId) {
      return res.status(400).json({
        error: 'Playlist ID is required'
      });
    }

    // Check cache first
    const cacheKey = `playlist_${playlistId}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`Cache hit for playlist: ${playlistId}`);
      return res.json(cached);
    }

    console.log(`Getting playlist info: ${playlistId}`);
    
    const playlistUrl = playlistId.startsWith('http')
      ? playlistId
      : `https://www.youtube.com/playlist?list=${playlistId}`;

    const playlistData = await youtubeDl(playlistUrl, {
      dumpSingleJson: true,
      skipDownload: true,
      format: 'best[height<=720]',
      yesPlaylist: true,
    });

    // Process playlist data
    const playlist = {
      id: playlistData.id || playlistId,
      title: playlistData.title || playlistData.playlist_title || 'Unknown Playlist',
      description: playlistData.description || '',
      channelTitle: playlistData.uploader || playlistData.channel || 'Unknown Channel',
      publishedAt: playlistData.upload_date || null,
      thumbnail: playlistData.thumbnail || '',
      itemCount: 0,
      videos: []
    };

    // Process videos if available
    if (playlistData.entries) {
      const videos = playlistData.entries
        .filter(entry => entry && entry.id && entry.title)
        .map(entry => processVideoData(entry))
        .filter(video => video !== null);
      
      playlist.videos = videos;
      playlist.itemCount = videos.length;
    }

    // Cache the result
    setCachedData(cacheKey, playlist);
    
    res.json(playlist);
    
  } catch (error) {
    console.error(`Failed to get playlist info for ${req.params.playlistId}:`, error);
    res.status(500).json({
      error: 'Failed to get playlist info',
      message: error.message,
      playlistId: req.params.playlistId,
      timestamp: new Date().toISOString()
    });
  }
});

// Get streaming URL endpoint
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({
        error: 'Video ID is required'
      });
    }

    console.log(`Getting streaming URL for: ${videoId}`);
    
    const videoUrl = videoId.startsWith('http') 
      ? videoId 
      : `https://www.youtube.com/watch?v=${videoId}`;

    const result = await youtubeDl(videoUrl, {
      getUrl: true,
      format: 'best[height<=720]/best',
    });

    res.json({
      videoId,
      streamingUrl: result.url || result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`Failed to get streaming URL for ${req.params.videoId}:`, error);
    res.status(500).json({
      error: 'Failed to get streaming URL',
      message: error.message,
      videoId: req.params.videoId,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to process video data into standardized format
function processVideoData(data) {
  if (!data || !data.id) return null;

  try {
    // Parse duration (yt-dlp returns seconds)
    const duration = data.duration || 0;
    
    // Parse upload date
    let publishedAt = null;
    if (data.upload_date) {
      const dateStr = data.upload_date.toString();
      if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        publishedAt = `${year}-${month}-${day}T00:00:00Z`;
      }
    }

    // Get best thumbnail
    let thumbnail = data.thumbnail || '';
    if (data.thumbnails && Array.isArray(data.thumbnails)) {
      const bestThumb = data.thumbnails
        .filter(t => t.url)
        .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
      if (bestThumb) {
        thumbnail = bestThumb.url;
      }
    }

    return {
      id: data.id,
      videoId: data.id,
      title: data.title || 'Unknown Title',
      description: data.description || '',
      channelTitle: data.uploader || data.channel || 'Unknown Channel',
      publishedAt: publishedAt,
      thumbnail: thumbnail,
      duration: duration,
      viewCount: data.view_count || 0,
      likeCount: data.like_count || 0,
      commentCount: data.comment_count || 0,
      tags: data.tags || [],
      streamingUrl: data.url || null,
      formats: data.formats || []
    };
  } catch (error) {
    console.error('Error processing video data:', error);
    return null;
  }
}

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎥 yt-dlp API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;

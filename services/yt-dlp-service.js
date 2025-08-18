/**
 * YouTube yt-dlp Service
 * Handles YouTube video information and extraction using backend yt-dlp API
 * Replaces the YouTube Data API v3 dependency
 */

import YouTubeVideo from '../entities/YouTubeVideo.js';
import YouTubePlaylist from '../entities/YouTubePlaylist.js';

class YtDlpService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.searchCache = new Map();
    this.searchCacheTimeout = 10 * 60 * 1000; // 10 minutes

    // Backend API configuration
    this.apiBaseUrl = import.meta.env.VITE_YT_DLP_API_URL || 'http://localhost:3001';
  }

  /**
   * Make API request to backend
   */
  async makeApiRequest(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Search for YouTube videos using backend yt-dlp API
   */
  async searchVideos(query, options = {}) {
    const maxResults = options.maxResults || 25;
    const order = options.order || 'relevance';

    // Create cache key
    const cacheKey = `search_${query}_${maxResults}_${order}`;
    const cached = this.getCachedData(cacheKey, this.searchCacheTimeout);
    if (cached) {
      return cached;
    }

    try {
      console.log(`Searching YouTube via API: "${query}"`);

      const response = await this.makeApiRequest('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          maxResults,
          order
        })
      });

      // Process API response into our video format
      const videos = response.videos
        .map(videoData => this.createVideoFromApiData(videoData))
        .filter(video => video !== null);

      const result = {
        videos,
        nextPageToken: null, // Backend doesn't support pagination
        totalResults: videos.length,
        resultsPerPage: videos.length
      };

      // Cache the results
      this.setCachedData(cacheKey, result, this.searchCacheTimeout);

      console.log(`Found ${videos.length} videos for query: "${query}"`);
      return result;
    } catch (error) {
      console.error('YouTube search failed:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get video details by video ID or URL
   */
  async getVideoDetails(videoId) {
    if (!videoId) return null;

    // Create cache key
    const cacheKey = `video_${videoId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      console.log(`Getting video details via API: ${videoId}`);

      const response = await this.makeApiRequest(`/api/video/${encodeURIComponent(videoId)}`);
      const video = this.createVideoFromApiData(response);

      // Cache the result
      this.setCachedData(cacheKey, video);

      return video;
    } catch (error) {
      console.error(`Failed to get video details for ${videoId}:`, error);
      return null;
    }
  }

  /**
   * Get playlist information and videos
   */
  async getPlaylistInfo(playlistId) {
    const cacheKey = `playlist_${playlistId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Getting playlist info via API: ${playlistId}`);

      const response = await this.makeApiRequest(`/api/playlist/${encodeURIComponent(playlistId)}`);

      // Create playlist object
      const playlist = new YouTubePlaylist({
        id: response.id || playlistId,
        snippet: {
          title: response.title || 'Unknown Playlist',
          description: response.description || '',
          channelTitle: response.channelTitle || 'Unknown Channel',
          publishedAt: response.publishedAt || null,
          thumbnails: {
            default: { url: response.thumbnail || '' },
            medium: { url: response.thumbnail || '' },
            high: { url: response.thumbnail || '' }
          }
        },
        contentDetails: {
          itemCount: response.itemCount || 0
        }
      });

      // Process videos if available
      if (response.videos) {
        const videos = response.videos
          .map(videoData => this.createVideoFromApiData(videoData))
          .filter(video => video !== null);

        playlist.videos = videos;
        playlist.itemCount = videos.length;
      }

      this.setCachedData(cacheKey, playlist);
      return playlist;
    } catch (error) {
      console.error('Failed to get playlist info:', error);
      throw error;
    }
  }

  /**
   * Get trending music videos (simulated with popular search)
   */
  async getTrendingMusic(regionCode = 'US', maxResults = 25) {
    try {
      // Since yt-dlp doesn't have direct trending API, we'll search for popular music
      const trendingQueries = [
        'music 2024 popular',
        'trending music',
        'top songs',
        'viral music',
        'hit songs'
      ];
      
      const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
      const results = await this.searchVideos(randomQuery, { maxResults });
      
      return results.videos;
    } catch (error) {
      console.error('Failed to get trending music:', error);
      return [];
    }
  }

  /**
   * Get direct streaming URL for a video
   */
  async getStreamingUrl(videoId) {
    try {
      const videoUrl = videoId.startsWith('http') 
        ? videoId 
        : `https://www.youtube.com/watch?v=${videoId}`;

      const result = await youtubeDl(videoUrl, {
        getUrl: true,
        format: 'best[height<=720]/best', // Prefer 720p, fallback to best available
        skipDownload: true,
      });

      return result.url || result;
    } catch (error) {
      console.error(`Failed to get streaming URL for ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Convert yt-dlp data to our YouTubeVideo format
   */
  createVideoFromYtDlpData(data) {
    if (!data || !data.id) return null;

    try {
      // Parse duration (yt-dlp returns seconds)
      const duration = data.duration || 0;
      
      // Parse upload date
      let publishedAt = null;
      if (data.upload_date) {
        // yt-dlp returns YYYYMMDD format
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
        // Find the best quality thumbnail
        const bestThumb = data.thumbnails
          .filter(t => t.url)
          .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
        if (bestThumb) {
          thumbnail = bestThumb.url;
        }
      }

      return new YouTubeVideo({
        id: data.id,
        videoId: data.id,
        snippet: {
          title: data.title || 'Unknown Title',
          description: data.description || '',
          channelTitle: data.uploader || data.channel || 'Unknown Channel',
          publishedAt: publishedAt,
          thumbnails: {
            default: { url: thumbnail },
            medium: { url: thumbnail },
            high: { url: thumbnail }
          },
          tags: data.tags || []
        },
        contentDetails: {
          duration: `PT${duration}S`,
          definition: 'hd' // Assume HD for simplicity
        },
        statistics: {
          viewCount: data.view_count || 0,
          likeCount: data.like_count || 0,
          commentCount: data.comment_count || 0
        },
        // Additional yt-dlp specific data
        streamingUrl: data.url || null,
        formats: data.formats || []
      });
    } catch (error) {
      console.error('Error creating video from yt-dlp data:', error);
      return null;
    }
  }

  /**
   * Cache management
   */
  getCachedData(key, timeout = this.cacheTimeout) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < timeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCachedData(key, data, timeout = this.cacheTimeout) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.searchCache.clear();
  }

  /**
   * Check if the service is ready (yt-dlp availability)
   */
  async isServiceReady() {
    try {
      // Test yt-dlp availability with a simple command
      const version = await youtubeDl('--version');
      console.log(`yt-dlp version: ${version}`);
      return {
        ready: true,
        version: version.trim()
      };
    } catch (error) {
      console.warn('yt-dlp not available:', error.message);
      return {
        ready: false,
        reason: 'yt-dlp not available or not properly installed. Please install yt-dlp to enable YouTube video features.',
        error: error.message,
        installUrl: 'https://github.com/yt-dlp/yt-dlp#installation'
      };
    }
  }

  /**
   * Get service statistics
   */
  getUsageStatistics() {
    return {
      cacheSize: this.cache.size,
      searchCacheSize: this.searchCache.size,
      service: 'yt-dlp',
      apiKeyRequired: false
    };
  }
}

// Singleton instance
let ytDlpService = null;

export function getYtDlpService() {
  if (!ytDlpService) {
    ytDlpService = new YtDlpService();
  }
  return ytDlpService;
}

export default YtDlpService;

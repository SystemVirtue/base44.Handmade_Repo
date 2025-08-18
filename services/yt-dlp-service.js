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

    // Circuit breaker pattern for service availability
    this.serviceStatus = {
      available: null, // null = unknown, true = available, false = unavailable
      lastCheck: 0,
      failureCount: 0,
      checkInterval: 30000, // 30 seconds
      maxFailures: 3,
      backoffTime: 5 * 60 * 1000, // 5 minutes after max failures
    };

    // Check if backend is completely disabled
    this.backendDisabled = import.meta.env.VITE_DISABLE_BACKEND === 'true';
  }

  /**
   * Check if we should attempt to connect to backend
   */
  shouldAttemptConnection() {
    // If backend is explicitly disabled, never attempt
    if (this.backendDisabled) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastCheck = now - this.serviceStatus.lastCheck;

    // If we know the service is unavailable and we're in backoff period
    if (this.serviceStatus.available === false &&
        this.serviceStatus.failureCount >= this.serviceStatus.maxFailures &&
        timeSinceLastCheck < this.serviceStatus.backoffTime) {
      return false;
    }

    // If we recently checked and service was available
    if (this.serviceStatus.available === true &&
        timeSinceLastCheck < this.serviceStatus.checkInterval) {
      return true;
    }

    // If enough time has passed since last check, allow attempt
    if (timeSinceLastCheck >= this.serviceStatus.checkInterval) {
      return true;
    }

    // Default to allowing connection if we haven't determined status yet
    return this.serviceStatus.available !== false;
  }

  /**
   * Record connection success
   */
  recordSuccess() {
    this.serviceStatus.available = true;
    this.serviceStatus.failureCount = 0;
    this.serviceStatus.lastCheck = Date.now();
  }

  /**
   * Record connection failure
   */
  recordFailure() {
    this.serviceStatus.available = false;
    this.serviceStatus.failureCount++;
    this.serviceStatus.lastCheck = Date.now();
  }

  /**
   * Make API request to backend
   */
  async makeApiRequest(endpoint, options = {}) {
    // Check if we should attempt connection
    if (!this.shouldAttemptConnection()) {
      const error = new Error('Backend API is temporarily unavailable (circuit breaker open)');
      error.isCircuitBreakerOpen = true;
      throw error;
    }

    const url = `${this.apiBaseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 5000, // 5 second timeout
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.recordFailure();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.recordSuccess();
      return data;
    } catch (error) {
      this.recordFailure();

      // Handle specific network errors with less verbose logging
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // Only log once when service becomes unavailable
        if (this.serviceStatus.failureCount === 1) {
          console.warn(`Backend API not available at ${this.apiBaseUrl}: Connection failed`);
        }
        const serviceError = new Error('Backend API server is not available');
        serviceError.isNetworkError = true;
        throw serviceError;
      }

      // Only log API errors if they're not repeated failures
      if (this.serviceStatus.failureCount <= 2) {
        console.error(`API request failed: ${endpoint}`, error.message);
      }
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
      console.log(`Getting streaming URL via API: ${videoId}`);

      const response = await this.makeApiRequest(`/api/stream/${encodeURIComponent(videoId)}`);
      return response.streamingUrl;
    } catch (error) {
      console.error(`Failed to get streaming URL for ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Convert API data to our YouTubeVideo format
   */
  createVideoFromApiData(data) {
    if (!data || !data.id) return null;

    try {
      return new YouTubeVideo({
        id: data.id,
        videoId: data.videoId || data.id,
        snippet: {
          title: data.title || 'Unknown Title',
          description: data.description || '',
          channelTitle: data.channelTitle || 'Unknown Channel',
          publishedAt: data.publishedAt,
          thumbnails: {
            default: { url: data.thumbnail || '' },
            medium: { url: data.thumbnail || '' },
            high: { url: data.thumbnail || '' }
          },
          tags: data.tags || []
        },
        contentDetails: {
          duration: `PT${data.duration || 0}S`,
          definition: 'hd' // Assume HD for simplicity
        },
        statistics: {
          viewCount: data.viewCount || 0,
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0
        },
        // Additional data
        streamingUrl: data.streamingUrl || null,
        formats: data.formats || []
      });
    } catch (error) {
      console.error('Error creating video from API data:', error);
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
   * Check if the service is ready (backend API availability)
   */
  async isServiceReady() {
    try {
      console.log('Checking backend API health...');
      const response = await this.makeApiRequest('/health');

      if (response.status === 'ok') {
        console.log(`Backend API ready: ${response.version}`);
        return {
          ready: true,
          version: response.version,
          service: response.service
        };
      } else {
        return {
          ready: false,
          reason: 'Backend API reported an error',
          error: response.error || 'Unknown API error'
        };
      }
    } catch (error) {
      console.warn('Backend API not available:', error.message);

      // Check if this is a development vs production environment
      const isDevelopment = this.apiBaseUrl.includes('localhost');
      const isProduction = window.location.hostname !== 'localhost';

      let reason = 'Backend yt-dlp API not available.';
      let suggestion = '';

      if (isDevelopment && isProduction) {
        reason = 'Development API URL configured in production environment.';
        suggestion = 'Backend API server needs to be deployed and configured for production.';
      } else if (isDevelopment) {
        reason = 'Backend API server not running locally.';
        suggestion = 'Please start the backend server with: npm run server';
      } else {
        reason = 'Backend API server not available.';
        suggestion = 'Please ensure the yt-dlp API server is deployed and running.';
      }

      return {
        ready: false,
        reason: reason,
        suggestion: suggestion,
        error: error.message,
        apiUrl: this.apiBaseUrl,
        isDevelopment,
        isProduction
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

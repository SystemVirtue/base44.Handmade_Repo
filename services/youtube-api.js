/**
 * YouTube API Service
 * Handles YouTube Data API v3 integration with automatic key rotation
 */

import { getAPIKeyManager } from './api-key-manager.js';
import YouTubeVideo from '../entities/YouTubeVideo.js';
import YouTubePlaylist from '../entities/YouTubePlaylist.js';

class YouTubeAPIService {
  constructor() {
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    this.apiKeyManager = getAPIKeyManager();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Make authenticated request to YouTube API
   */
  async makeRequest(endpoint, params = {}, retries = 3) {
    if (!this.apiKeyManager.isReady()) {
      throw new Error('No YouTube API keys configured. Please add API keys in Settings.');
    }

    let lastError = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const apiKey = this.apiKeyManager.getCurrentKey();
        const url = new URL(`${this.baseURL}/${endpoint}`);
        
        // Add API key and other parameters
        Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });

        console.log(`YouTube API Request: ${endpoint}`, params);
        
        const response = await fetch(url.toString());
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.warn('Quota exceeded, rotating API key...');
            this.apiKeyManager.rotateKey();
            continue; // Retry with next key
          }
          throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
      } catch (error) {
        lastError = error;
        console.error(`YouTube API request failed (attempt ${attempt + 1}):`, error);
        
        if (attempt < retries - 1) {
          this.apiKeyManager.rotateKey();
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('All API request attempts failed');
  }

  /**
   * Search for videos
   */
  async searchVideos(query, options = {}) {
    const params = {
      part: 'snippet',
      type: 'video',
      q: query,
      maxResults: options.maxResults || 25,
      order: options.order || 'relevance',
      videoCategoryId: '10', // Music category
      videoDefinition: options.videoDefinition || 'any',
      videoDuration: options.videoDuration || 'any',
      ...options
    };

    if (options.pageToken) {
      params.pageToken = options.pageToken;
    }

    try {
      const data = await this.makeRequest('search', params);
      this.apiKeyManager.recordUsage('search');

      // Get video details for duration and view count
      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const videosData = await this.getVideoDetails(videoIds);

      // Combine search results with video details
      const videos = data.items.map(item => {
        const videoDetails = videosData.find(v => v.id === item.id.videoId);
        return new YouTubeVideo({
          id: item.id.videoId,
          videoId: item.id.videoId,
          snippet: item.snippet,
          contentDetails: videoDetails?.contentDetails,
          statistics: videoDetails?.statistics
        });
      });

      return {
        videos,
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo.totalResults,
        resultsPerPage: data.pageInfo.resultsPerPage
      };
    } catch (error) {
      console.error('Video search failed:', error);
      throw error;
    }
  }

  /**
   * Get video details by IDs
   */
  async getVideoDetails(videoIds) {
    if (!videoIds) return [];
    
    const idsArray = Array.isArray(videoIds) ? videoIds : videoIds.split(',');
    if (idsArray.length === 0) return [];

    const params = {
      part: 'snippet,contentDetails,statistics',
      id: idsArray.join(',')
    };

    try {
      const data = await this.makeRequest('videos', params);
      this.apiKeyManager.recordUsage('videos');

      return data.items || [];
    } catch (error) {
      console.error('Failed to get video details:', error);
      return [];
    }
  }

  /**
   * Get playlist information
   */
  async getPlaylistInfo(playlistId) {
    const cacheKey = `playlist_info_${playlistId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      part: 'snippet,contentDetails,status',
      id: playlistId
    };

    try {
      const data = await this.makeRequest('playlists', params);
      this.apiKeyManager.recordUsage('playlistItems');

      if (!data.items || data.items.length === 0) {
        throw new Error('Playlist not found');
      }

      const playlistData = data.items[0];
      const result = new YouTubePlaylist({
        id: playlistData.id,
        snippet: playlistData.snippet,
        contentDetails: playlistData.contentDetails,
        status: playlistData.status
      });

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get playlist info:', error);
      throw error;
    }
  }

  /**
   * Get playlist videos
   */
  async getPlaylistVideos(playlistId, options = {}) {
    const maxResults = options.maxResults || 50;
    let allVideos = [];
    let nextPageToken = options.pageToken;

    try {
      do {
        const params = {
          part: 'snippet,contentDetails',
          playlistId: playlistId,
          maxResults: Math.min(maxResults - allVideos.length, 50),
        };

        if (nextPageToken) {
          params.pageToken = nextPageToken;
        }

        const data = await this.makeRequest('playlistItems', params);
        this.apiKeyManager.recordUsage('playlistItems');

        if (!data.items) break;

        // Get video IDs for detailed information
        const videoIds = data.items
          .filter(item => item.snippet.resourceId.kind === 'youtube#video')
          .map(item => item.snippet.resourceId.videoId);

        if (videoIds.length > 0) {
          const videoDetails = await this.getVideoDetails(videoIds);

          // Create video objects with combined data
          const videos = data.items
            .filter(item => item.snippet.resourceId.kind === 'youtube#video')
            .map((item, index) => {
              const videoDetail = videoDetails.find(v => v.id === item.snippet.resourceId.videoId);
              return new YouTubeVideo({
                id: item.snippet.resourceId.videoId,
                videoId: item.snippet.resourceId.videoId,
                snippet: item.snippet,
                contentDetails: videoDetail?.contentDetails,
                statistics: videoDetail?.statistics,
                position: item.snippet.position
              });
            });

          allVideos.push(...videos);
        }

        nextPageToken = data.nextPageToken;
      } while (nextPageToken && allVideos.length < maxResults);

      return {
        videos: allVideos,
        nextPageToken: nextPageToken,
        totalResults: allVideos.length
      };
    } catch (error) {
      console.error('Failed to get playlist videos:', error);
      throw error;
    }
  }

  /**
   * Get complete playlist with videos
   */
  async getCompletePlaylist(playlistId, options = {}) {
    try {
      // Get playlist info and videos in parallel
      const [playlistInfo, playlistVideos] = await Promise.all([
        this.getPlaylistInfo(playlistId),
        this.getPlaylistVideos(playlistId, options)
      ]);

      // Combine playlist info with videos
      playlistInfo.videos = playlistVideos.videos;
      playlistInfo.itemCount = playlistVideos.videos.length;
      playlistInfo.totalDuration = playlistInfo.calculateTotalDuration();

      return playlistInfo;
    } catch (error) {
      console.error('Failed to get complete playlist:', error);
      throw error;
    }
  }

  /**
   * Get video categories
   */
  async getVideoCategories(regionCode = 'US') {
    const cacheKey = `categories_${regionCode}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      part: 'snippet',
      regionCode: regionCode
    };

    try {
      const data = await this.makeRequest('videoCategories', params);
      this.apiKeyManager.recordUsage('videos');

      const categories = data.items?.map(item => ({
        id: item.id,
        title: item.snippet.title,
        assignable: item.snippet.assignable
      })) || [];

      this.setCachedData(cacheKey, categories, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return categories;
    } catch (error) {
      console.error('Failed to get video categories:', error);
      return [];
    }
  }

  /**
   * Get trending music videos
   */
  async getTrendingMusic(regionCode = 'US', maxResults = 25) {
    const params = {
      part: 'snippet,statistics',
      chart: 'mostPopular',
      videoCategoryId: '10', // Music category
      regionCode: regionCode,
      maxResults: maxResults
    };

    try {
      const data = await this.makeRequest('videos', params);
      this.apiKeyManager.recordUsage('videos');

      const videos = data.items?.map(item => new YouTubeVideo(item)) || [];
      return videos;
    } catch (error) {
      console.error('Failed to get trending music:', error);
      return [];
    }
  }

  /**
   * Cache management
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
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
  }

  /**
   * Get API usage statistics
   */
  getUsageStatistics() {
    return this.apiKeyManager.getStatistics();
  }
}

// Singleton instance
let youtubeAPI = null;

export function getYouTubeAPI() {
  if (!youtubeAPI) {
    youtubeAPI = new YouTubeAPIService();
  }
  return youtubeAPI;
}

export default YouTubeAPIService;

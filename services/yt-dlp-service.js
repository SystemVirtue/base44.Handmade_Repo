/**
 * YouTube yt-dlp Service
 * Handles YouTube video information and extraction using yt-dlp
 * Replaces the YouTube Data API v3 dependency
 */

import youtubeDl from 'youtube-dl-exec';
import YouTubeVideo from '../entities/YouTubeVideo.js';
import YouTubePlaylist from '../entities/YouTubePlaylist.js';

class YtDlpService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.searchCache = new Map();
    this.searchCacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Search for YouTube videos using yt-dlp
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
      console.log(`Searching YouTube with yt-dlp: "${query}"`);

      // Use yt-dlp to search YouTube
      const searchUrl = `ytsearch${maxResults}:${query}`;
      
      const searchResults = await youtubeDl(searchUrl, {
        dumpSingleJson: true,
        noPlaylist: false,
        extractFlat: false,
        skipDownload: true,
        format: 'best[height<=720]', // Limit to 720p for faster extraction
        getTitle: true,
        getDescription: true,
        getThumbnail: true,
        getDuration: true,
        getUploader: true,
        getViewCount: true,
        getUploadDate: true,
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

      // Process results into our video format
      const videos = entries
        .filter(entry => entry && entry.id && entry.title)
        .map(entry => this.createVideoFromYtDlpData(entry))
        .filter(video => video !== null);

      const result = {
        videos,
        nextPageToken: null, // yt-dlp doesn't support pagination like API
        totalResults: videos.length,
        resultsPerPage: videos.length
      };

      // Cache the results
      this.setCachedData(cacheKey, result, this.searchCacheTimeout);
      
      console.log(`Found ${videos.length} videos for query: "${query}"`);
      return result;
    } catch (error) {
      console.error('yt-dlp search failed:', error);
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
      // Handle both video IDs and full URLs
      const videoUrl = videoId.startsWith('http') 
        ? videoId 
        : `https://www.youtube.com/watch?v=${videoId}`;

      console.log(`Getting video details with yt-dlp: ${videoId}`);

      const videoData = await youtubeDl(videoUrl, {
        dumpSingleJson: true,
        skipDownload: true,
        format: 'best[height<=720]',
        getTitle: true,
        getDescription: true,
        getThumbnail: true,
        getDuration: true,
        getUploader: true,
        getViewCount: true,
        getUploadDate: true,
        getUrl: true, // Get direct URL for streaming
      });

      const video = this.createVideoFromYtDlpData(videoData);
      
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
      // Handle both playlist IDs and full URLs
      const playlistUrl = playlistId.startsWith('http')
        ? playlistId
        : `https://www.youtube.com/playlist?list=${playlistId}`;

      console.log(`Getting playlist info with yt-dlp: ${playlistId}`);

      const playlistData = await youtubeDl(playlistUrl, {
        dumpSingleJson: true,
        skipDownload: true,
        extractFlat: false, // Get full video info
        yesPlaylist: true,
        format: 'best[height<=720]',
      });

      // Create playlist object
      const playlist = new YouTubePlaylist({
        id: playlistData.id || playlistId,
        snippet: {
          title: playlistData.title || playlistData.playlist_title || 'Unknown Playlist',
          description: playlistData.description || '',
          channelTitle: playlistData.uploader || playlistData.channel || 'Unknown Channel',
          publishedAt: playlistData.upload_date || null,
          thumbnails: {
            default: { url: playlistData.thumbnail || '' },
            medium: { url: playlistData.thumbnail || '' },
            high: { url: playlistData.thumbnail || '' }
          }
        },
        contentDetails: {
          itemCount: playlistData.entries ? playlistData.entries.length : 0
        }
      });

      // Process videos if available
      if (playlistData.entries) {
        const videos = playlistData.entries
          .filter(entry => entry && entry.id && entry.title)
          .map(entry => this.createVideoFromYtDlpData(entry))
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
      await youtubeDl('--version');
      return {
        ready: true,
        version: 'yt-dlp available'
      };
    } catch (error) {
      return {
        ready: false,
        reason: 'yt-dlp not available or not properly installed',
        error: error.message
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

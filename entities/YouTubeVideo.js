/**
 * YouTube Video Entity
 * Represents a YouTube video with all necessary metadata
 */

export class YouTubeVideo {
  constructor(data = {}) {
    this.id = data.id || null;
    this.videoId = data.videoId || data.id?.videoId || null;
    this.title = data.title || data.snippet?.title || '';
    this.description = data.description || data.snippet?.description || '';
    this.channelTitle = data.channelTitle || data.snippet?.channelTitle || '';
    this.channelId = data.channelId || data.snippet?.channelId || '';
    this.publishedAt = data.publishedAt || data.snippet?.publishedAt || null;
    this.duration = this.parseDuration(data.contentDetails?.duration || data.duration || 0);
    this.viewCount = parseInt(data.statistics?.viewCount || data.viewCount || 0);
    this.likeCount = parseInt(data.statistics?.likeCount || data.likeCount || 0);
    this.thumbnail = this.getBestThumbnail(data.snippet?.thumbnails || data.thumbnails || {});
    this.tags = data.snippet?.tags || data.tags || [];
    this.categoryId = data.snippet?.categoryId || data.categoryId || '';
    this.liveBroadcastContent = data.snippet?.liveBroadcastContent || 'none';
    
    // Additional metadata
    this.addedAt = data.addedAt || new Date().toISOString();
    this.position = data.position || 0;
    this.isPlaying = data.isPlaying || false;
  }

  /**
   * Parse ISO 8601 duration format (PT4M13S) to seconds
   */
  parseDuration(duration) {
    if (typeof duration === 'number') return duration;
    if (!duration || typeof duration !== 'string') return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Get the best available thumbnail
   */
  getBestThumbnail(thumbnails) {
    const priorities = ['maxres', 'standard', 'high', 'medium', 'default'];
    
    for (const quality of priorities) {
      if (thumbnails[quality]) {
        return thumbnails[quality].url;
      }
    }
    
    return 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg'; // Fallback
  }

  /**
   * Format duration for display (MM:SS or HH:MM:SS)
   */
  getFormattedDuration() {
    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format view count for display
   */
  getFormattedViewCount() {
    if (this.viewCount >= 1000000) {
      return `${(this.viewCount / 1000000).toFixed(1)}M views`;
    } else if (this.viewCount >= 1000) {
      return `${(this.viewCount / 1000).toFixed(1)}K views`;
    }
    return `${this.viewCount} views`;
  }

  /**
   * Get YouTube watch URL
   */
  getWatchUrl() {
    return `https://www.youtube.com/watch?v=${this.videoId}`;
  }

  /**
   * Get embed URL for YouTube player
   */
  getEmbedUrl() {
    return `https://www.youtube.com/embed/${this.videoId}`;
  }

  /**
   * Check if video is a music video (category 10)
   */
  isMusicVideo() {
    return this.categoryId === '10';
  }

  /**
   * Check if video is live content
   */
  isLive() {
    return this.liveBroadcastContent === 'live';
  }

  /**
   * Convert to plain object for storage/serialization
   */
  toJSON() {
    return {
      id: this.id,
      videoId: this.videoId,
      title: this.title,
      description: this.description,
      channelTitle: this.channelTitle,
      channelId: this.channelId,
      publishedAt: this.publishedAt,
      duration: this.duration,
      viewCount: this.viewCount,
      likeCount: this.likeCount,
      thumbnail: this.thumbnail,
      tags: this.tags,
      categoryId: this.categoryId,
      liveBroadcastContent: this.liveBroadcastContent,
      addedAt: this.addedAt,
      position: this.position,
      isPlaying: this.isPlaying
    };
  }

  /**
   * Create YouTubeVideo from YouTube API response
   */
  static fromYouTubeAPI(apiResponse) {
    return new YouTubeVideo(apiResponse);
  }

  /**
   * Create YouTubeVideo from stored data
   */
  static fromStoredData(data) {
    return new YouTubeVideo(data);
  }
}

export default YouTubeVideo;

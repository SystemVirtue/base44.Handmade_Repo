/**
 * YouTube Playlist Entity
 * Represents a YouTube playlist with videos and metadata
 */

import YouTubeVideo from './YouTubeVideo.js';

export class YouTubePlaylist {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || data.snippet?.title || '';
    this.description = data.description || data.snippet?.description || '';
    this.channelTitle = data.channelTitle || data.snippet?.channelTitle || '';
    this.channelId = data.channelId || data.snippet?.channelId || '';
    this.publishedAt = data.publishedAt || data.snippet?.publishedAt || null;
    this.thumbnail = this.getBestThumbnail(data.snippet?.thumbnails || data.thumbnails || {});
    this.itemCount = parseInt(data.contentDetails?.itemCount || data.itemCount || 0);
    this.privacy = data.status?.privacyStatus || data.privacy || 'public';
    this.tags = data.snippet?.tags || data.tags || [];
    this.defaultLanguage = data.snippet?.defaultLanguage || 'en';
    
    // Videos in the playlist
    this.videos = (data.videos || []).map(video => 
      video instanceof YouTubeVideo ? video : new YouTubeVideo(video)
    );
    
    // Metadata
    this.addedAt = data.addedAt || new Date().toISOString();
    this.lastUpdated = data.lastUpdated || new Date().toISOString();
    this.isStarred = data.isStarred || false;
    this.totalDuration = this.calculateTotalDuration();
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
   * Calculate total duration of all videos in playlist
   */
  calculateTotalDuration() {
    return this.videos.reduce((total, video) => total + video.duration, 0);
  }

  /**
   * Format total duration for display
   */
  getFormattedTotalDuration() {
    const hours = Math.floor(this.totalDuration / 3600);
    const minutes = Math.floor((this.totalDuration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Add video to playlist
   */
  addVideo(video) {
    const youtubeVideo = video instanceof YouTubeVideo ? video : new YouTubeVideo(video);
    youtubeVideo.position = this.videos.length;
    this.videos.push(youtubeVideo);
    this.itemCount = this.videos.length;
    this.totalDuration = this.calculateTotalDuration();
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Remove video from playlist
   */
  removeVideo(videoId) {
    this.videos = this.videos.filter(video => video.videoId !== videoId);
    // Reorder positions
    this.videos.forEach((video, index) => {
      video.position = index;
    });
    this.itemCount = this.videos.length;
    this.totalDuration = this.calculateTotalDuration();
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Get video by ID
   */
  getVideo(videoId) {
    return this.videos.find(video => video.videoId === videoId);
  }

  /**
   * Get videos filtered by criteria
   */
  getVideos(filter = {}) {
    let filtered = [...this.videos];
    
    if (filter.query) {
      const query = filter.query.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.channelTitle.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query)
      );
    }
    
    if (filter.minDuration) {
      filtered = filtered.filter(video => video.duration >= filter.minDuration);
    }
    
    if (filter.maxDuration) {
      filtered = filtered.filter(video => video.duration <= filter.maxDuration);
    }
    
    if (filter.musicOnly) {
      filtered = filtered.filter(video => video.isMusicVideo());
    }
    
    return filtered;
  }

  /**
   * Shuffle playlist videos
   */
  shuffle() {
    const shuffled = [...this.videos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Update positions
    shuffled.forEach((video, index) => {
      video.position = index;
    });
    this.videos = shuffled;
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Sort playlist videos
   */
  sort(criteria = 'position') {
    switch (criteria) {
      case 'title':
        this.videos.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'duration':
        this.videos.sort((a, b) => a.duration - b.duration);
        break;
      case 'publishedAt':
        this.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        break;
      case 'viewCount':
        this.videos.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'channel':
        this.videos.sort((a, b) => a.channelTitle.localeCompare(b.channelTitle));
        break;
      default:
        this.videos.sort((a, b) => a.position - b.position);
    }
    
    // Update positions after sorting
    this.videos.forEach((video, index) => {
      video.position = index;
    });
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Get YouTube playlist URL
   */
  getPlaylistUrl() {
    return `https://www.youtube.com/playlist?list=${this.id}`;
  }

  /**
   * Check if playlist is public
   */
  isPublic() {
    return this.privacy === 'public';
  }

  /**
   * Convert to plain object for storage/serialization
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      channelTitle: this.channelTitle,
      channelId: this.channelId,
      publishedAt: this.publishedAt,
      thumbnail: this.thumbnail,
      itemCount: this.itemCount,
      privacy: this.privacy,
      tags: this.tags,
      defaultLanguage: this.defaultLanguage,
      videos: this.videos.map(video => video.toJSON()),
      addedAt: this.addedAt,
      lastUpdated: this.lastUpdated,
      isStarred: this.isStarred,
      totalDuration: this.totalDuration
    };
  }

  /**
   * Create YouTubePlaylist from YouTube API response
   */
  static fromYouTubeAPI(apiResponse, videos = []) {
    const playlist = new YouTubePlaylist(apiResponse);
    videos.forEach(video => playlist.addVideo(video));
    return playlist;
  }

  /**
   * Create YouTubePlaylist from stored data
   */
  static fromStoredData(data) {
    return new YouTubePlaylist(data);
  }
}

export default YouTubePlaylist;

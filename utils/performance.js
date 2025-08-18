/**
 * Performance Optimization Utilities
 * Provides caching, debouncing, and optimization helpers for the YouTube Music Video Player
 */

/**
 * Image lazy loading and caching
 */
export class ImageCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.loadPromises = new Map();
  }

  async loadImage(url) {
    if (!url) return null;

    // Return cached image if available
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Return existing promise if image is being loaded
    if (this.loadPromises.has(url)) {
      return this.loadPromises.get(url);
    }

    // Create new loading promise
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Add to cache
        this.addToCache(url, img);
        this.loadPromises.delete(url);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });

    this.loadPromises.set(url, loadPromise);
    return loadPromise;
  }

  addToCache(url, image) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(url, image);
  }

  clear() {
    this.cache.clear();
    this.loadPromises.clear();
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      loadingCount: this.loadPromises.size,
      maxSize: this.maxSize
    };
  }
}

/**
 * Global image cache instance
 */
export const imageCache = new ImageCache(200);

/**
 * Debounce function for API calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Virtual scrolling helper for large lists
 */
export class VirtualScrollHelper {
  constructor(containerHeight, itemHeight, buffer = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
  }

  getVisibleRange(scrollTop, totalItems) {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + this.buffer * 2);
    
    return {
      startIndex,
      endIndex,
      visibleCount
    };
  }

  getTotalHeight(totalItems) {
    return totalItems * this.itemHeight;
  }

  getOffsetTop(index) {
    return index * this.itemHeight;
  }
}

/**
 * Memory-efficient queue for large video lists
 */
export class OptimizedQueue {
  constructor(maxSize = 1000) {
    this.items = [];
    this.maxSize = maxSize;
    this.index = new Map(); // For O(1) lookups
  }

  add(item) {
    // Remove oldest items if queue is full
    while (this.items.length >= this.maxSize) {
      const removed = this.items.shift();
      this.index.delete(removed.id);
    }

    this.items.push(item);
    this.index.set(item.id, this.items.length - 1);
  }

  remove(id) {
    const indexPos = this.index.get(id);
    if (indexPos !== undefined) {
      this.items.splice(indexPos, 1);
      this.index.delete(id);
      
      // Update indices for remaining items
      for (let i = indexPos; i < this.items.length; i++) {
        this.index.set(this.items[i].id, i);
      }
    }
  }

  get(id) {
    const indexPos = this.index.get(id);
    return indexPos !== undefined ? this.items[indexPos] : null;
  }

  getAll() {
    return [...this.items];
  }

  clear() {
    this.items = [];
    this.index.clear();
  }

  size() {
    return this.items.length;
  }
}

/**
 * Request rate limiter for API calls
 */
export class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async canMakeRequest() {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    return this.requests.length < this.maxRequests;
  }

  async waitForSlot() {
    while (!await this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.requests.push(Date.now());
  }

  getStats() {
    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequests,
      timeWindow: this.timeWindow
    };
  }
}

/**
 * Preloader for video metadata
 */
export class VideoPreloader {
  constructor(batchSize = 10) {
    this.batchSize = batchSize;
    this.cache = new Map();
    this.loading = new Set();
  }

  async preloadVideoMetadata(videoIds, apiService) {
    const uncachedIds = videoIds.filter(id => 
      !this.cache.has(id) && !this.loading.has(id)
    );

    if (uncachedIds.length === 0) return;

    // Process in batches
    for (let i = 0; i < uncachedIds.length; i += this.batchSize) {
      const batch = uncachedIds.slice(i, i + this.batchSize);
      
      // Mark as loading
      batch.forEach(id => this.loading.add(id));
      
      try {
        const videos = await apiService.getVideoDetails(batch.join(','));
        
        videos.forEach(video => {
          this.cache.set(video.id, video);
          this.loading.delete(video.id);
        });
      } catch (error) {
        console.error('Failed to preload video metadata:', error);
        batch.forEach(id => this.loading.delete(id));
      }
    }
  }

  getCachedVideo(id) {
    return this.cache.get(id);
  }

  isLoading(id) {
    return this.loading.has(id);
  }

  clear() {
    this.cache.clear();
    this.loading.clear();
  }

  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size
    };
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      loadTimes: [],
      errors: 0
    };
    this.startTime = Date.now();
  }

  recordApiCall() {
    this.metrics.apiCalls++;
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  recordLoadTime(duration) {
    this.metrics.loadTimes.push(duration);
    
    // Keep only last 100 measurements
    if (this.metrics.loadTimes.length > 100) {
      this.metrics.loadTimes = this.metrics.loadTimes.slice(-100);
    }
  }

  recordError() {
    this.metrics.errors++;
  }

  getStats() {
    const avgLoadTime = this.metrics.loadTimes.length > 0
      ? this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length
      : 0;
      
    const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
      : 0;

    return {
      uptime: Date.now() - this.startTime,
      apiCalls: this.metrics.apiCalls,
      cacheHitRate: Math.round(cacheHitRate),
      avgLoadTime: Math.round(avgLoadTime),
      errors: this.metrics.errors,
      ...this.metrics
    };
  }

  reset() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      loadTimes: [],
      errors: 0
    };
    this.startTime = Date.now();
  }
}

// Global instances
export const globalPerformanceMonitor = new PerformanceMonitor();
export const globalRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const videoPreloader = new VideoPreloader(20);

/**
 * Utility to optimize React re-renders
 */
export const memoize = (fn, keyFn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
};

/**
 * Cleanup utility for components
 */
export class ComponentCleanup {
  constructor() {
    this.cleanupFunctions = [];
  }

  add(cleanupFn) {
    this.cleanupFunctions.push(cleanupFn);
  }

  cleanup() {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    this.cleanupFunctions = [];
  }
}

export default {
  ImageCache,
  imageCache,
  debounce,
  throttle,
  VirtualScrollHelper,
  OptimizedQueue,
  RateLimiter,
  VideoPreloader,
  PerformanceMonitor,
  globalPerformanceMonitor,
  globalRateLimiter,
  videoPreloader,
  memoize,
  ComponentCleanup
};

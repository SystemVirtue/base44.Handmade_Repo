/**
 * Album Artwork Management Utility
 * Handles dynamic artwork loading, caching, and fallback systems
 */

// Default artwork fallback URLs
const DEFAULT_ARTWORK = {
  small:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center",
  medium:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
  large:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center",
};

// Artwork cache to avoid repeated requests
const artworkCache = new Map();

/**
 * Generate artwork URL from track metadata
 * @param {Object} track - Track object with metadata
 * @param {string} size - Artwork size ('small', 'medium', 'large')
 * @returns {string} Artwork URL
 */
export const getArtworkUrl = (track, size = "medium") => {
  if (!track) return DEFAULT_ARTWORK[size];

  // If track already has a thumbnail, use it
  if (track.thumbnail) {
    return track.thumbnail;
  }

  // Try to get from cache first
  const cacheKey = `${track.artist}-${track.album}-${size}`;
  if (artworkCache.has(cacheKey)) {
    return artworkCache.get(cacheKey);
  }

  // Generate artwork URL based on track metadata
  let artworkUrl = DEFAULT_ARTWORK[size];

  // If we have artist and album info, try to generate a more specific image
  if (track.artist && track.album) {
    // Use a variety of music-related stock photos based on hash of metadata
    const hash = hashString(`${track.artist}${track.album}${track.title}`);
    const imageIndex = hash % MUSIC_STOCK_PHOTOS.length;
    artworkUrl = MUSIC_STOCK_PHOTOS[imageIndex][size];
  }

  // Cache the result
  artworkCache.set(cacheKey, artworkUrl);
  return artworkUrl;
};

/**
 * Preload artwork for better performance
 * @param {string} url - Artwork URL to preload
 * @returns {Promise} Promise that resolves when image is loaded
 */
export const preloadArtwork = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load artwork: ${url}`));
    img.src = url;
  });
};

/**
 * Get multiple artwork URLs for a track (small, medium, large)
 * @param {Object} track - Track object
 * @returns {Object} Object with small, medium, large artwork URLs
 */
export const getArtworkSizes = (track) => {
  return {
    small: getArtworkUrl(track, "small"),
    medium: getArtworkUrl(track, "medium"),
    large: getArtworkUrl(track, "large"),
  };
};

/**
 * React hook for managing artwork loading state
 * @param {Object} track - Track object
 * @param {string} size - Artwork size
 * @returns {Object} { artworkUrl, isLoading, hasError }
 */
export const useArtwork = (track, size = "medium") => {
  const [state, setState] = React.useState({
    artworkUrl: getArtworkUrl(track, size),
    isLoading: false,
    hasError: false,
  });

  React.useEffect(() => {
    if (!track) return;

    const artworkUrl = getArtworkUrl(track, size);
    setState((prev) => ({ ...prev, isLoading: true, hasError: false }));

    preloadArtwork(artworkUrl)
      .then((url) => {
        setState({
          artworkUrl: url,
          isLoading: false,
          hasError: false,
        });
      })
      .catch(() => {
        setState({
          artworkUrl: DEFAULT_ARTWORK[size],
          isLoading: false,
          hasError: true,
        });
      });
  }, [track?.id, track?.artist, track?.album, track?.title, size]);

  return state;
};

/**
 * Clear artwork cache
 */
export const clearArtworkCache = () => {
  artworkCache.clear();
};

/**
 * Simple hash function for generating consistent image selection
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Curated collection of music-related stock photos
const MUSIC_STOCK_PHOTOS = [
  {
    small:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center",
    medium:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
    large:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center",
  },
  {
    small:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop&crop=center",
    medium:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop&crop=center",
    large:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop&crop=center",
  },
  {
    small:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop&crop=center",
    medium:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=center",
    large:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop&crop=center",
  },
  {
    small:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center",
    medium:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
    large:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center",
  },
  {
    small:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop&crop=center",
    medium:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop&crop=center",
    large:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop&crop=center",
  },
  {
    small:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop&crop=center",
    medium:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop&crop=center",
    large:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop&crop=center",
  },
];

export default {
  getArtworkUrl,
  preloadArtwork,
  getArtworkSizes,
  useArtwork,
  clearArtworkCache,
};

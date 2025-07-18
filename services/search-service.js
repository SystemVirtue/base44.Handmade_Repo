/**
 * Multi-Source Music Search Service
 * Handles search across Spotify, YouTube, Local Library, and other sources
 */

// Mock data for different music sources
const MOCK_SPOTIFY_TRACKS = [
  {
    id: "spotify_1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: 355,
    genre: "Rock",
    year: 1975,
    popularity: 95,
    explicit: false,
    source: "spotify",
    thumbnail:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    preview_url: "https://sample-preview.com/bohemian-rhapsody",
    external_url: "https://open.spotify.com/track/example",
    isrc: "GBUM71505078",
  },
  {
    id: "spotify_2",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    duration: 391,
    genre: "Rock",
    year: 1976,
    popularity: 88,
    explicit: false,
    source: "spotify",
    thumbnail:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    preview_url: "https://sample-preview.com/hotel-california",
    external_url: "https://open.spotify.com/track/example2",
    isrc: "USEE17600506",
  },
  {
    id: "spotify_3",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    duration: 294,
    genre: "Pop",
    year: 1982,
    popularity: 92,
    explicit: false,
    source: "spotify",
    thumbnail:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    preview_url: "https://sample-preview.com/billie-jean",
    external_url: "https://open.spotify.com/track/example3",
    isrc: "USSM18200663",
  },
];

const MOCK_YOUTUBE_TRACKS = [
  {
    id: "youtube_1",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    duration: 356,
    genre: "Rock",
    year: 1987,
    views: 1200000000,
    source: "youtube",
    thumbnail:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
    video_url: "https://youtube.com/watch?v=example",
    channel: "GunsNRosesVEVO",
    video_id: "o1tj2zJ2Wvg",
  },
  {
    id: "youtube_2",
    title: "Dancing Queen",
    artist: "ABBA",
    album: "Arrival",
    duration: 230,
    genre: "Pop",
    year: 1976,
    views: 650000000,
    source: "youtube",
    thumbnail:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    video_url: "https://youtube.com/watch?v=example2",
    channel: "AbbaVEVO",
    video_id: "xFrGuyw1V8s",
  },
];

const MOCK_LOCAL_TRACKS = [
  {
    id: "local_1",
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    duration: 482,
    genre: "Rock",
    year: 1971,
    bitrate: 320,
    file_format: "FLAC",
    file_size: "45.2 MB",
    source: "local",
    thumbnail:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    file_path:
      "/music/Led Zeppelin/Led Zeppelin IV/04 - Stairway to Heaven.flac",
    date_added: "2024-01-10T14:30:00Z",
  },
  {
    id: "local_2",
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    duration: 183,
    genre: "Rock",
    year: 1971,
    bitrate: 320,
    file_format: "MP3",
    file_size: "7.3 MB",
    source: "local",
    thumbnail:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    file_path: "/music/John Lennon/Imagine/02 - Imagine.mp3",
    date_added: "2024-01-12T09:15:00Z",
  },
];

/**
 * Search configuration for different sources
 */
const SEARCH_SOURCES = {
  spotify: {
    name: "Spotify",
    color: "#1DB954",
    icon: "🎵",
    searchFunction: searchSpotify,
    enabled: true,
  },
  youtube: {
    name: "YouTube",
    color: "#FF0000",
    icon: "📹",
    searchFunction: searchYouTube,
    enabled: true,
  },
  local: {
    name: "Local Library",
    color: "#6366F1",
    icon: "💿",
    searchFunction: searchLocal,
    enabled: true,
  },
  soundcloud: {
    name: "SoundCloud",
    color: "#FF5500",
    icon: "☁️",
    searchFunction: searchSoundCloud,
    enabled: false, // Not implemented yet
  },
};

/**
 * Spotify search simulation
 */
async function searchSpotify(query, filters = {}) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  let results = [...MOCK_SPOTIFY_TRACKS];

  // Filter by query
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (track) =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery) ||
        track.album.toLowerCase().includes(lowerQuery),
    );
  }

  // Apply filters
  if (filters.genre && filters.genre !== "all") {
    results = results.filter(
      (track) => track.genre.toLowerCase() === filters.genre.toLowerCase(),
    );
  }

  if (filters.year && filters.year !== "any") {
    results = applyYearFilter(results, filters.year);
  }

  // Generate additional results based on query for demo purposes
  if (query && results.length < 3) {
    const additionalResults = generateSpotifyResults(query, 5 - results.length);
    results = [...results, ...additionalResults];
  }

  return results.map((track) => ({
    ...track,
    relevance_score: calculateRelevanceScore(track, query),
  }));
}

/**
 * YouTube search simulation
 */
async function searchYouTube(query, filters = {}) {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  let results = [...MOCK_YOUTUBE_TRACKS];

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (track) =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery) ||
        track.channel.toLowerCase().includes(lowerQuery),
    );
  }

  if (filters.genre && filters.genre !== "all") {
    results = results.filter(
      (track) => track.genre.toLowerCase() === filters.genre.toLowerCase(),
    );
  }

  if (filters.year && filters.year !== "any") {
    results = applyYearFilter(results, filters.year);
  }

  // Generate additional YouTube results
  if (query && results.length < 3) {
    const additionalResults = generateYouTubeResults(query, 4 - results.length);
    results = [...results, ...additionalResults];
  }

  return results.map((track) => ({
    ...track,
    relevance_score: calculateRelevanceScore(track, query),
  }));
}

/**
 * Local library search simulation
 */
async function searchLocal(query, filters = {}) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = [...MOCK_LOCAL_TRACKS];

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (track) =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery) ||
        track.album.toLowerCase().includes(lowerQuery),
    );
  }

  if (filters.genre && filters.genre !== "all") {
    results = results.filter(
      (track) => track.genre.toLowerCase() === filters.genre.toLowerCase(),
    );
  }

  if (filters.year && filters.year !== "any") {
    results = applyYearFilter(results, filters.year);
  }

  return results.map((track) => ({
    ...track,
    relevance_score: calculateRelevanceScore(track, query),
  }));
}

/**
 * SoundCloud search placeholder
 */
async function searchSoundCloud(query, filters = {}) {
  // Placeholder for future implementation
  return [];
}

/**
 * Generate mock Spotify results for demo
 */
function generateSpotifyResults(query, count) {
  const results = [];
  const genres = ["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Classical"];
  const images = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
  ];

  for (let i = 0; i < count; i++) {
    results.push({
      id: `spotify_generated_${Date.now()}_${i}`,
      title: `${query} Track ${i + 1}`,
      artist: `Artist ${String.fromCharCode(65 + i)}`,
      album: `Album ${i + 1}`,
      duration: Math.floor(Math.random() * 240) + 120, // 2-6 minutes
      genre: genres[Math.floor(Math.random() * genres.length)],
      year: Math.floor(Math.random() * 30) + 1994, // 1994-2024
      popularity: Math.floor(Math.random() * 100),
      explicit: Math.random() > 0.8,
      source: "spotify",
      thumbnail: images[Math.floor(Math.random() * images.length)],
      preview_url: `https://sample-preview.com/${query.toLowerCase()}-${i}`,
      external_url: `https://open.spotify.com/track/generated_${i}`,
      isrc: `US${String.fromCharCode(65 + i)}${String(Date.now()).slice(-8)}`,
    });
  }

  return results;
}

/**
 * Generate mock YouTube results
 */
function generateYouTubeResults(query, count) {
  const results = [];
  const channels = [
    "MusicVEVO",
    "OfficialChannel",
    "RecordLabel",
    "ArtistOfficial",
  ];
  const images = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
  ];

  for (let i = 0; i < count; i++) {
    results.push({
      id: `youtube_generated_${Date.now()}_${i}`,
      title: `${query} Video ${i + 1}`,
      artist: `Creator ${String.fromCharCode(65 + i)}`,
      album: "YouTube Video",
      duration: Math.floor(Math.random() * 300) + 120,
      genre: "Various",
      year: Math.floor(Math.random() * 10) + 2015, // 2015-2024
      views: Math.floor(Math.random() * 10000000),
      source: "youtube",
      thumbnail: images[Math.floor(Math.random() * images.length)],
      video_url: `https://youtube.com/watch?v=generated_${i}`,
      channel: channels[Math.floor(Math.random() * channels.length)],
      video_id: `gen_${Date.now()}_${i}`,
    });
  }

  return results;
}

/**
 * Apply year filter to results
 */
function applyYearFilter(results, yearFilter) {
  switch (yearFilter) {
    case "2024":
      return results.filter((track) => track.year === 2024);
    case "2023":
      return results.filter((track) => track.year === 2023);
    case "2020s":
      return results.filter(
        (track) => track.year >= 2020 && track.year <= 2029,
      );
    case "2010s":
      return results.filter(
        (track) => track.year >= 2010 && track.year <= 2019,
      );
    case "2000s":
      return results.filter(
        (track) => track.year >= 2000 && track.year <= 2009,
      );
    case "1990s":
      return results.filter(
        (track) => track.year >= 1990 && track.year <= 1999,
      );
    case "pre-1990":
      return results.filter((track) => track.year < 1990);
    default:
      return results;
  }
}

/**
 * Calculate relevance score for search ranking
 */
function calculateRelevanceScore(track, query) {
  if (!query) return 0.5;

  const lowerQuery = query.toLowerCase();
  const titleMatch = track.title.toLowerCase().includes(lowerQuery);
  const artistMatch = track.artist.toLowerCase().includes(lowerQuery);
  const albumMatch = track.album?.toLowerCase().includes(lowerQuery);

  let score = 0;

  if (titleMatch) score += 0.6;
  if (artistMatch) score += 0.3;
  if (albumMatch) score += 0.1;

  // Boost score based on source popularity/quality
  if (track.source === "spotify" && track.popularity) {
    score += (track.popularity / 100) * 0.2;
  }

  if (track.source === "youtube" && track.views) {
    score += Math.min(track.views / 100000000, 1) * 0.1; // Max 0.1 boost for 100M+ views
  }

  if (track.source === "local") {
    score += 0.15; // Boost local tracks slightly
  }

  return Math.min(score, 1);
}

/**
 * Main search function - searches across all enabled sources
 */
export async function performMultiSourceSearch(
  query,
  filters = {},
  enabledSources = ["all"],
) {
  const searchPromises = [];
  const searchResults = {
    query,
    timestamp: new Date().toISOString(),
    total_results: 0,
    sources: {},
    combined_results: [],
    search_time_ms: 0,
  };

  const startTime = Date.now();

  // Determine which sources to search
  const sourcesToSearch = enabledSources.includes("all")
    ? Object.keys(SEARCH_SOURCES).filter(
        (source) => SEARCH_SOURCES[source].enabled,
      )
    : enabledSources.filter((source) => SEARCH_SOURCES[source]?.enabled);

  // Execute searches in parallel
  sourcesToSearch.forEach((sourceKey) => {
    const source = SEARCH_SOURCES[sourceKey];
    if (source && source.searchFunction) {
      searchPromises.push(
        source
          .searchFunction(query, filters)
          .then((results) => ({ source: sourceKey, results }))
          .catch((error) => ({ source: sourceKey, results: [], error })),
      );
    }
  });

  // Wait for all searches to complete
  const searchResponsesArray = await Promise.all(searchPromises);

  // Process results
  searchResponsesArray.forEach(({ source, results, error }) => {
    if (error) {
      searchResults.sources[source] = {
        count: 0,
        results: [],
        error: error.message,
      };
    } else {
      searchResults.sources[source] = {
        count: results.length,
        results,
      };
      searchResults.combined_results.push(...results);
    }
  });

  // Sort combined results by relevance
  searchResults.combined_results.sort(
    (a, b) => (b.relevance_score || 0) - (a.relevance_score || 0),
  );

  searchResults.total_results = searchResults.combined_results.length;
  searchResults.search_time_ms = Date.now() - startTime;

  return searchResults;
}

/**
 * Get available search sources
 */
export function getAvailableSearchSources() {
  return Object.entries(SEARCH_SOURCES).map(([key, source]) => ({
    id: key,
    name: source.name,
    color: source.color,
    icon: source.icon,
    enabled: source.enabled,
  }));
}

/**
 * Search suggestions based on query
 */
export async function getSearchSuggestions(query) {
  // Simple mock suggestions - in real app would use search APIs
  const suggestions = [
    `${query} acoustic`,
    `${query} remix`,
    `${query} live`,
    `${query} cover`,
    `best ${query} songs`,
  ].filter((suggestion) => suggestion !== query);

  return suggestions.slice(0, 5);
}

export default {
  performMultiSourceSearch,
  getAvailableSearchSources,
  getSearchSuggestions,
  SEARCH_SOURCES,
};

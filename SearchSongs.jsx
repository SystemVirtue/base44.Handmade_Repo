import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Search,
  Filter,
  Play,
  Plus,
  Heart,
  ExternalLink,
  Loader2,
  X,
  Download,
  Share,
  Clock,
  TrendingUp,
  Music,
  Video,
  Disc,
  Settings,
  BarChart3,
  Eye,
  Star,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Shuffle,
  RotateCcw,
  Grid,
  List,
  Sliders,
  History,
  BookmarkPlus,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  useSearchStore,
  useAudioStore,
  useUIStore,
  formatTime,
} from "./store.js";
import ArtworkImage from "./components/ui/artwork-image.jsx";
import TrackOptionsMenu from "./components/ui/track-options-menu.jsx";
import apiService from "./services/api-service.js";
import persistenceService from "./services/persistence-service.js";
import { getYouTubeAPI } from "./services/youtube-api.js";
import YouTubeVideo from "./entities/YouTubeVideo.js";

// Debounce utility
function debounce(func, wait) {
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

export default function SearchSongs() {
  const [localQuery, setLocalQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedResults, setSelectedResults] = useState(new Set());
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("list");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Advanced filters
  const [filters, setFilters] = useState({
    genre: "",
    artist: "",
    year: "",
    duration: "",
    bitrate: "",
    popularity: "",
  });

  const searchInputRef = useRef(null);

  // Store state
  const { addToQueue, toggleFavorite, isFavorite, hasVoted, voteForTrack } =
    useAudioStore();
  const { addNotification } = useUIStore();

  // Load recent searches and check API keys on mount
  useEffect(() => {
    const recent = persistenceService.getRecentSearches();
    setRecentSearches(recent);

    // Check if YouTube API keys are configured
    const checkApiKeys = async () => {
      try {
        const youtubeAPI = getYouTubeAPI();
        const apiKeyManager = youtubeAPI.apiKeyManager;

        if (!apiKeyManager.isReady()) {
          // Show helpful initial message if no API keys
          setSearchResults([{
            id: 'setup-guide',
            videoId: 'setup-guide',
            title: '🚀 Welcome to YouTube Video Search!',
            channelTitle: 'Setup Required',
            duration: 0,
            thumbnail: 'https://via.placeholder.com/320x180/10b981/ffffff?text=Setup+Required',
            viewCount: 0,
            description: 'To search and play YouTube videos, please add YouTube Data API v3 keys in Settings → API Keys.',
            isSystemMessage: true
          }]);
          setTotalResults(1);
        }
      } catch (error) {
        console.error('Error checking API keys:', error);
      }
    };

    checkApiKeys();
  }, []);

  // Enhanced search function
  const performSearch = useCallback(
    async (searchQuery, searchFilters = {}, page = 1) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setTotalResults(0);
        return;
      }

      setIsSearching(true);
      try {
        const youtubeAPI = getYouTubeAPI();

        // Build search options
        const searchOptions = {
          maxResults: 25,
          order: sortBy === 'relevance' ? 'relevance' :
                 sortBy === 'viewCount' ? 'viewCount' :
                 sortBy === 'date' ? 'date' : 'relevance',
          videoCategoryId: '10', // Music category
          type: 'video',
          videoDefinition: filters.quality === 'hd' ? 'high' : 'any',
          videoDuration: filters.duration === 'short' ? 'short' :
                        filters.duration === 'medium' ? 'medium' :
                        filters.duration === 'long' ? 'long' : 'any'
        };

        if (nextPageToken && page > 1) {
          searchOptions.pageToken = nextPageToken;
        }

        const response = await youtubeAPI.searchVideos(searchQuery, searchOptions);

        if (response && response.videos) {
          const videos = response.videos.map(video => ({
            id: video.videoId,
            videoId: video.videoId,
            title: video.title,
            artist: video.channelTitle,
            channelTitle: video.channelTitle,
            duration: video.duration,
            thumbnail: video.thumbnail,
            viewCount: video.viewCount,
            publishedAt: video.publishedAt,
            description: video.description,
            tags: video.tags || [],
            year: video.publishedAt ? new Date(video.publishedAt).getFullYear() : null,
            popularity: video.viewCount || 0
          }));

          // Sort results
          const sortedResults = sortResults(videos, sortBy);

          if (page === 1) {
            setSearchResults(sortedResults);
            // Add to recent searches
            persistenceService.addRecentSearch(searchQuery);
            const updatedRecent = persistenceService.getRecentSearches();
            setRecentSearches(updatedRecent);
          } else {
            // Append for pagination
            setSearchResults((prev) => [...prev, ...sortedResults]);
          }

          setTotalResults(response.totalResults || videos.length);
          setCurrentPage(page);
          setNextPageToken(response.nextPageToken);
        }
      } catch (error) {
        console.error("YouTube search failed:", error);

        if (error.message.includes('API keys')) {
          // Show more helpful guidance for missing API keys
          addNotification({
            type: "warning",
            message: "YouTube API not configured. Please add API keys in Settings to enable video search.",
            duration: 8000,
          });

          // Set a helpful message in search results
          setSearchResults([{
            id: 'no-api-key',
            videoId: 'no-api-key',
            title: '🔑 YouTube API Key Required',
            channelTitle: 'System Message',
            duration: 0,
            thumbnail: 'https://via.placeholder.com/320x180/3b82f6/ffffff?text=YouTube+API+Required',
            viewCount: 0,
            description: 'Add YouTube Data API v3 keys in Settings → API Keys to enable video search and playback.',
            isSystemMessage: true
          }]);
          setTotalResults(1);
        } else {
          addNotification({
            type: "error",
            message: "Search failed. Please try again.",
            duration: 3000,
          });
        }
      } finally {
        setIsSearching(false);
      }
    },
    [filters, sortBy, addNotification, nextPageToken],
  );

  // Search suggestions
  const getSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // For now, generate suggestions from recent searches and common terms
      const recent = persistenceService.getRecentSearches();
      const matchingRecent = recent.filter((search) =>
        search.toLowerCase().includes(query.toLowerCase()),
      );

      // Add some smart suggestions based on query
      const smartSuggestions = generateSmartSuggestions(query);

      const allSuggestions = [
        ...matchingRecent.slice(0, 3),
        ...smartSuggestions.slice(0, 5),
      ].slice(0, 8);

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    }
  }, []);

  // Generate smart suggestions
  const generateSmartSuggestions = (query) => {
    const commonGenres = [
      "rock",
      "pop",
      "jazz",
      "blues",
      "electronic",
      "hip hop",
      "classical",
    ];
    const commonArtists = [
      "Beatles",
      "Queen",
      "Led Zeppelin",
      "Pink Floyd",
      "Bob Dylan",
    ];

    const suggestions = [];

    // Genre suggestions
    commonGenres.forEach((genre) => {
      if (
        genre.toLowerCase().includes(query.toLowerCase()) &&
        !suggestions.includes(genre)
      ) {
        suggestions.push(genre);
      }
    });

    // Artist suggestions
    commonArtists.forEach((artist) => {
      if (
        artist.toLowerCase().includes(query.toLowerCase()) &&
        !suggestions.includes(artist)
      ) {
        suggestions.push(artist);
      }
    });

    return suggestions;
  };

  // Sort results
  const sortResults = (results, criteria) => {
    const sorted = [...results];

    switch (criteria) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "artist":
      case "channelTitle":
        return sorted.sort((a, b) => (a.channelTitle || a.artist).localeCompare(b.channelTitle || b.artist));
      case "duration":
        return sorted.sort((a, b) => a.duration - b.duration);
      case "year":
      case "date":
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      case "viewCount":
      case "popularity":
        return sorted.sort((a, b) => (b.viewCount || b.popularity || 0) - (a.viewCount || a.popularity || 0));
      case "relevance":
      default:
        return sorted; // YouTube API returns results in relevance order by default
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      performSearch(searchQuery);
    }, 300),
    [performSearch],
  );

  // Debounced suggestions
  const debouncedSuggestions = useCallback(
    debounce((searchQuery) => {
      getSuggestions(searchQuery);
    }, 200),
    [getSuggestions],
  );

  // Handle search input changes
  const handleSearchChange = (value) => {
    setLocalQuery(value);
    setShowSuggestions(true);
    if (value.trim()) {
      debouncedSearch(value);
      debouncedSuggestions(value);
    } else {
      setSearchResults([]);
      setSuggestions([]);
      setTotalResults(0);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    if (localQuery.trim()) {
      performSearch(localQuery, newFilters);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      genre: "",
      artist: "",
      year: "",
      duration: "",
      bitrate: "",
      popularity: "",
    });
    if (localQuery.trim()) {
      performSearch(localQuery, {});
    }
  };

  // Handle track preview
  const handlePreview = (track) => {
    if (playingPreview === track.id) {
      // Stop preview
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
        setPlayingPreview(null);
      }
      return;
    }

    // Stop previous preview
    if (previewAudio) {
      previewAudio.pause();
    }

    // Start new preview (simulate with timeout for demo)
    setPlayingPreview(track.id);

    // In real implementation, you would play actual audio
    setTimeout(() => {
      setPlayingPreview(null);
    }, 30000); // 30 second preview
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedResults.size === searchResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(searchResults.map((track) => track.id)));
    }
  };

  const handleBulkAddToQueue = () => {
    const selectedTracks = searchResults.filter((track) =>
      selectedResults.has(track.id),
    );
    selectedTracks.forEach((track) => addToQueue(track));
    setSelectedResults(new Set());
    addNotification({
      type: "success",
      message: `Added ${selectedTracks.length} tracks to queue`,
      duration: 3000,
    });
  };

  // Load more results (pagination)
  const loadMoreResults = () => {
    if (localQuery.trim() && !isSearching) {
      performSearch(localQuery, filters, currentPage + 1);
    }
  };

  // Filter active state
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value !== "");
  }, [filters]);

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Search Songs</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Search Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <div className="flex items-center bg-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-blue-600" : "hover:bg-gray-600"}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-blue-600" : "hover:bg-gray-600"}`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={localQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search for songs, artists, albums..."
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              {localQuery && (
                <button
                  onClick={() => {
                    setLocalQuery("");
                    setSearchResults([]);
                    setSuggestions([]);
                    setTotalResults(0);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions &&
              (suggestions.length > 0 || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {recentSearches.length > 0 && (
                    <div className="p-3 border-b border-gray-600">
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <History className="w-4 h-4" />
                        Recent Searches
                      </div>
                      {recentSearches.slice(0, 3).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="block w-full text-left px-2 py-1 hover:bg-gray-600 rounded text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  )}

                  {suggestions.length > 0 && (
                    <div className="p-3">
                      <div className="text-sm text-gray-400 mb-2">
                        Suggestions
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-2 py-1 hover:bg-gray-600 rounded text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <Sliders className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="text-xs bg-white text-blue-600 rounded-full px-2">
                  ON
                </span>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="title">Sort by Title</option>
              <option value="artist">Sort by Artist</option>
              <option value="year">Sort by Year</option>
              <option value="duration">Sort by Duration</option>
              <option value="popularity">Sort by Popularity</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-750 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">All Genres</option>
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="jazz">Jazz</option>
                  <option value="blues">Blues</option>
                  <option value="electronic">Electronic</option>
                  <option value="hip hop">Hip Hop</option>
                  <option value="classical">Classical</option>
                  <option value="country">Country</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Artist
                </label>
                <input
                  type="text"
                  value={filters.artist}
                  onChange={(e) => handleFilterChange("artist", e.target.value)}
                  placeholder="Artist name..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Year Range
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">All Years</option>
                  <option value="2020s">2020s</option>
                  <option value="2010s">2010s</option>
                  <option value="2000s">2000s</option>
                  <option value="1990s">1990s</option>
                  <option value="1980s">1980s</option>
                  <option value="1970s">1970s</option>
                  <option value="1960s">1960s</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duration
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) =>
                    handleFilterChange("duration", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">Any Duration</option>
                  <option value="short">Short (&lt; 3 min)</option>
                  <option value="medium">Medium (3-5 min)</option>
                  <option value="long">Long (&gt; 5 min)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Quality
                </label>
                <select
                  value={filters.bitrate}
                  onChange={(e) =>
                    handleFilterChange("bitrate", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">Any Quality</option>
                  <option value="320">320 kbps</option>
                  <option value="256">256 kbps</option>
                  <option value="192">192 kbps</option>
                  <option value="128">128 kbps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Popularity
                </label>
                <select
                  value={filters.popularity}
                  onChange={(e) =>
                    handleFilterChange("popularity", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">Any Popularity</option>
                  <option value="high">High (&gt; 80)</option>
                  <option value="medium">Medium (40-80)</option>
                  <option value="low">Low (&lt; 40)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-400">Searching...</span>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {totalResults.toLocaleString()} Results
                  {localQuery && (
                    <span className="text-gray-400 ml-2">
                      for "{localQuery}"
                    </span>
                  )}
                </h2>

                {selectedResults.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {selectedResults.size} selected
                    </span>
                    <button
                      onClick={handleBulkAddToQueue}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      Add to Queue
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {selectedResults.size === searchResults.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
            </div>

            {/* Results List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "space-y-2"
              }
            >
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  className={`${
                    track.isSystemMessage
                      ? "bg-blue-900/20 border border-blue-600/30 rounded-lg p-4"
                      : viewMode === "grid"
                        ? "bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                        : "flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
                  } ${selectedResults.has(track.id) && !track.isSystemMessage ? "ring-2 ring-blue-500" : ""}`}
                >
                  {!track.isSystemMessage && (
                    <input
                      type="checkbox"
                      checked={selectedResults.has(track.id)}
                      onChange={(e) => {
                        const newSelection = new Set(selectedResults);
                        if (e.target.checked) {
                          newSelection.add(track.id);
                        } else {
                          newSelection.delete(track.id);
                        }
                        setSelectedResults(newSelection);
                      }}
                      className="rounded"
                    />
                  )}

                  {track.isSystemMessage ? (
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <Settings className="w-12 h-12 text-blue-400" />
                      </div>
                      <h3 className="font-medium text-blue-400 mb-2">
                        {track.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        {track.description}
                      </p>
                      <button
                        onClick={() => window.location.href = '/settings'}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Go to Settings
                      </button>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="text-center">
                      <ArtworkImage
                        src={track.thumbnail}
                        alt={track.title}
                        size="lg"
                        className="mx-auto mb-3"
                      />
                      <h3 className="font-medium truncate mb-1">
                        {track.title}
                      </h3>
                      <p className="text-gray-400 text-sm truncate mb-2">
                        {track.artist}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePreview(track)}
                          className={`p-2 rounded-full transition-colors ${
                            playingPreview === track.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 hover:bg-gray-500"
                          }`}
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToQueue(track)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ArtworkImage
                        src={track.thumbnail}
                        alt={track.title}
                        size="md"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{track.title}</h3>
                        <p className="text-gray-400 text-sm truncate">
                          {track.artist}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {track.album} • {track.year}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{formatTime(track.duration)}</span>
                        {track.popularity && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{track.popularity}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(track)}
                          className={`p-2 rounded-full transition-colors ${
                            playingPreview === track.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 hover:bg-gray-500"
                          }`}
                          title="Preview"
                        >
                          <Play className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => addToQueue(track)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                          title="Add to Queue"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleFavorite(track)}
                          className={`p-2 rounded-full transition-colors ${
                            isFavorite(track.id)
                              ? "bg-red-600 text-white"
                              : "bg-gray-600 hover:bg-gray-500"
                          }`}
                          title="Favorite"
                        >
                          <Heart className="w-4 h-4" />
                        </button>

                        <TrackOptionsMenu track={track} />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {searchResults.length < totalResults && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMoreResults}
                  disabled={isSearching}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${totalResults - searchResults.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isSearching && localQuery && searchResults.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search terms or filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Search Analytics */}
        {showAnalytics && (
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Search Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {totalResults}
                </div>
                <div className="text-sm text-gray-400">Total Results</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {recentSearches.length}
                </div>
                <div className="text-sm text-gray-400">Recent Searches</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {selectedResults.size}
                </div>
                <div className="text-sm text-gray-400">Selected Tracks</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

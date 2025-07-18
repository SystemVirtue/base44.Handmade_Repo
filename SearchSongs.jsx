import React, { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import {
  useSearchStore,
  useAudioStore,
  useUIStore,
  formatTime,
} from "./store.js";
import ArtworkImage from "./components/ui/artwork-image.jsx";
import TrackOptionsMenu from "./components/ui/track-options-menu.jsx";

export default function SearchSongs() {
  const [localQuery, setLocalQuery] = useState("");
  const [previewAudio, setPreviewAudio] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedResults, setSelectedResults] = useState(new Set());
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("list"); // list, grid, compact
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedSources, setSelectedSources] = useState(["all"]);
  const searchInputRef = useRef(null);

  // Store state
  const {
    query,
    results,
    searchResults,
    isSearching,
    filters,
    recentSearches,
    searchSuggestions,
    setQuery,
    setFilters,
    performSearch,
    getSuggestions,
    clearResults,
    getSearchAnalytics,
  } = useSearchStore();

  const { addToQueue, toggleFavorite, isFavorite, hasVoted, voteForTrack } =
    useAudioStore();
  const { addNotification } = useUIStore();

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        clearResults();
      }
    }, 300),
    [performSearch, clearResults],
  );

  // Debounced suggestions
  const debouncedSuggestions = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim().length > 1) {
        getSuggestions(searchQuery);
      }
    }, 200),
    [getSuggestions],
  );

  // Handle search input changes
  useEffect(() => {
    if (localQuery !== query) {
      setQuery(localQuery);
      debouncedSearch(localQuery);
      debouncedSuggestions(localQuery);
    }
  }, [localQuery, query, setQuery, debouncedSearch, debouncedSuggestions]);

  // Filter and sort results
  const filteredAndSortedResults = results
    .filter((result) => {
      // Apply filters
      if (
        filters.genre !== "all" &&
        result.genre &&
        result.genre.toLowerCase() !== filters.genre.toLowerCase()
      ) {
        return false;
      }

      if (filters.explicit !== "any") {
        if (filters.explicit === "clean" && result.explicit) return false;
        if (filters.explicit === "explicit" && !result.explicit) return false;
      }

      if (filters.year !== "any") {
        const year = result.year;
        switch (filters.year) {
          case "2024":
            return year === 2024;
          case "2023":
            return year === 2023;
          case "2020s":
            return year >= 2020 && year <= 2029;
          case "2010s":
            return year >= 2010 && year <= 2019;
          case "2000s":
            return year >= 2000 && year <= 2009;
          case "1990s":
            return year >= 1990 && year <= 1999;
          case "pre-1990":
            return year < 1990;
          default:
            return true;
        }
      }

      if (filters.duration !== "any") {
        const duration = result.duration;
        switch (filters.duration) {
          case "under3":
            return duration < 180;
          case "3to5":
            return duration >= 180 && duration <= 300;
          case "over5":
            return duration > 300;
          default:
            return true;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "artist":
          return a.artist.localeCompare(b.artist);
        case "duration":
          return a.duration - b.duration;
        case "year":
          return (b.year || 0) - (a.year || 0);
        case "popularity":
          return (
            (b.popularity || b.views || 0) - (a.popularity || a.views || 0)
          );
        case "relevance":
        default:
          return (b.relevance_score || 0) - (a.relevance_score || 0);
      }
    });

  // Handle actions
  const handlePlayPreview = (track) => {
    if (playingPreview === track.id) {
      previewAudio?.pause();
      setPlayingPreview(null);
      return;
    }

    if (previewAudio) {
      previewAudio.pause();
    }

    if (track.preview_url && track.preview_url !== "#") {
      const audio = new Audio(track.preview_url);
      audio.play().catch(console.error);
      audio.onended = () => setPlayingPreview(null);
      setPreviewAudio(audio);
      setPlayingPreview(track.id);
    } else {
      addNotification({
        type: "info",
        title: "Preview Not Available",
        message: "No preview available for this track",
        priority: "low",
      });
    }
  };

  const handleAddToQueue = (track) => {
    addToQueue(track);
    addNotification({
      type: "success",
      title: "Added to Queue",
      message: `"${track.title}" by ${track.artist} added to queue`,
      priority: "normal",
    });
  };

  const handleBulkAdd = () => {
    const tracksToAdd = filteredAndSortedResults.filter((track) =>
      selectedResults.has(track.id),
    );

    tracksToAdd.forEach((track) => addToQueue(track));
    setSelectedResults(new Set());

    addNotification({
      type: "success",
      title: "Bulk Add Complete",
      message: `Added ${tracksToAdd.length} tracks to queue`,
      priority: "normal",
    });
  };

  const handleSelectTrack = (trackId) => {
    const newSelection = new Set(selectedResults);
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedResults(newSelection);
  };

  const handleSourceFilter = (sources) => {
    setSelectedSources(sources);
    setFilters({ ...filters, sources });
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "spotify":
        return <Music className="w-4 h-4" style={{ color: "#1DB954" }} />;
      case "youtube":
        return <Video className="w-4 h-4" style={{ color: "#FF0000" }} />;
      case "local":
        return <Disc className="w-4 h-4" style={{ color: "#6366F1" }} />;
      case "soundcloud":
        return <Music className="w-4 h-4" style={{ color: "#FF5500" }} />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const getSourceBadge = (source) => {
    const colors = {
      spotify: "bg-green-600",
      youtube: "bg-red-600",
      local: "bg-indigo-600",
      soundcloud: "bg-orange-600",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium text-white ${colors[source] || "bg-gray-600"}`}
      >
        {source.toUpperCase()}
      </span>
    );
  };

  // Source statistics
  const sourceStats = searchResults?.sources || {};

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Search Music</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Search Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              onClick={clearResults}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Clear Results"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {localQuery && (
            <button
              onClick={() => setLocalQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && localQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setLocalQuery(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !localQuery && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setLocalQuery(search)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.genre}
              onChange={(e) =>
                setFilters({ ...filters, genre: e.target.value })
              }
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Genres</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hip-hop">Hip-Hop</option>
              <option value="electronic">Electronic</option>
              <option value="jazz">Jazz</option>
              <option value="classical">Classical</option>
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="any">Any Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2020s">2020s</option>
              <option value="2010s">2010s</option>
              <option value="2000s">2000s</option>
              <option value="1990s">1990s</option>
              <option value="pre-1990">Pre-1990</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title A-Z</option>
              <option value="artist">Artist A-Z</option>
              <option value="year">Year (Newest)</option>
              <option value="duration">Duration</option>
              <option value="popularity">Popularity</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              <Filter className="w-4 h-4" />
              Advanced
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-lg">
              <select
                value={filters.duration}
                onChange={(e) =>
                  setFilters({ ...filters, duration: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="any">Any Duration</option>
                <option value="under3">Under 3 min</option>
                <option value="3to5">3-5 min</option>
                <option value="over5">Over 5 min</option>
              </select>

              <select
                value={filters.explicit}
                onChange={(e) =>
                  setFilters({ ...filters, explicit: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="any">Any Content</option>
                <option value="clean">Clean Only</option>
                <option value="explicit">Explicit Only</option>
              </select>

              {/* Source Selection */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sources:</span>
                <div className="flex gap-1">
                  {["all", "spotify", "youtube", "local"].map((source) => (
                    <button
                      key={source}
                      onClick={() => {
                        if (source === "all") {
                          handleSourceFilter(["all"]);
                        } else {
                          const newSources = selectedSources.includes("all")
                            ? [source]
                            : selectedSources.includes(source)
                              ? selectedSources.filter((s) => s !== source)
                              : [
                                  ...selectedSources.filter((s) => s !== "all"),
                                  source,
                                ];
                          handleSourceFilter(
                            newSources.length === 0 ? ["all"] : newSources,
                          );
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        selectedSources.includes(source) ||
                        (selectedSources.includes("all") && source !== "all")
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {source === "all"
                        ? "All"
                        : source.charAt(0).toUpperCase() + source.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-auto">
        {/* Search Status */}
        {searchResults && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {isSearching
                    ? "Searching..."
                    : `${searchResults.total_results} results in ${searchResults.search_time_ms}ms`}
                </span>

                {/* Source Results Count */}
                <div className="flex items-center gap-2">
                  {Object.entries(sourceStats).map(([source, data]) => (
                    <div
                      key={source}
                      className="flex items-center gap-1 text-xs text-gray-400"
                    >
                      {getSourceIcon(source)}
                      <span>{data.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedResults.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {selectedResults.size} selected
                  </span>
                  <button
                    onClick={handleBulkAdd}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    Add Selected
                  </button>
                  <button
                    onClick={() => setSelectedResults(new Set())}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">
              Searching across all sources...
            </span>
          </div>
        )}

        {/* No Results */}
        {!isSearching && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Music className="w-16 h-16 mb-4" />
            <p className="text-lg mb-2">No results found for "{query}"</p>
            <p className="text-sm">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {/* Results List */}
        {!isSearching && filteredAndSortedResults.length > 0 && (
          <div className="p-4 space-y-2">
            {filteredAndSortedResults.map((track) => (
              <div
                key={track.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-gray-800 group ${
                  selectedResults.has(track.id)
                    ? "bg-blue-900/20 ring-1 ring-blue-500"
                    : ""
                }`}
              >
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedResults.has(track.id)}
                  onChange={() => handleSelectTrack(track.id)}
                  className="rounded"
                />

                {/* Artwork */}
                <ArtworkImage
                  track={track}
                  size="small"
                  className="w-12 h-12 rounded"
                  showLoadingState={false}
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">
                      {track.title}
                    </h3>
                    {track.explicit && (
                      <span className="px-1 py-0.5 bg-gray-600 text-gray-300 text-xs rounded">
                        E
                      </span>
                    )}
                    {getSourceBadge(track.source)}
                  </div>
                  <p className="text-gray-400 text-sm truncate">
                    {track.artist}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {track.album || "Unknown Album"}
                  </p>
                </div>

                {/* Track Stats */}
                <div className="text-right text-sm text-gray-400">
                  <p>{formatTime(track.duration)}</p>
                  {track.year && <p className="text-xs">{track.year}</p>}
                  {track.popularity && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3" />
                      <span>{track.popularity}</span>
                    </div>
                  )}
                  {track.views && (
                    <div className="flex items-center gap-1 text-xs">
                      <Eye className="w-3 h-3" />
                      <span>{(track.views / 1000000).toFixed(1)}M</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePlayPreview(track)}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Preview"
                  >
                    <Play className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleAddToQueue(track)}
                    className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                    title="Add to Queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleFavorite(track.id)}
                    className={`p-2 transition-colors ${
                      isFavorite(track.id)
                        ? "text-red-400 hover:text-red-300"
                        : "text-gray-400 hover:text-red-400"
                    }`}
                    title="Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite(track.id) ? "fill-current" : ""}`}
                    />
                  </button>

                  <TrackOptionsMenu
                    track={track}
                    onAddToQueue={handleAddToQueue}
                    onAddToPlaylist={() =>
                      console.log("Add to playlist:", track)
                    }
                    onShare={() => console.log("Share track:", track)}
                    onShowInfo={() => console.log("Show info:", track)}
                    onReport={() => console.log("Report track:", track)}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!query && !isSearching && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-lg mb-2">Search for Music</p>
            <p className="text-sm">
              Find songs from Spotify, YouTube, and your local library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility function for debouncing
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

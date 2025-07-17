import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useSearchStore, useAudioStore, formatTime } from "./store.js";

export default function SearchSongs() {
  const [localQuery, setLocalQuery] = useState("");
  const [previewAudio, setPreviewAudio] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedResults, setSelectedResults] = useState(new Set());
  const [sortBy, setSortBy] = useState("relevance");

  // Store state
  const {
    query,
    results,
    isSearching,
    filters,
    recentSearches,
    setQuery,
    setFilters,
    performSearch,
    clearResults,
  } = useSearchStore();

  const { addToQueue, setCurrentTrack, togglePlayPause } = useAudioStore();

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      }
    }, 500),
    [performSearch],
  );

  useEffect(() => {
    if (localQuery !== query) {
      setQuery(localQuery);
      if (localQuery.trim()) {
        debouncedSearch(localQuery);
      } else {
        clearResults();
      }
    }
  }, [localQuery, query, setQuery, debouncedSearch, clearResults]);

  // Filter and sort results
  const filteredAndSortedResults = results
    .filter((result) => {
      if (filters.source !== "all" && result.source !== filters.source)
        return false;
      if (filters.genre !== "all" && result.genre !== filters.genre)
        return false;
      if (filters.year !== "any") {
        const year = new Date(result.release_date).getFullYear();
        if (filters.year === "2024" && year !== 2024) return false;
        if (filters.year === "2023" && year !== 2023) return false;
        if (filters.year === "2020s" && (year < 2020 || year > 2029))
          return false;
        if (filters.year === "2010s" && (year < 2010 || year > 2019))
          return false;
      }
      if (filters.duration !== "any") {
        if (filters.duration === "under3" && result.duration > 180)
          return false;
        if (
          filters.duration === "3to5" &&
          (result.duration < 180 || result.duration > 300)
        )
          return false;
        if (filters.duration === "over5" && result.duration < 300) return false;
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
        case "popularity":
          return (b.popularity || 0) - (a.popularity || 0);
        default:
          return 0;
      }
    });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      performSearch(localQuery);
    }
  };

  const handleQuickSearch = (searchTerm) => {
    setLocalQuery(searchTerm);
  };

  const handlePreviewPlay = async (result) => {
    if (playingPreview === result.id) {
      // Stop preview
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      }
      setPlayingPreview(null);
    } else {
      // Start preview
      if (previewAudio) {
        previewAudio.pause();
      }

      // In a real app, this would use the actual preview URL
      const audio = new Audio(result.preview_url || "/audio/preview.mp3");
      audio.volume = 0.5;
      audio.currentTime = 30; // Start at 30 seconds

      audio.addEventListener("ended", () => {
        setPlayingPreview(null);
      });

      audio.addEventListener("error", () => {
        console.error("Preview audio failed to load");
        setPlayingPreview(null);
      });

      try {
        await audio.play();
        setPreviewAudio(audio);
        setPlayingPreview(result.id);

        // Auto-stop after 30 seconds
        setTimeout(() => {
          if (playingPreview === result.id) {
            audio.pause();
            setPlayingPreview(null);
          }
        }, 30000);
      } catch (error) {
        console.error("Failed to play preview:", error);
      }
    }
  };

  const handleAddToQueue = (result) => {
    const track = {
      id: result.id,
      title: result.title,
      artist: result.artist,
      album: result.album,
      duration: result.duration,
      thumbnail: result.thumbnail,
      url: result.stream_url || null,
    };
    addToQueue(track);
  };

  const handlePlayNow = (result) => {
    const track = {
      id: result.id,
      title: result.title,
      artist: result.artist,
      album: result.album,
      duration: result.duration,
      thumbnail: result.thumbnail,
      url: result.stream_url || null,
    };
    setCurrentTrack(track);
    togglePlayPause();
  };

  const handleSelectResult = (resultId) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId);
    } else {
      newSelected.add(resultId);
    }
    setSelectedResults(newSelected);
  };

  const handleAddSelectedToQueue = () => {
    const selectedTracks = filteredAndSortedResults.filter((result) =>
      selectedResults.has(result.id),
    );
    selectedTracks.forEach(handleAddToQueue);
    setSelectedResults(new Set());
  };

  const getSourceColor = (source) => {
    switch (source) {
      case "spotify":
        return "bg-green-600";
      case "youtube":
        return "bg-red-600";
      case "soundcloud":
        return "bg-orange-600";
      case "local":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  // Enhanced mock results with more realistic data
  const enhancedMockResults = filteredAndSortedResults.map((result) => ({
    ...result,
    genre: ["Pop", "Rock", "Electronic", "Hip Hop", "Jazz"][
      Math.floor(Math.random() * 5)
    ],
    release_date: new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28),
    ).toISOString(),
    popularity: Math.floor(Math.random() * 100),
    explicit: Math.random() > 0.7,
    stream_url: `https://example.com/stream/${result.id}`,
  }));

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-hidden flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Search Songs</h1>

      {/* Search Header */}
      <div className="mb-6 space-y-4">
        {/* Main Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for songs, artists, albums..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => {
                setLocalQuery("");
                clearResults();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          )}
        </form>

        {/* Quick Search Suggestions */}
        {!localQuery && recentSearches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Recent:</span>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(search)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        )}

        {/* Results Summary and Controls */}
        {results.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {enhancedMockResults.length} results found
                {localQuery && <span> for "{localQuery}"</span>}
              </span>
              {selectedResults.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-400">
                    {selectedResults.size} selected
                  </span>
                  <button
                    onClick={handleAddSelectedToQueue}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    Add to Queue
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

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
                <option value="duration">Duration</option>
                <option value="popularity">Popularity</option>
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2 rounded transition-colors ${
                  showAdvancedFilters
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <div
          className={`${showAdvancedFilters ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden`}
        >
          <div className="bg-gray-800 rounded-lg p-4 h-full overflow-y-auto">
            <h3 className="font-semibold mb-4">Filters</h3>

            {/* Source Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ source: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Sources</option>
                <option value="local">Local Library</option>
                <option value="spotify">Spotify</option>
                <option value="youtube">YouTube</option>
                <option value="soundcloud">SoundCloud</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={filters.genre}
                onChange={(e) => setFilters({ genre: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Genres</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="electronic">Electronic</option>
                <option value="hip-hop">Hip Hop</option>
                <option value="jazz">Jazz</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ year: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="any">Any Year</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2020s">2020s</option>
                <option value="2010s">2010s</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters({ duration: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="any">Any Length</option>
                <option value="under3">Under 3 min</option>
                <option value="3to5">3-5 min</option>
                <option value="over5">Over 5 min</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({
                  source: "all",
                  genre: "all",
                  year: "any",
                  duration: "any",
                })
              }
              className="w-full bg-gray-600 hover:bg-gray-500 py-2 rounded text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 bg-gray-800 rounded-lg p-6 overflow-hidden flex flex-col">
          {isSearching ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-400">Searching...</p>
              </div>
            </div>
          ) : enhancedMockResults.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">
                  {localQuery ? "No results found" : "Search for music"}
                </p>
                {localQuery && (
                  <p className="text-sm text-gray-500">
                    Try different keywords or check your filters
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto">
              <div className="space-y-3">
                {enhancedMockResults.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                      selectedResults.has(result.id)
                        ? "bg-blue-600/20 border border-blue-500/30"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedResults.has(result.id)}
                      onChange={() => handleSelectResult(result.id)}
                      className="rounded"
                    />

                    {/* Thumbnail */}
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{result.title}</p>
                        {result.explicit && (
                          <span className="text-xs bg-gray-600 text-gray-300 px-1 rounded">
                            E
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        {result.artist} • {result.album}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getSourceColor(result.source)}`}
                        >
                          {result.source.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {result.genre}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(result.duration)}
                        </span>
                        {result.popularity && (
                          <span className="text-xs text-yellow-400">
                            ★ {result.popularity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handlePreviewPlay(result)}
                        className={`p-2 rounded transition-colors ${
                          playingPreview === result.id
                            ? "bg-green-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-600"
                        }`}
                        title={
                          playingPreview === result.id
                            ? "Stop preview"
                            : "Play preview"
                        }
                      >
                        <Play className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handlePlayNow(result)}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-600 rounded transition-colors"
                        title="Play now"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        onClick={() => handleAddToQueue(result)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded transition-colors"
                        title="Add to queue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>

                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

import React, { useState, useEffect } from "react";
import {
  Search,
  Music,
  Play,
  Plus,
  X,
  Filter,
  Grid3X3,
  List,
  Clock,
  Heart,
  Album,
  User,
  Calendar,
  Loader2,
  ChevronDown,
  Shuffle,
} from "lucide-react";
import ArtworkImage from "./artwork-image.jsx";
import { formatTime } from "../../store.js";

/**
 * MusicLibraryBrowser Component
 * Comprehensive music library browser with search, filtering, and selection capabilities
 */
const MusicLibraryBrowser = ({
  isOpen,
  onClose,
  onAddToQueue,
  onPlayNow,
  mode = "select", // "select" or "browse"
}) => {
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [filterBy, setFilterBy] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);

  // Mock music library data
  const mockLibrary = [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      genre: "Rock",
      year: 1975,
      duration: 355,
      plays: 1240,
      lastPlayed: "2024-01-15",
      rating: 5,
      thumbnail:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      source: "local",
    },
    {
      id: 2,
      title: "Hotel California",
      artist: "Eagles",
      album: "Hotel California",
      genre: "Rock",
      year: 1976,
      duration: 390,
      plays: 890,
      lastPlayed: "2024-01-14",
      rating: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
      source: "spotify",
    },
    {
      id: 3,
      title: "Billie Jean",
      artist: "Michael Jackson",
      album: "Thriller",
      genre: "Pop",
      year: 1982,
      duration: 294,
      plays: 1556,
      lastPlayed: "2024-01-13",
      rating: 5,
      thumbnail:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      source: "youtube",
    },
    {
      id: 4,
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      album: "Appetite for Destruction",
      genre: "Rock",
      year: 1987,
      duration: 356,
      plays: 745,
      lastPlayed: "2024-01-12",
      rating: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
      source: "local",
    },
    {
      id: 5,
      title: "Dancing Queen",
      artist: "ABBA",
      album: "Arrival",
      genre: "Pop",
      year: 1976,
      duration: 230,
      plays: 623,
      lastPlayed: "2024-01-11",
      rating: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      source: "spotify",
    },
  ];

  const categories = [
    { id: "all", label: "All Music", icon: Music },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "recent", label: "Recently Played", icon: Clock },
    { id: "albums", label: "Albums", icon: Album },
    { id: "artists", label: "Artists", icon: User },
  ];

  const sortOptions = [
    { value: "title", label: "Title A-Z" },
    { value: "artist", label: "Artist A-Z" },
    { value: "album", label: "Album A-Z" },
    { value: "year", label: "Year" },
    { value: "plays", label: "Most Played" },
    { value: "rating", label: "Rating" },
    { value: "lastPlayed", label: "Recently Played" },
  ];

  const filterOptions = [
    { value: "all", label: "All Sources" },
    { value: "local", label: "Local Files" },
    { value: "spotify", label: "Spotify" },
    { value: "youtube", label: "YouTube" },
  ];

  // Load library data
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      let filteredResults = [...mockLibrary];

      // Apply search filter
      if (searchQuery) {
        filteredResults = filteredResults.filter(
          (track) =>
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.album.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Apply category filter
      if (selectedCategory !== "all") {
        switch (selectedCategory) {
          case "favorites":
            filteredResults = filteredResults.filter(
              (track) => track.rating >= 4,
            );
            break;
          case "recent":
            filteredResults = filteredResults
              .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
              .slice(0, 10);
            break;
          // Add more category filters as needed
        }
      }

      // Apply source filter
      if (filterBy !== "all") {
        filteredResults = filteredResults.filter(
          (track) => track.source === filterBy,
        );
      }

      // Apply sorting
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "artist":
            return a.artist.localeCompare(b.artist);
          case "album":
            return a.album.localeCompare(b.album);
          case "year":
            return b.year - a.year;
          case "plays":
            return b.plays - a.plays;
          case "rating":
            return b.rating - a.rating;
          case "lastPlayed":
            return new Date(b.lastPlayed) - new Date(a.lastPlayed);
          default:
            return 0;
        }
      });

      setResults(filteredResults);
      setIsLoading(false);
    }, 300);
  }, [searchQuery, selectedCategory, sortBy, filterBy]);

  const handleTrackSelect = (track) => {
    if (mode === "select") {
      setSelectedTracks((prev) => {
        const isSelected = prev.find((t) => t.id === track.id);
        if (isSelected) {
          return prev.filter((t) => t.id !== track.id);
        } else {
          return [...prev, track];
        }
      });
    }
  };

  const handleAddSelected = () => {
    selectedTracks.forEach((track) => {
      onAddToQueue && onAddToQueue(track);
    });
    setSelectedTracks([]);
    onClose && onClose();
  };

  const handlePlayNow = (track) => {
    onPlayNow && onPlayNow(track);
    onClose && onClose();
  };

  const handleAddSingle = (track) => {
    onAddToQueue && onAddToQueue(track);
  };

  const isTrackSelected = (track) => {
    return selectedTracks.some((t) => t.id === track.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-gray-900 rounded-lg shadow-xl flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Music className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Music Library</h2>
            {selectedTracks.length > 0 && (
              <span className="text-sm text-gray-400">
                {selectedTracks.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedTracks.length > 0 && (
              <button
                onClick={handleAddSelected}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Selected ({selectedTracks.length})
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-700 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                      ${
                        selectedCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Sort and Filter */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "text-blue-500" : "text-gray-400 hover:text-white"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "text-blue-500" : "text-gray-400 hover:text-white"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Music className="w-16 h-16 mb-4" />
              <p className="text-lg">No tracks found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {results.map((track) => (
                <div
                  key={track.id}
                  className={`
                    bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200
                    hover:bg-gray-700 group relative
                    ${isTrackSelected(track) ? "ring-2 ring-blue-500 bg-blue-900/20" : ""}
                  `}
                  onClick={() => handleTrackSelect(track)}
                >
                  <ArtworkImage
                    track={track}
                    size="medium"
                    className="w-full aspect-square mb-3 rounded"
                  />

                  <h3 className="font-medium text-white text-sm truncate mb-1">
                    {track.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate mb-1">
                    {track.artist}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {track.album}
                  </p>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayNow(track);
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                      title="Play now"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Selection indicator */}
                  {isTrackSelected(track) && (
                    <div className="absolute top-2 left-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((track) => (
                <div
                  key={track.id}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all
                    hover:bg-gray-800 group
                    ${isTrackSelected(track) ? "bg-blue-900/20 ring-1 ring-blue-500" : ""}
                  `}
                  onClick={() => handleTrackSelect(track)}
                >
                  <ArtworkImage
                    track={track}
                    size="small"
                    className="w-12 h-12 rounded"
                  />

                  <div className="flex-1 min-w-0 grid grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium text-white truncate">
                        {track.title}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        {track.artist}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm truncate">
                        {track.album}
                      </p>
                      <p className="text-gray-500 text-xs">{track.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        {formatTime(track.duration)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {track.plays} plays
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSingle(track);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayNow(track);
                      }}
                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                      title="Play now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selection indicator */}
                  {isTrackSelected(track) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {results.length} track{results.length !== 1 ? "s" : ""} found
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Add all visible results to queue
                results.forEach((track) => onAddToQueue && onAddToQueue(track));
                onClose && onClose();
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Add All Visible
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicLibraryBrowser;

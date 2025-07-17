import React, { useState } from "react";
import { Search, Filter, Play, Plus, Heart, ExternalLink } from "lucide-react";

export default function SearchSongs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  // Mock search results
  const searchResults = [
    {
      id: 1,
      title: "Shape of You",
      artist: "Ed Sheeran",
      album: "÷ (Divide)",
      duration: "3:53",
      source: "spotify",
      thumbnail:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
      preview_url: "#",
    },
    {
      id: 2,
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
      source: "youtube",
      thumbnail:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
      preview_url: "#",
    },
    {
      id: 3,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      duration: "2:54",
      source: "local",
      thumbnail:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
      preview_url: "#",
    },
  ];

  const filters = [
    { id: "all", label: "All Sources", count: 156 },
    { id: "local", label: "Local Library", count: 45 },
    { id: "spotify", label: "Spotify", count: 89 },
    { id: "youtube", label: "YouTube", count: 22 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <h1 className="text-3xl font-bold mb-6">Search Songs</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs, artists, albums..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </form>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" />
              <h3 className="font-semibold">Filters</h3>
            </div>

            <div className="space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`w-full flex items-center justify-between p-2 rounded transition-colors ${
                    activeFilter === filter.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="text-xs">{filter.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Advanced Filters</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Genre
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                  <option>All Genres</option>
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Hip Hop</option>
                  <option>Electronic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Year</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                  <option>Any Year</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>2020s</option>
                  <option>2010s</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Duration
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                  <option>Any Length</option>
                  <option>Under 3 min</option>
                  <option>3-5 min</option>
                  <option>Over 5 min</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Search Results
                {searchQuery && (
                  <span className="text-gray-400"> for "{searchQuery}"</span>
                )}
              </h2>
              <div className="text-sm text-gray-400">
                {searchResults.length} results found
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {/* Thumbnail */}
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-12 h-12 rounded object-cover"
                  />

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    <p className="text-gray-400 text-sm truncate">
                      {result.artist} • {result.album}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          result.source === "spotify"
                            ? "bg-green-600"
                            : result.source === "youtube"
                              ? "bg-red-600"
                              : "bg-blue-600"
                        }`}
                      >
                        {result.source.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {result.duration}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-6 text-center">
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors">
                Load More Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

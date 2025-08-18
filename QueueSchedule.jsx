import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Pause,
  SkipForward,
  Trash2,
  GripVertical,
  Shuffle,
  Repeat,
  Timer,
  Users,
  Star,
  ThumbsUp,
  Save,
  Upload,
  Download,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Copy,
  Edit,
  Heart,
  Music,
  PlayCircle,
  StopCircle,
  Volume2,
  VolumeX,
  ExternalLink,
  Loader2,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  FolderPlus,
  Share,
  Bookmark,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useAudioStore,
  useUIStore,
  formatTime,
  formatDuration,
} from "./store.js";
import apiService from "./services/api-service.js";
import persistenceService from "./services/persistence-service.js";

export default function QueueSchedule() {
  // Store state
  const {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    currentVideo,
    isPlaying,
    togglePlayPause,
    nextTrack,
    previousTrack,
    toggleFavorite,
    isFavorite,
    voteForTrack,
    hasVoted,
    getVoteCount,
  } = useAudioStore();

  const { addNotification } = useUIStore();

  // Local state
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState(new Set());
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [starredPlaylists, setStarredPlaylists] = useState(new Set());

  // Queue settings
  const [queueSettings, setQueueSettings] = useState({
    shuffle: false,
    repeat: "none", // none, one, all
    autoPlay: true,
    crossfade: 3,
    gapless: true,
  });

  // Load starred playlists from persistence
  useEffect(() => {
    const starred = persistenceService.getStarredPlaylists();
    setStarredPlaylists(new Set(starred));
  }, []);

  // Load playlists on mount
  useEffect(() => {
    loadPlaylists();
  }, []);

  // Load all playlists (local and Spotify)
  const loadPlaylists = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load local playlists
      const localResponse = await apiService.getPlaylists();

      // Load YouTube playlist
      const youtubeResponse = await apiService.getYouTubePlaylist("PLJ7vMjpVbhBWLWJpweVDki43Wlcqzsqdu");

      if (localResponse.success) {
        setAllPlaylists(localResponse.data || []);
      }

      if (youtubeResponse.success) {
        setYoutubePlaylists([youtubeResponse.data] || []);
      }
    } catch (error) {
      console.error("Failed to load playlists:", error);
      addNotification({
        type: "error",
        message: "Failed to load playlists",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // Refresh playlists
  const refreshPlaylists = useCallback(async () => {
    setIsRefreshing(true);
    await loadPlaylists();
    setIsRefreshing(false);

    addNotification({
      type: "success",
      message: "Playlists refreshed",
      duration: 2000,
    });
  }, [loadPlaylists, addNotification]);

  // Toggle playlist star status
  const togglePlaylistStar = useCallback(
    (playlistId) => {
      const newStarred = new Set(starredPlaylists);

      if (newStarred.has(playlistId)) {
        newStarred.delete(playlistId);
        persistenceService.setPlaylistStarred(playlistId, false);
      } else {
        newStarred.add(playlistId);
        persistenceService.setPlaylistStarred(playlistId, true);
      }

      setStarredPlaylists(newStarred);
    },
    [starredPlaylists],
  );

  // Get combined playlists for display
  const getCombinedPlaylists = useCallback(() => {
    // Create unique IDs with more context and deduplicate
    const localPlaylists = allPlaylists.map((p, index) => ({
      ...p,
      source: "local",
      uniqueId: `local_${p.id}_${index}`
    }));

    const youtubePlaylistsWithIds = youtubePlaylists.map((p, index) => ({
      ...p,
      source: "youtube",
      uniqueId: `youtube_${p.id}_${index}`
    }));

    // Remove any potential duplicates by uniqueId
    const combined = [...localPlaylists, ...youtubePlaylistsWithIds];
    const seenIds = new Set();
    const deduplicated = combined.filter((playlist) => {
      if (seenIds.has(playlist.uniqueId)) {
        return false;
      }
      seenIds.add(playlist.uniqueId);
      return true;
    });

    // Filter based on active tab
    let filtered = deduplicated;
    if (activeTab === "active") {
      filtered = deduplicated.filter((p) => starredPlaylists.has(p.id));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((p) => p.source === filterBy);
    }

    // Sort playlists
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "tracks":
          return (b.trackCount || 0) - (a.trackCount || 0);
        case "recent":
          return (
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
          );
        case "starred":
          const aStarred = starredPlaylists.has(a.id);
          const bStarred = starredPlaylists.has(b.id);
          if (aStarred && !bStarred) return -1;
          if (!aStarred && bStarred) return 1;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    allPlaylists,
    youtubePlaylists,
    activeTab,
    starredPlaylists,
    searchQuery,
    filterBy,
    sortBy,
  ]);

  // Handle playlist click
  const handlePlaylistClick = useCallback(
    async (playlist) => {
      try {
        let tracks = [];

        if (playlist.source === "spotify") {
          const response = await apiService.getSpotifyPlaylistTracks(
            playlist.id,
          );
          if (response.success) {
            tracks = response.data || [];
          }
        } else {
          const response = await apiService.getPlaylistTracks(playlist.id);
          if (response.success) {
            tracks = response.data || [];
          }
        }

        // Add all tracks to queue
        tracks.forEach((track) => addToQueue(track));

        addNotification({
          type: "success",
          message: `Added ${tracks.length} tracks from "${playlist.name}" to queue`,
          duration: 3000,
        });
      } catch (error) {
        console.error("Failed to load playlist tracks:", error);
        addNotification({
          type: "error",
          message: "Failed to load playlist tracks",
          duration: 3000,
        });
      }
    },
    [addToQueue, addNotification],
  );

  // Handle bulk operations
  const handleBulkStar = useCallback(() => {
    selectedPlaylists.forEach((playlistId) => {
      if (!starredPlaylists.has(playlistId)) {
        togglePlaylistStar(playlistId);
      }
    });
    setSelectedPlaylists(new Set());
  }, [selectedPlaylists, starredPlaylists, togglePlaylistStar]);

  const handleBulkUnstar = useCallback(() => {
    selectedPlaylists.forEach((playlistId) => {
      if (starredPlaylists.has(playlistId)) {
        togglePlaylistStar(playlistId);
      }
    });
    setSelectedPlaylists(new Set());
  }, [selectedPlaylists, starredPlaylists, togglePlaylistStar]);

  // Handle select all toggle
  const handleSelectAll = useCallback(() => {
    const playlists = getCombinedPlaylists();
    if (selectedPlaylists.size === playlists.length) {
      setSelectedPlaylists(new Set());
    } else {
      setSelectedPlaylists(new Set(playlists.map((p) => p.uniqueId)));
    }
  }, [getCombinedPlaylists, selectedPlaylists.size]);

  // Queue management functions
  const handleRemoveFromQueue = useCallback(
    (trackId) => {
      removeFromQueue(trackId);
    },
    [removeFromQueue],
  );

  const handleClearQueue = useCallback(() => {
    clearQueue();
    addNotification({
      type: "info",
      message: "Queue cleared",
      duration: 2000,
    });
  }, [clearQueue, addNotification]);

  const handleQueueSettingChange = useCallback((setting, value) => {
    setQueueSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  }, []);

  const displayedPlaylists = getCombinedPlaylists();

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Queue & Playlist Manager</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshPlaylists}
              disabled={isRefreshing}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
              title="Refresh Playlists"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
              title="Filters"
            >
              <Filter className="w-5 h-5" />
            </button>

            <div className="flex items-center bg-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid" ? "bg-blue-600" : "hover:bg-gray-600"
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list" ? "bg-blue-600" : "hover:bg-gray-600"
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-lg p-1 mb-6 flex">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              activeTab === "active"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Active Playlists
              {activeTab === "active" && (
                <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                  {starredPlaylists.size}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              activeTab === "all"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Music className="w-4 h-4" />
              All Playlists
              {activeTab === "all" && (
                <span className="bg-gray-500 text-xs px-2 py-1 rounded-full">
                  {allPlaylists.length + youtubePlaylists.length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("queue")}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              activeTab === "queue"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Current Queue
              {activeTab === "queue" && (
                <span className="bg-green-500 text-xs px-2 py-1 rounded-full">
                  {queue.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search playlists..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="name">Name</option>
                  <option value="tracks">Track Count</option>
                  <option value="recent">Recently Updated</option>
                  <option value="starred">Starred First</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Source
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="all">All Sources</option>
                  <option value="local">Local Playlists</option>
                  <option value="spotify">Spotify Playlists</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSortBy("name");
                    setFilterBy("all");
                  }}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedPlaylists.size > 0 && activeTab !== "queue" && (
          <div className="bg-blue-900 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-100">
                {selectedPlaylists.size} playlist
                {selectedPlaylists.size > 1 ? "s" : ""} selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkStar}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
                >
                  Star Selected
                </button>
                <button
                  onClick={handleBulkUnstar}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                >
                  Unstar Selected
                </button>
                <button
                  onClick={() => setSelectedPlaylists(new Set())}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "queue" ? (
          // Queue Management
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Current Queue ({queue.length} tracks)
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleQueueSettingChange("shuffle", !queueSettings.shuffle)
                  }
                  className={`p-2 rounded transition-colors ${
                    queueSettings.shuffle
                      ? "bg-green-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const nextRepeat =
                      queueSettings.repeat === "none"
                        ? "one"
                        : queueSettings.repeat === "one"
                          ? "all"
                          : "none";
                    handleQueueSettingChange("repeat", nextRepeat);
                  }}
                  className={`p-2 rounded transition-colors ${
                    queueSettings.repeat !== "none"
                      ? "bg-green-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  title={`Repeat: ${queueSettings.repeat}`}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClearQueue}
                  disabled={queue.length === 0}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Queue is empty</h3>
                <p className="text-gray-400">
                  Add some tracks or playlists to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.filter(track => track && track.id).map((track, index) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      currentVideo?.id === track.id
                        ? "bg-green-900/30 border border-green-600"
                        : "bg-gray-700 hover:bg-gray-650"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-400 w-12">
                      #{index + 1}
                      {currentVideo?.id === track.id && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      )}
                    </div>

                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-gray-400 text-sm truncate">
                        {track.artist}
                      </p>
                    </div>

                    <div className="text-sm text-gray-400">
                      {formatTime(track.duration)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(track)}
                        className={`p-1 rounded transition-colors ${
                          isFavorite(track.id)
                            ? "text-red-400 hover:text-red-300"
                            : "text-gray-400 hover:text-white"
                        }`}
                        title="Favorite"
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRemoveFromQueue(track.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove from Queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Playlist Grid/List
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {activeTab === "active"
                    ? "Active Playlists"
                    : "All Playlists"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {displayedPlaylists.length} playlist
                  {displayedPlaylists.length !== 1 ? "s" : ""}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {displayedPlaylists.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {selectedPlaylists.size === displayedPlaylists.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-400">Loading playlists...</span>
              </div>
            ) : displayedPlaylists.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === "active"
                    ? "No active playlists"
                    : "No playlists found"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {activeTab === "active"
                    ? "Star some playlists to see them here"
                    : searchQuery
                      ? "Try adjusting your search terms"
                      : "No playlists available"}
                </p>
                {activeTab === "active" && (
                  <button
                    onClick={() => setActiveTab("all")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Browse All Playlists
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-2"
                }
              >
                {displayedPlaylists.filter(playlist => playlist && playlist.uniqueId).map((playlist) => (
                  <div
                    key={playlist.uniqueId}
                    className={`${
                      viewMode === "grid"
                        ? "bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors cursor-pointer"
                        : "flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
                    } ${selectedPlaylists.has(playlist.uniqueId) ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlaylists.has(playlist.uniqueId)}
                      onChange={(e) => {
                        const newSelection = new Set(selectedPlaylists);
                        if (e.target.checked) {
                          newSelection.add(playlist.uniqueId);
                        } else {
                          newSelection.delete(playlist.uniqueId);
                        }
                        setSelectedPlaylists(newSelection);
                      }}
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {viewMode === "grid" ? (
                      <div
                        className="text-center cursor-pointer"
                        onClick={() => handlePlaylistClick(playlist)}
                      >
                        <img
                          src={playlist.thumbnail || playlist.image}
                          alt={playlist.name}
                          className="w-full aspect-square rounded-lg object-cover mb-3"
                        />

                        <h3 className="font-medium truncate mb-1">
                          {playlist.name}
                        </h3>

                        {playlist.description && (
                          <p className="text-gray-400 text-xs truncate mb-2">
                            {playlist.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                          <span>{playlist.trackCount || 0} tracks</span>
                          <span
                            className={`px-2 py-1 rounded ${
                              playlist.source === "spotify"
                                ? "bg-green-600"
                                : "bg-blue-600"
                            }`}
                          >
                            {playlist.source === "spotify"
                              ? "Spotify"
                              : "Local"}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlaylistStar(playlist.id);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              starredPlaylists.has(playlist.id)
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-600 hover:bg-gray-500"
                            }`}
                            title={
                              starredPlaylists.has(playlist.id)
                                ? "Unstar"
                                : "Star"
                            }
                          >
                            <Star className="w-4 h-4" />
                          </button>

                          {playlist.source === "spotify" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  playlist.external_url || playlist.spotifyUrl,
                                  "_blank",
                                );
                              }}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                              title="Open in Spotify"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={playlist.thumbnail || playlist.image}
                          alt={playlist.name}
                          className="w-16 h-16 rounded object-cover cursor-pointer"
                          onClick={() => handlePlaylistClick(playlist)}
                        />

                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handlePlaylistClick(playlist)}
                        >
                          <h3 className="font-medium truncate">
                            {playlist.name}
                          </h3>
                          {playlist.description && (
                            <p className="text-gray-400 text-sm truncate">
                              {playlist.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{playlist.trackCount || 0} tracks</span>
                            <span>•</span>
                            <span
                              className={`px-2 py-1 rounded ${
                                playlist.source === "spotify"
                                  ? "bg-green-600"
                                  : "bg-blue-600"
                              }`}
                            >
                              {playlist.source === "spotify"
                                ? "Spotify"
                                : "Local"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePlaylistStar(playlist.id)}
                            className={`p-2 rounded-full transition-colors ${
                              starredPlaylists.has(playlist.id)
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-600 hover:bg-gray-500"
                            }`}
                            title={
                              starredPlaylists.has(playlist.id)
                                ? "Unstar"
                                : "Star"
                            }
                          >
                            <Star className="w-4 h-4" />
                          </button>

                          {playlist.source === "spotify" && (
                            <button
                              onClick={() =>
                                window.open(
                                  playlist.external_url || playlist.spotifyUrl,
                                  "_blank",
                                )
                              }
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                              title="Open in Spotify"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

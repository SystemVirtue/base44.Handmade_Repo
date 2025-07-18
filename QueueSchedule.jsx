import React, { useState, useCallback, useRef } from "react";
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
} from "lucide-react";
import { useStore } from "./store";
import ScheduleModal from "./components/ui/schedule-modal";
import TemplateModal from "./components/ui/template-modal";

export default function QueueSchedule() {
  const {
    queue,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    schedules,
    addSchedule,
    removeSchedule,
    updateSchedule,
    templates,
    addTemplate,
    removeTemplate,
    currentTrack,
    playTrack,
    pauseTrack,
    skipTrack,
    searchTracks,
    voteForTrack,
    favoriteTrack,
    zones,
  } = useStore();

  const [activeTab, setActiveTab] = useState("queue");
  const [isQueuePlaying, setIsQueuePlaying] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);
  const [queueSettings, setQueueSettings] = useState({
    shuffle: false,
    repeat: "none", // none, one, all
    autoPlay: true,
    crossfade: 3,
    gapless: true,
  });

  // Spotify playlists state
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([
    {
      id: "spotify_1",
      name: "Morning Vibes",
      description: "Perfect morning energy tracks",
      trackCount: 45,
      duration: "2h 34m",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      isStarred: true,
      spotifyUrl: "https://open.spotify.com/playlist/example1",
      owner: "DJAMMS",
    },
    {
      id: "spotify_2",
      name: "Lunch Mix",
      description: "Chill afternoon background music",
      trackCount: 32,
      duration: "1h 58m",
      image:
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=200&fit=crop",
      isStarred: false,
      spotifyUrl: "https://open.spotify.com/playlist/example2",
      owner: "DJAMMS",
    },
    {
      id: "spotify_3",
      name: "Evening Chill",
      description: "Relaxing evening atmosphere",
      trackCount: 28,
      duration: "1h 45m",
      image:
        "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300&h=200&fit=crop",
      isStarred: true,
      spotifyUrl: "https://open.spotify.com/playlist/example3",
      owner: "DJAMMS",
    },
    {
      id: "spotify_4",
      name: "High Energy",
      description: "Upbeat tracks for busy periods",
      trackCount: 52,
      duration: "3h 12m",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      isStarred: false,
      spotifyUrl: "https://open.spotify.com/playlist/example4",
      owner: "DJAMMS",
    },
  ]);

  const [activePlaylists, setActivePlaylists] = useState(
    spotifyPlaylists.filter((p) => p.isStarred),
  );

  // Drag and Drop handlers
  const handleDragStart = useCallback((e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    setDropPosition(index);
  }, []);

  const handleDrop = useCallback(
    (e, dropIndex) => {
      e.preventDefault();
      if (draggedItem && draggedItem.index !== dropIndex) {
        reorderQueue(draggedItem.index, dropIndex);
      }
      setDraggedItem(null);
      setDropPosition(null);
    },
    [draggedItem, reorderQueue],
  );

  // Queue actions
  const handlePlayQueue = useCallback(() => {
    if (queue.length > 0) {
      playTrack(queue[0]);
      setIsQueuePlaying(true);
    }
  }, [queue, playTrack]);

  const handlePauseQueue = useCallback(() => {
    pauseTrack();
    setIsQueuePlaying(false);
  }, [pauseTrack]);

  const handleShuffleQueue = useCallback(() => {
    setQueueSettings((prev) => ({ ...prev, shuffle: !prev.shuffle }));
    // Implement shuffle logic
  }, []);

  const handleRepeatMode = useCallback(() => {
    setQueueSettings((prev) => ({
      ...prev,
      repeat:
        prev.repeat === "none" ? "all" : prev.repeat === "all" ? "one" : "none",
    }));
  }, []);

  const handleRemoveSelected = useCallback(() => {
    selectedItems.forEach((id) => {
      const index = queue.findIndex((item) => item.id === id);
      if (index !== -1) removeFromQueue(index);
    });
    setSelectedItems(new Set());
  }, [selectedItems, queue, removeFromQueue]);

  const handleSaveAsTemplate = useCallback(() => {
    if (queue.length > 0) {
      const templateName = prompt("Enter template name:");
      if (templateName) {
        addTemplate({
          id: Date.now(),
          name: templateName,
          tracks: [...queue],
          createdAt: new Date(),
          duration: queue.reduce(
            (total, track) => total + (track.duration || 0),
            0,
          ),
        });
      }
    }
  }, [queue, addTemplate]);

  // Calculate queue statistics
  const queueStats = {
    totalTracks: queue.length,
    totalDuration: queue.reduce(
      (total, track) => total + (track.duration || 180),
      0,
    ),
    remainingTracks: queue.filter((_, index) => index > 0).length,
    votedTracks: queue.filter((track) => track.votes && track.votes > 0).length,
    favoritesTracks: queue.filter((track) => track.isFavorite).length,
  };

  const handleTogglePlaylistStar = (playlistId) => {
    setSpotifyPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, isStarred: !playlist.isStarred }
          : playlist,
      ),
    );

    // Update active playlists
    setActivePlaylists(
      spotifyPlaylists
        .map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, isStarred: !playlist.isStarred }
            : playlist,
        )
        .filter((p) => p.isStarred),
    );
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const renderQueueItem = (item, index) => {
    const isSelected = selectedItems.has(item.id);
    const isCurrentTrack = currentTrack && currentTrack.id === item.id;
    const isDraggedOver = dropPosition === index;

    return (
      <div
        key={item.id}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
          isCurrentTrack
            ? "bg-blue-900/50 border border-blue-500"
            : isSelected
              ? "bg-gray-600"
              : "bg-gray-700"
        } ${isDraggedOver ? "border-t-2 border-blue-400" : ""}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={(e) => handleDrop(e, index)}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {
            const newSelected = new Set(selectedItems);
            if (isSelected) {
              newSelected.delete(item.id);
            } else {
              newSelected.add(item.id);
            }
            setSelectedItems(newSelected);
          }}
          className="rounded"
        />

        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />

        <div className="flex items-center gap-2 text-gray-400 w-8">
          {isCurrentTrack && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
          <span className="text-sm">{index + 1}</span>
        </div>

        <div className="w-12 h-12 rounded-lg bg-gray-600 flex items-center justify-center overflow-hidden">
          {item.artwork ? (
            <img
              src={item.artwork}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {item.title || "Unknown Title"}
          </p>
          <p className="text-gray-400 text-sm truncate">
            {item.artist || "Unknown Artist"}
          </p>
          {item.album && (
            <p className="text-gray-500 text-xs truncate">{item.album}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.votes > 0 && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <ThumbsUp className="w-3 h-3" />
              {item.votes}
            </span>
          )}
          {item.isFavorite && (
            <Heart className="w-4 h-4 text-red-400 fill-current" />
          )}
        </div>

        <div className="text-gray-400 text-sm w-12 text-right">
          {formatDuration(item.duration || 180)}
        </div>

        <div className="flex items-center gap-1">
          {!isCurrentTrack && (
            <button
              onClick={() => playTrack(item)}
              className="text-gray-400 hover:text-white p-1"
              title="Play now"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => voteForTrack(item.id)}
            className="text-gray-400 hover:text-green-400 p-1"
            title="Vote for this track"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => favoriteTrack(item.id)}
            className="text-gray-400 hover:text-red-400 p-1"
            title="Add to favorites"
          >
            <Heart className="w-4 h-4" />
          </button>

          <button
            onClick={() => removeFromQueue(index)}
            className="text-gray-400 hover:text-red-400 p-1"
            title="Remove from queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Queue & Playlist Manager</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAsTemplate}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={queue.length === 0}
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Templates
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
            activeTab === "queue"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Music className="w-4 h-4" />
          Current Queue
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
            activeTab === "schedule"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Active Playlists
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
            activeTab === "templates"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Save className="w-4 h-4" />
          All Playlists
        </button>
      </div>

      {activeTab === "queue" && (
        <div className="space-y-6">
          {/* Queue Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Queue</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
                  <button
                    onClick={handleShuffleQueue}
                    className={`p-2 rounded-md transition-colors ${
                      queueSettings.shuffle
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    title="Shuffle queue"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRepeatMode}
                    className={`p-2 rounded-md transition-colors ${
                      queueSettings.repeat !== "none"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    title={`Repeat: ${queueSettings.repeat}`}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {selectedItems.size > 0 && (
                  <button
                    onClick={handleRemoveSelected}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove ({selectedItems.size})
                  </button>
                )}

                <button
                  onClick={() => clearQueue()}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
                  disabled={queue.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>

                <button
                  onClick={() => {
                    /* Navigate to search */
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Songs
                </button>
              </div>
            </div>

            {/* Queue Playback Controls */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-700 rounded-lg">
              <button
                onClick={isQueuePlaying ? handlePauseQueue : handlePlayQueue}
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full"
                disabled={queue.length === 0}
              >
                {isQueuePlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={() => skipTrack()}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg"
                disabled={queue.length <= 1}
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">Queue Status</div>
                <div className="text-white font-medium">
                  {queue.length > 0
                    ? `${queueStats.totalTracks} tracks • ${formatDuration(queueStats.totalDuration)} total`
                    : "Queue is empty"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-400">Auto-play</div>
                <button
                  onClick={() =>
                    setQueueSettings((prev) => ({
                      ...prev,
                      autoPlay: !prev.autoPlay,
                    }))
                  }
                  className={`mt-1 p-1 rounded ${queueSettings.autoPlay ? "text-green-400" : "text-gray-400"}`}
                >
                  {queueSettings.autoPlay ? (
                    <PlayCircle className="w-5 h-5" />
                  ) : (
                    <StopCircle className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Queue Items */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {queue.length > 0 ? (
                queue.map((item, index) => renderQueueItem(item, index))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Queue is empty</p>
                  <p className="text-sm">Add some tracks to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Queue Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {queueStats.totalTracks}
              </div>
              <div className="text-gray-400 text-sm">Total Tracks</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {formatDuration(queueStats.totalDuration)}
              </div>
              <div className="text-gray-400 text-sm">Total Duration</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {queueStats.remainingTracks}
              </div>
              <div className="text-gray-400 text-sm">Remaining</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {queueStats.votedTracks}
              </div>
              <div className="text-gray-400 text-sm">Voted Tracks</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">
                {queueStats.favoritesTracks}
              </div>
              <div className="text-gray-400 text-sm">Favorites</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="space-y-6">
          {/* Active Playlists */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Playlists</h2>
              <div className="text-sm text-gray-400">
                Available for Scheduler
              </div>
            </div>

            {/* Active Playlists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePlaylists.length > 0 ? (
                activePlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Playlist Image */}
                    <div className="relative aspect-video">
                      <img
                        src={playlist.image}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="bg-yellow-500 text-white p-1 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* Playlist Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {playlist.name}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {playlist.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <span>{playlist.trackCount} tracks</span>
                        <span>{playlist.duration}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            console.log(`Loading playlist: ${playlist.name}`);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Use in Scheduler
                        </button>
                        <button
                          onClick={() => handleTogglePlaylistStar(playlist.id)}
                          className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                          title="Remove from Active Playlists"
                        >
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No active playlists</p>
                  <p className="text-sm">
                    Star playlists from "All Playlists" to add them here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Spotify Playlists */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">All Playlists</h2>
              <div className="text-sm text-gray-400">
                From DJAMMS Spotify Profile
              </div>
            </div>

            {/* Playlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spotifyPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Playlist Image */}
                  <div className="relative aspect-video">
                    <img
                      src={playlist.image}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleTogglePlaylistStar(playlist.id)}
                        className={`p-2 rounded-full transition-colors ${
                          playlist.isStarred
                            ? "bg-yellow-500 text-white"
                            : "bg-black/50 text-white hover:bg-yellow-500"
                        }`}
                        title={
                          playlist.isStarred
                            ? "Remove from Active Playlists"
                            : "Add to Active Playlists"
                        }
                      >
                        <Star
                          className={`w-4 h-4 ${playlist.isStarred ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Playlist Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {playlist.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {playlist.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{playlist.trackCount} tracks</span>
                      <span>{playlist.duration}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // In a real implementation, this would load tracks from the Spotify playlist
                          console.log(`Loading playlist: ${playlist.name}`);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Load Playlist
                      </button>
                      <button
                        onClick={() =>
                          window.open(playlist.spotifyUrl, "_blank")
                        }
                        className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                        title="Open in Spotify"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingSchedule(null);
        }}
        onSave={(scheduleData) => {
          if (editingSchedule) {
            updateSchedule(editingSchedule.id, scheduleData);
          } else {
            addSchedule(scheduleData);
          }
        }}
        schedule={editingSchedule}
        templates={templates}
        zones={zones}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        onSave={(templateData) => {
          if (editingTemplate) {
            // Update existing template
            removeTemplate(editingTemplate.id);
            addTemplate(templateData);
          } else {
            addTemplate(templateData);
          }
        }}
        template={editingTemplate}
        availableTracks={queue} // Could be expanded to include library tracks
      />
    </div>
  );
}

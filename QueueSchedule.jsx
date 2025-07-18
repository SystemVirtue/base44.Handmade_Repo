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
        <h1 className="text-3xl font-bold">Queue & Schedule Management</h1>
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
          Scheduled Content
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
          Queue Templates
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
          {/* Schedule Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Scheduled Content</h2>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Schedule
              </button>
            </div>

            {/* Schedule Items */}
            <div className="space-y-3">
              {schedules && schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg"
                  >
                    <Calendar className="w-5 h-5 text-blue-400" />

                    <div className="flex-1">
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {schedule.tracks?.length || 0} tracks • {schedule.type}
                      </p>
                    </div>

                    <div className="text-sm text-gray-400 capitalize">
                      {schedule.type}
                    </div>

                    <div
                      className={`w-3 h-3 rounded-full ${schedule.active ? "bg-green-400" : "bg-gray-500"}`}
                    ></div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setShowScheduleModal(true);
                        }}
                        className="text-gray-400 hover:text-white"
                        title="Edit schedule"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          updateSchedule(schedule.id, {
                            active: !schedule.active,
                          })
                        }
                        className="text-gray-400 hover:text-white"
                        title={
                          schedule.active
                            ? "Disable schedule"
                            : "Enable schedule"
                        }
                      >
                        {schedule.active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeSchedule(schedule.id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No schedules configured</p>
                  <p className="text-sm">
                    Create your first schedule to automate playback
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule Overview */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            <div className="grid grid-cols-24 gap-1 h-8 mb-2">
              {Array.from({ length: 24 }, (_, i) => {
                const activeSchedule = schedules?.find(
                  (s) =>
                    s.active &&
                    parseInt(s.startTime.split(":")[0]) <= i &&
                    parseInt(s.endTime.split(":")[0]) > i,
                );

                return (
                  <div
                    key={i}
                    className={`rounded transition-colors ${
                      activeSchedule
                        ? activeSchedule.type === "playlist"
                          ? "bg-blue-600"
                          : activeSchedule.type === "random"
                            ? "bg-green-600"
                            : activeSchedule.type === "template"
                              ? "bg-purple-600"
                              : "bg-gray-600"
                        : "bg-gray-600"
                    }`}
                    title={`${i}:00 ${activeSchedule ? `- ${activeSchedule.name}` : ""}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span className="text-gray-400">Playlist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-gray-400">Random</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded"></div>
                <span className="text-gray-400">Template</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span className="text-gray-400">Free Time</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Template Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Queue Templates</h2>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Template
              </button>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates && templates.length > 0 ? (
                templates.map((template) => (
                  <div key={template.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {template.tracks?.length || 0} tracks •{" "}
                          {formatDuration(template.duration || 0)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Created{" "}
                          {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeTemplate(template.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          clearQueue();
                          template.tracks?.forEach((track) =>
                            addToQueue(track),
                          );
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Load Queue
                      </button>
                      <button
                        onClick={() => {
                          template.tracks?.forEach((track) =>
                            addToQueue(track),
                          );
                        }}
                        className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Save className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No templates saved</p>
                  <p className="text-sm">
                    Save queue configurations as templates for quick loading
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

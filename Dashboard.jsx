import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  ThumbsUp,
  Loader2,
  Heart,
  MoreHorizontal,
  Shuffle,
  Repeat,
  Music,
} from "lucide-react";
import { useAudioStore, useUIStore, formatTime } from "./store.js";
import ArtworkImage from "./components/ui/artwork-image.jsx";
import TrackOptionsMenu from "./components/ui/track-options-menu.jsx";
import MusicLibraryBrowser from "./components/ui/music-library-browser.jsx";

export default function Dashboard() {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);

  // Store state
  const {
    currentVideo,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    queue,
    currentQueueIndex,
    togglePlayPause,
    setCurrentTime,
    seekTo,
    nextTrack,
    previousTrack,
    setVolume,
    addToQueue,
    removeFromQueue,
    setAudioInstance,
    toggleFavorite,
    voteForTrack,
    isFavorite,
    hasVoted,
    getVoteCount,
  } = useAudioStore();

  const { setLoading } = useUIStore();

  // Additional player state
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // 'none', 'one', 'all'
  const [showQueue, setShowQueue] = useState(true);
  const [showLibraryBrowser, setShowLibraryBrowser] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      setAudioInstance(audioRef.current);

      const audio = audioRef.current;

      // Event listeners
      const handleTimeUpdate = () => {
        if (!isDragging) {
          setCurrentTime(audio.currentTime);
          setLocalCurrentTime(audio.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        // Update duration if needed
      };

      const handleEnded = () => {
        if (repeatMode === "one") {
          audio.currentTime = 0;
          audio.play();
        } else if (
          repeatMode === "all" ||
          currentQueueIndex < queue.length - 1
        ) {
          nextTrack();
        }
      };

      const handleError = (e) => {
        console.error("Audio error:", e);
        // Handle audio errors gracefully
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };
    }
  }, [
    isDragging,
    setCurrentTime,
    setAudioInstance,
    repeatMode,
    currentQueueIndex,
    queue.length,
    nextTrack,
  ]);

  // Update audio volume when store volume changes
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isMuted]);

  // Handle progress bar dragging
  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    updateProgress(e);
  };

  const handleProgressMouseMove = (e) => {
    if (isDragging) {
      updateProgress(e);
    }
  };

  const handleProgressMouseUp = (e) => {
    if (isDragging) {
      updateProgress(e);
      seekTo(localCurrentTime);
      setIsDragging(false);
    }
  };

  const updateProgress = (e) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      const newTime = percent * (currentVideo.duration || 0);
      setLocalCurrentTime(newTime);
    }
  };

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleProgressMouseMove(e);
      const handleMouseUp = (e) => handleProgressMouseUp(e);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleVote = async (songId) => {
    try {
      // Use store voting functionality
      voteForTrack(songId);
      // In a real app, this would also sync with backend
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleToggleFavorite = (trackId) => {
    toggleFavorite(trackId);
  };

  const handleAddToQueue = (song) => {
    addToQueue(song);
  };

  const handleRemoveFromQueue = (songId) => {
    removeFromQueue(songId);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  // Track action handlers for options menu
  const handleAddToPlaylist = (track) => {
    console.log("Add to playlist:", track);
    // TODO: Implement playlist functionality
  };

  const handleShareTrack = (track) => {
    if (navigator.share) {
      navigator
        .share({
          title: track.title,
          text: `Check out "${track.title}" by ${track.artist}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const shareText = `${track.title} by ${track.artist}`;
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          console.log("Track info copied to clipboard");
        })
        .catch(console.error);
    }
  };

  const handleShowTrackInfo = (track) => {
    console.log("Show track info:", track);
    // TODO: Implement track info modal/panel
  };

  const handleReportTrack = (track) => {
    console.log("Report track:", track);
    // TODO: Implement reporting system
  };

  // Library browser handlers
  const handleOpenLibraryBrowser = () => {
    setShowLibraryBrowser(true);
  };

  const handleCloseLibraryBrowser = () => {
    setShowLibraryBrowser(false);
  };

  const handlePlayTrackNow = (track) => {
    // Set as current track and play immediately
    const newTrack = {
      ...track,
      url: null, // This would be set by the backend in a real implementation
    };

    // Add to beginning of queue and play
    addToQueue(newTrack);
    // In a real implementation, this would also set as current track
    console.log("Playing track now:", track);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <span className="text-xs absolute -top-1 -right-1">1</span>;
      case "all":
        return null;
      default:
        return null;
    }
  };

  const progress = isDragging
    ? (localCurrentTime / (currentVideo.duration || 1)) * 100
    : (currentTime / (currentVideo.duration || 1)) * 100;

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Currently Playing Section */}
        <div className="p-6 border-b border-gray-700">
          {/* Video Info */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 rounded-lg shadow-lg overflow-hidden bg-gray-800">
              <img
                src={currentVideo.thumbnail || 'https://via.placeholder.com/96x96/374151/9ca3af?text=No+Video'}
                alt={currentVideo.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/96x96/374151/9ca3af?text=No+Video';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={togglePlayPause}
                  className="opacity-0 hover:opacity-100 transition-opacity p-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-1 truncate">
                {currentVideo.title || "No video selected"}
              </h1>
              <p className="text-lg text-gray-400 mb-2 truncate">
                {currentVideo.channelTitle || "Unknown Channel"}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {currentVideo.viewCount ? `${(currentVideo.viewCount / 1000000).toFixed(1)}M views` : ''} • {formatTime(currentVideo.duration || 0)}
              </p>

              {/* Video actions */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => handleToggleFavorite(currentVideo.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    isFavorite(currentVideo.id)
                      ? "text-red-400 hover:text-red-300"
                      : "text-gray-400 hover:text-red-400"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite(currentVideo.id) ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">
                    {isFavorite(currentVideo.id) ? "Liked" : "Like"}
                  </span>
                </button>
                <button
                  onClick={() => handleVote(currentVideo.id)}
                  disabled={hasVoted(currentVideo.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    hasVoted(currentVideo.id)
                      ? "text-green-400 cursor-not-allowed"
                      : "text-gray-400 hover:text-green-400"
                  }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${hasVoted(currentVideo.id) ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">
                    {hasVoted(currentVideo.id) ? "Voted" : "Vote"}
                    {getVoteCount(currentVideo.id) > 0 &&
                      ` (${getVoteCount(currentVideo.id)})`}
                  </span>
                </button>
                <TrackOptionsMenu
                  track={currentVideo}
                  onAddToQueue={handleAddToQueue}
                  onAddToPlaylist={handleAddToPlaylist}
                  onShare={handleShareTrack}
                  onShowInfo={handleShowTrackInfo}
                  onReport={handleReportTrack}
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>
                {formatTime(isDragging ? localCurrentTime : currentTime)}
              </span>
              <span>{formatTime(currentVideo.duration || 0)}</span>
            </div>

            <div
              ref={progressRef}
              className="relative h-2 bg-gray-700 rounded-full cursor-pointer group"
              onMouseDown={handleProgressMouseDown}
            >
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{
                  width: `${Math.max(0, Math.min(100, progress || 0))}%`,
                }}
              >
                <div className="absolute right-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffled
                  ? "text-green-400 bg-green-400/20"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={previousTrack}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors shadow-lg"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors relative ${
                repeatMode !== "none"
                  ? "text-green-400 bg-green-400/20"
                  : "text-gray-400 hover:text-white"
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-5 h-5" />
              {getRepeatIcon()}
            </button>
          </div>
        </div>

        {/* Queue Section */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Up Next</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  {showQueue ? "Hide Queue" : "Show Queue"}
                </button>
                <span className="text-sm text-gray-400">
                  {queue.length} song{queue.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {showQueue && (
              <div className="space-y-2">
                {queue.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg mb-2">No songs in queue</p>
                    <p className="text-sm">
                      Add songs from search or playlists
                    </p>
                  </div>
                ) : (
                  queue.map((song, index) => (
                    <div
                      key={`queue-${song.id}-${index}`}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        index === currentQueueIndex
                          ? "bg-blue-600/20 border border-blue-500/30"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      {/* Position indicator */}
                      <div className="w-8 text-center">
                        {index === currentQueueIndex ? (
                          <div className="w-4 h-4 bg-green-400 rounded-full mx-auto flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-900 rounded-full"></div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Video thumbnail */}
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                        <img
                          src={song.thumbnail || 'https://via.placeholder.com/48x48/374151/9ca3af?text=?'}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48x48/374151/9ca3af?text=?';
                          }}
                        />
                      </div>

                      {/* Video info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          {song.channelTitle || song.artist}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="text-gray-400 text-sm">
                        {formatTime(song.duration)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(song.id)}
                          disabled={hasVoted(song.id)}
                          className={`p-1 transition-colors relative ${
                            hasVoted(song.id)
                              ? "text-green-400 cursor-not-allowed"
                              : "text-gray-400 hover:text-green-400"
                          }`}
                          title={
                            hasVoted(song.id)
                              ? "Already voted"
                              : "Vote for this song"
                          }
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${hasVoted(song.id) ? "fill-current" : ""}`}
                          />
                          {getVoteCount(song.id) > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {getVoteCount(song.id)}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => handleRemoveFromQueue(song.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove from queue"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quick add section */}
            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-3">Quick Add</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenLibraryBrowser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  Search YouTube Videos
                </button>
                <button
                  onClick={() => {
                    // Navigate to search page
                    window.location.href = '/search-songs';
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Advanced Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Music Library Browser Modal */}
      <MusicLibraryBrowser
        isOpen={showLibraryBrowser}
        onClose={handleCloseLibraryBrowser}
        onAddToQueue={handleAddToQueue}
        onPlayNow={handlePlayTrackNow}
        mode="select"
      />
    </div>
  );
}

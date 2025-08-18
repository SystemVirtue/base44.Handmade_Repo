import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  RotateCcw,
  Loader2
} from 'lucide-react';

/**
 * YouTube Player Component
 * Integrates with YouTube IFrame API for video playback
 */
const YouTubePlayer = ({
  videoId,
  autoplay = false,
  controls = true,
  width = '100%',
  height = '360px',
  onReady,
  onStateChange,
  onError,
  onTimeUpdate,
  className = '',
  quality = 'auto'
}) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState(-1); // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [playbackRate, setPlaybackRate] = useState(1);

  // Load YouTube IFrame API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      // Load YouTube IFrame API script
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      // Global callback for when API is ready
      window.onYouTubeIframeAPIReady = initializePlayer;
    };

    loadYouTubeAPI();

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, []);

  // Initialize YouTube player
  const initializePlayer = useCallback(() => {
    if (!videoId || !containerRef.current) return;

    try {
      const newPlayer = new window.YT.Player(containerRef.current, {
        width: '100%',
        height: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0, // We'll use custom controls
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handleError,
          onPlaybackQualityChange: handleQualityChange,
          onPlaybackRateChange: handleRateChange
        }
      });

      setPlayer(newPlayer);
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setIsLoading(false);
    }
  }, [videoId, autoplay]);

  // Update video when videoId changes
  useEffect(() => {
    if (player && videoId) {
      player.loadVideoById(videoId);
    }
  }, [player, videoId]);

  // Player event handlers
  const handlePlayerReady = useCallback((event) => {
    setIsLoading(false);
    setDuration(event.target.getDuration());
    setAvailableQualities(event.target.getAvailableQualityLevels());
    setCurrentQuality(event.target.getPlaybackQuality());
    setVolume(event.target.getVolume());
    setIsMuted(event.target.isMuted());
    
    if (onReady) {
      onReady(event);
    }
  }, [onReady]);

  const handleStateChange = useCallback((event) => {
    setPlayerState(event.data);
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      setDuration(event.target.getDuration());
      startTimeTracking();
    } else {
      stopTimeTracking();
    }
    
    if (onStateChange) {
      onStateChange(event);
    }
  }, [onStateChange]);

  const handleError = useCallback((event) => {
    console.error('YouTube player error:', event.data);
    setIsLoading(false);
    
    if (onError) {
      onError(event);
    }
  }, [onError]);

  const handleQualityChange = useCallback((event) => {
    setCurrentQuality(event.target.getPlaybackQuality());
  }, []);

  const handleRateChange = useCallback((event) => {
    setPlaybackRate(event.target.getPlaybackRate());
  }, []);

  // Time tracking
  const timeTrackingRef = useRef(null);

  const startTimeTracking = useCallback(() => {
    if (timeTrackingRef.current) return;

    timeTrackingRef.current = setInterval(() => {
      if (player && playerState === window.YT.PlayerState.PLAYING) {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
      }
    }, 1000);
  }, [player, playerState, onTimeUpdate]);

  const stopTimeTracking = useCallback(() => {
    if (timeTrackingRef.current) {
      clearInterval(timeTrackingRef.current);
      timeTrackingRef.current = null;
    }
  }, []);

  // Control functions
  const play = useCallback(() => {
    if (player) {
      player.playVideo();
    }
  }, [player]);

  const pause = useCallback(() => {
    if (player) {
      player.pauseVideo();
    }
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (playerState === window.YT.PlayerState.PLAYING) {
      pause();
    } else {
      play();
    }
  }, [playerState, play, pause]);

  const seekTo = useCallback((time) => {
    if (player) {
      player.seekTo(time, true);
      setCurrentTime(time);
    }
  }, [player]);

  const setPlayerVolume = useCallback((newVolume) => {
    if (player) {
      player.setVolume(newVolume);
      setVolume(newVolume);
    }
  }, [player]);

  const toggleMute = useCallback(() => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  }, [player, isMuted]);

  const changeQuality = useCallback((quality) => {
    if (player) {
      player.setPlaybackQuality(quality);
      setCurrentQuality(quality);
    }
  }, [player]);

  const changePlaybackRate = useCallback((rate) => {
    if (player) {
      player.setPlaybackRate(rate);
      setPlaybackRate(rate);
    }
  }, [player]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Format time helper
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!videoId) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-800 text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No video selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`} style={{ width, height }}>
      {/* YouTube Player Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '200px' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Custom Controls */}
      {controls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              className="w-full h-1 bg-gray-600 rounded cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                seekTo(percentage * duration);
              }}
            >
              <div 
                className="h-full bg-red-600 rounded transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
                title={playerState === window.YT.PlayerState.PLAYING ? 'Pause' : 'Play'}
              >
                {playerState === window.YT.PlayerState.PLAYING ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setPlayerVolume(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Time Display */}
              <span className="text-sm text-gray-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quality Selector */}
              {availableQualities.length > 1 && (
                <select
                  value={currentQuality}
                  onChange={(e) => changeQuality(e.target.value)}
                  className="bg-gray-800 text-white text-sm border border-gray-600 rounded px-2 py-1"
                  title="Video Quality"
                >
                  {availableQualities.map(quality => (
                    <option key={quality} value={quality}>
                      {quality === 'auto' ? 'Auto' : quality.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}

              {/* Playback Speed */}
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="bg-gray-800 text-white text-sm border border-gray-600 rounded px-2 py-1"
                title="Playback Speed"
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;

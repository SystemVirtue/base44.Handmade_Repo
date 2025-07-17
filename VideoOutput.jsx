import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  Settings,
  Monitor,
  Maximize,
  Volume2,
  VolumeX,
  RotateCcw,
  Save,
  Upload,
  Download,
} from "lucide-react";
import { useAudioStore, useUIStore, formatTime } from "./src/store/index.js";

export default function VideoOutput() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoSettings, setVideoSettings] = useState({
    resolution: "1920x1080",
    quality: "high",
    frameRate: 30,
    bitrate: 5000,
    format: "mp4",
  });

  const [displaySettings, setDisplaySettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    zoom: 100,
    rotation: 0,
  });

  const [outputState, setOutputState] = useState({
    isLive: false,
    isFullscreen: false,
    audioEnabled: true,
    showOverlay: true,
    overlayText: "DJAMMS Live Stream",
  });

  const [previewMode, setPreviewMode] = useState("live"); // 'live', 'test', 'offline'

  // Audio store integration
  const { currentTrack, isPlaying, currentTime } = useAudioStore();
  const { setLoading } = useUIStore();

  // Recording timer
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((time) => time + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Canvas animation for live preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    let animationFrame;

    const drawFrame = () => {
      // Clear canvas
      ctx.fillStyle = "#1f2937"; // gray-800
      ctx.fillRect(0, 0, width, height);

      // Draw visualizer bars (simulated audio visualization)
      if (isPlaying) {
        const bars = 32;
        const barWidth = width / bars;

        for (let i = 0; i < bars; i++) {
          const barHeight = Math.random() * height * 0.6 + 20;
          const hue = (i / bars) * 360;
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          ctx.fillRect(
            i * barWidth,
            height - barHeight,
            barWidth - 2,
            barHeight,
          );
        }
      }

      // Draw track info overlay
      if (outputState.showOverlay) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(20, height - 120, width - 40, 80);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Arial";
        ctx.fillText(currentTrack.title, 40, height - 80);

        ctx.font = "18px Arial";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(currentTrack.artist, 40, height - 55);

        // Progress bar
        const progressWidth = 200;
        const progress = currentTime / currentTrack.duration;
        ctx.fillStyle = "#374151";
        ctx.fillRect(width - progressWidth - 40, height - 80, progressWidth, 4);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(
          width - progressWidth - 40,
          height - 80,
          progressWidth * progress,
          4,
        );
      }

      // Draw recording indicator
      if (isRecording) {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(width - 50, 50, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.fillText("REC", width - 80, 58);
        ctx.fillText(formatTime(recordingTime), width - 120, 75);
      }

      // Draw live indicator
      if (outputState.isLive) {
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(50, 50, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.fillText("LIVE", 70, 58);
      }

      animationFrame = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [
    isPlaying,
    currentTrack,
    currentTime,
    outputState,
    isRecording,
    recordingTime,
  ]);

  const handleStartOutput = async () => {
    setLoading("videoOutput", true);
    try {
      // Simulate starting live output
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOutputState((prev) => ({ ...prev, isLive: true }));
    } catch (error) {
      console.error("Failed to start output:", error);
    } finally {
      setLoading("videoOutput", false);
    }
  };

  const handleStopOutput = () => {
    setOutputState((prev) => ({ ...prev, isLive: false }));
    setIsRecording(false);
  };

  const handleStartRecording = () => {
    if (!outputState.isLive) {
      handleStartOutput();
    }
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSettingChange = (category, key, value) => {
    if (category === "video") {
      setVideoSettings((prev) => ({ ...prev, [key]: value }));
    } else if (category === "display") {
      setDisplaySettings((prev) => ({ ...prev, [key]: value }));
    } else if (category === "output") {
      setOutputState((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleFullscreen = () => {
    if (canvasRef.current) {
      if (canvasRef.current.requestFullscreen) {
        canvasRef.current.requestFullscreen();
      }
    }
  };

  const handleExportSettings = () => {
    const settings = {
      video: videoSettings,
      display: displaySettings,
      output: outputState,
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-output-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          if (settings.video) setVideoSettings(settings.video);
          if (settings.display) setDisplaySettings(settings.display);
          if (settings.output) setOutputState(settings.output);
        } catch (error) {
          console.error("Failed to import settings:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Video Output</h1>
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              outputState.isLive
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {outputState.isLive ? "LIVE" : "OFFLINE"}
          </div>
          {isRecording && (
            <div className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              REC {formatTime(recordingTime)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Live Preview</h2>
              <div className="flex items-center gap-2">
                <select
                  value={previewMode}
                  onChange={(e) => setPreviewMode(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="live">Live Preview</option>
                  <option value="test">Test Pattern</option>
                  <option value="offline">Offline</option>
                </select>
                <button
                  onClick={handleFullscreen}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
                style={{
                  filter: `brightness(${displaySettings.brightness}%) contrast(${displaySettings.contrast}%) saturate(${displaySettings.saturation}%) hue-rotate(${displaySettings.hue}deg)`,
                  transform: `scale(${displaySettings.zoom / 100}) rotate(${displaySettings.rotation}deg)`,
                }}
              />

              {previewMode === "offline" && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Output Offline</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Output Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Output Controls</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleStartOutput}
                disabled={outputState.isLive}
                className="flex flex-col items-center gap-2 p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Play className="w-6 h-6" />
                <span className="text-sm">Start Output</span>
              </button>

              <button
                onClick={handleStopOutput}
                disabled={!outputState.isLive}
                className="flex flex-col items-center gap-2 p-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Square className="w-6 h-6" />
                <span className="text-sm">Stop Output</span>
              </button>

              <button
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isRecording ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
                <span className="text-sm">
                  {isRecording ? "Stop Rec" : "Record"}
                </span>
              </button>

              <button
                onClick={() => handleSettingChange("display", "rotation", 0)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
                <span className="text-sm">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Video Settings */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Video Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution
                </label>
                <select
                  value={videoSettings.resolution}
                  onChange={(e) =>
                    handleSettingChange("video", "resolution", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="1920x1080">1920x1080 (FHD)</option>
                  <option value="1280x720">1280x720 (HD)</option>
                  <option value="854x480">854x480 (SD)</option>
                  <option value="640x360">640x360 (Low)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quality
                </label>
                <select
                  value={videoSettings.quality}
                  onChange={(e) =>
                    handleSettingChange("video", "quality", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frame Rate
                </label>
                <select
                  value={videoSettings.frameRate}
                  onChange={(e) =>
                    handleSettingChange(
                      "video",
                      "frameRate",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value={60}>60 FPS</option>
                  <option value={30}>30 FPS</option>
                  <option value={24}>24 FPS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bitrate: {videoSettings.bitrate} kbps
                </label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={videoSettings.bitrate}
                  onChange={(e) =>
                    handleSettingChange(
                      "video",
                      "bitrate",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Display Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Brightness: {displaySettings.brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={displaySettings.brightness}
                  onChange={(e) =>
                    handleSettingChange(
                      "display",
                      "brightness",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contrast: {displaySettings.contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={displaySettings.contrast}
                  onChange={(e) =>
                    handleSettingChange(
                      "display",
                      "contrast",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Saturation: {displaySettings.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={displaySettings.saturation}
                  onChange={(e) =>
                    handleSettingChange(
                      "display",
                      "saturation",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zoom: {displaySettings.zoom}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={displaySettings.zoom}
                  onChange={(e) =>
                    handleSettingChange(
                      "display",
                      "zoom",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rotation: {displaySettings.rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={displaySettings.rotation}
                  onChange={(e) =>
                    handleSettingChange(
                      "display",
                      "rotation",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Output Options */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Output Options</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={outputState.audioEnabled}
                  onChange={(e) =>
                    handleSettingChange(
                      "output",
                      "audioEnabled",
                      e.target.checked,
                    )
                  }
                  className="rounded"
                />
                <span>Enable Audio</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={outputState.showOverlay}
                  onChange={(e) =>
                    handleSettingChange(
                      "output",
                      "showOverlay",
                      e.target.checked,
                    )
                  }
                  className="rounded"
                />
                <span>Show Track Overlay</span>
              </label>

              {outputState.showOverlay && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Overlay Text
                  </label>
                  <input
                    type="text"
                    value={outputState.overlayText}
                    onChange={(e) =>
                      handleSettingChange(
                        "output",
                        "overlayText",
                        e.target.value,
                      )
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Settings Management */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>

            <div className="space-y-3">
              <button
                onClick={handleExportSettings}
                className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Settings
              </button>

              <label className="w-full flex items-center justify-center gap-2 p-2 bg-green-600 hover:bg-green-700 rounded transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  setVideoSettings({
                    resolution: "1920x1080",
                    quality: "high",
                    frameRate: 30,
                    bitrate: 5000,
                    format: "mp4",
                  });
                  setDisplaySettings({
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    hue: 0,
                    zoom: 100,
                    rotation: 0,
                  });
                }}
                className="w-full flex items-center justify-center gap-2 p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

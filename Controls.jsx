import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Settings,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  AlertTriangle,
  Shield,
  RotateCcw,
} from "lucide-react";
import {
  useAudioStore,
  useZoneStore,
  useUIStore,
  formatTime,
} from "./store.js";
import { EmergencyActions } from "./utils/emergency-system.js";
import {
  useAudioProcessing,
  initializeAudioProcessing,
} from "./services/audio-processing.js";

export default function Controls() {
  const [systemVolume, setSystemVolume] = useState(75);
  const [micVolume, setMicVolume] = useState(0);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [audioInput, setAudioInput] = useState("default");
  const [audioOutput, setAudioOutput] = useState("default");
  const [crossfadeTime, setCrossfadeTime] = useState(3);
  const [eqSettings, setEqSettings] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
    presence: 0,
  });

  // Audio store integration
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    queue,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
  } = useAudioStore();

  const { currentZone, updateZone } = useZoneStore();
  const uiStore = useUIStore;

  // Emergency system
  const [emergencyActions] = useState(
    () => new EmergencyActions(useAudioStore, useZoneStore, uiStore),
  );
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [fadeOutDuration, setFadeOutDuration] = useState(3);

  // System status
  const [systemStatus, setSystemStatus] = useState({
    cpuUsage: 25,
    memoryUsage: 60,
    diskSpace: 45,
    networkStatus: "connected",
    lastBackup: "2 hours ago",
  });

  // Update system stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus((prev) => ({
        ...prev,
        cpuUsage: Math.max(
          10,
          Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10),
        ),
        memoryUsage: Math.max(
          30,
          Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5),
        ),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (currentZone) {
      updateZone(currentZone.id, { volume: newVolume });
    }
  };

  const handleSystemVolumeChange = (newVolume) => {
    setSystemVolume(newVolume);
    // In a real app, this would control system-level volume
  };

  const handleMicToggle = () => {
    setIsMicEnabled(!isMicEnabled);
    if (!isMicEnabled) {
      setMicVolume(50); // Default mic volume when enabling
    } else {
      setMicVolume(0);
    }
  };

  const handleEQChange = (band, value) => {
    setEqSettings((prev) => ({
      ...prev,
      [band]: value,
    }));
  };

  const resetEQ = () => {
    setEqSettings({
      bass: 0,
      mid: 0,
      treble: 0,
      presence: 0,
    });
  };

  // Emergency handlers
  const handleEmergencyStop = async () => {
    const success = await emergencyActions.immediateStop();
    if (success) {
      setIsEmergencyActive(true);
    }
  };

  const handleFadeOutStop = async () => {
    const success = await emergencyActions.fadeOutStop(fadeOutDuration * 1000);
    if (success) {
      setIsEmergencyActive(true);
    }
  };

  const handleSystemRecovery = async () => {
    const success = await emergencyActions.systemRecovery();
    if (success) {
      setIsEmergencyActive(false);
    }
  };

  const handleTestEmergency = async () => {
    await emergencyActions.testEmergencySystems();
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">System Controls</h1>

        {/* Enhanced Emergency Controls */}
        <div
          className={`rounded-lg p-6 border-2 transition-all duration-300 ${
            isEmergencyActive
              ? "bg-red-900/30 border-red-600"
              : "bg-red-900/20 border-red-600/30"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">
                Emergency Controls
              </h2>
            </div>

            {isEmergencyActive && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-400">
                  EMERGENCY ACTIVE
                </span>
              </div>
            )}
          </div>

          {/* Primary Emergency Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Immediate Stop */}
            <button
              onClick={handleEmergencyStop}
              disabled={isEmergencyActive}
              className={`
                py-4 px-6 rounded-lg font-bold text-white text-lg
                transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center
                ${
                  isEmergencyActive
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-red-600 hover:bg-red-700"
                }
              `}
            >
              <Square className="w-6 h-6 mb-2" />
              IMMEDIATE STOP
            </button>

            {/* Fade Out Stop */}
            <div className="space-y-2">
              <button
                onClick={handleFadeOutStop}
                disabled={isEmergencyActive}
                className={`
                  w-full py-4 px-6 rounded-lg font-bold text-white
                  transition-colors min-h-[60px] flex items-center justify-center gap-2
                  ${
                    isEmergencyActive
                      ? "bg-gray-600 cursor-not-allowed opacity-50"
                      : "bg-orange-600 hover:bg-orange-700"
                  }
                `}
              >
                <VolumeX className="w-5 h-5" />
                FADE OUT STOP
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Duration:</label>
                <select
                  value={fadeOutDuration}
                  onChange={(e) => setFadeOutDuration(Number(e.target.value))}
                  disabled={isEmergencyActive}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                >
                  <option value={1}>1s</option>
                  <option value={3}>3s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recovery and Test Controls */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSystemRecovery}
              disabled={!isEmergencyActive}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-colors
                ${
                  isEmergencyActive
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 cursor-not-allowed opacity-50 text-gray-400"
                }
              `}
            >
              <RotateCcw className="w-4 h-4" />
              System Recovery
            </button>

            <button
              onClick={handleTestEmergency}
              disabled={isEmergencyActive}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-colors
                ${
                  !isEmergencyActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-600 cursor-not-allowed opacity-50 text-gray-400"
                }
              `}
            >
              <Shield className="w-4 h-4" />
              Test Systems
            </button>
          </div>

          {/* Safety Notice */}
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-200">
                <p className="font-medium mb-1">SAFETY NOTICE:</p>
                <p>
                  Emergency controls will immediately affect all zones and
                  connected devices. Use responsibly and ensure proper safety
                  protocols are followed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Playback Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Playback Controls</h2>

            {/* Current Track Display */}
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-600 rounded overflow-hidden">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{currentTrack.title}</p>
                  <p className="text-gray-400 text-sm truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
                ></div>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              <button
                onClick={previousTrack}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 mx-auto" />
              </button>

              <button
                onClick={togglePlayPause}
                className={`p-3 rounded-lg transition-colors ${
                  isPlaying
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 mx-auto" />
                ) : (
                  <Play className="w-5 h-5 mx-auto" />
                )}
              </button>

              <button
                onClick={() => {
                  if (isPlaying) togglePlayPause();
                }}
                className="bg-red-600 hover:bg-red-700 p-3 rounded-lg transition-colors"
                title="Stop"
              >
                <Square className="w-5 h-5 mx-auto" />
              </button>

              <button
                onClick={nextTrack}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 mx-auto" />
              </button>

              <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
                <Settings className="w-5 h-5 mx-auto" />
              </button>
            </div>

            {/* Crossfade Control */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Crossfade Time: {crossfadeTime}s
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={crossfadeTime}
                onChange={(e) => setCrossfadeTime(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Queue Info */}
            <div className="bg-gray-700 rounded p-3">
              <div className="text-sm text-gray-400 mb-1">Queue Status</div>
              <div className="flex justify-between text-sm">
                <span>{queue.length} tracks remaining</span>
                <span>Next: {queue[1]?.title || "None"}</span>
              </div>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Volume Controls</h2>

            {/* Master Volume */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Master Volume
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{volume}%</span>
                  <button
                    onClick={toggleMute}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full"
                disabled={isMuted}
              />
            </div>

            {/* System Volume */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  System Volume
                </label>
                <span className="text-sm">{systemVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={systemVolume}
                onChange={(e) =>
                  handleSystemVolumeChange(parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>

            {/* Microphone Control */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Microphone
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{micVolume}%</span>
                  <button
                    onClick={handleMicToggle}
                    className={`p-1 transition-colors ${
                      isMicEnabled
                        ? "text-green-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {isMicEnabled ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <MicOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={micVolume}
                onChange={(e) => setMicVolume(parseInt(e.target.value))}
                className="w-full"
                disabled={!isMicEnabled}
              />
            </div>

            {/* Audio I/O Selection */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Audio Input
                </label>
                <select
                  value={audioInput}
                  onChange={(e) => setAudioInput(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="default">Default Input</option>
                  <option value="mic1">Microphone 1</option>
                  <option value="mic2">Microphone 2</option>
                  <option value="line">Line In</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Audio Output
                </label>
                <select
                  value={audioOutput}
                  onChange={(e) => setAudioOutput(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="default">Default Output</option>
                  <option value="speakers">Main Speakers</option>
                  <option value="headphones">Headphones</option>
                  <option value="zone1">Zone 1 Speakers</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Equalizer */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Equalizer</h2>
            <button
              onClick={resetEQ}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {Object.entries(eqSettings).map(([band, value]) => (
              <div key={band} className="text-center">
                <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                  {band}
                </label>
                <div className="relative h-32 bg-gray-700 rounded mx-auto w-8">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={value}
                    onChange={(e) =>
                      handleEQChange(band, parseFloat(e.target.value))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{
                      writingMode: "bt-lr",
                      appearance: "slider-vertical",
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full bg-blue-500 rounded transition-all duration-200"
                    style={{ height: `${((value + 12) / 24) * 100}%` }}
                  />
                  <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gray-500 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {value > 0 ? "+" : ""}
                  {value}dB
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">CPU Usage</div>
              <div className="text-2xl font-bold mb-2">
                {systemStatus.cpuUsage}%
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    systemStatus.cpuUsage > 80
                      ? "bg-red-500"
                      : systemStatus.cpuUsage > 60
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${systemStatus.cpuUsage}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Memory</div>
              <div className="text-2xl font-bold mb-2">
                {systemStatus.memoryUsage}%
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    systemStatus.memoryUsage > 90
                      ? "bg-red-500"
                      : systemStatus.memoryUsage > 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${systemStatus.memoryUsage}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Disk Space</div>
              <div className="text-2xl font-bold mb-2">
                {systemStatus.diskSpace}%
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${systemStatus.diskSpace}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Network</div>
              <div
                className={`text-lg font-semibold mb-2 ${
                  systemStatus.networkStatus === "connected"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {systemStatus.networkStatus.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400">
                Last backup: {systemStatus.lastBackup}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors text-center">
              <Headphones className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm">Monitor Mode</span>
            </button>

            <button className="bg-green-600 hover:bg-green-700 p-3 rounded-lg transition-colors text-center">
              <Speaker className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm">Speaker Test</span>
            </button>

            <button className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg transition-colors text-center">
              <Shuffle className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm">Auto DJ</span>
            </button>

            <button className="bg-orange-600 hover:bg-orange-700 p-3 rounded-lg transition-colors text-center">
              <Settings className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

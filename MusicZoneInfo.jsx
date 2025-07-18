import React, { useState, useEffect } from "react";
import {
  Info,
  Volume2,
  VolumeX,
  Wifi,
  Users,
  Play,
  TrendingUp,
  Clock,
  Music,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Speaker,
  Monitor,
  Settings,
  BarChart3,
  Thermometer,
  Signal,
  MapPin,
  Power,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useZoneStore, useUIStore, formatTime } from "./store.js";
import { getZoneManager } from "./services/zone-management.js";

export default function MusicZoneInfo() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [zoneManager] = useState(() => getZoneManager());
  const [realTimeData, setRealTimeData] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const { currentZone, zones, updateZone } = useZoneStore();
  const { addNotification } = useUIStore();

  // Real-time data updates
  useEffect(() => {
    if (!currentZone) return;

    const updateData = () => {
      const zoneData = zoneManager.getZone(currentZone.id);
      const devices = zoneManager.getZoneDevices(currentZone.id);
      const statistics = zoneManager.getZoneStatistics(currentZone.id);

      setRealTimeData({
        zone: zoneData,
        devices,
        statistics,
      });
    };

    // Initial update
    updateData();

    // Set up real-time updates
    const interval = setInterval(updateData, 2000);

    // Listen for zone events
    const handleZoneUpdate = (data) => {
      if (data.zoneId === currentZone.id) {
        updateData();
      }
    };

    zoneManager.on("zoneUpdated", handleZoneUpdate);
    zoneManager.on("deviceUpdated", handleZoneUpdate);

    return () => {
      clearInterval(interval);
      zoneManager.off("zoneUpdated", handleZoneUpdate);
      zoneManager.off("deviceUpdated", handleZoneUpdate);
    };
  }, [currentZone, zoneManager]);

  if (!currentZone || !realTimeData) {
    return (
      <div className="h-full bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading zone information...</p>
        </div>
      </div>
    );
  }

  const { zone, devices, statistics } = realTimeData;

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-400";
      case "offline":
        return "text-red-400";
      case "error":
        return "text-orange-400";
      case "syncing":
        return "text-blue-400";
      case "emergency_stop":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "offline":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case "syncing":
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case "emergency_stop":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "disconnected":
        return "bg-red-500";
      case "reconnecting":
        return "bg-yellow-500";
      case "error":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "speaker":
        return <Speaker className="w-5 h-5" />;
      case "amplifier":
        return <Volume2 className="w-5 h-5" />;
      case "display":
        return <Monitor className="w-5 h-5" />;
      case "controller":
        return <Settings className="w-5 h-5" />;
      case "microphone":
        return <Activity className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const formatUptime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleVolumeChange = (newVolume) => {
    zoneManager.setZoneVolume(currentZone.id, newVolume);
    updateZone(currentZone.id, { volume: newVolume });
  };

  const handleMuteToggle = () => {
    zoneManager.toggleZoneMute(currentZone.id);
    updateZone(currentZone.id, { muted: !zone.muted });
  };

  return (
    <div className="h-full bg-gray-900 text-white overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Info className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Network and Devices</h1>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {zone.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showAdvancedMetrics
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {showAdvancedMetrics ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showAdvancedMetrics ? "Hide Details" : "Show Details"}
            </button>
          </div>
        </div>

        {/* Zone Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Status</h3>
              {getStatusIcon(zone.status)}
            </div>
            <p
              className={`text-lg font-medium capitalize ${getStatusColor(zone.status)}`}
            >
              {zone.status.replace("_", " ")}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {zone.activeSince
                ? `Since ${new Date(zone.activeSince).toLocaleTimeString()}`
                : "Inactive"}
            </p>
          </div>

          {/* Volume Control */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Volume</h3>
              <button
                onClick={handleMuteToggle}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {zone.muted ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{zone.volume}%</span>
                <span className="text-sm text-gray-400">
                  Max: {zone.settings.maxVolume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={zone.settings.maxVolume}
                value={zone.muted ? 0 : zone.volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                disabled={zone.muted}
                className="w-full"
              />
            </div>
          </div>

          {/* Devices */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Devices</h3>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {statistics.connectedDevices}
                </span>
                <span className="text-sm text-gray-400">
                  of {statistics.deviceCount}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {statistics.connectedDevices === statistics.deviceCount
                  ? "All Connected"
                  : "Some Offline"}
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Network</h3>
              <Wifi className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium capitalize">
                  {zone.network.quality}
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    zone.network.quality === "excellent"
                      ? "bg-green-400"
                      : zone.network.quality === "good"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                />
              </div>
              <div className="text-sm text-gray-400">
                Latency: {zone.network.latency}ms
              </div>
            </div>
          </div>
        </div>

        {/* Current Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Now Playing */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Music className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Current Activity</h3>
            </div>

            {zone.currentPlaylist ? (
              <div className="space-y-3">
                <div>
                  <p className="font-medium">
                    Playlist: {zone.currentPlaylist}
                  </p>
                  <p className="text-sm text-gray-400">
                    Playing for{" "}
                    {statistics.uptime ? formatUptime(statistics.uptime) : "0m"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Tracks Played</p>
                    <p className="font-medium">{statistics.tracksPlayed}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Avg Volume</p>
                    <p className="font-medium">{statistics.averageVolume}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Peak Volume</p>
                    <p className="font-medium">{statistics.peakVolume}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active playlist</p>
              </div>
            )}
          </div>

          {/* Zone Statistics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Statistics</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Playtime</p>
                  <p className="text-lg font-medium">
                    {formatTime(statistics.totalPlaytime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Connected Users</p>
                  <p className="text-lg font-medium">
                    {statistics.connectedUsers}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Zone Health</span>
                  <span
                    className={`text-sm font-medium ${
                      statistics.health.overall === "healthy"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {statistics.health.overall}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    Max Temp: {Math.round(statistics.health.temperature)}°C
                  </div>
                  <div>
                    Avg Signal:{" "}
                    {Math.round(statistics.health.avgSignalStrength)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-6">Connected Devices</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedDeviceId === device.id
                    ? "bg-blue-900/20 border-blue-500"
                    : "bg-gray-700 border-gray-600 hover:border-gray-500"
                }`}
                onClick={() =>
                  setSelectedDeviceId(
                    selectedDeviceId === device.id ? null : device.id,
                  )
                }
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <h4 className="font-medium">{device.name}</h4>
                      <p className="text-xs text-gray-400 capitalize">
                        {device.type}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-3 h-3 rounded-full ${getConnectionStatusColor(device.status)}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Volume</span>
                    <span>{device.volume}%</span>
                  </div>

                  {showAdvancedMetrics && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Temperature</span>
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          {Math.round(device.health.temperature)}°C
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Signal</span>
                        <span className="flex items-center gap-1">
                          <Signal className="w-3 h-3" />
                          {Math.round(device.health.signalStrength)}%
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 pt-1 border-t border-gray-600">
                        <div>Model: {device.model}</div>
                        <div>IP: {device.ipAddress}</div>
                        <div>Firmware: {device.firmware}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Metrics */}
        {showAdvancedMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Network Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address</span>
                  <span className="font-mono">{zone.network.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bandwidth</span>
                  <span>{zone.network.bandwidth} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Ping</span>
                  <span>
                    {new Date(zone.network.lastPing).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Zone Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Zone Settings</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Priority Level</span>
                  <span>{zone.settings.priorityLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Auto Fade</span>
                  <span>{zone.settings.autoFade ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Guest Access</span>
                  <span>
                    {zone.settings.allowGuests ? "Allowed" : "Restricted"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Emergency Stop</span>
                  <span>
                    {zone.settings.emergencyStopEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Plus,
  Settings,
  Users,
  Volume2,
  Wifi,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Edit,
  Trash2,
  Copy,
  Power,
  Eye,
  Monitor,
  Speaker,
  Activity,
} from "lucide-react";
import { useZoneStore, useUIStore } from "./store.js";
import {
  getZoneManager,
  ZONE_STATUS,
  CONNECTION_STATUS,
} from "./services/zone-management.js";

export default function ChangeMusicZone() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedZoneForEdit, setSelectedZoneForEdit] = useState(null);
  const [zoneManager] = useState(() => getZoneManager());
  const [allZones, setAllZones] = useState([]);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const { currentZone, setCurrentZone, zones, addZone, updateZone } =
    useZoneStore();
  const { addNotification } = useUIStore();

  // Zone creation form
  const [newZone, setNewZone] = useState({
    name: "",
    location: "",
    description: "",
    maxVolume: 85,
    autoFade: true,
    allowGuests: true,
    priorityLevel: 2,
  });

  // Load zones and set up real-time updates
  useEffect(() => {
    const updateZones = () => {
      const zonesData = zoneManager.getZones();
      setAllZones(zonesData);
    };

    updateZones();

    // Real-time updates
    const interval = setInterval(updateZones, 3000);

    const handleZoneUpdate = () => updateZones();
    zoneManager.on("zoneUpdated", handleZoneUpdate);
    zoneManager.on("deviceUpdated", handleZoneUpdate);

    return () => {
      clearInterval(interval);
      zoneManager.off("zoneUpdated", handleZoneUpdate);
      zoneManager.off("deviceUpdated", handleZoneUpdate);
    };
  }, [zoneManager]);

  // Filter and sort zones
  const filteredAndSortedZones = allZones
    .filter((zone) => {
      if (filterStatus === "all") return true;
      return zone.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "location":
          return a.location.localeCompare(b.location);
        case "volume":
          return b.volume - a.volume;
        case "devices":
          return b.devices.length - a.devices.length;
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case ZONE_STATUS.ONLINE:
        return "bg-green-500";
      case ZONE_STATUS.OFFLINE:
        return "bg-red-500";
      case ZONE_STATUS.ERROR:
        return "bg-orange-500";
      case ZONE_STATUS.SYNCING:
        return "bg-blue-500";
      case ZONE_STATUS.EMERGENCY_STOP:
        return "bg-red-700";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ZONE_STATUS.ONLINE:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case ZONE_STATUS.OFFLINE:
        return <XCircle className="w-5 h-5 text-red-400" />;
      case ZONE_STATUS.ERROR:
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case ZONE_STATUS.SYNCING:
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case ZONE_STATUS.EMERGENCY_STOP:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleZoneSwitch = (zone) => {
    setCurrentZone(zone);
    updateZone(zone.id, { lastActivity: new Date().toISOString() });

    addNotification({
      type: "success",
      title: "Zone Changed",
      message: `Switched to ${zone.name}`,
      priority: "normal",
    });
  };

  const handleCreateZone = () => {
    if (!newZone.name.trim() || !newZone.location.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Zone name and location are required",
        priority: "high",
      });
      return;
    }

    const zoneData = {
      ...newZone,
      status: ZONE_STATUS.OFFLINE,
      volume: 50,
      muted: false,
      devices: [],
      currentPlaylist: null,
      activeSince: null,
      lastActivity: new Date().toISOString(),
      settings: {
        maxVolume: newZone.maxVolume,
        autoFade: newZone.autoFade,
        emergencyStopEnabled: true,
        allowGuests: newZone.allowGuests,
        priorityLevel: newZone.priorityLevel,
      },
      stats: {
        totalPlaytime: 0,
        tracksPlayed: 0,
        averageVolume: 0,
        peakVolume: 0,
        connectedUsers: 0,
      },
      network: {
        ipAddress: `192.168.1.${Math.floor(Math.random() * 200) + 50}`,
        quality: "unknown",
        latency: 0,
        bandwidth: 0,
        lastPing: Date.now(),
      },
    };

    const createdZone = addZone(zoneData);

    setShowCreateModal(false);
    setNewZone({
      name: "",
      location: "",
      description: "",
      maxVolume: 85,
      autoFade: true,
      allowGuests: true,
      priorityLevel: 2,
    });

    addNotification({
      type: "success",
      title: "Zone Created",
      message: `Created zone "${zoneData.name}"`,
      priority: "normal",
    });
  };

  const handleEditZone = (zone) => {
    setSelectedZoneForEdit(zone);
    setNewZone({
      name: zone.name,
      location: zone.location,
      description: zone.description,
      maxVolume: zone.settings.maxVolume,
      autoFade: zone.settings.autoFade,
      allowGuests: zone.settings.allowGuests,
      priorityLevel: zone.settings.priorityLevel,
    });
    setShowEditModal(true);
  };

  const handleUpdateZone = () => {
    if (!selectedZoneForEdit) return;

    const updates = {
      name: newZone.name,
      location: newZone.location,
      description: newZone.description,
      settings: {
        ...selectedZoneForEdit.settings,
        maxVolume: newZone.maxVolume,
        autoFade: newZone.autoFade,
        allowGuests: newZone.allowGuests,
        priorityLevel: newZone.priorityLevel,
      },
    };

    updateZone(selectedZoneForEdit.id, updates);
    zoneManager.updateZone(selectedZoneForEdit.id, updates);

    setShowEditModal(false);
    setSelectedZoneForEdit(null);

    addNotification({
      type: "success",
      title: "Zone Updated",
      message: `Updated zone "${newZone.name}"`,
      priority: "normal",
    });
  };

  const handleBulkAction = (action) => {
    const selectedZoneIds = Array.from(selectedZones);

    switch (action) {
      case "mute":
        selectedZoneIds.forEach((zoneId) => {
          zoneManager.updateZone(zoneId, { muted: true, volume: 0 });
        });
        addNotification({
          type: "info",
          title: "Zones Muted",
          message: `Muted ${selectedZoneIds.length} zones`,
          priority: "normal",
        });
        break;

      case "unmute":
        selectedZoneIds.forEach((zoneId) => {
          zoneManager.updateZone(zoneId, { muted: false, volume: 50 });
        });
        addNotification({
          type: "info",
          title: "Zones Unmuted",
          message: `Unmuted ${selectedZoneIds.length} zones`,
          priority: "normal",
        });
        break;

      case "emergency_stop":
        selectedZoneIds.forEach((zoneId) => {
          zoneManager.updateZone(zoneId, {
            status: ZONE_STATUS.EMERGENCY_STOP,
            muted: true,
            volume: 0,
          });
        });
        addNotification({
          type: "warning",
          title: "Emergency Stop Activated",
          message: `Emergency stop activated for ${selectedZoneIds.length} zones`,
          priority: "high",
        });
        break;
    }

    setSelectedZones(new Set());
  };

  const handleZoneSelect = (zoneId) => {
    const newSelection = new Set(selectedZones);
    if (newSelection.has(zoneId)) {
      newSelection.delete(zoneId);
    } else {
      newSelection.add(zoneId);
    }
    setSelectedZones(newSelection);
  };

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Zone Management</h1>
              <p className="text-gray-400">
                Currently in:{" "}
                <span className="font-medium text-blue-400">
                  {currentZone?.name || "No Zone Selected"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Zone
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value={ZONE_STATUS.ONLINE}>Online</option>
            <option value={ZONE_STATUS.OFFLINE}>Offline</option>
            <option value={ZONE_STATUS.ERROR}>Error</option>
            <option value={ZONE_STATUS.EMERGENCY_STOP}>Emergency Stop</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="location">Sort by Location</option>
            <option value="volume">Sort by Volume</option>
            <option value="devices">Sort by Device Count</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-700 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedZones.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-400">
                {selectedZones.size} selected
              </span>
              <button
                onClick={() => handleBulkAction("mute")}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors"
              >
                Mute
              </button>
              <button
                onClick={() => handleBulkAction("unmute")}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              >
                Unmute
              </button>
              <button
                onClick={() => handleBulkAction("emergency_stop")}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                Emergency Stop
              </button>
              <button
                onClick={() => setSelectedZones(new Set())}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zone Grid/List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredAndSortedZones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ArrowRightLeft className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No zones found</p>
            <p className="text-sm">Create your first zone to get started</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedZones.map((zone) => (
              <div
                key={zone.id}
                className={`bg-gray-800 rounded-lg p-6 border transition-all cursor-pointer hover:border-gray-600 ${
                  currentZone?.id === zone.id
                    ? "border-blue-500 bg-blue-900/20"
                    : selectedZones.has(zone.id)
                      ? "border-yellow-500 bg-yellow-900/10"
                      : "border-gray-700"
                }`}
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedZones.has(zone.id)}
                      onChange={() => handleZoneSelect(zone.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded"
                    />
                    <div>
                      <h3 className="font-semibold text-lg truncate">
                        {zone.name}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {zone.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(zone.status)}
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(zone.status)}`}
                    />
                  </div>
                </div>

                {/* Zone Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Volume</span>
                    <span className={zone.muted ? "text-red-400" : ""}>
                      {zone.volume}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Devices</span>
                    <span>{zone.devices.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Users</span>
                    <span>{zone.stats.connectedUsers}</span>
                  </div>

                  {zone.currentPlaylist && (
                    <div className="text-sm">
                      <span className="text-gray-400">Playing: </span>
                      <span className="text-blue-400">
                        {zone.currentPlaylist}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleZoneSwitch(zone)}
                    disabled={currentZone?.id === zone.id}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                      currentZone?.id === zone.id
                        ? "bg-blue-600 text-white cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    {currentZone?.id === zone.id ? "Current" : "Switch"}
                  </button>

                  <button
                    onClick={() => handleEditZone(zone)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    title="Edit Zone"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedZones.map((zone) => (
              <div
                key={zone.id}
                className={`flex items-center gap-4 p-4 bg-gray-800 rounded-lg border transition-all ${
                  currentZone?.id === zone.id
                    ? "border-blue-500 bg-blue-900/20"
                    : selectedZones.has(zone.id)
                      ? "border-yellow-500 bg-yellow-900/10"
                      : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedZones.has(zone.id)}
                  onChange={() => handleZoneSelect(zone.id)}
                  className="rounded"
                />

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(zone.status)}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{zone.name}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {zone.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Volume</p>
                    <p className={zone.muted ? "text-red-400" : ""}>
                      {zone.volume}%
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400">Devices</p>
                    <p>{zone.devices.length}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400">Users</p>
                    <p>{zone.stats.connectedUsers}</p>
                  </div>

                  <div className="text-center min-w-0">
                    <p className="text-gray-400">Playlist</p>
                    <p className="truncate max-w-24">
                      {zone.currentPlaylist || "None"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleZoneSwitch(zone)}
                    disabled={currentZone?.id === zone.id}
                    className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                      currentZone?.id === zone.id
                        ? "bg-blue-600 text-white cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    {currentZone?.id === zone.id ? "Current" : "Switch"}
                  </button>

                  <button
                    onClick={() => handleEditZone(zone)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    title="Edit Zone"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Zone Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Zone</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) =>
                    setNewZone({ ...newZone, name: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="Enter zone name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) =>
                    setNewZone({ ...newZone, location: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newZone.description}
                  onChange={(e) =>
                    setNewZone({ ...newZone, description: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Volume
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={newZone.maxVolume}
                  onChange={(e) =>
                    setNewZone({
                      ...newZone,
                      maxVolume: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>50%</span>
                  <span>{newZone.maxVolume}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newZone.autoFade}
                    onChange={(e) =>
                      setNewZone({ ...newZone, autoFade: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Auto fade between tracks</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newZone.allowGuests}
                    onChange={(e) =>
                      setNewZone({ ...newZone, allowGuests: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Allow guest access</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateZone}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {showEditModal && selectedZoneForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Zone</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) =>
                    setNewZone({ ...newZone, name: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) =>
                    setNewZone({ ...newZone, location: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newZone.description}
                  onChange={(e) =>
                    setNewZone({ ...newZone, description: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Volume
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={newZone.maxVolume}
                  onChange={(e) =>
                    setNewZone({
                      ...newZone,
                      maxVolume: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>50%</span>
                  <span>{newZone.maxVolume}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newZone.autoFade}
                    onChange={(e) =>
                      setNewZone({ ...newZone, autoFade: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Auto fade between tracks</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newZone.allowGuests}
                    onChange={(e) =>
                      setNewZone({ ...newZone, allowGuests: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Allow guest access</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateZone}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
              >
                Update Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

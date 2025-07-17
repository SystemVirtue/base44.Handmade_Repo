import React, { useState } from "react";
import {
  Users,
  Plus,
  Settings,
  Wifi,
  Volume2,
  Play,
  Pause,
  MapPin,
  Edit,
} from "lucide-react";

export default function ChangeMusicZone() {
  const [selectedZone, setSelectedZone] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock zones data
  const musicZones = [
    {
      id: 1,
      name: "Main Floor - Restaurant",
      location: "Building A, Floor 1",
      status: "online",
      currentSong: "Shape of You - Ed Sheeran",
      volume: 75,
      devices: 4,
      users: 12,
      lastActive: "Active now",
      description: "Primary dining area with ambient background music",
    },
    {
      id: 2,
      name: "Bar & Lounge",
      location: "Building A, Floor 2",
      status: "online",
      currentSong: "Blinding Lights - The Weeknd",
      volume: 85,
      devices: 3,
      users: 8,
      lastActive: "Active now",
      description: "Upbeat music zone for evening entertainment",
    },
    {
      id: 3,
      name: "Private Event Room",
      location: "Building B, Floor 1",
      status: "offline",
      currentSong: "No music playing",
      volume: 0,
      devices: 2,
      users: 0,
      lastActive: "2 hours ago",
      description: "Configurable space for special events and parties",
    },
    {
      id: 4,
      name: "Outdoor Patio",
      location: "Building A, Outdoor",
      status: "online",
      currentSong: "Levitating - Dua Lipa",
      volume: 60,
      devices: 6,
      users: 5,
      lastActive: "Active now",
      description: "Weather-dependent outdoor dining and entertainment area",
    },
  ];

  const currentZone =
    musicZones.find((zone) => zone.id === selectedZone) || musicZones[0];

  const handleZoneSwitch = (zoneId) => {
    setSelectedZone(zoneId);
    // In a real app, this would trigger zone switching logic
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Change Music Zone</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Zone
        </button>
      </div>

      {/* Current Zone Status */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Currently Active Zone</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{currentZone.name}</h3>
              <p className="text-gray-400">{currentZone.location}</p>
              <p className="text-sm text-gray-500">{currentZone.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 ${
                currentZone.status === "online"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  currentZone.status === "online"
                    ? "bg-green-400 animate-pulse"
                    : "bg-red-400"
                }`}
              ></div>
              <span className="text-sm font-medium capitalize">
                {currentZone.status}
              </span>
            </div>
            <p className="text-sm text-gray-400">{currentZone.lastActive}</p>
          </div>
        </div>
      </div>

      {/* Available Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {musicZones.map((zone) => (
          <div
            key={zone.id}
            className={`bg-gray-800 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
              selectedZone === zone.id
                ? "ring-2 ring-blue-500 bg-gray-750"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleZoneSwitch(zone.id)}
          >
            {/* Zone Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    zone.status === "online" ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{zone.name}</h3>
                  <p className="text-sm text-gray-400">{zone.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white">
                  <Settings className="w-4 h-4" />
                </button>
                <div
                  className={`w-3 h-3 rounded-full ${
                    zone.status === "online" ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
              </div>
            </div>

            {/* Zone Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-blue-400">
                  {zone.devices}
                </div>
                <div className="text-xs text-gray-400">Devices</div>
              </div>
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-green-400">
                  {zone.users}
                </div>
                <div className="text-xs text-gray-400">Users</div>
              </div>
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-purple-400">
                  {zone.volume}%
                </div>
                <div className="text-xs text-gray-400">Volume</div>
              </div>
            </div>

            {/* Currently Playing */}
            <div className="flex items-center gap-3 mb-4">
              {zone.status === "online" ? (
                <>
                  <Play className="w-4 h-4 text-green-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {zone.currentSong}
                    </p>
                    <p className="text-xs text-gray-400">Now Playing</p>
                  </div>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">{zone.currentSong}</p>
                  </div>
                </>
              )}
            </div>

            {/* Zone Description */}
            <p className="text-sm text-gray-500 mb-4">{zone.description}</p>

            {/* Zone Actions */}
            <div className="flex gap-2">
              {selectedZone === zone.id ? (
                <div className="flex-1 bg-blue-600 text-white text-center py-2 rounded text-sm font-medium">
                  Current Zone
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoneSwitch(zone.id);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors"
                >
                  Switch to Zone
                </button>
              )}
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Zone Management */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Zone Management</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors">
            <Settings className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-sm font-medium">Zone Settings</div>
            <div className="text-xs text-gray-400">
              Configure audio and permissions
            </div>
          </button>

          <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors">
            <Volume2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-sm font-medium">Audio Sync</div>
            <div className="text-xs text-gray-400">
              Synchronize playback across zones
            </div>
          </button>

          <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors">
            <Wifi className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-sm font-medium">Network Status</div>
            <div className="text-xs text-gray-400">Check zone connectivity</div>
          </button>
        </div>
      </div>

      {/* Create Zone Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Create New Music Zone
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
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
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-20"
                  placeholder="Enter zone description"
                />
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
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

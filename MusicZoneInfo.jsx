import React, { useState } from "react";
import {
  Info,
  Volume2,
  Wifi,
  Users,
  Play,
  TrendingUp,
  Clock,
  Music,
} from "lucide-react";

export default function MusicZoneInfo() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");

  // Mock zone data
  const zoneInfo = {
    name: "Main Floor - Restaurant",
    location: "Building A, Floor 1",
    status: "online",
    activeSince: "08:00 AM",
    currentPlaylist: "Afternoon Vibes",
    volume: 75,
    quality: "High (320kbps)",
    connectedDevices: 4,
    networkStatus: "excellent",
  };

  const devicesList = [
    {
      id: 1,
      name: "Speaker Zone A",
      type: "audio",
      status: "connected",
      volume: 80,
    },
    {
      id: 2,
      name: "Speaker Zone B",
      type: "audio",
      status: "connected",
      volume: 70,
    },
    {
      id: 3,
      name: "Display Panel 1",
      type: "display",
      status: "connected",
      volume: 0,
    },
    {
      id: 4,
      name: "Amplifier Main",
      type: "amplifier",
      status: "connected",
      volume: 85,
    },
  ];

  const analytics = {
    today: {
      songsPlayed: 127,
      totalPlaytime: "8h 42m",
      mostPlayedGenre: "Pop",
      peakHours: "12:00 - 14:00",
      userInteractions: 23,
    },
    week: {
      songsPlayed: 892,
      totalPlaytime: "62h 15m",
      mostPlayedGenre: "Rock",
      peakHours: "12:00 - 14:00",
      userInteractions: 156,
    },
    month: {
      songsPlayed: 3847,
      totalPlaytime: "267h 30m",
      mostPlayedGenre: "Pop",
      peakHours: "12:00 - 14:00",
      userInteractions: 678,
    },
  };

  const topSongs = [
    {
      title: "Shape of You",
      artist: "Ed Sheeran",
      plays: 23,
      duration: "3:53",
    },
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      plays: 19,
      duration: "3:20",
    },
    {
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      plays: 17,
      duration: "2:54",
    },
    { title: "Levitating", artist: "Dua Lipa", plays: 15, duration: "3:23" },
    {
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      plays: 14,
      duration: "2:58",
    },
  ];

  const currentStats = analytics[selectedTimeframe];

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <Info className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold">Music Zone Information</h1>
      </div>

      {/* Zone Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{zoneInfo.name}</h2>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                zoneInfo.status === "online"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  zoneInfo.status === "online" ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <span className="text-sm font-medium capitalize">
                {zoneInfo.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="font-medium">{zoneInfo.location}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Since</p>
              <p className="font-medium">{zoneInfo.activeSince}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Current Playlist</p>
              <p className="font-medium flex items-center gap-2">
                <Music className="w-4 h-4" />
                {zoneInfo.currentPlaylist}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Audio Quality</p>
              <p className="font-medium">{zoneInfo.quality}</p>
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Master Volume</span>
              <span className="font-medium">{zoneInfo.volume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${zoneInfo.volume}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Connected Devices</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {zoneInfo.connectedDevices}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Wifi className="w-5 h-5 text-green-400" />
              <span className="font-medium">Network Status</span>
            </div>
            <div className="text-lg font-semibold text-green-400 capitalize">
              {zoneInfo.networkStatus}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Play className="w-5 h-5 text-purple-400" />
              <span className="font-medium">Songs Today</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {currentStats.songsPlayed}
            </div>
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Connected Devices</h3>
          <div className="space-y-3">
            {devicesList.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      device.status === "connected"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-gray-400 capitalize">
                      {device.type}
                    </p>
                  </div>
                </div>
                {device.type === "audio" && (
                  <div className="text-sm text-gray-400">{device.volume}%</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Timeframe Selector */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analytics</h3>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <div className="text-lg font-bold text-blue-400">
                {currentStats.songsPlayed}
              </div>
              <div className="text-sm text-gray-400">Songs Played</div>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <div className="text-lg font-bold text-green-400">
                {currentStats.totalPlaytime}
              </div>
              <div className="text-sm text-gray-400">Total Playtime</div>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <div className="text-lg font-bold text-purple-400">
                {currentStats.mostPlayedGenre}
              </div>
              <div className="text-sm text-gray-400">Top Genre</div>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <div className="text-lg font-bold text-yellow-400">
                {currentStats.userInteractions}
              </div>
              <div className="text-sm text-gray-400">Interactions</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-700 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium">Peak Hours</span>
            </div>
            <div className="text-orange-400 font-semibold">
              {currentStats.peakHours}
            </div>
          </div>
        </div>
      </div>

      {/* Top Songs */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold">
            Most Played Songs ({selectedTimeframe})
          </h3>
        </div>

        <div className="space-y-2">
          {topSongs.map((song, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-gray-700 rounded"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{song.title}</p>
                <p className="text-gray-400 text-sm">{song.artist}</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-400">{song.plays}</p>
                <p className="text-gray-400 text-xs">plays</p>
              </div>
              <div className="text-gray-400 text-sm">{song.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

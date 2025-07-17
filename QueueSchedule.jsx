import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Pause,
  SkipForward,
  Trash2,
} from "lucide-react";

export default function QueueSchedule() {
  const [activeTab, setActiveTab] = useState("queue");

  // Mock data for demonstration
  const queueItems = [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      duration: "5:55",
      position: 1,
      status: "playing",
    },
    {
      id: 2,
      title: "Hotel California",
      artist: "Eagles",
      duration: "6:30",
      position: 2,
      status: "queued",
    },
    {
      id: 3,
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      duration: "8:02",
      position: 3,
      status: "queued",
    },
  ];

  const scheduleSlots = [
    {
      id: 1,
      name: "Morning Mix",
      startTime: "08:00",
      endTime: "12:00",
      type: "playlist",
      active: true,
    },
    {
      id: 2,
      name: "Lunch Break",
      startTime: "12:00",
      endTime: "13:00",
      type: "random",
      active: true,
    },
    {
      id: 3,
      name: "Afternoon Vibes",
      startTime: "13:00",
      endTime: "17:00",
      type: "playlist",
      active: false,
    },
  ];

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <h1 className="text-3xl font-bold mb-6">Queue & Schedule Lists</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === "queue"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Current Queue
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === "schedule"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Schedule
        </button>
      </div>

      {activeTab === "queue" && (
        <div className="space-y-6">
          {/* Queue Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Queue</h2>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Songs
              </button>
            </div>

            {/* Queue Items */}
            <div className="space-y-3">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
                >
                  <div className="text-gray-400 w-8">{item.position}</div>

                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.artist}</p>
                  </div>

                  <div className="text-gray-400 text-sm">{item.duration}</div>

                  <div className="flex items-center gap-2">
                    {item.status === "playing" ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs">PLAYING</span>
                      </div>
                    ) : (
                      <button className="text-gray-400 hover:text-white">
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button className="text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queue Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">3</div>
              <div className="text-gray-400">Songs in Queue</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">20:27</div>
              <div className="text-gray-400">Total Duration</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">2</div>
              <div className="text-gray-400">Upcoming</div>
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
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Schedule
              </button>
            </div>

            {/* Schedule Items */}
            <div className="space-y-3">
              {scheduleSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg"
                >
                  <Calendar className="w-5 h-5 text-blue-400" />

                  <div className="flex-1">
                    <p className="font-medium">{slot.name}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>

                  <div className="text-sm text-gray-400 capitalize">
                    {slot.type}
                  </div>

                  <div
                    className={`w-3 h-3 rounded-full ${slot.active ? "bg-green-400" : "bg-gray-500"}`}
                  ></div>

                  <button className="text-gray-400 hover:text-white">
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Overview */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            <div className="grid grid-cols-24 gap-1 h-8">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className={`rounded ${
                    i >= 8 && i < 12
                      ? "bg-blue-600"
                      : i >= 12 && i < 13
                        ? "bg-green-600"
                        : i >= 13 && i < 17
                          ? "bg-purple-600"
                          : "bg-gray-600"
                  }`}
                  title={`${i}:00`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

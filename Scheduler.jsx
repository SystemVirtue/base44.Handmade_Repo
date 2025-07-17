import React, { useState } from "react";
import { Calendar, Clock, Plus, Play, Settings, Zap } from "lucide-react";

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");

  // Mock scheduled events
  const events = [
    {
      id: 1,
      title: "Morning Playlist",
      start: "08:00",
      end: "12:00",
      day: "monday",
      type: "playlist",
      active: true,
    },
    {
      id: 2,
      title: "Lunch Break Mix",
      start: "12:00",
      end: "13:00",
      day: "monday",
      type: "auto",
      active: true,
    },
    {
      id: 3,
      title: "Afternoon Energy",
      start: "13:00",
      end: "17:00",
      day: "monday",
      type: "playlist",
      active: false,
    },
  ];

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`,
  );

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Scheduler</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 rounded ${viewMode === "day" ? "bg-blue-600" : "bg-gray-800"}`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded ${viewMode === "week" ? "bg-blue-600" : "bg-gray-800"}`}
          >
            Week
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-8 gap-1 mb-4">
          <div className="p-2 text-center font-semibold">Time</div>
          {days.map((day) => (
            <div
              key={day}
              className="p-2 text-center font-semibold text-blue-400"
            >
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {hours.slice(6, 22).map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
              <div className="p-2 text-sm text-gray-400 text-center">
                {hour}
              </div>
              {days.map((day, dayIndex) => {
                const event = events.find(
                  (e) =>
                    e.day === day.toLowerCase() &&
                    parseInt(e.start.split(":")[0]) ===
                      parseInt(hour.split(":")[0]),
                );

                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`p-1 min-h-8 border border-gray-700 rounded ${
                      event
                        ? event.type === "playlist"
                          ? "bg-blue-600/50"
                          : "bg-green-600/50"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    {event && (
                      <div className="text-xs font-medium truncate">
                        {event.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Rules */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Automation Rules
            </h2>
            <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
              Add Rule
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Weather-Based Playlist</span>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-400">
                Play "Rainy Day Mix" when weather is rainy
              </p>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Off-Hours Silence</span>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-400">
                Automatically pause music after 10 PM
              </p>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Volume Auto-Adjust</span>
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-400">
                Lower volume during lunch hours
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Templates */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Schedule Templates
            </h2>
            <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
              New Template
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Standard Workday</span>
                <button className="text-blue-400 hover:text-blue-300">
                  <Play className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400">
                8 AM - 5 PM schedule with breaks
              </p>
            </div>

            <div className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Weekend Vibes</span>
                <button className="text-blue-400 hover:text-blue-300">
                  <Play className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Relaxed weekend music schedule
              </p>
            </div>

            <div className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Event Schedule</span>
                <button className="text-blue-400 hover:text-blue-300">
                  <Play className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Special event with custom timing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

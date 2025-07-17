import React, { useState } from "react";
import {
  MessageSquare,
  Bell,
  Search,
  Filter,
  Reply,
  Archive,
  Trash2,
} from "lucide-react";

export default function Messages() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all");

  // Mock messages data
  const messages = [
    {
      id: 1,
      subject: "System Update Available",
      sender: "System",
      preview: "A new version of DJAMMS is available for download...",
      timestamp: "2 hours ago",
      unread: true,
      type: "system",
      content:
        "A new version of DJAMMS (v3.29.0) is available for download. This update includes new features for playlist management and bug fixes for audio playback.",
      priority: "medium",
    },
    {
      id: 2,
      subject: "Queue Conflict Detected",
      sender: "Scheduler",
      preview: "Multiple playlists scheduled for the same time slot...",
      timestamp: "4 hours ago",
      unread: true,
      type: "alert",
      content:
        "A scheduling conflict has been detected between 'Morning Mix' and 'Breakfast Playlist' for 8:00 AM - 10:00 AM on Monday.",
      priority: "high",
    },
    {
      id: 3,
      subject: "Weekly Report Ready",
      sender: "Analytics",
      preview: "Your weekly music analytics report is ready for review...",
      timestamp: "1 day ago",
      unread: false,
      type: "report",
      content:
        "Your weekly analytics report shows increased engagement during lunch hours. Top played songs and user preferences are included.",
      priority: "low",
    },
    {
      id: 4,
      subject: "New Spotify Integration",
      sender: "Admin",
      preview: "Spotify integration has been successfully configured...",
      timestamp: "2 days ago",
      unread: true,
      type: "user",
      content:
        "The Spotify integration has been successfully configured for your music zone. You can now access millions of songs directly from the search interface.",
      priority: "medium",
    },
  ];

  const filteredMessages = messages.filter(
    (message) => filter === "all" || message.type === filter,
  );

  const unreadCount = messages.filter((m) => m.unread).length;

  const messageTypes = [
    { id: "all", label: "All Messages", count: messages.length },
    {
      id: "system",
      label: "System",
      count: messages.filter((m) => m.type === "system").length,
    },
    {
      id: "alert",
      label: "Alerts",
      count: messages.filter((m) => m.type === "alert").length,
    },
    {
      id: "user",
      label: "User",
      count: messages.filter((m) => m.type === "user").length,
    },
  ];

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8" />
          Messages
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>

        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-full">
        {/* Message List */}
        <div className="w-1/3 space-y-4">
          {/* Search and Filters */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-gray-700 border border-gray-600 rounded pl-9 pr-4 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              {messageTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilter(type.id)}
                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                    filter === type.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <span>{type.label}</span>
                  <span>{type.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id
                    ? "ring-2 ring-blue-500"
                    : "hover:bg-gray-700"
                } ${message.unread ? "border-l-4 border-blue-500" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {message.sender}
                    </span>
                    {message.priority === "high" && (
                      <span className="bg-red-600 text-xs px-1 py-0.5 rounded">
                        HIGH
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {message.timestamp}
                  </span>
                </div>

                <h3
                  className={`font-medium mb-1 ${message.unread ? "text-white" : "text-gray-300"}`}
                >
                  {message.subject}
                </h3>

                <p className="text-sm text-gray-400 line-clamp-2">
                  {message.preview}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      message.type === "system"
                        ? "bg-blue-600/20 text-blue-400"
                        : message.type === "alert"
                          ? "bg-red-600/20 text-red-400"
                          : message.type === "user"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-gray-600/20 text-gray-400"
                    }`}
                  >
                    {message.type.toUpperCase()}
                  </span>

                  {message.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="flex-1">
          {selectedMessage ? (
            <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
              {/* Message Header */}
              <div className="border-b border-gray-700 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-white">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>From: {selectedMessage.sender}</span>
                  <span>{selectedMessage.timestamp}</span>
                  <span
                    className={`px-2 py-1 rounded ${
                      selectedMessage.priority === "high"
                        ? "bg-red-600/20 text-red-400"
                        : selectedMessage.priority === "medium"
                          ? "bg-yellow-600/20 text-yellow-400"
                          : "bg-green-600/20 text-green-400"
                    }`}
                  >
                    {selectedMessage.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto">
                <p className="text-gray-300 leading-relaxed">
                  {selectedMessage.content}
                </p>

                {/* Actions for specific message types */}
                {selectedMessage.type === "alert" && (
                  <div className="mt-6 p-4 bg-red-600/10 border border-red-600/20 rounded">
                    <h4 className="font-semibold text-red-400 mb-2">
                      Action Required
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      This scheduling conflict needs to be resolved to prevent
                      playback issues.
                    </p>
                    <div className="flex gap-2">
                      <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">
                        Resolve Conflict
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm">
                        View Schedule
                      </button>
                    </div>
                  </div>
                )}

                {selectedMessage.type === "system" && (
                  <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded">
                    <h4 className="font-semibold text-blue-400 mb-2">
                      System Update
                    </h4>
                    <div className="flex gap-2">
                      <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                        Update Now
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm">
                        Schedule Later
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

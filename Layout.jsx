import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Play,
  Music,
  Monitor,
  Settings,
  Calendar,
  Search,
  MessageSquare,
  Info,
  Volume2,
  Users,
  Palette,
} from "lucide-react";

const navigationItems = [
  {
    title: "Current Playlist",
    url: "/dashboard",
    icon: Play,
    badge: null,
  },
  {
    title: "Digital Signage",
    url: "/digital-signage",
    icon: Monitor,
    badge: null,
  },
  {
    title: "Video Output",
    url: "/video-output",
    icon: Monitor,
    badge: null,
  },
  {
    title: "Controls",
    url: "/controls",
    icon: Settings,
    badge: null,
  },
  {
    title: "Queue / Schedule Lists",
    url: "/queue-schedule",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Search Songs",
    url: "/search-songs",
    icon: Search,
    badge: null,
  },
  {
    title: "Scheduler",
    url: "/scheduler",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    badge: null,
  },
  {
    title: "UI Look & Feel",
    url: "/ui-look-and-feel",
    icon: Palette,
    badge: null,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
    badge: 4,
  },
  {
    title: "Music Zone Information",
    url: "/music-zone-info",
    icon: Info,
    badge: null,
  },
  {
    title: "Change Music Zone",
    url: "/change-music-zone",
    icon: Users,
    badge: null,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentTrack] = useState({
    title: "Deep Cover (Explicit)",
    artist: "FAT JOE",
    isPlaying: true,
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 flex flex-col relative text-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Manage My DJAMMS
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.url
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Spotify Integration */}
          <div className="p-4 border-t border-gray-700">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-full py-2 px-4 transition-colors">
              <span className="mr-2">●</span>
              SPOTIFY LOG IN
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Contact Us</p>
                <p className="text-xs text-gray-400">DJAMMS</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Version 3.28.12 • Tue Jul 08 2025
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-16 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-between px-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"
                  alt="Album cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{currentTrack.title}</h2>
                <p className="text-sm text-gray-200">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full bg-green-400 ${currentTrack.isPlaying ? "animate-pulse" : ""}`}
                ></div>
                <span className="text-white font-medium">PLAYING</span>
              </div>
              <div className="text-sm text-gray-200">
                FATH02A-1 • <Volume2 className="w-4 h-4 inline ml-1" />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto bg-gray-900">{children}</div>
        </div>
      </div>
    </div>
  );
}

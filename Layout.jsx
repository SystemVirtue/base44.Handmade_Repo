import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  LogOut,
  VolumeX,
  Menu,
  X,
} from "lucide-react";
import {
  useAudioStore,
  useUIStore,
  useZoneStore,
  formatTime,
} from "./store.js";
import { useAuth } from "./src/contexts/AuthContext.jsx";
import { useError } from "./src/contexts/ErrorContext.jsx";
import useNetworkStatus from "./src/hooks/useNetworkStatus.js";
import { NetworkStatus } from "./components/ui/shared.jsx";
import NotificationSystem from "./components/ui/notification-system.jsx";

const navigationItems = [
  {
    title: "Current Playlist",
    url: "/dashboard",
    icon: Play,
    badge: null,
    key: "dashboard",
  },
  {
    title: "Digital Signage",
    url: "/digital-signage",
    icon: Monitor,
    badge: null,
    key: "digital-signage",
  },
  {
    title: "Video Output",
    url: "/video-output",
    icon: Monitor,
    badge: null,
    key: "video-output",
  },
  {
    title: "Controls",
    url: "/controls",
    icon: Settings,
    badge: null,
    key: "controls",
  },
  {
    title: "Queue & Playlist Manager",
    url: "/queue-schedule",
    icon: Calendar,
    badge: null,
    key: "queue-schedule",
  },
  {
    title: "Search Songs",
    url: "/search-songs",
    icon: Search,
    badge: null,
    key: "search-songs",
  },
  {
    title: "Scheduler",
    url: "/scheduler",
    icon: Calendar,
    badge: null,
    key: "scheduler",
  },
  {
    title: "UI Look & Feel",
    url: "/ui-look-and-feel",
    icon: Palette,
    badge: null,
    key: "ui-look-and-feel",
  },
  {
    title: "Messages and Logs",
    url: "/messages",
    icon: MessageSquare,
    badge: null, // Will be dynamically set
    key: "messages",
  },
  {
    title: "Network and Devices",
    url: "/music-zone-info",
    icon: Info,
    badge: null,
    key: "music-zone-info",
  },
  {
    title: "System Settings",
    url: "/settings",
    icon: Settings,
    badge: null,
    key: "settings",
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showError, showWarning } = useError();
  const { isOnline, connectionType } = useNetworkStatus();

  // Store state
  const {
    currentVideo,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    togglePlayPause,
    setVolume,
    toggleMute,
    nextTrack,
    previousTrack,
  } = useAudioStore();

  const {
    theme,
    sidebarCollapsed,
    notifications,
    toggleSidebar,
    setActiveTab,
  } = useUIStore();

  const { currentZone } = useZoneStore();

  // Local state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Update current page when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedItem = navigationItems.find(
      (item) => item.url === currentPath,
    );
    if (matchedItem) {
      setActiveTab(matchedItem.key);
    }
  }, [location.pathname, setActiveTab]);

  // Get unread message count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Update messages badge
  navigationItems.find((item) => item.key === "messages").badge =
    unreadCount > 0 ? unreadCount : null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    setShowVolumeSlider(false);
  };

  const getActiveClassForItem = (item) => {
    return location.pathname === item.url
      ? "bg-blue-600 text-white shadow-lg"
      : "text-gray-300 hover:text-white hover:bg-gray-700";
  };

  return (
    <div className="min-h-screen themed-text-primary" style={{backgroundColor: 'var(--color-background)'}}>
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-64"} ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } fixed lg:relative inset-y-0 left-0 z-50 bg-gray-800 flex flex-col transition-all duration-300 ease-in-out`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-lg font-bold text-white">DJAMMS</h1>
                    <p className="text-xs text-gray-400">Music Management</p>
                  </div>
                )}
              </div>

              {/* Mobile close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getActiveClassForItem(item)}`}
                  title={sidebarCollapsed ? item.title : ""}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {sidebarCollapsed && item.badge && (
                    <div className="absolute left-8 top-1 w-3 h-3 bg-red-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Current Zone Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-700">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentZone.status === "online"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  <span className="text-xs font-medium text-gray-300">
                    Current Zone
                  </span>
                </div>
                <p className="text-sm font-medium text-white truncate">
                  {currentZone.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentZone.location}
                </p>
              </div>
            </div>
          )}

          {/* User section and controls */}
          <div className="p-4 border-t border-gray-700">
            {!sidebarCollapsed ? (
              <>
                {/* Spotify Integration */}
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-full py-2 px-4 transition-colors mb-3 text-sm">
                  <span className="mr-2">●</span>
                  SPOTIFY LOG IN
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name || user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-400">Logged in</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full p-2 text-gray-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Version */}
            <div className="text-xs text-gray-500 text-center">v3.28.12</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="h-16 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-between px-6 shadow-lg relative">
            {/* Left side - Mobile menu + Track info */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Sidebar toggle (desktop) */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:block p-2 text-white hover:bg-white/10 rounded transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Current video info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={currentVideo?.thumbnail || 'https://via.placeholder.com/48x48/374151/9ca3af?text=No+Video'}
                    alt={currentVideo?.title || 'No video'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48/374151/9ca3af?text=No+Video';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white truncate">
                    {currentVideo?.title || 'No video selected'}
                  </h2>
                  <p className="text-sm text-gray-200 truncate">
                    {currentVideo?.channelTitle || 'Unknown channel'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Controls and status */}
            <div className="flex items-center gap-4">
              {/* Playback controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={previousTrack}
                  className="p-1 text-white hover:bg-white/10 rounded transition-colors"
                  title="Previous track"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  className="p-1 text-white hover:bg-white/10 rounded transition-colors"
                  title="Next track"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>

              {/* Volume control */}
              <div className="relative">
                <button
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  onDoubleClick={toggleMute}
                  className="p-1 text-white hover:bg-white/10 rounded transition-colors"
                  title={`Volume: ${volume}%`}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {showVolumeSlider && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg p-3 shadow-lg z-50">
                    <div className="flex items-center gap-2 w-24">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) =>
                          handleVolumeChange(parseInt(e.target.value))
                        }
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-400 w-8">
                        {volume}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-white font-medium">
                    {isPlaying ? "PLAYING" : "PAUSED"}
                  </span>
                </div>

                <div className="text-gray-200 flex items-center gap-1">
                  <span>
                    {formatTime(currentTime)} /{" "}
                    {formatTime(currentVideo?.duration || 0)}
                  </span>
                </div>

                <div className="text-gray-200">
                  {currentZone.name.split(" - ")[0]} •{" "}
                  <Volume2 className="w-4 h-4 inline ml-1" />
                </div>
              </div>
            </div>

            {/* Click outside to close volume slider */}
            {showVolumeSlider && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowVolumeSlider(false)}
              />
            )}
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto bg-gray-900">{children}</div>
        </div>
      </div>

      {/* Global Notification System */}
      <NotificationSystem />
    </div>
  );
}

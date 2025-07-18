import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Heart,
  ThumbsUp,
  Share2,
  Download,
  Clock,
  Plus,
  AlertCircle,
  Info,
  X,
} from "lucide-react";

/**
 * TrackOptionsMenu Component
 * Dropdown menu with various track actions and options
 */
const TrackOptionsMenu = ({
  track,
  onAddToQueue,
  onAddToPlaylist,
  onReport,
  onShare,
  onShowInfo,
  className = "",
  size = "medium",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuAction = (action, ...args) => {
    setIsOpen(false);
    if (typeof action === "function") {
      action(...args);
    }
  };

  const iconSize =
    size === "small" ? "w-3 h-3" : size === "large" ? "w-5 h-5" : "w-4 h-4";
  const buttonSize =
    size === "small" ? "p-1" : size === "large" ? "p-3" : "p-2";

  const menuItems = [
    {
      icon: Plus,
      label: "Add to Queue",
      action: () => handleMenuAction(onAddToQueue, track),
      shortcut: "Q",
    },
    {
      icon: Heart,
      label: "Add to Playlist",
      action: () => handleMenuAction(onAddToPlaylist, track),
      shortcut: "P",
    },
    { divider: true },
    {
      icon: Share2,
      label: "Share Track",
      action: () => handleMenuAction(onShare, track),
      shortcut: "S",
    },
    {
      icon: Download,
      label: "Download",
      action: () => handleMenuAction(() => console.log("Download", track)),
      disabled: true, // Placeholder - would be enabled based on permissions
      shortcut: "D",
    },
    { divider: true },
    {
      icon: Info,
      label: "Track Information",
      action: () => handleMenuAction(onShowInfo, track),
      shortcut: "I",
    },
    {
      icon: Clock,
      label: "Play History",
      action: () =>
        handleMenuAction(() => console.log("Show history for", track)),
      shortcut: "H",
    },
    { divider: true },
    {
      icon: AlertCircle,
      label: "Report Issue",
      action: () => handleMenuAction(onReport, track),
      className: "text-red-400 hover:text-red-300",
      shortcut: "R",
    },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Menu trigger button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`
          ${buttonSize} text-gray-400 hover:text-white transition-colors rounded-full
          hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          ${isOpen ? "text-white bg-gray-700" : ""}
        `}
        title="More options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal className={iconSize} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" />

          {/* Menu */}
          <div
            ref={menuRef}
            className="
              absolute right-0 top-full mt-1 w-56 z-50
              bg-gray-800 border border-gray-700 rounded-lg shadow-lg
              py-2 text-sm text-white
              animate-in fade-in slide-in-from-top-2 duration-200
            "
          >
            {/* Track info header */}
            <div className="px-4 py-2 border-b border-gray-700 mb-2">
              <p className="font-medium text-white truncate">
                {track?.title || "Unknown Track"}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {track?.artist || "Unknown Artist"}
              </p>
            </div>

            {/* Menu items */}
            {menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={index} className="my-1 border-t border-gray-700" />
                );
              }

              const Icon = item.icon;
              const isDisabled = item.disabled;

              return (
                <button
                  key={index}
                  onClick={item.action}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 text-left
                    transition-colors hover:bg-gray-700 focus:bg-gray-700
                    focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                    ${item.className || "text-gray-300 hover:text-white"}
                    ${isDisabled ? "hover:bg-transparent hover:text-gray-300" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-xs text-gray-500 font-mono">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Close button */}
            <div className="mt-2 pt-2 border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="
                  w-full flex items-center gap-3 px-4 py-2 text-gray-400 
                  hover:text-white hover:bg-gray-700 transition-colors
                "
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrackOptionsMenu;

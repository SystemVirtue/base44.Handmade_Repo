
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
  Menu,
  X,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeStyle from "../components/ThemeStyle";
import { UISettings } from "@/entities/UISettings";
import { CustomMedia } from "@/entities/CustomMedia";


const navigationItems = [
  {
    title: "Current Playlist",
    url: createPageUrl("Dashboard"),
    icon: Play,
    badge: null
  },
  {
    title: "Digital Signage",
    url: createPageUrl("DigitalSignage"),
    icon: Monitor,
    badge: null
  },
  {
    title: "Video Output",
    url: createPageUrl("VideoOutput"),
    icon: Monitor,
    badge: null
  },
  {
    title: "Controls",
    url: createPageUrl("Controls"),
    icon: Settings,
    badge: null
  },
  {
    title: "Queue / Schedule Lists",
    url: createPageUrl("QueueSchedule"),
    icon: Calendar,
    badge: null
  },
  {
    title: "Search Songs",
    url: createPageUrl("SearchSongs"),
    icon: Search,
    badge: null
  },
  {
    title: "Scheduler",
    url: createPageUrl("Scheduler"),
    icon: Calendar,
    badge: null
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
    badge: null
  },
  {
    title: "UI Look & Feel",
    url: createPageUrl("UILookAndFeel"),
    icon: Palette,
    badge: null
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: MessageSquare,
    badge: 4
  },
  {
    title: "Music Zone Information",
    url: createPageUrl("MusicZoneInfo"),
    icon: Info,
    badge: null
  },
  {
    title: "Change Music Zone",
    url: createPageUrl("ChangeMusicZone"),
    icon: Users,
    badge: null
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Deep Cover (Explicit)",
    artist: "FAT JOE",
    isPlaying: true
  });
  const [uiSettings, setUiSettings] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsList = await UISettings.list();
        let settings = settingsList[0];
        if (!settings) {
          settings = await UISettings.create({
            color_palette: "celtic",
            background_theme: "dark"
          });
        }
        setUiSettings(settings);

        if (settings.banner_media_id && settings.banner_media_id !== 'default' && settings.banner_media_id !== 'none') {
          const media = await CustomMedia.get(settings.banner_media_id);
          setBannerUrl(media.file_url);
        } else {
          setBannerUrl(null);
        }
      } catch (error) {
        console.error("Failed to load UI settings:", error);
        // Set default settings on error to prevent crash
        setUiSettings({ color_palette: "celtic", background_theme: "dark" });
      }
    };
    fetchSettings();
  }, [location.pathname]); // Refetch on navigation to see changes

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {uiSettings && <ThemeStyle settings={uiSettings} />}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-[var(--sidebar-bg)] flex flex-col relative text-[var(--text-primary)]">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full djamms-gradient flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">Manage My DJAMMS</h1>
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
                  className={`sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === item.url
                      ? 'active text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="bg-red-600 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Spotify Integration */}
          <div className="p-4 border-t border-gray-700">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-full">
              <span className="mr-2">●</span>
              SPOTIFY LOG IN
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-color)]">
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
          <div className="h-16 djamms-gradient flex items-center justify-between px-6 shadow-lg relative">
            {bannerUrl && uiSettings.banner_media_id !== 'none' && (
              <img src={bannerUrl} alt="Custom Banner" className="absolute inset-0 w-full h-full object-cover opacity-30"/>
            )}
            <div className="relative flex items-center gap-4">
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
            
            <div className="relative flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full bg-green-400 ${currentTrack.isPlaying ? 'playing-indicator' : ''}`}></div>
                <span className="text-white font-medium">PLAYING</span>
              </div>
              <div className="text-sm text-gray-200">
                FATH02A-1 • <Volume2 className="w-4 h-4 inline ml-1" />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto bg-[var(--main-bg)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

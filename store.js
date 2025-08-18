import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiService from "./services/api-service.js";
import persistenceService from "./services/persistence-service.js";

// Audio Player Store
export const useAudioStore = create(
  persist(
    (set, get) => ({
      // Current video state
      currentVideo: {
        id: null,
        title: "No video selected",
        channelTitle: "",
        description: "",
        duration: 0, // seconds
        thumbnail: "",
        videoId: null,
        publishedAt: null,
        viewCount: 0,
      },

      // Current track (alias for currentVideo for compatibility)
      currentTrack: null,

      // Playback state
      isPlaying: false,
      currentTime: 0,
      volume: 75,
      isMuted: false,
      previousVolume: 75,

      // Voting and favorites state
      favorites: new Set(), // Track IDs that are favorited
      votes: {}, // Track ID -> vote count mapping
      userVotes: {}, // Track ID -> boolean (has user voted)

      // Queue state - YouTube videos
      queue: [],
      currentQueueIndex: 0,

      // Audio instance
      audioInstance: null,

      // Actions
      setCurrentVideo: (video) => {
        set({ currentVideo: video, currentTrack: video });
        // Add to playback history
        persistenceService.addToPlaybackHistory(video);
      },

      play: () => {
        const { currentVideo } = get();
        if (currentVideo && currentVideo.videoId) {
          // YouTube player will handle play
        }
        set({ isPlaying: true });
      },

      pause: () => {
        // YouTube player will handle pause
        set({ isPlaying: false });
      },

      togglePlayPause: () => {
        const { isPlaying } = get();
        if (isPlaying) {
          get().pause();
        } else {
          get().play();
        }
      },

      setVolume: (volume) => {
        const { audioInstance, isMuted } = get();
        if (audioInstance && !isMuted) {
          audioInstance.volume = volume / 100;
        }
        set({ volume, previousVolume: volume });
        // Persist volume setting
        persistenceService.setAudioSettings({ volume });
      },

      toggleMute: () => {
        const { audioInstance, isMuted, volume, previousVolume } = get();
        if (audioInstance) {
          if (isMuted) {
            audioInstance.volume = previousVolume / 100;
            set({ isMuted: false, volume: previousVolume });
          } else {
            audioInstance.volume = 0;
            set({ isMuted: true, previousVolume: volume });
          }
        }
        // Persist mute setting
        persistenceService.setAudioSettings({ isMuted: !isMuted });
      },

      setCurrentTime: (time) => set({ currentTime: time }),

      setAudioInstance: (instance) => set({ audioInstance: instance }),

      nextTrack: () => {
        const { queue, currentQueueIndex } = get();
        if (currentQueueIndex < queue.length - 1) {
          const nextIndex = currentQueueIndex + 1;
          const nextTrack = queue[nextIndex];
          set({
            currentVideo: nextTrack,
            currentTrack: nextTrack,
            currentQueueIndex: nextIndex,
          });
          get().play();
        }
      },

      previousTrack: () => {
        const { queue, currentQueueIndex } = get();
        if (currentQueueIndex > 0) {
          const prevIndex = currentQueueIndex - 1;
          const prevTrack = queue[prevIndex];
          set({
            currentVideo: prevTrack,
            currentTrack: prevTrack,
            currentQueueIndex: prevIndex,
          });
          get().play();
        }
      },

      addToQueue: (track) => {
        const { queue } = get();
        const newQueue = [...queue, { ...track, position: queue.length + 1 }];
        set({ queue: newQueue });
      },

      removeFromQueue: (trackId) => {
        const { queue } = get();
        const newQueue = queue
          .filter((track) => track.id !== trackId)
          .map((track, index) => ({ ...track, position: index + 1 }));
        set({ queue: newQueue });
      },

      clearQueue: () => set({ queue: [], currentQueueIndex: 0 }),

      // Enhanced favorites with persistence
      toggleFavorite: (track) => {
        const { favorites } = get();
        const newFavorites = new Set(favorites);

        if (newFavorites.has(track.id)) {
          newFavorites.delete(track.id);
          persistenceService.setTrackFavorited(track.id, false);
        } else {
          newFavorites.add(track.id);
          persistenceService.setTrackFavorited(track.id, true);
        }

        set({ favorites: newFavorites });
      },

      isFavorite: (trackId) => {
        const { favorites } = get();
        return favorites.has(trackId);
      },

      // Enhanced voting system
      voteForTrack: (trackId) => {
        const { votes, userVotes } = get();

        // Check if user has already voted
        if (userVotes[trackId]) {
          return false;
        }

        const newVotes = { ...votes };
        const newUserVotes = { ...userVotes };

        newVotes[trackId] = (votes[trackId] || 0) + 1;
        newUserVotes[trackId] = true;

        set({ votes: newVotes, userVotes: newUserVotes });
        return true;
      },

      hasVoted: (trackId) => {
        const { userVotes } = get();
        return !!userVotes[trackId];
      },

      getVoteCount: (trackId) => {
        const { votes } = get();
        return votes[trackId] || 0;
      },

      // Initialize store with persisted data
      initializeStore: () => {
        const audioSettings = persistenceService.getAudioSettings();
        const favorites = persistenceService.getFavorites();

        set({
          volume: audioSettings.volume,
          isMuted: audioSettings.isMuted,
          favorites: new Set(favorites),
        });
      },
    }),
    {
      name: "djamms-audio-store",
      partialize: (state) => ({
        currentVideo: state.currentVideo,
        volume: state.volume,
        isMuted: state.isMuted,
        queue: state.queue,
        currentQueueIndex: state.currentQueueIndex,
        favorites: Array.from(state.favorites),
        votes: state.votes,
        userVotes: state.userVotes,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate audio store:", error);
        } else if (state) {
          // Convert favorites array back to Set
          state.favorites = new Set(state.favorites || []);
        }
      },
    },
  ),
);

// Enhanced Search Store with API integration
export const useSearchStore = create((set, get) => ({
  query: "",
  results: [],
  isSearching: false,
  totalResults: 0,
  currentPage: 1,
  filters: {
    genre: "",
    artist: "",
    year: "",
    duration: "",
    bitrate: "",
    popularity: "",
  },
  recentSearches: [],
  searchSuggestions: [],
  searchHistory: [],

  // Actions
  setQuery: (query) => set({ query }),

  setFilters: (filters) => set({ filters }),

  performSearch: async (query, searchFilters = {}, page = 1) => {
    set({ isSearching: true });

    try {
      const response = await apiService.searchTracks(query, {
        ...get().filters,
        ...searchFilters,
        page,
        limit: 50,
      });

      if (response.success) {
        const results = response.data.tracks || [];
        const totalResults = response.data.total || results.length;

        if (page === 1) {
          set({
            results,
            totalResults,
            currentPage: page,
            query,
          });

          // Add to recent searches
          persistenceService.addRecentSearch(query);
        } else {
          // Append for pagination
          const currentResults = get().results;
          set({
            results: [...currentResults, ...results],
            currentPage: page,
          });
        }

        // Update search history
        const historyEntry = {
          query,
          filters: searchFilters,
          resultCount: totalResults,
          timestamp: new Date().toISOString(),
        };

        const history = get().searchHistory;
        set({
          searchHistory: [historyEntry, ...history.slice(0, 49)], // Keep last 50 searches
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      set({ isSearching: false });
    }
  },

  getSuggestions: async (query) => {
    // Simple suggestion generation for now
    const recent = persistenceService.getRecentSearches();
    const matchingRecent = recent.filter((search) =>
      search.toLowerCase().includes(query.toLowerCase()),
    );

    set({ searchSuggestions: matchingRecent.slice(0, 5) });
  },

  clearResults: () =>
    set({
      results: [],
      totalResults: 0,
      currentPage: 1,
    }),

  getSearchAnalytics: () => {
    const { searchHistory } = get();

    return {
      totalSearches: searchHistory.length,
      uniqueQueries: new Set(searchHistory.map((h) => h.query)).size,
      averageResults:
        searchHistory.reduce((sum, h) => sum + h.resultCount, 0) /
        searchHistory.length,
      topGenres: get().getTopSearchedGenres(),
      recentActivity: searchHistory.slice(0, 10),
    };
  },

  getTopSearchedGenres: () => {
    const { searchHistory } = get();
    const genreCounts = {};

    searchHistory.forEach((history) => {
      if (history.filters && history.filters.genre) {
        genreCounts[history.filters.genre] =
          (genreCounts[history.filters.genre] || 0) + 1;
      }
    });

    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));
  },
}));

// Enhanced UI Store
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme and appearance
      theme: "dark",
      selectedFont: "Inter",
      fontSize: 14,
      sidebarCollapsed: false,
      activeTab: "dashboard",

      // Notifications
      notifications: [],

      // Modal states
      showMusicLibrary: false,
      showSettings: false,
      showHelp: false,

      // Loading states
      isLoading: false,
      loadingMessage: "",

      // Actions
      setTheme: (theme) => {
        set({ theme });
        persistenceService.updateUserPreferences({ theme });
      },

      setFont: (fontFamily, fontSize) => {
        set({ selectedFont: fontFamily, fontSize });
        persistenceService.setTypographySettings({ fontFamily, fontSize });
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
        persistenceService.setUIState({ sidebarCollapsed: collapsed });
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
        persistenceService.setUIState({ activeTab: tab });
      },

      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = {
          id,
          timestamp: new Date().toISOString(),
          type: "info",
          duration: 5000,
          ...notification,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      setLoading: (isLoading, message = "") => {
        set({ isLoading, loadingMessage: message });
      },

      toggleModal: (modalName) => {
        set((state) => ({
          [modalName]: !state[modalName],
        }));
      },

      // Initialize UI with persisted settings
      initializeUI: () => {
        const userPrefs = persistenceService.getUserPreferences();
        const typography = persistenceService.getTypographySettings();
        const uiState = persistenceService.getUIState();

        set({
          theme: userPrefs.theme,
          selectedFont: typography.fontFamily,
          fontSize: typography.fontSize,
          sidebarCollapsed: uiState.sidebarCollapsed,
          activeTab: uiState.activeTab,
        });
      },
    }),
    {
      name: "djamms-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        selectedFont: state.selectedFont,
        fontSize: state.fontSize,
        sidebarCollapsed: state.sidebarCollapsed,
        activeTab: state.activeTab,
      }),
    },
  ),
);

// Zone Management Store (simplified for single-zone focus)
export const useZoneStore = create((set, get) => ({
  currentZone: {
    id: 1,
    name: "Main Floor - Restaurant",
    status: "active",
    deviceCount: 3,
    lastActive: new Date().toISOString(),
  },

  zones: [
    {
      id: 1,
      name: "Main Floor - Restaurant",
      status: "active",
      deviceCount: 3,
      lastActive: new Date().toISOString(),
    },
  ],

  updateZone: (zoneId, updates) => {
    set((state) => ({
      zones: state.zones.map((zone) =>
        zone.id === zoneId ? { ...zone, ...updates } : zone,
      ),
      currentZone:
        state.currentZone.id === zoneId
          ? { ...state.currentZone, ...updates }
          : state.currentZone,
    }));
  },
}));

// Scheduler Store with persistence
export const useSchedulerStore = create(
  persist(
    (set, get) => ({
      schedules: [],
      selectedSchedule: null,
      scheduleHistory: [],
      isLoading: false,

      addSchedule: (schedule) => {
        const newSchedule = {
          ...schedule,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          schedules: [...state.schedules, newSchedule],
        }));

        // Add to history for undo functionality
        get().saveToHistory();
      },

      updateSchedule: (scheduleId, updates) => {
        set((state) => ({
          schedules: state.schedules.map((schedule) =>
            schedule.id === scheduleId
              ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
              : schedule,
          ),
        }));

        get().saveToHistory();
      },

      deleteSchedule: (scheduleId) => {
        set((state) => ({
          schedules: state.schedules.filter(
            (schedule) => schedule.id !== scheduleId,
          ),
        }));

        get().saveToHistory();
      },

      setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),

      saveToHistory: () => {
        const { schedules } = get();
        persistenceService.addScheduleHistoryEntry(schedules);
      },

      loadFromHistory: (historyIndex = 0) => {
        const history = persistenceService.getScheduleHistory();
        if (history[historyIndex]) {
          set({ schedules: history[historyIndex].schedules });
        }
      },

      initializeScheduler: async () => {
        set({ isLoading: true });

        try {
          const response = await apiService.getSchedules();
          if (response.success) {
            set({ schedules: response.data || [] });
          }
        } catch (error) {
          console.error("Failed to load schedules:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "djamms-scheduler-store",
      partialize: (state) => ({
        schedules: state.schedules,
      }),
    },
  ),
);

// Utility functions
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Initialize all stores
export const initializeStores = () => {
  useAudioStore.getState().initializeStore();
  useUIStore.getState().initializeUI();
  useSchedulerStore.getState().initializeScheduler();

  // Start session tracking
  persistenceService.startSession();

  // Setup activity tracking
  const updateActivity = () => {
    persistenceService.updateSessionActivity();
  };

  // Track user activity
  document.addEventListener("click", updateActivity);
  document.addEventListener("keypress", updateActivity);

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    persistenceService.endSession();
    persistenceService.cleanupStorage();
  });
};

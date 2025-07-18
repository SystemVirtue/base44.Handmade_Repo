import { create } from "zustand";
import { persist } from "zustand/middleware";

// Audio Player Store
export const useAudioStore = create(
  persist(
    (set, get) => ({
      // Current track state
      currentTrack: {
        id: null,
        title: "Deep Cover (Explicit)",
        artist: "FAT JOE",
        album: "Unknown Album",
        duration: 235, // seconds
        thumbnail:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
        url: null,
      },

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

      // Queue state
      queue: [
        {
          id: 1,
          title: "Bohemian Rhapsody",
          artist: "Queen",
          album: "A Night at the Opera",
          duration: 355,
          thumbnail:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
          url: null,
          position: 1,
        },
        {
          id: 2,
          title: "Hotel California",
          artist: "Eagles",
          album: "Hotel California",
          duration: 390,
          thumbnail:
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
          url: null,
          position: 2,
        },
      ],
      currentQueueIndex: 0,

      // Audio instance
      audioInstance: null,

      // Actions
      setCurrentTrack: (track) => set({ currentTrack: track }),

      play: () => {
        const { audioInstance, currentTrack } = get();
        if (audioInstance && currentTrack.url) {
          audioInstance.play().catch(console.error);
        }
        set({ isPlaying: true });
      },

      pause: () => {
        const { audioInstance } = get();
        if (audioInstance) {
          audioInstance.pause();
        }
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
      },

      toggleMute: () => {
        const { audioInstance, isMuted, volume, previousVolume } = get();
        if (audioInstance) {
          if (isMuted) {
            audioInstance.volume = previousVolume / 100;
            set({ isMuted: false, volume: previousVolume });
          } else {
            audioInstance.volume = 0;
            set({ isMuted: true, volume: 0 });
          }
        }
      },

      setCurrentTime: (time) => set({ currentTime: time }),

      seekTo: (time) => {
        const { audioInstance } = get();
        if (audioInstance) {
          audioInstance.currentTime = time;
        }
        set({ currentTime: time });
      },

      nextTrack: () => {
        const { queue, currentQueueIndex } = get();
        const nextIndex = currentQueueIndex + 1;
        if (nextIndex < queue.length) {
          const nextTrack = queue[nextIndex];
          set({
            currentTrack: nextTrack,
            currentQueueIndex: nextIndex,
          });
          get().play();
        }
      },

      previousTrack: () => {
        const { queue, currentQueueIndex } = get();
        const prevIndex = currentQueueIndex - 1;
        if (prevIndex >= 0) {
          const prevTrack = queue[prevIndex];
          set({
            currentTrack: prevTrack,
            currentQueueIndex: prevIndex,
          });
          get().play();
        }
      },

      addToQueue: (track) => {
        const { queue } = get();
        const newTrack = { ...track, position: queue.length + 1 };
        set({ queue: [...queue, newTrack] });
      },

      removeFromQueue: (trackId) => {
        const { queue } = get();
        const updatedQueue = queue
          .filter((track) => track.id !== trackId)
          .map((track, index) => ({ ...track, position: index + 1 }));
        set({ queue: updatedQueue });
      },

      reorderQueue: (startIndex, endIndex) => {
        const { queue } = get();
        const result = Array.from(queue);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        const reorderedQueue = result.map((track, index) => ({
          ...track,
          position: index + 1,
        }));

        set({ queue: reorderedQueue });
      },

      setAudioInstance: (instance) => set({ audioInstance: instance }),

      // Voting and favorites actions
      toggleFavorite: (trackId) => {
        const { favorites } = get();
        const newFavorites = new Set(favorites);

        if (newFavorites.has(trackId)) {
          newFavorites.delete(trackId);
        } else {
          newFavorites.add(trackId);
        }

        set({ favorites: newFavorites });

        // In a real implementation, this would sync with backend
        console.log(
          `Track ${trackId} ${newFavorites.has(trackId) ? "added to" : "removed from"} favorites`,
        );
      },

      voteForTrack: (trackId) => {
        const { votes, userVotes } = get();

        // Check if user already voted for this track
        if (userVotes[trackId]) {
          console.log("You have already voted for this track");
          return;
        }

        const newVotes = { ...votes };
        const newUserVotes = { ...userVotes };

        newVotes[trackId] = (newVotes[trackId] || 0) + 1;
        newUserVotes[trackId] = true;

        set({ votes: newVotes, userVotes: newUserVotes });

        // In a real implementation, this would sync with backend
        console.log(
          `Voted for track ${trackId}. Total votes: ${newVotes[trackId]}`,
        );
      },

      isFavorite: (trackId) => {
        const { favorites } = get();
        return favorites.has(trackId);
      },

      hasVoted: (trackId) => {
        const { userVotes } = get();
        return !!userVotes[trackId];
      },

      getVoteCount: (trackId) => {
        const { votes } = get();
        return votes[trackId] || 0;
      },
    }),
    {
      name: "audio-store",
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        volume: state.volume,
        queue: state.queue,
        currentQueueIndex: state.currentQueueIndex,
        favorites: Array.from(state.favorites), // Convert Set to Array for persistence
        votes: state.votes,
        userVotes: state.userVotes,
      }),
      // Custom merge function to handle Set conversion
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        favorites: new Set(persistedState.favorites || []), // Convert Array back to Set
      }),
    },
  ),
);

// UI State Store
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme settings
      theme: {
        colorPalette: "celtic",
        backgroundTheme: "dark",
        compactMode: false,
        showSidebar: true,
        bannerMediaId: "default",
      },

      // Layout state
      sidebarCollapsed: false,
      currentPage: "dashboard",

      // Notifications
      notifications: [],

      // Loading states
      loading: {
        dashboard: false,
        search: false,
        schedule: false,
      },

      // Actions
      setTheme: (themeUpdates) =>
        set((state) => ({
          theme: { ...state.theme, ...themeUpdates },
        })),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setCurrentPage: (page) => set({ currentPage: page }),

      addNotification: (notification) => {
        const newNotification = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          read: false,
          ...notification,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif,
          ),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        })),

      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

// Music Zone Store
export const useZoneStore = create(
  persist(
    (set, get) => ({
      // Current zone
      currentZone: {
        id: 1,
        name: "Main Floor - Restaurant",
        location: "Building A, Floor 1",
        status: "online",
        volume: 75,
        devices: 4,
        users: 12,
        description: "Primary dining area with ambient background music",
      },

      // Available zones
      zones: [
        {
          id: 1,
          name: "Main Floor - Restaurant",
          location: "Building A, Floor 1",
          status: "online",
          volume: 75,
          devices: 4,
          users: 12,
          description: "Primary dining area with ambient background music",
        },
        {
          id: 2,
          name: "Bar & Lounge",
          location: "Building A, Floor 2",
          status: "online",
          volume: 85,
          devices: 3,
          users: 8,
          description: "Upbeat music zone for evening entertainment",
        },
      ],

      // Actions
      setCurrentZone: (zone) => set({ currentZone: zone }),

      addZone: (zone) => {
        const newZone = { ...zone, id: Date.now() };
        set((state) => ({
          zones: [...state.zones, newZone],
        }));
        return newZone;
      },

      updateZone: (id, updates) =>
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === id ? { ...zone, ...updates } : zone,
          ),
          currentZone:
            state.currentZone.id === id
              ? { ...state.currentZone, ...updates }
              : state.currentZone,
        })),

      removeZone: (id) =>
        set((state) => ({
          zones: state.zones.filter((zone) => zone.id !== id),
        })),
    }),
    {
      name: "zone-store",
    },
  ),
);

// Search Store - Enhanced with multi-source search
export const useSearchStore = create((set, get) => ({
  // Search state
  query: "",
  results: [],
  searchResults: null, // Full search response with metadata
  isSearching: false,
  filters: {
    sources: ["all"], // Array of enabled sources
    genre: "all",
    year: "any",
    duration: "any",
    explicit: "any",
  },

  // Search history and suggestions
  recentSearches: [],
  searchSuggestions: [],
  searchHistory: [],

  // Search analytics
  searchStats: {
    totalSearches: 0,
    avgSearchTime: 0,
    mostSearchedTerms: [],
    preferredSources: {},
  },

  // Actions
  setQuery: (query) => set({ query }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  performSearch: async (searchQuery) => {
    if (!searchQuery.trim()) {
      set({ results: [], searchResults: null });
      return;
    }

    set({ isSearching: true });

    try {
      // Import search service dynamically
      const { performMultiSourceSearch } = await import(
        "./services/search-service.js"
      );

      // Get current filters
      const { filters } = get();

      // Perform multi-source search
      const searchResponse = await performMultiSourceSearch(
        searchQuery,
        filters,
        filters.sources,
      );

      // Update search history and stats
      const newSearchHistory = [
        {
          query: searchQuery,
          timestamp: new Date().toISOString(),
          resultCount: searchResponse.total_results,
          searchTime: searchResponse.search_time_ms,
          sources: Object.keys(searchResponse.sources),
        },
        ...get().searchHistory.slice(0, 49),
      ]; // Keep last 50 searches

      // Update stats
      const currentStats = get().searchStats;
      const newStats = {
        totalSearches: currentStats.totalSearches + 1,
        avgSearchTime: Math.round(
          (currentStats.avgSearchTime * currentStats.totalSearches +
            searchResponse.search_time_ms) /
            (currentStats.totalSearches + 1),
        ),
        mostSearchedTerms: updateSearchTermFrequency(
          currentStats.mostSearchedTerms,
          searchQuery,
        ),
        preferredSources: updateSourcePreferences(
          currentStats.preferredSources,
          filters.sources,
        ),
      };

      set({
        results: searchResponse.combined_results,
        searchResults: searchResponse,
        recentSearches: [
          searchQuery,
          ...get()
            .recentSearches.filter((q) => q !== searchQuery)
            .slice(0, 9),
        ],
        searchHistory: newSearchHistory,
        searchStats: newStats,
      });
    } catch (error) {
      console.error("Search failed:", error);
      set({
        results: [],
        searchResults: {
          query: searchQuery,
          error: error.message,
          total_results: 0,
          combined_results: [],
          sources: {},
        },
      });
    } finally {
      set({ isSearching: false });
    }
  },

  // Get search suggestions
  getSuggestions: async (query) => {
    if (!query.trim()) {
      set({ searchSuggestions: [] });
      return;
    }

    try {
      const { getSearchSuggestions } = await import(
        "./services/search-service.js"
      );
      const suggestions = await getSearchSuggestions(query);
      set({ searchSuggestions: suggestions });
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      set({ searchSuggestions: [] });
    }
  },

  // Clear search results
  clearResults: () =>
    set({
      results: [],
      searchResults: null,
      query: "",
      searchSuggestions: [],
    }),

  // Add track to favorites from search
  addToFavorites: (trackId) => {
    // This would integrate with the main audio store
    console.log("Adding to favorites:", trackId);
  },

  // Get search analytics
  getSearchAnalytics: () => {
    const { searchHistory, searchStats } = get();
    return {
      ...searchStats,
      recentSearches: searchHistory.slice(0, 10),
      topSources: Object.entries(searchStats.preferredSources)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  },
}));

// Helper functions for search statistics
function updateSearchTermFrequency(currentTerms, newTerm) {
  const updatedTerms = [...currentTerms];
  const existingTerm = updatedTerms.find((term) => term.query === newTerm);

  if (existingTerm) {
    existingTerm.count += 1;
  } else {
    updatedTerms.push({ query: newTerm, count: 1 });
  }

  return updatedTerms.sort((a, b) => b.count - a.count).slice(0, 20); // Keep top 20 most searched terms
}

function updateSourcePreferences(currentPrefs, usedSources) {
  const updatedPrefs = { ...currentPrefs };

  usedSources.forEach((source) => {
    if (source !== "all") {
      updatedPrefs[source] = (updatedPrefs[source] || 0) + 1;
    }
  });

  return updatedPrefs;
}

// Format time utility
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

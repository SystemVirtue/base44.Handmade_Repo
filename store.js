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

// Search Store
export const useSearchStore = create((set, get) => ({
  // Search state
  query: "",
  results: [],
  isSearching: false,
  filters: {
    source: "all",
    genre: "all",
    year: "any",
    duration: "any",
  },

  // Recent searches
  recentSearches: [],

  // Actions
  setQuery: (query) => set({ query }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  performSearch: async (searchQuery) => {
    set({ isSearching: true });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock search results
      const mockResults = [
        {
          id: `search-${Date.now()}-1`,
          title: `${searchQuery} Result 1`,
          artist: "Artist Name",
          album: "Album Name",
          duration: 180,
          source: "spotify",
          thumbnail:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
          preview_url: "#",
        },
        {
          id: `search-${Date.now()}-2`,
          title: `${searchQuery} Result 2`,
          artist: "Another Artist",
          album: "Another Album",
          duration: 210,
          source: "youtube",
          thumbnail:
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
          preview_url: "#",
        },
      ];

      set({
        results: mockResults,
        recentSearches: [searchQuery, ...get().recentSearches.slice(0, 4)],
      });
    } catch (error) {
      console.error("Search failed:", error);
      set({ results: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  clearResults: () => set({ results: [], query: "" }),
}));

// Format time utility
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

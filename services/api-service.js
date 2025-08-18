/**
 * DJAMMS API Service Layer
 * Provides centralized API management for all backend integrations
 * Supports both mock data (development) and real API endpoints (production)
 */

class APIService {
  constructor() {
    this.baseURL =
      import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001/api";
    this.mockMode = import.meta.env?.VITE_MOCK_MODE !== "false";
    this.token = localStorage.getItem("djamms_auth_token");

    // API endpoints configuration
    this.endpoints = {
      auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        refresh: "/auth/refresh",
        user: "/auth/user",
      },
      music: {
        tracks: "/music/tracks",
        search: "/music/search",
        metadata: "/music/metadata",
        artwork: "/music/artwork",
      },
      playlists: {
        list: "/playlists",
        create: "/playlists",
        update: "/playlists/:id",
        delete: "/playlists/:id",
        tracks: "/playlists/:id/tracks",
      },
      youtube: {
        search: "/integrations/youtube/search",
        playlists: "/integrations/youtube/playlists",
        videos: "/integrations/youtube/videos",
      },
      system: {
        status: "/system/status",
        monitoring: "/system/monitoring",
        devices: "/system/devices",
        logs: "/system/logs",
      },
      scheduler: {
        schedules: "/scheduler/schedules",
        create: "/scheduler/create",
        update: "/scheduler/update/:id",
        delete: "/scheduler/delete/:id",
      },
      settings: {
        user: "/settings/user",
        system: "/settings/system",
        themes: "/settings/themes",
      },
    };

    // Initialize mock data if in mock mode
    if (this.mockMode) {
      this.initializeMockData();
    }
  }

  /**
   * Generic HTTP request method
   */
  async request(endpoint, options = {}) {
    const url = this.mockMode ? "mock" : `${this.baseURL}${endpoint}`;

    if (this.mockMode) {
      return this.handleMockRequest(endpoint, options);
    }

    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("API Request failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Authentication methods
   */
  async login(credentials) {
    const response = await this.request(this.endpoints.auth.login, {
      method: "POST",
      body: credentials,
    });

    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem("djamms_auth_token", this.token);
    }

    return response;
  }

  async logout() {
    await this.request(this.endpoints.auth.logout, { method: "POST" });
    this.token = null;
    localStorage.removeItem("djamms_auth_token");
  }

  async getCurrentUser() {
    return this.request(this.endpoints.auth.user);
  }

  /**
   * Music library methods
   */
  async searchTracks(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    });

    return this.request(`${this.endpoints.music.search}?${params}`);
  }

  async getTrackMetadata(trackId) {
    return this.request(`${this.endpoints.music.metadata}/${trackId}`);
  }

  async getTrackArtwork(trackId, size = "medium") {
    return this.request(
      `${this.endpoints.music.artwork}/${trackId}?size=${size}`,
    );
  }

  async getMusicLibrary(page = 1, limit = 50) {
    return this.request(
      `${this.endpoints.music.tracks}?page=${page}&limit=${limit}`,
    );
  }

  /**
   * Playlist management methods
   */
  async getPlaylists() {
    return this.request(this.endpoints.playlists.list);
  }

  async createPlaylist(playlistData) {
    return this.request(this.endpoints.playlists.create, {
      method: "POST",
      body: playlistData,
    });
  }

  async updatePlaylist(playlistId, updates) {
    return this.request(
      this.endpoints.playlists.update.replace(":id", playlistId),
      {
        method: "PUT",
        body: updates,
      },
    );
  }

  async deletePlaylist(playlistId) {
    return this.request(
      this.endpoints.playlists.delete.replace(":id", playlistId),
      {
        method: "DELETE",
      },
    );
  }

  async getPlaylistTracks(playlistId) {
    return this.request(
      this.endpoints.playlists.tracks.replace(":id", playlistId),
    );
  }

  /**
   * Spotify integration methods
   */
  async getSpotifyAuthURL() {
    return this.request(this.endpoints.spotify.auth);
  }

  async getYouTubePlaylist(playlistId) {
    return this.request(`${this.endpoints.youtube.playlists}/${playlistId}`);
  }

  async searchYouTubeVideos(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      ...options
    });
    return this.request(`${this.endpoints.youtube.search}?${params}`);
  }

  async getSpotifyPlaylistTracks(playlistId) {
    return this.request(`${this.endpoints.spotify.tracks}/${playlistId}`);
  }

  /**
   * System monitoring methods
   */
  async getSystemStatus() {
    return this.request(this.endpoints.system.status);
  }

  async getSystemMonitoring() {
    return this.request(this.endpoints.system.monitoring);
  }

  async getConnectedDevices() {
    return this.request(this.endpoints.system.devices);
  }

  async getSystemLogs(logType = "all") {
    return this.request(`${this.endpoints.system.logs}?type=${logType}`);
  }

  /**
   * Scheduler methods
   */
  async getSchedules() {
    return this.request(this.endpoints.scheduler.schedules);
  }

  async createSchedule(scheduleData) {
    return this.request(this.endpoints.scheduler.create, {
      method: "POST",
      body: scheduleData,
    });
  }

  async updateSchedule(scheduleId, updates) {
    return this.request(
      this.endpoints.scheduler.update.replace(":id", scheduleId),
      {
        method: "PUT",
        body: updates,
      },
    );
  }

  async deleteSchedule(scheduleId) {
    return this.request(
      this.endpoints.scheduler.delete.replace(":id", scheduleId),
      {
        method: "DELETE",
      },
    );
  }

  /**
   * Settings methods
   */
  async getUserSettings() {
    return this.request(this.endpoints.settings.user);
  }

  async updateUserSettings(settings) {
    return this.request(this.endpoints.settings.user, {
      method: "PUT",
      body: settings,
    });
  }

  async getSystemSettings() {
    return this.request(this.endpoints.settings.system);
  }

  async updateSystemSettings(settings) {
    return this.request(this.endpoints.settings.system, {
      method: "PUT",
      body: settings,
    });
  }

  /**
   * Mock data initialization and handling
   */
  initializeMockData() {
    this.mockData = {
      user: {
        id: "user_001",
        username: "djamms_user",
        email: "user@djamms.com",
        preferences: {
          theme: "dark",
          defaultTimezone: "Australia/Sydney",
          language: "en",
          autoPlay: true,
          crossfadeTime: 3,
        },
      },
      tracks: this.generateMockTracks(500),
      playlists: this.generateMockPlaylists(),
      spotifyPlaylists: this.generateMockSpotifyPlaylists(),
      schedules: [],
      systemStatus: {
        cpu: { usage: 25, cores: 8 },
        memory: { usage: 60, total: 16, available: 6.4 },
        disk: { usage: 45, total: 1000, available: 550 },
        network: { status: "connected", latency: 12, bandwidth: 100 },
      },
    };
  }

  generateMockTracks(count = 500) {
    const artists = [
      "The Beatles",
      "Queen",
      "Led Zeppelin",
      "Pink Floyd",
      "The Rolling Stones",
      "Bob Dylan",
      "David Bowie",
      "Radiohead",
      "Nirvana",
      "AC/DC",
    ];
    const genres = [
      "Rock",
      "Pop",
      "Jazz",
      "Blues",
      "Electronic",
      "Hip Hop",
      "Country",
      "Classical",
      "R&B",
      "Alternative",
    ];
    const albums = [
      "Greatest Hits",
      "Live at Wembley",
      "Studio Sessions",
      "The Collection",
      "Best Of",
      "Anthology",
      "Masterpieces",
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `track_${String(i + 1).padStart(3, "0")}`,
      title: `Track ${i + 1}`,
      artist: artists[i % artists.length],
      album: `${albums[i % albums.length]} ${Math.floor(i / albums.length) + 1}`,
      genre: genres[i % genres.length],
      duration: 180 + Math.floor(Math.random() * 240), // 3-7 minutes
      year: 1960 + Math.floor(Math.random() * 64),
      bitrate: 320,
      fileSize: 8.5 + Math.random() * 15, // MB
      thumbnail: `https://picsum.photos/300/300?random=${i + 1}`,
      audioUrl: `https://audio.example.com/track_${i + 1}.mp3`,
      popularity: Math.floor(Math.random() * 100),
      plays: Math.floor(Math.random() * 10000),
      rating: 3 + Math.random() * 2, // 3-5 stars
      dateAdded: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    }));
  }

  generateMockPlaylists() {
    return [
      {
        id: "playlist_001",
        name: "Rock Classics",
        description: "Best rock songs of all time",
        trackCount: 45,
        duration: 10800, // 3 hours
        thumbnail: "https://picsum.photos/300/300?random=1001",
        isStarred: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z",
      },
      {
        id: "playlist_002",
        name: "Chill Vibes",
        description: "Relaxing music for any time",
        trackCount: 32,
        duration: 7200, // 2 hours
        thumbnail: "https://picsum.photos/300/300?random=1002",
        isStarred: false,
        createdAt: "2024-01-10T14:20:00Z",
        updatedAt: "2024-01-18T09:45:00Z",
      },
      {
        id: "playlist_003",
        name: "Party Mix",
        description: "High energy dance tracks",
        trackCount: 67,
        duration: 14400, // 4 hours
        thumbnail: "https://picsum.photos/300/300?random=1003",
        isStarred: true,
        createdAt: "2024-01-05T20:15:00Z",
        updatedAt: "2024-01-22T11:20:00Z",
      },
    ];
  }

  generateMockSpotifyPlaylists() {
    return [
      {
        id: "spotify_001",
        name: "Today's Top Hits",
        description: "The biggest songs right now",
        trackCount: 50,
        thumbnail: "https://picsum.photos/300/300?random=2001",
        isStarred: true,
        external_url:
          "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
        owner: "Spotify",
      },
      {
        id: "spotify_002",
        name: "Discover Weekly",
        description: "Your weekly mixtape of fresh music",
        trackCount: 30,
        thumbnail: "https://picsum.photos/300/300?random=2002",
        isStarred: false,
        external_url:
          "https://open.spotify.com/playlist/37i9dQZF1E35qK1HMRi7vQ",
        owner: "Spotify",
      },
      {
        id: "spotify_003",
        name: "Release Radar",
        description: "Catch all the latest music from artists you follow",
        trackCount: 25,
        thumbnail: "https://picsum.photos/300/300?random=2003",
        isStarred: true,
        external_url:
          "https://open.spotify.com/playlist/37i9dQZF1E36u7Q3CsLwcg",
        owner: "Spotify",
      },
    ];
  }

  async handleMockRequest(endpoint, options = {}) {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200),
    );

    const method = options.method || "GET";

    try {
      // Route mock requests based on endpoint patterns
      if (endpoint.includes("/music/search")) {
        return this.handleMockSearch(endpoint, options);
      } else if (endpoint.includes("/music/tracks")) {
        return this.handleMockMusicLibrary(endpoint, options);
      } else if (endpoint.includes("/playlists")) {
        return this.handleMockPlaylists(endpoint, options);
      } else if (endpoint.includes("/spotify")) {
        return this.handleMockSpotify(endpoint, options);
      } else if (endpoint.includes("/system")) {
        return this.handleMockSystem(endpoint, options);
      } else if (endpoint.includes("/settings")) {
        return this.handleMockSettings(endpoint, options);
      } else if (endpoint.includes("/auth")) {
        return this.handleMockAuth(endpoint, options);
      }

      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  handleMockSearch(endpoint, options) {
    const url = new URL("http://localhost" + endpoint);
    const query = url.searchParams.get("q") || "";
    const genre = url.searchParams.get("genre");
    const artist = url.searchParams.get("artist");

    let results = this.mockData.tracks.filter((track) => {
      const matchesQuery =
        !query ||
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()) ||
        track.album.toLowerCase().includes(query.toLowerCase());

      const matchesGenre =
        !genre || track.genre.toLowerCase() === genre.toLowerCase();
      const matchesArtist =
        !artist || track.artist.toLowerCase().includes(artist.toLowerCase());

      return matchesQuery && matchesGenre && matchesArtist;
    });

    // Sort by relevance (popularity for now)
    results.sort((a, b) => b.popularity - a.popularity);

    return {
      success: true,
      data: {
        tracks: results.slice(0, 50), // Limit to 50 results
        total: results.length,
        query,
        filters: { genre, artist },
      },
    };
  }

  handleMockMusicLibrary(endpoint, options) {
    const url = new URL("http://localhost" + endpoint);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const offset = (page - 1) * limit;

    const tracks = this.mockData.tracks.slice(offset, offset + limit);

    return {
      success: true,
      data: {
        tracks,
        pagination: {
          page,
          limit,
          total: this.mockData.tracks.length,
          pages: Math.ceil(this.mockData.tracks.length / limit),
        },
      },
    };
  }

  handleMockPlaylists(endpoint, options) {
    const method = options.method || "GET";

    if (method === "GET") {
      return {
        success: true,
        data: this.mockData.playlists,
      };
    } else if (method === "POST") {
      const newPlaylist = {
        id: `playlist_${Date.now()}`,
        ...options.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.mockData.playlists.push(newPlaylist);
      return { success: true, data: newPlaylist };
    }

    return { success: true, data: null };
  }

  handleMockSpotify(endpoint, options) {
    if (endpoint.includes("/playlists")) {
      return {
        success: true,
        data: this.mockData.spotifyPlaylists,
      };
    }

    return { success: true, data: null };
  }

  handleMockSystem(endpoint, options) {
    if (endpoint.includes("/status") || endpoint.includes("/monitoring")) {
      // Simulate changing system metrics
      this.mockData.systemStatus.cpu.usage = Math.max(
        10,
        Math.min(
          90,
          this.mockData.systemStatus.cpu.usage + (Math.random() - 0.5) * 10,
        ),
      );
      this.mockData.systemStatus.memory.usage = Math.max(
        30,
        Math.min(
          95,
          this.mockData.systemStatus.memory.usage + (Math.random() - 0.5) * 5,
        ),
      );

      return {
        success: true,
        data: this.mockData.systemStatus,
      };
    }

    return { success: true, data: null };
  }

  handleMockSettings(endpoint, options) {
    const method = options.method || "GET";

    if (endpoint.includes("/user")) {
      if (method === "GET") {
        return {
          success: true,
          data: this.mockData.user.preferences,
        };
      } else if (method === "PUT") {
        this.mockData.user.preferences = {
          ...this.mockData.user.preferences,
          ...options.body,
        };
        return {
          success: true,
          data: this.mockData.user.preferences,
        };
      }
    }

    return { success: true, data: null };
  }

  handleMockAuth(endpoint, options) {
    if (endpoint.includes("/login")) {
      return {
        success: true,
        data: {
          token: "mock_jwt_token_" + Date.now(),
          user: this.mockData.user,
        },
      };
    } else if (endpoint.includes("/user")) {
      return {
        success: true,
        data: this.mockData.user,
      };
    }

    return { success: true, data: null };
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;

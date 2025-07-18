/**
 * DJAMMS Data Persistence Service
 * Handles local storage, session storage, and user preference persistence
 * Provides consistent data persistence across application restarts
 */

class PersistenceService {
  constructor() {
    this.storageKeys = {
      // User preferences
      userPreferences: "djamms_user_preferences",
      theme: "djamms_theme",
      language: "djamms_language",
      timezone: "djamms_timezone",

      // UI state
      selectedFont: "djamms_selected_font",
      fontSize: "djamms_font_size",
      sidebarCollapsed: "djamms_sidebar_collapsed",
      activeTab: "djamms_active_tab",

      // Audio settings
      volume: "djamms_volume",
      isMuted: "djamms_muted",
      crossfadeTime: "djamms_crossfade_time",
      eqSettings: "djamms_eq_settings",
      audioDevice: "djamms_audio_device",

      // Playlist and music
      starredPlaylists: "djamms_starred_playlists",
      recentSearches: "djamms_recent_searches",
      playbackHistory: "djamms_playback_history",
      favorites: "djamms_favorites",

      // Scheduler
      scheduleHistory: "djamms_schedule_history",
      schedulerSettings: "djamms_scheduler_settings",

      // System
      systemSettings: "djamms_system_settings",
      devicePreferences: "djamms_device_preferences",

      // Session data (temporary)
      currentSession: "djamms_current_session",
      tabStates: "djamms_tab_states",
    };

    // Default values for various settings
    this.defaults = {
      userPreferences: {
        theme: "dark",
        language: "en",
        timezone: "Australia/Sydney",
        autoPlay: true,
        notifications: true,
        keyboardShortcuts: true,
      },
      typography: {
        fontFamily: "Inter",
        fontSize: 14,
        lineHeight: 1.5,
      },
      audio: {
        volume: 75,
        isMuted: false,
        crossfadeTime: 3,
        eqSettings: {
          bass: 0,
          mid: 0,
          treble: 0,
          presence: 0,
        },
        compressorEnabled: false,
      },
      scheduler: {
        defaultDuration: 60, // minutes
        snapToGrid: true,
        showWeekends: true,
        timeFormat: "24h",
      },
      system: {
        autoBackup: true,
        backupInterval: "daily",
        logLevel: "info",
        performanceMode: "balanced",
      },
    };

    this.initializeDefaults();
  }

  /**
   * Initialize default values if they don't exist
   */
  initializeDefaults() {
    Object.entries(this.defaults).forEach(([category, defaults]) => {
      const key = this.storageKeys[category] || `djamms_${category}`;
      if (!this.getItem(key)) {
        this.setItem(key, defaults);
      }
    });
  }

  /**
   * Generic storage methods
   */
  setItem(key, value, useSessionStorage = false) {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const serializedValue = JSON.stringify(value);
      storage.setItem(key, serializedValue);

      // Dispatch custom event for reactive updates
      window.dispatchEvent(
        new CustomEvent("djamms-storage-change", {
          detail: { key, value, timestamp: Date.now() },
        }),
      );

      return true;
    } catch (error) {
      console.error("Failed to save to storage:", error);
      return false;
    }
  }

  getItem(key, defaultValue = null, useSessionStorage = false) {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Failed to read from storage:", error);
      return defaultValue;
    }
  }

  removeItem(key, useSessionStorage = false) {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.removeItem(key);

      window.dispatchEvent(
        new CustomEvent("djamms-storage-change", {
          detail: { key, value: null, removed: true, timestamp: Date.now() },
        }),
      );

      return true;
    } catch (error) {
      console.error("Failed to remove from storage:", error);
      return false;
    }
  }

  /**
   * User preferences methods
   */
  getUserPreferences() {
    return this.getItem(
      this.storageKeys.userPreferences,
      this.defaults.userPreferences,
    );
  }

  updateUserPreferences(updates) {
    const current = this.getUserPreferences();
    const updated = { ...current, ...updates };
    return this.setItem(this.storageKeys.userPreferences, updated);
  }

  resetUserPreferences() {
    return this.setItem(
      this.storageKeys.userPreferences,
      this.defaults.userPreferences,
    );
  }

  /**
   * Typography settings
   */
  getTypographySettings() {
    return {
      fontFamily: this.getItem(
        this.storageKeys.selectedFont,
        this.defaults.typography.fontFamily,
      ),
      fontSize: this.getItem(
        this.storageKeys.fontSize,
        this.defaults.typography.fontSize,
      ),
    };
  }

  setTypographySettings(settings) {
    if (settings.fontFamily) {
      this.setItem(this.storageKeys.selectedFont, settings.fontFamily);
    }
    if (settings.fontSize) {
      this.setItem(this.storageKeys.fontSize, settings.fontSize);
    }
    return true;
  }

  /**
   * Audio settings persistence
   */
  getAudioSettings() {
    return {
      volume: this.getItem(this.storageKeys.volume, this.defaults.audio.volume),
      isMuted: this.getItem(
        this.storageKeys.isMuted,
        this.defaults.audio.isMuted,
      ),
      crossfadeTime: this.getItem(
        this.storageKeys.crossfadeTime,
        this.defaults.audio.crossfadeTime,
      ),
      eqSettings: this.getItem(
        this.storageKeys.eqSettings,
        this.defaults.audio.eqSettings,
      ),
      audioDevice: this.getItem(this.storageKeys.audioDevice, "default"),
    };
  }

  setAudioSettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      if (this.storageKeys[key]) {
        this.setItem(this.storageKeys[key], value);
      }
    });
    return true;
  }

  /**
   * Playlist and music preferences
   */
  getStarredPlaylists() {
    return this.getItem(this.storageKeys.starredPlaylists, []);
  }

  setPlaylistStarred(playlistId, isStarred) {
    const starred = this.getStarredPlaylists();
    if (isStarred && !starred.includes(playlistId)) {
      starred.push(playlistId);
    } else if (!isStarred) {
      const index = starred.indexOf(playlistId);
      if (index > -1) {
        starred.splice(index, 1);
      }
    }
    return this.setItem(this.storageKeys.starredPlaylists, starred);
  }

  getFavorites() {
    return this.getItem(this.storageKeys.favorites, []);
  }

  setTrackFavorited(trackId, isFavorited) {
    const favorites = this.getFavorites();
    if (isFavorited && !favorites.includes(trackId)) {
      favorites.push(trackId);
    } else if (!isFavorited) {
      const index = favorites.indexOf(trackId);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    return this.setItem(this.storageKeys.favorites, favorites);
  }

  getRecentSearches() {
    return this.getItem(this.storageKeys.recentSearches, []);
  }

  addRecentSearch(query) {
    const recent = this.getRecentSearches();

    // Remove if already exists
    const index = recent.indexOf(query);
    if (index > -1) {
      recent.splice(index, 1);
    }

    // Add to beginning
    recent.unshift(query);

    // Keep only last 10 searches
    const trimmed = recent.slice(0, 10);

    return this.setItem(this.storageKeys.recentSearches, trimmed);
  }

  clearRecentSearches() {
    return this.setItem(this.storageKeys.recentSearches, []);
  }

  /**
   * Playback history
   */
  getPlaybackHistory() {
    return this.getItem(this.storageKeys.playbackHistory, []);
  }

  addToPlaybackHistory(track) {
    const history = this.getPlaybackHistory();

    const entry = {
      ...track,
      playedAt: new Date().toISOString(),
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Add to beginning
    history.unshift(entry);

    // Keep only last 100 entries
    const trimmed = history.slice(0, 100);

    return this.setItem(this.storageKeys.playbackHistory, trimmed);
  }

  clearPlaybackHistory() {
    return this.setItem(this.storageKeys.playbackHistory, []);
  }

  /**
   * Scheduler settings
   */
  getSchedulerSettings() {
    return this.getItem(
      this.storageKeys.schedulerSettings,
      this.defaults.scheduler,
    );
  }

  updateSchedulerSettings(updates) {
    const current = this.getSchedulerSettings();
    const updated = { ...current, ...updates };
    return this.setItem(this.storageKeys.schedulerSettings, updated);
  }

  getScheduleHistory() {
    return this.getItem(this.storageKeys.scheduleHistory, []);
  }

  addScheduleHistoryEntry(schedules) {
    const history = this.getScheduleHistory();

    const entry = {
      schedules: JSON.parse(JSON.stringify(schedules)),
      timestamp: new Date().toISOString(),
      id: `schedule_history_${Date.now()}`,
    };

    history.unshift(entry);

    // Keep only last 10 schedule states
    const trimmed = history.slice(0, 10);

    return this.setItem(this.storageKeys.scheduleHistory, trimmed);
  }

  /**
   * UI state persistence
   */
  getUIState() {
    return {
      activeTab: this.getItem(this.storageKeys.activeTab, "dashboard"),
      sidebarCollapsed: this.getItem(this.storageKeys.sidebarCollapsed, false),
      tabStates: this.getItem(this.storageKeys.tabStates, {}, true), // Use session storage for tab states
    };
  }

  setUIState(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      if (key === "tabStates") {
        this.setItem(this.storageKeys.tabStates, value, true); // Session storage
      } else if (this.storageKeys[key]) {
        this.setItem(this.storageKeys[key], value);
      }
    });
    return true;
  }

  /**
   * System settings
   */
  getSystemSettings() {
    return this.getItem(this.storageKeys.systemSettings, this.defaults.system);
  }

  updateSystemSettings(updates) {
    const current = this.getSystemSettings();
    const updated = { ...current, ...updates };
    return this.setItem(this.storageKeys.systemSettings, updated);
  }

  /**
   * Session management
   */
  startSession() {
    const session = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      version: "3.29.0",
    };

    this.setItem(this.storageKeys.currentSession, session, true);
    return session;
  }

  updateSessionActivity() {
    const session = this.getItem(this.storageKeys.currentSession, null, true);
    if (session) {
      session.lastActivity = new Date().toISOString();
      this.setItem(this.storageKeys.currentSession, session, true);
    }
  }

  endSession() {
    const session = this.getItem(this.storageKeys.currentSession, null, true);
    if (session) {
      session.endTime = new Date().toISOString();
      session.duration =
        new Date(session.endTime) - new Date(session.startTime);
    }

    this.removeItem(this.storageKeys.currentSession, true);
    return session;
  }

  /**
   * Data export and import
   */
  exportAllData() {
    const data = {
      version: "3.29.0",
      exportDate: new Date().toISOString(),
      userPreferences: this.getUserPreferences(),
      typography: this.getTypographySettings(),
      audio: this.getAudioSettings(),
      starredPlaylists: this.getStarredPlaylists(),
      favorites: this.getFavorites(),
      recentSearches: this.getRecentSearches(),
      playbackHistory: this.getPlaybackHistory(),
      schedulerSettings: this.getSchedulerSettings(),
      scheduleHistory: this.getScheduleHistory(),
      systemSettings: this.getSystemSettings(),
    };

    return data;
  }

  importData(data) {
    try {
      if (data.userPreferences) {
        this.setItem(this.storageKeys.userPreferences, data.userPreferences);
      }
      if (data.typography) {
        this.setTypographySettings(data.typography);
      }
      if (data.audio) {
        this.setAudioSettings(data.audio);
      }
      if (data.starredPlaylists) {
        this.setItem(this.storageKeys.starredPlaylists, data.starredPlaylists);
      }
      if (data.favorites) {
        this.setItem(this.storageKeys.favorites, data.favorites);
      }
      if (data.recentSearches) {
        this.setItem(this.storageKeys.recentSearches, data.recentSearches);
      }
      if (data.playbackHistory) {
        this.setItem(this.storageKeys.playbackHistory, data.playbackHistory);
      }
      if (data.schedulerSettings) {
        this.setItem(
          this.storageKeys.schedulerSettings,
          data.schedulerSettings,
        );
      }
      if (data.scheduleHistory) {
        this.setItem(this.storageKeys.scheduleHistory, data.scheduleHistory);
      }
      if (data.systemSettings) {
        this.setItem(this.storageKeys.systemSettings, data.systemSettings);
      }

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  /**
   * Storage cleanup and maintenance
   */
  cleanupStorage() {
    // Clean up old session data
    this.removeItem(this.storageKeys.currentSession, true);
    this.removeItem(this.storageKeys.tabStates, true);

    // Trim playback history if too large
    const history = this.getPlaybackHistory();
    if (history.length > 100) {
      this.setItem(this.storageKeys.playbackHistory, history.slice(0, 100));
    }

    // Trim schedule history if too large
    const scheduleHistory = this.getScheduleHistory();
    if (scheduleHistory.length > 10) {
      this.setItem(
        this.storageKeys.scheduleHistory,
        scheduleHistory.slice(0, 10),
      );
    }

    return true;
  }

  /**
   * Storage usage statistics
   */
  getStorageStats() {
    const localStorage = this.getStorageSize(window.localStorage);
    const sessionStorage = this.getStorageSize(window.sessionStorage);

    return {
      localStorage: {
        used: localStorage.used,
        quota: localStorage.quota,
        percentage: (localStorage.used / localStorage.quota) * 100,
      },
      sessionStorage: {
        used: sessionStorage.used,
        quota: sessionStorage.quota,
        percentage: (sessionStorage.used / sessionStorage.quota) * 100,
      },
      djammsKeys: this.getDjammsStorageKeys(),
    };
  }

  getStorageSize(storage) {
    let used = 0;
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        used += storage[key].length + key.length;
      }
    }

    return {
      used: used,
      quota: 5 * 1024 * 1024, // 5MB typical quota
    };
  }

  getDjammsStorageKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("djamms_")) {
        keys.push({
          key: key,
          size: localStorage.getItem(key).length,
        });
      }
    }
    return keys;
  }
}

// Create singleton instance
const persistenceService = new PersistenceService();

export default persistenceService;

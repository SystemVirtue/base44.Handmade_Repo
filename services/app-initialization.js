/**
 * DJAMMS Application Initialization Service
 * Coordinates startup of all enhanced services and integrations
 */

import apiService from "./api-service.js";
import persistenceService from "./persistence-service.js";
import { getYtDlpService } from "./yt-dlp-service.js";
import { initializeStores } from "../store.js";

class AppInitializationService {
  constructor() {
    this.isInitialized = false;
    this.initializationPromise = null;
    this.services = {};
    this.healthCheckInterval = null;
    this.defaultPlaylistId = "PLJ7vMjpVbhBWLWJpweVDki43Wlcqzsqdu";
  }

  /**
   * Main initialization function
   */
  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      console.log("🚀 Starting DJAMMS Application Initialization...");

      // Step 1: Initialize persistence service
      await this._initializePersistence();

      // Step 2: Initialize API service
      await this._initializeAPI();

      // Step 3: Initialize YouTube services
      await this._initializeYouTubeServices();

      // Step 4: Initialize Zustand stores
      await this._initializeStores();

      // Step 5: Initialize UI services
      await this._initializeUI();

      // Step 6: Setup application monitoring
      await this._setupMonitoring();

      // Step 7: Load initial data
      await this._loadInitialData();

      // Step 8: Load default YouTube playlist
      await this._loadDefaultPlaylist();

      // Step 7: Setup event listeners
      await this._setupEventListeners();

      this.isInitialized = true;
      console.log("✅ DJAMMS Application initialized successfully");

      return {
        success: true,
        message: "Application initialized successfully",
        services: this.services,
      };
    } catch (error) {
      console.error("❌ Application initialization failed:", error);
      return {
        success: false,
        error: error.message,
        services: this.services,
      };
    }
  }

  /**
   * Initialize persistence service
   */
  async _initializePersistence() {
    console.log("📦 Initializing persistence service...");

    try {
      // Start user session
      const session = persistenceService.startSession();

      // Cleanup old data
      persistenceService.cleanupStorage();

      // Get storage stats
      const stats = persistenceService.getStorageStats();

      this.services.persistence = {
        status: "ready",
        session,
        storageStats: stats,
      };

      console.log("✅ Persistence service initialized");
    } catch (error) {
      console.error("❌ Persistence service initialization failed:", error);
      throw error;
    }
  }

  /**
   * Initialize API service
   */
  async _initializeAPI() {
    console.log("🌐 Initializing API service...");

    try {
      // Test API connectivity (in mock mode, this will always succeed)
      const healthCheck = await apiService.request("/health", {
        method: "GET",
      });

      this.services.api = {
        status: healthCheck.success ? "ready" : "degraded",
        mockMode: apiService.mockMode,
        baseURL: apiService.baseURL,
      };

      console.log(
        `✅ API service initialized (${apiService.mockMode ? "mock" : "production"} mode)`,
      );
    } catch (error) {
      console.error("❌ API service initialization failed:", error);

      // Continue with degraded service
      this.services.api = {
        status: "degraded",
        error: error.message,
      };
    }
  }

  /**
   * Initialize YouTube services
   */
  async _initializeYouTubeServices() {
    console.log("🎥 Initializing YouTube services...");

    try {
      // Initialize API key manager
      const apiKeyManager = getAPIKeyManager();
      await apiKeyManager.initialize();

      // Initialize YouTube API service
      const youtubeAPI = getYouTubeAPI();

      // Check service health
      const healthCheck = youtubeAPI.isServiceReady();

      if (healthCheck.ready) {
        this.services.youtube = {
          status: "ready",
          apiKeyManager,
          youtubeAPI,
          hasKeys: true,
          health: healthCheck
        };
        console.log("✅ YouTube services initialized successfully");
        console.log(`📊 API Status: ${healthCheck.stats.activeKeys}/${healthCheck.stats.totalKeys} keys active, ${healthCheck.stats.availableQuota} quota available`);
      } else {
        console.warn(`⚠️ YouTube services initialized but not ready: ${healthCheck.reason}`);
        this.services.youtube = {
          status: "degraded",
          apiKeyManager,
          youtubeAPI,
          hasKeys: false,
          health: healthCheck,
          warning: healthCheck.reason
        };
      }
    } catch (error) {
      console.error("❌ YouTube services initialization failed:", error);
      // Don't throw - app can run without YouTube initially
      this.services.youtube = {
        status: "error",
        error: error.message,
        hasKeys: false,
      };
    }
  }

  /**
   * Initialize Zustand stores
   */
  async _initializeStores() {
    console.log("🗃️ Initializing application stores...");

    try {
      // Initialize all stores with persisted data
      initializeStores();

      this.services.stores = {
        status: "ready",
        initialized: ["audio", "ui", "search", "scheduler", "zone"],
      };

      console.log("✅ Application stores initialized");
    } catch (error) {
      console.error("❌ Store initialization failed:", error);
      throw error;
    }
  }

  /**
   * Initialize UI services
   */
  async _initializeUI() {
    console.log("🎨 Initializing UI services...");

    try {
      // Apply persisted theme and typography
      const userPrefs = persistenceService.getUserPreferences();
      const typography = persistenceService.getTypographySettings();

      // Apply theme to document
      document.documentElement.setAttribute("data-theme", userPrefs.theme);

      // Apply font family to document
      document.documentElement.style.setProperty(
        "--font-family",
        typography.fontFamily,
      );
      document.documentElement.style.setProperty(
        "--font-size",
        `${typography.fontSize}px`,
      );

      // Setup notification system
      this._setupNotificationSystem();

      this.services.ui = {
        status: "ready",
        theme: userPrefs.theme,
        font: typography.fontFamily,
        fontSize: typography.fontSize,
      };

      console.log("✅ UI services initialized");
    } catch (error) {
      console.error("❌ UI service initialization failed:", error);
      throw error;
    }
  }

  /**
   * Setup application monitoring
   */
  async _setupMonitoring() {
    console.log("📊 Setting up application monitoring...");

    try {
      // Setup performance monitoring
      this._setupPerformanceMonitoring();

      // Setup error tracking
      this._setupErrorTracking();

      // Setup health checks
      this._setupHealthChecks();

      this.services.monitoring = {
        status: "ready",
        features: ["performance", "errors", "health"],
      };

      console.log("✅ Application monitoring setup complete");
    } catch (error) {
      console.error("❌ Monitoring setup failed:", error);
      // Non-critical, continue without monitoring
      this.services.monitoring = {
        status: "degraded",
        error: error.message,
      };
    }
  }

  /**
   * Load initial application data
   */
  async _loadInitialData() {
    console.log("📚 Loading initial application data...");

    try {
      // Load initial music library sample
      const musicLibrary = await apiService.getMusicLibrary(1, 20);

      // Load user playlists
      const playlists = await apiService.getPlaylists();

      // Load system status
      const systemStatus = await apiService.getSystemStatus();

      this.services.initialData = {
        status: "ready",
        musicLibrary: musicLibrary.success ? musicLibrary.data : null,
        playlists: playlists.success ? playlists.data : [],
        systemStatus: systemStatus.success ? systemStatus.data : null,
      };

      console.log("✅ Initial data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load initial data:", error);

      this.services.initialData = {
        status: "degraded",
        error: error.message,
      };
    }
  }

  /**
   * Load default YouTube playlist
   */
  async _loadDefaultPlaylist() {
    console.log("🎵 Loading default YouTube playlist...");

    try {
      // Check if YouTube services are available
      if (!this.services.youtube) {
        console.warn("⚠️ YouTube services not initialized, skipping playlist load");
        this._setDefaultPlaylistFallback('YouTube services not available');
        return;
      }

      // Check service status
      if (this.services.youtube.status === 'error') {
        console.warn(`⚠️ YouTube services in error state: ${this.services.youtube.error}`);
        this._setDefaultPlaylistFallback(`YouTube services error: ${this.services.youtube.error}`);
        return;
      }

      if (this.services.youtube.status === 'degraded') {
        console.warn(`⚠️ YouTube services degraded: ${this.services.youtube.warning}`);
        this._setDefaultPlaylistFallback(`YouTube services degraded: ${this.services.youtube.warning}`);
        return;
      }

      if (!this.services.youtube.hasKeys) {
        console.warn("⚠️ No valid YouTube API keys available, skipping playlist load");
        this._setDefaultPlaylistFallback('No valid YouTube API keys configured');
        return;
      }

      const youtubeAPI = this.services.youtube.youtubeAPI;

      // Double-check service readiness before making API calls
      const healthCheck = youtubeAPI.isServiceReady();
      if (!healthCheck.ready) {
        console.warn(`⚠️ YouTube API not ready: ${healthCheck.reason}`);
        this._setDefaultPlaylistFallback(`YouTube API not ready: ${healthCheck.reason}`);
        return;
      }

      // Load the default playlist
      const playlist = await youtubeAPI.getCompletePlaylist(this.defaultPlaylistId, {
        maxResults: 50 // Load first 50 videos
      });

      if (playlist && playlist.videos.length > 0) {
        // Get the audio store and add videos to queue
        const { useAudioStore } = await import("../store.js");
        const store = useAudioStore.getState();

        // Clear existing queue and add new videos
        store.clearQueue();

        // Add videos to queue
        playlist.videos.forEach((video, index) => {
          store.addToQueue({
            id: video.videoId,
            videoId: video.videoId,
            title: video.title,
            channelTitle: video.channelTitle,
            duration: video.duration,
            thumbnail: video.thumbnail,
            viewCount: video.viewCount,
            position: index
          });
        });

        // Set the first video as current if queue was empty
        if (playlist.videos.length > 0 && !store.currentVideo?.videoId) {
          store.setCurrentVideo(playlist.videos[0]);
        }

        console.log(`✅ Loaded ${playlist.videos.length} videos from default playlist`);

        this.services.defaultPlaylist = {
          status: "loaded",
          playlistId: this.defaultPlaylistId,
          videoCount: playlist.videos.length,
          title: playlist.title
        };
      } else {
        console.warn("⚠️ Default playlist returned no videos");
        this._setDefaultPlaylistFallback('Default playlist is empty or inaccessible');
      }
    } catch (error) {
      console.error("❌ Failed to load default playlist:", error);

      // Check if it's an API key related error
      if (error.message.includes('YouTube API') || error.message.includes('403') || error.message.includes('quota')) {
        console.error("💡 Tip: Check your YouTube API key configuration in Settings");
      }

      this.services.defaultPlaylist = {
        status: "error",
        error: error.message,
        playlistId: this.defaultPlaylistId
      };
    }
  }

  /**
   * Set fallback state when YouTube playlist cannot be loaded
   */
  _setDefaultPlaylistFallback(reason) {
    this.services.defaultPlaylist = {
      status: "unavailable",
      reason: reason,
      playlistId: this.defaultPlaylistId,
      videoCount: 0
    };

    // Show user-friendly notification about API key issues
    this._showAPIKeyNotification(reason);

    // Initialize empty queue state
    import("../store.js").then(({ useAudioStore }) => {
      const store = useAudioStore.getState();
      // Don't clear existing queue, just ensure we have proper fallback
      if (!store.currentVideo?.videoId) {
        console.log("📱 App ready without default playlist - users can search and add videos manually");
      }
    }).catch(error => {
      console.error("Failed to access audio store:", error);
    });
  }

  /**
   * Show user-friendly notification about YouTube API issues
   */
  _showAPIKeyNotification(reason) {
    // Determine the type of issue and create appropriate message
    let title = "YouTube Service Notice";
    let message = reason;
    let type = "warning";
    let actionText = null;
    let actionUrl = null;

    if (reason.includes('API key') || reason.includes('403') || reason.includes('forbidden')) {
      title = "YouTube API Configuration Needed";
      message = "YouTube features are currently unavailable. Please configure valid API keys in Settings.";
      type = "warning";
      actionText = "Configure API Keys";
      actionUrl = "/settings";
    } else if (reason.includes('quota')) {
      title = "YouTube API Quota Exceeded";
      message = "Daily YouTube API quota has been exceeded. Please try again tomorrow or add more API keys.";
      type = "warning";
    } else if (reason.includes('degraded')) {
      title = "YouTube Service Degraded";
      message = "YouTube services are running with limited functionality. Some features may not work properly.";
      type = "info";
    }

    // Dispatch notification event
    const notificationEvent = new CustomEvent('djamms-notification', {
      detail: {
        type: type,
        title: title,
        message: message,
        duration: 10000, // Show for 10 seconds
        persistent: true, // Don't auto-dismiss
        action: actionText ? {
          text: actionText,
          url: actionUrl
        } : null
      }
    });

    // Delay notification to ensure UI is ready
    setTimeout(() => {
      window.dispatchEvent(notificationEvent);
    }, 2000);

    console.log(`📢 User notification: ${title} - ${message}`);
  }

  /**
   * Setup application event listeners
   */
  async _setupEventListeners() {
    console.log("👂 Setting up event listeners...");

    try {
      // Storage change listeners
      window.addEventListener(
        "djamms-storage-change",
        this._handleStorageChange.bind(this),
      );

      // Visibility change listeners (for session management)
      document.addEventListener(
        "visibilitychange",
        this._handleVisibilityChange.bind(this),
      );

      // Beforeunload for cleanup
      window.addEventListener(
        "beforeunload",
        this._handleBeforeUnload.bind(this),
      );

      // Online/offline status
      window.addEventListener("online", this._handleOnlineStatus.bind(this));
      window.addEventListener("offline", this._handleOfflineStatus.bind(this));

      this.services.eventListeners = {
        status: "ready",
        listeners: [
          "storage",
          "visibility",
          "beforeunload",
          "online",
          "offline",
        ],
      };

      console.log("✅ Event listeners setup complete");
    } catch (error) {
      console.error("❌ Event listener setup failed:", error);
      throw error;
    }
  }

  /**
   * Setup notification system
   */
  _setupNotificationSystem() {
    // Check if notifications are supported
    if ("Notification" in window) {
      // Request permission if needed
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }

  /**
   * Setup performance monitoring
   */
  _setupPerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0];
      console.log(
        "📊 Page load time:",
        perfData.loadEventEnd - perfData.loadEventStart,
        "ms",
      );
    });

    // Monitor long tasks
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn("⚠️ Long task detected:", entry.duration, "ms");
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        // Long task API not supported
      }
    }
  }

  /**
   * Setup error tracking
   */
  _setupErrorTracking() {
    window.addEventListener("error", (event) => {
      console.error("🚨 Global error:", event.error);

      // Log error to persistence service
      // In production, this would send to error tracking service
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("🚨 Unhandled promise rejection:", event.reason);

      // Log error to persistence service
      // In production, this would send to error tracking service
    });
  }

  /**
   * Setup health checks
   */
  _setupHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        if (!health.overall) {
          console.warn("⚠️ Health check failed:", health);
        }
      } catch (error) {
        console.error("❌ Health check error:", error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Event handlers
   */
  _handleStorageChange(event) {
    console.log("📦 Storage changed:", event.detail);
    persistenceService.updateSessionActivity();
  }

  _handleVisibilityChange() {
    if (document.hidden) {
      console.log("👋 Application hidden");
    } else {
      console.log("👁️ Application visible");
      persistenceService.updateSessionActivity();
    }
  }

  _handleBeforeUnload() {
    console.log("👋 Application closing...");
    persistenceService.endSession();

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  _handleOnlineStatus() {
    console.log("🌐 Application online");
  }

  _handleOfflineStatus() {
    console.log("📴 Application offline");
  }

  /**
   * Health check function
   */
  async performHealthCheck() {
    const checks = {
      persistence: this.services.persistence?.status === "ready",
      api:
        this.services.api?.status === "ready" ||
        this.services.api?.status === "degraded",
      stores: this.services.stores?.status === "ready",
      ui: this.services.ui?.status === "ready",
    };

    const overall = Object.values(checks).every((check) => check);

    return {
      timestamp: new Date().toISOString(),
      overall,
      checks,
      services: this.services,
    };
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      services: this.services,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reinitialize specific service
   */
  async reinitializeService(serviceName) {
    console.log(`🔄 Reinitializing ${serviceName} service...`);

    try {
      switch (serviceName) {
        case "api":
          await this._initializeAPI();
          break;
        case "persistence":
          await this._initializePersistence();
          break;
        case "stores":
          await this._initializeStores();
          break;
        case "ui":
          await this._initializeUI();
          break;
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }

      console.log(`✅ ${serviceName} service reinitialized successfully`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to reinitialize ${serviceName} service:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Shutdown application gracefully
   */
  async shutdown() {
    console.log("🛑 Shutting down application...");

    try {
      // Clear intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // End session
      persistenceService.endSession();

      // Cleanup storage
      persistenceService.cleanupStorage();

      // Remove event listeners
      window.removeEventListener(
        "djamms-storage-change",
        this._handleStorageChange,
      );
      document.removeEventListener(
        "visibilitychange",
        this._handleVisibilityChange,
      );
      window.removeEventListener("beforeunload", this._handleBeforeUnload);
      window.removeEventListener("online", this._handleOnlineStatus);
      window.removeEventListener("offline", this._handleOfflineStatus);

      console.log("✅ Application shutdown complete");
      return { success: true };
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
let appInitializationInstance = null;

export function getAppInitialization() {
  if (!appInitializationInstance) {
    appInitializationInstance = new AppInitializationService();
  }
  return appInitializationInstance;
}

// Legacy export
export default getAppInitialization;

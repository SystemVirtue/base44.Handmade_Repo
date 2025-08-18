/**
 * YouTube API Key Management System
 * Handles multiple API keys with automatic rotation and quota management
 */

class APIKeyManager {
  constructor() {
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    this.quotaUsage = new Map();
    this.lastResetTime = new Date().toDateString();
    this.initialized = false;
    
    // Quota limits (YouTube API v3 default: 10,000 units per day)
    this.DAILY_QUOTA_LIMIT = 10000;
    this.SEARCH_COST = 100; // Search operation cost
    this.PLAYLIST_ITEMS_COST = 1; // PlaylistItems operation cost
    this.VIDEO_DETAILS_COST = 1; // Videos operation cost
    
    this.initialize();
  }

  /**
   * Initialize the API key manager
   */
  async initialize() {
    try {
      await this.loadStoredKeys();
      this.checkDailyReset();
      this.initialized = true;
      console.log('API Key Manager initialized with', this.apiKeys.length, 'keys');
    } catch (error) {
      console.error('Failed to initialize API Key Manager:', error);
    }
  }

  /**
   * Load API keys from secure storage and environment variables
   */
  async loadStoredKeys() {
    try {
      const storedKeys = localStorage.getItem('djamms_youtube_api_keys');
      const storedUsage = localStorage.getItem('djamms_quota_usage');

      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);

        // Check if stored keys need revalidation (older than 24 hours)
        const shouldRevalidate = parsedKeys.some(key => {
          if (!key.lastValidated) return true;
          const lastValidated = new Date(key.lastValidated);
          const now = new Date();
          return (now - lastValidated) > (24 * 60 * 60 * 1000); // 24 hours
        });

        if (shouldRevalidate) {
          console.log('🔄 Stored API keys need revalidation, loading fresh from environment...');
          await this.loadEnvironmentKeys();
        } else {
          this.apiKeys = parsedKeys;
          console.log(`Loaded ${this.apiKeys.length} API keys from storage`);
        }
      } else {
        // Load default keys from environment variables
        await this.loadEnvironmentKeys();
      }

      if (storedUsage) {
        const usage = JSON.parse(storedUsage);
        this.quotaUsage = new Map(usage.data || []);
        this.lastResetTime = usage.lastReset || new Date().toDateString();
      }
    } catch (error) {
      console.error('Error loading stored API keys:', error);
      this.apiKeys = [];
      this.quotaUsage = new Map();
      // Try to load environment keys as fallback
      try {
        await this.loadEnvironmentKeys();
      } catch (envError) {
        console.error('Failed to load environment keys as fallback:', envError);
      }
    }
  }

  /**
   * Load API keys from environment variables
   */
  async loadEnvironmentKeys() {
    const envKeys = [
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_1, name: "Key 1 (Primary)" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_2, name: "Key 2" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_3, name: "Key 3" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_4, name: "Key 4" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_5, name: "Key 5" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_6, name: "Key 6" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_7, name: "Key 7" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_8, name: "Key 8" },
      { key: import.meta.env.VITE_YOUTUBE_API_KEY_9, name: "Key 9" }
    ];

    let validKeyCount = 0;

    for (const { key, name } of envKeys) {
      if (key && key.trim() !== '') {
        const trimmedKey = key.trim();
        console.log(`Testing API key: ${name} (...${trimmedKey.slice(-8)})`);

        // Validate each key before adding
        const isValid = await this.validateKey(trimmedKey);

        const keyData = {
          key: trimmedKey,
          description: name,
          addedAt: new Date().toISOString(),
          isActive: isValid,
          lastUsed: null,
          totalRequests: 0,
          validationStatus: isValid ? 'valid' : 'invalid',
          lastValidated: new Date().toISOString()
        };

        this.apiKeys.push(keyData);
        this.quotaUsage.set(trimmedKey, 0);

        if (isValid) {
          validKeyCount++;
          console.log(`✅ ${name} is valid and active`);
        } else {
          console.warn(`❌ ${name} is invalid and will be disabled`);
        }
      }
    }

    console.log(`Loaded ${this.apiKeys.length} API keys from environment (${validKeyCount} valid)`);

    if (validKeyCount === 0) {
      console.error('❌ No valid YouTube API keys found!');
      console.error('💡 Please check your API key configuration in .env file');
      console.error('💡 Ensure YouTube Data API v3 is enabled for your keys');
    }

    if (this.apiKeys.length > 0) {
      this.saveKeys(); // Save to localStorage for future use
    }
  }

  /**
   * Save API keys to secure storage
   */
  async saveKeys() {
    try {
      localStorage.setItem('djamms_youtube_api_keys', JSON.stringify(this.apiKeys));
      localStorage.setItem('djamms_quota_usage', JSON.stringify({
        data: Array.from(this.quotaUsage.entries()),
        lastReset: this.lastResetTime
      }));
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  /**
   * Check if daily quota should be reset
   */
  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.lastResetTime !== today) {
      this.resetDailyQuota();
      this.lastResetTime = today;
    }
  }

  /**
   * Reset daily quota for all keys
   */
  resetDailyQuota() {
    this.quotaUsage.clear();
    console.log('Daily quota reset for all API keys');
  }

  /**
   * Add a new API key
   */
  async addKey(apiKey, description = '') {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key provided');
    }

    // Validate the key by making a test request
    const isValid = await this.validateKey(apiKey);
    if (!isValid) {
      throw new Error('API key validation failed');
    }

    const keyData = {
      key: apiKey,
      description: description || `Key ${this.apiKeys.length + 1}`,
      addedAt: new Date().toISOString(),
      isActive: true,
      lastUsed: null,
      totalRequests: 0
    };

    this.apiKeys.push(keyData);
    this.quotaUsage.set(apiKey, 0);
    await this.saveKeys();
    
    console.log('API key added successfully:', description);
    return true;
  }

  /**
   * Remove an API key
   */
  async removeKey(index) {
    if (index < 0 || index >= this.apiKeys.length) {
      throw new Error('Invalid key index');
    }

    const removedKey = this.apiKeys.splice(index, 1)[0];
    this.quotaUsage.delete(removedKey.key);
    
    // Adjust current index if necessary
    if (this.currentKeyIndex >= this.apiKeys.length) {
      this.currentKeyIndex = Math.max(0, this.apiKeys.length - 1);
    }

    await this.saveKeys();
    console.log('API key removed:', removedKey.description);
  }

  /**
   * Validate an API key by making a test request
   */
  async validateKey(apiKey) {
    try {
      const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&type=video&key=${apiKey}`;
      const response = await fetch(testUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const reason = errorData?.error?.errors?.[0]?.reason || 'unknown';
        const message = errorData?.error?.message || response.statusText;

        console.error(`API key validation failed for ...${apiKey.slice(-8)}:`, {
          status: response.status,
          reason,
          message
        });

        if (response.status === 403 && reason === 'forbidden') {
          console.error('API key appears to be invalid or YouTube Data API v3 is not enabled');
        }

        return false;
      }

      console.log(`API key validation successful for ...${apiKey.slice(-8)}`);
      return true;
    } catch (error) {
      console.error(`API key validation error for ...${apiKey.slice(-8)}:`, error);
      return false;
    }
  }

  /**
   * Get current active API key
   */
  getCurrentKey() {
    if (this.apiKeys.length === 0) {
      console.error('YouTube API Error: No API keys configured');
      throw new Error('No YouTube API keys available. Please add valid API keys in Settings.');
    }

    this.checkDailyReset();

    // Find a key with available quota
    let attempts = 0;
    const activeKeys = this.apiKeys.filter(key => key.isActive);

    if (activeKeys.length === 0) {
      console.error('YouTube API Error: No active API keys');
      throw new Error('All YouTube API keys are disabled. Please enable at least one key in Settings.');
    }

    while (attempts < this.apiKeys.length) {
      const currentKey = this.apiKeys[this.currentKeyIndex];
      const usage = this.quotaUsage.get(currentKey.key) || 0;

      if (currentKey.isActive && usage < this.DAILY_QUOTA_LIMIT) {
        console.log(`Using YouTube API key: ...${currentKey.key.slice(-8)} (${currentKey.description})`);
        return currentKey.key;
      }

      if (currentKey.isActive && usage >= this.DAILY_QUOTA_LIMIT) {
        console.warn(`API key ${currentKey.description} has exceeded daily quota (${usage}/${this.DAILY_QUOTA_LIMIT})`);
      }

      // Move to next key
      this.rotateKey();
      attempts++;
    }

    console.error('YouTube API Error: All keys exceeded quota');
    throw new Error('All YouTube API keys have exceeded their daily quota. Please wait for quota reset or add more keys.');
  }

  /**
   * Rotate to the next API key
   */
  rotateKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(`Rotated to API key ${this.currentKeyIndex + 1}`);
  }

  /**
   * Record API usage for quota tracking
   */
  recordUsage(operationType, requestCount = 1) {
    if (this.apiKeys.length === 0) return;

    let cost = 0;
    switch (operationType) {
      case 'search':
        cost = this.SEARCH_COST * requestCount;
        break;
      case 'playlistItems':
        cost = this.PLAYLIST_ITEMS_COST * requestCount;
        break;
      case 'videos':
        cost = this.VIDEO_DETAILS_COST * requestCount;
        break;
      default:
        cost = 1 * requestCount;
    }

    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (currentKey) {
      const currentUsage = this.quotaUsage.get(currentKey.key) || 0;
      this.quotaUsage.set(currentKey.key, currentUsage + cost);
      
      currentKey.lastUsed = new Date().toISOString();
      currentKey.totalRequests += requestCount;
      
      console.log(`API usage recorded: ${cost} units for ${operationType}`);
      this.saveKeys();
    }
  }

  /**
   * Get quota status for all keys
   */
  getQuotaStatus() {
    return this.apiKeys.map((keyData, index) => {
      const usage = this.quotaUsage.get(keyData.key) || 0;
      const remaining = Math.max(0, this.DAILY_QUOTA_LIMIT - usage);
      const percentUsed = (usage / this.DAILY_QUOTA_LIMIT) * 100;
      
      return {
        index,
        description: keyData.description,
        isActive: keyData.isActive,
        isCurrent: index === this.currentKeyIndex,
        usage,
        remaining,
        percentUsed: Math.round(percentUsed),
        lastUsed: keyData.lastUsed,
        totalRequests: keyData.totalRequests
      };
    });
  }

  /**
   * Get overall statistics
   */
  getStatistics() {
    const totalKeys = this.apiKeys.length;
    const activeKeys = this.apiKeys.filter(key => key.isActive).length;
    const totalUsage = Array.from(this.quotaUsage.values()).reduce((sum, usage) => sum + usage, 0);
    const totalRemaining = activeKeys * this.DAILY_QUOTA_LIMIT - totalUsage;
    
    return {
      totalKeys,
      activeKeys,
      totalUsage,
      totalRemaining,
      totalQuota: activeKeys * this.DAILY_QUOTA_LIMIT,
      lastResetTime: this.lastResetTime,
      currentKeyIndex: this.currentKeyIndex
    };
  }

  /**
   * Toggle key active status
   */
  async toggleKeyStatus(index) {
    if (index < 0 || index >= this.apiKeys.length) {
      throw new Error('Invalid key index');
    }

    this.apiKeys[index].isActive = !this.apiKeys[index].isActive;
    await this.saveKeys();
    
    console.log(`API key ${index + 1} ${this.apiKeys[index].isActive ? 'activated' : 'deactivated'}`);
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.initialized && this.apiKeys.length > 0;
  }

  /**
   * Get available quota estimate
   */
  getAvailableQuota() {
    const activeKeys = this.apiKeys.filter(key => key.isActive);
    let totalAvailable = 0;
    
    activeKeys.forEach(keyData => {
      const usage = this.quotaUsage.get(keyData.key) || 0;
      const remaining = Math.max(0, this.DAILY_QUOTA_LIMIT - usage);
      totalAvailable += remaining;
    });
    
    return totalAvailable;
  }
}

// Singleton instance
let apiKeyManager = null;

export function getAPIKeyManager() {
  if (!apiKeyManager) {
    apiKeyManager = new APIKeyManager();
  }
  return apiKeyManager;
}

export default APIKeyManager;

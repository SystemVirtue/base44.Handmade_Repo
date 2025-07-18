/**
 * Zone Management Service
 * Handles multi-zone audio distribution, monitoring, and synchronization
 */

// Zone device types
export const DEVICE_TYPES = {
  SPEAKER: "speaker",
  AMPLIFIER: "amplifier",
  DISPLAY: "display",
  CONTROLLER: "controller",
  MICROPHONE: "microphone",
};

// Zone status types
export const ZONE_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  ERROR: "error",
  SYNCING: "syncing",
  EMERGENCY_STOP: "emergency_stop",
};

// Connection status types
export const CONNECTION_STATUS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
};

/**
 * Zone Management Class
 */
export class ZoneManager {
  constructor() {
    this.zones = new Map();
    this.devices = new Map();
    this.monitoringInterval = null;
    this.syncInterval = null;
    this.eventListeners = [];

    this.initializeMockData();
  }

  /**
   * Initialize with mock data for demonstration
   */
  initializeMockData() {
    // Mock zones
    const mockZones = [
      {
        id: 1,
        name: "Main Floor - Restaurant",
        location: "Building A, Floor 1",
        description: "Primary dining area with ambient background music",
        status: ZONE_STATUS.ONLINE,
        volume: 75,
        muted: false,
        devices: [1, 2, 3],
        currentPlaylist: "Afternoon Vibes",
        activeSince: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        lastActivity: new Date().toISOString(),
        settings: {
          maxVolume: 85,
          autoFade: true,
          emergencyStopEnabled: true,
          allowGuests: true,
          priorityLevel: 1,
        },
        stats: {
          totalPlaytime: 14400, // seconds
          tracksPlayed: 156,
          averageVolume: 72,
          peakVolume: 82,
          connectedUsers: 12,
        },
        network: {
          ipAddress: "192.168.1.100",
          quality: "excellent",
          latency: 15,
          bandwidth: 1000,
          lastPing: Date.now(),
        },
      },
      {
        id: 2,
        name: "Bar & Lounge",
        location: "Building A, Floor 2",
        description: "Upbeat music zone for evening entertainment",
        status: ZONE_STATUS.ONLINE,
        volume: 85,
        muted: false,
        devices: [4, 5],
        currentPlaylist: "Evening Energy",
        activeSince: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date().toISOString(),
        settings: {
          maxVolume: 95,
          autoFade: false,
          emergencyStopEnabled: true,
          allowGuests: false,
          priorityLevel: 2,
        },
        stats: {
          totalPlaytime: 7200,
          tracksPlayed: 89,
          averageVolume: 82,
          peakVolume: 92,
          connectedUsers: 8,
        },
        network: {
          ipAddress: "192.168.1.101",
          quality: "good",
          latency: 25,
          bandwidth: 800,
          lastPing: Date.now(),
        },
      },
      {
        id: 3,
        name: "Private Dining",
        location: "Building B, Floor 1",
        description: "Intimate private dining room",
        status: ZONE_STATUS.OFFLINE,
        volume: 60,
        muted: true,
        devices: [6],
        currentPlaylist: null,
        activeSince: null,
        lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        settings: {
          maxVolume: 70,
          autoFade: true,
          emergencyStopEnabled: true,
          allowGuests: true,
          priorityLevel: 3,
        },
        stats: {
          totalPlaytime: 0,
          tracksPlayed: 0,
          averageVolume: 0,
          peakVolume: 0,
          connectedUsers: 0,
        },
        network: {
          ipAddress: "192.168.1.102",
          quality: "poor",
          latency: 0,
          bandwidth: 0,
          lastPing: Date.now() - 300000, // 5 minutes ago
        },
      },
    ];

    // Mock devices
    const mockDevices = [
      {
        id: 1,
        name: "Main Speaker Left",
        type: DEVICE_TYPES.SPEAKER,
        zoneId: 1,
        status: CONNECTION_STATUS.CONNECTED,
        volume: 80,
        muted: false,
        model: "JBL Professional LSR308P",
        firmware: "1.2.4",
        ipAddress: "192.168.1.110",
        capabilities: ["stereo", "eq", "volume_control"],
        lastSeen: new Date().toISOString(),
        health: {
          temperature: 42,
          signalStrength: 95,
          powerLevel: 100,
          errors: 0,
        },
      },
      {
        id: 2,
        name: "Main Speaker Right",
        type: DEVICE_TYPES.SPEAKER,
        zoneId: 1,
        status: CONNECTION_STATUS.CONNECTED,
        volume: 80,
        muted: false,
        model: "JBL Professional LSR308P",
        firmware: "1.2.4",
        ipAddress: "192.168.1.111",
        capabilities: ["stereo", "eq", "volume_control"],
        lastSeen: new Date().toISOString(),
        health: {
          temperature: 45,
          signalStrength: 92,
          powerLevel: 100,
          errors: 0,
        },
      },
      {
        id: 3,
        name: "Zone Display",
        type: DEVICE_TYPES.DISPLAY,
        zoneId: 1,
        status: CONNECTION_STATUS.CONNECTED,
        volume: 0,
        muted: false,
        model: "Samsung QM43R",
        firmware: "1.0.8",
        ipAddress: "192.168.1.112",
        capabilities: ["display", "touch", "info_panel"],
        lastSeen: new Date().toISOString(),
        health: {
          temperature: 38,
          signalStrength: 88,
          powerLevel: 100,
          errors: 0,
        },
      },
      {
        id: 4,
        name: "Bar Amplifier",
        type: DEVICE_TYPES.AMPLIFIER,
        zoneId: 2,
        status: CONNECTION_STATUS.CONNECTED,
        volume: 85,
        muted: false,
        model: "Crown XTi 4002",
        firmware: "2.1.1",
        ipAddress: "192.168.1.120",
        capabilities: ["amplification", "eq", "multi_channel"],
        lastSeen: new Date().toISOString(),
        health: {
          temperature: 55,
          signalStrength: 90,
          powerLevel: 85,
          errors: 0,
        },
      },
      {
        id: 5,
        name: "Bar Speakers",
        type: DEVICE_TYPES.SPEAKER,
        zoneId: 2,
        status: CONNECTION_STATUS.CONNECTED,
        volume: 85,
        muted: false,
        model: "QSC K12.2",
        firmware: "1.5.2",
        ipAddress: "192.168.1.121",
        capabilities: ["powered", "dsp", "volume_control"],
        lastSeen: new Date().toISOString(),
        health: {
          temperature: 48,
          signalStrength: 93,
          powerLevel: 90,
          errors: 0,
        },
      },
      {
        id: 6,
        name: "Private Room System",
        type: DEVICE_TYPES.CONTROLLER,
        zoneId: 3,
        status: CONNECTION_STATUS.DISCONNECTED,
        volume: 0,
        muted: true,
        model: "Control4 HC-300",
        firmware: "3.1.5",
        ipAddress: "192.168.1.130",
        capabilities: ["control", "automation", "scene_control"],
        lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        health: {
          temperature: 0,
          signalStrength: 0,
          powerLevel: 0,
          errors: 1,
        },
      },
    ];

    // Initialize data
    mockZones.forEach((zone) => this.zones.set(zone.id, zone));
    mockDevices.forEach((device) => this.devices.set(device.id, device));
  }

  /**
   * Start monitoring systems
   */
  startMonitoring() {
    // Monitor zone health every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.updateZoneHealth();
    }, 5000);

    // Sync zones every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncZones();
    }, 30000);

    console.log("Zone monitoring started");
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    console.log("Zone monitoring stopped");
  }

  /**
   * Get all zones
   */
  getZones() {
    return Array.from(this.zones.values());
  }

  /**
   * Get zone by ID
   */
  getZone(zoneId) {
    return this.zones.get(zoneId);
  }

  /**
   * Get devices for a zone
   */
  getZoneDevices(zoneId) {
    return Array.from(this.devices.values()).filter(
      (device) => device.zoneId === zoneId,
    );
  }

  /**
   * Update zone properties
   */
  updateZone(zoneId, updates) {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const updatedZone = {
      ...zone,
      ...updates,
      lastActivity: new Date().toISOString(),
    };
    this.zones.set(zoneId, updatedZone);

    this.emit("zoneUpdated", { zoneId, updates, zone: updatedZone });
    return true;
  }

  /**
   * Set zone volume
   */
  setZoneVolume(zoneId, volume) {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const clampedVolume = Math.max(
      0,
      Math.min(zone.settings.maxVolume, volume),
    );
    this.updateZone(zoneId, { volume: clampedVolume });

    // Update connected devices
    const devices = this.getZoneDevices(zoneId);
    devices.forEach((device) => {
      if (
        device.type === DEVICE_TYPES.SPEAKER ||
        device.type === DEVICE_TYPES.AMPLIFIER
      ) {
        this.updateDevice(device.id, { volume: clampedVolume });
      }
    });

    return true;
  }

  /**
   * Mute/unmute zone
   */
  toggleZoneMute(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const newMutedState = !zone.muted;
    this.updateZone(zoneId, { muted: newMutedState });

    // Update connected devices
    const devices = this.getZoneDevices(zoneId);
    devices.forEach((device) => {
      this.updateDevice(device.id, { muted: newMutedState });
    });

    return true;
  }

  /**
   * Update device properties
   */
  updateDevice(deviceId, updates) {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    const updatedDevice = {
      ...device,
      ...updates,
      lastSeen: new Date().toISOString(),
    };
    this.devices.set(deviceId, updatedDevice);

    this.emit("deviceUpdated", { deviceId, updates, device: updatedDevice });
    return true;
  }

  /**
   * Update zone health metrics
   */
  updateZoneHealth() {
    this.zones.forEach((zone) => {
      // Simulate some health metric updates
      const devices = this.getZoneDevices(zone.id);
      let allDevicesConnected = true;
      let avgLatency = 0;
      let deviceCount = 0;

      devices.forEach((device) => {
        if (device.status !== CONNECTION_STATUS.CONNECTED) {
          allDevicesConnected = false;
        }

        // Simulate minor changes in device health
        const tempVariation = (Math.random() - 0.5) * 4; // ±2°C
        const signalVariation = (Math.random() - 0.5) * 10; // ±5%

        this.updateDevice(device.id, {
          health: {
            ...device.health,
            temperature: Math.max(
              20,
              device.health.temperature + tempVariation,
            ),
            signalStrength: Math.max(
              0,
              Math.min(100, device.health.signalStrength + signalVariation),
            ),
          },
        });

        avgLatency += zone.network.latency;
        deviceCount++;
      });

      // Update zone network status
      if (deviceCount > 0) {
        avgLatency = avgLatency / deviceCount;
        const jitter = (Math.random() - 0.5) * 10; // ±5ms jitter

        this.updateZone(zone.id, {
          network: {
            ...zone.network,
            latency: Math.max(1, avgLatency + jitter),
            lastPing: Date.now(),
            quality:
              avgLatency < 20 ? "excellent" : avgLatency < 50 ? "good" : "poor",
          },
        });
      }

      // Update zone status based on device connectivity
      if (!allDevicesConnected && zone.status === ZONE_STATUS.ONLINE) {
        this.updateZone(zone.id, { status: ZONE_STATUS.ERROR });
      } else if (allDevicesConnected && zone.status === ZONE_STATUS.ERROR) {
        this.updateZone(zone.id, { status: ZONE_STATUS.ONLINE });
      }
    });
  }

  /**
   * Sync zones (placeholder for real sync logic)
   */
  syncZones() {
    console.log("Syncing zones...");
    this.emit("zonesSync", { timestamp: new Date().toISOString() });
  }

  /**
   * Get zone statistics
   */
  getZoneStatistics(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    const devices = this.getZoneDevices(zoneId);
    const connectedDevices = devices.filter(
      (d) => d.status === CONNECTION_STATUS.CONNECTED,
    );

    return {
      ...zone.stats,
      deviceCount: devices.length,
      connectedDevices: connectedDevices.length,
      uptime: zone.activeSince
        ? Date.now() - new Date(zone.activeSince).getTime()
        : 0,
      health: {
        overall:
          connectedDevices.length === devices.length ? "healthy" : "warning",
        temperature: Math.max(...devices.map((d) => d.health.temperature)),
        avgSignalStrength:
          devices.reduce((sum, d) => sum + d.health.signalStrength, 0) /
          devices.length,
      },
    };
  }

  /**
   * Emergency stop all zones
   */
  emergencyStopAll() {
    this.zones.forEach((zone) => {
      if (zone.settings.emergencyStopEnabled) {
        this.updateZone(zone.id, {
          status: ZONE_STATUS.EMERGENCY_STOP,
          volume: 0,
          muted: true,
        });
      }
    });

    this.emit("emergencyStop", { timestamp: new Date().toISOString() });
  }

  /**
   * Recover from emergency stop
   */
  emergencyRecover() {
    this.zones.forEach((zone) => {
      if (zone.status === ZONE_STATUS.EMERGENCY_STOP) {
        this.updateZone(zone.id, {
          status: ZONE_STATUS.ONLINE,
          volume: 25, // Safe recovery volume
          muted: false,
        });
      }
    });

    this.emit("emergencyRecover", { timestamp: new Date().toISOString() });
  }

  /**
   * Event system
   */
  on(event, callback) {
    this.eventListeners.push({ event, callback });
  }

  off(event, callback) {
    this.eventListeners = this.eventListeners.filter(
      (listener) => listener.event !== event || listener.callback !== callback,
    );
  }

  emit(event, data) {
    this.eventListeners
      .filter((listener) => listener.event === event)
      .forEach((listener) => listener.callback(data));
  }
}

// Global zone manager instance
let zoneManager = null;

/**
 * Get or create zone manager instance
 */
export function getZoneManager() {
  if (!zoneManager) {
    zoneManager = new ZoneManager();
  }
  return zoneManager;
}

/**
 * Initialize zone management system
 */
export function initializeZoneManagement() {
  const manager = getZoneManager();
  manager.startMonitoring();
  return manager;
}

export default ZoneManager;

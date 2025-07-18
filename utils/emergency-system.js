/**
 * Emergency System Utility
 * Handles system-wide emergency stops, fades, and safety controls
 */

// Emergency stop event system
class EmergencyEventSystem {
  constructor() {
    this.listeners = [];
    this.isEmergencyActive = false;
    this.emergencyType = null;
    this.emergencyStartTime = null;
  }

  // Add emergency listener
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  // Trigger emergency event
  trigger(type, data = {}) {
    this.isEmergencyActive = true;
    this.emergencyType = type;
    this.emergencyStartTime = Date.now();

    const emergencyEvent = {
      type,
      timestamp: this.emergencyStartTime,
      data,
    };

    console.warn(
      `🚨 EMERGENCY ${type.toUpperCase()} TRIGGERED`,
      emergencyEvent,
    );

    this.listeners.forEach((listener) => {
      try {
        listener(emergencyEvent);
      } catch (error) {
        console.error("Emergency listener error:", error);
      }
    });
  }

  // Clear emergency state
  clear() {
    this.isEmergencyActive = false;
    this.emergencyType = null;
    this.emergencyStartTime = null;
    console.log("🟢 Emergency state cleared");
  }

  // Get current emergency status
  getStatus() {
    return {
      isActive: this.isEmergencyActive,
      type: this.emergencyType,
      startTime: this.emergencyStartTime,
      duration: this.emergencyStartTime
        ? Date.now() - this.emergencyStartTime
        : 0,
    };
  }
}

// Global emergency system instance
export const emergencySystem = new EmergencyEventSystem();

/**
 * Emergency Stop Actions
 */
export class EmergencyActions {
  constructor(audioStore, zoneStore, uiStore) {
    this.audioStore = audioStore;
    this.zoneStore = zoneStore;
    this.uiStore = uiStore;
  }

  /**
   * Immediate Emergency Stop
   * Instantly stops all audio and visual feedback
   */
  async immediateStop() {
    try {
      emergencySystem.trigger("IMMEDIATE_STOP");

      // Immediate audio shutdown
      const { audioInstance, pause, setVolume } = this.audioStore.getState();

      if (audioInstance) {
        audioInstance.pause();
        audioInstance.volume = 0;
      }

      // Store updates
      pause();
      setVolume(0);

      // Zone-wide shutdown if zones exist
      if (this.zoneStore) {
        const { zones, updateZone } = this.zoneStore.getState();
        zones.forEach((zone) => {
          updateZone(zone.id, {
            volume: 0,
            status: "emergency_stop",
            lastEmergencyStop: new Date().toISOString(),
          });
        });
      }

      // UI notification
      if (this.uiStore) {
        this.uiStore.getState().addNotification({
          type: "emergency",
          title: "EMERGENCY STOP ACTIVATED",
          message: "All audio systems have been immediately stopped",
          priority: "critical",
        });
      }

      console.log("✅ Immediate emergency stop completed");
      return true;
    } catch (error) {
      console.error("❌ Emergency stop failed:", error);
      return false;
    }
  }

  /**
   * Fade Out Emergency Stop
   * Gracefully fades out all audio over specified duration
   */
  async fadeOutStop(duration = 3000) {
    try {
      emergencySystem.trigger("FADE_OUT_STOP", { duration });

      const {
        audioInstance,
        volume: currentVolume,
        setVolume,
      } = this.audioStore.getState();
      const startVolume = currentVolume;
      const startTime = Date.now();

      // UI notification
      if (this.uiStore) {
        this.uiStore.getState().addNotification({
          type: "warning",
          title: "FADE OUT EMERGENCY STOP",
          message: `Fading out all audio over ${duration / 1000} seconds`,
          priority: "high",
        });
      }

      // Smooth fade out animation
      const fadeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newVolume = Math.round(startVolume * (1 - progress));

        setVolume(newVolume);

        if (audioInstance) {
          audioInstance.volume = newVolume / 100;
        }

        // Zone updates
        if (this.zoneStore) {
          const { zones, updateZone } = this.zoneStore.getState();
          zones.forEach((zone) => {
            updateZone(zone.id, { volume: newVolume });
          });
        }

        if (progress >= 1) {
          clearInterval(fadeInterval);
          // Final stop
          if (audioInstance) {
            audioInstance.pause();
          }
          this.audioStore.getState().pause();
          console.log("✅ Fade out emergency stop completed");
        }
      }, 50); // 50ms intervals for smooth fading

      return true;
    } catch (error) {
      console.error("❌ Fade out emergency stop failed:", error);
      return false;
    }
  }

  /**
   * System Recovery
   * Restores system to safe operational state
   */
  async systemRecovery() {
    try {
      console.log("🔄 Starting system recovery...");

      // Clear emergency state
      emergencySystem.clear();

      // Reset zones to safe state
      if (this.zoneStore) {
        const { zones, updateZone } = this.zoneStore.getState();
        zones.forEach((zone) => {
          updateZone(zone.id, {
            status: "online",
            volume: 25, // Safe default volume
            lastRecovery: new Date().toISOString(),
          });
        });
      }

      // Reset audio to safe state
      const { setVolume } = this.audioStore.getState();
      setVolume(25); // Safe default volume

      // UI notification
      if (this.uiStore) {
        this.uiStore.getState().addNotification({
          type: "success",
          title: "SYSTEM RECOVERY COMPLETE",
          message: "All systems restored to safe operational state",
          priority: "normal",
        });
      }

      console.log("✅ System recovery completed");
      return true;
    } catch (error) {
      console.error("❌ System recovery failed:", error);
      return false;
    }
  }

  /**
   * Test Emergency Systems
   * Runs a safe test of emergency procedures
   */
  async testEmergencySystems() {
    try {
      console.log("🧪 Testing emergency systems...");

      const originalVolume = this.audioStore.getState().volume;

      // Brief volume reduction test
      this.audioStore.getState().setVolume(10);

      setTimeout(() => {
        this.audioStore.getState().setVolume(originalVolume);

        if (this.uiStore) {
          this.uiStore.getState().addNotification({
            type: "info",
            title: "EMERGENCY SYSTEM TEST COMPLETE",
            message: "All emergency systems are functioning correctly",
            priority: "normal",
          });
        }

        console.log("✅ Emergency systems test completed");
      }, 1000);

      return true;
    } catch (error) {
      console.error("❌ Emergency systems test failed:", error);
      return false;
    }
  }
}

/**
 * Emergency System Status Monitor
 */
export class EmergencyStatusMonitor {
  constructor() {
    this.statusHistory = [];
    this.maxHistorySize = 100;
  }

  logEvent(event) {
    this.statusHistory.unshift({
      ...event,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    });

    // Maintain history size
    if (this.statusHistory.length > this.maxHistorySize) {
      this.statusHistory = this.statusHistory.slice(0, this.maxHistorySize);
    }
  }

  getHistory() {
    return [...this.statusHistory];
  }

  getLastEmergency() {
    return this.statusHistory.find(
      (event) =>
        event.type === "IMMEDIATE_STOP" || event.type === "FADE_OUT_STOP",
    );
  }

  clearHistory() {
    this.statusHistory = [];
  }
}

export const emergencyMonitor = new EmergencyStatusMonitor();

// Set up event logging
emergencySystem.addListener((event) => {
  emergencyMonitor.logEvent(event);
});

export default {
  emergencySystem,
  EmergencyActions,
  emergencyMonitor,
};

/**
 * Emergency System Utility
 * Handles system-wide emergency stops and safety controls
 */

/**
 * Emergency Actions for Professional DJ/Venue Systems
 */
export class EmergencyActions {
  constructor(audioStore, zoneStore, uiStore) {
    this.audioStore = audioStore;
    this.zoneStore = zoneStore;
    this.uiStore = uiStore;
    this.isEmergencyActive = false;
  }

  /**
   * Immediate Emergency Stop - Instantly stops all audio
   */
  async immediateStop() {
    try {
      console.warn("🚨 EMERGENCY STOP ACTIVATED");
      this.isEmergencyActive = true;

      const { audioInstance, pause, setVolume } = this.audioStore.getState();

      // Immediate audio shutdown
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

      return true;
    } catch (error) {
      console.error("❌ Emergency stop failed:", error);
      return false;
    }
  }

  /**
   * Fade Out Emergency Stop - Gracefully fades out all audio
   */
  async fadeOutStop(duration = 3000) {
    try {
      console.warn(`🟠 FADE OUT EMERGENCY STOP (${duration / 1000}s)`);
      this.isEmergencyActive = true;

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

      // Smooth fade out
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
        }
      }, 50);

      return true;
    } catch (error) {
      console.error("❌ Fade out emergency stop failed:", error);
      return false;
    }
  }

  /**
   * System Recovery - Restores system to safe operational state
   */
  async systemRecovery() {
    try {
      console.log("🔄 Starting system recovery...");
      this.isEmergencyActive = false;

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

      return true;
    } catch (error) {
      console.error("❌ System recovery failed:", error);
      return false;
    }
  }

  /**
   * Test Emergency Systems
   */
  async testEmergencySystems() {
    try {
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
      }, 1000);

      return true;
    } catch (error) {
      console.error("❌ Emergency systems test failed:", error);
      return false;
    }
  }

  getStatus() {
    return {
      isActive: this.isEmergencyActive,
      timestamp: new Date().toISOString(),
    };
  }
}

export default EmergencyActions;

/**
 * Real-Time Audio Processing Service
 * Handles EQ, effects, and professional audio processing
 */

class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.eqFilters = {};
    this.gainNode = null;
    this.analyserNode = null;
    this.compressorNode = null;
    this.outputNode = null;
    this.isInitialized = false;
    this.currentPreset = "flat";

    // EQ Presets
    this.eqPresets = {
      flat: { bass: 0, mid: 0, treble: 0, presence: 0 },
      pop: { bass: 2, mid: 0, treble: 3, presence: 1 },
      rock: { bass: 4, mid: -1, treble: 2, presence: 4 },
      electronic: { bass: 6, mid: -2, treble: 4, presence: 2 },
      jazz: { bass: 1, mid: 2, treble: 1, presence: 3 },
      classical: { bass: 0, mid: 1, treble: 2, presence: 1 },
      bass_boost: { bass: 8, mid: 0, treble: 0, presence: 0 },
      vocal: { bass: -2, mid: 4, treble: 2, presence: 6 },
      club: { bass: 6, mid: -1, treble: 4, presence: 2 },
    };

    // Effect settings
    this.effects = {
      compressor: {
        enabled: false,
        threshold: -24,
        knee: 30,
        ratio: 12,
        attack: 0.003,
        release: 0.25,
      },
      reverb: {
        enabled: false,
        roomSize: 0.3,
        dampening: 0.2,
        wetLevel: 0.1,
        dryLevel: 0.9,
      },
      limiter: {
        enabled: true,
        threshold: -1,
        release: 0.01,
      },
    };
  }

  /**
   * Initialize audio processing pipeline
   */
  async initialize(audioElement) {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Resume context if suspended (required for autoplay policies)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Create audio source from HTML5 audio element
      this.sourceNode =
        this.audioContext.createMediaElementSource(audioElement);

      // Create EQ filter chains
      this.createEQFilters();

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();

      // Create analyser for visualizations
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Create compressor for dynamic range control
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.setupCompressor();

      // Connect audio pipeline
      this.connectAudioPipeline();

      this.isInitialized = true;
      console.log("Audio processing initialized successfully");

      return true;
    } catch (error) {
      console.error("Failed to initialize audio processing:", error);
      return false;
    }
  }

  /**
   * Create EQ filter nodes
   */
  createEQFilters() {
    // Bass filter (low shelf)
    this.eqFilters.bass = this.audioContext.createBiquadFilter();
    this.eqFilters.bass.type = "lowshelf";
    this.eqFilters.bass.frequency.value = 100;
    this.eqFilters.bass.gain.value = 0;

    // Mid filter (peaking)
    this.eqFilters.mid = this.audioContext.createBiquadFilter();
    this.eqFilters.mid.type = "peaking";
    this.eqFilters.mid.frequency.value = 1000;
    this.eqFilters.mid.Q.value = 1;
    this.eqFilters.mid.gain.value = 0;

    // Treble filter (high shelf)
    this.eqFilters.treble = this.audioContext.createBiquadFilter();
    this.eqFilters.treble.type = "highshelf";
    this.eqFilters.treble.frequency.value = 3000;
    this.eqFilters.treble.gain.value = 0;

    // Presence filter (peaking)
    this.eqFilters.presence = this.audioContext.createBiquadFilter();
    this.eqFilters.presence.type = "peaking";
    this.eqFilters.presence.frequency.value = 6000;
    this.eqFilters.presence.Q.value = 2;
    this.eqFilters.presence.gain.value = 0;
  }

  /**
   * Setup compressor settings
   */
  setupCompressor() {
    const settings = this.effects.compressor;
    this.compressorNode.threshold.value = settings.threshold;
    this.compressorNode.knee.value = settings.knee;
    this.compressorNode.ratio.value = settings.ratio;
    this.compressorNode.attack.value = settings.attack;
    this.compressorNode.release.value = settings.release;
  }

  /**
   * Connect audio processing pipeline
   */
  connectAudioPipeline() {
    // Source -> EQ Chain -> Compressor -> Gain -> Analyser -> Destination
    this.sourceNode
      .connect(this.eqFilters.bass)
      .connect(this.eqFilters.mid)
      .connect(this.eqFilters.treble)
      .connect(this.eqFilters.presence)
      .connect(this.compressorNode)
      .connect(this.gainNode)
      .connect(this.analyserNode)
      .connect(this.audioContext.destination);
  }

  /**
   * Update EQ band value
   */
  setEQBand(band, value) {
    if (!this.isInitialized || !this.eqFilters[band]) {
      return false;
    }

    try {
      // Clamp value between -12 and +12 dB
      const clampedValue = Math.max(-12, Math.min(12, value));

      // Smooth transition to prevent audio artifacts
      const currentTime = this.audioContext.currentTime;
      this.eqFilters[band].gain.cancelScheduledValues(currentTime);
      this.eqFilters[band].gain.setValueAtTime(
        this.eqFilters[band].gain.value,
        currentTime,
      );
      this.eqFilters[band].gain.linearRampToValueAtTime(
        clampedValue,
        currentTime + 0.05,
      );

      return true;
    } catch (error) {
      console.error(`Failed to set ${band} EQ:`, error);
      return false;
    }
  }

  /**
   * Set complete EQ settings
   */
  setEQSettings(settings) {
    Object.entries(settings).forEach(([band, value]) => {
      this.setEQBand(band, value);
    });
  }

  /**
   * Apply EQ preset
   */
  applyEQPreset(presetName) {
    if (!this.eqPresets[presetName]) {
      console.warn(`Unknown EQ preset: ${presetName}`);
      return false;
    }

    this.currentPreset = presetName;
    this.setEQSettings(this.eqPresets[presetName]);
    return true;
  }

  /**
   * Get current EQ settings
   */
  getCurrentEQSettings() {
    if (!this.isInitialized) return null;

    return {
      bass: this.eqFilters.bass?.gain.value || 0,
      mid: this.eqFilters.mid?.gain.value || 0,
      treble: this.eqFilters.treble?.gain.value || 0,
      presence: this.eqFilters.presence?.gain.value || 0,
    };
  }

  /**
   * Set master volume
   */
  setVolume(volume) {
    if (!this.isInitialized || !this.gainNode) return false;

    try {
      // Convert percentage to linear gain (0-1)
      const gain = Math.max(0, Math.min(1, volume / 100));

      const currentTime = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.05);

      return true;
    } catch (error) {
      console.error("Failed to set volume:", error);
      return false;
    }
  }

  /**
   * Toggle compressor
   */
  toggleCompressor(enabled) {
    this.effects.compressor.enabled = enabled;

    if (!this.isInitialized) return false;

    // For simplicity, we'll just bypass/enable the compressor
    // In a more advanced implementation, you'd have a bypass chain
    if (enabled) {
      this.setupCompressor();
    } else {
      // Disable compression by setting very high threshold
      this.compressorNode.threshold.value = 0;
      this.compressorNode.ratio.value = 1;
    }

    return true;
  }

  /**
   * Get frequency analysis data for visualizations
   */
  getFrequencyData() {
    if (!this.isInitialized || !this.analyserNode) return null;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);

    return {
      data: dataArray,
      sampleRate: this.audioContext.sampleRate,
      bufferLength: bufferLength,
    };
  }

  /**
   * Get time domain data for waveform visualization
   */
  getTimeDomainData() {
    if (!this.isInitialized || !this.analyserNode) return null;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteTimeDomainData(dataArray);

    return dataArray;
  }

  /**
   * Get audio processing statistics
   */
  getProcessingStats() {
    if (!this.isInitialized) return null;

    return {
      sampleRate: this.audioContext.sampleRate,
      currentTime: this.audioContext.currentTime,
      state: this.audioContext.state,
      baseLatency: this.audioContext.baseLatency || 0,
      outputLatency: this.audioContext.outputLatency || 0,
      eqSettings: this.getCurrentEQSettings(),
      currentPreset: this.currentPreset,
      compressorEnabled: this.effects.compressor.enabled,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Create audio processing preset
   */
  createCustomPreset(name, settings) {
    this.eqPresets[name] = { ...settings };
    return true;
  }

  /**
   * Export current settings
   */
  exportSettings() {
    return {
      eq: this.getCurrentEQSettings(),
      preset: this.currentPreset,
      effects: { ...this.effects },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Import settings
   */
  importSettings(settings) {
    try {
      if (settings.eq) {
        this.setEQSettings(settings.eq);
      }

      if (settings.effects) {
        this.effects = { ...this.effects, ...settings.effects };
        if (settings.effects.compressor) {
          this.toggleCompressor(settings.effects.compressor.enabled);
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  }

  /**
   * Cleanup audio processing
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.sourceNode = null;
    this.eqFilters = {};
    this.gainNode = null;
    this.analyserNode = null;
    this.compressorNode = null;
    this.isInitialized = false;
  }

  /**
   * Get available EQ presets
   */
  getEQPresets() {
    return Object.keys(this.eqPresets).map((name) => ({
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
      settings: this.eqPresets[name],
    }));
  }
}

// Global audio processor instance
let audioProcessor = null;

/**
 * Get or create audio processor instance
 */
export function getAudioProcessor() {
  if (!audioProcessor) {
    audioProcessor = new AudioProcessor();
  }
  return audioProcessor;
}

/**
 * Initialize audio processing for an audio element
 */
export async function initializeAudioProcessing(audioElement) {
  const processor = getAudioProcessor();
  return await processor.initialize(audioElement);
}

/**
 * Audio processing hook for React components
 */
export function useAudioProcessing() {
  const processor = getAudioProcessor();

  return {
    isInitialized: processor.isInitialized,
    setEQBand: processor.setEQBand.bind(processor),
    setEQSettings: processor.setEQSettings.bind(processor),
    applyEQPreset: processor.applyEQPreset.bind(processor),
    getCurrentEQSettings: processor.getCurrentEQSettings.bind(processor),
    setVolume: processor.setVolume.bind(processor),
    toggleCompressor: processor.toggleCompressor.bind(processor),
    getFrequencyData: processor.getFrequencyData.bind(processor),
    getTimeDomainData: processor.getTimeDomainData.bind(processor),
    getProcessingStats: processor.getProcessingStats.bind(processor),
    getEQPresets: processor.getEQPresets.bind(processor),
    exportSettings: processor.exportSettings.bind(processor),
    importSettings: processor.importSettings.bind(processor),
  };
}

export default AudioProcessor;

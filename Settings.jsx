import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Download,
  Upload,
  Shield,
  Volume2,
  Wifi,
  Monitor,
  Bell,
  Database,
  Palette,
  Users,
  Clock,
  Music,
  HardDrive,
  Globe,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useUIStore, useAudioStore, useZoneStore } from "./store.js";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Store integration
  const { theme, setTheme } = useUIStore();
  const { volume, setVolume } = useAudioStore();
  const { currentZone } = useZoneStore();

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      appName: "DJAMMS",
      language: "en",
      timezone: "America/New_York",
      autoStart: true,
      minimizeToTray: false,
      checkUpdates: true,
      telemetryEnabled: true,
    },
    audio: {
      defaultVolume: 75,
      maxVolume: 100,
      audioEngine: "directsound",
      sampleRate: 44100,
      bufferSize: 512,
      bitDepth: 16,
      crossfadeDuration: 3,
      normalizeAudio: true,
      replayGain: true,
    },
    network: {
      serverPort: 3000,
      enableRemoteAccess: false,
      remotePort: 8080,
      enableSSL: false,
      streamingQuality: "high",
      bandwidthLimit: 0,
      proxyEnabled: false,
      proxyHost: "",
      proxyPort: 8080,
    },
    security: {
      enableAuth: true,
      sessionTimeout: 24,
      passwordPolicy: "medium",
      twoFactorAuth: false,
      apiKeys: [],
      auditLog: true,
      encryptData: true,
      autoLogout: 30,
    },
    notifications: {
      showDesktop: true,
      playSound: true,
      systemAlerts: true,
      playbackNotifications: false,
      errorNotifications: true,
      updateNotifications: true,
      scheduleReminders: true,
    },
    backup: {
      autoBackup: true,
      backupInterval: "daily",
      backupLocation: "./backups",
      retentionDays: 30,
      includeMedia: false,
      compression: true,
      cloudSync: false,
      cloudProvider: "none",
    },
    advanced: {
      logLevel: "info",
      maxLogSize: 100,
      debugMode: false,
      performanceMode: "balanced",
      cacheSize: 256,
      preloadTracks: 3,
      analyticsEnabled: true,
      experimentalFeatures: false,
    },
  });

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "audio", label: "Audio", icon: Volume2 },
    { id: "network", label: "Network", icon: Wifi },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "backup", label: "Backup", icon: Database },
    { id: "advanced", label: "Advanced", icon: HardDrive },
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log("Saving settings:", settings);
    setUnsavedChanges(false);

    // Show success notification
    alert("Settings saved successfully!");
  };

  const handleResetSettings = () => {
    setShowResetModal(false);
    // Reset to default settings
    setSettings({
      ...settings,
      [activeTab]: {
        // Reset current tab to defaults (would need default values)
      },
    });
    setUnsavedChanges(true);
  };

  const handleExportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "djamms-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setUnsavedChanges(true);
          alert("Settings imported successfully!");
        } catch (error) {
          alert("Failed to import settings. Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Application Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Application Name
            </label>
            <input
              type="text"
              value={settings.general.appName}
              onChange={(e) =>
                handleSettingChange("general", "appName", e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={settings.general.language}
              onChange={(e) =>
                handleSettingChange("general", "language", e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) =>
                handleSettingChange("general", "timezone", e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Startup & Behavior</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.general.autoStart}
              onChange={(e) =>
                handleSettingChange("general", "autoStart", e.target.checked)
              }
              className="rounded"
            />
            <span>Start automatically with system</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.general.minimizeToTray}
              onChange={(e) =>
                handleSettingChange(
                  "general",
                  "minimizeToTray",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Minimize to system tray</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.general.checkUpdates}
              onChange={(e) =>
                handleSettingChange("general", "checkUpdates", e.target.checked)
              }
              className="rounded"
            />
            <span>Check for updates automatically</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.general.telemetryEnabled}
              onChange={(e) =>
                handleSettingChange(
                  "general",
                  "telemetryEnabled",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Send anonymous usage data to help improve DJAMMS</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAudioSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Audio Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Audio Engine
            </label>
            <select
              value={settings.audio.audioEngine}
              onChange={(e) =>
                handleSettingChange("audio", "audioEngine", e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="directsound">DirectSound</option>
              <option value="wasapi">WASAPI</option>
              <option value="asio">ASIO</option>
              <option value="coreaudio">Core Audio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Rate
            </label>
            <select
              value={settings.audio.sampleRate}
              onChange={(e) =>
                handleSettingChange(
                  "audio",
                  "sampleRate",
                  parseInt(e.target.value),
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value={44100}>44.1 kHz</option>
              <option value={48000}>48 kHz</option>
              <option value={96000}>96 kHz</option>
              <option value={192000}>192 kHz</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buffer Size
            </label>
            <select
              value={settings.audio.bufferSize}
              onChange={(e) =>
                handleSettingChange(
                  "audio",
                  "bufferSize",
                  parseInt(e.target.value),
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value={128}>128 samples</option>
              <option value={256}>256 samples</option>
              <option value={512}>512 samples</option>
              <option value={1024}>1024 samples</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bit Depth
            </label>
            <select
              value={settings.audio.bitDepth}
              onChange={(e) =>
                handleSettingChange(
                  "audio",
                  "bitDepth",
                  parseInt(e.target.value),
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value={16}>16-bit</option>
              <option value={24}>24-bit</option>
              <option value={32}>32-bit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Playback Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Volume: {settings.audio.defaultVolume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.audio.defaultVolume}
              onChange={(e) =>
                handleSettingChange(
                  "audio",
                  "defaultVolume",
                  parseInt(e.target.value),
                )
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Volume: {settings.audio.maxVolume}%
            </label>
            <input
              type="range"
              min="50"
              max="120"
              value={settings.audio.maxVolume}
              onChange={(e) =>
                handleSettingChange(
                  "audio",
                  "maxVolume",
                  parseInt(e.target.value),
                )
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Crossfade Duration: {settings.audio.crossfadeDuration}s
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={settings.audio.crossfadeDuration}
              onChange={(e) =>
                handleSettingChange(
                  "audio",
                  "crossfadeDuration",
                  parseFloat(e.target.value),
                )
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.audio.normalizeAudio}
              onChange={(e) =>
                handleSettingChange("audio", "normalizeAudio", e.target.checked)
              }
              className="rounded"
            />
            <span>Normalize audio levels</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.audio.replayGain}
              onChange={(e) =>
                handleSettingChange("audio", "replayGain", e.target.checked)
              }
              className="rounded"
            />
            <span>Apply ReplayGain</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNetworkSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Server Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Server Port
            </label>
            <input
              type="number"
              value={settings.network.serverPort}
              onChange={(e) =>
                handleSettingChange(
                  "network",
                  "serverPort",
                  parseInt(e.target.value),
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Remote Access Port
            </label>
            <input
              type="number"
              value={settings.network.remotePort}
              onChange={(e) =>
                handleSettingChange(
                  "network",
                  "remotePort",
                  parseInt(e.target.value),
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.network.enableRemoteAccess}
              onChange={(e) =>
                handleSettingChange(
                  "network",
                  "enableRemoteAccess",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Enable remote access</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.network.enableSSL}
              onChange={(e) =>
                handleSettingChange("network", "enableSSL", e.target.checked)
              }
              className="rounded"
            />
            <span>Enable SSL/TLS encryption</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Streaming & Performance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Streaming Quality
            </label>
            <select
              value={settings.network.streamingQuality}
              onChange={(e) =>
                handleSettingChange(
                  "network",
                  "streamingQuality",
                  e.target.value,
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="low">Low (128 kbps)</option>
              <option value="medium">Medium (256 kbps)</option>
              <option value="high">High (320 kbps)</option>
              <option value="lossless">Lossless</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bandwidth Limit (Mbps):{" "}
              {settings.network.bandwidthLimit || "Unlimited"}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.network.bandwidthLimit}
              onChange={(e) =>
                handleSettingChange(
                  "network",
                  "bandwidthLimit",
                  parseInt(e.target.value),
                )
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Authentication
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.enableAuth}
              onChange={(e) =>
                handleSettingChange("security", "enableAuth", e.target.checked)
              }
              className="rounded"
            />
            <span>Require user authentication</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange(
                    "security",
                    "sessionTimeout",
                    parseInt(e.target.value),
                  )
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="1"
                max="168"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Auto-logout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.autoLogout}
                onChange={(e) =>
                  handleSettingChange(
                    "security",
                    "autoLogout",
                    parseInt(e.target.value),
                  )
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="5"
                max="120"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password Policy
            </label>
            <select
              value={settings.security.passwordPolicy}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "passwordPolicy",
                  e.target.value,
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="basic">Basic (6+ characters)</option>
              <option value="medium">Medium (8+ chars, mixed case)</option>
              <option value="strong">
                Strong (12+ chars, mixed case, numbers, symbols)
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Security</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "twoFactorAuth",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Enable two-factor authentication</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.auditLog}
              onChange={(e) =>
                handleSettingChange("security", "auditLog", e.target.checked)
              }
              className="rounded"
            />
            <span>Enable audit logging</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.encryptData}
              onChange={(e) =>
                handleSettingChange("security", "encryptData", e.target.checked)
              }
              className="rounded"
            />
            <span>Encrypt stored data</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Desktop Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.showDesktop}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "showDesktop",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Show desktop notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.playSound}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "playSound",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Play notification sounds</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.systemAlerts}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "systemAlerts",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>System status alerts</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.errorNotifications}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "errorNotifications",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Error notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.updateNotifications}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "updateNotifications",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Update notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.scheduleReminders}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "scheduleReminders",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Schedule reminders</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Automatic Backup</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.backup.autoBackup}
              onChange={(e) =>
                handleSettingChange("backup", "autoBackup", e.target.checked)
              }
              className="rounded"
            />
            <span>Enable automatic backups</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Interval
              </label>
              <select
                value={settings.backup.backupInterval}
                onChange={(e) =>
                  handleSettingChange(
                    "backup",
                    "backupInterval",
                    e.target.value,
                  )
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                disabled={!settings.backup.autoBackup}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retention (days)
              </label>
              <input
                type="number"
                value={settings.backup.retentionDays}
                onChange={(e) =>
                  handleSettingChange(
                    "backup",
                    "retentionDays",
                    parseInt(e.target.value),
                  )
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="1"
                max="365"
                disabled={!settings.backup.autoBackup}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Backup Location
            </label>
            <input
              type="text"
              value={settings.backup.backupLocation}
              onChange={(e) =>
                handleSettingChange("backup", "backupLocation", e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              disabled={!settings.backup.autoBackup}
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.backup.includeMedia}
              onChange={(e) =>
                handleSettingChange("backup", "includeMedia", e.target.checked)
              }
              className="rounded"
              disabled={!settings.backup.autoBackup}
            />
            <span>Include media files in backup</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.backup.compression}
              onChange={(e) =>
                handleSettingChange("backup", "compression", e.target.checked)
              }
              className="rounded"
              disabled={!settings.backup.autoBackup}
            />
            <span>Enable compression</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Manual Backup</h3>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors">
            Create Backup Now
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
            Restore from Backup
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="font-semibold text-red-400">Warning</span>
        </div>
        <p className="text-sm text-gray-300">
          These are advanced settings that can affect system performance and
          stability. Only modify these if you understand their implications.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Logging & Debugging</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Log Level
            </label>
            <select
              value={settings.advanced.logLevel}
              onChange={(e) =>
                handleSettingChange("advanced", "logLevel", e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="trace">Trace</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Log File Size (MB)
            </label>
            <input
              type="number"
              value={settings.advanced.maxLogSize}
              onChange={(e) =>
                handleSettingChange(
                  "advanced",
                  "maxLogSize",
                  parseInt(e.target.value),
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              min="10"
              max="1000"
            />
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.advanced.debugMode}
              onChange={(e) =>
                handleSettingChange("advanced", "debugMode", e.target.checked)
              }
              className="rounded"
            />
            <span>Enable debug mode</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Performance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Performance Mode
            </label>
            <select
              value={settings.advanced.performanceMode}
              onChange={(e) =>
                handleSettingChange(
                  "advanced",
                  "performanceMode",
                  e.target.value,
                )
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="battery">Battery Saver</option>
              <option value="balanced">Balanced</option>
              <option value="performance">High Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cache Size (MB): {settings.advanced.cacheSize}
            </label>
            <input
              type="range"
              min="64"
              max="2048"
              step="64"
              value={settings.advanced.cacheSize}
              onChange={(e) =>
                handleSettingChange(
                  "advanced",
                  "cacheSize",
                  parseInt(e.target.value),
                )
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preload Tracks: {settings.advanced.preloadTracks}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.advanced.preloadTracks}
              onChange={(e) =>
                handleSettingChange(
                  "advanced",
                  "preloadTracks",
                  parseInt(e.target.value),
                )
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Experimental Features</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.advanced.analyticsEnabled}
              onChange={(e) =>
                handleSettingChange(
                  "advanced",
                  "analyticsEnabled",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Enable analytics collection</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.advanced.experimentalFeatures}
              onChange={(e) =>
                handleSettingChange(
                  "advanced",
                  "experimentalFeatures",
                  e.target.checked,
                )
              }
              className="rounded"
            />
            <span>Enable experimental features (beta)</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "audio":
        return renderAudioSettings();
      case "network":
        return renderNetworkSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      case "backup":
        return renderBackupSettings();
      case "advanced":
        return renderAdvancedSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Settings</h1>
          {unsavedChanges && (
            <span className="bg-orange-600 text-white text-sm px-2 py-1 rounded">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportSettings}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            title="Export Settings"
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowResetModal(true)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            title="Reset to Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={!unsavedChanges}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Settings Navigation */}
        <div className="w-64 bg-gray-800 rounded-lg p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Settings</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to reset all{" "}
              {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}{" "}
              settings to their default values? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSettings}
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded transition-colors"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

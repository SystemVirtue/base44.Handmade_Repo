import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import {
  emergencySystem,
  EmergencyActions,
  emergencyMonitor,
} from "../../utils/emergency-system.js";
import { useAudioStore, useZoneStore, useUIStore } from "../../store.js";

/**
 * Enhanced Emergency Controls Component
 * Professional-grade emergency stop and safety controls
 */
const EmergencyControls = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);
  const [fadeOutDuration, setFadeOutDuration] = useState(3);
  const [lastEmergencyEvent, setLastEmergencyEvent] = useState(null);
  const [systemStatus, setSystemStatus] = useState("operational");

  // Store access
  const audioStore = useAudioStore;
  const zoneStore = useZoneStore;
  const uiStore = useUIStore;

  // Initialize emergency actions
  const [emergencyActions] = useState(
    () => new EmergencyActions(audioStore, zoneStore, uiStore),
  );

  // Emergency system listener
  useEffect(() => {
    const unsubscribe = emergencySystem.addListener((event) => {
      setIsEmergencyActive(true);
      setEmergencyStatus(event);
      setLastEmergencyEvent(event);

      if (event.type === "IMMEDIATE_STOP") {
        setSystemStatus("emergency_stop");
      } else if (event.type === "FADE_OUT_STOP") {
        setSystemStatus("fading_out");
      }
    });

    return unsubscribe;
  }, []);

  // Recovery completion listener
  useEffect(() => {
    const checkRecovery = () => {
      const status = emergencySystem.getStatus();
      if (!status.isActive && isEmergencyActive) {
        setIsEmergencyActive(false);
        setEmergencyStatus(null);
        setSystemStatus("operational");
      }
    };

    const interval = setInterval(checkRecovery, 1000);
    return () => clearInterval(interval);
  }, [isEmergencyActive]);

  // Handlers
  const handleImmediateStop = async () => {
    if (isConfirmingStop) {
      setIsConfirmingStop(false);
      const success = await emergencyActions.immediateStop();
      if (!success) {
        alert("Emergency stop failed! Manual intervention required.");
      }
    } else {
      setIsConfirmingStop(true);
      // Auto-cancel confirmation after 5 seconds
      setTimeout(() => setIsConfirmingStop(false), 5000);
    }
  };

  const handleFadeOutStop = async () => {
    const duration = fadeOutDuration * 1000; // Convert to milliseconds
    await emergencyActions.fadeOutStop(duration);
  };

  const handleSystemRecovery = async () => {
    await emergencyActions.systemRecovery();
  };

  const handleTestEmergencySystems = async () => {
    await emergencyActions.testEmergencySystems();
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case "emergency_stop":
        return "bg-red-900/30 border-red-600";
      case "fading_out":
        return "bg-orange-900/30 border-orange-600";
      case "operational":
        return "bg-green-900/20 border-green-600";
      default:
        return "bg-gray-900/30 border-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (systemStatus) {
      case "emergency_stop":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "fading_out":
        return <Clock className="w-5 h-5 text-orange-400" />;
      case "operational":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div
      className={`rounded-lg p-6 border-2 transition-all duration-300 ${getStatusColor()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-semibold text-red-400">
            Emergency Controls
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize text-gray-300">
            {systemStatus.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Emergency Status Display */}
      {isEmergencyActive && emergencyStatus && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-600/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-400">
              EMERGENCY ACTIVE: {emergencyStatus.type.replace("_", " ")}
            </span>
          </div>
          <div className="text-sm text-gray-300">
            <p>
              Started:{" "}
              {new Date(emergencyStatus.timestamp).toLocaleTimeString()}
            </p>
            {emergencyStatus.data?.duration && (
              <p>Fade Duration: {emergencyStatus.data.duration / 1000}s</p>
            )}
          </div>
        </div>
      )}

      {/* Primary Emergency Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Immediate Stop */}
        <button
          onClick={handleImmediateStop}
          disabled={isEmergencyActive && systemStatus === "emergency_stop"}
          className={`
            relative py-4 px-6 rounded-lg font-bold text-white text-lg
            transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center
            ${
              isConfirmingStop
                ? "bg-red-800 ring-4 ring-red-400 animate-pulse"
                : "bg-red-600 hover:bg-red-700"
            }
            ${
              isEmergencyActive && systemStatus === "emergency_stop"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
        >
          <Square className="w-6 h-6 mb-2" />
          {isConfirmingStop ? "CLICK TO CONFIRM" : "IMMEDIATE STOP"}
          {isConfirmingStop && (
            <span className="text-xs mt-1 font-normal">
              Click again to execute
            </span>
          )}
        </button>

        {/* Fade Out Stop */}
        <div className="space-y-2">
          <button
            onClick={handleFadeOutStop}
            disabled={isEmergencyActive}
            className={`
              w-full py-4 px-6 rounded-lg font-bold text-white
              transition-colors min-h-[60px] flex items-center justify-center gap-2
              ${
                isEmergencyActive
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            `}
          >
            <VolumeX className="w-5 h-5" />
            FADE OUT STOP
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Duration:</label>
            <select
              value={fadeOutDuration}
              onChange={(e) => setFadeOutDuration(Number(e.target.value))}
              disabled={isEmergencyActive}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            >
              <option value={1}>1s</option>
              <option value={3}>3s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recovery and Test Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSystemRecovery}
          disabled={!isEmergencyActive}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-colors
            ${
              isEmergencyActive
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 cursor-not-allowed opacity-50 text-gray-400"
            }
          `}
        >
          <RotateCcw className="w-4 h-4" />
          System Recovery
        </button>

        <button
          onClick={handleTestEmergencySystems}
          disabled={isEmergencyActive}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-colors
            ${
              !isEmergencyActive
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 cursor-not-allowed opacity-50 text-gray-400"
            }
          `}
        >
          <Shield className="w-4 h-4" />
          Test Systems
        </button>
      </div>

      {/* Last Emergency Event */}
      {lastEmergencyEvent && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <p>Last Emergency: {lastEmergencyEvent.type.replace("_", " ")}</p>
            <p>{new Date(lastEmergencyEvent.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-200">
            <p className="font-medium mb-1">SAFETY NOTICE:</p>
            <p>
              Emergency controls will immediately affect all zones and connected
              devices. Use responsibly and ensure proper safety protocols are
              followed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyControls;

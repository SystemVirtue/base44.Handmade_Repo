import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Save,
  X,
  Music,
  Shuffle,
  Copy,
  Repeat,
  Settings,
  Play,
  Plus,
  Trash2,
} from "lucide-react";

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  schedule = null,
  templates = [],
  zones = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    type: "playlist", // playlist, random, template, auto-dj
    active: true,
    zone: "all",
    tracks: [],
    templateId: null,
    repeatDaily: true,
    repeatWeekly: false,
    repeatDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    volume: 75,
    crossfade: 3,
    settings: {
      shuffle: false,
      repeat: "none",
      autoAdvance: true,
      gapless: true,
      fadeBetweenTracks: true,
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (schedule) {
      // Edit mode - populate form with existing schedule
      setFormData({
        name: schedule.name || "",
        startTime: schedule.startTime || "09:00",
        endTime: schedule.endTime || "17:00",
        type: schedule.type || "playlist",
        active: schedule.active !== undefined ? schedule.active : true,
        zone: schedule.zone || "all",
        tracks: schedule.tracks || [],
        templateId: schedule.templateId || null,
        repeatDaily:
          schedule.repeatDaily !== undefined ? schedule.repeatDaily : true,
        repeatWeekly: schedule.repeatWeekly || false,
        repeatDays: schedule.repeatDays || [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
        ],
        volume: schedule.volume || 75,
        crossfade: schedule.crossfade || 3,
        settings: {
          shuffle: false,
          repeat: "none",
          autoAdvance: true,
          gapless: true,
          fadeBetweenTracks: true,
          ...schedule.settings,
        },
      });
    } else {
      // Reset form for new schedule
      setFormData({
        name: "",
        startTime: "09:00",
        endTime: "17:00",
        type: "playlist",
        active: true,
        zone: "all",
        tracks: [],
        templateId: null,
        repeatDaily: true,
        repeatWeekly: false,
        repeatDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        volume: 75,
        crossfade: 3,
        settings: {
          shuffle: false,
          repeat: "none",
          autoAdvance: true,
          gapless: true,
          fadeBetweenTracks: true,
        },
      });
    }
    setErrors({});
  }, [schedule, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Schedule name is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (start >= end) {
        newErrors.timeRange = "End time must be after start time";
      }
    }

    if (formData.type === "template" && !formData.templateId) {
      newErrors.templateId = "Template selection is required";
    }

    if (formData.type === "playlist" && formData.tracks.length === 0) {
      newErrors.tracks = "At least one track is required for playlist type";
    }

    if (
      !formData.repeatDaily &&
      !formData.repeatWeekly &&
      formData.repeatDays.length === 0
    ) {
      newErrors.repeat = "At least one repeat option must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const scheduleData = {
        ...formData,
        id: schedule?.id || Date.now(),
        updatedAt: new Date().toISOString(),
        createdAt: schedule?.createdAt || new Date().toISOString(),
      };
      onSave(scheduleData);
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear related errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRepeatDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day],
    }));
  };

  const handleSettingsChange = (setting, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [setting]: value },
    }));
  };

  const addTrackToSchedule = () => {
    // This would open a track selector or integrate with search
    console.log("Add track to schedule - would open track selector");
  };

  const removeTrackFromSchedule = (index) => {
    setFormData((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  const weekDays = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {schedule ? "Edit Schedule" : "Create New Schedule"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., Morning Playlist"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="playlist">Custom Playlist</option>
                <option value="template">Use Template</option>
                <option value="random">Random Music</option>
                <option value="auto-dj">Auto DJ</option>
              </select>
            </div>
          </div>

          {/* Time Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
              {errors.startTime && (
                <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
              {errors.endTime && (
                <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zone
              </label>
              <select
                value={formData.zone}
                onChange={(e) => handleInputChange("zone", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.timeRange && (
            <p className="text-red-400 text-sm">{errors.timeRange}</p>
          )}

          {/* Template Selection */}
          {formData.type === "template" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Template *
              </label>
              <select
                value={formData.templateId || ""}
                onChange={(e) =>
                  handleInputChange("templateId", e.target.value || null)
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Choose a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.tracks?.length || 0} tracks)
                  </option>
                ))}
              </select>
              {errors.templateId && (
                <p className="text-red-400 text-sm mt-1">{errors.templateId}</p>
              )}
            </div>
          )}

          {/* Playlist Tracks */}
          {formData.type === "playlist" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Playlist Tracks{" "}
                  {formData.tracks.length > 0 && `(${formData.tracks.length})`}
                </label>
                <button
                  type="button"
                  onClick={addTrackToSchedule}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Tracks
                </button>
              </div>

              <div className="bg-gray-700 rounded-lg p-4 max-h-40 overflow-y-auto">
                {formData.tracks.length > 0 ? (
                  <div className="space-y-2">
                    {formData.tracks.map((track, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-600 rounded p-2"
                      >
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {track.title}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {track.artist}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTrackFromSchedule(index)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tracks added yet</p>
                  </div>
                )}
              </div>
              {errors.tracks && (
                <p className="text-red-400 text-sm mt-1">{errors.tracks}</p>
              )}
            </div>
          )}

          {/* Repeat Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Repeat Schedule
            </label>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.repeatDaily}
                    onChange={(e) =>
                      handleInputChange("repeatDaily", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-gray-300">Daily</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.repeatWeekly}
                    onChange={(e) =>
                      handleInputChange("repeatWeekly", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-gray-300">Weekly</span>
                </label>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Specific Days:</p>
                <div className="flex gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => handleRepeatDayToggle(day.key)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        formData.repeatDays.includes(day.key)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {errors.repeat && (
              <p className="text-red-400 text-sm mt-1">{errors.repeat}</p>
            )}
          </div>

          {/* Audio Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volume ({formData.volume}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.volume}
                onChange={(e) =>
                  handleInputChange("volume", parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Crossfade ({formData.crossfade}s)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.crossfade}
                onChange={(e) =>
                  handleInputChange("crossfade", parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Playback Settings
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.settings.shuffle}
                  onChange={(e) =>
                    handleSettingsChange("shuffle", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-gray-300 text-sm">Shuffle</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.settings.autoAdvance}
                  onChange={(e) =>
                    handleSettingsChange("autoAdvance", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-gray-300 text-sm">Auto Advance</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.settings.gapless}
                  onChange={(e) =>
                    handleSettingsChange("gapless", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-gray-300 text-sm">Gapless</span>
              </label>
            </div>

            <div className="mt-3">
              <label className="block text-sm text-gray-400 mb-2">
                Repeat Mode
              </label>
              <select
                value={formData.settings.repeat}
                onChange={(e) => handleSettingsChange("repeat", e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="none">No Repeat</option>
                <option value="one">Repeat One</option>
                <option value="all">Repeat All</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange("active", e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-300">Enable this schedule</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {schedule ? "Update Schedule" : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

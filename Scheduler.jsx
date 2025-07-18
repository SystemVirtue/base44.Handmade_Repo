import React, { useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Settings,
  Zap,
  Copy,
  Clipboard,
  Undo,
  Save,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useSchedulerStore, useZoneStore } from "./store.js";

export default function Scheduler() {
  const {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    setSelectedSchedule,
    saveToHistory,
    loadFromHistory,
  } = useSchedulerStore();

  const { zones } = useZoneStore();

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    onlineTime: "10:00", // Default 10:00 AM
    offlineTime: "03:00", // Default 3:00 AM (next day)
  });

  // Calendar state
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [selectedHour, setSelectedHour] = useState(null);

  // Schedule entry state
  const [currentEntry, setCurrentEntry] = useState({
    id: "",
    title: "",
    playlist: "",
    startTime: "",
    endTime: "",
    selectedDays: [],
    day: "monday",
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [copiedEntry, setCopiedEntry] = useState(null);
  const [scheduleHistory, setScheduleHistory] = useState([]);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [pendingOverwrite, setPendingOverwrite] = useState(null);

  const days = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ];

  // Generate time slots based on system settings
  const generateTimeSlots = useCallback(() => {
    const slots = [];
    const onlineHour = parseInt(systemSettings.onlineTime.split(":")[0]);
    const offlineHour = parseInt(systemSettings.offlineTime.split(":")[0]);

    // Handle overnight operations (e.g., 10:00 AM to 3:00 AM)
    if (offlineHour < onlineHour) {
      // From online time to midnight
      for (let i = onlineHour; i < 24; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
      }
      // From midnight to offline time
      for (let i = 0; i <= offlineHour; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
      }
    } else {
      // Standard same-day operation
      for (let i = onlineHour; i <= offlineHour; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
      }
    }

    return slots;
  }, [systemSettings]);

  const generateEndTimeSlots = useCallback(
    (startTime) => {
      const allSlots = generateTimeSlots();
      const startIndex = allSlots.indexOf(startTime);
      if (startIndex === -1) return [];

      // Return slots after the start time (minimum 1 hour duration)
      return allSlots.slice(startIndex + 1);
    },
    [generateTimeSlots],
  );

  const timeSlots = generateTimeSlots();

  // Get available playlists (mock data for now)
  const playlists = [
    "Morning Mix",
    "Lunch Vibes",
    "Afternoon Energy",
    "Evening Chill",
    "Background Instrumental",
    "Upbeat Pop",
    "Classic Rock",
    "Jazz Lounge",
  ];

  // Handle slot click
  const handleSlotClick = useCallback(
    (day, hour) => {
      // Check if there's already a schedule at this time
      const existingSchedule = schedules.find(
        (s) => s.day === day && s.startTime === hour,
      );

      setSelectedDay(day);
      setSelectedHour(hour);
      setSelectedSlot({ day, hour });

      if (existingSchedule) {
        // Load existing schedule for editing
        // Find all related schedules with same title and time
        const relatedSchedules = schedules.filter(
          (s) =>
            s.title === existingSchedule.title &&
            s.startTime === existingSchedule.startTime &&
            s.endTime === existingSchedule.endTime &&
            s.playlist === existingSchedule.playlist,
        );

        const selectedDays = relatedSchedules.map((s) => s.day);

        setCurrentEntry({
          id: existingSchedule.id,
          title: existingSchedule.title || existingSchedule.name,
          playlist: existingSchedule.playlist || "",
          startTime: existingSchedule.startTime,
          endTime: existingSchedule.endTime,
          selectedDays: selectedDays,
          day: existingSchedule.day,
        });
      } else {
        // Create new entry - auto-tick the selected day
        setCurrentEntry({
          id: `schedule_${Date.now()}`,
          title: "",
          playlist: "",
          startTime: hour,
          endTime: "",
          selectedDays: [day],
          day: day,
        });
      }
    },
    [schedules],
  );

  // Handle day toggle for checkboxes
  const handleDayToggle = useCallback((day, isChecked) => {
    setCurrentEntry((prev) => {
      const newSelectedDays = isChecked
        ? [...prev.selectedDays, day]
        : prev.selectedDays.filter((d) => d !== day);

      return {
        ...prev,
        selectedDays: newSelectedDays,
      };
    });
  }, []);

  // Save current entry
  const saveEntry = useCallback(() => {
    if (
      !currentEntry.title ||
      !currentEntry.playlist ||
      !currentEntry.endTime ||
      currentEntry.selectedDays.length === 0
    ) {
      alert("Please fill in all required fields and select at least one day");
      return;
    }

    // Check for conflicts
    const conflictingSchedule = schedules.find(
      (s) =>
        s.id !== currentEntry.id &&
        s.day === currentEntry.day &&
        ((s.startTime <= currentEntry.startTime &&
          s.endTime > currentEntry.startTime) ||
          (s.startTime < currentEntry.endTime &&
            s.endTime >= currentEntry.endTime) ||
          (s.startTime >= currentEntry.startTime &&
            s.endTime <= currentEntry.endTime)),
    );

    if (conflictingSchedule) {
      setPendingOverwrite(currentEntry);
      setShowOverwriteDialog(true);
      return;
    }

    // Save to history for undo
    setScheduleHistory((prev) => [
      JSON.parse(JSON.stringify(schedules)),
      ...prev.slice(0, 9),
    ]);

    // Remove existing related schedules first (schedules with same title/time)
    const existingRelatedSchedules = schedules.filter(
      (s) =>
        s.title === currentEntry.title &&
        s.startTime === currentEntry.startTime &&
        s.endTime === currentEntry.endTime &&
        s.playlist === currentEntry.playlist,
    );

    existingRelatedSchedules.forEach((s) => deleteSchedule(s.id));

    // Create new schedules for all selected days
    currentEntry.selectedDays.forEach((day, index) => {
      const scheduleData = {
        ...currentEntry,
        id: index === 0 ? currentEntry.id : `${currentEntry.id}_${day}`,
        day: day,
        name: currentEntry.title,
        type: "playlist",
        active: true,
        tracks: [],
        createdAt: new Date().toISOString(),
      };

      addSchedule(scheduleData);
    });

    // Clear selection
    setSelectedSlot(null);
    setCurrentEntry({
      id: "",
      title: "",
      playlist: "",
      startTime: "",
      endTime: "",
      selectedDays: [],
      day: "monday",
    });
  }, [currentEntry, schedules, addSchedule, updateSchedule]);

  // Handle overwrite confirmation
  const handleOverwriteConfirm = useCallback(() => {
    if (pendingOverwrite) {
      // Save to history
      setScheduleHistory((prev) => [
        JSON.parse(JSON.stringify(schedules)),
        ...prev.slice(0, 9),
      ]);

      // Remove conflicting schedules
      const conflictingSchedules = schedules.filter(
        (s) =>
          s.day === pendingOverwrite.day &&
          ((s.startTime <= pendingOverwrite.startTime &&
            s.endTime > pendingOverwrite.startTime) ||
            (s.startTime < pendingOverwrite.endTime &&
              s.endTime >= pendingOverwrite.endTime) ||
            (s.startTime >= pendingOverwrite.startTime &&
              s.endTime <= pendingOverwrite.endTime)),
      );

      conflictingSchedules.forEach((s) => deleteSchedule(s.id));

      // Add new schedule
      const scheduleData = {
        ...pendingOverwrite,
        name: pendingOverwrite.title,
        type: "playlist",
        active: true,
        tracks: [],
        createdAt: new Date().toISOString(),
      };

      addSchedule(scheduleData);
    }

    setShowOverwriteDialog(false);
    setPendingOverwrite(null);
    setSelectedSlot(null);
    setCurrentEntry({
      id: "",
      title: "",
      playlist: "",
      startTime: "",
      endTime: "",
      selectedDays: [],
      day: "monday",
    });
  }, [pendingOverwrite, schedules, deleteSchedule, addSchedule]);

  // Copy entry
  const copyEntry = useCallback(() => {
    setCopiedEntry(JSON.parse(JSON.stringify(currentEntry)));
  }, [currentEntry]);

  // Paste entry
  const pasteEntry = useCallback(() => {
    if (copiedEntry && selectedSlot) {
      const newEntry = {
        ...copiedEntry,
        id: `schedule_${Date.now()}`,
        day: selectedSlot.day,
        startTime: selectedSlot.hour,
      };
      setCurrentEntry(newEntry);
    }
  }, [copiedEntry, selectedSlot]);

  // Undo last action
  const undoLastAction = useCallback(() => {
    if (scheduleHistory.length > 0) {
      const previousState = scheduleHistory[0];
      // This would require a way to restore the full schedule state
      // For now, we'll just remove the history item
      setScheduleHistory((prev) => prev.slice(1));
      console.log("Undo functionality would restore previous state here");
    }
  }, [scheduleHistory]);

  // Delete current entry
  const deleteEntry = useCallback(() => {
    if (currentEntry.id && schedules.find((s) => s.id === currentEntry.id)) {
      setScheduleHistory((prev) => [
        JSON.parse(JSON.stringify(schedules)),
        ...prev.slice(0, 9),
      ]);

      // Remove all related schedules (same title/time across different days)
      const relatedSchedules = schedules.filter(
        (s) =>
          s.title === currentEntry.title &&
          s.startTime === currentEntry.startTime &&
          s.endTime === currentEntry.endTime &&
          s.playlist === currentEntry.playlist,
      );

      relatedSchedules.forEach((s) => removeSchedule(s.id));
      setSelectedSlot(null);
      setCurrentEntry({
        id: "",
        title: "",
        playlist: "",
        startTime: "",
        endTime: "",
        selectedDays: [],
        day: "monday",
      });
    }
  }, [currentEntry, schedules, removeSchedule]);

  // Get schedule for a specific day and hour (only return if it's the starting slot)
  const getScheduleForSlot = useCallback(
    (day, hour) => {
      return schedules.find((s) => s.day === day && s.startTime === hour);
    },
    [schedules],
  );

  // Check if a slot is part of a schedule (for styling purposes)
  const isSlotInSchedule = useCallback(
    (day, hour) => {
      return schedules.find(
        (s) => s.day === day && s.startTime <= hour && s.endTime > hour,
      );
    },
    [schedules],
  );

  // Calculate the span duration for a schedule entry
  const getScheduleSpan = useCallback((schedule) => {
    if (!schedule) return 1;
    const startHour = parseInt(schedule.startTime.split(":")[0]);
    const endHour = parseInt(schedule.endTime.split(":")[0]);
    return Math.max(1, endHour - startHour);
  }, []);

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Scheduler</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            System Settings
          </button>
          <button
            onClick={undoLastAction}
            disabled={scheduleHistory.length === 0}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 px-4 py-2 rounded flex items-center gap-2"
          >
            <Undo className="w-4 h-4" />
            Undo
          </button>
        </div>
      </div>

      {/* System Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Operating Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                System Online Time (Schedule Start)
              </label>
              <select
                value={systemSettings.onlineTime}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    onlineTime: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const time = `${i.toString().padStart(2, "0")}:00`;
                  return (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                System Offline Time (Schedule End)
              </label>
              <select
                value={systemSettings.offlineTime}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    offlineTime: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const time = `${i.toString().padStart(2, "0")}:00`;
                  return (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <strong>Note:</strong> If offline time is earlier than online time
            (e.g., 10:00 AM to 3:00 AM), the schedule will span across midnight
            for venues with overnight operations.
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>
        <div className="grid grid-cols-8 gap-1 mb-4">
          <div className="p-2 text-center font-semibold">Time</div>
          {days.map((day) => (
            <div
              key={day.key}
              className="p-2 text-center font-semibold text-blue-400"
            >
              {day.label}
            </div>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
              <div className="p-2 text-sm text-gray-400 text-center">
                {formatTime(hour)}
              </div>
              {days.map((day) => {
                const schedule = getScheduleForSlot(day.key, hour);
                const inSchedule = isSlotInSchedule(day.key, hour);
                const isSelected =
                  selectedSlot?.day === day.key && selectedSlot?.hour === hour;
                const span = schedule ? getScheduleSpan(schedule) : 1;

                // Skip rendering this slot if it's part of a multi-hour entry but not the starting slot
                if (inSchedule && !schedule) {
                  return null;
                }

                return (
                  <div
                    key={`${day.key}-${hour}`}
                    onClick={() => handleSlotClick(day.key, hour)}
                    className={`p-1 min-h-12 border border-gray-700 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-yellow-600/70 border-yellow-400"
                        : schedule
                          ? "bg-blue-600/50 hover:bg-blue-600/70 border-blue-400"
                          : inSchedule
                            ? "bg-blue-600/30 hover:bg-blue-600/50 border-blue-500 border-dashed"
                            : "hover:bg-gray-700"
                    }`}
                    style={{
                      gridRowEnd: span > 1 ? `span ${span}` : undefined,
                      minHeight: span > 1 ? `${span * 3.5}rem` : "3rem",
                    }}
                  >
                    {schedule && (
                      <div
                        className="text-xs font-medium truncate"
                        title={schedule.name || schedule.title}
                      >
                        {schedule.name || schedule.title}
                        {span > 1 && (
                          <div className="text-xs text-gray-300 mt-1">
                            {formatTime(schedule.startTime)} -{" "}
                            {formatTime(schedule.endTime)}
                          </div>
                        )}
                      </div>
                    )}
                    {inSchedule && !schedule && (
                      <div className="text-xs text-gray-400 text-center">⋮</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Entry Properties */}
      {selectedSlot && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Schedule Entry Properties</h2>
            <div className="flex gap-2">
              <button
                onClick={copyEntry}
                disabled={!currentEntry.title}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              {copiedEntry && (
                <button
                  onClick={pasteEntry}
                  className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded flex items-center gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  Paste
                </button>
              )}
              <button
                onClick={deleteEntry}
                disabled={!schedules.find((s) => s.id === currentEntry.id)}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 rounded flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule ID (Title) *
              </label>
              <input
                type="text"
                value={currentEntry.title}
                onChange={(e) =>
                  setCurrentEntry((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="Enter schedule title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selected Playlist *
              </label>
              <select
                value={currentEntry.playlist}
                onChange={(e) =>
                  setCurrentEntry((prev) => ({
                    ...prev,
                    playlist: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Choose playlist...</option>
                {playlists.map((playlist) => (
                  <option key={playlist} value={playlist}>
                    {playlist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time *
              </label>
              <select
                value={currentEntry.startTime}
                onChange={(e) =>
                  setCurrentEntry((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                    endTime: "", // Reset end time when start time changes
                  }))
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time *
              </label>
              <select
                value={currentEntry.endTime}
                onChange={(e) =>
                  setCurrentEntry((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                disabled={!currentEntry.startTime}
              >
                <option value="">Choose end time...</option>
                {generateEndTimeSlots(currentEntry.startTime).map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Repeat on Days
              </label>
              <div className="flex gap-2 flex-wrap">
                {days.map((day) => (
                  <label
                    key={day.key}
                    className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={currentEntry.selectedDays.includes(day.key)}
                      onChange={(e) =>
                        handleDayToggle(day.key, e.target.checked)
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setSelectedSlot(null)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
            >
              Cancel
            </button>
            <button
              onClick={saveEntry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Schedule
            </button>
          </div>
        </div>
      )}

      {/* Overwrite Confirmation Dialog */}
      {showOverwriteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold">
                Overwrite Existing Schedule?
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              This will overwrite existing schedule entries in the selected time
              range. Continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowOverwriteDialog(false);
                  setPendingOverwrite(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
              >
                No, Cancel
              </button>
              <button
                onClick={handleOverwriteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
              >
                Yes, Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {schedules.length}
          </div>
          <div className="text-gray-400 text-sm">Total Schedules</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {timeSlots.length}
          </div>
          <div className="text-gray-400 text-sm">Operating Hours</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {schedules.filter((s) => s.active).length}
          </div>
          <div className="text-gray-400 text-sm">Active Schedules</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">
            {scheduleHistory.length}
          </div>
          <div className="text-gray-400 text-sm">Undo Available</div>
        </div>
      </div>
    </div>
  );
}

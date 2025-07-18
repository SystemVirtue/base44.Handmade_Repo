import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Music,
  Plus,
  Trash2,
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Copy,
  Upload,
  Download,
} from "lucide-react";

export default function TemplateModal({
  isOpen,
  onClose,
  onSave,
  template = null,
  availableTracks = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tracks: [],
    tags: [],
    isPublic: false,
    category: "general",
  });

  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [showTrackSelector, setShowTrackSelector] = useState(false);

  useEffect(() => {
    if (template) {
      // Edit mode - populate form with existing template
      setFormData({
        name: template.name || "",
        description: template.description || "",
        tracks: template.tracks || [],
        tags: template.tags || [],
        isPublic: template.isPublic || false,
        category: template.category || "general",
      });
    } else {
      // Reset form for new template
      setFormData({
        name: "",
        description: "",
        tracks: [],
        tags: [],
        isPublic: false,
        category: "general",
      });
    }
    setErrors({});
    setSearchQuery("");
    setSelectedTracks(new Set());
  }, [template, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (formData.tracks.length === 0) {
      newErrors.tracks = "At least one track is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const templateData = {
        ...formData,
        id: template?.id || Date.now(),
        duration: formData.tracks.reduce(
          (sum, track) => sum + (track.duration || 180),
          0,
        ),
        trackCount: formData.tracks.length,
        updatedAt: new Date().toISOString(),
        createdAt: template?.createdAt || new Date().toISOString(),
      };
      onSave(templateData);
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

  const handleTagAdd = (tag) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addTracksToTemplate = () => {
    const tracksToAdd = availableTracks.filter((track) =>
      selectedTracks.has(track.id),
    );
    setFormData((prev) => ({
      ...prev,
      tracks: [...prev.tracks, ...tracksToAdd],
    }));
    setSelectedTracks(new Set());
    setShowTrackSelector(false);
  };

  const removeTrackFromTemplate = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((_, index) => index !== indexToRemove),
    }));
  };

  const moveTrack = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setFormData((prev) => {
      const newTracks = [...prev.tracks];
      const [movedTrack] = newTracks.splice(fromIndex, 1);
      newTracks.splice(toIndex, 0, movedTrack);
      return { ...prev, tracks: newTracks };
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredAvailableTracks = availableTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const templateStats = {
    totalDuration: formData.tracks.reduce(
      (sum, track) => sum + (track.duration || 180),
      0,
    ),
    trackCount: formData.tracks.length,
    averageDuration:
      formData.tracks.length > 0
        ? formData.tracks.reduce(
            (sum, track) => sum + (track.duration || 180),
            0,
          ) / formData.tracks.length
        : 0,
  };

  if (!isOpen) return null;

  const categories = [
    { value: "general", label: "General" },
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
    { value: "weekend", label: "Weekend" },
    { value: "party", label: "Party" },
    { value: "chill", label: "Chill" },
    { value: "workout", label: "Workout" },
    { value: "background", label: "Background" },
    { value: "special", label: "Special Events" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {template ? "Edit Template" : "Create New Template"}
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
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., Chill Afternoon Mix"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              rows="3"
              placeholder="Describe this template and when it should be used..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="text-blue-200 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTagAdd(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {/* Template Stats */}
          <div className="grid grid-cols-3 gap-4 bg-gray-700 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {templateStats.trackCount}
              </div>
              <div className="text-gray-400 text-sm">Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatDuration(templateStats.totalDuration)}
              </div>
              <div className="text-gray-400 text-sm">Total Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatDuration(Math.round(templateStats.averageDuration))}
              </div>
              <div className="text-gray-400 text-sm">Avg Track Length</div>
            </div>
          </div>

          {/* Track List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Template Tracks
              </label>
              <button
                type="button"
                onClick={() => setShowTrackSelector(!showTrackSelector)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Tracks
              </button>
            </div>

            {/* Track Selector */}
            {showTrackSelector && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tracks..."
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg pl-10 pr-3 py-2 text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTracksToTemplate}
                    disabled={selectedTracks.size === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Selected ({selectedTracks.size})
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredAvailableTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTracks.has(track.id)
                          ? "bg-blue-600"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                      onClick={() => {
                        const newSelected = new Set(selectedTracks);
                        if (newSelected.has(track.id)) {
                          newSelected.delete(track.id);
                        } else {
                          newSelected.add(track.id);
                        }
                        setSelectedTracks(newSelected);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTracks.has(track.id)}
                        onChange={() => {}} // Handled by parent div onClick
                        className="rounded"
                      />
                      <div className="w-10 h-10 rounded bg-gray-500 flex items-center justify-center">
                        {track.artwork ? (
                          <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {track.title}
                        </p>
                        <p className="text-gray-300 text-xs truncate">
                          {track.artist}
                        </p>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {formatDuration(track.duration || 180)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Template Tracks */}
            <div className="bg-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto">
              {formData.tracks.length > 0 ? (
                <div className="space-y-2">
                  {formData.tracks.map((track, index) => (
                    <div
                      key={`${track.id}-${index}`}
                      className="flex items-center gap-3 bg-gray-600 rounded-lg p-3"
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", index.toString())
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(
                          e.dataTransfer.getData("text/plain"),
                        );
                        moveTrack(fromIndex, index);
                      }}
                    >
                      <div className="text-gray-400 text-sm w-8 text-center">
                        {index + 1}
                      </div>

                      <div className="w-10 h-10 rounded bg-gray-500 flex items-center justify-center">
                        {track.artwork ? (
                          <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {track.title}
                        </p>
                        <p className="text-gray-300 text-xs truncate">
                          {track.artist}
                        </p>
                      </div>

                      <span className="text-gray-400 text-xs">
                        {formatDuration(track.duration || 180)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeTrackFromTemplate(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No tracks added yet</p>
                  <p className="text-sm">
                    Use the "Add Tracks" button to add music to this template
                  </p>
                </div>
              )}
            </div>
            {errors.tracks && (
              <p className="text-red-400 text-sm mt-1">{errors.tracks}</p>
            )}
          </div>

          {/* Settings */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  handleInputChange("isPublic", e.target.checked)
                }
                className="rounded"
              />
              <span className="text-gray-300">
                Make this template public (other users can use it)
              </span>
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
              {template ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

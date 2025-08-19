import React, { useState, useRef } from "react";
import {
  Upload,
  Image,
  Video,
  Music,
  FileText,
  Trash2,
  Edit,
  Play,
  Pause,
  Download,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Monitor,
  Settings,
  Plus,
  Eye,
  FolderOpen,
  Tag,
  MoreHorizontal,
  Star,
  Share,
  Copy,
} from "lucide-react";

export default function DigitalSignage() {
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentCategory, setCurrentCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const fileInputRef = useRef(null);

  // Mock media library data
  const [mediaItems, setMediaItems] = useState([
    {
      id: 1,
      name: "Summer Promotion Banner",
      type: "image",
      category: "promotional",
      size: "2.3 MB",
      dimensions: "1920x1080",
      duration: null,
      uploadDate: "2024-01-15",
      tags: ["summer", "promotion", "banner"],
      thumbnail:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
      scheduled: false,
      favorite: true,
      views: 145,
      lastUsed: "2024-01-20",
    },
    {
      id: 2,
      name: "Restaurant Menu Video",
      type: "video",
      category: "menu",
      size: "15.7 MB",
      dimensions: "1920x1080",
      duration: "00:02:30",
      uploadDate: "2024-01-10",
      tags: ["menu", "food", "video"],
      thumbnail:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
      url: "#",
      scheduled: true,
      favorite: false,
      views: 89,
      lastUsed: "2024-01-18",
    },
    {
      id: 3,
      name: "Daily Specials Board",
      type: "image",
      category: "menu",
      size: "1.8 MB",
      dimensions: "1080x1920",
      duration: null,
      uploadDate: "2024-01-12",
      tags: ["specials", "daily", "menu"],
      thumbnail:
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=200&fit=crop",
      url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1080&h=1920&fit=crop",
      scheduled: true,
      favorite: true,
      views: 203,
      lastUsed: "2024-01-19",
    },
    {
      id: 4,
      name: "Welcome Message",
      type: "text",
      category: "informational",
      size: "45 KB",
      dimensions: "1920x1080",
      duration: null,
      uploadDate: "2024-01-08",
      tags: ["welcome", "greeting", "text"],
      thumbnail:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&h=200&fit=crop",
      url: "#",
      scheduled: false,
      favorite: false,
      views: 67,
      lastUsed: "2024-01-16",
    },
    {
      id: 5,
      name: "Happy Hour Slideshow",
      type: "video",
      category: "promotional",
      size: "28.4 MB",
      dimensions: "1920x1080",
      duration: "00:01:45",
      uploadDate: "2024-01-14",
      tags: ["happy hour", "drinks", "promotion"],
      thumbnail:
        "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300&h=200&fit=crop",
      url: "#",
      scheduled: true,
      favorite: true,
      views: 178,
      lastUsed: "2024-01-21",
    },
    {
      id: 6,
      name: "Live Music Tonight",
      type: "image",
      category: "events",
      size: "3.1 MB",
      dimensions: "1920x1080",
      duration: null,
      uploadDate: "2024-01-16",
      tags: ["music", "live", "event"],
      thumbnail:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop",
      scheduled: false,
      favorite: false,
      views: 92,
      lastUsed: "2024-01-17",
    },
  ]);

  const categories = [
    { id: "all", label: "All Media", count: mediaItems.length },
    {
      id: "promotional",
      label: "Promotional",
      count: mediaItems.filter((item) => item.category === "promotional")
        .length,
    },
    {
      id: "menu",
      label: "Menu",
      count: mediaItems.filter((item) => item.category === "menu").length,
    },
    {
      id: "events",
      label: "Events",
      count: mediaItems.filter((item) => item.category === "events").length,
    },
    {
      id: "informational",
      label: "Informational",
      count: mediaItems.filter((item) => item.category === "informational")
        .length,
    },
  ];

  // Filter and sort media items
  const filteredItems = mediaItems
    .filter((item) => {
      if (currentCategory !== "all" && item.category !== currentCategory)
        return false;
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case "size":
          return parseFloat(b.size) - parseFloat(a.size);
        case "views":
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const handleFileUpload = (files) => {
    const newItems = Array.from(files).map((file, index) => {
      const type = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "other";

      return {
        id: mediaItems.length + index + 1,
        name: file.name,
        type,
        category: "uncategorized",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        dimensions: "Unknown",
        duration: type === "video" ? "Unknown" : null,
        uploadDate: new Date().toISOString().split("T")[0],
        tags: [],
        thumbnail: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        scheduled: false,
        favorite: false,
        views: 0,
        lastUsed: null,
      };
    });

    setMediaItems([...mediaItems, ...newItems]);
    setShowUploadModal(false);
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedItems.size} selected item(s)?`)) {
      setMediaItems(mediaItems.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
    }
  };

  const handleToggleFavorite = (itemId) => {
    setMediaItems(
      mediaItems.map((item) =>
        item.id === itemId ? { ...item, favorite: !item.favorite } : item,
      ),
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "image":
        return "text-blue-400";
      case "video":
        return "text-red-400";
      case "audio":
        return "text-green-400";
      case "text":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Digital Signage</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Content
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Media
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search media..."
                className="bg-gray-700 border border-gray-600 rounded pl-9 pr-4 py-2 text-sm w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({cat.count})
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="date">Date Added</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Selected Actions */}
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-400">
                  {selectedItems.size} selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  title="Schedule Selected"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-gray-700 rounded">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-lg font-bold text-blue-400">
              {mediaItems.length}
            </div>
            <div className="text-xs text-gray-400">Total Items</div>
          </div>
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {mediaItems.filter((item) => item.scheduled).length}
            </div>
            <div className="text-xs text-gray-400">Scheduled</div>
          </div>
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-lg font-bold text-purple-400">
              {mediaItems.filter((item) => item.favorite).length}
            </div>
            <div className="text-xs text-gray-400">Favorites</div>
          </div>
          <div className="bg-gray-700 rounded p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {Math.round(
                mediaItems.reduce(
                  (sum, item) => sum + parseFloat(item.size),
                  0,
                ),
              )}{" "}
              MB
            </div>
            <div className="text-xs text-gray-400">Total Size</div>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="flex-1 overflow-auto">
        {filteredItems.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {searchQuery || currentCategory !== "all"
                ? "No media matches your filters"
                : "No signage content available"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || currentCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Upload images, videos, or other media to get started"}
            </p>
            {!searchQuery && currentCategory === "all" && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                Upload Your First Media
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedItems.has(item.id)
                    ? "ring-2 ring-blue-500"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => handleSelectItem(item.id)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-700">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />

                  {/* Overlay Icons */}
                  <div className="absolute top-2 left-2">
                    <div
                      className={`p-1 rounded bg-black bg-opacity-50 ${getTypeColor(item.type)}`}
                    >
                      {getTypeIcon(item.type)}
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.scheduled && (
                      <div className="p-1 rounded bg-purple-600 bg-opacity-80">
                        <Calendar className="w-3 h-3" />
                      </div>
                    )}
                    {item.favorite && (
                      <div className="p-1 rounded bg-yellow-600 bg-opacity-80">
                        <Star className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {item.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 rounded text-xs">
                      {item.duration}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreview(item);
                        }}
                        className="p-2 bg-blue-600 rounded-full hover:bg-blue-700"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item.id);
                        }}
                        className={`p-2 rounded-full hover:bg-yellow-700 ${
                          item.favorite ? "bg-yellow-600" : "bg-gray-600"
                        }`}
                        title="Toggle Favorite"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate mb-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{item.size}</span>
                    <span>{item.views} views</span>
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-sm font-medium text-gray-300">
              <div className="col-span-1">Type</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-1">Views</div>
              <div className="col-span-2">Date Added</div>
              <div className="col-span-1">Actions</div>
            </div>

            <div className="divide-y divide-gray-700">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors ${
                    selectedItems.has(item.id)
                      ? "bg-blue-600/20"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => handleSelectItem(item.id)}
                >
                  <div className="col-span-1">
                    <div
                      className={`flex items-center gap-2 ${getTypeColor(item.type)}`}
                    >
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-10 h-8 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {item.favorite && (
                            <Star className="w-3 h-3 text-yellow-400" />
                          )}
                          {item.scheduled && (
                            <Calendar className="w-3 h-3 text-purple-400" />
                          )}
                          {item.duration && <span>{item.duration}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="capitalize text-gray-400">
                      {item.category}
                    </span>
                  </div>
                  <div className="col-span-1 text-gray-400">{item.size}</div>
                  <div className="col-span-1 text-gray-400">{item.views}</div>
                  <div className="col-span-2 text-gray-400">
                    {item.uploadDate}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreview(item);
                        }}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item.id);
                        }}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                        title="Toggle Favorite"
                      >
                        <Star
                          className={`w-4 h-4 ${item.favorite ? "text-yellow-400" : ""}`}
                        />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Upload Media</h3>

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports: Images (JPG, PNG, GIF), Videos (MP4, MOV, AVI),
                Documents (PDF, TXT)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                Select Files
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{showPreview.name}</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              {showPreview.type === "image" ? (
                <img
                  src={showPreview.url}
                  alt={showPreview.name}
                  className="max-w-full max-h-96 object-contain rounded"
                />
              ) : showPreview.type === "video" ? (
                <video controls className="max-w-full max-h-96 rounded">
                  <source src={showPreview.url} />
                </video>
              ) : (
                <div className="bg-gray-700 rounded p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">
                  Type: <span className="text-white">{showPreview.type}</span>
                </p>
                <p className="text-gray-400">
                  Size: <span className="text-white">{showPreview.size}</span>
                </p>
                <p className="text-gray-400">
                  Dimensions:{" "}
                  <span className="text-white">{showPreview.dimensions}</span>
                </p>
                {showPreview.duration && (
                  <p className="text-gray-400">
                    Duration:{" "}
                    <span className="text-white">{showPreview.duration}</span>
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-400">
                  Category:{" "}
                  <span className="text-white capitalize">
                    {showPreview.category}
                  </span>
                </p>
                <p className="text-gray-400">
                  Views: <span className="text-white">{showPreview.views}</span>
                </p>
                <p className="text-gray-400">
                  Uploaded:{" "}
                  <span className="text-white">{showPreview.uploadDate}</span>
                </p>
                {showPreview.lastUsed && (
                  <p className="text-gray-400">
                    Last Used:{" "}
                    <span className="text-white">{showPreview.lastUsed}</span>
                  </p>
                )}
              </div>
            </div>

            {showPreview.tags.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {showPreview.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors">
                Edit
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">
                Schedule
              </button>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
                Download
              </button>
              <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Schedule Content</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Display Schedule
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                  <option>All Day</option>
                  <option>Business Hours (9 AM - 6 PM)</option>
                  <option>Lunch Hours (11 AM - 2 PM)</option>
                  <option>Evening Hours (6 PM - 10 PM)</option>
                  <option>Custom Time Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Display Duration
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                  <option>10 seconds</option>
                  <option>30 seconds</option>
                  <option>1 minute</option>
                  <option>5 minutes</option>
                  <option>Until manually changed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

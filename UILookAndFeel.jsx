import React, { useState, useEffect } from "react";
import {
  Palette,
  Save,
  RotateCcw,
  Eye,
  Download,
  Upload,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Sparkles,
  Image,
  Layout,
  Type,
  Sliders,
  Zap,
} from "lucide-react";
import { useUIStore } from "./store.js";

export default function UILookAndFeel() {
  const { theme, setTheme } = useUIStore();
  const [previewMode, setPreviewMode] = useState("desktop");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Local theme state for real-time preview
  const [localTheme, setLocalTheme] = useState({
    colorPalette: "dark",
    accentColor: "#3b82f6", // blue-500
    backgroundTheme: "dark",
    compactMode: false,
    showSidebar: true,
    bannerMediaId: "default",
    customBackground: null,
    borderRadius: "medium",
    animations: true,
    glassEffect: false,
    customFont: "Inter",
    fontSize: "medium",
    sidebarWidth: "normal",
    headerHeight: "normal",
    cardStyle: "default",
    iconStyle: "outline",
    buttonStyle: "rounded",
    ...theme,
  });

  const colorPalettes = [
    {
      id: "dark",
      name: "Dark Professional",
      description: "Clean dark theme with blue accents",
      preview: {
        primary: "#1f2937",
        secondary: "#374151",
        accent: "#3b82f6",
        text: "#ffffff",
      },
    },
    {
      id: "light",
      name: "Light Modern",
      description: "Clean light theme with subtle shadows",
      preview: {
        primary: "#ffffff",
        secondary: "#f3f4f6",
        accent: "#3b82f6",
        text: "#1f2937",
      },
    },
    {
      id: "celtic",
      name: "Celtic Green",
      description: "Rich green theme with gold accents",
      preview: {
        primary: "#1a2e1a",
        secondary: "#2d5a2d",
        accent: "#10b981",
        text: "#ffffff",
      },
    },
    {
      id: "sunset",
      name: "Sunset Orange",
      description: "Warm orange and red gradient theme",
      preview: {
        primary: "#292929",
        secondary: "#404040",
        accent: "#f97316",
        text: "#ffffff",
      },
    },
    {
      id: "ocean",
      name: "Ocean Blue",
      description: "Deep blue theme with cyan highlights",
      preview: {
        primary: "#0f172a",
        secondary: "#1e293b",
        accent: "#06b6d4",
        text: "#ffffff",
      },
    },
    {
      id: "purple",
      name: "Royal Purple",
      description: "Elegant purple theme with pink accents",
      preview: {
        primary: "#1e1b4b",
        secondary: "#3730a3",
        accent: "#8b5cf6",
        text: "#ffffff",
      },
    },
  ];

  const accentColors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Orange", value: "#f97316" },
    { name: "Red", value: "#ef4444" },
    { name: "Yellow", value: "#eab308" },
    { name: "Cyan", value: "#06b6d4" },
  ];

  const backgroundImages = [
    {
      id: "default",
      name: "Default",
      thumbnail: null,
      description: "Solid color background",
    },
    {
      id: "music-1",
      name: "Music Waves",
      thumbnail:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      description: "Subtle music wave pattern",
    },
    {
      id: "abstract-1",
      name: "Abstract Gradient",
      thumbnail:
        "https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200&fit=crop",
      description: "Colorful abstract gradient",
    },
    {
      id: "geometric-1",
      name: "Geometric Pattern",
      thumbnail:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7f09?w=300&h=200&fit=crop",
      description: "Clean geometric shapes",
    },
  ];

  const handleThemeChange = (key, value) => {
    const updatedTheme = { ...localTheme, [key]: value };
    setLocalTheme(updatedTheme);
    setUnsavedChanges(true);

    // Apply theme immediately for live preview
    setTheme(updatedTheme);
  };

  const handleSaveTheme = () => {
    setTheme(localTheme);
    setUnsavedChanges(false);
    // Show success message
    alert("Theme saved successfully!");
  };

  const handleResetTheme = () => {
    const defaultTheme = {
      colorPalette: "dark",
      accentColor: "#3b82f6",
      backgroundTheme: "dark",
      compactMode: false,
      showSidebar: true,
      bannerMediaId: "default",
      customBackground: null,
      borderRadius: "medium",
      animations: true,
      glassEffect: false,
      customFont: "Inter",
      fontSize: "medium",
      sidebarWidth: "normal",
      headerHeight: "normal",
      cardStyle: "default",
      iconStyle: "outline",
      buttonStyle: "rounded",
    };
    setLocalTheme(defaultTheme);
    setUnsavedChanges(true);
  };

  const handleExportTheme = () => {
    const blob = new Blob([JSON.stringify(localTheme, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "djamms-theme.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target.result);
          setLocalTheme({ ...localTheme, ...importedTheme });
          setUnsavedChanges(true);
          alert("Theme imported successfully!");
        } catch (error) {
          alert("Failed to import theme. Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const selectedPalette =
    colorPalettes.find((p) => p.id === localTheme.colorPalette) ||
    colorPalettes[0];

  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">UI Look & Feel</h1>
          {unsavedChanges && (
            <span className="bg-orange-600 text-white text-sm px-2 py-1 rounded">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTheme}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            title="Export Theme"
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportTheme}
              className="hidden"
            />
          </label>
          <button
            onClick={handleResetTheme}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            title="Reset to Default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveTheme}
            disabled={!unsavedChanges}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Theme
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Settings Panel */}
        <div className="w-80 overflow-y-auto space-y-6">
          {/* Color Palette */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Palette
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {colorPalettes.map((palette) => (
                <label
                  key={palette.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    localTheme.colorPalette === palette.id
                      ? "bg-blue-600/20 border border-blue-500"
                      : "bg-gray-700 hover:bg-gray-600 border border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name="colorPalette"
                    value={palette.id}
                    checked={localTheme.colorPalette === palette.id}
                    onChange={(e) =>
                      handleThemeChange("colorPalette", e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex gap-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: palette.preview.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: palette.preview.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: palette.preview.accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{palette.name}</p>
                    <p className="text-sm text-gray-400">
                      {palette.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleThemeChange("accentColor", color.value)}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    localTheme.accentColor === color.value
                      ? "border-white scale-110"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Color
              </label>
              <input
                type="color"
                value={localTheme.accentColor}
                onChange={(e) =>
                  handleThemeChange("accentColor", e.target.value)
                }
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Background */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Background
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backgroundImages.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleThemeChange("bannerMediaId", bg.id)}
                  className={`aspect-video rounded-lg border-2 overflow-hidden transition-all ${
                    localTheme.bannerMediaId === bg.id
                      ? "border-blue-500"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                >
                  {bg.thumbnail ? (
                    <img
                      src={bg.thumbnail}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-xs text-gray-400">Default</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localTheme.glassEffect}
                onChange={(e) =>
                  handleThemeChange("glassEffect", e.target.checked)
                }
                className="rounded"
              />
              <span>Glass effect (blur background)</span>
            </label>
          </div>

          {/* Layout Options */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Layout
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localTheme.showSidebar}
                  onChange={(e) =>
                    handleThemeChange("showSidebar", e.target.checked)
                  }
                  className="rounded"
                />
                <span>Show sidebar</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localTheme.compactMode}
                  onChange={(e) =>
                    handleThemeChange("compactMode", e.target.checked)
                  }
                  className="rounded"
                />
                <span>Compact mode</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sidebar Width
                </label>
                <select
                  value={localTheme.sidebarWidth}
                  onChange={(e) =>
                    handleThemeChange("sidebarWidth", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="narrow">Narrow</option>
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Header Height
                </label>
                <select
                  value={localTheme.headerHeight}
                  onChange={(e) =>
                    handleThemeChange("headerHeight", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="tall">Tall</option>
                </select>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Family
                </label>
                <select
                  value={localTheme.customFont}
                  onChange={(e) =>
                    handleThemeChange("customFont", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size
                </label>
                <select
                  value={localTheme.fontSize}
                  onChange={(e) =>
                    handleThemeChange("fontSize", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>

              {/* Font Preview */}
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                <div
                  style={{
                    fontFamily: localTheme.customFont,
                    fontSize:
                      localTheme.fontSize === "small"
                        ? "14px"
                        : localTheme.fontSize === "large"
                          ? "18px"
                          : localTheme.fontSize === "extra-large"
                            ? "20px"
                            : "16px",
                  }}
                >
                  <h4 className="font-semibold mb-1">DJAMMS Music System</h4>
                  <p className="text-gray-300 text-sm">
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Font: {localTheme.customFont} • Size: {localTheme.fontSize}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Component Styles */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Component Styles
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Border Radius
                </label>
                <select
                  value={localTheme.borderRadius}
                  onChange={(e) =>
                    handleThemeChange("borderRadius", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="none">None (Sharp)</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="full">Full (Pills)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Card Style
                </label>
                <select
                  value={localTheme.cardStyle}
                  onChange={(e) =>
                    handleThemeChange("cardStyle", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="default">Default</option>
                  <option value="elevated">Elevated (Shadow)</option>
                  <option value="outlined">Outlined</option>
                  <option value="filled">Filled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Button Style
                </label>
                <select
                  value={localTheme.buttonStyle}
                  onChange={(e) =>
                    handleThemeChange("buttonStyle", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="pill">Pill</option>
                  <option value="outlined">Outlined</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon Style
                </label>
                <select
                  value={localTheme.iconStyle}
                  onChange={(e) =>
                    handleThemeChange("iconStyle", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="outline">Outline</option>
                  <option value="filled">Filled</option>
                  <option value="duotone">Duotone</option>
                </select>
              </div>
            </div>
          </div>

          {/* Animations & Effects */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Animations & Effects
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localTheme.animations}
                  onChange={(e) =>
                    handleThemeChange("animations", e.target.checked)
                  }
                  className="rounded"
                />
                <span>Enable animations</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-800 rounded-lg p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </h3>

            <div className="flex bg-gray-700 rounded">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-2 transition-colors ${
                  previewMode === "desktop"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode("tablet")}
                className={`p-2 transition-colors ${
                  previewMode === "tablet"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-2 transition-colors ${
                  previewMode === "mobile"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="bg-gray-900 rounded-lg p-4 h-full overflow-auto">
            <div
              className={`mx-auto bg-white rounded-lg overflow-hidden shadow-lg transition-all ${
                previewMode === "mobile"
                  ? "max-w-sm"
                  : previewMode === "tablet"
                    ? "max-w-2xl"
                    : "w-full"
              }`}
              style={{
                backgroundColor: selectedPalette.preview.primary,
                color: selectedPalette.preview.text,
                fontFamily: localTheme.customFont,
                fontSize:
                  localTheme.fontSize === "small"
                    ? "14px"
                    : localTheme.fontSize === "large"
                      ? "18px"
                      : localTheme.fontSize === "extra-large"
                        ? "20px"
                        : "16px",
              }}
            >
              {/* Preview Header */}
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: selectedPalette.preview.secondary }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: localTheme.accentColor }}
                  >
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">DJAMMS Preview</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6">
                {/* Sample Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div
                    className={`p-4 rounded-lg border ${
                      localTheme.cardStyle === "elevated"
                        ? "shadow-lg"
                        : localTheme.cardStyle === "outlined"
                          ? "border-gray-300"
                          : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: selectedPalette.preview.secondary,
                      borderRadius:
                        localTheme.borderRadius === "none"
                          ? "0"
                          : localTheme.borderRadius === "small"
                            ? "4px"
                            : localTheme.borderRadius === "large"
                              ? "12px"
                              : localTheme.borderRadius === "full"
                                ? "9999px"
                                : "8px",
                    }}
                  >
                    <h4 className="font-semibold mb-2">Sample Card</h4>
                    <p className="text-sm opacity-80">
                      This is how cards will look with your theme settings.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      localTheme.cardStyle === "elevated"
                        ? "shadow-lg"
                        : localTheme.cardStyle === "outlined"
                          ? "border-gray-300"
                          : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: selectedPalette.preview.secondary,
                      borderRadius:
                        localTheme.borderRadius === "none"
                          ? "0"
                          : localTheme.borderRadius === "small"
                            ? "4px"
                            : localTheme.borderRadius === "large"
                              ? "12px"
                              : localTheme.borderRadius === "full"
                                ? "9999px"
                                : "8px",
                    }}
                  >
                    <h4 className="font-semibold mb-2">Another Card</h4>
                    <p className="text-sm opacity-80">
                      Cards adapt to your chosen style and colors.
                    </p>
                  </div>
                </div>

                {/* Sample Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    className={`px-4 py-2 transition-colors ${
                      localTheme.buttonStyle === "outlined"
                        ? "border-2"
                        : localTheme.buttonStyle === "pill"
                          ? "rounded-full"
                          : localTheme.buttonStyle === "square"
                            ? "rounded-none"
                            : "rounded"
                    }`}
                    style={{
                      backgroundColor: localTheme.accentColor,
                      color: "white",
                      borderColor:
                        localTheme.buttonStyle === "outlined"
                          ? localTheme.accentColor
                          : "transparent",
                    }}
                  >
                    Primary Button
                  </button>

                  <button
                    className={`px-4 py-2 transition-colors ${
                      localTheme.buttonStyle === "outlined"
                        ? "border-2"
                        : localTheme.buttonStyle === "pill"
                          ? "rounded-full"
                          : localTheme.buttonStyle === "square"
                            ? "rounded-none"
                            : "rounded"
                    }`}
                    style={{
                      backgroundColor: "transparent",
                      color: selectedPalette.preview.text,
                      border: `2px solid ${selectedPalette.preview.text}`,
                      opacity: 0.7,
                    }}
                  >
                    Secondary Button
                  </button>
                </div>

                {/* Sample Text */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Heading Example</h2>
                  <p className="opacity-80">
                    This preview shows how your theme will look across different
                    components. The colors, fonts, and styling will be applied
                    consistently throughout the application.
                  </p>

                  <div className="flex items-center gap-2 mt-4">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: localTheme.accentColor }}
                    ></div>
                    <span className="text-sm">
                      Accent color: {localTheme.accentColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

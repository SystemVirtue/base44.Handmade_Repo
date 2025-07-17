import React from "react";

export default function VideoOutput() {
  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <h1 className="text-3xl font-bold mb-6">Video Output</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Video Preview Area</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Output Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Resolution
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                  <option>1920x1080</option>
                  <option>1280x720</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Quality
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function UILookAndFeel() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <div className="p-8 text-white">Loading settings...</div>;
  }

  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <h1 className="text-3xl font-bold mb-6">UI Look & Feel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Color Theme</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="theme"
                value="dark"
                defaultChecked
                className="text-blue-600"
              />
              <span>Dark Theme</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="theme"
                value="light"
                className="text-blue-600"
              />
              <span>Light Theme</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="theme"
                value="celtic"
                className="text-blue-600"
              />
              <span>Celtic Theme</span>
            </label>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Layout Options</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="text-blue-600" />
              <span>Show sidebar</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="text-blue-600" />
              <span>Compact mode</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="text-blue-600" />
              <span>Full screen mode</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}

import React from "react";

export default function DigitalSignage() {
  return (
    <div className="p-8 text-white bg-gray-900 h-full">
      <h1 className="text-3xl font-bold mb-6">Digital Signage</h1>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Signage Library</h2>
          <span className="text-gray-400">0 Items</span>
        </div>

        <div className="text-center py-12 text-gray-400">
          <p>No signage content available</p>
          <p className="text-sm mt-2">Upload images or videos to get started</p>
        </div>
      </div>
    </div>
  );
}

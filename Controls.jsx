import React from "react";

export default function Controls() {
  return (
    <div className="p-8 text-white bg-gray-900 h-full overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">System Controls</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Audio Controls</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors">
              Play
            </button>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors">
              Pause
            </button>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors">
              Stop
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Volume</h2>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="75"
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>0%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

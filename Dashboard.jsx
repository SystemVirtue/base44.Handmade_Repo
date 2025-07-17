import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full bg-gray-900 text-white justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        Loading Player...
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900 text-white">
      <div className="flex-1 flex flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Currently Playing</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-600 rounded-lg"></div>
            <div>
              <p className="font-medium">Deep Cover (Explicit)</p>
              <p className="text-gray-400">FAT JOE</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Playlist Queue</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-gray-700 rounded">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Sample Song 1</p>
                <p className="text-gray-400 text-sm">Artist Name</p>
              </div>
              <span className="text-green-400">♪</span>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-700 rounded">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Sample Song 2</p>
                <p className="text-gray-400 text-sm">Artist Name</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

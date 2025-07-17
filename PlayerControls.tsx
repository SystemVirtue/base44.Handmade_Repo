import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Square } from "lucide-react";

export default function PlayerControls({ 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious, 
  onStop 
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 border-gray-600 hover:bg-gray-700 text-white"
        onClick={onPrevious}
      >
        <SkipBack className="w-5 h-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 border-gray-600 hover:bg-gray-700 text-white"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 border-gray-600 hover:bg-gray-700 text-white"
        onClick={onNext}
      >
        <SkipForward className="w-5 h-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 border-gray-600 hover:bg-gray-700 text-white"
        onClick={onStop}
      >
        <Square className="w-5 h-5" />
      </Button>
    </div>
  );
}
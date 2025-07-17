import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

export default function CurrentlyPlaying({ 
  song, 
  isPlaying, 
  currentTime, 
  totalTime, 
  progress, 
  volume, 
  onVolumeChange 
}) {
  if (!song) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            <p>No song currently playing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Album Art */}
          <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={song.cover_image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"}
              alt="Album cover" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Song Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              {song.title}
              {song.is_explicit && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Explicit
                </Badge>
              )}
            </h2>
            <p className="text-lg text-gray-300 mb-2">{song.artist}</p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-gray-600" />
              <div className="flex justify-between text-sm text-gray-400">
                <span>{currentTime}</span>
                <span>-{totalTime}</span>
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="w-24">
              <Slider
                value={[volume]}
                onValueChange={(value) => onVolumeChange(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-sm font-medium text-white w-8">
              {volume}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Clock, Music } from "lucide-react";
import { format } from "date-fns";

export default function PlaylistQueue({ queueItems, songs, onVote, currentSong }) {
  if (!queueItems || queueItems.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 m-6">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No songs in queue</p>
            <p className="text-sm mt-2">Add songs from the Search page to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const songsById = songs.reduce((acc, song) => {
    acc[song.id] = song;
    return acc;
  }, {});

  return (
    <Card className="bg-gray-800 border-gray-700 m-6">
      <CardHeader className="bg-gray-700 border-b border-gray-600">
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5" />
          Playing Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-700">
          {queueItems.map((item, index) => {
            const song = songsById[item.song_id];
            if (!song) return null;
            
            return (
              <QueueItemRow 
                key={item.id}
                item={item}
                song={song}
                index={index}
                onVote={onVote}
                isCurrentlyPlaying={item.song_id === currentSong?.id}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function QueueItemRow({ item, song, index, onVote, isCurrentlyPlaying }) {
  const playTime = new Date();
  playTime.setMinutes(playTime.getMinutes() + (index * 4)); // Mock calculation

  return (
    <div className={`p-4 hover:bg-gray-700 transition-colors ${
      isCurrentlyPlaying ? 'bg-green-900/20 border-l-4 border-green-400' : ''
    }`}>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white">{song.title}</h3>
            {song.is_explicit && (
              <Badge variant="destructive" className="text-xs">
                Explicit
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-400">{song.artist}</p>
        </div>

        <div className="text-sm text-gray-400 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {format(playTime, "h:mm a")}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">{song.votes || 0}</span>
          </div>
        </div>

        <div className="text-sm text-gray-400 w-12 text-right">
          {song.year}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-600"
          onClick={() => onVote(song.id)}
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
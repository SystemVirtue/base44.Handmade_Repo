import React, { useState, useEffect } from "react";
import { Song } from "@/entities/Song";
import { QueueItem } from "@/entities/QueueItem";
import { Playlist } from "@/entities/Playlist";
import { Play, Pause, SkipBack, SkipForward, Square, Volume2, ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import PlayerControls from "../components/player/PlayerControls";
import PlaylistQueue from "../components/player/PlaylistQueue";
import CurrentlyPlaying from "../components/player/CurrentlyPlaying";

export default function Dashboard() {
  const [currentSong, setCurrentSong] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalTime, setTotalTime] = useState("00:00");
  const [volume, setVolume] = useState(100);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentPlaylist();
  }, []);

  const loadCurrentPlaylist = async () => {
    setLoading(true);
    try {
      const queue = await QueueItem.list({ sort: "order_index" });
      setQueueItems(queue);

      if (queue.length > 0) {
        const songIds = [...new Set(queue.map(item => item.song_id))];
        const allSongs = await Song.list();
        const songsById = allSongs.reduce((acc, song) => {
            acc[song.id] = song;
            return acc;
        }, {});

        const queueSongs = queue.map(item => songsById[item.song_id]).filter(Boolean);
        setSongs(queueSongs);

        const currentPlayingItem = queue.find(item => item.is_currently_playing);
        if (currentPlayingItem) {
          const song = songsById[currentPlayingItem.song_id];
          setCurrentSong(song);
        } else {
          setCurrentSong(null);
        }
      } else {
        setSongs([]);
        setCurrentSong(null);
      }
    } catch (error) {
      console.error("Error loading playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    console.log("Moving to next song");
  };

  const handlePrevious = () => {
    console.log("Moving to previous song");
  };

  const handleVote = async (songId) => {
    try {
      const song = songs.find(s => s.id === songId);
      if(song) {
        await Song.update(songId, { votes: (song.votes || 0) + 1 });
        const updatedSongs = songs.map(s => s.id === songId ? {...s, votes: (s.votes || 0) + 1} : s);
        setSongs(updatedSongs);
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

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
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Currently Playing Section */}
        <div className="p-6 border-b border-gray-700">
          <CurrentlyPlaying 
            song={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            totalTime={totalTime}
            progress={progress}
            volume={volume}
            onVolumeChange={setVolume}
          />
          
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onStop={() => setIsPlaying(false)}
          />
        </div>

        {/* Playlist Queue */}
        <div className="flex-1 overflow-auto">
          <PlaylistQueue 
            queueItems={queueItems}
            songs={songs}
            onVote={handleVote}
            currentSong={currentSong}
          />
        </div>
      </div>
    </div>
  );
}
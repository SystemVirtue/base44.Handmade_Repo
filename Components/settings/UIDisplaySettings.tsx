import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomMedia } from '@/entities/CustomMedia';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function UIDisplaySettings({ settings, onSave }) {
  const [media, setMedia] = useState([]);
  const [banner, setBanner] = useState(settings.banner_media_id || 'default');
  const [jukeboxBg, setJukeboxBg] = useState(settings.jukebox_background_media_id || 'default');

  useEffect(() => {
    const fetchMediaFiles = async () => {
      const mediaList = await CustomMedia.list();
      setMedia(mediaList);
    };
    fetchMediaFiles();
  }, []);

  const handleSave = () => {
    onSave({
      banner_media_id: banner,
      jukebox_background_media_id: jukeboxBg,
    });
  };

  const imageMedia = media.filter(m => m.type === 'image');
  const starredMedia = media.filter(m => m.is_starred);

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--border-color)]">
      <CardHeader>
        <CardTitle>Display & Background Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-lg">Media Manager Banner</Label>
          <p className="text-sm text-[var(--text-secondary)]">Controls the header banner at the top of the UI.</p>
          <Select value={banner} onValueChange={setBanner}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select banner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="none">None</SelectItem>
              {imageMedia.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-lg">Jukebox Background</Label>
          <p className="text-sm text-[var(--text-secondary)]">Controls the background for the DJAMMS Jukebox UI.</p>
          <Select value={jukeboxBg} onValueChange={setJukeboxBg}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select Jukebox background" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="none">None</SelectItem>
              {starredMedia.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name} (Starred)</SelectItem>
              ))}
              <SelectItem value="loop_all_starred">Loop All Starred Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
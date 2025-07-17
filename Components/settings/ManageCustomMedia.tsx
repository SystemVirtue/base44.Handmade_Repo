import React, { useState, useEffect, useRef } from 'react';
import { CustomMedia } from '@/entities/CustomMedia';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Star, Trash2, List, Grid, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ManageCustomMedia() {
  const [media, setMedia] = useState([]);
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    const mediaList = await CustomMedia.list();
    setMedia(mediaList);
    setLoading(false);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const fileType = file.type.split('/')[0]; // 'image', 'video', 'audio'
      await CustomMedia.create({
        name: file.name,
        file_url,
        type: fileType,
        is_starred: false,
      });
      fetchMedia();
    } catch (error) {
      console.error('File upload failed:', error);
    }
    setUploading(false);
    fileInputRef.current.value = null; // Reset file input
  };

  const handleDelete = async (id) => {
    await CustomMedia.delete(id);
    fetchMedia();
  };

  const handleToggleStar = async (item) => {
    await CustomMedia.update(item.id, { is_starred: !item.is_starred });
    fetchMedia();
  };

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--border-color)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Custom Media</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-switch">View</Label>
            <Button variant="ghost" size="icon" onClick={() => setView('list')} className={view === 'list' ? 'bg-[var(--primary-color)]' : ''}><List /></Button>
            <Button variant="ghost" size="icon" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-[var(--primary-color)]' : ''}><Grid /></Button>
          </div>
          <Button onClick={() => fileInputRef.current.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Media
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,audio/*" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading media...</div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <div key={item.id} className="relative group border border-[var(--border-color)] rounded-lg overflow-hidden aspect-square">
                {item.type === 'image' && <img src={item.file_url} alt={item.name} className="w-full h-full object-cover" />}
                {item.type === 'video' && <video src={item.file_url} className="w-full h-full object-cover" />}
                {item.type === 'audio' && <div className="w-full h-full bg-gray-700 flex items-center justify-center"><List className="w-12 h-12"/></div>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                  <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => handleToggleStar(item)}>
                      <Star className={item.is_starred ? 'fill-yellow-400 text-yellow-400' : ''} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {media.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border border-[var(--border-color)]">
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStar(item)}>
                    <Star className={`mr-2 h-4 w-4 ${item.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`}/> Star
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
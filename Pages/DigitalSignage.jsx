import React, { useState, useEffect, useRef } from 'react';
import { DigitalSignage as DigitalSignageEntity } from '@/entities/DigitalSignage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, Upload, Image as ImageIcon, FileText, Video as VideoIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UploadFile } from '@/integrations/Core';

function DigitalSignageLibrary() {
    const [signage, setSignage] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => { fetchSignage() }, []);

    const fetchSignage = async () => {
        setLoading(true);
        const items = await DigitalSignageEntity.list({sort: 'order_index'});
        setSignage(items);
        setLoading(false);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            let type = 'html';
            if (file.type.startsWith('image/')) type = 'image';
            if (file.type.startsWith('video/')) type = 'video';

            await DigitalSignageEntity.create({
                name: file.name,
                type: type,
                file_url: file_url,
                duration: 30,
            });
            fetchSignage();
        } catch(e) { console.error(e) } 
        finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    
    const handleDelete = async (id) => {
        await DigitalSignageEntity.delete(id);
        fetchSignage();
    };

    const filteredSignage = signage.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <Card className="bg-gray-800 border-gray-700">
             <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Signage Library</CardTitle>
                <div className="flex items-center gap-2">
                    <span>{filteredSignage.length} Items</span>
                    <Input placeholder="Search Filenames" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-64 bg-gray-700 border-gray-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <Button onClick={() => fileInputRef.current.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,text/html" />
                    <Button variant="outline">Library</Button>
                    <Button variant="outline">Custom</Button>
                </div>

                {loading ? <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-gray-700/50">
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Filename</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSignage.map((item, index) => (
                                <TableRow key={item.id} className="hover:bg-gray-700/50">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="flex items-center gap-2 font-medium">
                                        {item.type === 'image' && <ImageIcon className="w-5 h-5 text-blue-400" />}
                                        {item.type === 'video' && <VideoIcon className="w-5 h-5 text-purple-400" />}
                                        {(item.type === 'html' || item.type === 'text') && <FileText className="w-5 h-5 text-green-400" />}
                                        {item.name}
                                    </TableCell>
                                    <TableCell>ALL YEAR</TableCell>
                                    <TableCell>ALL DAY | ALL WEEK</TableCell>
                                    <TableCell>{item.duration} secs</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

export default function DigitalSignagePage() {
    return (
        <div className="p-4 md:p-8 text-[var(--text-primary)] bg-[var(--main-bg)] h-full">
             <Tabs defaultValue="user-signage" className="w-full">
                <TabsList className="bg-transparent border-b border-gray-700 rounded-none mb-4 p-0">
                    <TabsTrigger value="user-signage" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-4 py-2 rounded-t-md">User Digital Signage</TabsTrigger>
                    <TabsTrigger value="scrolling-text" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-4 py-2 rounded-t-md">Scrolling Text</TabsTrigger>
                    <TabsTrigger value="priority-signage" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-4 py-2 rounded-t-md">Priority Digital Signage</TabsTrigger>
                </TabsList>
                <TabsContent value="user-signage">
                    <DigitalSignageLibrary />
                </TabsContent>
                <TabsContent value="scrolling-text">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader><CardTitle>Manage Scrolling Text</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-gray-400">Functionality to add and manage scrolling text messages for display will be implemented here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="priority-signage">
                     <Card className="bg-gray-800 border-gray-700">
                        <CardHeader><CardTitle>Manage Priority Signage</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-gray-400">Manage high-priority signage that can override regular content will be implemented here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
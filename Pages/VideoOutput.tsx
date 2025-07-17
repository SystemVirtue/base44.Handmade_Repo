import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Play, Tv, Clapperboard, Sparkles } from 'lucide-react';

export default function VideoOutput() {
  return (
    <div className="p-4 md:p-8 text-[var(--text-primary)] bg-[var(--main-bg)] h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-6">Video Output</h1>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Video Sources</CardTitle>
            <p className="text-sm text-gray-400">Manage which video source is displaying on screen.</p>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="user-signage" className="space-y-4">
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-gray-700">
                <RadioGroupItem value="current-song" id="current-song" />
                <Label htmlFor="current-song" className="text-lg font-medium flex-1">Current Song (Playing)</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-green-500 bg-green-500/10">
                <RadioGroupItem value="user-signage" id="user-signage" />
                <Label htmlFor="user-signage" className="text-lg font-medium flex-1">User Digital Signage</Label>
              </div>
               <div className="flex items-center space-x-2 p-4 rounded-lg border border-gray-700">
                <RadioGroupItem value="priority-signage" id="priority-signage" />
                <Label htmlFor="priority-signage" className="text-lg font-medium flex-1">Priority Digital Signage</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-gray-700">
                <RadioGroupItem value="ambient-visuals" id="ambient-visuals" />
                <Label htmlFor="ambient-visuals" className="text-lg font-medium flex-1">Ambient Visuals</Label>
              </div>
            </RadioGroup>
            <div className="mt-6 flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <Label htmlFor="video-switcher" className="text-lg font-medium">Video Switcher</Label>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Cycling through sources automatically</span>
                    <Switch id="video-switcher" />
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
         <h1 className="text-3xl font-bold mb-6 invisible">.</h1>
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle>Games & Draws</CardTitle>
                 <p className="text-sm text-gray-400">Manage and start games or draws on screen.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button className="w-full justify-start text-lg py-6" variant="secondary"><Tv className="mr-4"/> Streaming TV</Button>
                <Button className="w-full justify-start text-lg py-6" variant="secondary"><Clapperboard className="mr-4"/> Random Draw</Button>
                <Button className="w-full justify-start text-lg py-6" variant="secondary"><Sparkles className="mr-4"/> 90 Ball Bingo</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Volume2, Music, Mic2, Tv, Gamepad2, Ticket, Plus, Minus } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Controls() {
  return (
    <div className="p-4 md:p-8 text-[var(--text-primary)] bg-[var(--main-bg)] h-full overflow-y-auto">
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">System Controls</h1>

            <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Volume2 /> Volume</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Button size="icon" variant="outline"><Minus /></Button>
                    <Slider defaultValue={[100]} max={100} step={1} />
                    <Button size="icon" variant="outline"><Plus /></Button>
                    <span className="font-bold text-xl w-12 text-center">100</span>
                </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                <AccordionItem value="item-1" className="bg-gray-800 border border-gray-700 rounded-lg mb-4">
                    <AccordionTrigger className="p-4 text-lg font-semibold"><Music className="mr-2"/> Mode Controls</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="scheduler-mode" className="text-base">Scheduler</Label>
                            <Switch id="scheduler-mode" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="karaoke-mode" className="text-base">Karaoke</Label>
                            <Switch id="karaoke-mode" />
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="autoplay-mode" className="text-base">Autoplay</Label>
                            <Switch id="autoplay-mode" defaultChecked/>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="manual-cue-mode" className="text-base">Manual Cue Requests</Label>
                            <Switch id="manual-cue-mode" />
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="explicit-filter-mode" className="text-base">Explicit Filter</Label>
                            <Switch id="explicit-filter-mode" />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="bg-gray-800 border border-gray-700 rounded-lg mb-4">
                    <AccordionTrigger className="p-4 text-lg font-semibold"><Gamepad2 className="mr-2"/> Games & Draws</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-2">
                         <Button className="w-full justify-start text-base py-4" variant="ghost"><Tv className="mr-4"/> Streaming TV</Button>
                         <Button className="w-full justify-start text-base py-4" variant="ghost"><Ticket className="mr-4"/> Random Draw</Button>
                         <Button className="w-full justify-start text-base py-4" variant="ghost"><Mic2 className="mr-4"/> 90 Ball Bingo</Button>
                         <div className="p-4 bg-gray-900 rounded-lg mt-4">
                            <Label className="block mb-2">TRIVIA</Label>
                            <div className="flex gap-2">
                                <Input defaultValue="BRUF5Q" className="bg-gray-700 border-gray-600"/>
                                <Button>LAUNCH</Button>
                            </div>
                         </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3" className="bg-gray-800 border border-gray-700 rounded-lg mb-4">
                    <AccordionTrigger className="p-4 text-lg font-semibold"><Music className="mr-2"/> DJAMMS Jukebox</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4">
                        <Button className="w-full">Functions and Karaoke Wizard</Button>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    </div>
  );
}
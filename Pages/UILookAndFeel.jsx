import React, { useState, useEffect } from 'react';
import { UISettings } from '@/entities/UISettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Image as ImageIcon, Paintbrush } from 'lucide-react';
import ManageCustomMedia from '../components/settings/ManageCustomMedia';
import UIThemeSettings from '../components/settings/UIThemeSettings';
import UIDisplaySettings from '../components/settings/UIDisplaySettings';

export default function UILookAndFeel() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settingsList = await UISettings.list();
      if (settingsList.length > 0) {
        setSettings(settingsList[0]);
      } else {
        const newSettings = await UISettings.create({});
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error fetching UI settings", error);
    }
    setLoading(false);
  };

  const handleSettingsSave = async (updatedData) => {
    if (!settings) return;
    try {
      const updatedSettings = await UISettings.update(settings.id, updatedData);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error saving UI settings", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading settings...</div>;
  }

  return (
    <div className="p-4 md:p-8 text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold mb-6">UI Look & Feel</h1>
      <Tabs defaultValue="media" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[var(--card-bg)] text-[var(--text-secondary)]">
          <TabsTrigger value="media"><ImageIcon className="w-4 h-4 mr-2" />Manage Custom Media</TabsTrigger>
          <TabsTrigger value="palette"><Palette className="w-4 h-4 mr-2" />UI Color Palette</TabsTrigger>
          <TabsTrigger value="display"><Paintbrush className="w-4 h-4 mr-2" />Display & Backgrounds</TabsTrigger>
        </TabsList>
        <TabsContent value="media">
          <ManageCustomMedia />
        </TabsContent>
        <TabsContent value="palette">
          <UIThemeSettings settings={settings} onSave={handleSettingsSave} />
        </TabsContent>
        <TabsContent value="display">
          <UIDisplaySettings settings={settings} onSave={handleSettingsSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
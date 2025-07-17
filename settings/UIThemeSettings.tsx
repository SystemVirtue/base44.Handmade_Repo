import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const colorPalettes = [
  { value: 'celtic', label: 'Celtic (Green)' },
  { value: 'amethyst', label: 'Amethyst (Purple)' },
  { value: 'amber', label: 'Amber (Orange)' },
  { value: 'burgundy', label: 'Burgundy (Red)' },
  { value: 'sky', label: 'Sky (Blue)' },
  { value: 'midnight', label: 'Midnight (Dark Grey)' },
  { value: 'custom', label: 'Custom' },
];

const backgroundThemes = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'dynamic', label: 'Dynamic' },
];

export default function UIThemeSettings({ settings, onSave }) {
  const [palette, setPalette] = useState(settings.color_palette || 'celtic');
  const [customColor, setCustomColor] = useState(settings.custom_color || '#2d5436');
  const [theme, setTheme] = useState(settings.background_theme || 'dark');

  const handleSave = () => {
    onSave({
      color_palette: palette,
      custom_color: customColor,
      background_theme: theme,
    });
  };

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--border-color)]">
      <CardHeader>
        <CardTitle>UI Color Palette & Theme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-lg">UI Color Palette</Label>
          <Select value={palette} onValueChange={setPalette}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select a palette" />
            </SelectTrigger>
            <SelectContent>
              {colorPalettes.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {palette === 'custom' && (
            <div className="mt-4 flex items-center gap-2">
              <Label>Custom Color:</Label>
              <Input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="w-16 h-10 p-1" />
              <Input type="text" value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="#RRGGBB" />
            </div>
          )}
        </div>
        <div>
          <Label className="text-lg">Background Theme</Label>
          <RadioGroup value={theme} onValueChange={setTheme} className="mt-2 grid grid-cols-3 gap-4">
            {backgroundThemes.map(t => (
              <div key={t.value}>
                <RadioGroupItem value={t.value} id={t.value} className="peer sr-only" />
                <Label htmlFor={t.value} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[var(--primary-color)] [&:has([data-state=checked])]:border-[var(--primary-color)] cursor-pointer">
                  {t.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
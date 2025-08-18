import React from 'react';
import { Palette, Save, Settings } from 'lucide-react';

/**
 * Demo component showing how to use the global theme system
 * This demonstrates the themed CSS classes that work across all themes
 */
export default function ThemedDemo() {
  return (
    <div className="themed-surface p-6 rounded-lg">
      <h2 className="themed-text-primary text-2xl font-bold mb-4">
        Themed Component Example
      </h2>
      
      <p className="themed-text-secondary mb-6">
        This component automatically adapts to any theme changes. All colors, 
        fonts, and spacing update when the user modifies the theme.
      </p>

      {/* Example Card */}
      <div className="themed-card p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="themed-accent-bg p-2 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="themed-text-primary font-semibold">Themed Card</h3>
            <p className="themed-text-muted text-sm">Adapts to any color palette</p>
          </div>
        </div>
        
        <p className="themed-text-secondary text-sm">
          This card uses themed classes and will automatically update its 
          colors, borders, and spacing based on the current theme.
        </p>
      </div>

      {/* Example Buttons */}
      <div className="flex gap-3 mb-6">
        <button className="themed-button-primary">
          <Save className="w-4 h-4 inline mr-2" />
          Primary Action
        </button>
        
        <button className="themed-button-secondary">
          <Settings className="w-4 h-4 inline mr-2" />
          Secondary Action
        </button>
      </div>

      {/* Example Form Elements */}
      <div className="space-y-3">
        <div>
          <label className="themed-text-primary text-sm font-medium block mb-1">
            Themed Input
          </label>
          <input 
            type="text" 
            placeholder="This input adapts to the theme"
            className="themed-input w-full"
          />
        </div>
        
        <div>
          <label className="themed-text-primary text-sm font-medium block mb-1">
            Select Field
          </label>
          <select className="themed-input w-full">
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
      </div>

      {/* Color Showcase */}
      <div className="mt-6 pt-6 border-t themed-border">
        <h4 className="themed-text-primary font-semibold mb-3">Color Palette</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-2" style={{backgroundColor: 'var(--color-primary)'}}></div>
            <span className="themed-text-muted text-xs">Primary</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-2" style={{backgroundColor: 'var(--color-secondary)'}}></div>
            <span className="themed-text-muted text-xs">Secondary</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-2" style={{backgroundColor: 'var(--color-accent)'}}></div>
            <span className="themed-text-muted text-xs">Accent</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-2" style={{backgroundColor: 'var(--color-surface)'}}></div>
            <span className="themed-text-muted text-xs">Surface</span>
          </div>
        </div>
      </div>
    </div>
  );
}

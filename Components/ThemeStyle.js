import React from 'react';

const themes = {
  celtic: { primary: '#2d5436', accent: '#d4af37' },
  amethyst: { primary: '#6d28d9', accent: '#facc15' },
  amber: { primary: '#b45309', accent: '#10b981' },
  burgundy: { primary: '#881337', accent: '#fde047' },
  sky: { primary: '#0369a1', accent: '#fb923c' },
  midnight: { primary: '#1f2937', accent: '#60a5fa' },
};

export default function ThemeStyle({ settings }) {
  const { color_palette, background_theme, custom_color } = settings;

  let isDark;
  if (background_theme === 'dynamic') {
    const hour = new Date().getHours();
    isDark = hour < 7 || hour >= 19; // Dark from 7 PM to 7 AM
  } else {
    isDark = background_theme === 'dark';
  }

  const selectedTheme = color_palette === 'custom' 
    ? { primary: custom_color || '#2d5436', accent: '#d4af37' } // fallback accent
    : themes[color_palette] || themes.celtic;

  const styles = `
    :root {
      --primary-color: ${selectedTheme.primary};
      --accent-color: ${selectedTheme.accent};
      
      --main-bg: ${isDark ? '#111827' : '#f9fafb'};
      --sidebar-bg: ${isDark ? '#1f2937' : '#ffffff'};
      --card-bg: ${isDark ? '#374151' : '#ffffff'};
      --text-primary: ${isDark ? '#ffffff' : '#111827'};
      --text-secondary: ${isDark ? '#9ca3af' : '#6b7280'};
      --border-color: ${isDark ? '#4b5563' : '#e5e7eb'};
      
      --djamms-gradient-start: ${selectedTheme.primary};
      --djamms-gradient-end: ${isDark ? '#000' : selectedTheme.primary};
    }
    
    .djamms-gradient {
      background: linear-gradient(135deg, var(--djamms-gradient-start) 0%, var(--djamms-gradient-end) 100%);
    }

    .sidebar-item.active {
      background: var(--primary-color);
      border-right: 4px solid var(--accent-color);
    }
  `;

  return <style>{styles}</style>;
}
import React, { createContext, useContext, useEffect } from 'react';
import { useUIStore } from '../../store.js';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { theme } = useUIStore();

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Set theme data attributes
    root.setAttribute('data-theme', theme.colorPalette || 'dark');
    root.setAttribute('data-font-size', theme.fontSize || 'medium');
    root.setAttribute('data-border-radius', theme.borderRadius || 'medium');
    root.setAttribute('data-sidebar-width', theme.sidebarWidth || 'normal');
    root.setAttribute('data-header-height', theme.headerHeight || 'normal');
    root.setAttribute('data-compact-mode', theme.compactMode ? 'true' : 'false');
    root.setAttribute('data-animations', theme.animations ? 'true' : 'false');
    root.setAttribute('data-glass-effect', theme.glassEffect ? 'true' : 'false');

    // Set custom CSS properties
    if (theme.accentColor) {
      root.style.setProperty('--color-accent', theme.accentColor);
      root.style.setProperty('--color-button-primary-bg', theme.accentColor);
    }

    if (theme.customFont && theme.customFont !== 'Inter') {
      root.style.setProperty('--font-family', `"${theme.customFont}", var(--font-family)`);
    }

    // Apply background image if set
    if (theme.bannerMediaId && theme.bannerMediaId !== 'default') {
      const backgroundImages = {
        'music-1': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop',
        'abstract-1': 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop',
        'geometric-1': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7f09?w=1920&h=1080&fit=crop'
      };

      const imageUrl = backgroundImages[theme.bannerMediaId];
      if (imageUrl) {
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        
        if (theme.glassEffect) {
          document.body.style.backdropFilter = 'blur(10px)';
        }
      }
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backdropFilter = '';
    }

    console.log('Theme applied:', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;

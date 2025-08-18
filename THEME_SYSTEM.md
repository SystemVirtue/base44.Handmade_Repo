# DJAMMS Theme System Documentation

## Overview

The DJAMMS theme system provides a comprehensive solution for applying consistent theming across all pages and components of the application. When a user modifies the theme in the UI Look & Feel page, changes are automatically applied globally to all components.

## Architecture

### 1. CSS Custom Properties (src/theme.css)
- Defines CSS variables for colors, typography, spacing, and effects
- Supports multiple theme palettes (dark, light, celtic, sunset, ocean, purple)
- Responsive design with mobile-specific adjustments
- Accessibility features (reduced motion, high contrast)

### 2. Theme Provider (src/contexts/ThemeContext.jsx)
- React context that manages global theme state
- Automatically applies theme changes to document root
- Handles custom properties and data attributes

### 3. Store Integration (store.js)
- Persists theme preferences
- Triggers global updates when theme changes
- Dispatches custom events for theme changes

## How to Use

### For Component Development

#### 1. Use Themed CSS Classes
```jsx
// Instead of hardcoded styles
<div className="bg-gray-800 text-white p-4 rounded-lg">

// Use themed classes
<div className="themed-surface themed-text-primary p-4 rounded-lg">
```

#### 2. Available Themed Classes
- `themed-card` - Card backgrounds with borders
- `themed-button-primary` - Primary action buttons
- `themed-button-secondary` - Secondary action buttons
- `themed-input` - Form inputs and selects
- `themed-text-primary` - Primary text color
- `themed-text-secondary` - Secondary text color
- `themed-text-muted` - Muted text color
- `themed-surface` - Surface backgrounds
- `themed-border` - Border colors
- `themed-accent` - Accent text color
- `themed-accent-bg` - Accent background color

#### 3. Use CSS Custom Properties
```css
.my-component {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-normal);
}
```

#### 4. Available CSS Variables

**Colors:**
- `--color-primary` - Primary background
- `--color-secondary` - Secondary background
- `--color-accent` - Accent color
- `--color-text` - Primary text
- `--color-text-secondary` - Secondary text
- `--color-text-muted` - Muted text
- `--color-background` - Page background
- `--color-surface` - Component surfaces
- `--color-border` - Border color
- `--color-success` - Success color
- `--color-warning` - Warning color
- `--color-error` - Error color

**Typography:**
- `--font-family` - Font family
- `--font-size-xs` through `--font-size-4xl` - Font sizes

**Layout:**
- `--border-radius` - Default border radius
- `--sidebar-width` - Sidebar width
- `--header-height` - Header height
- `--spacing-xs` through `--spacing-2xl` - Spacing values

**Effects:**
- `--shadow-sm` through `--shadow-xl` - Box shadows
- `--transition-fast`, `--transition-normal`, `--transition-slow` - Transitions

### For Theme Configuration

#### Available Theme Options

**Color Palettes:**
- `dark` - Dark professional theme
- `light` - Light modern theme
- `celtic` - Celtic green theme
- `sunset` - Sunset orange theme
- `ocean` - Ocean blue theme
- `purple` - Royal purple theme

**Customization Options:**
- Accent color (any hex color)
- Font family (Inter, Roboto, Open Sans, etc.)
- Font size (small, medium, large, extra-large)
- Border radius (none, small, medium, large, full)
- Sidebar width (narrow, normal, wide)
- Header height (compact, normal, tall)
- Compact mode (boolean)
- Animations (boolean)
- Glass effect (boolean)
- Background images

### Theme Usage Examples

#### Basic Component
```jsx
import React from 'react';

function MyComponent() {
  return (
    <div className="themed-card p-6">
      <h2 className="themed-text-primary text-xl font-bold mb-4">
        My Component
      </h2>
      <p className="themed-text-secondary mb-4">
        This text adapts to any theme.
      </p>
      <button className="themed-button-primary">
        Action Button
      </button>
    </div>
  );
}
```

#### Custom Styled Component
```jsx
import React from 'react';

function CustomComponent() {
  return (
    <div 
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)'
      }}
    >
      <h3 style={{ color: 'var(--color-accent)' }}>
        Custom Styled Title
      </h3>
    </div>
  );
}
```

## Real-time Theme Updates

The theme system automatically applies changes in real-time:

1. User modifies theme in UI Look & Feel page
2. `handleThemeChange` updates local state and calls `setTheme`
3. `ThemeProvider` detects change and updates document attributes
4. All components using themed classes update automatically
5. CSS custom properties ensure consistent styling

## Theme Events

The system dispatches custom events for theme changes:

```javascript
// Listen for theme changes
window.addEventListener('djamms-theme-changed', (event) => {
  console.log('Theme changed:', event.detail.theme);
});

// Dispatch notification when theme is saved
window.addEventListener('djamms-notification', (event) => {
  console.log('Notification:', event.detail);
});
```

## Best Practices

1. **Always use themed classes** instead of hardcoded colors
2. **Use CSS custom properties** for consistent spacing and effects
3. **Test with multiple themes** to ensure compatibility
4. **Respect user preferences** (reduced motion, high contrast)
5. **Maintain contrast ratios** for accessibility
6. **Use semantic color names** (primary, secondary, accent) rather than specific colors

## Migration Guide

To migrate existing components to use the theme system:

1. Replace hardcoded background colors with `themed-surface` or `var(--color-surface)`
2. Replace text colors with themed text classes
3. Replace button styles with themed button classes
4. Use CSS custom properties for spacing and borders
5. Test with different theme palettes

## Troubleshooting

**Theme not applying:**
- Check that `ThemeProvider` wraps your app
- Verify themed classes are used correctly
- Check browser console for theme application logs

**Styles not updating:**
- Ensure components use CSS custom properties
- Check that theme changes trigger re-renders
- Verify CSS specificity isn't overriding themed styles

**Performance issues:**
- Theme changes use CSS custom properties for optimal performance
- Animations can be disabled in theme settings
- Consider using `will-change` CSS property for frequently updated elements

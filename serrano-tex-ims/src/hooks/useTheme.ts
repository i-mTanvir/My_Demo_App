import { useState, useEffect, useCallback } from 'react';
import { Theme, ThemeMode, themes } from '../config/theme';

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

export const useTheme = (): ThemeContextValue => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('serrano-tex-theme');
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved as ThemeMode;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const theme = themes[themeMode];
  const isDark = themeMode === 'dark';

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('serrano-tex-theme', themeMode);
  }, [themeMode, isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('serrano-tex-theme');
      if (!savedTheme) {
        setThemeModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  return {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
    isDark
  };
};
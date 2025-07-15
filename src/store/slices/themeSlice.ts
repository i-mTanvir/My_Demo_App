import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme, ThemeMode, themes } from '../../config/theme';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  customThemes: Record<string, Theme>;
  preferences: {
    autoSwitch: boolean;
    systemPreference: boolean;
    animations: boolean;
    reducedMotion: boolean;
  };
}

const initialState: ThemeState = {
  mode: 'light',
  theme: themes.light,
  customThemes: {},
  preferences: {
    autoSwitch: false,
    systemPreference: true,
    animations: true,
    reducedMotion: false,
  },
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      state.theme = themes[action.payload];
    },
    setCustomTheme: (state, action: PayloadAction<{ name: string; theme: Theme }>) => {
      state.customThemes[action.payload.name] = action.payload.theme;
    },
    applyCustomTheme: (state, action: PayloadAction<string>) => {
      const customTheme = state.customThemes[action.payload];
      if (customTheme) {
        state.theme = customTheme;
      }
    },
    updateThemePreferences: (state, action: PayloadAction<Partial<ThemeState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      state.theme = themes[state.mode];
    },
    resetTheme: (state) => {
      state.theme = themes[state.mode];
    },
  },
});

export const {
  setThemeMode,
  setCustomTheme,
  applyCustomTheme,
  updateThemePreferences,
  toggleTheme,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;
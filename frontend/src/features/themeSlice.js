import { createSlice } from '@reduxjs/toolkit';

const THEMES = ['dark', 'light'];

const THEME_LABELS = {
  dark:  '🌙 Dark',
  light: '☀️ Light',
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('bc-theme', theme);
  
  const favicon = document.getElementById('app-favicon');
  if (favicon) {
    favicon.href = theme === 'light' ? '/favicon-light.svg?v=5' : '/favicon-dark.svg?v=5';
  }
};

const raw    = localStorage.getItem('bc-theme') || 'dark';
const stored = THEMES.includes(raw) ? raw : 'dark';
// Apply immediately on load (before React renders)
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', stored);
  const favicon = document.getElementById('app-favicon');
  if (favicon) {
    favicon.href = stored === 'light' ? '/favicon-light.svg?v=5' : '/favicon-dark.svg?v=5';
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    current: stored,
    label: THEME_LABELS[stored] || THEME_LABELS.dark,
    available: THEMES,
  },
  reducers: {
    setTheme: (state, action) => {
      const theme = action.payload;
      state.current = theme;
      state.label = THEME_LABELS[theme];
      applyTheme(theme);
    },
    cycleTheme: (state) => {
      const nextIndex = (THEMES.indexOf(state.current) + 1) % THEMES.length;
      const next = THEMES[nextIndex];
      state.current = next;
      state.label = THEME_LABELS[next];
      applyTheme(next);
    },
  },
});

export const { setTheme, cycleTheme } = themeSlice.actions;
export const selectTheme = (state) => state.theme.current;
export const selectThemeLabel = (state) => state.theme.label;
export default themeSlice.reducer;

import { useState, useEffect } from 'react';

// useAuthTheme — loads + persists the auth theme (dark | light) via localStorage.
// Returns [theme, toggleTheme, isLight].
const useAuthTheme = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('auth-theme') || 'dark';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('auth-theme', next);
  };

  return [theme, toggleTheme, theme === 'light'];
};

export default useAuthTheme;

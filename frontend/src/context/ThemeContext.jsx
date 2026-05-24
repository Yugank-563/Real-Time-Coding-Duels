import { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme, cycleTheme } from '../features/theme/themeSlice';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();

  const toggleTheme = () => {
    dispatch(cycleTheme());
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

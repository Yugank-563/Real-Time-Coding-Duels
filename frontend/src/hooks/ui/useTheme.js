import { useSelector, useDispatch } from 'react-redux';
import { selectTheme, cycleTheme } from '../../features/index';

export const useTheme = () => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();

  const toggleTheme = () => {
    dispatch(cycleTheme());
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
};

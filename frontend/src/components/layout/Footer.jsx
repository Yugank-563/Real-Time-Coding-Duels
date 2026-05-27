import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`w-full py-8 px-4 mt-auto border-t transition-colors duration-300 ${isDark
        ? 'bg-[#0D0F14]/60 border-slate-800 text-slate-400'
        : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center text-xs text-center font-medium">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className={`font-extrabold tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>
            BATTLECODE
          </span>
          <span className="opacity-60">| Compete, Collab & Conquer the Code</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

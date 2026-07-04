import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Bell, LogOut, Menu, X,
  Swords, Trophy, BookOpen, Home,
  User, Award
} from 'lucide-react';
import { useTheme, useInvitations } from '../../hooks/index';
import { selectUser, selectIsAuthenticated, logout } from '../../features/index';

const InvitationBadge = ({ count, isDark }) => {
  if (!count || count === 0) return null;
  
  return (
    <span className={`absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center rounded-full animate-pulse-slow shadow-sm ${
      isDark ? 'bg-[#00F5C4] text-[#0D0F14]' : 'bg-[#4F6EF7] text-white'
    }`}>
      {count > 9 ? '9+' : count}
    </span>
  );
};

// ── NAV_LINKS CONFIG ──
const NAV_LINKS = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Battles', path: '/battle/lobby', icon: Swords },

  { label: 'Problems', path: '/problems', icon: BookOpen },
  { label: 'Leaderboards', path: '/leaderboard', icon: Trophy },
];

// ── CUSTOM HEXAGON LOGO ICON (Using Auth Colors: #6C63FF Purple & #00F5C4 Electric Cyan/Mint) ──
const LogoIcon = ({ isDark }) => (
  <motion.div
    className="relative flex items-center justify-center w-10 h-10"
    whileHover={{ scale: 1.05, rotate: [0, -4, 4, 0] }}
    transition={{ duration: 0.4 }}
  >
    {/* SVG Hexagon Frame */}
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full"
      style={{
        filter: isDark
          ? 'drop-shadow(0 0 8px rgba(0, 245, 196, 0.45)) drop-shadow(0 0 2px rgba(108, 99, 255, 0.25))'
          : 'drop-shadow(0 2px 5px rgba(79, 110, 247, 0.15))'
      }}
    >
      <polygon
        points="50,5 93,30 93,80 50,95 7,80 7,30"
        fill="url(#logo-grad)"
        stroke={isDark ? '#00F5C4' : '#4F6EF7'}
        strokeWidth="5"
        className="transition-all duration-300"
      />
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? 'rgba(108, 99, 255, 0.25)' : 'rgba(79, 110, 247, 0.08)'} />
          <stop offset="100%" stopColor={isDark ? 'rgba(0, 245, 196, 0.25)' : 'rgba(79, 110, 247, 0.08)'} />
        </linearGradient>
      </defs>
    </svg>

    {/* Crossed Swords Inside */}
    <Swords
      className="relative z-10 w-5 h-5 transition-transform duration-300 hover:rotate-12"
      color={isDark ? '#00F5C4' : '#4F6EF7'}
      strokeWidth={2.2}
    />
  </motion.div>
);

const Navbar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Refs for click outside
  const profileRef = useRef(null);

  // Click Outside hooks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Invitations
  const { invitations } = useInvitations();
  const unreadCount = invitations?.length || 0;  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* ── HEADER NAVBAR CONTAINER ── */}
      <header
        className="fixed top-0 left-0 w-full h-16 z-50 transition-all duration-300 bg-base border-b border-border shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* ── LEFT: LOGO SECTION (Colors aligned with Auth) ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <LogoIcon isDark={isDark} />
            <span className={`text-xl font-extrabold tracking-wider bg-clip-text text-transparent transition-all duration-300 ${isDark
                ? 'bg-gradient-to-r from-white via-[#FAFAFD] to-[#00F5C4] hover:drop-shadow-[0_0_8px_rgba(0,245,196,0.4)]'
                : 'bg-gradient-to-r from-[#262626] to-[#4F6EF7]'
              }`}>
              BATTLECODE
            </span>
          </Link>

          {/* ── CENTER: DESKTOP NAVIGATION LINKS ── */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            {NAV_LINKS.map((link, idx) => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.label}
                  to={link.path}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => {
                    // Leaderboard is a public route, allow guests
                    if (!isAuthenticated && link.path !== '/leaderboard') {
                      e.preventDefault();
                      navigate('/login');
                    }
                  }}
                  className={`relative px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 ${isActive
                      ? isDark ? 'text-[#00F5C4]' : 'text-[#4F6EF7]'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {/* Animated Background Hover pill (Vercel-style) */}
                  {hoveredIndex === idx && (
                    <motion.div
                      layoutId="hover-pill"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.035)'
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <link.icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>

                  {/* Underline for Active state (Linear-style) */}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                      style={{
                        backgroundColor: isDark ? '#00F5C4' : '#4F6EF7',
                        boxShadow: isDark ? '0 0 8px #00F5C4' : 'none'
                      }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* ── RIGHT SIDE FEATURES ── */}
          <div className="flex items-center gap-4">

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors duration-200 ${isDark
                  ? 'border-[rgba(255,255,255,0.08)] bg-slate-900/50 hover:bg-slate-800 text-amber-400'
                  : 'border-[rgba(15,23,42,0.08)] bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Authenticated Controls */}
            {isAuthenticated ? (
              <>
                {/* Notification Bell (Links to Invitations Page) */}
                <Link to="/invitations" className="hidden lg:block relative">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-2 rounded-lg border transition-colors duration-200 ${isDark
                        ? 'border-[rgba(255,255,255,0.08)] bg-slate-900/50 hover:bg-slate-800 text-slate-300'
                        : 'border-[rgba(15,23,42,0.08)] bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                  >
                    <Bell className="w-4 h-4" />
                    <InvitationBadge count={unreadCount} isDark={isDark} />
                  </motion.div>
                </Link>

                {/* Profile Dropdown */}
                <div className="hidden lg:block relative" ref={profileRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center justify-center p-1 rounded-full border transition-all ${isDark
                        ? 'border-[rgba(255,255,255,0.08)] bg-slate-900/40 hover:bg-slate-900/80'
                        : 'border-[rgba(15,23,42,0.08)] bg-slate-50 hover:bg-slate-100'
                      }`}
                  >
                    {/* Glowing Avatar */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                         style={{ backgroundColor: isDark ? '#00F5C4' : '#4F6EF7', color: isDark ? '#0D0F14' : '#FFFFFF' }}>
                      {user?.username?.slice(0, 2).toUpperCase() || 'YK'}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-xl z-50 ${isDark
                            ? 'bg-[#161A24] border-[rgba(255,255,255,0.08)] text-slate-200 shadow-black'
                            : 'bg-white border-[rgba(15,23,42,0.08)] text-slate-800 shadow-slate-200'
                          }`}
                      >
                        {/* Dropdown Header */}
                        <div className="p-3 border-b mb-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
                          <span className="block text-xs font-bold text-text-primary">{user?.username || 'Competitive Gamer'}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{user?.email || 'email@example.com'}</span>
                          <div className="flex items-center gap-1.5 mt-2 bg-glass px-2.5 py-1 rounded-lg border border-border w-fit">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] font-extrabold text-amber-400">{user?.rating || 1247} Elo</span>
                          </div>
                        </div>

                        {/* Options */}
                        <button
                          onClick={() => { setProfileDropdownOpen(false); navigate(`/profile/${user?.username || 'me'}`); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${isDark ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>My Profile</span>
                        </button>

                        <div className="h-px my-1.5" style={{ backgroundColor: 'var(--border-subtle)' }} />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Unauthenticated Buttons
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${isDark
                        ? 'border-slate-800 bg-[#0D0F14]/60 text-[#00F5C4] hover:border-[#00F5C4]/50 hover:bg-[#00F5C4]/5 hover:shadow-[0_0_20px_rgba(0,245,196,0.12)]'
                        : 'border-slate-200 bg-white text-[#4F6EF7] hover:border-[#4F6EF7]/50 hover:bg-[#4F6EF7]/5 hover:shadow-sm'
                      }`}
                  >
                    Log In
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -0.5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${isDark
                        ? 'bg-[#00F5C4] text-[#0D0F14] hover:shadow-[#00F5C4]/25 shadow-[#00F5C4]/15 hover:brightness-105'
                        : 'bg-[#4F6EF7] text-white hover:shadow-[#4F6EF7]/25 shadow-[#4F6EF7]/15 hover:brightness-105'
                      }`}
                  >
                    Register
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-lg border transition-colors duration-200 ${isDark
                  ? 'border-[rgba(255,255,255,0.08)] bg-slate-900/50 hover:bg-slate-800 text-slate-300'
                  : 'border-[rgba(15,23,42,0.08)] bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
            >
              <Menu className="w-5 h-5" />
            </motion.button>

          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER SIDEBAR (SLIDING OUT) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark blur backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 w-80 h-full shadow-2xl z-50 lg:hidden flex flex-col p-6 bg-surface border-l border-border/40 text-text-primary"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div className="flex items-center gap-2">
                  <LogoIcon isDark={isDark} />
                  <span className="font-extrabold tracking-wider text-text-primary text-sm">BATTLECODE</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg border ${isDark ? 'border-[rgba(255,255,255,0.08)] hover:bg-slate-900' : 'border-[rgba(15,23,42,0.08)] hover:bg-slate-100'
                    }`}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Navigation Links inside drawer */}
              <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {NAV_LINKS.map(link => {
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink
                      key={link.label}
                      to={link.path}
                      onClick={(e) => {
                        if (!isAuthenticated && link.path !== '/leaderboard') {
                          e.preventDefault();
                          navigate('/login');
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                          ? isDark
                            ? 'bg-[#00F5C4]/10 border border-[#00F5C4]/30 text-[#00F5C4]'
                            : 'bg-[#4F6EF7]/10 border border-[#4F6EF7]/30 text-[#4F6EF7]'
                          : isDark
                            ? 'hover:bg-slate-900/60 border border-transparent text-slate-300'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                    >
                      <link.icon className="w-4.5 h-4.5" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
                
                {/* Mobile-only Profile Link */}
                {isAuthenticated && (
                  <NavLink
                    to={`/profile/${user?.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === `/profile/${user?.username}`
                        ? isDark
                          ? 'bg-[#00F5C4]/10 border border-[#00F5C4]/30 text-[#00F5C4]'
                          : 'bg-[#4F6EF7]/10 border border-[#4F6EF7]/30 text-[#4F6EF7]'
                        : isDark
                          ? 'hover:bg-slate-900/60 border border-transparent text-slate-300'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </NavLink>
                )}
              </nav>

              {/* Unauthenticated Bottom Actions inside Drawer */}
              {!isAuthenticated && (
                <div className="border-t pt-6 flex flex-col gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <Link to="/login" className="w-full">
                    <button className={`w-full py-3 rounded-xl text-sm font-bold uppercase border transition-all duration-300 ${isDark
                        ? 'border-slate-800 bg-[#0D0F14]/60 text-[#00F5C4] hover:border-[#00F5C4]/50 hover:bg-[#00F5C4]/5 hover:shadow-[0_0_20px_rgba(0,245,196,0.12)]'
                        : 'border-slate-200 bg-white text-[#4F6EF7] hover:border-[#4F6EF7]/50 hover:bg-[#4F6EF7]/5 hover:shadow-sm'
                      }`}>
                      Sign In
                    </button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <button className={`w-full py-3 rounded-xl text-sm font-extrabold uppercase shadow-lg transition-all ${isDark
                        ? 'bg-[#00F5C4] text-[#0D0F14] shadow-[#00F5C4]/15 hover:brightness-105'
                        : 'bg-[#4F6EF7] text-white shadow-[#4F6EF7]/15 hover:brightness-105'
                      }`}>
                      Register
                    </button>
                  </Link>
                </div>
              )}

              {/* Authenticated user footer inside Drawer */}
              {isAuthenticated && (
                <div className="border-t pt-6 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                  <Link 
                    to={`/profile/${user?.username}`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${isDark ? 'bg-gradient-to-tr from-[#6C63FF] to-[#00F5C4]' : 'bg-gradient-to-tr from-[#4F6EF7] to-[#2563EB]'
                      }`}>
                      {user?.username?.slice(0, 2).toUpperCase() || 'YK'}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-text-primary">{user?.username || 'Gamer'}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{user?.rating || 1247} Elo</span>
                    </div>
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

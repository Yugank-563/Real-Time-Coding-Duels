import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Menu, X, Trophy, BookOpen, Home, User } from 'lucide-react';

import Button from '../ui/Button';
import Logo from '../ui/Logo';

import { useInvitations } from '../../hooks/index';
import { selectUser, selectIsAuthenticated, logout } from '../../features/index';


const InvitationBadge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center rounded-full animate-pulse-slow shadow-sm bg-[#4F6EF7] text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
};

// ── NAV_LINKS CONFIG ──
const NAV_LINKS = [
  { label: 'Home', path: '/', icon: Home },

  { label: 'Problems', path: '/problems', icon: BookOpen },
  { label: 'Leaderboards', path: '/leaderboard', icon: Trophy },
];

const Navbar = () => {
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
  const unreadCount = invitations?.length || 0;
  // Close mobile drawer on route change
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* ── LEFT: LOGO ── */}
          <Link to={isAuthenticated ? '/battle' : '/'} className="flex items-center gap-3 group">
            <Logo />
            <span className={`text-xl font-extrabold tracking-wider bg-clip-text text-transparent transition-all duration-300 ${'bg-gradient-to-r from-white via-[#FAFAFD] to-[#00F5C4] hover:drop-shadow-[0_0_8px_rgba(0,245,196,0.4)]'
              }`}>
              CODUELO
            </span>
          </Link>

          {/* ── CENTER: DESKTOP NAVIGATION LINKS ── */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            {NAV_LINKS.map((link, idx) => {
              const actualPath = (link.label === 'Home' && isAuthenticated) ? '/battle' : link.path;
              // Check if the current path starts with actualPath (for sub-routes of battle), but exact for others
              const isActive = (actualPath === '/battle' && location.pathname.startsWith('/battle')) || location.pathname === actualPath;
              
              return (
                <NavLink
                  key={link.label}
                  to={actualPath}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => {
                    // Leaderboard is a public route, allow guests
                    const isPublicPath = ['/leaderboard', '/'].includes(link.path);
                    if (!isAuthenticated && !isPublicPath) {
                      e.preventDefault();
                      navigate('/login');
                    }
                  }}
                  className={`relative px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 ${isActive
                      ? 'text-[#00F5C4]'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {/* Animated Background Hover pill (Vercel-style) */}
                  {hoveredIndex === idx && (
                    <motion.div
                      layoutId="hover-pill"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)'
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
                        backgroundColor: '#00F5C4',
                        boxShadow: '0 0 8px #00F5C4'
                      }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* ── RIGHT SIDE FEATURES ── */}
          <div className="flex items-center gap-4">

            {/* Authenticated Controls */}
            {isAuthenticated ? (
              <>
                {/* Notification Bell (Links to Invitations Page) */}
                <Link to="/invitations" className="relative">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-2 rounded-lg border transition-colors duration-200 ${'border-[rgba(255,255,255,0.08)] bg-slate-900/50 hover:bg-slate-800 text-slate-300'
                      }`}
                  >
                    <Bell className="w-4 h-4" />
                    <InvitationBadge count={unreadCount} />
                  </motion.div>
                </Link>

                {/* Profile Dropdown */}
                <div className="hidden lg:block relative" ref={profileRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center justify-center p-1 rounded-full border transition-all ${'border-[rgba(255,255,255,0.08)] bg-slate-900/40 hover:bg-slate-900/80'
                      }`}
                  >
                    {/* User Icon Avatar */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                         style={{ backgroundColor: '#1E2535', color: '#00F5C4', border: '1.5px solid rgba(0,245,196,0.3)' }}>
                      <User className="w-4 h-4" />
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-56 z-50 rounded-2xl border backdrop-blur-2xl p-2 shadow-2xl ${'border-[#00F5C4]/20 bg-[#091423]/80 shadow-[#00F5C4]/15'
                          }`}
                      >
                        <div className="w-full h-full">
                          <div className="p-3 border-b mb-1.5 border-[var(--border-subtle)] flex flex-col gap-1">
                            <span className="text-sm font-bold tracking-wider text-text-primary capitalize font-sora">
                              {user?.name || user?.username || 'User'}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            onClick={() => { setProfileDropdownOpen(false); navigate(`/profile/${user?.username || 'me'}`); }}
                            className={`w-full !justify-start px-3 py-2.5 text-xs font-medium !normal-case transition-colors ${'hover:bg-[#00F5C4]/10 text-slate-200 hover:text-[#00F5C4]'
                              }`}
                          >
                            <User className="w-4 h-4 mr-1 opacity-70" />
                            <span>My Profile</span>
                          </Button>

                          <div className="h-px my-1.5" style={{ backgroundColor: 'var(--border-subtle)' }} />

                          <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className={`w-full !justify-start px-3 py-2.5 text-xs font-semibold !normal-case transition-colors ${'text-red-400 hover:bg-red-500/10 hover:text-red-400'
                              }`}
                          >
                            <LogOut className="w-4 h-4 mr-1 opacity-70" />
                            <span>Sign Out</span>
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-lg border transition-colors duration-200 ${'border-[rgba(255,255,255,0.08)] bg-slate-900/50 hover:bg-slate-800 text-slate-300'
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
                  <Logo />
                  <span className="font-extrabold tracking-wider text-text-primary text-sm">CODUELO</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg border ${'border-[rgba(255,255,255,0.08)] hover:bg-slate-900'
                    }`}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Navigation Links inside drawer */}
              <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {NAV_LINKS.map(link => {
                  const actualPath = (link.label === 'Home' && isAuthenticated) ? '/battle' : link.path;
                  const isActive = (actualPath === '/battle' && location.pathname.startsWith('/battle')) || location.pathname === actualPath;
                  
                  return (
                    <NavLink
                      key={link.label}
                      to={actualPath}
                      onClick={(e) => {
                        const isPublicPath = ['/leaderboard', '/'].includes(link.path);
                        if (!isAuthenticated && !isPublicPath) {
                          e.preventDefault();
                          navigate('/login');
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                          ? 'bg-[#00F5C4]/10 border border-[#00F5C4]/30 text-[#00F5C4]'
                          : 'hover:bg-slate-900/60 border border-transparent text-slate-300'
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
                        ? 'bg-[#00F5C4]/10 border border-[#00F5C4]/30 text-[#00F5C4]'
                        : 'hover:bg-slate-900/60 border border-transparent text-slate-300'
                      }`}
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </NavLink>
                )}
              </nav>

              {/* Unauthenticated Bottom Actions inside Drawer */}
              {!isAuthenticated && (
                <div className="border-t pt-6 flex flex-col gap-3 border-[var(--border-subtle)]">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" size="full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button variant="primary" size="full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}

              {/* Authenticated user footer inside Drawer */}
              {isAuthenticated && (
                <div className="border-t pt-6 flex items-center justify-between border-[var(--border-subtle)]">
                  <Link 
                    to={`/profile/${user?.username}`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: '#1E2535', color: '#00F5C4', border: '1.5px solid rgba(0,245,196,0.3)' }}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-text-primary capitalize font-sora">{user?.name || user?.username || 'User'}</span>
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

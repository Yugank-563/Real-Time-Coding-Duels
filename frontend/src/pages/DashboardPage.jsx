import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/index';
import { useToast, useDocumentTitle } from '../hooks/index';

// ── Animation variants ──
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.35 } },
};

// ── Stats data ──
const STATS = [
  { label: 'ELO Rating', value: '1,247', delta: '+23', icon: '⭐', accent: 'var(--accent-primary)', bgGlow: 'rgba(139, 92, 246, 0.15)' },
  { label: 'Win Rate', value: '63.4%', delta: '+2%', icon: '🏆', accent: 'var(--accent-emerald)', bgGlow: 'rgba(16, 185, 129, 0.15)' },
  { label: 'Problems Solved', value: '142', delta: '+5', icon: '🧩', accent: 'var(--accent-blue)', bgGlow: 'rgba(59, 130, 246, 0.15)' },
  { label: 'Battle Streak', value: '7 days', delta: 'Active', icon: '🔥', accent: 'var(--accent-amber)', bgGlow: 'rgba(245, 158, 11, 0.15)' },
];

// ── Showcase Marquee Matches ──
const FEATURED_ARENAS = [
  { title: "Grandmaster 1v1", badge: "HARD", lang: "C++", status: "Spectating: 194", p1: "@vivek", p2: "@yugank", elo1: "2341", elo2: "1247", gradient: "from-purple-500/20 via-blue-500/10 to-transparent", active: true },
  { title: "Blind Code Clash", badge: "EXTREME", lang: "Python", status: "Starting soon", p1: "@binary_boss", p2: "@zero_one", elo1: "2100", elo2: "1980", gradient: "from-red-500/20 via-orange-500/10 to-transparent", active: false },
  { title: "DP Speedrun Sprint", badge: "MEDIUM", lang: "JavaScript", status: "In Progress", p1: "@rahul", p2: "@priya", elo1: "1198", elo2: "1156", gradient: "from-emerald-500/20 via-teal-500/10 to-transparent", active: true },
  { title: "Recursion Deathmatch", badge: "HARD", lang: "Java", status: "Match Point", p1: "@alex", p2: "@sara", elo1: "1850", elo2: "1820", gradient: "from-blue-500/20 via-cyan-500/10 to-transparent", active: true },
  { title: "Greedy Bitwise Duel", badge: "EASY", lang: "Go", status: "Waiting...", p1: "@coderX", p2: "@algo_king", elo1: "1098", elo2: "1105", gradient: "from-amber-500/20 via-yellow-500/10 to-transparent", active: false },
];

// ── Lobby Feed ──
const LOBBIES = [
  { id: '1', title: '1v1 Ranked Duel', difficulty: 'Medium', lang: 'C++', elo: '1200–1400', users: 1, status: 'live' },
  { id: '2', title: 'Blind Coding Battle', difficulty: 'Hard', lang: 'Python', elo: 'Any', users: 0, status: 'open' },
  { id: '3', title: 'DP Sprint Challenge', difficulty: 'Medium', lang: 'JavaScript', elo: '1000–1300', users: 2, status: 'full' },
];

const STATUS_CONFIG = {
  live: { dot: 'bg-emerald', badge: 'text-emerald border-emerald/20 bg-emerald/10', label: 'LIVE MATCH', action: '⚔️ Join Duel', actionClass: 'bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-white hover:shadow-glow-primary' },
  open: { dot: 'bg-warning', badge: 'text-warning border-warning/20 bg-warning/10', label: 'OPEN LOBBY', action: '👥 Enter Lobby', actionClass: 'bg-warning/20 text-warning border-warning/30 hover:bg-warning hover:text-white hover:shadow-glow-blue' },
  full: { dot: 'bg-danger', badge: 'text-danger border-danger/20 bg-danger/10', label: 'SPECTATE', action: '👁️ Spectate', actionClass: 'bg-danger/20 text-danger border-danger/30 hover:bg-danger hover:text-white' },
};

const HISTORY = [
  { result: 'W', opponent: '@rahul', elo: '+18 ELO', time: '2h ago', problem: 'Two Sum' },
  { result: 'L', opponent: '@priya', elo: '-12 ELO', time: '5h ago', problem: 'LRU Cache' },
  { result: 'W', opponent: '@dev', elo: '+21 ELO', time: '1d ago', problem: 'Merge Intervals' },
  { result: 'W', opponent: '@ankit', elo: '+15 ELO', time: '2d ago', problem: 'House Robber' },
];

const TOP_USERS = [
  { rank: '🥇', name: '@vivek', elo: 2341, delta: '+47', isMe: false, solved: 842 },
  { rank: '🥈', name: '@yugank', elo: 1247, delta: '+23', isMe: true, solved: 142 },
  { rank: '🥉', name: '@rahul', elo: 1198, delta: '+11', isMe: false, solved: 310 },
  { rank: '4', name: '@priya', elo: 1156, delta: '-8', isMe: false, solved: 298 },
  { rank: '5', name: '@ankit', elo: 1098, delta: '+19', isMe: false, solved: 184 },
];

// ── StatsCard ──
const StatsCard = ({ stat }) => (
  <motion.div
    variants={item}
    whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.2 } }}
    className="relative overflow-hidden bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between h-[120px] cursor-default group transition-all duration-300 hover:border-text-muted/40 hover:shadow-xl"
  >
    {/* Soft inner lighting */}
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
         style={{ background: stat.bgGlow }} />

    <div className="flex items-center justify-between relative z-10">
      <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{stat.label}</span>
      <span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{stat.icon}</span>
    </div>
    <div className="relative z-10 flex items-baseline justify-between mt-auto">
      <p className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">{stat.value}</p>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full font-mono bg-emerald/10 text-emerald border border-emerald/20">
        {stat.delta}
      </span>
    </div>
  </motion.div>
);

// ── LobbyCard ──
const LobbyCard = ({ lobby }) => {
  const cfg = STATUS_CONFIG[lobby.status];
  return (
    <motion.div
      variants={item}
      layout
      whileHover={{ scale: 1.005, borderLeftColor: 'var(--accent-primary)' }}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-2xl bg-elevated border border-border border-l-4 border-l-border hover:border-l-primary/60 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${cfg.dot} ${lobby.status === 'live' ? 'animate-ping-slow' : ''}`} />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-text-primary text-sm tracking-tight">{lobby.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border border-border bg-surface text-text-secondary font-mono">{lobby.lang}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${cfg.badge} font-mono`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Difficulty: <span className={lobby.difficulty === 'Hard' ? 'text-danger font-bold' : 'text-warning font-bold'}>{lobby.difficulty}</span>
            {' · '}
            ELO Range: <span className="text-text-secondary">{lobby.elo}</span>
            {' · '}
            {lobby.status === 'full' ? 'Lobby occupied' : `${lobby.users} waiting`}
          </p>
        </div>
      </div>
      <button className={`shrink-0 text-xs font-bold px-4 py-2 rounded-xl border font-mono transition-all duration-300 ${cfg.actionClass}`}>
        {cfg.action}
      </button>
    </motion.div>
  );
};

// ── DashboardPage ──
const DashboardPage = () => {
  const user = useSelector(selectUser);
  const toast = useToast();
  const [searchFocused, setSearchFocused] = useState(false);
  useDocumentTitle('Dashboard');

  const handleFindBattle = () => toast.battle('Matchmaking active!', 'Searching for suitable opponent...');

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-10 w-full"
    >
      {/* ── Top Bar with Command Input ── */}
      <motion.div variants={item} className="flex items-center justify-between gap-4 flex-wrap">
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface border flex-1 max-w-lg transition-all duration-300 cursor-text ${
          searchFocused ? 'border-primary ring-2 ring-primary/20 bg-elevated' : 'border-border hover:border-text-muted/50'
        }`}>
          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search battles, active code rooms, leaderboards... (⌘K)"
            className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden sm:block text-[10px] text-text-muted border border-border bg-overlay rounded px-2 py-0.5 font-mono shrink-0">⌘K</kbd>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
          <span className="text-xs font-mono font-bold text-text-secondary">1,402 Active Coders</span>
        </div>
      </motion.div>

      {/* ── Premium Hero Dashboard Card ── */}
      <motion.div variants={item}>
        <div className="relative rounded-3xl overflow-hidden border border-border bg-surface p-8 md:p-10 shadow-2xl">

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping-slow" />
                Live Ranked matches
              </span>
              <span className="text-xs font-mono text-text-muted">Season 4 Active</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary leading-tight tracking-tight">
              Scale Your Algorithmic <br className="hidden md:inline" />
              <span className="text-gradient-primary">Dominance in Real-Time</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Engage in head-to-head live battles, track ELO, verify code, and dominate multiplayer leaderboards with Monaco-powered collaboration.
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              <button
                onClick={handleFindBattle}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-blue text-white text-sm font-bold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-glow-primary duration-300 font-mono"
              >
                ⚔️ Find 1v1 Battle
              </button>

            </div>
          </div>
        </div>
      </motion.div>

      {/* ── MagicUI Infinite Marquee Section (Stunning Card Banner) ── */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">🔥 FEATURED HIGH-ELO DUELS</h3>
          <span className="text-[10px] text-text-muted font-mono">Auto-refreshes live</span>
        </div>
        <div 
          className="relative w-full overflow-hidden py-2"
          style={{
            maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)'
          }}
        >
          {/* Marquee Track */}
          <div className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]">
            {/* Render items twice to build seamless loop */}
            {[...FEATURED_ARENAS, ...FEATURED_ARENAS].map((arena, i) => (
              <div
                key={i}
                className="w-[280px] shrink-0 rounded-2xl bg-surface border border-border p-4 relative overflow-hidden group hover:border-primary/50 transition-all duration-300 cursor-pointer"
              >
                {/* Visual Accent Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${arena.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="absolute top-0 right-0 w-2 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-overlay border border-border font-mono text-text-secondary">
                      {arena.lang}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${arena.active ? 'bg-emerald animate-pulse' : 'bg-text-muted'}`} />
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-sm text-text-primary tracking-tight truncate">{arena.title}</h4>
                    <p className="text-[11px] text-text-muted font-mono">{arena.status}</p>
                  </div>

                  {/* User ELO duel bar */}
                  <div className="bg-overlay/40 rounded-xl p-2 border border-border/50 flex flex-col gap-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary font-semibold truncate">{arena.p1}</span>
                      <span className="text-emerald font-bold text-[10px]">{arena.elo1}</span>
                    </div>
                    <div className="text-center text-[9px] text-text-muted font-bold">VS</div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary font-semibold truncate">{arena.p2}</span>
                      <span className="text-emerald font-bold text-[10px]">{arena.elo2}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => <StatsCard key={s.label} stat={s} />)}
      </motion.div>

      {/* ── Main Dashboard Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER — Lobby Feed & Activity */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          
          {/* LOBBIES PANEL */}
          <div className="bg-surface border border-border rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
            {/* Subtle glow header background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue to-transparent opacity-80" />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-text-primary text-base tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
                  Active Battle Lobbies
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Find an open match or spectate standard clashes</p>
              </div>
              <span className="text-xs font-bold font-mono text-text-secondary bg-overlay border border-border px-2.5 py-1 rounded-full">
                48 matches in queue
              </span>
            </div>

            <motion.div variants={container} className="space-y-3">
              {LOBBIES.map((lobby) => <LobbyCard key={lobby.id} lobby={lobby} />)}
            </motion.div>

            <button className="w-full py-3 rounded-2xl border border-dashed border-border hover:border-primary/50 text-text-muted hover:text-primary transition-all duration-300 font-mono text-xs font-bold">
              + HOST NEW MULTIPLAYER BATTLE ROOM
            </button>
          </div>

          {/* ACTIVITY HEATMAP */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-extrabold text-text-primary text-sm tracking-tight">📅 Battle Activity Map</h2>
                <p className="text-xs text-text-muted mt-0.5">Tracking your algorithmic streaks and duels</p>
              </div>
              <span className="text-xs font-mono font-bold text-text-secondary">Last 3 Months</span>
            </div>
            
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
              {Array.from({ length: 84 }).map((_, i) => {
                const level = Math.floor(Math.random() * 4);
                const colors = ['bg-overlay border-transparent', 'bg-primary/20 border-primary/10', 'bg-primary/50 border-primary/20', 'bg-primary border-primary/30 shadow-sm shadow-primary/20'];
                return (
                  <div
                    key={i}
                    title={`${level} battles fought`}
                    className={`aspect-square rounded-md border ${colors[level]} hover:ring-2 hover:ring-primary/40 cursor-pointer transition-all duration-200`}
                  />
                );
              })}
            </div>
            
            <div className="flex items-center justify-between mt-4 border-t border-border/50 pt-3">
              <span className="text-[10px] font-mono text-text-muted">Solved: 82 battles</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted">Less</span>
                {['bg-overlay', 'bg-primary/20', 'bg-primary/50', 'bg-primary'].map((o, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${o}`} />
                ))}
                <span className="text-[10px] text-text-muted">More</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE — Widgets */}
        <motion.div variants={container} className="space-y-6">
          
          {/* RECENT BATTLES FEED */}
          <motion.div variants={item} className="bg-surface border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-extrabold text-text-primary text-sm tracking-tight">Recent Battles</h2>
                <p className="text-[10px] text-text-muted">Active stats for past 7 days</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald">
                3W 1L
              </span>
            </div>
            
            <div className="space-y-3">
              {HISTORY.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-elevated transition-colors border border-transparent hover:border-border/30">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      h.result === 'W' ? 'bg-emerald/10 border border-emerald/20 text-emerald' : 'bg-danger/10 border border-danger/20 text-danger'
                    }`}>
                      {h.result === 'W' ? 'WIN' : 'LOSS'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-text-primary font-mono">{h.opponent}</p>
                      <p className="text-[9px] text-text-muted font-mono">{h.problem}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-extrabold block ${h.elo.startsWith('+') ? 'text-emerald' : 'text-danger'}`}>
                      {h.elo}
                    </span>
                    <span className="text-[9px] text-text-muted font-mono">{h.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* DAILY CHALLENGE */}
          <motion.div variants={item} className="bg-surface border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-warning/10 to-transparent filter blur-md pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-text-primary text-sm tracking-tight flex items-center gap-1.5">
                <span>🗓️</span> Daily Challenge
              </h2>
              <span className="text-[9px] px-2 py-0.5 rounded bg-warning/10 text-warning font-bold border border-warning/20 font-mono animate-pulse">
                DOUBLE ELO
              </span>
            </div>
            
            <p className="text-sm font-extrabold text-text-primary font-sans leading-tight">Two Sum II — Sorted Array</p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-4 h-1.5 rounded-full ${i <= 3 ? 'bg-warning' : 'bg-border'}`} />
                ))}
              </div>
              <span className="text-[10px] text-warning font-extrabold font-mono">Medium · Arrays</span>
            </div>
            
            <div className="mt-3.5 space-y-1 font-mono text-[10px] text-text-muted">
              <p>⏰ Expiry: <span className="text-text-secondary font-bold">14h 22m 11s</span></p>
              <p>👥 Submissions: <span className="text-text-secondary font-bold">342 active today</span></p>
            </div>
            
            <button className="w-full mt-4 py-2.5 rounded-xl bg-warning/10 border border-warning/20 hover:bg-warning hover:text-black font-mono text-xs font-bold text-warning transition-all duration-300">
              🚀 Start Coding Challenge
            </button>
          </motion.div>

          {/* TOP USERS LEADERBOARD */}
          <motion.div variants={item} className="bg-surface border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-extrabold text-text-primary text-sm tracking-tight">🏆 Arena Top 5</h2>
                <p className="text-[10px] text-text-muted">Real-time worldwide rank</p>
              </div>
              <button className="text-xs font-mono font-bold text-primary hover:underline">Full Board →</button>
            </div>
            
            <div className="space-y-2">
              {TOP_USERS.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-2 px-3 rounded-2xl border transition-all duration-300 ${
                    p.isMe
                      ? 'bg-primary/10 border-primary/30 shadow-sm'
                      : 'border-transparent hover:bg-elevated hover:border-border/30'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm w-5 text-center font-mono">{p.rank}</span>
                    <div className="overflow-hidden">
                      <span className={`text-xs font-mono font-bold truncate block ${p.isMe ? 'text-primary' : 'text-text-secondary'}`}>
                        {p.name}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono block leading-none">{p.solved} solved</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-text-primary font-mono">{p.elo} ELO</p>
                    <p className={`text-[9px] font-mono font-bold ${p.delta.startsWith('+') ? 'text-emerald' : 'text-danger'}`}>
                      {p.delta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default DashboardPage;

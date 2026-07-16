import {  useEffect, useState  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInitials } from '../../utils/index';

const BattleCountdown = ({ myUser, opponent, problemTitle, onComplete }) => {
  const [count, setCount] = useState(3);
  const [showGo, setShowGo] = useState(false);
  const [phase, setPhase] = useState('matchup'); // 'matchup' | 'problem' | 'countdown'

  useEffect(() => {
    // Phase 1: Show matchup cards for 3 seconds, then reveal problem
    const matchupTimer = setTimeout(() => {
      setPhase('problem');
    }, 2500);

    // Phase 2: Show problem title for 2 seconds, then trigger ticking countdown
    const problemTimer = setTimeout(() => {
      setPhase('countdown');
    }, 4500);

    return () => {
      clearTimeout(matchupTimer);
      clearTimeout(problemTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;

    if (count > 0) {
      const counter = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(counter);
    } else {
      setShowGo(true);
      const goTimer = setTimeout(() => {
        onComplete(); // Activate workspace
      }, 1000);
      return () => clearTimeout(goTimer);
    }
  }, [count, phase, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      
      {/* Background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-b from-[var(--accent-blue)]/5 to-transparent blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* ── PHASE 1: MATCHUP PRESENTATION ── */}
        {phase === 'matchup' && (
          <motion.div 
            key="matchup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-4xl w-full px-6 relative z-10"
          >
            {/* Left player card (You) */}
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              whileHover={{ scale: 1.02 }}
              className={`w-full md:w-80 h-56 rounded-[2rem] border transition-all duration-300 relative overflow-hidden backdrop-blur-md flex flex-col items-center justify-center gap-3 group bg-surface/30 border-border/40 hover:border-accent-primary/50 hover:bg-surface/50 hover:shadow-[0_0_40px_rgba(0,245,196,0.1)]`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/0 via-transparent to-transparent group-hover:from-accent-primary/10 transition-colors duration-500 pointer-events-none" />
              <div className="relative">
                <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-20 h-20 bg-elevated border-[3px] border-border rounded-full flex items-center justify-center relative z-10 shadow-lg transition-colors border-accent-primary">
                  <span className="text-2xl font-black text-text-primary tracking-tighter">
                    {getInitials(myUser?.name, myUser?.username) || 'ME'}
                  </span>
                </div>
              </div>
              <div className="text-center relative z-10 mt-1">
                <h2 className="text-lg font-black text-text-primary tracking-tight max-w-[180px] truncate">@{myUser?.username || 'You'}</h2>
                <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">ELO {myUser?.rating || myUser?.elo || 1200}</p>
              </div>
            </motion.div>

            {/* VS BADGE */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [-10, 0] }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-full bg-surface border-4 border-base flex items-center justify-center z-20 shadow-xl relative"
            >
              <div className="absolute inset-0 rounded-full border border-border/50"></div>
              <span className="text-lg font-black italic text-text-muted pr-0.5">VS</span>
            </motion.div>

            {/* Right player card (Opponent) */}
            <motion.div 
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={{ scale: 1.02 }}
              className={`w-full md:w-80 h-56 rounded-[2rem] border transition-all duration-300 relative overflow-hidden backdrop-blur-md flex flex-col items-center justify-center gap-3 group bg-surface/30 border-border/40 hover:border-pink-500/50 hover:bg-surface/50 hover:shadow-[0_0_40px_rgba(236,72,153,0.1)]`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-transparent to-transparent group-hover:from-pink-500/10 transition-colors duration-500 pointer-events-none" />
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-20 h-20 bg-elevated border-[3px] rounded-full flex items-center justify-center relative z-10 shadow-lg transition-colors border-pink-500">
                  <span className="text-2xl font-black text-text-primary tracking-tighter">
                    {getInitials(opponent?.name, opponent?.username) || 'OP'}
                  </span>
                </div>
              </div>
              <div className="text-center relative z-10 mt-1">
                <h2 className="text-lg font-black text-text-primary tracking-tight max-w-[180px] truncate">@{opponent?.username || 'Opponent'}</h2>
                <p className="text-[10px] text-pink-500/80 font-bold tracking-widest uppercase mt-0.5">ELO {opponent?.rating || opponent?.elo || 1200}</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── PHASE 2: PROBLEM REVEAL ── */}
        {phase === 'problem' && (
          <motion.div 
            key="problem"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-lg relative z-10 px-6"
          >
            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 px-3 py-1 rounded-full border border-[var(--accent-blue)]/20">
              Selected Challenge
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-4">
              "{problemTitle || 'Loading Challenge'}"
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Read the description constraints carefully. Compile examples rapidly. Solve first to dominate ELO points.
            </p>
          </motion.div>
        )}

        {/* ── PHASE 3: COUNTDOWN ── */}
        {phase === 'countdown' && (
          <motion.div 
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center relative z-10"
          >
            <AnimatePresence mode="wait">
              {!showGo ? (
                <motion.h1
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-8xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_24px_rgba(255,255,255,0.2)]"
                >
                  {count}
                </motion.h1>
              ) : (
                <motion.h1
                  key="go"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-primary)] font-mono tracking-tight drop-shadow-[0_0_40px_rgba(0,229,255,0.4)]"
                >
                  GO!
                </motion.h1>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default BattleCountdown;

import {  useEffect, useState  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-[#0B0F1A] flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      
      {/* Background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-b from-[#00E5FF]/5 to-transparent blur-[120px] pointer-events-none" />

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
            {/* Left player card */}
            <motion.div 
              initial={{ x: -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="bg-[#141B2D] border-l-4 border-l-[#00E5FF] border border-[#1E2D40] rounded-2xl p-6 w-[280px] text-center space-y-3 shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#00F5C4] mx-auto flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {myUser?.username?.slice(0, 2).toUpperCase() || 'ME'}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base truncate">@{myUser?.username || 'You'}</h3>
                <p className="text-xs text-[#7A9AB8] mt-1 font-mono">Elo: {myUser?.elo || 1200}</p>
                <p className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider mt-1">Level {myUser?.level || 1}</p>
              </div>
            </motion.div>

            {/* Central VS sword icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: [1, 1.2, 1], rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-16 h-16 rounded-full bg-[#0D1520] border border-[#1E2D40] flex items-center justify-center text-[#00E5FF] relative shadow-[0_0_24px_rgba(0,229,255,0.2)]"
            >
              <Swords className="w-6 h-6 animate-pulse" />
            </motion.div>

            {/* Right player card */}
            <motion.div 
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="bg-[#141B2D] border-r-4 border-r-[#7C3AED] border border-[#1E2D40] rounded-2xl p-6 w-[280px] text-center space-y-3 shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF00E5] to-[#7C3AED] mx-auto flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {opponent?.username?.slice(0, 2).toUpperCase() || 'OP'}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base truncate">@{opponent?.username || 'Opponent'}</h3>
                <p className="text-xs text-[#7A9AB8] mt-1 font-mono">Elo: {opponent?.elo || 1200}</p>
                <p className="text-[10px] text-[#7C3AED] font-bold uppercase tracking-wider mt-1">Level {opponent?.level || 1}</p>
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
            <span className="text-[10px] uppercase font-black tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1 rounded-full border border-[#00E5FF]/20">
              Selected Challenge
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-4">
              "{problemTitle || 'Loading Challenge'}"
            </h2>
            <p className="text-xs text-[#7A9AB8] leading-relaxed">
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
                  className="text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] font-mono tracking-tight drop-shadow-[0_0_40px_rgba(0,229,255,0.4)]"
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, ShieldAlert, Award, Star, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

const VerdictDisplay = ({ battleId, myUserId, eloDetails, onProceed }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('verdict'); // 'verdict' | 'progression'

  // Calculations
  const isWinner = eloDetails?.userId === myUserId && eloDetails?.eloChange > 0;
  const isDraw = eloDetails?.eloChange === 0;

  // Progression counters
  const [currentElo, setCurrentElo] = useState(eloDetails?.oldElo || 1200);
  const [xpProgress, setXpProgress] = useState(0);

  useEffect(() => {
    if (phase !== 'progression') return;

    // 1. Elo increment counting animation
    const eloTarget = eloDetails?.newElo || 1200;
    const duration = 1500; // ms
    const incrementTime = 30; // ms
    const totalSteps = duration / incrementTime;
    const eloStep = (eloTarget - currentElo) / totalSteps;

    let step = 0;
    const eloTimer = setInterval(() => {
      step++;
      setCurrentElo((prev) => {
        const next = prev + eloStep;
        if (step >= totalSteps) {
          clearInterval(eloTimer);
          return eloTarget;
        }
        return Math.round(next);
      });
    }, incrementTime);

    // 2. XP bar filling animation
    const xpEarned = eloDetails?.xpEarned || 15;
    const targetXpProgress = Math.min(100, (xpEarned / 100) * 100); // normalized
    const xpTimer = setTimeout(() => {
      setXpProgress(targetXpProgress);
    }, 400);

    return () => {
      clearInterval(eloTimer);
      clearTimeout(xpTimer);
    };
  }, [phase, eloDetails]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden font-sans select-none p-4">
      
      {/* ──── DOT GRID BACKGROUND ──── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-b from-[#00E5FF]/5 to-transparent blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* ── PHASE 1: VERDICT & CONFETTI OUTCOME ── */}
        {phase === 'verdict' && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="max-w-md w-full bg-[#141B2D] border border-[#1E2D40] rounded-3xl p-8 space-y-6 text-center shadow-2xl relative"
          >
            {/* Outcomes Graphics */}
            {isWinner ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_32px_rgba(34,197,94,0.2)] animate-bounce" style={{ animationDuration: '2.5s' }}>
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-emerald-400 tracking-tight">🏆 DUEL VICTORY!</h1>
                  <p className="text-xs text-[#7A9AB8] mt-1.5 leading-relaxed">You compiled, verified, and dominated the coding challenge successfully before the opponent.</p>
                </div>
              </div>
            ) : isDraw ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center shadow-[0_0_32px_rgba(124,58,237,0.2)]">
                  <Award className="w-10 h-10 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-purple-400 tracking-tight">🤝 DRAW CLASH</h1>
                  <p className="text-xs text-[#7A9AB8] mt-1.5 leading-relaxed">Both developers matched speed constraints equally. The arena ELO rating points remain steady.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center shadow-[0_0_32px_rgba(239,68,68,0.2)]">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-red-400 tracking-tight">😤 DEFEATED</h1>
                  <p className="text-xs text-[#7A9AB8] mt-1.5 leading-relaxed">The opponent compiled and passed all test cases first. Review the summary editorial code to refactor strategies.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setPhase('progression')}
              className="w-full mt-6 py-3.5 rounded-xl bg-[#00E5FF] hover:brightness-110 text-[#0B0F1A] text-xs font-black uppercase font-mono transition-all duration-300 tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              Reveal ELO & XP Rewards →
            </button>
          </motion.div>
        )}

        {/* ── PHASE 2: ELO PROGRESSION & XP COUNTERS ── */}
        {phase === 'progression' && (
          <motion.div
            key="progression"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="max-w-md w-full bg-[#141B2D] border border-[#1E2D40] rounded-3xl p-8 space-y-6 text-center shadow-2xl relative"
          >
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#7A9AB8]">Combat Arena Report</h2>
            
            {/* ELO Rating Progression Slider */}
            <div className="bg-[#0D1520] border border-[#1E2D40] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-2 right-4 text-[10px] text-[#7A9AB8] font-mono">Season 4</div>
              
              <div className="flex items-center justify-center gap-8 mt-2">
                <div className="text-center">
                  <span className="text-[10px] text-[#7A9AB8] block uppercase">Rating ELO</span>
                  <div className="text-3xl font-black text-white font-mono mt-1">{currentElo}</div>
                </div>
                
                <div className="text-slate-500">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-[#7A9AB8] block uppercase">ELO Shift</span>
                  <div className={`text-2xl font-black font-mono mt-1.5 flex items-center justify-center gap-0.5 ${
                    isWinner ? 'text-emerald-400' : isDraw ? 'text-purple-400' : 'text-red-400'
                  }`}>
                    {isWinner ? (
                      <><ArrowUpRight className="w-4 h-4" /> +{eloDetails?.eloChange}</>
                    ) : isDraw ? (
                      <>±0</>
                    ) : (
                      <><ArrowDownRight className="w-4 h-4" /> {eloDetails?.eloChange}</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* XP Progression Bar */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#7A9AB8] font-mono px-1">
                <span>Experience Points</span>
                <span className="text-[#00E5FF]">+{eloDetails?.xpEarned || 15} XP</span>
              </div>
              <div className="w-full h-2.5 bg-[#0D1520] rounded-full overflow-hidden border border-[#1E2D40] relative">
                {/* Filling animator */}
                <div 
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            {/* Level up overlay */}
            {eloDetails?.isLevelUp && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                className="p-3 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-xl text-center flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                  🎉 LEVEL UP! Promoted to Tier {eloDetails?.level}
                </span>
              </motion.div>
            )}

            {/* Proceeds buttons */}
            <button
              onClick={() => navigate(`/battle/${battleId}/summary`)}
              className="w-full mt-6 py-3.5 rounded-xl bg-[#0D1520] border border-[#1E2D40] hover:border-[#00E5FF] text-[#00E5FF] hover:text-[#0B0F1A] hover:bg-[#00E5FF] text-xs font-black uppercase font-mono transition-all duration-300 tracking-wider"
            >
              Proceed to Battle Summary →
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default VerdictDisplay;

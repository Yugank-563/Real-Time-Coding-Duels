import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, ShieldAlert, Award, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import Button from '../ui/Button';

const VerdictDisplay = ({ battleId, myUserId, winnerId, eloDetails }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('verdict'); // 'verdict' | 'progression'
  
  const mode = useSelector(state => state.battle.mode);

  // Determine outcome from winnerId (server-authoritative)
  // winnerId === null  → Draw (both timed out with equal progress)
  // winnerId === myUserId → Win
  // winnerId === other  → Loss
  const isDraw = winnerId === null || winnerId === undefined;
  const isWinner = !isDraw && (winnerId === myUserId);

  // Progression counters — safe even when eloDetails is null (draw with no ELO calc)
  const [currentElo, setCurrentElo] = useState(eloDetails?.oldElo || 1200);

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

    return () => {
      clearInterval(eloTimer);
    };
  }, [phase, eloDetails]);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-base)]/95 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden font-sans select-none p-4">
      
      {/* ──── DOT GRID BACKGROUND ──── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-b from-[var(--accent-blue)]/5 to-transparent blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* ── PHASE 1: VERDICT & CONFETTI OUTCOME ── */}
        {phase === 'verdict' && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 space-y-6 text-center shadow-2xl relative"
          >
            {/* Outcomes Graphics */}
            {isWinner ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_32px_rgba(34,197,94,0.2)] animate-bounce" style={{ animationDuration: '2.5s' }}>
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-emerald-400 tracking-tight">🏆 DUEL VICTORY!</h1>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">You compiled, verified, and dominated the coding challenge successfully before the opponent.</p>
                </div>
              </div>
            ) : isDraw ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center shadow-[0_0_32px_rgba(124,58,237,0.2)]">
                  <Award className="w-10 h-10 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-purple-400 tracking-tight">🤝 DRAW CLASH</h1>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">Both developers matched speed constraints equally. The arena ELO rating points remain steady.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center shadow-[0_0_32px_rgba(239,68,68,0.2)]">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-red-400 tracking-tight">😤 DEFEATED</h1>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">The opponent compiled and passed all test cases first. Review the summary editorial code to refactor strategies.</p>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full mt-6 text-[var(--accent-blue)] border-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-[var(--bg-base)] shadow-[0_0_20px_rgba(0,229,255,0.2)]"
              onClick={() => setPhase('progression')}
            >
              Reveal ELO Rewards →
            </Button>
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
            className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 space-y-6 text-center shadow-2xl relative"
          >
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[var(--text-muted)]">Combat Arena Report</h2>
            
            {/* ELO Rating Progression Slider */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-2 right-4 text-[10px] text-[var(--text-muted)] font-mono">{mode === 'casual' ? 'Casual Mode' : 'Season 4'}</div>
              
              <div className="flex items-center justify-center gap-8 mt-2">
                <div className="text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase">
                    {mode === 'casual' ? 'Rating Unchanged' : 'Rating ELO'}
                  </span>
                  <div className="text-3xl font-black text-white font-mono mt-1">{currentElo}</div>
                </div>
                
                <div className="text-slate-500">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase">
                    {mode === 'casual' ? 'ELO Shift' : 'ELO Shift'}
                  </span>
                  <div className={`text-2xl font-black font-mono mt-1.5 flex items-center justify-center gap-0.5 ${
                    mode === 'casual' ? 'text-purple-400' : isWinner ? 'text-emerald-400' : isDraw ? 'text-purple-400' : 'text-red-400'
                  }`}>
                    {mode === 'casual' ? (
                      <>±0</>
                    ) : isWinner ? (
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
            {/* Proceeds buttons */}
            <Button
              variant="outline"
              size="lg"
              className="w-full mt-6 text-[var(--accent-blue)] border-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-[var(--bg-base)]"
              onClick={() => navigate(`/battle/${battleId}/summary`)}
            >
              Proceed to Battle Summary →
            </Button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default VerdictDisplay;

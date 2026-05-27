import React from 'react';
import { Award, ShieldAlert, Swords, Timer } from 'lucide-react';
import { useSelector } from 'react-redux';

const BattleTopBar = ({ battleType, problemDifficulty, timer, opponent, topic }) => {
  const { remaining, isWarning, isDanger } = timer;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (diff === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (diff === 'Hard') return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-purple-400 bg-purple-500/10 border-purple-500/20'; // Expert
  };

  const getOpponentStatusConfig = (status) => {
    if (status === 'surrendered') return { label: 'Surrendered ✗', classes: 'text-red-400 border-red-500/20 bg-red-500/10' };
    if (status === 'submitted') return { label: 'Submitted ✓', classes: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' };
    if (status === 'testing') return { label: 'Testing...', classes: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10 animate-pulse' };
    return { label: 'Coding...', classes: 'text-slate-400 border-slate-500/20 bg-slate-500/10' }; // coding / ready
  };

  const isBlindMode = battleType?.toLowerCase() === 'blind';
  const oppCfg = opponent ? getOpponentStatusConfig(opponent.status) : null;

  return (
    <div className="bg-[#141B2D] border border-[#1E2D40] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shrink-0">
      
      {/* ── LEFT SECTION: BATTLE INFO ── */}
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.06)]">
          ⚔️
        </span>
        <div>
          <h2 className="text-[10px] font-black text-[#7A9AB8] uppercase tracking-widest leading-none font-mono">
            {battleType === 'sprint' 
              ? 'Timed Sprint' 
              : (battleType === 'topic' 
                ? 'Topic Battle' 
                : (battleType?.toLowerCase() === 'blind' 
                  ? 'Blind Duel' 
                  : `${battleType} Match`))}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(problemDifficulty)}`}>
              {problemDifficulty || 'Medium'}
            </span>
            {battleType === 'topic' && topic && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] uppercase tracking-wider flex items-center gap-1 font-mono">
                🎯 {topic}
              </span>
            )}
            {battleType === 'team' && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] uppercase tracking-wider flex items-center gap-1 font-mono">
                👥 2v2 Team
              </span>
            )}
            {battleType?.toLowerCase() === 'blind' && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                👁 Blind Mode
              </span>
            )}
            <span className="text-[10px] text-[#7A9AB8]/60 font-mono">Constraints: 2s · 256MB</span>
          </div>
        </div>
      </div>

      {/* ── CENTER SECTION: COUNTDOWN TIMER ── */}
      <div className="flex items-center justify-center gap-2 bg-[#0D1520] border border-[#1E2D40] px-4 py-2.5 rounded-2xl shrink-0 self-center">
        <Timer className={`w-4 h-4 ${isDanger ? 'text-red-500 animate-pulse' : 'text-[#7A9AB8]'}`} />
        <span 
          className={`text-lg font-black tracking-tight font-mono transition-all duration-300 ${
            isDanger 
              ? 'text-red-500 animate-pulse-red' 
              : isWarning 
                ? 'text-orange-500' 
                : 'text-white'
          }`}
        >
          {formatTime(remaining)}
        </span>
        
        {/* CSS pulsers injected directly */}
        {isDanger && (
          <style>{`
            @keyframes pulseRed {
              0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.4)); }
              50% { transform: scale(1.03); filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.7)); }
            }
            .animate-pulse-red {
              animation: pulseRed 1s ease-in-out infinite;
            }
          `}</style>
        )}
      </div>

      {/* ── RIGHT SECTION: OPPONENT LIVE STATUS ── */}
      <div className="flex items-center justify-end gap-3 font-mono">
        {battleType === 'team' ? (
          (() => {
            const teammate = useSelector(state => state.battle.teammate);
            const opponents = useSelector(state => state.battle.opponents);
            return (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {opponents.map((opp, idx) => (
                      <div 
                        key={idx}
                        title={`@${opp.username} (${opp.elo} Elo) - ${opp.status}`}
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 border-2 border-[#141B2D] flex items-center justify-center text-[10px] font-bold text-white shadow-md relative"
                      >
                        {opp.username?.slice(0, 2).toUpperCase()}
                        {opp.status === 'submitted' && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-[#141B2D] flex items-center justify-center text-[8px] text-white">✓</span>
                        )}
                        {opp.status === 'testing' && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border border-[#141B2D] flex items-center justify-center text-[8px] animate-pulse">…</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#7A9AB8] font-bold">VS</span>
                  <div className="flex -space-x-2">
                    <div 
                      title="You"
                      className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-[#141B2D] flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                    >
                      ME
                    </div>
                    {teammate && (
                      <div 
                        title={`Teammate @${teammate.username} (${teammate.elo} Elo) - ${teammate.status}`}
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 border-2 border-[#141B2D] flex items-center justify-center text-[10px] font-bold text-white shadow-md relative"
                      >
                        {teammate.username?.slice(0, 2).toUpperCase()}
                        {teammate.status === 'submitted' && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-[#141B2D] flex items-center justify-center text-[8px] text-white">✓</span>
                        )}
                        {teammate.status === 'testing' && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border border-[#141B2D] flex items-center justify-center text-[8px] animate-pulse">…</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : opponent ? (
          <>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">@{opponent.username}</span>
              <span className="text-[10px] text-[#7A9AB8] flex items-center justify-end gap-1">
                <Award className="w-3 h-3 text-amber-400" /> {opponent.elo} Elo
              </span>
            </div>

            {/* Glowing avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md relative">
              {opponent.username?.slice(0, 2).toUpperCase()}
              {/* Ping active bubble */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#141B2D] bg-emerald-500" />
            </div>

            {/* Live Progress updates / hide in blind mode */}
            {!isBlindMode ? (
              <div className="flex flex-col gap-1 items-end min-w-[90px]">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${oppCfg.classes}`}>
                  {oppCfg.label}
                </span>
                <span className="text-[9px] text-[#7A9AB8]">
                  Passed: <strong className="text-white">{opponent.progress || 0}</strong> testcases
                </span>
              </div>
            ) : (
              <div className="text-right min-w-[90px]">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-[#1E2D40] bg-[#0D1520] text-[#7A9AB8]/40 uppercase tracking-widest">
                  BLIND MODE
                </span>
              </div>
            )}
          </>
        ) : (
          <span className="text-xs text-[#7A9AB8] italic">Loading opponent...</span>
        )}
      </div>

    </div>
  );
};

export default BattleTopBar;

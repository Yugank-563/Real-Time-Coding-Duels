import { useSelector } from 'react-redux';
import { Timer, Award } from 'lucide-react';
import { formatTimer } from '../../utils/index';

export const BattleHeader = ({
  battleType,
  mode,
  problemDifficulty,
  timer,
  opponent,
  topic,
  onExitBattle,
}) => {
  const { remaining, isWarning, isDanger } = timer;
  const teammate = useSelector(state => state.battle.teammate);
  const opponents = useSelector(state => state.battle.opponents);

  const getDifficultyConfig = (diff) => {
    if (diff === 'Easy') return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (diff === 'Medium') return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (diff === 'Hard') return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
  };

  const getBattleLabel = (type) => {
    if (type === 'sprint') return 'Timed Sprint';
    if (type === 'topic') return 'Topic Battle';
    if (type === 'team') return '2v2 Team';
    if (type?.toLowerCase() === 'blind') return 'Blind Duel';
    return `${type || '1v1'} Match`.toUpperCase();
  };

  const getOpponentStatusConfig = (status) => {
    if (status === 'surrendered') return { label: 'Surrendered ✗', dot: 'bg-red-500', badge: 'text-red-400 border-red-500/25 bg-red-500/10' };
    if (status === 'submitted') return { label: 'Submitted ✓', dot: 'bg-emerald-500', badge: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10' };
    if (status === 'testing') return { label: 'Testing…', dot: 'bg-blue-400 animate-pulse', badge: 'text-blue-400 border-blue-500/25 bg-blue-500/10 animate-pulse' };
    return { label: 'Coding…', dot: 'bg-amber-400 animate-pulse', badge: 'text-amber-400 border-amber-500/25 bg-amber-500/10' };
  };

  const isBlindMode = battleType?.toLowerCase() === 'blind';
  const oppCfg = opponent ? getOpponentStatusConfig(opponent.status) : null;
  const diffConfig = getDifficultyConfig(problemDifficulty);

  const timerColorClass = isDanger
    ? 'text-red-400'
    : isWarning
      ? 'text-amber-400'
      : 'text-text-primary';

  const timerBgClass = isDanger
    ? 'bg-red-500/8 border-red-500/25'
    : isWarning
      ? 'bg-amber-500/8 border-amber-500/25'
      : 'bg-white/4 border-white/10';

  return (
    <div className="bg-surface border border-border rounded-2xl px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card shrink-0 relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />

      {/* ── LEFT: Battle Info ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary shrink-0">
          <span className="text-base leading-none">⚔️</span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 uppercase tracking-widest font-mono">
              {getBattleLabel(battleType)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono border ${mode === 'casual' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-purple-500/10 text-purple-400 border-purple-500/25'}`}>
              {mode === 'casual' ? 'Casual' : 'Ranked'}
            </span>
            {battleType === 'topic' && topic && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25 font-mono">
                🎯 {topic}
              </span>
            )}
            {battleType === 'team' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 font-mono">
                👥 2v2
              </span>
            )}
            {isBlindMode && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25 font-mono">
                👁 Blind
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${diffConfig.color} ${diffConfig.bg} ${diffConfig.border}`}>
              {problemDifficulty || 'Medium'}
            </span>
            <span className="text-[10px] text-text-muted font-mono">⏱ 2s · 💾 256MB</span>
          </div>
        </div>
      </div>

      {/* ── CENTER: Timer ── */}
      <div className={`flex items-center gap-2 justify-center px-6 py-2 rounded-xl border transition-all duration-500 ${timerBgClass} shrink-0 self-center`}>
        <Timer className={`w-5 h-5 transition-all duration-300 ${timerColorClass} ${isDanger ? 'animate-pulse' : ''}`} />
        <span
          className={`text-3xl font-black tracking-tight font-mono transition-all duration-300 ${timerColorClass} ${isDanger ? 'animate-pulse' : ''}`}
        >
          {formatTimer(remaining)}
        </span>
      </div>

      {/* ── RIGHT: Opponent & Exit ── */}
      <div className="flex items-center justify-end gap-3 font-mono">
        <div className="flex items-center gap-3">
          {battleType === 'team' ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {(opponents || []).map((opp, idx) => (
                  <div
                    key={idx}
                    title={`@${opp.username} (${opp.elo} Elo) — ${opp.status}`}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-2 ring-pink-500/30"
                  >
                    {opp.username?.slice(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-text-muted font-bold">VS</span>
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-2 ring-emerald-500/30">ME</div>
                {teammate && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-2 ring-cyan-500/30">
                    {teammate.username?.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ) : opponent ? (
            <>
              <div className="text-right hidden sm:block">
                <span className="text-sm font-semibold text-text-primary block">@{opponent.username}</span>
                <span className="text-[10px] text-text-muted flex items-center justify-end gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> {opponent.elo} Elo
                </span>
              </div>

              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-pink-500/40 relative shrink-0">
                {opponent.username?.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface bg-emerald-500" />
              </div>

              {!isBlindMode ? (
                <div className="flex flex-col gap-0.5 items-end min-w-[90px]">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${oppCfg?.badge}`}>
                    <span className={`w-1 h-1 rounded-full shrink-0 ${oppCfg?.dot}`} />
                    {oppCfg?.label}
                  </span>
                  <span className="text-[9px] text-text-muted">
                    Passed: <strong className="text-text-primary">{opponent.progress || 0}</strong> TCs
                  </span>
                </div>
              ) : (
                <div className="min-w-[90px] text-right">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-border bg-elevated text-text-muted/50 uppercase tracking-widest">
                    BLIND
                  </span>
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-text-muted italic">Duel Match...</span>
          )}
        </div>

        {onExitBattle && (
          <button
            onClick={onExitBattle}
            className="ml-2 px-3 py-1.5 rounded-xl border border-red-500/25 bg-red-500/6 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 text-xs font-semibold"
          >
            🚪 Exit
          </button>
        )}
      </div>
    </div>
  );
};

export default BattleHeader;

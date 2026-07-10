import { Timer, User, LogOut } from 'lucide-react';
import { formatTimer } from '../../utils/index';
import Button from '../ui/Button';

const BattleHeader = ({
  battleType,
  mode,
  timer,
  opponent,
  onExitBattle
}) => {
  const { remaining, isWarning, isDanger } = timer;

  const getBattleLabel = (type) => {
    if (type === 'timed-sprint') return 'Timed Sprint';
    if (type === 'topic-duel') return 'Topic Duel';
    return 'Random Duel';
  };

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
    <div className="bg-surface border border-border rounded-xl px-4 py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card shrink-0 relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />

      {/* ── LEFT: Battle Info ── */}
      <div className="flex items-center gap-2.5 min-w-0 md:flex-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 uppercase tracking-widest font-mono">
              {getBattleLabel(battleType)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono border ${mode === 'casual' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-purple-500/10 text-purple-400 border-purple-500/25'}`}>
              {mode === 'casual' ? 'Casual' : 'Ranked'}
            </span>
          </div>
        </div>
      </div>

      {/* ── CENTER: Timer ── */}
      <div className={`flex items-center gap-1.5 justify-center px-4 py-1 rounded-lg border transition-all duration-500 ${timerBgClass} shrink-0 self-center`}>
        <Timer className={`w-4 h-4 transition-all duration-300 ${timerColorClass} ${isDanger ? 'animate-pulse' : ''}`} />
        <span
          className={`text-xl font-black tracking-tight font-mono transition-all duration-300 ${timerColorClass} ${isDanger ? 'animate-pulse' : ''}`}
        >
          {formatTimer(remaining)}
        </span>
      </div>

      {/* ── RIGHT: Opponent & Exit ── */}
      <div className="flex items-center md:justify-end gap-3 font-mono md:flex-1">
        <div className="flex items-center gap-3">
          {opponent ? (
            <>
              <div className="text-right hidden sm:block" title="Opponent">
                <span className="text-sm font-semibold text-text-primary block">@{opponent.username}</span>
              </div>

              <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-muted relative shrink-0">
                <User className="w-3.5 h-3.5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-surface bg-emerald-500" />
              </div>
            </>
          ) : (
            <span className="text-xs text-text-muted italic">Duel Match...</span>
          )}
        </div>

        {onExitBattle && (
          <Button
            variant="ghost"
            onClick={onExitBattle}
            className="ml-2 !p-2 !bg-red-500/10 !text-red-400 border !border-red-500/30 hover:!bg-red-500/20 transition-colors"
            title="Exit Battle"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BattleHeader;

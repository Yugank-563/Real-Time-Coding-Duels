import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Award, Sparkles } from 'lucide-react';
import { useBattleSocket, useDocumentTitle } from '../../hooks/index';
import { selectBattle, setSuggestedTopic } from '../../features/index';
import { selectUser } from '../../features/index';
import { useToast } from '../../hooks/ui/useToast';
import { useTheme } from '../../hooks/ui/useTheme';

const Matchmaking = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const battleType = searchParams.get('type') || '1v1';
  useDocumentTitle(`Matchmaking (${battleType.toUpperCase()})`);
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const user = useSelector(selectUser);
  const { lobbyStatus, battleId, suggestedTopic, topic } = useSelector(selectBattle);

  // States
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('');
  const [eloRange, setEloRange] = useState(100);

  // Connect to active socket handler
  const { joinQueue, leaveQueue } = useBattleSocket(null, battleType);

  // 0. Redirect to login if unauthenticated
  useEffect(() => {
    if (!user) {
      toast.error('Authentication Required', 'Please log in to enter the matchmaking queue.');
      navigate(`/login?redirect=/battle/matchmaking?type=${battleType}`);
    }
  }, [user, navigate, battleType, toast]);

  // 1. Ticking queue timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 600);

    return () => {
      clearInterval(timer);
      clearInterval(dotTimer);
    };
  }, []);

  // 2. Expand ELO pairing range over time
  useEffect(() => {
    if (elapsed > 0 && elapsed % 10 === 0) {
      setEloRange((prev) => prev + 50);
      toast.info('Expanding Search ELO Range', `Now searching within ±${eloRange + 50} Elo rating points.`);
    }
  }, [elapsed]);

  // 3. Match found redirect!
  useEffect(() => {
    if (lobbyStatus === 'matched' && battleId) {
      console.log('Match successfully found! Redirecting to BattleRoom:', battleId);
      navigate(`/battle/${battleId}`);
    }
  }, [lobbyStatus, battleId, navigate]);

  const handleCancel = () => {
    leaveQueue(battleType);
    navigate('/battle/lobby');
  };

  const myElo = user?.rank || 1200;

  return (
    <div className="min-h-[70vh] w-full bg-base text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none animate-[fadeIn_0.4s_ease-out] transition-colors duration-300">
      
      {/* ──── DOT GRID BACKGROUND ──── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ──── SPINNING RADAR RADIAL GLOW ──── */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-b from-accent-primary/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Radar Spinner */}
        <div className="relative flex items-center justify-center w-64 h-64 mx-auto mt-4">
          {/* Pulsing CSS radar sweeps */}
          <div className="absolute inset-0 rounded-full border border-accent-primary/20 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full border border-accent-primary/10 animate-ping opacity-15" style={{ animationDuration: '4s' }} />
          
          {/* Orbit rings */}
          <div className="absolute inset-8 rounded-full border border-border flex items-center justify-center">
            <div className="absolute inset-12 rounded-full border border-border/60 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface border border-accent-primary/30 flex items-center justify-center shadow-[0_0_24px_rgba(108,99,255,0.15)]">
                <Users className="w-6 h-6 text-accent-primary" />
              </div>
            </div>
          </div>

          {/* Sweeping radar pointer line */}
          <div 
            className="absolute inset-0 rounded-full border border-dashed border-accent-primary/10"
            style={{
              background: 'conic-gradient(from 0deg, transparent 40%, rgba(108, 99, 255, 0.05) 90%, rgba(108, 99, 255, 0.15) 100%)',
              animation: 'spin 4s linear infinite'
            }}
          />
        </div>

        {/* Text descriptions */}
        <div className="space-y-3">
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight flex items-center justify-center gap-1.5">
            Searching for Opponent{dots}
          </h2>
          <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">
            Format: <span className="text-accent-primary">{battleType.toUpperCase()} Ranked Match</span>
          </p>
        </div>

        {/* ELO stats card */}
        <div className="bg-surface border border-border shadow-md rounded-2xl p-6 grid grid-cols-2 gap-4 divide-x divide-border">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> Your ELO
            </div>
            <p className="text-2xl font-black text-text-primary font-mono">{myElo}</p>
          </div>
          <div className="space-y-1 pl-4">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> ELO Range
            </div>
            <p className="text-xs font-bold text-text-primary font-mono mt-2">
              ±{eloRange} <span className="text-text-muted/80 block mt-0.5">({myElo - eloRange} - {myElo + eloRange})</span>
            </p>
          </div>
        </div>

        {/* Timers info */}
        <div className="flex items-center justify-between text-xs text-text-secondary px-2 font-mono">
          <p>Time Elapsed: <span className="text-text-primary font-bold">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span></p>
          <p>Queue Status: <span className="text-accent-primary font-bold">Matching...</span></p>
        </div>

        {/* Topic Timeout Suggestion Dialog */}
        {suggestedTopic && (
          <div className="bg-elevated border border-accent-primary/30 rounded-2xl p-4 space-y-3 text-left shadow-lg">
            <div className="flex items-center gap-2 text-accent-primary">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider">No Opponents on {topic || 'Topic'}</h4>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              No opponents are matching on the topic <strong>{topic || 'selected topic'}</strong> right now. Would you like to expand search to <strong>{suggestedTopic}</strong>?
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  leaveQueue('topic', { topic });
                  dispatch(setSuggestedTopic(null));
                  navigate(`/battle/matchmaking?type=topic&topic=${encodeURIComponent(suggestedTopic)}`);
                  window.location.reload(); // forces the socket to re-instantiate and join fresh
                }}
                className="flex-1 py-2 text-center rounded-xl bg-accent-primary text-white text-[10px] font-bold uppercase tracking-wider hover:brightness-105 active:scale-[0.98] transition-all"
              >
                Yes, Expand
              </button>
              <button
                onClick={() => {
                  dispatch(setSuggestedTopic(null));
                }}
                className="flex-1 py-2 text-center rounded-xl bg-overlay border border-border text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                Keep Waiting
              </button>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="px-8 py-3.5 w-full rounded-xl bg-elevated hover:bg-red-500/10 border border-border hover:border-red-500 text-text-secondary hover:text-red-500 text-xs font-bold transition-all duration-200 active:scale-[0.98] uppercase tracking-wider"
        >
          Cancel Matchmaking
        </button>

      </div>

      {/* ──── INLINE RADAR SPINNING @KEYFRAMES ──── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Matchmaking;

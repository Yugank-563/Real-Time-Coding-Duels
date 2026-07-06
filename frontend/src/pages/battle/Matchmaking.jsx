import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, Award } from 'lucide-react';
import { useBattleSocket, useDocumentTitle, useToast } from '../../hooks/index';
import { selectUser, selectBattle } from '../../features/index';
import Card from '../../components/ui/Card';

const Matchmaking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const battleType = searchParams.get('type') || 'random-duel';
  const mode = searchParams.get('mode') || 'ranked';
  useDocumentTitle(`Matchmaking (${battleType.toUpperCase()})`);
  const toast = useToast();
      
  const user = useSelector(selectUser);
  const { lobbyStatus, battleId } = useSelector(selectBattle);

  // States
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('');
  const [eloRange, setEloRange] = useState(50);

  // Connect to active socket handler
  const { leaveQueue } = useBattleSocket(null, battleType);

  // 0. Redirect to login if unauthenticated
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to enter the matchmaking.');
      navigate(`/login?redirect=/battle/matchmaking?type=${battleType}&mode=${mode}`);
    }
  }, [user, navigate, battleType, mode, toast]);

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
    if (elapsed > 0 && elapsed % 20 === 0) {
      setEloRange((prev) => prev + 25);
      toast.info(`Now searching within ±${eloRange + 25} Elo rating points.`);
    }
  }, [elapsed]);

  // 3. Match found redirect!
  useEffect(() => {
    if (lobbyStatus === 'matched' && battleId) {
      navigate(`/battle/${battleId}`);
    }
  }, [lobbyStatus, battleId, navigate]);

  const handleCancel = () => {
    const topicParam = searchParams.get('topic');
    leaveQueue(battleType, { mode, topic: topicParam });
    navigate('/');
  };

  const myElo = user?.rating || 1200;

  return (
    <div className="min-h-[70vh] w-full bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none animate-[fadeIn_0.4s_ease-out] transition-colors duration-300">
      
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
            Format: <span className="text-accent-primary">{battleType.toUpperCase()} {mode === 'casual' ? 'Casual' : 'Ranked'} Match</span>
          </p>
        </div>

        {/* ELO stats card */}
        <Card className="p-6 grid grid-cols-2 gap-4 divide-x divide-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> Your ELO
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)] font-mono">{myElo}</p>
          </div>
          <div className="space-y-1 pl-4">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> ELO Range
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)] font-mono mt-2">
              ±{eloRange} <span className="text-[var(--text-muted)] block mt-0.5">({myElo - eloRange} - {myElo + eloRange})</span>
            </p>
          </div>
        </Card>

        {/* Timers info */}
        <div className="flex items-center justify-between text-xs text-text-secondary px-2 font-mono">
          <p>Time Elapsed: <span className="text-text-primary font-bold">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span></p>
          <p>Queue Status: <span className="text-accent-primary font-bold">Matching...</span></p>
        </div>

        {/* Cancel Button */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCancel}
          className="w-full px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all duration-300 group border-border bg-base/60 text-danger hover:border-danger/50 hover:bg-danger/5 hover:shadow-[0_0_20px_var(--shadow-glow-red)]"
        >
          Cancel Matchmaking
        </motion.button>

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

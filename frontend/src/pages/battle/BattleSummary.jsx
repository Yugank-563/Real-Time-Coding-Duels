import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../utils/index';
import { Cpu, Database, CheckCircle2, Target, Trophy, BookOpen } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/index';
import { useToast } from '../../hooks/ui/useToast';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/index';
import { estimateComplexity } from '../../utils/index';
import VerdictBadge from '../../components/ui/VerdictBadge';
import CodeViewer from '../../components/ui/CodeViewer';

// --- Reusable Components ---
const StatRow = ({ icon: Icon, label, myContent, oppContent, isWinnerMe, isWinnerOpp, highlightWinner }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors px-4 rounded-lg">
    <div className={`flex-1 font-mono text-sm ${highlightWinner && isWinnerMe ? 'text-emerald-400 font-bold' : 'text-text-primary'}`}>
      {myContent || <span className="text-text-secondary">--</span>}
    </div>
    <div className="w-32 sm:w-48 flex items-center justify-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-widest shrink-0">
      {Icon && <Icon className="w-4 h-4 opacity-70" />}
      {label}
    </div>
    <div className={`flex-1 font-mono text-sm text-right ${highlightWinner && isWinnerOpp ? 'text-accent-primary font-bold' : 'text-text-primary'}`}>
      {oppContent || <span className="text-text-secondary">--</span>}
    </div>
  </div>
);

const PlayerProfile = ({ player, isWinner, isMe }) => (
  <div className="flex flex-col items-center space-y-2 relative w-full pb-2">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-sm bg-gradient-to-tr ${
      isWinner 
        ? isMe ? 'from-emerald-500 to-teal-400' : 'from-accent-red to-accent-primary'
        : 'from-[#1E2D40] to-[#2A3F54]'
    }`}>
      {player?.user?.name?.slice(0, 2).toUpperCase() || (isMe ? 'ME' : 'OP')}
    </div>
    <div className="text-center">
      <h3 className="font-bold text-text-primary text-base tracking-tight flex items-center justify-center gap-2">
        @{player?.user?.name || player?.user?.email?.split('@')[0]}
        {isWinner && <Trophy className={`w-3.5 h-3.5 ${isMe ? 'text-emerald-500' : 'text-accent-primary'}`} />}
      </h3>
      <span className="text-[11px] text-text-secondary font-mono mt-0.5 block">
        Elo {player?.user?.rank}
      </span>
    </div>
  </div>
);

const BattleSummary = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle('Battle Summary');
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [battle, setBattle] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeCodeTab, setActiveCodeTab] = useState('me'); 

  const user = useSelector(selectUser);
  const myUserId = user?._id || user?.id;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get(`/api/battles/${battleId}/summary`);
        setBattle(res.data.battle);
        setSubmissions(res.data.submissions);
      } catch (err) {
        console.error('Failed to load battle summary analytics:', err.message);
        toast.error('Summary Unavailable', 'Unable to retrieve duel outcomes.');
        navigate('/battle/lobby');
      } finally {
        setLoading(false);
      }
    };
    if (battleId) fetchSummary();
  }, [battleId, navigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin mb-4" />
        <p className="text-xs text-text-secondary tracking-widest uppercase font-bold animate-pulse">
          Aggregating Match Telemetry...
        </p>
      </div>
    );
  }

  if (!battle) return null;

  const me = battle.players.find(p => p.user?._id === myUserId) || battle.players[0];
  const opponent = battle.players.find(p => p.user?._id !== myUserId) || battle.players[1];
  const winnerId = battle.winner;
  const isWinnerMe = winnerId === me?.user?._id;
  const isWinnerOpp = opponent && winnerId === opponent?.user?._id;

  const mySubmissions = submissions.filter(s => s.userId === me?.user?._id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const oppSubmissions = opponent ? submissions.filter(s => s.userId === opponent?.user?._id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  const myFinalSub = mySubmissions[0];
  const oppFinalSub = oppSubmissions[0];

  const myComplexity = estimateComplexity(myFinalSub?.code);
  const oppComplexity = estimateComplexity(oppFinalSub?.code);

  return (
    <div className="w-full relative overflow-x-hidden overflow-y-auto font-sans select-none transition-colors duration-300">
      {/* ──── AMBIENT BACKGROUND ──── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-accent-primary/5 via-accent-primary/[0.02] to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 pb-12">

        {/* ── HERO HEADER ── */}
        <div className="text-center pt-0 pb-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-text-primary drop-shadow-sm">
            {battle.problem?.title || 'Unknown Challenge'}
          </h1>
          <p className="text-text-secondary text-sm font-mono mt-2">
            Match Analytics & Performance Matrix
          </p>
        </div>

        {/* ── PERFORMANCE MATRIX DASHBOARD ── */}
        <div className="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden flex flex-col">
          
          {/* Player Headers */}
          <div className="grid grid-cols-2 p-6 pb-4 border-b border-border/50 relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent -translate-x-1/2" />
            <PlayerProfile player={me} isWinner={isWinnerMe} isMe={true} />
            <PlayerProfile player={opponent} isWinner={isWinnerOpp} isMe={false} />
          </div>

          {/* Analytics Rows */}
          <div className="p-4 sm:p-6 space-y-1">
            <StatRow 
              icon={Target} label="Final Verdict" highlightWinner={false}
              myContent={<VerdictBadge verdict={myFinalSub?.verdict} />}
              oppContent={<VerdictBadge verdict={oppFinalSub?.verdict} />}
            />

            <StatRow 
              icon={Cpu} label="Time Complexity" highlightWinner={false}
              myContent={myFinalSub ? <span className="text-[13px] font-bold tracking-widest text-emerald-300">{myComplexity.time}</span> : null}
              oppContent={oppFinalSub ? <span className="text-[13px] font-bold tracking-widest text-accent-blue">{oppComplexity.time}</span> : null}
            />

            <StatRow 
              icon={Database} label="Space Complexity" highlightWinner={false}
              myContent={myFinalSub ? <span className="text-[13px] font-bold tracking-widest text-emerald-300">{myComplexity.space}</span> : null}
              oppContent={oppFinalSub ? <span className="text-[13px] font-bold tracking-widest text-accent-blue">{oppComplexity.space}</span> : null}
            />

            <StatRow 
              icon={CheckCircle2} label="Test Cases" highlightWinner={false}
              myContent={myFinalSub ? `${myFinalSub.testCasesPassed} / ${myFinalSub.totalTestCases}` : null}
              oppContent={oppFinalSub ? `${oppFinalSub.testCasesPassed} / ${oppFinalSub.totalTestCases}` : null}
            />
          </div>
        </div>

        {/* ── CODE COMPARISON VIEWER ── */}
        <div className="bg-surface border border-border rounded-2xl flex flex-col overflow-hidden h-[500px] shadow-xl">
          <div className="bg-elevated px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <span className="font-bold text-text-primary flex items-center gap-2 text-sm uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-accent-primary" /> Source Code Inspector
            </span>

            {/* Segmented Tabs */}
            <div className="flex bg-[#0A0D14] p-1 rounded-lg border border-border/50 shadow-inner">
              <button
                onClick={() => setActiveCodeTab('me')}
                className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${activeCodeTab === 'me'
                    ? 'bg-accent-primary/15 text-accent-primary shadow-[0_0_10px_rgba(108,99,255,0.2)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
              >
                Your Strategy
              </button>
              <button
                onClick={() => setActiveCodeTab('opponent')}
                className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${activeCodeTab === 'opponent'
                    ? 'bg-accent-primary/15 text-accent-primary shadow-[0_0_10px_rgba(108,99,255,0.2)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
              >
                Opponent Code
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-[#1E1E1E]">
            <CodeViewer
              language={activeCodeTab === 'me' ? myFinalSub?.language : oppFinalSub?.language}
              code={activeCodeTab === 'me' ? myFinalSub?.code : oppFinalSub?.code}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default BattleSummary;

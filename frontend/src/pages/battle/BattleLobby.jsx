import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swords, Zap, Target } from 'lucide-react';

import { selectUser } from '../../features/index';
import { useToast, useTheme, useBattleSocket, useLobbyStats, useTopicStats, useDocumentTitle, useInvitations } from '../../hooks/index';

// Components 
import { ArenaCard, InviteFriendCard } from '../../components/index';

const BATTLE_TYPES = [
  { id: '1v1', name: 'Random Duel', desc: 'A pure test of adaptability. Both your opponent and a random problem are matched to your skill rating.', hint: '🎯 Random problem matched to your skill rating', icon: Swords, speed: 'Avg wait: 15s', color: 'from-cyan-500/20 to-purple-500/20', borderColor: 'group-hover:border-cyan-400/50', topBorder: 'border-t-cyan-500' },
  { id: 'sprint', name: 'Timed Sprint', desc: 'Race against the clock in high-speed, 10-minute blitz challenges.', hint: '⚡ Easy problem — built to test your speed under pressure', icon: Zap, speed: 'Avg wait: 10s', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'group-hover:border-emerald-400/50', topBorder: 'border-t-emerald-500' },
  { id: 'topic', name: 'Topic Battle', desc: 'Master specific data structures by challenging rivals in targeted duels.', hint: '📚 Problems filtered by your chosen topic — go deep, not wide', icon: Target, speed: 'Topic selection', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'group-hover:border-pink-400/50', topBorder: 'border-t-pink-500' }
];

const BattleLobby = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  useDocumentTitle('Battle Lobby');

  const myUser = useSelector(selectUser);
  const { lobbyStatus } = useSelector(state => state.battle);
  const { socket } = useBattleSocket();

  // ── States & Hooks ──
  const [mode, setMode] = useState('ranked');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicError, setTopicError] = useState('');

  const { lobbyStats } = useLobbyStats();
  const { topicList, activeTopicStats } = useTopicStats();

  const topicOptions = topicList.map((topic) => ({
    value: topic,
    label: topic
  }));

  // ── Handlers ──
  const handleQuickJoin = (type, forcedMode = null) => {
    if (!myUser) {
      navigate(`/login?redirect=/battle/lobby`);
      return;
    }
    if (lobbyStatus === 'queuing') {
      toast.error('Already in Queue', 'Please leave your current matchmaking queue first.');
      return;
    }
    const selectedMode = forcedMode || mode;
    toast.success('Entering Queue 🚀', `Searching for a ${selectedMode === 'ranked' ? 'Ranked' : 'Casual'} ${type === 'sprint' ? 'Timed Sprint' : '1v1'} match...`);
    navigate(`/battle/matchmaking?type=${type}&mode=${selectedMode}`);
  };

  const handleJoinTopicQueue = () => {
    if (!myUser) {
      navigate(`/login?redirect=/battle/lobby`);
      return;
    }
    if (!selectedTopic) {
      setTopicError('Please select a topic to continue');
      return;
    }
    if (lobbyStatus === 'queuing') {
      toast.error('Already in Queue', 'Please leave your current matchmaking queue first.');
      return;
    }
    setTopicError('');
    toast.success('Entering Queue 🚀', `Searching for a ${selectedTopic} Topic Battle match...`);
    navigate(`/battle/matchmaking?type=topic&topic=${encodeURIComponent(selectedTopic)}&mode=${mode}`);
  };

  const { sendInvite } = useInvitations();

  const handleSendInvite = async (username, inviteMode, battleType, topic, timeLimit, difficulty) => {
    if (!username.trim()) {
      toast.error('Username Required', 'Please enter a friend\'s username to send an invitation.');
      return;
    }
    
    if (battleType === 'topic' && !topic) {
      toast.error('Topic Missing', 'Please select a topic for the battle.');
      return;
    }

    // Check if trying to invite self
    if (myUser?.username?.toLowerCase() === username.trim().toLowerCase()) {
      toast.error('Invalid Recipient', 'You cannot invite yourself to a battle.');
      return;
    }

    try {
      await sendInvite(username.trim(), battleType, { mode: inviteMode, topic, timeLimit, difficulty });
      setSearchTerm('');
    } catch (err) {
      // The toast is already handled inside the sendInvite hook on error
    }
  };

  return (
    <div className="w-full bg-base text-text-primary pt-6 pb-40 relative overflow-hidden font-sans select-none transition-colors duration-300 animate-[fadeIn_0.4s_ease-out]" data-auth-theme={theme}>
      {/* ──── DOT GRID BACKGROUND ──── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      {/* ──── TOP RADIAL GLOW ──── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-accent-primary/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="flex flex-col gap-6 relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'var(--auth-card)', border: '1px solid var(--auth-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Swords size={22} color="var(--auth-accent)" />
              </div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: 0, color: 'var(--auth-heading)', letterSpacing: '-0.02em' }}>
                Select Coding Battle
              </h1>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--auth-muted)', margin: 0, paddingLeft: '2px' }}>
              Real-time 1v1 coding duels — pick your format, join the queue, and prove your skill.
            </p>
          </div>

          <div className="w-full flex justify-center md:w-auto md:justify-end">
            <div className="flex bg-elevated/50 border border-border/80 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setMode('ranked')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                  mode === 'ranked' 
                    ? 'bg-accent-primary text-[#0D0F14] shadow-md' 
                    : 'text-text-primary opacity-60 hover:opacity-100 hover:bg-surface'
                }`}
              >
                <Swords className="w-4 h-4" /> Ranked
              </button>
              <button
                onClick={() => setMode('casual')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                  mode === 'casual' 
                    ? 'bg-emerald-500 text-[#0D0F14] shadow-md' 
                    : 'text-text-primary opacity-60 hover:opacity-100 hover:bg-surface'
                }`}
              >
                <Zap className="w-4 h-4" /> Casual
              </button>
            </div>
          </div>
        </div>

        {/* ──── ARENA SELECTION CARDS ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch relative z-30">
          {BATTLE_TYPES.map((type) => (
            <ArenaCard
              key={type.id}
              type={type}
              mode={mode}
              isTopic={type.id === 'topic'}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              topicError={topicError}
              setTopicError={setTopicError}
              topicOptions={topicOptions}
              activeTopicStats={activeTopicStats}
              lobbyStats={lobbyStats}
              lobbyStatus={lobbyStatus}
              handleJoinTopicQueue={handleJoinTopicQueue}
              handleQuickJoin={handleQuickJoin}
            />
          ))}
        </div>

        {/* ──── UTILITY GRID (Invite a Friend) ──── */}
        <div className="grid grid-cols-1 gap-8 items-stretch relative z-10">
          {/* INVITE A FRIEND PANEL */}
          <div className="flex flex-col gap-6">
            <InviteFriendCard
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSendInvite={handleSendInvite}
              topicOptions={topicOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleLobby;

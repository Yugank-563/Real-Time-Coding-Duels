import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swords, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

import { selectUser } from '../../features/index';
import { useToast, useBattleSocket, useLobbyStats, useTopicStats, useDocumentTitle, useInvitations } from '../../hooks/index';

// Components 
import { ArenaCard, InviteFriendCard } from '../../components/index';

const BATTLE_TYPES = [
  { id: 'random-duel', name: 'Random Duel', desc: 'A pure test of adaptability. Both your opponent and a random problem are matched to your skill rating.', hint: '🎯 Random problem matched to your skill rating', icon: Swords, speed: 'Avg wait: 15s', color: 'from-cyan-500/20 to-purple-500/20', borderColor: 'group-hover:border-cyan-400/50', topBorder: 'border-t-cyan-500' },
  { id: 'timed-sprint', name: 'Timed Sprint', desc: 'Race against the clock in high-speed, 10-minute blitz challenges.', hint: '⚡ Easy problem — built to test your speed under pressure', icon: Zap, speed: 'Avg wait: 10s', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'group-hover:border-emerald-400/50', topBorder: 'border-t-emerald-500' },
  { id: 'topic-duel', name: 'Topic Duel', desc: 'Master specific data structures by challenging rivals in targeted duels.', hint: '📚 Problems filtered by your chosen topic — go deep, not wide', icon: Target, speed: 'Topic selection', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'group-hover:border-pink-400/50', topBorder: 'border-t-pink-500' }
];

const BattleLobby = () => {
  const navigate = useNavigate();
  const toast = useToast();
  useDocumentTitle('Battle');

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
      navigate(`/login?redirect=/`);
      return;
    }
    if (lobbyStatus === 'queuing') {
      toast.error('Please leave your current matchmaking first.');
      return;
    }
    const selectedMode = forcedMode || mode;
    toast.success(`Searching for a ${selectedMode === 'ranked' ? 'Ranked' : 'Casual'} ${type === 'timed-sprint' ? 'Timed Sprint' : '1v1'} match...`);
    navigate(`/battle/matchmaking?type=${type}&mode=${selectedMode}`);
  };

  const handleJoinTopicQueue = () => {
    if (!myUser) {
      navigate(`/login?redirect=/`);
      return;
    }
    if (!selectedTopic) {
      setTopicError('You must choose a challenge topic to enter the queue.');
      return;
    }
    if (lobbyStatus === 'queuing') {
      toast.error('Please leave your current matchmaking queue first.');
      return;
    }
    setTopicError('');
    toast.success(`Searching for a Topic Duel match...`);
    navigate(`/battle/matchmaking?type=topic-duel&topic=${encodeURIComponent(selectedTopic)}&mode=${mode}`);
  };

  const { sendInvite } = useInvitations();

  const handleSendInvite = async (username, inviteMode, battleType, topic, timeLimit, difficulty) => {
    if (!username.trim()) {
      toast.error('Username is required.');
      return;
    }

    if (!battleType) {
      toast.error('Battle mode is required.');
      return;
    }

    if (!difficulty) {
      toast.error('Difficulty is required.');
      return;
    }
    
    if (battleType === 'topic-duel' && !topic) {
      toast.error('Topic is required.');
      return;
    }

    // Check if trying to invite self
    if (myUser?.username?.toLowerCase() === username.trim().toLowerCase()) {
      toast.error('You cannot invite yourself to a battle.');
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
    <div className="w-full bg-base text-text-primary pb-40 relative overflow-hidden font-sans select-none transition-colors duration-300 animate-[fadeIn_0.4s_ease-out]">
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

      <div className="flex flex-col gap-6 relative z-10 w-full">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[.8rem] flex items-center justify-center shadow-sm">
                <Swords size={22} color="var(--accent-primary)" />
              </div>
              <h1 className="text-[1.875rem] font-extrabold m-0 text-[var(--text-primary)] tracking-[-0.02em]">
                Select Coding Battle
              </h1>
            </div>
            <p className="text-[0.95rem] text-[var(--text-muted)] m-0 pl-[2px] transition-colors duration-300">
              {mode === 'ranked' 
                ? 'Competitive ranked real-time 1v1 coding duels — pick your format, join the queue, and prove your skills.'
                : 'Casual unrated coding duels — practice without pressure and hone your skills.'}
            </p>
          </div>

          <div className="w-full flex justify-center md:w-auto md:justify-end">
            <div className="flex bg-[var(--bg-elevated)] rounded-full p-1 shadow-sm relative">
              <button
                onClick={() => setMode('ranked')}
                className={`relative z-10 flex items-center gap-2 px-5 py-[0.45rem] rounded-full text-[0.8rem] font-bold transition-colors uppercase tracking-wider ${
                  mode === 'ranked' 
                    ? 'text-[#0D0F14]' 
                    : 'text-[var(--text-primary)] opacity-80 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                {mode === 'ranked' && (
                  <motion.div
                    layoutId="lobbyTogglePill"
                    className="absolute inset-0 bg-[var(--btn-primary-bg)] rounded-full -z-10 shadow-md"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Swords className="w-4 h-4" /> Ranked
              </button>
              
              <button
                onClick={() => setMode('casual')}
                className={`relative z-10 flex items-center gap-2 px-5 py-[0.45rem] rounded-full text-[0.8rem] font-bold transition-colors uppercase tracking-wider ${
                  mode === 'casual' 
                    ? 'text-[#0D0F14]' 
                    : 'text-[var(--text-primary)] opacity-80 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                {mode === 'casual' && (
                  <motion.div
                    layoutId="lobbyTogglePill"
                    className="absolute inset-0 bg-[var(--btn-primary-bg)] rounded-full -z-10 shadow-md"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
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
              isTopic={type.id === 'topic-duel'}
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

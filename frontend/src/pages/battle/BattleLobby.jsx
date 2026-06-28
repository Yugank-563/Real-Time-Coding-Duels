import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Swords, Zap, Target, Sparkles } from 'lucide-react';

import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../hooks/useTheme';
import { selectUser } from '../../features/index';
import { useBattleSocket, useLobbyStats, useTopicStats, useCustomRoom, useDocumentTitle, useInvitations } from '../../hooks/index';

// Components
import { ArenaCard, InviteFriendCard, JoinRoomCard, CreateRoomCard } from '../../components/index';

const BATTLE_TYPES = [
  { id: '1v1', name: 'Ranked 1v1', desc: 'Direct Elo-rated duels against peer opponents.', icon: Swords, users: '842 active', speed: 'Avg wait: 15s', color: 'from-cyan-500/20 to-purple-500/20', borderColor: 'group-hover:border-cyan-400/50' },
  { id: 'sprint', name: 'Timed Sprint', desc: 'Fixed 5-minute speedruns to solve single easy challenges.', icon: Zap, users: '302 active', speed: 'Avg wait: 10s', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'group-hover:border-emerald-400/50' },
  { id: 'topic', name: 'Topic Battle', desc: 'Choose a topic and battle opponents who pick the same subject.', icon: Target, users: '247 active in DP · 189 in Graphs', speed: 'Topic selection', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'group-hover:border-pink-400/50' }
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicError, setTopicError] = useState('');

  const { lobbyStats } = useLobbyStats();
  const { topicList, activeTopicStats } = useTopicStats();
  const { createRoom, joinRoom } = useCustomRoom();

  const topicOptions = topicList.map((topic) => ({
    value: topic,
    label: `${topic} ${activeTopicStats[topic] !== undefined && activeTopicStats[topic] > 0 ? `(${activeTopicStats[topic]} active)` : ''}`
  }));

  // ── Handlers ──
  const handleQuickJoin = (type) => {
    if (!myUser) {
      navigate(`/login?redirect=/battle/lobby`);
      return;
    }
    if (lobbyStatus === 'queuing') {
      toast.error('Already in Queue', 'Please leave your current matchmaking queue first.');
      return;
    }
    toast.success('Entering Queue 🚀', `Searching for a ${type === 'sprint' ? 'Timed Sprint' : 'Ranked 1v1'} match...`);
    navigate(`/battle/matchmaking?type=${type}`);
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
    navigate(`/battle/matchmaking?type=topic&topic=${encodeURIComponent(selectedTopic)}`);
  };

  const { sendInvite } = useInvitations();

  const handleSendInvite = async (username) => {
    if (!username.trim()) {
      toast.error('Search Empty', 'Please input a username to invite.');
      return;
    }
    
    // Check if trying to invite self
    if (myUser?.username?.toLowerCase() === username.trim().toLowerCase()) {
      toast.error('Invalid Recipient', 'You cannot invite yourself to a battle.');
      return;
    }

    try {
      // Because we modified the backend to resolve usernames to ObjectIds, we can just pass username directly.
      await sendInvite(username.trim(), '1v1');
      setSearchTerm('');
    } catch (err) {
      // The toast is already handled inside the sendInvite hook on error
    }
  };

  return (
    <div className="w-full bg-base text-text-primary py-6 relative overflow-hidden font-sans select-none transition-colors duration-300 animate-[fadeIn_0.4s_ease-out]">
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

      <div className="space-y-6 relative z-10 w-full">
        {/* Header Hero banner */}
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Select Your Coding <span className="text-gradient-primary">Battle</span>
            </h1>
            <p className="text-text-secondary text-sm">Head-to-head live battles, custom rooms, and skill-based matching.</p>
          </div>

          <button
            onClick={() => handleQuickJoin('1v1')}
            className={`px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-md flex items-center gap-2 self-center md:self-auto ${isDark
              ? 'bg-[#00F5C4] text-[#0D0F14] shadow-[#00F5C4]/25 hover:brightness-105'
              : 'bg-[#4F6EF7] text-white shadow-[#4F6EF7]/25 hover:brightness-105'
              }`}
          >
            <Sparkles className="w-4 h-4" /> Quick Ranked Match
          </button>
        </div>

        {/* ──── ARENA SELECTION CARDS ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BATTLE_TYPES.map((type) => (
            <ArenaCard
              key={type.id}
              type={type}
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

        {/* ──── UTILITY GRID (Invite & Private Rooms) ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* INVITE A FRIEND & JOIN PRIVATE LOBBY PANEL */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <InviteFriendCard
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSendInvite={handleSendInvite}
            />
            <JoinRoomCard {...joinRoom} />
          </div>

          {/* CREATE PRIVATE ROOM PANEL */}
          <CreateRoomCard {...createRoom} />
        </div>
      </div>
    </div>
  );
};

export default BattleLobby;

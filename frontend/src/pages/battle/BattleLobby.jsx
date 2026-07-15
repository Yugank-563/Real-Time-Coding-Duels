import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { selectUser } from '../../features/index';
import { useToast, useBattleSocket, useLobbyStats, useTopicStats, useDocumentTitle, useInvitations } from '../../hooks/index';

// Components 
import { ArenaCard, InviteFriendCard } from '../../components/index';

const BATTLE_TYPES = [
  { id: 'random-duel', name: 'Random Duel', desc: 'The ultimate test of true skill. Step into the arena to face a random challenge and a closely ranked opponent.', hint: '🎯 Opponent and difficulty closely matched to your rank', speed: 'Avg wait: 15s' },
  { id: 'timed-sprint', name: 'Timed Sprint', desc: 'Think fast, code faster. Compete against a closely ranked rival in a rapid-fire duel with adaptive difficulty and scaling time limits.', hint: '⚡ Adaptive timer and difficulty based on your skill', speed: 'Avg wait: 15s' },
  { id: 'topic-duel', name: 'Topic Duel', desc: 'Targeted, skill-based duels. Select your algorithmic topic while the system ensures a perfectly balanced rival and problem difficulty.', hint: '📚 Specific topic with rank-matched opponent and difficulty', speed: 'Topic selection' }
];

const MODE_OPTIONS = [
  { id: 'ranked', icon: Trophy, label: 'Ranked' },
  { id: 'casual', icon: Sparkles, label: 'Casual' }
];

const BattleLobby = () => {
  const navigate = useNavigate();
  const toast = useToast();
  useDocumentTitle('Battle');

  const myUser = useSelector(selectUser);
  const { lobbyStatus } = useSelector(state => state.battle);
  // Initialize socket connection for lobby presence
  useBattleSocket();

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
    <div className="w-full text-text-primary pb-24 relative overflow-hidden font-sans select-none transition-colors duration-300 animate-[fadeIn_0.4s_ease-out]">
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
        <div className="flex flex-col items-center justify-center mb-2 text-center relative z-10">
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-white tracking-tight">
            Choose Battle <span className="text-[#00F5C4]">Mode</span>
          </h2>
          <p className="text-slate-400 mt-2 text-[1.05rem] max-w-4xl mx-auto">
            {mode === 'ranked' 
              ? 'Pick your ranked format and prove your skills in synchronous arenas against players of similar rating.'
              : 'Join casual, unrated matches to practice without pressure or affecting your rating.'}
          </p>

          <div className="mt-8 w-full flex justify-center">
            <div className="flex bg-[#0D0F14] border border-slate-700/60 rounded-xl p-1 shadow-sm relative overflow-hidden">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMode(option.id)}
                  className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-lg text-[0.9rem] font-bold transition-colors capitalize ${
                    mode === option.id 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode === option.id && (
                    <motion.div
                      layoutId="lobbyTogglePill"
                      className="absolute inset-0 bg-[#00F5C4]/90 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <option.icon className="w-[18px] h-[18px]" /> {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ──── ARENA SELECTION & INVITE GRID ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch relative z-30">
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

        {/* ──── PRIVATE MATCHES SECTION TITLE ──── */}
        <div className="flex flex-col items-center justify-center mt-20 mb-10 text-center relative z-10">
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-white tracking-tight">
            Private <span className="text-[#00F5C4]">Matches</span>
          </h2>
          <p className="text-slate-400 mt-2 text-[1.05rem]">
            Set up a custom, unranked arena to settle scores, practice new algorithms, or just have fun coding with friends.
          </p>
        </div>

        {/* ──── INVITE A FRIEND PANEL ──── */}
        <div className="relative z-10 w-full">
          <InviteFriendCard
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSendInvite={handleSendInvite}
            topicOptions={topicOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default BattleLobby;

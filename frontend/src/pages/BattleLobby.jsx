import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swords, Users, Trophy, Eye, Zap, Search, Shield, Link2, Copy, Sparkles, Target } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../context/ThemeContext';
import { selectUser } from '../features/auth/authSlice';
import { useBattleSocket } from '../sockets/useBattleSocket';
import api from '../utils/api';
import { CustomDropdown } from '../components/ui';


const BATTLE_TYPES = [
  { id: '1v1', name: 'Ranked 1v1', desc: 'Direct Elo-rated duels against peer opponents.', icon: Swords, players: '842 active', speed: 'Avg wait: 15s', color: 'from-cyan-500/20 to-purple-500/20', borderColor: 'group-hover:border-cyan-400/50' },
  { id: 'sprint', name: 'Timed Sprint', desc: 'Fixed 5-minute speedruns to solve single easy challenges.', icon: Zap, players: '302 active', speed: 'Avg wait: 10s', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'group-hover:border-emerald-400/50' },
  { id: 'topic', name: 'Topic Battle', desc: 'Choose a topic and battle opponents who pick the same subject.', icon: Target, players: '247 active in DP · 189 in Graphs', speed: 'Topic selection', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'group-hover:border-pink-400/50' }
];

const BattleLobby = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [roomName, setRoomName] = useState('');
  const [langRestr, setLangRestr] = useState('any');
  const [isCopied, setIsCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  // Topic states
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicError, setTopicError] = useState('');
  const [activeTopicStats, setActiveTopicStats] = useState({});
  const [topicList, setTopicList] = useState([]);

  // Global invite state
  const [activeInvite, setActiveInvite] = useState(null);

  // Private Custom Lobbies states
  const [roomPassword, setRoomPassword] = useState('');
  const [roomDifficulty, setRoomDifficulty] = useState('Medium');
  const [roomTimeLimit, setRoomTimeLimit] = useState(1200); // 20 mins default
  const [isSpawningRoom, setIsSpawningRoom] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinRoomPassword, setJoinRoomPassword] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinRoomError, setJoinRoomError] = useState('');



  // Lobby active stats state
  const [lobbyStats, setLobbyStats] = useState(null);

  const myUser = useSelector(selectUser);
  const { lobbyStatus } = useSelector(state => state.battle);
  const { socket } = useBattleSocket();

  // 1. Fetch Lobby Stats & Refresh every 60s
  useEffect(() => {
    const fetchLobbyStats = async () => {
      try {
        const res = await api.get('/api/battles/lobby-stats');
        setLobbyStats(res.data);
      } catch {}
    };
    fetchLobbyStats();
    const interval = setInterval(fetchLobbyStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load topics and initial topic queue stats
  useEffect(() => {
    const fetchTopicsAndStats = async () => {
      try {
        const res = await api.get('/api/battles/topics');
        setTopicList(res.data.topics || []);
        setActiveTopicStats(res.data.stats || {});
      } catch {
        // Fallback static topics if backend fails
        setTopicList([
          "Arrays & Strings", "Linked Lists", "Stacks & Queues", "Trees & Graphs",
          "Dynamic Programming", "Recursion & Backtracking", "Sorting & Searching",
          "Greedy Algorithms", "Bit Manipulation", "Math & Number Theory",
          "Sliding Window", "Two Pointers", "Binary Search", "Heaps & Priority Queues",
          "Hashing"
        ]);
      }
    };
    fetchTopicsAndStats();
    const interval = setInterval(fetchTopicsAndStats, 30000); // refresh topic counts every 30s
    return () => clearInterval(interval);
  }, []);



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



  const handleSendInvite = (username) => {
    if (!username.trim()) {
      toast.error('Search Empty', 'Please input a username to invite.');
      return;
    }
    toast.success('Invite Sent! ✉️', `Battle invitation dispatched to @${username}.`);
    setSearchTerm('');
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!myUser) {
      navigate(`/login?redirect=/battle/lobby`);
      return;
    }
    if (!roomName.trim()) {
      toast.error('Required Field', 'Please enter a private room name.');
      return;
    }

    setIsSpawningRoom(true);
    try {
      const res = await api.post('/api/battles/private/create', {
        name: roomName.trim(),
        password: roomPassword,
        difficulty: roomDifficulty,
        timeLimit: roomTimeLimit
      });
      
      setGeneratedLink(res.data.shareLink);
      toast.success('Room Generated! 👥', `Private Custom Room "${roomName}" created successfully.`);
      
      setTimeout(() => {
        navigate(`/battle/private/${res.data.roomId}/lobby`);
      }, 1200);
    } catch (err) {
      toast.error('Failed to create room', err.response?.data?.message || 'Error occurred.');
    } finally {
      setIsSpawningRoom(false);
    }
  };

  const handleJoinPrivateRoom = async (e) => {
    if (e) e.preventDefault();
    if (!myUser) {
      navigate(`/login?redirect=/battle/lobby`);
      return;
    }
    if (!joinRoomCode.trim()) {
      setJoinRoomError('Please enter a room code');
      return;
    }
    setJoinRoomError('');
    setIsJoiningRoom(true);
    try {
      const res = await api.post('/api/battles/private/join', {
        roomCode: joinRoomCode.trim(),
        password: joinRoomPassword
      });
      toast.success('Joined Custom Lobby!', 'Entering wait room...');
      navigate(`/battle/private/${res.data.roomId}/lobby`);
    } catch (err) {
      setJoinRoomError(err.response?.data?.message || 'Invalid code or incorrect password.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    toast.success('Link Copied! 📋', 'Send this link to a friend to start the coding duel.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Dropdown options
  const topicOptions = topicList.map((topic) => ({
    value: topic,
    label: `${topic} ${activeTopicStats[topic] !== undefined && activeTopicStats[topic] > 0 ? `(${activeTopicStats[topic]} active)` : ''}`
  }));

  const difficultyOptions = [
    { value: 'Easy', label: 'Easy Level' },
    { value: 'Medium', label: 'Medium Level' },
    { value: 'Hard', label: 'Hard Level' },
    { value: 'Expert', label: 'Expert Level' }
  ];

  const timeLimitOptions = [
    { value: 300, label: '5 Minutes (Sprint)' },
    { value: 600, label: '10 Minutes' },
    { value: 900, label: '15 Minutes' },
    { value: 1200, label: '20 Minutes (Standard)' },
    { value: 1800, label: '30 Minutes' }
  ];

  return (
    <div className="w-full bg-base text-text-primary p-6 relative overflow-hidden font-sans select-none pb-4 pt-2 transition-colors duration-300 animate-[fadeIn_0.4s_ease-out]">
      
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
 
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
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
            className={`px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-md flex items-center gap-2 self-center md:self-auto ${
              isDark 
                ? 'bg-[#00F5C4] text-[#0D0F14] shadow-[#00F5C4]/25 hover:brightness-105' 
                : 'bg-[#4F6EF7] text-white shadow-[#4F6EF7]/25 hover:brightness-105'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Quick Ranked Match
          </button>
        </div>
 
        {/* ──── ARENA SELECTION CARDS ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BATTLE_TYPES.map((type) => {
            const isTopic = type.id === 'topic';
            
            return (
              <motion.div
                key={type.id}
                whileHover={{ y: -4 }}
                className={`bg-surface border border-border/80 hover:border-accent-primary/40 hover:shadow-lg rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 relative active:scale-[0.99] ${isTopic ? 'min-h-[290px] md:col-span-2 lg:col-span-1' : 'min-h-[200px]'}`}
                onClick={(e) => {
                  if (type.id === 'custom') {
                    document.getElementById('custom-room-form')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (!isTopic) {
                    handleQuickJoin(type.id);
                  }
                }}
              >
                {/* Accent glow clipped wrapper */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                  <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${type.color} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                </div>
   
                <div className="space-y-3 relative z-20 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-base border border-border flex items-center justify-center text-accent-primary shadow-sm mb-3">
                      <type.icon className="w-4.5 h-4.5 group-hover:rotate-6 transition-transform duration-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-text-primary text-sm tracking-tight">{type.name}</h3>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{type.desc}</p>
                    </div>
                  </div>

                  {/* ── CUSTOM SECTIONS INSIDE THE CARDS ── */}
                  {isTopic && (
                    <div className="space-y-2 mt-2">
                      <div className="space-y-1">
                        <CustomDropdown
                          value={selectedTopic}
                          onChange={(val) => {
                            setSelectedTopic(val);
                            setTopicError('');
                          }}
                          options={topicOptions}
                          placeholder="Select a topic..."
                          buttonClassName="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-3 py-2 text-xs outline-none text-text-secondary font-bold cursor-pointer flex items-center justify-between"
                        />
                        {topicError && (
                          <p className="text-red-500 text-[10px] mt-1 font-bold animate-pulse">{topicError}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
   
                <div className="flex flex-col mt-3 relative z-10 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-text-muted">
                      {isTopic 
                        ? (selectedTopic && activeTopicStats[selectedTopic] !== undefined 
                          ? `${activeTopicStats[selectedTopic]} active in ${selectedTopic}` 
                          : (lobbyStats?.topic !== undefined ? `${lobbyStats.topic} active` : '247 active in DP · 189 in Graphs'))
                        : (lobbyStats?.[type.id === '1v1' ? 'ranked' : type.id] !== undefined
                          ? `${lobbyStats[type.id === '1v1' ? 'ranked' : type.id]} active`
                          : type.players)
                      }
                    </span>
                    <span className="text-[10px] font-mono text-text-muted opacity-65">{type.speed}</span>
                  </div>

                  {isTopic ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleJoinTopicQueue(); }}
                      disabled={!selectedTopic || lobbyStatus === 'queuing'}
                      title={lobbyStatus === 'queuing' ? "Leave current queue first" : ""}
                      className={`w-full py-2 rounded-xl font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
                        selectedTopic && lobbyStatus !== 'queuing'
                          ? (isDark 
                            ? 'bg-[#00F5C4] hover:brightness-105 text-[#0D0F14]' 
                            : 'bg-[#4F6EF7] text-white hover:brightness-105')
                          : 'bg-elevated text-text-muted border border-border/40 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Enter Arena →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleQuickJoin(type.id); }}
                      disabled={lobbyStatus === 'queuing'}
                      title={lobbyStatus === 'queuing' ? "Leave current queue first" : ""}
                      className={`w-full py-2 rounded-xl font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
                        lobbyStatus !== 'queuing'
                          ? (isDark 
                            ? 'bg-[#00F5C4] hover:brightness-105 text-[#0D0F14]' 
                            : 'bg-[#4F6EF7] text-white hover:brightness-105')
                          : 'bg-elevated text-text-muted border border-border/40 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Enter Arena →
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
 
        {/* ──── UTILITY GRID (Invite & Private Rooms) ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* INVITE A FRIEND & JOIN PRIVATE LOBBY PANEL */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* INVITE FRIEND CARD */}
            <div className="bg-surface border border-border/80 shadow-md rounded-2xl p-6 sm:p-8 space-y-5 flex flex-col justify-start">
              <div className="space-y-4">
                <h2 className="text-sm uppercase font-extrabold tracking-widest text-accent-primary flex items-center gap-2">
                  <Users className="w-4 h-4" /> Invite a Friend
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">Search for active developers and challenge them to a live custom code duel.</p>
                
                <div className="relative">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search usernames... (e.g. yugank)"
                    className="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-text-muted pl-10 text-text-primary"
                  />
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSendInvite(searchTerm)}
                className="w-full py-3.5 mt-4 rounded-xl bg-elevated hover:bg-overlay border border-border hover:border-accent-primary text-text-primary text-xs font-bold transition-all duration-200 active:scale-[0.98] uppercase tracking-wider"
              >
                Send Battle Invitation
              </button>
            </div>

            {/* JOIN PRIVATE ROOM CARD */}
            <form onSubmit={handleJoinPrivateRoom} className="bg-surface border border-border/80 shadow-md rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-start">
              <div className="space-y-3">
                <h2 className="text-sm uppercase font-extrabold tracking-widest text-accent-primary flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Join Private Room
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">Enter a unique 8-character lobby room code to join an active friend's game.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <input
                      value={joinRoomCode}
                      onChange={(e) => { setJoinRoomCode(e.target.value); setJoinRoomError(''); }}
                      placeholder="e.g. ROOM-X82A"
                      className="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-3 py-2.5 text-xs outline-none transition-all placeholder:text-text-muted text-text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="password"
                      value={joinRoomPassword}
                      onChange={(e) => setJoinRoomPassword(e.target.value)}
                      placeholder="Password (optional)"
                      className="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-3 py-2.5 text-xs outline-none transition-all placeholder:text-text-muted text-text-primary"
                    />
                  </div>
                </div>
                {joinRoomError && (
                  <p className="text-red-500 text-[10px] font-bold animate-pulse">{joinRoomError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isJoiningRoom}
                className="w-full py-3.5 mt-2 rounded-xl bg-elevated hover:bg-overlay border border-border hover:border-accent-primary text-text-primary text-xs font-bold transition-all duration-200 active:scale-[0.98] uppercase tracking-wider disabled:opacity-50"
              >
                {isJoiningRoom ? 'Joining...' : 'Join Custom Room'}
              </button>
            </form>
          </div>

          {/* CREATE PRIVATE ROOM PANEL */}
          <form id="custom-room-form" onSubmit={handleCreateRoom} className="lg:col-span-7 bg-surface border border-border/80 shadow-md rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h2 className="text-sm uppercase font-extrabold tracking-widest text-accent-primary flex items-center gap-2">
                <Shield className="w-4 h-4" /> Custom Battle Lobby
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">Configure private settings and spawn dynamic code challenges with custom rules.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Room Name</label>
                  <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter custom room name..."
                    className="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-text-muted text-text-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Lobby Password (Optional)</label>
                  <input
                    type="password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    placeholder="Set custom entry password..."
                    className="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-text-muted text-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Difficulty Level</label>
                  <CustomDropdown
                    value={roomDifficulty}
                    onChange={(val) => setRoomDifficulty(val)}
                    options={difficultyOptions}
                    placeholder="Select Difficulty"
                    buttonClassName="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-4 py-3 text-xs outline-none text-text-secondary font-bold cursor-pointer flex items-center justify-between"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Match Time Limit</label>
                  <CustomDropdown
                    value={roomTimeLimit}
                    onChange={(val) => setRoomTimeLimit(parseInt(val, 10))}
                    options={timeLimitOptions}
                    placeholder="Select Time Limit"
                    buttonClassName="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-4 py-3 text-xs outline-none text-text-secondary font-bold cursor-pointer flex items-center justify-between"
                  />
                </div>
              </div>

              {/* Private Room Features Info Box */}
              <div className="mt-4 p-3.5 bg-elevated/40 border border-border/40 rounded-xl text-text-secondary">
                <p className="font-extrabold text-accent-primary uppercase tracking-wider text-[9px] mb-2 flex items-center gap-1.5">
                  ⭐ Custom Lobby Info
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] leading-relaxed">
                  <div className="space-y-0.5 border-r border-border/30 last:border-r-0 pr-2">
                    <span className="font-bold text-text-primary block">🔒 Invite Only</span>
                    <span className="text-text-muted text-[9px]">Joinable only via unique room code.</span>
                  </div>
                  <div className="space-y-0.5 border-r border-border/30 last:border-r-0 pr-2">
                    <span className="font-bold text-text-primary block">🏆 Custom Rules</span>
                    <span className="text-text-muted text-[9px]">Select any custom difficulty and match timer.</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-text-primary block">🚫 Unrated practice</span>
                    <span className="text-text-muted text-[9px]">Matches do not affect public Elo scores.</span>
                  </div>
                </div>
              </div>

            </div>
 
            {/* Generated Link Area */}
            {generatedLink ? (
              <div className="mt-4 p-3 bg-elevated border border-accent-blue/30 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Link2 className="w-4 h-4 text-accent-blue shrink-0" />
                  <span className="text-xs font-mono text-accent-blue truncate select-text">{generatedLink}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-lg bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white dark:hover:text-[#0D0F14] border border-accent-blue/20 transition-all font-mono text-[10px] font-bold flex items-center gap-1 shrink-0 active:scale-[0.95]"
                >
                  <Copy className="w-3.5 h-3.5" /> {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSpawningRoom}
                className={`w-full mt-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-md ${
                  isDark 
                    ? 'bg-[#00F5C4] text-[#0D0F14] shadow-[#00F5C4]/25 hover:brightness-105' 
                    : 'bg-[#4F6EF7] text-white shadow-[#4F6EF7]/25 hover:brightness-105'
                } disabled:opacity-50`}
              >
                {isSpawningRoom ? 'Spawning...' : 'Spawn Private Battle Room'}
              </button>
            )}
          </form>
          
        </div>
      </div>



    </div>
  );
};

export default BattleLobby;

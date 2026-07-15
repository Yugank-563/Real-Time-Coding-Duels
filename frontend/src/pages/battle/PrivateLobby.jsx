import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Swords, Clock, Code2 } from 'lucide-react';
import { selectUser } from '../../features/index';
import { useToast, useDocumentTitle } from '../../hooks/index';
import { useBattleSocket } from '../../hooks/index';
import { api } from '../../utils/index';

const PrivateLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const myUser = useSelector(selectUser);
  
  useDocumentTitle('Private Lobby');

  const [battle, setBattle] = useState(location.state?.roomData || null);
  const [isStarting, setIsStarting] = useState(false);

  // Hook into active WebSockets gateway connection
  const { socket } = useBattleSocket(roomId);

  const fetchLobbyDetails = async () => {
    try {
      const res = await api.get(`/api/battles/${roomId}`);
      
      // If user came via direct link but is not a participant yet
      if (res.data.isParticipant === false) {
        toast.error('You are not a participant in this private battle.');
        navigate('/');
        return;
      }

      setBattle(res.data);
      
      // If battle has already been started by host, direct redirect
      if (res.data.status === 'active') {
        navigate(`/battle/${roomId}`);
      } else if (res.data.status === 'ended' || res.data.status === 'cancelled') {
        toast.error('This private battle lobby is no longer active.');
        navigate('/');
      }
    } catch (err) {
      toast.error('This private battle lobby is no longer active.');
      navigate('/');
    }
  };

  useEffect(() => {
    if (roomId && myUser) {
      fetchLobbyDetails();
    }
  }, [roomId, myUser]);

  // Listen to socket events for player updates and battle starts
  useEffect(() => {
    if (socket) {
      const handlePlayerJoined = () => {
        fetchLobbyDetails();
        toast.info('A new participant entered the lobby.');
      };

      const handleBattleStart = () => {
        toast.success('Prepare yourself, the custom duel is beginning!');
        navigate(`/battle/${roomId}`);
      };

      const handlePlayerReady = (data) => {
        setBattle(prev => {
          if (!prev) return prev;
          const newPlayers = prev.players.map(p => 
            p.user?._id === data.userId || p.user === data.userId ? { ...p, status: 'ready' } : p
          );
          return { ...prev, players: newPlayers };
        });
        if (data.userId !== myUser?._id) {
          toast.info('The guest is ready for battle.');
        }
      };

      const handleLobbyClosed = (data) => {
        toast.error(data.message || 'The host has left the lobby.');
        navigate('/');
      };

      socket.on('battle:player_joined', handlePlayerJoined);
      socket.on('battle:start', handleBattleStart);
      socket.on('battle:player_ready', handlePlayerReady);
      socket.on('battle:lobby_closed', handleLobbyClosed);

      return () => {
        socket.off('battle:player_joined', handlePlayerJoined);
        socket.off('battle:start', handleBattleStart);
        socket.off('battle:player_ready', handlePlayerReady);
        socket.off('battle:lobby_closed', handleLobbyClosed);
      };
    }
  }, [socket, roomId]);

  // Track isStarting for unmount cleanup (Not needed if we remove unmount emit, but keeping for safety)
  const isStartingRef = useRef(isStarting);
  useEffect(() => {
    isStartingRef.current = isStarting;
  }, [isStarting]);

  const [isReadying, setIsReadying] = useState(false);

  const handleReadyUp = async () => {
    if (!battle) return;
    setIsReadying(true);
    try {
      await api.post(`/api/battles/private/${roomId}/ready`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    } finally {
      setIsReadying(false);
    }
  };



  const handleStartBattle = async () => {
    if (!battle) return;
    setIsStarting(true);
    try {
      await api.post(`/api/battles/private/${roomId}/start`);
      
      // Trigger socket broadcast to notify guests
      if (socket) {
        socket.emit('battle:start_countdown', { battleId: roomId });
      }
      
      navigate(`/battle/${roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lobby needs exactly 2 users to start.');
    } finally {
      setIsStarting(false);
    }
  };

  if (!battle) {
    return (
      <div className="min-h-[70vh] bg-base text-text-primary flex items-center justify-center font-sans">
        <p className="text-sm text-text-secondary animate-pulse italic">Retrieving private custom lobby...</p>
      </div>
    );
  }

  const isHost = battle.host === (myUser?._id || myUser?.id);
  const p1 = battle.players[0];
  const p2 = battle.players[1];
  
  const guest = battle.players.find(p => p.user?._id !== battle.host && p.user !== battle.host);
  const isGuestReady = guest?.status === 'ready';
  
  const myPlayerObj = battle.players.find(p => p.user?._id === (myUser?._id || myUser?.id) || p.user === (myUser?._id || myUser?.id));
  const isMyUserReady = myPlayerObj?.status === 'ready';

  try {
    return (
      <div className="w-full text-text-primary flex flex-col items-center justify-start py-4 px-4 relative font-sans select-none transition-colors duration-300">
      
      {/* ──── DYNAMIC BACKGROUND ──── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-accent-primary/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 flex flex-col gap-10 mt-6">
        
        {/* ──── 1. HERO TITLE ──── */}
        <div className="flex flex-col items-center text-center space-y-2">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-text-primary tracking-tight font-sans drop-shadow-md"
          >
            Prepare for Battle
          </motion.h1>
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs md:text-sm text-text-muted max-w-lg mx-auto leading-relaxed"
          >
            Improve your logic and steady your typing. Only the fastest, most optimized code will survive this encounter.
          </motion.p>
        </div>

        {/* ──── 2. VS BATTLE ARENA (PLAYER CARDS) ──── */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative z-10">
          
          {/* HOST CARD */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            whileHover={{ scale: 1.02 }}
            className={`w-full md:w-80 h-56 rounded-[2rem] border transition-all duration-300 relative overflow-hidden backdrop-blur-md flex flex-col items-center justify-center gap-3 group ${
              'bg-surface/30 border-border/40 hover:border-accent-primary/50 hover:bg-surface/50 hover:shadow-[0_0_40px_rgba(0,245,196,0.1)]'
            }`}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/0 via-transparent to-transparent group-hover:from-accent-primary/10 transition-colors duration-500 pointer-events-none" />

            <div className="absolute top-4 right-5 bg-surface/80 border border-border px-3 py-0.5 rounded-full z-10 backdrop-blur-sm">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">Host</span>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-20 h-20 bg-elevated border-[3px] border-border rounded-full flex items-center justify-center relative z-10 shadow-lg">
                <span className="text-2xl font-black text-text-primary tracking-tighter">
                  {p1.user.name?.substring(0,2).toUpperCase() || 'P1'}
                </span>
              </div>
            </div>

            <div className="text-center relative z-10 mt-1">
              <h2 className="text-lg font-black text-text-primary tracking-tight">@{p1.user.name}</h2>
              <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">ELO {p1.user.rating || 1200}</p>
            </div>
          </motion.div>

          {/* VS BADGE */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [-10, 0] }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-14 h-14 rounded-full bg-surface border-4 border-base flex items-center justify-center z-20 shadow-xl relative"
          >
            <div className="absolute inset-0 rounded-full border border-border/50"></div>
            <span className="text-lg font-black italic text-text-muted pr-0.5">VS</span>
          </motion.div>

          {/* GUEST CARD */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            whileHover={p2 ? { scale: 1.02 } : {}}
            className={`w-full md:w-80 h-56 rounded-[2rem] border transition-all duration-300 relative overflow-hidden backdrop-blur-md flex flex-col items-center justify-center gap-3 group ${
              !p2 
                ? 'bg-transparent border-dashed border-border/50 opacity-60' 
                : ('bg-surface/30 border-border/40 hover:border-pink-500/50 hover:bg-surface/50 hover:shadow-[0_0_40px_rgba(236,72,153,0.1)]')
            }`}
          >
            {p2 ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-transparent to-transparent group-hover:from-pink-500/10 transition-colors duration-500 pointer-events-none" />

                <div className="absolute top-4 right-5 bg-surface/80 border border-border px-3 py-0.5 rounded-full z-10 backdrop-blur-sm shadow-sm">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${p2.status === 'ready' ? 'text-accent-primary' : 'text-text-muted'}`}>
                    {p2.status === 'ready' ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
                
                <div className="relative">
                  <div className={`absolute inset-0 blur-xl rounded-full scale-110 transition-opacity duration-500 ${p2.status === 'ready' ? 'bg-accent-primary/20 opacity-100' : 'bg-pink-500/20 opacity-0 group-hover:opacity-100'}`}></div>
                  <div className={`w-20 h-20 bg-elevated border-[3px] rounded-full flex items-center justify-center relative z-10 shadow-lg transition-colors ${p2.status === 'ready' ? 'border-accent-primary' : 'border-border'}`}>
                    <span className="text-2xl font-black text-text-primary tracking-tighter">
                      {p2.user.name?.substring(0,2).toUpperCase() || 'P2'}
                    </span>
                  </div>
                </div>

                <div className="text-center relative z-10 mt-1">
                  <h2 className="text-lg font-black text-text-primary tracking-tight max-w-[180px] truncate">@{p2.user.name}</h2>
                  <p className="text-[10px] text-pink-500/80 font-bold tracking-widest uppercase mt-0.5">ELO {p2.user.rating || 1200}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center relative">
                   <div className="absolute inset-0 border-2 border-transparent border-t-accent-primary/40 rounded-full animate-spin"></div>
                   <span className="text-2xl text-text-muted opacity-30">?</span>
                </div>
                <div className="text-center space-y-1 mt-2">
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] animate-pulse">Searching</h2>
                  <p className="text-[10px] text-text-secondary/60 uppercase tracking-widest">Waiting for challenger</p>
                </div>
              </>
            )}
          </motion.div>

        </div>

        {/* ──── 3. LOBBY INFO & CONTROLS ──── */}
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 mt-6 relative z-10">
          
          {/* COMPACT SETTINGS ROW */}
          <div className="flex flex-wrap items-center justify-center gap-3">
             <div className="flex items-center gap-2 bg-surface/40 border border-border/30 px-4 py-2 rounded-full hover:bg-surface/60 transition-colors">
                <Swords className="w-4 h-4 text-text-muted"/>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted">Difficulty</span>
                <span className="text-xs font-black text-text-primary">{battle.difficulty || 'Medium'}</span>
             </div>
             <div className="flex items-center gap-2 bg-surface/40 border border-border/30 px-4 py-2 rounded-full hover:bg-surface/60 transition-colors">
                <Clock className="w-4 h-4 text-text-muted"/>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted">Time Limit</span>
                <span className="text-xs font-black text-text-primary">{(battle.timeLimit || 1200) / 60} Min</span>
             </div>
             {battle.topic && (
               <div className="flex items-center gap-2 bg-surface/40 border border-border/30 px-4 py-2 rounded-full hover:bg-surface/60 transition-colors">
                  <Code2 className="w-4 h-4 text-text-muted"/>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted">Topic</span>
                  <span className="text-xs font-black text-text-primary">{battle.topic}</span>
               </div>
             )}
          </div>



          {/* ACTION BUTTONS ROW */}
          <div className="w-full flex items-center justify-center gap-4 mt-4">
             {/* PRIMARY ACTION BUTTON */}
             <div className="flex-1 max-w-[200px]">
               {isHost ? (
                  <motion.button
                    whileHover={battle.players.length >= 2 && !isStarting && isGuestReady ? { scale: 1.02 } : {}}
                    whileTap={battle.players.length >= 2 && !isStarting && isGuestReady ? { scale: 0.98 } : {}}
                    onClick={handleStartBattle}
                    disabled={battle.players.length < 2 || isStarting || !isGuestReady}
                    className={`w-full h-[48px] rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center shadow-sm ${
                      battle.players.length >= 2 && !isStarting && isGuestReady
                        ? ('bg-gradient-to-r from-[#00F5C4] to-[#00d0a7] text-[#0D0F14] shadow-[0_0_20px_rgba(0,245,196,0.2)] hover:shadow-[0_0_30px_rgba(0,245,196,0.4)] border border-[#00F5C4]/30')
                        : 'bg-surface border-2 border-border text-text-secondary cursor-not-allowed opacity-90'
                    }`}
                  >
                    {isStarting ? 'Starting' : (!isGuestReady && battle.players.length >= 2 ? 'Waiting' : 'Start')}
                  </motion.button>
               ) : (
                  !isMyUserReady ? (
                    <motion.button
                      whileHover={!isReadying ? { scale: 1.02 } : {}}
                      whileTap={!isReadying ? { scale: 0.98 } : {}}
                      onClick={handleReadyUp}
                      disabled={isReadying}
                      className={`w-full h-[48px] rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center shadow-sm ${
                        'bg-gradient-to-r from-[#00F5C4] to-[#00d0a7] text-[#0D0F14] shadow-[0_0_20px_rgba(0,245,196,0.2)] hover:shadow-[0_0_30px_rgba(0,245,196,0.4)] border border-[#00F5C4]/30'
                      }`}
                    >
                      {isReadying ? 'Readying' : 'Ready'}
                    </motion.button>
                  ) : (
                    <div className="w-full h-[48px] rounded-[2rem] bg-surface border-2 border-accent-primary/40 flex items-center justify-center shadow-inner">
                      <span className="text-accent-primary font-black uppercase tracking-[0.2em] text-sm animate-pulse">
                        Waiting
                      </span>
                    </div>
                  )
               )}
             </div>

             {/* LEAVE BUTTON */}
             <button
               onClick={() => {
                 if (isHost && !isStarting) {
                   socket.emit('battle:leave_lobby', { battleId: battle._id });
                 }
                 navigate('/');
               }}
               className="flex-1 max-w-[200px] h-[48px] rounded-[2rem] bg-surface hover:bg-red-500/10 border-2 border-border hover:border-red-500 text-text-secondary hover:text-red-500 font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 flex items-center justify-center shadow-sm"
             >
               Leave
             </button>
          </div>
      </div>
    </div>
    </div>
    );
  } catch (err) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-red-500 flex-col gap-4">
        <h1 className="text-2xl font-bold">React Render Error</h1>
        <pre className="bg-black/50 p-4 rounded text-sm max-w-2xl overflow-auto">{err.stack || err.message}</pre>
      </div>
    );
  }
};

export default PrivateLobby;

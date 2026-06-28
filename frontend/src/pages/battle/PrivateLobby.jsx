import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Shield, Link2, Copy, Play } from 'lucide-react';
import { selectUser } from '../../features/index';
import { useToast, useDocumentTitle } from '../../hooks/index';
import { useTheme } from '../../hooks/useTheme';
import { useBattleSocket } from '../../hooks/index';
import { api } from '../../utils/index';

const PrivateLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const myUser = useSelector(selectUser);
  
  useDocumentTitle('Private Lobby');

  const [battle, setBattle] = useState(location.state?.roomData || null);
  const [isStarting, setIsStarting] = useState(false);

  // Hook into active WebSockets gateway connection
  const { socket } = useBattleSocket(roomId);

  const fetchLobbyDetails = async () => {
    try {
      const res = await api.get(`/api/battles/${roomId}`);
      setBattle(res.data);
      
      // If battle has already been started by host, direct redirect
      if (res.data.status === 'active') {
        navigate(`/battle/${roomId}`);
      }
    } catch (err) {
      toast.error('Lobby Expired', 'This private battle lobby is no longer active.');
      navigate('/battle/lobby');
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
        toast.info('User Joined! 👥', 'A new participant entered the lobby.');
      };

      const handleBattleStart = () => {
        toast.success('Battle Starting! ⚔️', 'Prepare yourself, the custom duel is beginning!');
        navigate(`/battle/${roomId}`);
      };

      socket.on('battle:player_joined', handlePlayerJoined);
      socket.on('battle:start', handleBattleStart);

      return () => {
        socket.off('battle:player_joined', handlePlayerJoined);
        socket.off('battle:start', handleBattleStart);
      };
    }
  }, [socket, roomId]);

  const handleCopyCode = () => {
    if (!battle) return;
    navigator.clipboard.writeText(battle.roomCode);
    toast.success('Code Copied! 📋', 'Send this code to your opponent.');
  };

  const handleCopyLink = () => {
    if (!battle) return;
    const link = `${window.location.origin}/battle/private/${roomId}/lobby`;
    navigator.clipboard.writeText(link);
    toast.success('Lobby Link Copied! 📋', 'Opponent can join via this link.');
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
      toast.error('Cannot Start Battle', err.response?.data?.message || 'Lobby needs exactly 2 users to start.');
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

  return (
    <div className="min-h-[80vh] w-full bg-base text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none animate-[fadeIn_0.4s_ease-out] transition-colors duration-300">
      
      {/* ──── DOT GRID BACKGROUND ──── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-accent-primary/10 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        
        {/* Lobby Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[10px] font-bold uppercase tracking-wider font-mono">
            <Shield className="w-3.5 h-3.5" /> Private custom Arena
          </span>
          <h1 className="text-3xl font-black tracking-tight">{battle.roomName || 'Custom Coding Duel'}</h1>
          <p className="text-xs text-text-secondary">Host your friends in custom programming challenges and rate your skills.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Room details and Codes */}
          <div className="md:col-span-7 bg-surface border border-border shadow-md rounded-2xl p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-primary">Lobby Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-elevated p-3.5 rounded-xl border border-border/80">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Difficulty</span>
                  <p className="text-sm font-extrabold text-text-primary mt-1">{battle.difficulty || 'Medium'}</p>
                </div>
                <div className="bg-elevated p-3.5 rounded-xl border border-border/80">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Time Limit</span>
                  <p className="text-sm font-extrabold text-text-primary mt-1">{(battle.timeLimit || 1200) / 60} Minutes</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Lobby Share Link</label>
                  <div className="flex bg-elevated border border-border rounded-xl px-3 py-2.5 items-center justify-between gap-3">
                    <span className="text-xs font-mono truncate text-text-secondary select-text">
                      {window.location.origin}/battle/private/{roomId}/lobby
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="text-text-muted hover:text-accent-primary shrink-0 transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Lobby Room Code</label>
                  <div className="flex bg-elevated border border-border rounded-xl px-3 py-2.5 items-center justify-between gap-3">
                    <span className="text-sm font-black font-mono tracking-widest text-text-primary select-all">
                      {battle.roomCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="text-text-muted hover:text-accent-primary shrink-0 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA action */}
            {isHost ? (
              <button
                onClick={handleStartBattle}
                disabled={battle.players.length < 2 || isStarting}
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5 ${
                  battle.players.length >= 2 && !isStarting
                    ? (isDark 
                      ? 'bg-[#00F5C4] text-[#0D0F14] shadow-[#00F5C4]/25 hover:brightness-105' 
                      : 'bg-[#4F6EF7] text-white shadow-[#4F6EF7]/25 hover:brightness-105')
                    : 'bg-elevated text-text-muted border border-border/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4" /> {isStarting ? 'Starting...' : 'Start Battle 🚀'}
              </button>
            ) : (
              <div className="p-3.5 bg-elevated border border-border/60 rounded-xl text-center">
                <p className="text-[10px] text-text-muted animate-pulse font-bold uppercase tracking-wider">
                  Waiting for host to start battle...
                </p>
              </div>
            )}
          </div>

          {/* Right Block: Active players */}
          <div className="md:col-span-5 bg-surface border border-border shadow-md rounded-2xl p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-primary">Lobby Users</h3>
              
              <div className="space-y-3">
                {/* Host */}
                <div className="flex items-center justify-between p-3 bg-elevated rounded-xl border border-border/80 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center text-xs font-bold text-accent-primary font-mono">
                      {p1?.user?.name?.slice(0, 2).toUpperCase() || 'ME'}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-text-primary">@{p1?.user?.name || 'Host'}</h4>
                      <span className="text-[9px] text-text-muted font-bold font-mono">⭐ ELO {p1?.user?.rank || 1200}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-accent-primary/20 bg-accent-primary/10 text-accent-primary uppercase tracking-widest font-mono shrink-0">
                    Host
                  </span>
                </div>

                {/* Guest / Opponent */}
                {p2 ? (
                  <div className="flex items-center justify-between p-3 bg-elevated rounded-xl border border-border/80 relative overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xs font-bold text-pink-400 font-mono">
                        {p2.user?.name?.slice(0, 2).toUpperCase() || 'OP'}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-text-primary">@{p2.user?.name || 'Guest'}</h4>
                        <span className="text-[9px] text-text-muted font-bold font-mono">⭐ ELO {p2.user?.rank || 1200}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 uppercase tracking-widest font-mono shrink-0">
                      Ready
                    </span>
                  </div>
                ) : (
                  <div className="border border-dashed border-border/80 rounded-xl p-6 text-center text-text-muted space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider animate-pulse">Searching for Opponent...</p>
                    <p className="text-[9px] leading-relaxed text-text-muted/65">
                      Send the share link or room code to invite a competitor!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/battle/lobby')}
              className="py-3 w-full bg-elevated hover:bg-red-500/10 border border-border hover:border-red-500 text-text-secondary hover:text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Leave Lobby
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PrivateLobby;

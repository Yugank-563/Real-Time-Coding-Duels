import { Shield } from 'lucide-react';

const JoinRoomCard = ({ 
  joinRoomCode, 
  setJoinRoomCode, 
  joinRoomPassword, 
  setJoinRoomPassword, 
  joinRoomError, 
  setJoinRoomError, 
  isJoiningRoom, 
  handleJoinPrivateRoom 
}) => {
  return (
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
  );
};

export default JoinRoomCard;

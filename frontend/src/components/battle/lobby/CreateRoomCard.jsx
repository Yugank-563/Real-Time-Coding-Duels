import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Link2, Copy } from 'lucide-react';
import { useTheme } from '../../../hooks/ui/useTheme';
import { useToast } from '../../../hooks/ui/useToast';
import CustomDropdown from '../../ui/CustomDropdown';

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

const CreateRoomCard = ({
  roomName, setRoomName,
  roomPassword, setRoomPassword,
  roomDifficulty, setRoomDifficulty,
  roomTimeLimit, setRoomTimeLimit,
  isSpawningRoom,
  generatedLink,
  handleCreateRoom
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    toast.success('Link Copied! 📋', 'Send this link to a friend to start the coding duel.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
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
          className={`w-full mt-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-md ${isDark
            ? 'bg-[#00F5C4] text-[#0D0F14] shadow-[#00F5C4]/25 hover:brightness-105'
            : 'bg-[#4F6EF7] text-white shadow-[#4F6EF7]/25 hover:brightness-105'
            } disabled:opacity-50`}
        >
          {isSpawningRoom ? 'Spawning...' : 'Spawn Private Battle Room'}
        </button>
      )}
    </form>
  );
};

export default CreateRoomCard;

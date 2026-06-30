import { useState } from 'react';
import { Users, Swords, Zap, Target } from 'lucide-react';
import CustomDropdown from '../../ui/CustomDropdown';

const TIME_LIMITS = { '1v1': 1200, 'sprint': 600, 'topic': 1200 };

const ICONS = { '1v1': Swords, 'sprint': Zap, 'topic': Target };

const InviteFriendCard = ({ searchTerm, setSearchTerm, handleSendInvite, topicOptions }) => {
  const [battleType, setBattleType] = useState('1v1');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');

  const handleInvite = () => {
    const timeLimit = TIME_LIMITS[battleType] || 1200;
    handleSendInvite(searchTerm, 'casual', battleType, topic, timeLimit, difficulty);
  };

  return (
    <div className="bg-surface border border-border/80 shadow-md rounded-2xl p-6 sm:p-8 relative">
      {/* Background glow clipped wrapper */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -z-10" />
      </div>
      
      <div className="flex flex-col gap-6 relative z-10">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-sm uppercase font-extrabold tracking-widest text-accent-primary flex items-center gap-2">
            <Users className="w-4 h-4" /> Invite a Friend
          </h2>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider text-center">
            ⚔️ Casual Sparring
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">Challenge a friend or rival to a private, unranked coding duel to sharpen your skills together.</p>

        {/* ──── MAIN INPUT ROW ──── */}
        <div className="flex flex-col sm:flex-row gap-3 animate-[fadeIn_0.2s_ease-out]">
          {/* ──── BATTLE MODE SELECTION ──── */}
          <div className="w-full sm:w-1/3 shrink-0">
            <CustomDropdown
              value={battleType}
              onChange={setBattleType}
              options={[
                { value: '1v1', label: 'Random Duel' },
                { value: 'sprint', label: 'Timed Sprint' },
                { value: 'topic', label: 'Topic Battle' }
              ]}
              placeholder="Select Mode"
            />
          </div>

          {/* ──── DIFFICULTY SELECTION ──── */}
          <div className="w-full sm:w-1/3 shrink-0">
            <CustomDropdown
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' }
              ]}
              placeholder="Difficulty"
            />
          </div>

          {/* ──── USERNAME SEARCH ──── */}
          <div className="relative w-full sm:flex-1 shrink-0">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter friend's username..."
              className="auth-input w-full h-11 pl-11 text-xs"
            />
            <Users className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* ──── TOPIC SELECTION (ONLY IF TOPIC BATTLE) ──── */}
        {battleType === 'topic' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <CustomDropdown
              value={topic}
              onChange={setTopic}
              options={topicOptions || []}
              placeholder="Select a topic..."
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleInvite}
        className="w-full h-11 rounded-xl bg-[var(--auth-btn)] text-[var(--auth-btn-text)] hover:brightness-105 shadow-[0_4px_14px_var(--auth-btn)]/30 text-xs font-bold transition-all duration-300 active:scale-[0.98] uppercase tracking-wider mt-4"
      >
        Send Battle Invitation
      </button>
      </div>
    </div>
  );
};

export default InviteFriendCard;

import { useState } from 'react';
import { Users } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TIME_LIMITS = { 'random-duel': 1200, 'timed-sprint': 600, 'topic-duel': 1200 };

const InviteFriendCard = ({ searchTerm, setSearchTerm, handleSendInvite, topicOptions }) => {
  const [battleType, setBattleType] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const handleInvite = () => {
    const timeLimit = TIME_LIMITS[battleType] || 1200;
    handleSendInvite(searchTerm, 'casual', battleType, topic, timeLimit, difficulty);
  };

  return (
    <Card className="p-6 sm:p-8 relative">
      {/* Background glow clipped wrapper */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -z-10" />
      </div>
      
      <div className="flex flex-col gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <h2 className="text-sm uppercase font-extrabold tracking-widest text-accent-primary flex items-center gap-2">
              <Users className="w-4 h-4" /> Invite a Friend
            </h2>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider text-center">
              Casual Sparring
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Select your match settings and enter an opponent's username to send a direct invitation.
          </p>
        </div>

        {/* ──── INPUT GRID ──── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-[fadeIn_0.2s_ease-out]">
          {/* ──── BATTLE MODE SELECTION ──── */}
          <div className="w-full shrink-0">
            <CustomDropdown
              value={battleType}
              onChange={setBattleType}
              options={[
                { value: 'random-duel', label: 'Random Duel' },
                { value: 'timed-sprint', label: 'Timed Sprint' },
                { value: 'topic-duel', label: 'Topic Duel' }
              ]}
              placeholder="Select Mode"
            />
          </div>

          {/* ──── TOPIC SELECTION (ONLY IF TOPIC BATTLE) ──── */}
          {battleType === 'topic-duel' && (
            <div className="w-full shrink-0 animate-[fadeIn_0.2s_ease-out]">
              <CustomDropdown
                value={topic}
                onChange={setTopic}
                options={topicOptions || []}
                placeholder="Select Problem Topic"
              />
            </div>
          )}

          {/* ──── DIFFICULTY SELECTION ──── */}
          <div className="w-full shrink-0">
            <CustomDropdown
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' }
              ]}
              placeholder="Select Difficulty"
            />
          </div>

          {/* ──── USERNAME SEARCH ──── */}
          <div className={`w-full shrink-0 ${battleType !== 'topic-duel' ? 'sm:col-span-2' : ''}`}>
            <Input
              icon={<Users className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter friend's username..."
              className="h-11 text-xs"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4 border-t border-border/40 pt-4">
        <Button
          variant="primary"
          onClick={handleInvite}
          className="w-full py-3 text-[0.95rem] tracking-wide shrink-0"
        >
          Invite Friend
        </Button>
      </div>
    </Card>
  );
};

export default InviteFriendCard;
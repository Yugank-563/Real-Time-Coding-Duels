import { useState } from 'react';
import { Users, Swords, Zap, Target } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TIME_LIMITS = { 'random-duel': 1200, 'timed-sprint': 600, 'topic-duel': 1200 };

const ICONS = { 'random-duel': Swords, 'timed-sprint': Zap, 'topic-duel': Target };

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
      
      <div className="flex flex-col gap-6 relative z-10">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-sm uppercase font-extrabold tracking-widest text-accent-primary flex items-center gap-2">
            <Users className="w-4 h-4" /> Invite a Friend
          </h2>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider text-center">
            Casual Sparring
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
                { value: 'random-duel', label: 'Random Duel' },
                { value: 'timed-sprint', label: 'Timed Sprint' },
                { value: 'topic-duel', label: 'Topic Duel' }
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
              placeholder="Select Difficulty"
            />
          </div>

          {/* ──── USERNAME SEARCH ──── */}
          <div className="w-full sm:flex-1 shrink-0">
            <Input
              icon={<Users className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter friend's username..."
              className="h-11 text-xs"
            />
          </div>
        </div>

        {/* ──── TOPIC SELECTION (ONLY IF TOPIC BATTLE) ──── */}
        {battleType === 'topic-duel' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <CustomDropdown
              value={topic}
              onChange={setTopic}
              options={topicOptions || []}
              placeholder="Select Problem Topic"
            />
          </div>
        )}
      </div>

      <Button
        variant="primary"
        size="full"
        onClick={handleInvite}
        className="mt-4"
      >
        Invite Friend
      </Button>
      </div>
    </Card>
  );
};

export default InviteFriendCard;

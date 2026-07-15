import { motion} from 'framer-motion';
import CustomDropdown from '../ui/CustomDropdown';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ArenaCard = ({ 
  type, 
  isTopic, 
  selectedTopic, 
  setSelectedTopic, 
  topicError, 
  setTopicError, 
  topicOptions, 
  activeTopicStats, 
  lobbyStats, 
  lobbyStatus, 
  handleJoinTopicQueue, 
  handleQuickJoin 
}) => {
    
  return (
    <Card
      as={motion.div}
      whileHover={{ y: -4 }}
      hover={true}
      className={`p-8 flex flex-col group transition-all duration-300 relative active:scale-[0.99] ${isTopic ? 'h-full md:col-span-2' : 'h-full'}`}
    >
      <div className="relative z-20 flex-1 flex flex-col">
        <div className="flex flex-col gap-3">
          <div className="space-y-1 mb-2">
            <h3 className="font-black text-accent-primary text-lg tracking-wider drop-shadow-sm">{type.name}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{type.desc}</p>
          </div>
          {type.hint && (
            <div className="inline-flex mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-primary/10 text-[10px] text-accent-primary font-bold">
                {type.hint}
              </span>
            </div>
          )}
        </div>

        {/* ── CUSTOM SECTIONS INSIDE THE CARDS ── */}
        {isTopic && (
          <div className="mt-4 flex-1">
            <div className="space-y-1">
              <CustomDropdown
                value={selectedTopic}
                onChange={(val) => {
                  setSelectedTopic(val);
                  setTopicError('');
                }}
                options={topicOptions}
                placeholder="Select Problem Topic"
              />
              {topicError && (
                <p className="text-red-500 text-[10px] mt-1 font-bold animate-pulse">{topicError}</p>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push stats to bottom if card is taller */}
        <div className="flex-1" />

        <div className="flex flex-col mt-4 pt-3 border-t border-border/40 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-text-muted">
              {isTopic
                ? (selectedTopic && activeTopicStats[selectedTopic] !== undefined
                  ? `${activeTopicStats[selectedTopic]} active in ${selectedTopic}`
                  : (lobbyStats?.topic !== undefined ? `${lobbyStats.topic} active` : <span className="animate-pulse">Loading stats...</span>))
                : (lobbyStats?.[type.id === 'random-duel' ? 'ranked' : type.id] !== undefined
                  ? `${lobbyStats[type.id === 'random-duel' ? 'ranked' : type.id]} active`
                  : <span className="animate-pulse">Loading stats...</span>)
              }
            </span>
            <span className="text-[10px] font-mono text-text-muted opacity-65">{type.speed}</span>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant={isTopic ? (selectedTopic && lobbyStatus !== 'queuing' ? 'primary' : 'secondary') : (lobbyStatus !== 'queuing' ? 'primary' : 'secondary')}
              onClick={(e) => {
                e.stopPropagation();
                isTopic ? handleJoinTopicQueue() : handleQuickJoin(type.id);
              }}
              disabled={isTopic ? (!selectedTopic || lobbyStatus === 'queuing') : (lobbyStatus === 'queuing')}
              title={lobbyStatus === 'queuing' ? "Leave current queue first" : ""}
              className="w-full py-3 text-[0.95rem] tracking-wide shrink-0"
            >
              FIND OPPONENT
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ArenaCard;

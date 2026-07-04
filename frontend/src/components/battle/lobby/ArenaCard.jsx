import { motion} from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import CustomDropdown from '../../ui/CustomDropdown';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-surface border border-border/80 hover:border-accent-primary/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-5 flex flex-col group transition-all duration-300 relative active:scale-[0.99] ${isTopic ? 'h-full md:col-span-2 lg:col-span-1' : 'h-full'}`}
      onClick={(e) => {
        if (type.id === 'custom') {
          document.getElementById('custom-room-form')?.scrollIntoView({ behavior: 'smooth' });
        } else if (!isTopic) {
          handleQuickJoin(type.id);
        }
      }}
    >
      <div className="relative z-20 flex-1 flex flex-col">
        <div className="flex flex-col gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} border border-border/50 flex items-center justify-center text-accent-primary shadow-sm`}>
            <type.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-text-primary drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-text-primary text-sm tracking-tight">{type.name}</h3>
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
                placeholder="Select a topic..."
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
                : (lobbyStats?.[type.id === '1v1' ? 'ranked' : type.id] !== undefined
                  ? `${lobbyStats[type.id === '1v1' ? 'ranked' : type.id]} active`
                  : <span className="animate-pulse">Loading stats...</span>)
              }
            </span>
            <span className="text-[10px] font-mono text-text-muted opacity-65">{type.speed}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              isTopic ? handleJoinTopicQueue() : handleQuickJoin(type.id);
            }}
            disabled={isTopic ? (!selectedTopic || lobbyStatus === 'queuing') : (lobbyStatus === 'queuing')}
            title={lobbyStatus === 'queuing' ? "Leave current queue first" : ""}
            className={`w-full h-9 rounded-xl font-extrabold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all duration-300 ${
              (isTopic ? (selectedTopic && lobbyStatus !== 'queuing') : (lobbyStatus !== 'queuing'))
                ? (isDark
                  ? 'bg-[#00F5C4] hover:bg-[#00F5C4]/90 text-[#0D0F14] shadow-[0_0_15px_rgba(0,245,196,0.3)] hover:shadow-[0_0_20px_rgba(0,245,196,0.5)]'
                  : 'bg-[#4F6EF7] text-white hover:brightness-110 shadow-[0_0_15px_rgba(79,110,247,0.3)] hover:shadow-[0_0_20px_rgba(79,110,247,0.5)]')
                : 'bg-elevated text-text-muted border border-border/40 opacity-50 cursor-not-allowed'
            }`}
          >
            FIND MATCH
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ArenaCard;

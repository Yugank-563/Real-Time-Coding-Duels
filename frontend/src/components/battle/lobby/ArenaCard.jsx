import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/ui/useTheme';
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
                : type.users)
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
          className={`w-full py-2 rounded-xl font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
            (isTopic ? (selectedTopic && lobbyStatus !== 'queuing') : (lobbyStatus !== 'queuing'))
              ? (isDark
                ? 'bg-[#00F5C4] hover:brightness-105 text-[#0D0F14]'
                : 'bg-[#4F6EF7] text-white hover:brightness-105')
              : 'bg-elevated text-text-muted border border-border/40 opacity-50 cursor-not-allowed'
          }`}
        >
          Enter Arena →
        </button>
      </div>
    </motion.div>
  );
};

export default ArenaCard;

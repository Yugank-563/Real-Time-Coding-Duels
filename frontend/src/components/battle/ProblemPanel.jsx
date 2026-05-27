import React, { useState } from 'react';
import { Award, BookOpen, AlertTriangle, MessageSquare, Lightbulb, Lock, HelpCircle } from 'lucide-react';

const ProblemPanel = ({ problem, hasSubmitted }) => {
  const [activeTab, setActiveTab] = useState('problem');
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  if (!problem) {
    return (
      <div className="bg-[#141B2D] border border-[#1E2D40] rounded-2xl p-6 h-full flex items-center justify-center text-[#7A9AB8] italic">
        Loading problem details...
      </div>
    );
  }

  const { title, description, difficulty, tags, constraints, testCases } = problem;

  const handleUnlockHint = () => {
    setHintUnlocked(true);
    setShowHintModal(false);
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (diff === 'Medium') return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    if (diff === 'Hard') return 'text-red-400 border-red-500/20 bg-red-500/10';
    return 'text-purple-400 border-purple-500/20 bg-purple-500/10';
  };

  const sampleCases = testCases?.filter((tc) => tc.isSample) || [];

  return (
    <div className="bg-[#141B2D] border border-[#1E2D40] rounded-2xl flex flex-col h-full overflow-hidden shadow-lg">
      
      {/* ── STICKY HEADER ── */}
      <div className="p-5 border-b border-[#1E2D40] flex items-center justify-between gap-4 shrink-0 bg-[#141B2D]">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white tracking-tight">{title}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
            {tags?.map((t) => (
              <span key={t} className="text-[9px] font-bold text-[#7A9AB8] bg-[#0D1520] border border-[#1E2D40] px-2 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Hint button */}
        <button
          onClick={() => setShowHintModal(true)}
          className={`flex items-center gap-1 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border transition-all ${
            hintUnlocked
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:brightness-110'
              : 'text-[#7A9AB8] bg-[#0D1520] border-[#1E2D40] hover:border-amber-400/30'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" /> {hintUnlocked ? 'Show Hint' : 'Unlock Hint'}
        </button>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex bg-[#0D1520]/40 border-b border-[#1E2D40] px-2 shrink-0">
        {[
          { id: 'problem', label: 'Problem', icon: BookOpen },
          { id: 'examples', label: 'Examples', icon: Award },
          { id: 'constraints', label: 'Constraints', icon: AlertTriangle },
          { id: 'discuss', label: 'Discuss', icon: MessageSquare }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 font-mono transition-all ${
                isActive
                  ? 'text-[#00E5FF] border-[#00E5FF] bg-[#141B2D]'
                  : 'text-[#7A9AB8] border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB PANELS CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-5 text-xs text-[#E0E6F0] leading-relaxed space-y-4 font-sans select-text">
        
        {/* TAB 1: DESCRIPTION */}
        {activeTab === 'problem' && (
          <div className="space-y-4 whitespace-pre-wrap">
            <p>{description}</p>

            <div className="bg-[#0D1520] border border-[#1E2D40] rounded-xl p-4 space-y-3 font-mono text-[11px] leading-relaxed">
              <span className="text-[10px] text-[#7A9AB8] font-bold uppercase tracking-wider block">Example Workspace Matrix</span>
              {sampleCases.slice(0, 1).map((sc, i) => (
                <div key={i} className="space-y-1">
                  <div><span className="text-[#7A9AB8]">Input:</span> <span className="text-white">{sc.input}</span></div>
                  <div><span className="text-[#7A9AB8]">Output:</span> <span className="text-[#00E5FF]">{sc.output}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EXAMPLES */}
        {activeTab === 'examples' && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Sample Test Scenarios</h4>
            {sampleCases.map((sc, i) => (
              <div key={i} className="bg-[#0D1520] border border-[#1E2D40] rounded-xl p-4 space-y-2 font-mono text-[11px]">
                <div className="text-[9px] text-[#00E5FF] font-bold uppercase">Example Case #{i + 1}</div>
                <div><span className="text-[#7A9AB8]">Input:</span> <span className="text-white">{sc.input}</span></div>
                <div><span className="text-[#7A9AB8]">Output:</span> <span className="text-[#00E5FF]">{sc.output}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CONSTRAINTS */}
        {activeTab === 'constraints' && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Execution Resource Constraints</h4>
            <ul className="list-disc pl-5 space-y-2 text-[#7A9AB8]">
              <li>Time limit per case: <strong className="text-white">{constraints?.timeLimit || 2} seconds</strong>.</li>
              <li>Memory limit per case: <strong className="text-white">{constraints?.memoryLimit || 256} MB</strong>.</li>
              <li>Standard sandboxed constraints enforce strictly read-only execution directories.</li>
              <li>Standard networking hooks inside docker sandboxes remain disabled.</li>
            </ul>
          </div>
        )}

        {/* TAB 4: DISCUSS */}
        {activeTab === 'discuss' && (
          <div className="space-y-4 text-center py-6 text-[#7A9AB8]">
            <HelpCircle className="w-10 h-10 text-[#7A9AB8]/30 mx-auto" />
            <p className="text-xs">Discussion boards are locked during active matches to prevent cheating.</p>
          </div>
        )}

      </div>

      {/* ── UNLOCK HINT MODAL OVERLAY ── */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans select-none">
          <div className="bg-[#141B2D] border border-[#1E2D40] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
            
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-white text-base">Unlock Problem Hint?</h3>
              <p className="text-xs text-[#7A9AB8]">Unlocking the tactical hint will deduct <strong className="text-amber-400">-10 XP</strong> points from your seasonal score.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowHintModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0D1520] border border-[#1E2D40] text-xs font-bold font-mono transition-all text-[#7A9AB8] hover:text-white"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleUnlockHint}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[#0B0F1A] text-xs font-bold font-mono transition-all hover:brightness-115 flex items-center justify-center gap-1"
              >
                Unlock (-10 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHOW ACTIVE UNLOCKED HINT ── */}
      {hintUnlocked && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 border-t-0 text-[11px] leading-relaxed text-[#7A9AB8] shrink-0 font-sans p-4 flex gap-2">
          <span className="text-amber-400 shrink-0">💡 Hint:</span>
          <div>
            {problem.title === 'Two Sum' 
              ? 'Think about using an unordered_map to map elements to their indices, allowing complement search in O(1) time.' 
              : 'Try reverse parsing the string representation or using modulus mathematics to extract digits without casting.'}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProblemPanel;

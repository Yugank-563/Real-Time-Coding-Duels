import { useState } from 'react';
import DOMPurify from 'dompurify';
import { BookOpen, ExternalLink, Lightbulb } from 'lucide-react';
import { getDifficultyConfig } from '../../utils/index';

export const ProblemPanel = ({ problem, hasSubmitted, mode }) => {
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  if (!problem) {
    return (
      <div className="bg-surface h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-elevated border border-border mx-auto flex items-center justify-center animate-pulse">
            <BookOpen className="w-5 h-5 text-text-muted" />
          </div>
          <p className="text-sm text-text-muted italic">Loading problem details…</p>
        </div>
      </div>
    );
  }

  const { title, description, difficulty, tags } = problem;

  const handleUnlockHint = () => {
    setHintUnlocked(true);
    setShowHintModal(false);
  };

  const diffConfig = getDifficultyConfig(difficulty);
  const isCF = problem.source === 'codeforces';

  const hintText = problem.hints && problem.hints.length > 0
    ? problem.hints[0]
    : (problem.title === 'Two Sum'
        ? 'Think about using an unordered_map to map elements to their indices, allowing complement lookup in O(1) time.'
        : 'Try breaking the problem into sub-problems. Consider edge cases: empty input, single element, duplicates.');

  return (
    <div className="bg-surface flex flex-col h-auto lg:h-full lg:overflow-hidden relative">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />

      {/* ── COMPACT STICKY HEADER ── */}
      <div className="h-12 px-5 border-b border-border flex items-center justify-between gap-3 shrink-0 bg-elevated/50 select-none">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue" />
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            {title}
          </h3>
          {/* Difficulty badge */}
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border font-mono ${diffConfig.color} ${diffConfig.bg} ${diffConfig.border}`}>
            {difficulty}
          </span>
        </div>

      </div>

      {/* ── CONTENT (scrollable) ── */}
      <div className="flex-1 overflow-visible lg:overflow-y-auto px-5 py-4 select-text space-y-4 problem-scroll">
        {/* Unlocked hint inline at top of scrollable content */}
        {hintUnlocked && (
          <div className="p-3 rounded-xl bg-amber-500/6 border border-amber-500/20 flex gap-2 mb-1">
            <span className="text-amber-400 shrink-0 text-sm">💡</span>
            <p className="text-[11px] text-text-secondary leading-relaxed">{hintText}</p>
          </div>
        )}
        <div className="space-y-4">
          {isCF ? (
            <div className="space-y-4">
              {/* CF redirect card */}
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/18 p-5 space-y-3">
                <p className="text-xs text-amber-300 leading-relaxed">
                  This challenge is fetched live from Codeforces. Because Codeforces does not expose full problem statements via their API, you can read the complete description directly on their platform:
                </p>
                <a
                  href={problem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[var(--btn-primary-bg)] hover:brightness-110 text-[var(--btn-primary-text)] px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wide transition-all shadow-md cursor-pointer"
                >
                  Open Problem {problem.contestId}{problem.index} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* CF tags */}
              {tags && tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Category Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-elevated border border-border text-text-muted font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : problem.content ? (
            <div
              className="prose-battlecode"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.content) }}
            />
          ) : (
            <p className="text-[15px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          )}

        </div>
      </div>

      {/* ── STICKY FOOTER — always pinned at bottom ── */}
      <div className="shrink-0 border-t border-border h-12 px-5 flex items-center justify-between select-none bg-elevated">
        {/* Left: Hint button */}
        <button
          onClick={() => setShowHintModal(true)}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-xl border transition-all duration-200 shrink-0 ${
            hintUnlocked
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/25 hover:brightness-110'
              : 'text-text-muted bg-elevated border-border hover:border-cyan-500/50 hover:text-cyan-400'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 shrink-0" />
          <span>{hintUnlocked ? 'Hint Unlocked' : '🔒 Unlock Hint'}</span>
        </button>

        {/* Right: External link */}
        {(problem.leetcodeUrl || problem.sourceUrl) && (
          <a
            href={problem.leetcodeUrl || problem.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--btn-primary-bg)] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {problem.source === 'codeforces' ? 'View on Codeforces' : 'View on LeetCode'} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* ── HINT MODAL OVERLAY ── */}
      {showHintModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 rounded-2xl">
          <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 mx-auto flex items-center justify-center">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">Unlock Hint?</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Hints are meant to help when you're truly stuck. This will cost <strong className="text-amber-400">-10 XP</strong> from your battle score.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHintModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border bg-elevated text-text-secondary text-xs font-semibold hover:text-text-primary hover:border-border/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlockHint}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[#0B0F1A] text-xs font-bold transition-all hover:brightness-110 flex items-center justify-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" /> Unlock (−10 XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemPanel;

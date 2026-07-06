import DOMPurify from 'dompurify';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getDifficultyConfig } from '../utils/index';

const ProblemPanel = ({ problem }) => {
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

  const { title, description, difficulty } = problem;

  const diffConfig = getDifficultyConfig(difficulty);

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
        <div className="space-y-4">
          {problem.content ? (
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
      <div className="shrink-0 border-t border-border h-12 px-5 flex items-center justify-end select-none bg-elevated">
      </div>
    </div>
  );
};

export default ProblemPanel;

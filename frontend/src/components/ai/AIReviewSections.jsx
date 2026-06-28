import { Lightbulb, Zap, Copy, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';

export const AICodeImprovementCard = ({ codeImprovements }) => {
  if (!codeImprovements || codeImprovements.length === 0) return null;

  return (
    <div>
      <h5 className="flex items-center gap-2 text-xs font-bold text-accent-blue uppercase tracking-widest mb-3">
        <Lightbulb className="w-4 h-4" /> Code Improvement Suggestions
      </h5>
      <div className="space-y-6">
        {codeImprovements.map((imp, i) => (
          <div key={i} className="bg-surface border border-border/30 rounded-lg overflow-hidden">
            <div className="p-3 bg-elevated border-b border-border/30 flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">{imp.title || 'Improvement'}</span>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-text-primary/90">
                <span className="font-semibold text-accent-primary">Reason: </span>
                {imp.reason}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-accent-red mb-1 block">Before:</span>
                  <pre className="text-[11px] text-text-primary bg-[#0f172a] p-3 rounded-lg border border-accent-red/20 font-mono overflow-x-auto shadow-inner h-full">
                    <code>{imp.beforeSnippet}</code>
                  </pre>
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-400 mb-1 block">After:</span>
                  <pre className="text-[11px] text-text-primary bg-[#0f172a] p-3 rounded-lg border border-emerald-400/20 font-mono overflow-x-auto shadow-inner h-full">
                    <code>{imp.afterSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AIFeedbackCard = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-lg p-4 mt-4">
      <h5 className="text-xs font-bold text-accent-primary uppercase tracking-widest mb-2">Overall Feedback</h5>
      <p className="text-sm text-text-primary/90 leading-relaxed">{feedback}</p>
    </div>
  );
};

export const AIImprovedCodeCard = ({ improvedCode, originalCode, playerId }) => {
  if (!improvedCode) return null;

  return (
    <div className="mt-8 border-t border-border/30 pt-6">
      <h5 className="flex items-center gap-2 text-xs font-bold text-accent-blue uppercase tracking-widest mb-4">
        <Zap className="w-4 h-4" /> Improved Code
      </h5>
      
      {improvedCode.trim() === (originalCode || '').trim() ? (
        <div className="bg-elevated p-4 rounded-lg border border-border/50 text-center">
          <p className="text-sm text-text-primary/60 italic">Your code is already clean. No improvements needed.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-lg border border-border/50 overflow-hidden relative group">
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(improvedCode);
                const btn = document.getElementById(`copy-btn-${playerId}`);
                if (btn) {
                  btn.innerHTML = '<span class="text-xs text-emerald-400">Copied ✓</span>';
                  setTimeout(() => btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy text-text-primary/60 hover:text-text-primary"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>', 2000);
                }
              }}
              id={`copy-btn-${playerId}`}
              className="p-1.5 bg-surface/80 hover:bg-surface rounded border border-border/50 backdrop-blur-sm"
              title="Copy improved code"
            >
              <Copy className="w-3.5 h-3.5 text-text-primary/60 hover:text-text-primary" />
            </button>
          </div>
          <Editor
            height={Math.max(100, Math.min(improvedCode.split('\n').length * 20 + 20, 400))}
            language="cpp"
            theme="vs-dark"
            value={improvedCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              renderLineHighlight: 'none',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'hidden'
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export const AIIssuesCard = ({ weaknesses, bugs }) => {
  const hasIssues = (weaknesses && weaknesses.length > 0) || (bugs && bugs.length > 0);
  if (!hasIssues) return null;

  return (
    <div>
      <h5 className="flex items-center gap-2 text-xs font-bold text-accent-red uppercase tracking-widest mb-3">
        <AlertTriangle className="w-4 h-4" /> Issues Found
      </h5>
      <ul className="space-y-2">
        {weaknesses?.map((issue, i) => (
          <li key={`w-${i}`} className="flex items-start gap-2 text-text-primary/90 text-sm">
            <span className="text-accent-red mt-0.5">•</span> {issue}
          </li>
        ))}
        {bugs?.map((bug, i) => (
          <li key={`b-${i}`} className="flex items-start gap-2 text-text-primary/90 text-sm">
            <span className="text-accent-red mt-0.5">•</span> {bug}
          </li>
        ))}
      </ul>
    </div>
  );
};


export const AIRedundantChecksCard = ({ redundantChecks }) => {
  if (!redundantChecks || redundantChecks.length === 0) return null;

  return (
    <div>
      <h5 className="flex items-center gap-2 text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">
        <ShieldAlert className="w-4 h-4" /> Redundant Checks (Constraints)
      </h5>
      <div className="space-y-3">
        {redundantChecks.map((check, i) => (
          <div key={i} className="flex gap-3 bg-surface p-3 rounded-lg border border-yellow-500/20">
            <div className="text-yellow-500 mt-0.5">•</div>
            <p className="text-sm text-text-primary/90 leading-relaxed">{check}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AIStrengthsCard = ({ strengths }) => {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div>
      <h5 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
        <CheckCircle className="w-4 h-4" /> Strengths
      </h5>
      <ul className="space-y-2">
        {strengths.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-text-primary/90 text-sm">
            <span className="text-emerald-500 mt-0.5">•</span> {s}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AIStressTestCard = ({ stressTests }) => {
  if (!stressTests || stressTests.length === 0) return null;

  return (
    <div>
      <h5 className="flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-widest mb-3">
        <Zap className="w-4 h-4" /> Stress Tests
      </h5>
      <div className="space-y-3">
        {stressTests.map((st, i) => (
          <div key={i} className="bg-surface border border-border/30 rounded-lg p-3 text-sm text-text-primary/90">
            <div className="flex items-start gap-2">
              <span className="text-accent-primary mt-0.5 font-bold">»</span>
              <span>{typeof st === 'string' ? st : st.purpose || JSON.stringify(st)}</span>
            </div>
            {typeof st === 'object' && st.input && (
              <pre className="text-xs text-text-primary bg-background p-2 rounded border border-border/30 font-mono mt-2 overflow-x-auto">
                {st.input}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

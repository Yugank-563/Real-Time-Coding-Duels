import { Textarea } from '../../components/index';

const TestcaseTab = ({
  isActive,
  cases,
  vars,
  activeCase,
  setActiveCase,
  onCaseInputChange,
  onAddCase,
  onDeleteCase
}) => {
  if (!isActive) return null;

  return (
    <div className="overflow-y-auto overflow-x-hidden bg-surface p-4 select-text space-y-4 flex-1 min-h-0">
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap select-none">
          {cases.map((c, i) => (
            <div key={i} className="relative group">
              <button
                onClick={() => setActiveCase(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  activeCase === i
                    ? 'bg-elevated border-border text-text-primary font-bold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Case {i + 1}
              </button>
              {cases.length > 1 && onDeleteCase && (
                <button
                  onClick={(e) => onDeleteCase(i, e)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neutral-700 hover:bg-neutral-600 text-text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 select-none shadow-md border border-border"
                  style={{ fontSize: '10px', paddingBottom: '2px' }}
                  title="Delete case"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {cases.length < 10 && onAddCase && (
            <button
              onClick={onAddCase}
              className="px-2.5 py-1 rounded-lg text-text-muted hover:text-text-primary text-xs font-bold transition-all border border-dashed border-border hover:border-text-muted"
              title="Add custom case"
            >
              +
            </button>
          )}
        </div>

        {/* Input boxes for current active case variables */}
        <div className="space-y-3 pt-2">
          {cases[activeCase] && vars.map((varName, varIdx) => (
            <div key={varName} className="flex flex-col">
              <label className="text-xs text-text-muted mb-1 font-mono">{varName} =</label>
              <Textarea
                rows={1}
                value={cases[activeCase][varIdx] || ''}
                onChange={(e) => onCaseInputChange(activeCase, varIdx, e.target.value)}
                className="font-mono text-sm resize-none"
              />
            </div>
          ))}
          {!cases[activeCase] && (
            <p className="text-xs text-text-muted italic">No test cases defined.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestcaseTab;

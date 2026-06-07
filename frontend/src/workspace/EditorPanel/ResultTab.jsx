import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const formatOutputValue = (val) => {
  if (val === undefined || val === null) return val;
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (trimmed === '') return val;
  
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return val;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return val;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return val;
  if (trimmed === 'true' || trimmed === 'false') return val;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return val;
  
  return `"${trimmed}"`;
};

const ResultTab = ({
  isActive,
  state,
  hasResults,
  vCfg,
  verdict,
  totalTestCases,
  testCasesPassed,
  executionTime,
  memoryMB,
  memory,
  errorMessage,
  caseList,
  safeActiveCase,
  setActiveCase,
  activeData,
  activeMemoryMB,
  runProgress
}) => {
  if (!isActive) return null;

  const outputClassName = activeData
    ? `bg-elevated border rounded-xl px-4 py-2.5 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto ${
        activeData.passed
          ? 'border-border text-[#2DB55D]'
          : 'border-[#EF4743]/20 text-[#EF4743]'
      }`
    : '';

  return (
    <div className="overflow-y-auto overflow-x-hidden bg-surface flex flex-col select-text flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto">
        {state === 'idle' && (
          <div className="h-full flex items-center justify-center text-text-muted/40 italic text-xs py-10">
            Run your code to see results here
          </div>
        )}

        {state === 'running' && (
          <div className="h-full flex flex-col items-center justify-center gap-3 py-12 px-6">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-cyan-400 font-semibold tracking-wide">
              {runProgress && runProgress.total > 0
                ? `Running test cases… ${runProgress.done} / ${runProgress.total}`
                : 'Running test cases…'}
            </p>
            {runProgress && runProgress.total > 0 && (
              <div className="w-full max-w-xs h-2 bg-gray-800 rounded-full overflow-hidden border border-border/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(runProgress.done / runProgress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {hasResults && vCfg && (
          <div className="flex flex-col h-full">
            {/* Verdict Details */}
            <div className="px-5 py-4 flex flex-col gap-1 border-b border-border bg-elevated/20 shrink-0">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                <div className="flex items-center gap-2">
                  {verdict === 'AC' ? (
                    <CheckCircle className="w-5 h-5 text-[#2DB55D]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#EF4743]" />
                  )}
                  <span className={`text-lg font-bold tracking-tight ${vCfg.color}`}>
                    {vCfg.text}
                  </span>
                </div>
                {totalTestCases > 0 && (
                  <span className="text-sm font-semibold text-text-secondary mt-0.5">
                    {testCasesPassed} {"/"} {totalTestCases} testcases passed
                  </span>
                )}
              </div>
              {(executionTime != null || memory != null) && (
                <div className="text-[11px] text-text-muted font-mono mt-1">
                  {executionTime != null && `Runtime: ${executionTime} ms`}
                  {memory != null && `  ·  Memory: ${memoryMB} MB`}
                </div>
              )}
            </div>

            {verdict === 'CE' && errorMessage ? (
              <div className="p-4 flex-1">
                <div className="p-3 bg-red-500/6 border border-red-500/20 rounded-xl space-y-1.5">
                  <span className="text-[9px] uppercase font-black tracking-wider text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Compiler Output
                  </span>
                  <pre className="text-red-300 font-mono text-[11px] whitespace-pre overflow-x-auto leading-relaxed select-text code-scroll-x">
                    {errorMessage}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Case selector row */}
                {caseList.length > 0 && (
                  <div className="px-5 py-2.5 flex items-center gap-2 border-b border-border shrink-0 select-none overflow-x-auto scrollbar-thin">
                    {caseList.map((tc, i) => {
                      const passed = tc.passed;
                      const isActive = safeActiveCase === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveCase(i)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border transition-all shrink-0 ${
                            isActive
                              ? 'bg-elevated border-border text-text-primary'
                              : 'border-transparent text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              passed ? 'bg-[#2DB55D]' : 'bg-[#EF4743]'
                            }`}
                          />
                          <span>Case {tc.caseNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active Case Details */}
                {activeData ? (
                  <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 border-b border-border/20 pb-3">
                      {activeData.time !== null && activeData.time !== undefined && (
                        <span className="text-[10px] font-mono text-text-muted">
                          Time: {activeData.time} ms
                        </span>
                      )}
                      {activeData.memory !== null && activeData.memory !== undefined && (
                        <span className="text-[10px] font-mono text-text-muted">
                          Memory: {activeMemoryMB} MB
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase ml-auto ${activeData.passed ? 'text-[#2DB55D]' : 'text-[#EF4743]'}`}>
                        {activeData.status || (activeData.passed ? 'Accepted' : 'Failed')}
                      </span>
                    </div>

                    {activeData.input && (
                      <div>
                        <p className="text-[11px] text-text-muted mb-1 font-mono font-medium">Input</p>
                        <div className="bg-elevated border border-border rounded-xl px-4 py-2.5 font-mono text-xs text-text-primary overflow-x-auto whitespace-pre code-scroll-x max-h-48 overflow-y-auto">
                          {activeData.input}
                        </div>
                      </div>
                    )}

                    {activeData.output !== undefined && (
                      <div>
                        <p className="text-[11px] text-text-muted mb-1 font-mono font-medium">Output</p>
                        <div className={outputClassName}>
                          {formatOutputValue(activeData.output) || <span className="italic opacity-40">(no stdout)</span>}
                        </div>
                      </div>
                    )}

                    {activeData.expected !== undefined && activeData.expected !== null && (
                      <div>
                        <p className="text-[11px] text-text-muted mb-1 font-mono font-medium">Expected</p>
                        <div className="bg-elevated border border-border rounded-xl px-4 py-2.5 font-mono text-xs text-[#2DB55D] whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {formatOutputValue(activeData.expected) || <span className="italic opacity-40">{"N/A (Custom Case)"}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-xs text-text-muted italic">
                    {verdict === 'AC' ? '✓ All test cases passed.' : '✗ Some test cases failed.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultTab;

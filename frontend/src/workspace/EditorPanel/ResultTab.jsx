import { Loader2, CheckCircle, XCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { VerdictBadge } from '../../components';

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
    ? `bg-elevated border rounded-xl px-4 py-2.5 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto ${activeData.passed
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
              {runProgress?.isSubmit ? 'Evaluating hidden test cases...' : 'Running code...'}
            </p>
          </div>
        )}

        {hasResults && verdict && (
          <div className="flex flex-col h-full">
            {/* Verdict Details */}
            <div className={`px-5 py-5 flex flex-col gap-3 border-b border-border shrink-0 transition-colors duration-500 ${
              verdict === 'AC' ? 'bg-[#2DB55D]/10 relative overflow-hidden' :
              (verdict === 'WA' || verdict === 'CE') ? 'bg-[#EF4743]/10 relative overflow-hidden' :
              'bg-elevated/20'
            }`}>
              {/* Optional background glow for AC/WA/CE */}
              {verdict === 'AC' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2DB55D] to-transparent opacity-70" />
              )}
              {(verdict === 'WA' || verdict === 'CE') && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#EF4743] to-transparent opacity-70" />
              )}

              <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                {verdict === 'AC' ? (
                  <h2 className="text-2xl font-black text-[#2DB55D] flex items-center gap-2 drop-shadow-sm tracking-tight">
                    <CheckCircle className="w-6 h-6" /> Accepted
                  </h2>
                ) : verdict === 'WA' ? (
                  <h2 className="text-2xl font-black text-[#EF4743] flex items-center gap-2 drop-shadow-sm tracking-tight">
                    <XCircle className="w-6 h-6" /> Wrong Answer
                  </h2>
                ) : verdict === 'CE' ? (
                  <h2 className="text-2xl font-black text-[#EF4743] flex items-center gap-2 drop-shadow-sm tracking-tight">
                    <AlertTriangle className="w-6 h-6" /> Compilation Error
                  </h2>
                ) : (
                  <VerdictBadge verdict={verdict} />
                )}
                {totalTestCases > 0 && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    verdict === 'AC' ? 'bg-[#2DB55D]/20 text-[#2DB55D]' :
                    (verdict === 'WA' || verdict === 'CE') ? 'bg-[#EF4743]/20 text-[#EF4743]' :
                    'bg-white/10 text-text-secondary'
                  }`}>
                    {testCasesPassed} / {totalTestCases} Testcases Passed
                  </span>
                )}

              </div>
              
              {(executionTime != null || memory != null) && (
                <div className="flex items-center gap-4 text-[11px] font-mono text-text-secondary">
                  {executionTime != null && (
                    <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                      <span className="opacity-60">Runtime:</span>
                      <span className="font-semibold text-text-primary">{executionTime} ms</span>
                    </div>
                  )}
                  {memory != null && (
                    <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                      <span className="opacity-60">Memory:</span>
                      <span className="font-semibold text-text-primary">{memoryMB} MB</span>
                    </div>
                  )}
                </div>
              )}
            </div>


            {verdict === 'CE' && errorMessage ? (
              <div className="flex-1 p-4 flex flex-col min-h-0 space-y-2">
                <p className="text-[11px] text-text-muted font-mono font-medium">Compiler Output</p>
                <div className="flex-1 bg-elevated border border-border rounded-xl p-4 font-mono text-sm leading-relaxed text-[#EF4743] overflow-x-auto overflow-y-auto whitespace-pre code-scroll-x scrollbar-thin">
                  {errorMessage}
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
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border transition-all shrink-0 ${isActive
                              ? 'bg-elevated border-border text-text-primary'
                              : 'border-transparent text-text-muted hover:text-text-primary'
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${passed ? 'bg-[#2DB55D]' : 'bg-[#EF4743]'
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
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    {verdict === 'AC' ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[#2DB55D]/10 flex items-center justify-center mb-4">
                          <CheckCircle className="w-7 h-7 text-[#2DB55D]" />
                        </div>
                        <h3 className="text-base font-bold text-text-primary mb-1">Execution Successful</h3>
                        <p className="text-xs text-text-muted max-w-[250px]">
                          Your code successfully passed all provided test cases.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[#EF4743]/10 flex items-center justify-center mb-4">
                          <XCircle className="w-7 h-7 text-[#EF4743]" />
                        </div>
                        <h3 className="text-base font-bold text-text-primary mb-1">Execution Failed</h3>
                        <p className="text-xs text-text-muted max-w-[250px]">
                          Some test cases did not pass. Select the test cases above to debug.
                        </p>
                      </>
                    )}
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

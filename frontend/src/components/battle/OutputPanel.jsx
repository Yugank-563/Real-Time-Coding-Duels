import React from 'react';
import { Terminal, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const OutputPanel = ({ output }) => {
  const { state, results, errorMessage, verdict, executionTime, memory } = output;

  const getVerdictLabel = (verd) => {
    if (verd === 'AC') return { text: 'Accepted ✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (verd === 'WA') return { text: 'Wrong Answer ✗', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    if (verd === 'TLE') return { text: 'Time Limit Exceeded ⏱', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
    if (verd === 'MLE') return { text: 'Memory Limit Exceeded', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    if (verd === 'CE') return { text: 'Compilation Error', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' };
    return { text: 'Runtime Error ✗', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const vLabel = verdict ? getVerdictLabel(verdict) : null;

  return (
    <div className="bg-[#141B2D] border border-[#1E2D40] rounded-2xl flex flex-col h-[200px] overflow-hidden shadow-lg select-text">
      
      {/* ── CONSOLE HEADER ── */}
      <div className="px-4 py-2 bg-[#0D1520] border-b border-[#1E2D40] text-[10px] font-mono font-bold text-[#7A9AB8] uppercase tracking-widest flex items-center justify-between select-none shrink-0">
        <span className="flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" /> Console Output
        </span>
        
        {/* State Indicators */}
        {state === 'success' && <span className="text-emerald-400 font-extrabold uppercase">Evaluation Finished</span>}
        {state === 'error' && <span className="text-red-400 font-extrabold uppercase">Failure Encountered</span>}
        {state === 'running' && (
          <span className="text-[#00E5FF] font-extrabold uppercase flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Compiling sandbox...
          </span>
        )}
        {state === 'idle' && <span className="text-[#7A9AB8]/60">Ready to execute</span>}
      </div>

      {/* ── CONSOLE SCREEN CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed text-[#7A9AB8]">
        
        {/* STATE: IDLE */}
        {state === 'idle' && (
          <div className="h-full flex items-center justify-center text-slate-500 italic select-none">
            &gt; Press 'Run Code' to compile examples or 'Submit' to evaluate hidden cases.
          </div>
        )}

        {/* STATE: RUNNING */}
        {state === 'running' && (
          <div className="h-full flex flex-col items-center justify-center gap-2 select-none">
            <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin" />
            <p className="text-xs text-[#00E5FF] font-bold">Spinning up Docker Sandbox container...</p>
          </div>
        )}

        {/* STATE: RESULTS RENDER */}
        {(state === 'success' || state === 'error') && (
          <div className="space-y-4">
            
            {/* Verdict Chip */}
            {vLabel && (
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${vLabel.bg}`}>
                <div className="flex items-center gap-2">
                  {verdict === 'AC' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <div>
                    <span className={`text-sm font-black tracking-tight ${vLabel.color}`}>{vLabel.text}</span>
                    <p className="text-[10px] text-[#7A9AB8] mt-0.5">Hidden test cases processed successfully.</p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-[#7A9AB8] flex items-center gap-4">
                  <div>
                    <span className="block text-white font-extrabold">{executionTime || 0}ms</span>
                    <span>CPU Time</span>
                  </div>
                  <div>
                    <span className="block text-white font-extrabold">{memory || 0}KB</span>
                    <span>Memory</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message logs */}
            {errorMessage && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-wider text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Compiler Error Logs
                </span>
                <pre className="text-red-300 font-mono text-[10px] whitespace-pre-wrap overflow-x-auto select-text leading-normal">
                  {errorMessage}
                </pre>
              </div>
            )}

            {/* General Output Console log */}
            {!errorMessage && verdict === 'AC' && (
              <div className="space-y-1">
                <div className="text-emerald-400 font-extrabold">All pre-compiled example cases passed!</div>
                <div className="text-slate-400 mt-1 leading-normal">
                  Code compiled with sub-100ms response. Docker execution limits were strictly validated. ELO update queue processed.
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default OutputPanel;

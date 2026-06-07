import { useState, useRef, useEffect } from 'react';
import { Code, CheckSquare, Braces, RotateCcw } from 'lucide-react';
import { formatCppCode } from '../../utils/index';
import MonacoEditorComponent from './MonacoEditorComponent';
import TestcaseTab from './TestcaseTab';
import ResultTab from './ResultTab';


export const EditorPanel = ({
  code,
  onCodeChange,
  language,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  cases = [],
  vars = ['input'],
  activeCase = 0,
  setActiveCase,
  onCaseInputChange,
  onAddCase,
  onDeleteCase,
  output,
  settings,
  showRunButton = true,
  showSubmitButton = true,
  problem,
}) => {
  const [activeTab, setActiveTab] = useState('code');
  const editorRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Keybind commands inside Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (onSubmit) onSubmit();
    });
  };

  const handleFormatCode = () => {
    if (language !== 'cpp') return; // C++ formatter only
    if (editorRef.current) {
      const currentCode = editorRef.current.getValue();
      const formatted = formatCppCode(currentCode);
      editorRef.current.setValue(formatted);
      onCodeChange(formatted);
    } else {
      const formatted = formatCppCode(code || '');
      onCodeChange(formatted);
    }
  };

  const handleResetCode = () => {
    if (!problem) return;
    const defaultTemplate = problem.boilerplates?.[language] || '';
    if (editorRef.current) {
      editorRef.current.setValue(defaultTemplate);
    }
    onCodeChange(defaultTemplate);
  };

  const lineCount = code ? code.split('\n').length : 1;
  const colCount  = code ? code.split('\n').pop().length + 1 : 1;

  // Parse results for tab details
  const {
    state,
    results = [],
    errorMessage = '',
    verdict = null,
    executionTime = 0,
    memory = 0,
    testCasesPassed = 0,
    totalTestCases = 0,
    runProgress
  } = output || { state: 'idle' };

  const getVerdictConfig = (verd) => {
    if (verd === 'AC')  return { text: 'Accepted',              color: 'text-[#2DB55D]' };
    if (verd === 'WA')  return { text: 'Wrong Answer',          color: 'text-[#EF4743]' };
    if (verd === 'TLE') return { text: 'Time Limit Exceeded',   color: 'text-orange-400' };
    if (verd === 'MLE') return { text: 'Memory Limit Exceeded', color: 'text-yellow-400' };
    if (verd === 'CE')  return { text: 'Compilation Error',     color: 'text-slate-400' };
    return                     { text: 'Runtime Error',         color: 'text-[#EF4743]' };
  };

  const hasResults = (state === 'success' || state === 'error') && verdict;
  const vCfg = verdict ? getVerdictConfig(verdict) : null;

  // Sync to results tab if output changes to running or completed
  useEffect(() => {
    if (state === 'running' || hasResults) {
      setActiveTab('result');
    }
  }, [state, hasResults]);

  const getDisplayCases = () => {
    if (!results || !results.length) return [];
    
    // Always include sample and custom cases
    const visible = results.filter(r => r.type === 'sample' || r.type === 'custom');
    
    // Find the first failing case
    const firstFailed = results.find(r => r.passed === false);
    if (firstFailed) {
      const alreadyVisible = visible.some(v => v.caseNumber === firstFailed.caseNumber);
      if (!alreadyVisible) {
        visible.push(firstFailed);
      }
    }
    
    return visible;
  };

  const caseList = getDisplayCases();
  const safeActiveCase = Math.min(activeCase, Math.max(0, caseList.length - 1));
  const activeData = caseList[safeActiveCase];

  const memoryMB = memory ? Math.round(memory * 0.0009765625) : 0;
  const activeMemoryMB = activeData && activeData.memory !== undefined && activeData.memory !== null
    ? Math.round(activeData.memory * 0.009765625) * 0.1
    : 0;

  return (
    <div 
      className="bg-surface flex flex-col lg:min-h-0 lg:h-full overflow-hidden relative mobile-editor-height"
      style={{ '--mobile-editor-height': `${Math.max(350, (code?.split('\n').length || 0) * 26 + 150)}px` }}
    >
      {/* ── ROW 1: TOP TAB BAR & CONTROLS ── */}
      <div className="flex h-12 px-4 bg-elevated/50 border-b border-border items-center justify-between select-none shrink-0 text-[13px]">
        <div className="flex items-center gap-3 font-semibold">
          {/* Code Tab */}
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeTab === 'code' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Code className={`w-3.5 h-3.5 ${activeTab === 'code' ? 'text-cyan-400' : 'text-text-muted'}`} />
            <span>Code</span>
          </button>
          
          <span className="text-text-muted/30">|</span>

          {/* Testcase Tab */}
          <button
            onClick={() => setActiveTab('testcase')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeTab === 'testcase' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <CheckSquare className={`w-3.5 h-3.5 ${activeTab === 'testcase' ? 'text-[#2DB55D]' : 'text-text-muted'}`} />
            <span>Testcase</span>
          </button>

          <span className="text-text-muted/30">|</span>

          {/* Result Tab */}
          <button
            onClick={() => setActiveTab('result')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeTab === 'result' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span>Result</span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 select-none">
          {activeTab === 'code' && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleFormatCode}
                className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title="Format Code (C++)"
              >
                <Braces className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetCode}
                className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title="Reset Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 2: UNIFIED WORKSPACE AREA ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface relative overflow-y-auto lg:overflow-hidden">
        {/* Monaco Code Editor (preserves mount/state) */}
        <div className={`w-full relative flex-col flex-1 min-h-0 ${activeTab === 'code' ? 'flex' : 'hidden'}`}>
          <MonacoEditorComponent
            code={code}
            language={language}
            theme={settings?.theme || 'vs-dark'}
            onChange={onCodeChange}
            onMount={handleEditorMount}
            settings={settings}
          />
        </div>

        {/* Testcase Input View */}
        <TestcaseTab
          isActive={activeTab === 'testcase'}
          cases={cases}
          vars={vars}
          activeCase={activeCase}
          setActiveCase={setActiveCase}
          onCaseInputChange={onCaseInputChange}
          onAddCase={onAddCase}
          onDeleteCase={onDeleteCase}
        />

        {/* Test Result View */}
        <ResultTab
          isActive={activeTab === 'result'}
          state={state}
          hasResults={hasResults}
          vCfg={vCfg}
          verdict={verdict}
          totalTestCases={totalTestCases}
          testCasesPassed={testCasesPassed}
          executionTime={executionTime}
          memoryMB={memoryMB}
          memory={memory}
          errorMessage={errorMessage}
          caseList={caseList}
          safeActiveCase={safeActiveCase}
          setActiveCase={setActiveCase}
          activeData={activeData}
          activeMemoryMB={activeMemoryMB}
          runProgress={runProgress}
        />
      </div>

      {/* ── ROW 3: FOOTER BAR (ALWAYS VISIBLE) ── */}
      <div className="h-12 px-4 border-t border-border bg-elevated flex items-center justify-between shrink-0 select-none">
        {/* Left: Editor status */}
        <div className="text-[10px] font-mono text-text-muted">
          {activeTab === 'code' ? (
            <span>Saved · Ln {lineCount}, Col {colCount}</span>
          ) : (
            <span />
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showRunButton && (
            <button
              onClick={onRun}
              disabled={isRunning || isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[var(--btn-primary-bg)] hover:brightness-110 text-[var(--btn-primary-text)] text-xs font-bold transition-all duration-200 disabled:opacity-40"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          )}
          {showSubmitButton && (
            <button
              onClick={onSubmit}
              disabled={isRunning || isSubmitting}
              className="px-5 py-1.5 rounded-lg bg-[var(--btn-primary-bg)] hover:brightness-110 text-[var(--btn-primary-text)] text-xs font-bold transition-all duration-200 disabled:opacity-40"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;

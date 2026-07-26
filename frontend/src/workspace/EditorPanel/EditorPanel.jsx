import { useState, useRef, useEffect } from 'react';
import { Code, CheckSquare, RotateCcw, Terminal } from 'lucide-react';
import MonacoEditorComponent from './MonacoEditorComponent';
import TestcaseTab from './TestcaseTab';
import ResultTab from './ResultTab';
import { Button } from '../../components/index';


const EditorPanel = ({
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

  const hasResults = (state === 'success' || state === 'error') && verdict;

  // Sync to results tab if output changes to running or completed
  useEffect(() => {
    if (state === 'running') {
      setActiveTab('result');
    } else if (hasResults) {
      setActiveTab('result');
    }
  }, [state, hasResults, verdict]);

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
            <Terminal className={`w-3.5 h-3.5 ${activeTab === 'result' ? 'text-blue-400' : 'text-text-muted'}`} />
            <span>Result</span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 select-none">
          {activeTab === 'code' && (
            <div className="flex items-center gap-0.5">
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
            <>
              {showRunButton && (
                <Button
                  variant="primary"
                  onClick={onRun}
                  loading={isRunning}
                  disabled={isSubmitting}
                  className="!px-4 !py-1.5 !text-xs !font-bold"
                >
                  Run Code
                </Button>
              )}
              {showSubmitButton && (
                <Button
                  variant="primary"
                  onClick={onSubmit}
                  loading={isSubmitting}
                  disabled={isRunning}
                  className="!px-5 !py-1.5 !text-xs !font-bold"
                >
                  Submit
                </Button>
              )}
            </>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;

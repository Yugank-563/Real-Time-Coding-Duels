import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, RotateCcw } from 'lucide-react';
import { CustomDropdown } from '../ui';

const LANGUAGE_OPTIONS = [
  { value: 'cpp', label: 'C++ (GCC 17)' },
  { value: 'py', label: 'Python (3.9)' },
  { value: 'js', label: 'JavaScript (Node 16)' }
];


const LANGUAGE_LABELS = {
  cpp: 'C++ (GCC 17)',
  py: 'Python (3.9)',
  js: 'JavaScript (Node 16)',
};

const CodeEditor = ({
  code,
  selectedLanguage,
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  isExecuting,
  problem,
}) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // 1. Map Ctrl+Enter to trigger Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    // 2. Map Ctrl+Shift+Enter to trigger Submit
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      onSubmit();
    });
  };

  const handleResetCode = () => {
    if (problem && problem.boilerplates) {
      onCodeChange(problem.boilerplates[selectedLanguage] || '');
    }
  };

  // Character and line stats helper
  const lineCount = code ? code.split('\n').length : 1;
  const charCount = code ? code.length : 0;

  return (
    <div className="bg-[#141B2D] border border-[#1E2D40] rounded-2xl flex flex-col h-full overflow-hidden shadow-lg">
      
      {/* ── HEADER STATUS CONTROLS ── */}
      <div className="bg-[#0D1520] px-4 py-2 border-b border-[#1E2D40] flex items-center justify-between shrink-0 font-mono">
        <div className="flex items-center gap-2">
          <CustomDropdown
            value={selectedLanguage}
            onChange={(val) => onLanguageChange(val)}
            options={LANGUAGE_OPTIONS}
            placeholder="Select Language"
            buttonClassName="bg-[#141B2D] border border-[#1E2D40] focus:border-[#00E5FF] text-[#E0E6F0] text-[11px] font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer flex items-center justify-between gap-1.5"
            menuClassName="bg-[#141B2D] border-[#1E2D40] backdrop-blur-md min-w-[140px]"
            optionClassName="hover:bg-[#0D1520] text-[#E0E6F0]"
          />
        </div>

        <button
          onClick={handleResetCode}
          className="text-[10px] font-bold text-[#7A9AB8] hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
          title="Reset boilerplate template"
        >
          <RotateCcw className="w-3 h-3" /> Reset Boilerplate
        </button>
      </div>

      {/* ── MONACO EDITOR CLIENT CONTAINER ── */}
      <div className="flex-1 overflow-hidden relative bg-[#0B0F1A]/30">
        <Editor
          height="100%"
          language={selectedLanguage === 'py' ? 'python' : selectedLanguage === 'js' ? 'javascript' : 'cpp'}
          value={code}
          onChange={(val) => onCodeChange(val || '')}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            minimap: { enabled: false },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            fontLigatures: true,
            lineHeight: 22,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            contextmenu: false,
            padding: { top: 12, bottom: 12 },
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          }}
        />
      </div>

      {/* ── EDITOR STATUS BAR ── */}
      <div className="bg-[#0D1520] px-4 py-1.5 border-t border-[#1E2D40] text-[10px] font-mono text-[#7A9AB8] flex items-center justify-between shrink-0 select-none">
        <div>Ln {lineCount}, Col {charCount}</div>
        <div>UTF-8</div>
      </div>

      {/* ── ACTION FOOTER BUTTONS ── */}
      <div className="bg-[#0D1520]/60 border-t border-[#1E2D40] px-4 py-3.5 flex items-center justify-end gap-3 shrink-0 select-none">
        
        <button
          onClick={onRun}
          disabled={isExecuting}
          className="px-4 py-2 rounded-xl border border-[#1E2D40] bg-[#141B2D] hover:bg-[#1E2D40] text-[#E0E6F0] text-xs font-extrabold transition-all duration-300 disabled:opacity-50 flex items-center gap-1.5 hover:scale-[1.01]"
        >
          <Play className="w-3.5 h-3.5" /> Run Code
        </button>
        
        <button
          onClick={onSubmit}
          disabled={isExecuting}
          className="px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:brightness-110 text-[#0B0F1A] text-xs font-extrabold transition-all duration-300 disabled:opacity-50 flex items-center gap-1.5 hover:scale-[1.01] shadow-[0_0_16px_rgba(0,229,255,0.15)]"
        >
          <Send className="w-3.5 h-3.5" /> Submit Challenge 🚀
        </button>
      </div>

    </div>
  );
};

export default CodeEditor;

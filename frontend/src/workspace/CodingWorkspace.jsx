import { useEffect } from 'react';
import { useSplitPanel, useEditorSettings } from '../hooks/index';
import { ResizableLayout, ProblemPanel, EditorPanel } from './index';

export const CodingWorkspace = ({
  headerComponent,
  mode = 'practice',
  problem,
  code,
  onCodeChange,
  language = 'cpp',
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
  cases = [],
  vars = ['input'],
  activeCase = 0,
  setActiveCase,
  onCaseInputChange,
  onAddCase,
  onDeleteCase,
  output,
  showRunButton = true,
  showSubmitButton = true,
  isEmbedded = false,
}) => {
  const [settings] = useEditorSettings();
  const splitPanel = useSplitPanel(`bc-split-width-v2-${mode}`, 50);

  // Lock page scroll while workspace is active on large screens; restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (window.innerWidth >= 1024) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      ref={splitPanel.containerRef}
      className={`w-full text-text-primary flex flex-col overflow-y-auto lg:overflow-hidden bg-base relative transition-all duration-300 ${
        isEmbedded
          ? 'flex-1'
          : 'h-[calc(100vh-64px)] mt-16'
      }`}
    >
      {/* ──── DOT GRID BACKGROUND ──── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ──── TOP RADIAL GLOW ──── */}
      <div
        className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.06), transparent 55%)'
        }}
      />

      <div className="flex-1 w-full px-4 flex flex-col gap-3 min-h-0 relative z-10">
        {/* Render Header component */}
        {headerComponent && <div className="shrink-0">{headerComponent}</div>}

        {/* Resizable Layout */}
        <div className="flex-1 min-h-0 w-full flex relative">
          <ResizableLayout>
            <ProblemPanel
              problem={problem}
              hasSubmitted={output?.verdict !== null}
              mode={mode}
            />

            <EditorPanel
              code={code}
              onCodeChange={onCodeChange}
              language={language}
              onRun={onRun}
              onSubmit={onSubmit}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              cases={cases}
              vars={vars}
              activeCase={activeCase}
              setActiveCase={setActiveCase}
              onCaseInputChange={onCaseInputChange}
              onAddCase={onAddCase}
              onDeleteCase={onDeleteCase}
              output={output}
              settings={settings}
              showRunButton={showRunButton}
              showSubmitButton={showSubmitButton}
              problem={problem}
            />
          </ResizableLayout>
        </div>
      </div>
    </div>
  );
};

export default CodingWorkspace;

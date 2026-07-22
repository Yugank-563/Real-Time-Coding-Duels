import { useParams } from 'react-router-dom';
import { useProblemFetch, useEditorState, useSubmission, useTestcaseManager, useDocumentTitle } from '../hooks/index';
import { Loader2 } from 'lucide-react';
import { CodingWorkspace } from '../workspace/index';


const PracticeRoom = () => {
  const { slug } = useParams();
  useDocumentTitle(slug || 'Practice Room');

  // 1. Fetch active problem details
  const { problem, loading, variables, initialTestcases } = useProblemFetch(slug);

  // 2. State hooks
  const editor = useEditorState(problem);
  const testcase = useTestcaseManager(variables, initialTestcases);
  const submission = useSubmission(null, slug);

  const handleRun = () => {
    if (!problem) return;
    submission.runCode(slug, editor.code, editor.selectedLanguage, testcase.cases);
  };

  const handleSubmit = () => {
    if (!problem) return;
    const totalCases = problem?.testCaseConfig?.totalCount || 50;
    submission.submitPractice(slug, editor.code, editor.selectedLanguage, totalCases);
  };

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex flex-col items-center justify-center font-sans gap-3">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        <span className="text-xs text-[var(--text-muted)] font-medium tracking-wide">Loading problem details...</span>
      </div>
    );
  }

  return (
    <CodingWorkspace
      problem={problem}
      code={editor.code}
      onCodeChange={editor.setCode}
      language={editor.selectedLanguage}
      onRun={handleRun}
      onSubmit={handleSubmit}
      isRunning={submission.isRunning}
      isSubmitting={submission.isSubmitting}
      cases={testcase.cases}
      vars={testcase.vars}
      activeCase={testcase.activeCase}
      setActiveCase={testcase.setActiveCase}
      onCaseInputChange={testcase.handleCaseInputChange}
      onAddCase={testcase.handleAddCase}
      onDeleteCase={testcase.handleDeleteCase}
      output={submission.output}
      showRunButton={true}
      showSubmitButton={true}
    />
  );
};

export default PracticeRoom;

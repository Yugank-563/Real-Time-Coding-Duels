import { 
  AIStrengthsCard, 
  AIIssuesCard, 
  AIStressTestCard, 
  AICodeImprovementCard, 
  AIFeedbackCard, 
  AIRedundantChecksCard, 
  AIImprovedCodeCard 
} from './AIReviewSections.jsx';

export const AIReviewCard = ({ analysisData, playerId }) => {
  if (!analysisData) return null;
  const { analysis, originalCode } = analysisData;
  if (!analysis) return null;

  return (
    <div className="flex-1 min-w-[300px] bg-elevated/50 p-5 rounded-xl border border-border/50">
      <div className="space-y-6 text-sm">
        <AIStrengthsCard strengths={analysis.strengths} />
        <AIIssuesCard weaknesses={analysis.weaknesses} bugs={analysis.bugs} />
        <AIRedundantChecksCard redundantChecks={analysis.redundantChecks} />
        <AIStressTestCard stressTests={analysis.stressTests} />
        <AICodeImprovementCard codeImprovements={analysis.codeImprovements} />
        <AIFeedbackCard feedback={analysis.overallFeedback} />
        <AIImprovedCodeCard 
          improvedCode={analysis.improvedCode} 
          originalCode={originalCode} 
          playerId={playerId} 
        />
      </div>
    </div>
  );
};

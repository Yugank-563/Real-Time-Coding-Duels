import { useState, useEffect } from 'react';
import { AIReviewCard, AIReviewSkeleton } from '../../components';
import { api } from '../../utils/index';
import { useToast } from '../../hooks/useToast';

const AIReviewTab = ({ isActive, verdict, aiAnalysis, originalCode, submissionId, isSubmit }) => {
  const [localAiAnalysis, setLocalAiAnalysis] = useState(aiAnalysis);
  const toast = useToast();

  useEffect(() => {
    setLocalAiAnalysis(aiAnalysis);
  }, [aiAnalysis]);

  useEffect(() => {
    let interval;
    if (verdict === 'AC' && isSubmit && !localAiAnalysis && submissionId) {
       interval = setInterval(async () => {
          try {
             const res = await api.get(`/api/submissions/${submissionId}/status`);
             if (res.data.aiAnalysis) {
                setLocalAiAnalysis(res.data.aiAnalysis);
                toast.info('AI Code Review is Ready! ✨', 'Click the AI Review tab to view insights.');
                clearInterval(interval);
             }
          } catch(e) {}
       }, 5000);
    }
    return () => clearInterval(interval);
  }, [verdict, isSubmit, localAiAnalysis, submissionId]);

  if (!isActive) return null;

  return (
    <div className="overflow-y-auto overflow-x-hidden bg-surface flex flex-col select-text flex-1 min-h-0 p-4">
      {!localAiAnalysis ? (
        <AIReviewSkeleton />
      ) : (
        <AIReviewCard 
          analysisData={{ analysis: localAiAnalysis, originalCode }} 
          playerId="practice" 
        />
      )}
    </div>
  );
};

export default AIReviewTab;

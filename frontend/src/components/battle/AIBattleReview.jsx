import { useEffect, useState } from 'react';
import { api } from '../../utils/index';
import { Bot, AlertCircle, Trophy } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/index';

import { AIReviewCard, AIReviewSkeleton } from '..';

const AIBattleReview = ({ battleId, onAnalysisLoaded }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const user = useSelector(selectUser);
  const myUserId = user?._id || user?.id;

  useEffect(() => {
    let intervalId;
    const fetchReview = async () => {
      try {
        const res = await api.get(`/api/battles/${battleId}/ai-review`);
        setData(res.data);
        setError(false);
        
        const { status } = res.data;
        const p1Pending = status.player1 === 'pending';
        const p2Pending = status.player2 === 'pending';
        
        if (!p1Pending && !p2Pending) {
          setLoading(false);
          clearInterval(intervalId);
          if (onAnalysisLoaded) onAnalysisLoaded(res.data);
        } else {
          setLoading(true);
        }
      } catch (err) {
        console.error('Failed to fetch AI review:', err);
        setError(true);
        setLoading(false);
        clearInterval(intervalId);
      }
    };

    fetchReview();
    intervalId = setInterval(fetchReview, 5000);

    return () => clearInterval(intervalId);
  }, [battleId]);

  if (error) {
    return (
      <div className="w-full bg-surface border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-accent-red mb-3 opacity-80" />
        <h3 className="font-bold text-text-primary">AI Review Unavailable</h3>
        <p className="text-text-secondary text-sm mt-1">Unable to generate or retrieve the AI review for this battle.</p>
      </div>
    );
  }

  if (loading && (!data || !data.player1Analysis || !data.player2Analysis)) {
    return <AIReviewSkeleton />;
  }

  if (!data) return null;

  const { player1Analysis, player2Analysis, comparison } = data;
  
  // Decide who is ME and who is OPPONENT
  const isP1Me = player1Analysis?.player?._id === myUserId;
  const isP2Me = player2Analysis?.player?._id === myUserId;
  
  // It's possible one is null if they didn't submit
  let myAnalysis = isP1Me ? player1Analysis : (isP2Me ? player2Analysis : null);
  let oppAnalysis = isP1Me ? player2Analysis : (isP2Me ? player1Analysis : player1Analysis); // fallback

  if (!myAnalysis && player1Analysis) {
    myAnalysis = player1Analysis;
    oppAnalysis = player2Analysis;
  }

  return (
    <div className="w-full mt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
          <Bot className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">AI Battle Review</h2>
          <p className="text-sm text-text-secondary">Post-match insights and performance analysis</p>
        </div>
      </div>

      {comparison && (
        <div className="bg-gradient-to-br from-surface to-elevated border border-border rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <h3 className="font-bold text-lg text-text-primary mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" /> Why This Solution Won
          </h3>
          <div className="text-sm text-text-primary/90 leading-relaxed space-y-2">
            {comparison.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <AIReviewCard analysisData={myAnalysis} playerId={myAnalysis?.player?._id} />
      </div>
    </div>
  );
};

export default AIBattleReview;

import Battle from '../../models/Battle.js';
import Submission from '../../models/Submission.js';
import { triggerAiAnalysis, triggerAiBattleReview } from '../../ai/services/aiAnalysis.service.js';

export const getAiReview = async (req, res) => {
  try {
    const battleId = req.params.id;
    const userId = req.user._id || req.user.id;

    const battle = await Battle.findById(battleId).populate('players.user', 'username avatar');
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const isParticipant = battle.players.some(p => p.user._id.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ error: 'Only participants can view AI review' });
    }

    if (battle.status !== 'ended') {
      return res.status(400).json({ error: 'AI review is only available after battle ends' });
    }

    const p1 = battle.players[0];
    const p2 = battle.players[1];

    const p1Sub = await Submission.findOne({ userId: p1.user._id, problemId: battle.problem, battleId: battle._id }).sort({ createdAt: -1 });
    const p2Sub = await Submission.findOne({ userId: p2.user._id, problemId: battle.problem, battleId: battle._id }).sort({ createdAt: -1 });

    const checkAndTrigger = async (sub) => {
      if (!sub) return 'unavailable';

      // Check expiry
      if (sub.aiAnalysisStatus === 'completed' && sub.aiAnalysisExpiresAt && new Date() > sub.aiAnalysisExpiresAt) {
        sub.aiAnalysisStatus = 'expired';
      }

      // Check if it's using the old format (where optimizationSuggestions are strings)
      const isOldFormat = sub.aiAnalysis && Array.isArray(sub.aiAnalysis.optimizationSuggestions) && typeof sub.aiAnalysis.optimizationSuggestions[0] === 'string';

      // If missing or failed or expired or old format, we mark as pending and trigger
      if (isOldFormat || ['none', 'failed', 'expired'].includes(sub.aiAnalysisStatus) || (!sub.aiAnalysis && sub.aiAnalysisStatus !== 'pending')) {
        sub.aiAnalysisStatus = 'pending';
        // Clear the old format analysis so we don't accidentally send it
        if (isOldFormat) {
          sub.aiAnalysis = null;
        }
        await sub.save();
        triggerAiAnalysis(sub._id).catch(err => console.error('AI trigger err:', err.message));
        return 'pending';
      }

      return sub.aiAnalysisStatus; // 'pending' or 'completed'
    };

    const p1Status = await checkAndTrigger(p1Sub);
    const p2Status = await checkAndTrigger(p2Sub);

    let p1Analysis = (p1Sub && p1Status === 'completed') ? p1Sub.aiAnalysis : null;
    let p2Analysis = (p2Sub && p2Status === 'completed') ? p2Sub.aiAnalysis : null;

    if (p1Status === 'completed' && p2Status === 'completed' && battle.winner && !battle.get('aiComparison')) {
      triggerAiBattleReview(battle._id, p1Sub, p2Sub).catch(err => console.error('Comparison trigger err:', err.message));
    }
    
    res.json({
      battleId,
      player1Analysis: p1Sub ? { player: p1.user, analysis: p1Analysis, submissionId: p1Sub._id, originalCode: p1Sub.code } : null,
      player2Analysis: p2Sub ? { player: p2.user, analysis: p2Analysis, submissionId: p2Sub._id, originalCode: p2Sub.code } : null,
      status: {
        player1: p1Status,
        player2: p2Status
      },
      comparison: battle.get('aiComparison') || null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import redis from '../../config/redis.js';
import Submission from '../../models/Submission.js';
import crypto from 'crypto';
import { analyzeCode } from './codeReview.service.js';
import { compareBattleSolutions } from './battleReview.service.js';

const DAILY_LIMIT = 20;

export const triggerAiAnalysis = async (submissionId) => {
  const lockKey = `ai_lock:submission:${submissionId}`;

  try {
    // Acquire Lock (120 seconds TTL to prevent infinite hanging)
    const lockAcquired = await redis.set(lockKey, 'LOCKED', { NX: true, EX: 120 });
    if (!lockAcquired) {
      console.log(`[AI Analysis] Analysis already running for submission ${submissionId}. Aborting duplicate trigger.`);
      return;
    }

    const submission = await Submission.findById(submissionId).populate('problemId');
    if (!submission) {
      await redis.del(lockKey);
      return;
    }

    const userId = submission.userId.toString();

    // Check Redis Hash Cache
    const hash = crypto.createHash('sha256').update(`${submission.code}-${submission.problemId?._id || 'unknown'}-${submission.language}`).digest('hex');
    const analysisCacheKey = `ai:analysis:hash:${hash}`;
    const cachedAnalysis = await redis.get(analysisCacheKey);

    if (cachedAnalysis) {
      console.log(`[AI Analysis] AI analysis served from cache for hash ${hash}`);
      const parsedAnalysis = JSON.parse(cachedAnalysis);
      
      submission.aiAnalysis = parsedAnalysis;
      submission.improvedCode = parsedAnalysis.improvedCode || null;
      submission.aiAnalysisStatus = 'completed';
      submission.aiAnalysisGeneratedAt = new Date();
      submission.aiAnalysisExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await submission.save();

      const payload = JSON.stringify({
        submissionId,
        userId,
        battleId: submission.battleId,
        aiAnalysis: parsedAnalysis,
        status: 'completed'
      });
      await redis.publish('ai:analysis_ready', payload);
      
      await redis.del(lockKey);
      return;
    }

    // Check Rate Limit
    const today = new Date().toISOString().split('T')[0];
    const limitKey = `ai_limit:${userId}:${today}`;

    const currentCount = await redis.incr(limitKey);
    if (currentCount === 1) {
      await redis.expire(limitKey, 86400); // 24 hours
    }

    if (currentCount > DAILY_LIMIT) {
      console.warn(`[AI Analysis] User ${userId} exceeded daily AI limit`);
      submission.aiAnalysisStatus = 'failed';
      await submission.save();
      await redis.del(lockKey);
      return;
    }

    const problemDetails = submission.problemId ? {
      title: submission.problemId.title,
      difficulty: submission.problemId.difficulty,
      url: submission.problemId.sourceUrl || `https://leetcode.com/problems/${submission.problemId.titleSlug}/`,
      statement: submission.problemId.content 
        ? submission.problemId.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2500) 
        : 'Not available',
    } : null;

    // Delegate to isolated code review service
    const reviewResult = await analyzeCode(submission, problemDetails);

    if (reviewResult.success && reviewResult.data) {
      const parsedAnalysis = reviewResult.data;
      const providerUsed = reviewResult.provider;

      // Save to cache for 24 hours
      await redis.set(analysisCacheKey, JSON.stringify(parsedAnalysis), { EX: 86400 });

      submission.aiAnalysis = parsedAnalysis;
      submission.improvedCode = parsedAnalysis.improvedCode || null;
      submission.aiAnalysisStatus = 'completed';
      submission.aiAnalysisGeneratedAt = new Date();
      submission.aiAnalysisExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await submission.save();

      // Emit event using Redis Pub/Sub so Socket Service can broadcast to client
      const payload = JSON.stringify({
        submissionId,
        userId,
        battleId: submission.battleId,
        aiAnalysis: parsedAnalysis,
        status: 'completed'
      });
      await redis.publish('ai:analysis_ready', payload);

      console.log(`[AI Analysis] Completed for submission ${submissionId} via ${providerUsed}`);
    } else {
      console.error(`[AI Analysis] Analysis failed for submission ${submissionId}`);
      submission.aiAnalysisStatus = 'failed';
      await submission.save();
    }
    await redis.del(lockKey);
  } catch (error) {
    console.error(`[AI Analysis] Error processing submission ${submissionId}: ${error.message}`);
    try {
      const sub = await Submission.findById(submissionId);
      if (sub) {
        sub.aiAnalysisStatus = 'failed';
        await sub.save();
      }
    } catch (e) {
      console.error('Failed to update submission status on error', e);
    }
    await redis.del(lockKey);
  }
};

export const triggerAiBattleReview = async (battleId, p1Sub, p2Sub) => {
  try {
    const Battle = (await import('../../models/Battle.js')).default;
    const battle = await Battle.findById(battleId);
    if (!battle || battle.aiComparison) return; // already exists

    // Delegate to isolated battle review service
    const comparison = await compareBattleSolutions(battle, p1Sub, p2Sub);

    if (comparison) {
      battle.set('aiComparison', comparison);
      await battle.save();
      console.log(`[AI Battle Review] Generated review for battle ${battleId}`);
    }
  } catch (err) {
    console.error(`[AI Battle Review] Error generating comparison for battle ${battleId}:`, err.message);
  }
};

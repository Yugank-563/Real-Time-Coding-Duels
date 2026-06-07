import { pubClient } from '../config/redis.config.js';
import logger from '../utils/logger.js';

export const publishBattleEvent = async (battleId, event, data) => {
  try {
    await pubClient.publish(
      'battle:events',
      JSON.stringify({
        battleId: battleId.toString(),
        event,
        data,
      })
    );
    logger.debug(`Broadcasted battle event [${event}] for battle ${battleId}`);
  } catch (err) {
    logger.error(`Failed to publish battle event [${event}]:`, err.message);
  }
};

/**
 * Broadcast final submission result with per-case results array.
 * Socket-service subscribes to 'submission:events' and re-emits to the user.
 */
export const publishSubmissionResult = async (
  submissionId,
  userId,
  battleId,
  verdict,
  testCasesPassed,
  totalTestCases,
  results = []
) => {
  try {
    await pubClient.publish(
      'submission:events',
      JSON.stringify({
        submissionId:   submissionId.toString(),
        userId:         userId ? userId.toString() : null,
        battleId:       battleId ? battleId.toString() : null,
        verdict,
        testCasesPassed,
        totalTestCases,
        results,        // ← per-case detail array passed through to frontend
      })
    );
    logger.debug(`Broadcasted submission result [${verdict}] for submission ${submissionId}`);
  } catch (err) {
    logger.error(`Failed to publish submission result event:`, err.message);
  }
};

/**
 * Broadcast incremental progress during batch submission execution.
 * Allows the frontend to show "Running 12/50 test cases...".
 */
export const publishSubmissionProgress = async (submissionId, userId, done, total) => {
  try {
    await pubClient.publish(
      'submission:events',
      JSON.stringify({
        submissionId: submissionId.toString(),
        userId:       userId ? userId.toString() : null,
        type:         'progress',
        done,
        total,
      })
    );
  } catch (err) {
    logger.warn(`Failed to publish submission progress:`, err.message);
  }
};

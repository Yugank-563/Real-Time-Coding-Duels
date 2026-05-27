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

export const publishSubmissionResult = async (submissionId, userId, battleId, verdict, testCasesPassed, totalTestCases) => {
  try {
    await pubClient.publish(
      'submission:events',
      JSON.stringify({
        submissionId: submissionId.toString(),
        userId: userId.toString(),
        battleId: battleId ? battleId.toString() : null,
        verdict,
        testCasesPassed,
        totalTestCases,
      })
    );
    logger.debug(`Broadcasted submission result [${verdict}] for submission ${submissionId}`);
  } catch (err) {
    logger.error(`Failed to publish submission result event:`, err.message);
  }
};

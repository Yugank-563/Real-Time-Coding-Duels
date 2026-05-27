import Battle from '../../../backend/src/models/Battle.js';
import { processBattleResult } from '../../../backend/src/services/ratingService.js';
import { publishBattleEvent } from '../pubsub/publisher.js';
import { VERDICTS } from '../config/constants.js';
import logger from '../utils/logger.js';

export class BattleService {
  /**
   * Updates battle progress and checks for winners.
   * @param {string} battleId - Target Battle ID
   * @param {string} userId - Submitting User ID
   * @param {string} language - Submission language
   * @param {string} verdict - Outcome verdict
   * @param {number} testCasesPassed - Passed count
   */
  async updateBattleState(battleId, userId, language, verdict, testCasesPassed) {
    if (!battleId) return;

    try {
      const battle = await Battle.findById(battleId);
      if (!battle || battle.status !== 'active') return;

      const playerIdx = battle.players.findIndex((p) => p.user.toString() === userId.toString());
      if (playerIdx === -1) return;

      battle.players[playerIdx].progress = testCasesPassed;
      battle.players[playerIdx].language = language;

      // Check if player passed all test cases (AC) first to declare them the winner!
      if (verdict === VERDICTS.AC) {
        battle.players[playerIdx].status = 'submitted';
        battle.status = 'ended';
        battle.endTime = new Date();
        battle.winner = userId;
        await battle.save();

        logger.info(`Battle ${battle._id} ended successfully! Winner: ${userId}`);

        let eloDetails = null;
        
        // Compute standard Elo progression changes
        const opponentIdx = playerIdx === 0 ? 1 : 0;
        const opponentId = battle.players[opponentIdx].user.toString();
        eloDetails = await processBattleResult(userId.toString(), opponentId, 1);

        // Broadcast battle outcome via Redis Pub/Sub
        await publishBattleEvent(battle._id, 'battle:end', {
          winnerId: userId.toString(),
          ratingDetails: eloDetails,
        });
      } else {
        battle.players[playerIdx].status = 'coding'; // Reset state to coding if WA/CE/TLE/etc.
        await battle.save();

        // Broadcast updated progress
        await publishBattleEvent(battle._id, 'battle:update', {
          players: battle.players,
        });
      }
    } catch (err) {
      logger.error(`Error updating battle state for ${battleId}:`, err.message);
    }
  }
}

export const battleService = new BattleService();
export default battleService;

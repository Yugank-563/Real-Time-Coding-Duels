import { Battle } from '../../../backend/src/models/index.js';
import { processBattleResult } from '../../../backend/src/services/index.js';
import { publishBattleEvent } from '../pubsub/publisher.js';
import { VERDICTS } from '../config/constants.js';
import logger from '../utils/logger.js';

export class BattleService {
  // Updates battle progress and checks for winners.
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
      if (verdict === VERDICTS.AC || verdict === 'Accepted') {
        battle.players[playerIdx].status = 'submitted';
        battle.status = 'ended';
        battle.endTime = new Date();
        battle.winner = userId;
        await battle.save();

        logger.info(`Battle ${battle._id} ended successfully! Winner: ${userId}`);

        let eloDetails = null;
        
        try {
          // Compute stats and Elo progression changes
          const opponentIdx = playerIdx === 0 ? 1 : 0;
          const opponentId = battle.players[opponentIdx].user.toString();
          eloDetails = await processBattleResult(userId.toString(), opponentId, 1, battle.mode || 'ranked');

          if (eloDetails) {
            battle.players[playerIdx].ratingChange = eloDetails.eloChange || 0;
            battle.players[opponentIdx].ratingChange = eloDetails.opponent?.eloChange || 0;
          }
        } catch (eloErr) {
          logger.error(`[BattleService] processBattleResult error: ${eloErr.message}`);
        }
        await battle.save();

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

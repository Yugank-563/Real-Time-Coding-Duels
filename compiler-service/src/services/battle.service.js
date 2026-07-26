import { findBattleById } from '../../../backend/src/repositories/index.js';
import { processBattleResult } from '../../../backend/src/services/index.js';
import { publishBattleEvent } from '../pubsub/publisher.js';
import { VERDICTS } from '../config/constants.js';
import logger from '../utils/logger.js';

export class BattleService {
  // Updates battle progress and checks for winners.
  async updateBattleState(battleId, userId, language, verdict, testCasesPassed) {
    if (!battleId) return;

    try {
      const battle = await findBattleById(battleId);
      if (!battle || (battle.status !== 'active' && battle.status !== 'ended')) return;

      const playerIdx = battle.players.findIndex((p) => p.user.toString() === userId.toString());
      if (playerIdx === -1) return;

      battle.players[playerIdx].progress = testCasesPassed;
      battle.players[playerIdx].language = language;

      // Check if player passed all test cases (AC) first to declare them the winner!
      if (verdict === VERDICTS.AC || verdict === 'Accepted') {
        battle.players[playerIdx].status = 'submitted';
        
        if (!battle.winner) {
          // First player to win
          battle.winner = userId;
          await battle.save();

          let eloDetails = null;
          
          try {
            // Compute stats and Elo progression changes
            const opponentIdx = playerIdx === 0 ? 1 : 0;
            const opponentId = battle.players[opponentIdx].user.toString();
            
            const timeElapsed = battle.startTime ? (Date.now() - new Date(battle.startTime).getTime()) / 1000 : null;
            const options = {
              timeElapsed,
              timeLimit: battle.timeLimit || 1800
            };
            
            eloDetails = await processBattleResult(userId.toString(), opponentId, 1, battle.mode || 'ranked', options);

            if (eloDetails) {
              battle.players[playerIdx].ratingChange = eloDetails.eloChange || 0;
              battle.players[opponentIdx].ratingChange = eloDetails.opponent?.eloChange || 0;
            }
          } catch (eloErr) {
            logger.error(`[BattleService] processBattleResult error: ${eloErr.message}`);
          }
          battle.markModified('players');
          await battle.save();

          // Broadcast winner declared via Redis Pub/Sub, but keep room active for loser
          await publishBattleEvent(battle._id, 'battle:winner_declared', {
            winnerId: userId.toString(),
            ratingDetails: eloDetails,
          });
        } else {
          // Second player also passed all test cases (loser practice finished)
          battle.status = 'ended';
          battle.endTime = new Date();
          await battle.save();
          
          // Broadcast battle end to kick the second player
          await publishBattleEvent(battle._id, 'battle:end', {
            winnerId: battle.winner,
          });
        }

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

import { aiGateway } from '../providers/index.js';
import { buildBattleReviewPrompt, BATTLE_SYSTEM_INSTRUCTION } from '../prompts/battleReview.prompt.js';

export const compareBattleSolutions = async (battle, p1Sub, p2Sub) => {
  // We only generate comparison if there's a winner
  if (!battle.winner) return null;

  // Both need analysis
  if (!p1Sub?.aiAnalysis || !p2Sub?.aiAnalysis) return null;

  const winnerIsP1 = battle.winner.toString() === p1Sub.userId.toString();
  const winningSub = winnerIsP1 ? p1Sub : p2Sub;
  const losingSub = winnerIsP1 ? p2Sub : p1Sub;

  const prompt = buildBattleReviewPrompt(winningSub, losingSub);

  const response = await aiGateway.generate(prompt, BATTLE_SYSTEM_INSTRUCTION);
  
  if (!response.success || !response.data) {
    return null;
  }

  // Strip markdown if any
  const cleanComparison = response.data.replace(/[*_#`]/g, '').trim();
  return cleanComparison;
};

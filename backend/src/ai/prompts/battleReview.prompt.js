export const buildBattleReviewPrompt = (winningSub, losingSub) => {
  return `You are an expert competitive programming judge.
We have a programming battle that just ended. One player won.
Compare the two solutions and explain WHY the winning solution won.

Winning Solution:
Time Complexity: ${winningSub.aiAnalysis?.timeComplexity || 'Unknown'}
Space Complexity: ${winningSub.aiAnalysis?.spaceComplexity || 'Unknown'}
Strengths: ${(winningSub.aiAnalysis?.strengths || []).join(', ')}

Losing Solution:
Time Complexity: ${losingSub.aiAnalysis?.timeComplexity || 'Unknown'}
Space Complexity: ${losingSub.aiAnalysis?.spaceComplexity || 'Unknown'}
Issues: ${(losingSub.aiAnalysis?.weaknesses || losingSub.aiAnalysis?.bugs || []).join(', ')}

Generate a concise 1-paragraph summary (no markdown formatting, plain text only) explaining why the winning solution is better. Focus on performance, complexity, or edge case handling. DO NOT provide code.`;
};

export const BATTLE_SYSTEM_INSTRUCTION = "You are a programming judge. Be concise and educational.";

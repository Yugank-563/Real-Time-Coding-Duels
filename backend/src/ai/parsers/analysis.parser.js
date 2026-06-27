export const parseAnalysisResponse = (rawResponse, providerName) => {
  if (!rawResponse) return null;

  try {
    let jsonStr = rawResponse.trim();
    
    // 1. Try to extract from Markdown blocks first
    const jsonMatch = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // 2. Fallback: If no backticks, hunt for the outermost curly braces
      const startIndex = jsonStr.indexOf('{');
      const endIndex = jsonStr.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        jsonStr = jsonStr.substring(startIndex, endIndex + 1);
      }
    }

    const parsed = JSON.parse(jsonStr);

    return {
      timeComplexity: parsed.timeComplexity || 'Unknown',
      spaceComplexity: parsed.spaceComplexity || 'Unknown',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
      redundantChecks: Array.isArray(parsed.redundantChecks) ? parsed.redundantChecks : [],
      codeImprovements: Array.isArray(parsed.codeImprovements) ? parsed.codeImprovements : [],
      edgeCases: Array.isArray(parsed.edgeCases) ? parsed.edgeCases : [],
      stressTests: Array.isArray(parsed.stressTests) ? parsed.stressTests : [],
      tleRisk: !!parsed.tleRisk,
      memoryRisk: !!parsed.memoryRisk,
      overallFeedback: parsed.overallFeedback || 'No feedback provided.',
      improvedCode: parsed.improvedCode || '',
      provider: providerName,
    };
  } catch (err) {
    console.error(`[Analysis Parser] Error parsing AI response: ${err.message}`);
    return null;
  }
};

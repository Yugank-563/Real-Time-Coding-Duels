import { aiGateway } from '../providers/index.js';
import { buildAnalysisPrompt, SYSTEM_INSTRUCTION } from '../prompts/codeAnalysis.prompt.js';
import { parseAnalysisResponse } from '../parsers/analysis.parser.js';

export const analyzeCode = async (submission, problemDetails) => {
  const prompt = buildAnalysisPrompt(
    submission.code,
    submission.language,
    submission.verdict,
    submission.executionTime,
    submission.memory,
    problemDetails
  );

  const response = await aiGateway.generate(prompt, SYSTEM_INSTRUCTION);
  
  if (!response.success) {
    return { success: false, data: null, provider: null };
  }

  const parsedAnalysis = parseAnalysisResponse(response.data, response.provider);
  
  if (!parsedAnalysis) {
    return { success: false, data: null, provider: response.provider };
  }

  return {
    success: true,
    data: parsedAnalysis,
    provider: response.provider
  };
};

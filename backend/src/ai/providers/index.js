import { callGemini } from './gemini.provider.js';
import { callGroq } from './groq.provider.js';
import { callOpenRouter } from './openrouter.provider.js';

/**
 * AI Provider Orchestrator
 * Strategy Pattern: Automatically handles failovers between multiple AI providers
 */
export const aiGateway = {
  async generate(prompt, systemInstruction = '') {
    let rawResponse = null;
    let providerUsed = 'Gemini';

    try {
      // 1. Try Gemini (Primary)
      rawResponse = await callGemini(prompt, systemInstruction);
    } catch (error) {
      console.warn(`[AI Provider] Gemini failed: ${error.message}. Falling back to Groq...`);
    }

    if (!rawResponse) {
      // 2. Try Groq (Fallback 1)
      try {
        providerUsed = 'Groq';
        rawResponse = await callGroq(prompt, systemInstruction);
      } catch (error) {
        console.error(`[AI Provider] Groq fallback failed: ${error.message}`);
      }
    }

    if (!rawResponse) {
      // 3. Try OpenRouter (Fallback 2)
      try {
        providerUsed = 'OpenRouter';
        rawResponse = await callOpenRouter(prompt, systemInstruction);
      } catch (error) {
        console.error(`[AI Provider] OpenRouter fallback failed: ${error.message}`);
      }
    }

    if (!rawResponse) {
      return { success: false, data: null, provider: null };
    }

    return {
      success: true,
      data: rawResponse,
      provider: providerUsed
    };
  }
};

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export const GeminiProvider = {
  name: 'Gemini',
  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  },
  init() {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  },
  async analyze(prompt, systemInstruction = '') {
    if (!genAI) this.init();

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      const isTransient = error.message.includes('503') || error.message.includes('500') || error.message.includes('429');
      const err = new Error(error.message);
      err.isTransient = isTransient;
      throw err;
    }
  }
};

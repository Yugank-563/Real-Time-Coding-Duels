import Groq from 'groq-sdk';

let groqClient = null;

export const GroqProvider = {
  name: 'Groq',
  isConfigured() {
    return !!process.env.GROQ_API_KEY;
  },
  init() {
    if (!groqClient) {
      groqClient = new Groq({ 
        apiKey: process.env.GROQ_API_KEY,
        maxRetries: 0,
        timeout: 5000 // 5 seconds
      });
    }
  },
  async analyze(prompt, systemInstruction = '') {
    if (!groqClient) this.init();

    try {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemInstruction || ''
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' }
      });
      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      const isTransient = error.status === 429 || error.status >= 500 || error.status === undefined || error.name === 'APITimeoutError';
      const err = new Error(error.message);
      err.isTransient = isTransient;
      throw err;
    }
  }
};

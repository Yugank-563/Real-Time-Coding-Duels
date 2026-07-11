export const OpenRouterProvider = {
  name: 'OpenRouter',
  isConfigured() {
    return !!process.env.OPENROUTER_API_KEY;
  },
  init() {
    // Fetch is stateless, no initialization required
  },
  async analyze(prompt, systemInstruction = '') {
    const apiKey = process.env.OPENROUTER_API_KEY;
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL,
          'X-Title': 'Coduelo | Code. Duel. Conquer.'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3-8b-instruct',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemInstruction || '' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      const isTransient = error.message.includes('50') || error.message.includes('429');
      const err = new Error(error.message);
      err.isTransient = isTransient;
      throw err;
    }
  }
};

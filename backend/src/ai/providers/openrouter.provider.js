
export const callOpenRouter = async (prompt, systemInstruction = '') => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173', 
        'X-Title': 'BattleCode Platform',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free', // Use a fast/free model, change to preferred if needed
        messages: [
          {
            role: 'system',
            content: systemInstruction || 'You are a helpful AI coding assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error(`[OpenRouter Provider] Error: ${error.message}`);
    return null;
  }
};

import Groq from 'groq-sdk';


export const callGroq = async (prompt, systemInstruction = '') => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

    const groq = new Groq({ apiKey });

    const chatCompletion = await groq.chat.completions.create({
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
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    return chatCompletion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error(`[Groq Provider] Error: ${error.message}`);
    return null;
  }
};

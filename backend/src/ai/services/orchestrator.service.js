import { createClient } from 'redis';
import { triggerAiAnalysis } from './aiAnalysis.service.js';

let subClient = null;

export const startAiWorker = async () => {
  try {
    subClient = createClient({
      url: process.env.REDIS_URI || 'redis://localhost:6379'
    });
    
    subClient.on('error', (err) => console.error('[AI Worker] Redis Client Error', err));
    
    await subClient.connect();
    
    await subClient.subscribe('trigger_ai_analysis', (message) => {
      const submissionId = message;
      console.log(`[AI Worker] Received trigger for submission: ${submissionId}`);
      triggerAiAnalysis(submissionId).catch(err => console.error('[AI Worker] Error triggering AI:', err));
    });
    
    console.log('[AI Worker] Started listening for AI tasks via Redis Pub/Sub');
  } catch (err) {
    console.error('[AI Worker] Failed to start:', err);
  }
};

import mongoose from 'mongoose';
import redis from './redis.js';

const clearProblemsCache = async () => {
  try {
    const keys = await redis.keys('problems:*');
    if (keys && keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.warn('[db] Failed to clear problems cache in Redis:', err.message);
  }
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined!');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log('mongodb connected successfully');
    
    // Clear problem cache on startup
    await clearProblemsCache();
    return conn;
  } catch (err) {
    throw err;
  }
};

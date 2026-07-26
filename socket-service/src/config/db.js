import mongoose from 'mongoose';
import { connectDB as backendConnectDB } from '../../../backend/src/config/db.js';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined!');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    await backendConnectDB().catch(err => console.warn('[db] Backend Mongoose connection notice:', err.message));
    return conn;
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    throw err;
  }
};

export default connectDB;

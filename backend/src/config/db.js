import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined!');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log('mongodb connected successfully');
    return conn;
  } catch (err) {
    throw err;
  }
};

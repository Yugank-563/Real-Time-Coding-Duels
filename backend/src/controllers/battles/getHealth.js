import mongoose from 'mongoose';

export const getHealth = async (req, res, next) => {
  const results = {};

  // 1. Ping local MongoDB cache
  results.mongodb = mongoose.connection.readyState === 1 ? 'up' : 'down';

  const overall = results.mongodb === 'up' ? 'ok' : 'down';

  return res.status(200).json({
    status: overall,
    sources: results
  });
};
import axios from 'axios';
import mongoose from 'mongoose';

const LEETCODE_BASE = process.env.LEETCODE_API_URL || 'https://alfa-leetcode-api.onrender.com';

export const getHealth = async (req, res) => {
  const results = {};

  // 1. Ping LeetCode API
  try {
    await axios.get(`${LEETCODE_BASE}/daily`, { timeout: 6000 });
    results.leetcode = 'up';
  } catch (err) {
    results.leetcode = 'down';
  }

  // 2. Ping local MongoDB cache
  results.mongodb = mongoose.connection.readyState === 1 ? 'up' : 'down';

  // Overall status is ok if LeetCode API source is up; degraded if down but MongoDB is up
  const overall = results.leetcode === 'up' ? 'ok' : 'degraded';

  return res.status(200).json({
    status: overall,
    sources: results
  });
};

export default getHealth;

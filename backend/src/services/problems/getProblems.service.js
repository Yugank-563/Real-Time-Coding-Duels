import redis from '../../config/redis.js';
import { getPaginatedProblems, countProblems } from '../../repositories/index.js';

export const getProblemsService = async ({ pageNum, limitNum, search, difficulty, tag }) => {
  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }
  if (difficulty && difficulty !== 'ALL') {
    query.difficulty = { $regex: new RegExp(`^${difficulty}$`, 'i') };
  }
  if (tag && tag !== 'ALL') {
    query.tags = tag;
  }

  const skip = (pageNum - 1) * limitNum;
  const cacheKey = `problems:page:${pageNum}:limit:${limitNum}:search:${search}:diff:${difficulty}:tag:${tag}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (cacheErr) {
    console.warn('[getProblems.service] Redis cache get error:', cacheErr.message);
  }

  const [problems, totalCount] = await Promise.all([
    getPaginatedProblems(query, skip, limitNum),
    countProblems(query)
  ]);

  const responsePayload = {
    problems,
    pagination: {
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
      limit: limitNum
    }
  };

  try {
    await redis.setEx(cacheKey, 600, JSON.stringify(responsePayload));
  } catch (cacheErr) {
    console.warn('[getProblems.service] Redis cache set error:', cacheErr.message);
  }

  return responsePayload;
};

import redis from '../../config/redis.js';
import { getPaginatedProblems, countProblems } from '../../repositories/index.js';
import { escapeRegex } from '../../utils/regexUtils.js';
import topicMap from '../../config/topicMap.js';

export const getProblemsService = async ({ pageNum, limitNum, search, difficulty, tag }) => {
  const query = {};
  if (search) {
    const safeSearch = escapeRegex(search);
    // Only search by title, as there's a dedicated dropdown for tags.
    query.title = { $regex: safeSearch, $options: 'i' };
  }
  if (difficulty && difficulty !== 'ALL') {
    const safeDifficulty = escapeRegex(difficulty);
    query.difficulty = { $regex: new RegExp(`^${safeDifficulty}$`, 'i') };
  }
  if (tag && tag !== 'ALL') {
    const slugTag = topicMap[tag] || tag.toLowerCase().replace(/\s+/g, '-');
    query.tags = { $regex: new RegExp(`^(${escapeRegex(tag)}|${escapeRegex(slugTag)})$`, 'i') };
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

import axios from 'axios';
import redis from '../config/redis.js';
import { Problem } from '../models/index.js';

const BASE_URL = process.env.LEETCODE_API_URL || 'https://alfa-leetcode-api.onrender.com';

// ── REDIS CACHE LAYER WRAPPER ──
async function getWithCache(cacheKey, fetchFn, ttlSeconds) {
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Redis cache read error:', err.message);
    }
  }

  const data = await fetchFn();

  if (ttlSeconds > 0) {
    try {
      await redis.set(cacheKey, JSON.stringify(data), { EX: ttlSeconds });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Redis cache write error:', err.message);
      }
    }
  }

  return data;
}

// ── RETRY LOGIC FOR HTTP REQUESTS ──
async function fetchWithRetry(url, config = {}, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await axios.get(url, config);
      return response.data;
    } catch (err) {
      if (attempt === retries + 1) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`LeetCode API call failed after ${attempt} attempts:`, err.message);
        }
        throw err;
      }
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// ── DIFFICULTY MAPPER ──
export const mapDifficultyToAPI = (difficulty) => {
  const norm = difficulty?.toLowerCase() || 'medium';
  if (norm === 'easy') return 'EASY';
  if (norm === 'medium') return 'MEDIUM';
  if (['hard', 'expert'].includes(norm)) return 'HARD';
  return 'MEDIUM';
};

export const mapDifficultyToSystem = (difficulty) => {
  const norm = difficulty?.toUpperCase() || 'MEDIUM';
  if (norm === 'EASY') return 'Easy';
  if (norm === 'MEDIUM') return 'Medium';
  if (norm === 'HARD') return 'Hard';
  return 'Medium';
};

// ── NORMALIZATION HELPER ──
export const mapLeetcodeProblem = (apiResponse) => {
  if (!apiResponse) return null;
  return {
    titleSlug: apiResponse.titleSlug,
    title: apiResponse.questionTitle || apiResponse.title,
    difficulty: apiResponse.difficulty ? apiResponse.difficulty.toLowerCase() : 'medium',
    content: apiResponse.content || '',
    examples: apiResponse.exampleTestcases || '',
    hints: apiResponse.hints || [],
    tags: apiResponse.topicTags?.map(t => t.slug) || [],
    leetcodeUrl: `https://leetcode.com/problems/${apiResponse.titleSlug}/`
  };
};

// ── FUNCTION 1: FETCH BY TOPIC ──
export const fetchProblemsByTopic = async (topic, difficulty, limit = 50) => {
  const apiDifficulty = mapDifficultyToAPI(difficulty);
  const cacheKey = `problems:topic:${topic}:${apiDifficulty}:${limit}`;

  return getWithCache(cacheKey, async () => {
    try {
      const url = `${BASE_URL}/problems?tags=${topic}&difficulty=${apiDifficulty}&limit=${limit}`;
      const data = await fetchWithRetry(url);
      const allProblems = data.problemsetQuestionList || [];
      // Filter out paid-only questions to keep all duels free-to-play
      const freeProblems = allProblems.filter(p => !p.isPaidOnly);
      return freeProblems;
    } catch (err) {
      const sysDifficulty = mapDifficultyToSystem(apiDifficulty);
      const fallbackProblem = await Problem.findOne({
        tags: { $regex: topic, $options: 'i' },
        difficulty: sysDifficulty
      });

      if (fallbackProblem) {
        return [{
          titleSlug: fallbackProblem.titleSlug || fallbackProblem.title.toLowerCase().replace(/\s+/g, '-'),
          title: fallbackProblem.title,
          difficulty: apiDifficulty,
          tags: fallbackProblem.tags,
          acRate: 50,
          frontendQuestionId: '0'
        }];
      }

      throw new Error('Problem service unavailable');
    }
  }, 3600);
};

// ── FUNCTION 2: FETCH DETAILS ──
export const fetchProblemDetails = async (titleSlug) => {
  const cacheKey = `problem:detail:${titleSlug}`;

  return getWithCache(cacheKey, async () => {
    try {
      const url = `${BASE_URL}/select?titleSlug=${titleSlug}`;
      const data = await fetchWithRetry(url);
      return data;
    } catch (err) {
      const fallbackProblem = await Problem.findOne({
        $or: [
          { titleSlug: titleSlug },
          { title: { $regex: titleSlug.replace(/-/g, ' '), $options: 'i' } }
        ]
      });

      if (fallbackProblem) {
        return {
          title: fallbackProblem.title,
          difficulty: fallbackProblem.difficulty.toUpperCase(),
          content: fallbackProblem.content || fallbackProblem.description,
          exampleTestcases: fallbackProblem.examples || (fallbackProblem.testCases && fallbackProblem.testCases.map(tc => tc.input).join('\n')) || '',
          topicTags: fallbackProblem.tags?.map(t => ({ slug: t })) || [],
          hints: fallbackProblem.hints || [],
          titleSlug: fallbackProblem.titleSlug || titleSlug
        };
      }

      throw new Error('Problem service unavailable');
    }
  }, 86400);
};

// ── FUNCTION 3: FETCH RANDOM PROBLEM ──
export const fetchRandomProblem = async (topic, difficulty) => {
  try {
    const problems = await fetchProblemsByTopic(topic, difficulty, 50);
    if (!problems || problems.length === 0) {
      throw new Error('No problems found');
    }
    const picked = problems[Math.floor(Math.random() * problems.length)];
    const details = await fetchProblemDetails(picked.titleSlug);
    return details;
  } catch (err) {
    const sysDifficulty = mapDifficultyToSystem(mapDifficultyToAPI(difficulty));
    const fallbackProblem = await Problem.findOne({
      tags: { $regex: topic, $options: 'i' },
      difficulty: sysDifficulty
    });

    if (fallbackProblem) {
      return {
        title: fallbackProblem.title,
        difficulty: fallbackProblem.difficulty.toUpperCase(),
        content: fallbackProblem.content || fallbackProblem.description,
        exampleTestcases: fallbackProblem.examples || (fallbackProblem.testCases && fallbackProblem.testCases.map(tc => tc.input).join('\n')) || '',
        topicTags: fallbackProblem.tags?.map(t => ({ slug: t })) || [],
        hints: fallbackProblem.hints || [],
        titleSlug: fallbackProblem.titleSlug || fallbackProblem.title.toLowerCase().replace(/\s+/g, '-')
      };
    }

    throw new Error('Problem service unavailable');
  }
};

// ── FUNCTION 4: FETCH DAILY CHALLENGE ──
export const fetchDailyProblem = async () => {
  const cacheKey = 'daily:problem';

  return getWithCache(cacheKey, async () => {
    try {
      const url = `${BASE_URL}/daily`;
      const data = await fetchWithRetry(url);
      const isPaid = data.isPaidOnly || data.question?.isPaidOnly;
      if (isPaid) {
        throw new Error('Daily challenge is premium only');
      }
      return data;
    } catch (err) {
      const fallbackProblem = await Problem.findOne({ difficulty: 'Easy' });
      if (fallbackProblem) {
        return {
          title: fallbackProblem.title,
          difficulty: 'EASY',
          content: fallbackProblem.content || fallbackProblem.description,
          exampleTestcases: fallbackProblem.examples || (fallbackProblem.testCases && fallbackProblem.testCases.map(tc => tc.input).join('\n')) || '',
          topicTags: fallbackProblem.tags?.map(t => ({ slug: t })) || [],
          hints: fallbackProblem.hints || [],
          titleSlug: fallbackProblem.titleSlug || fallbackProblem.title.toLowerCase().replace(/\s+/g, '-')
        };
      }

      throw new Error('Problem service unavailable');
    }
  }, 3600);
};

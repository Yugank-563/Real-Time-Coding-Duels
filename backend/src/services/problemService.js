import { findProblemsByQuery, findProblemSampleQuery } from '../repositories/index.js';
import topicMap from '../config/topicMap.js';

// Lookup helper for topic mapping
function getTopicTag(topic) {
  if (!topic) return null;
  if (topicMap[topic]) return topicMap[topic];
  const lowerTopic = topic.toLowerCase();
  const key = Object.keys(topicMap).find(k => k.toLowerCase() === lowerTopic);
  return key ? topicMap[key] : lowerTopic;
}

// Fetch a random problem from MongoDB matching topic + difficulty, filtering out excluded IDs
async function fetchFromMongoDB(query, excludedSet = null) {
  const sampleSize = parseInt(process.env.PROBLEM_SAMPLE_SIZE) || 100;
  const problems = await findProblemSampleQuery(query, sampleSize);
  if (!problems || !problems.length) return null;
  
  if (excludedSet && excludedSet.size > 0) {
    for (const p of problems) {
      if (!excludedSet.has(p._id.toString())) {
        return p; // Found an unsolved problem!
      }
    }
    // Fallback if ALL 100 random problems were already solved by these users
    return problems[0];
  }
  
  // If no exclusion set, just return a random one from the sample
  return problems[Math.floor(Math.random() * problems.length)];
}

// Main problem picker — always from MongoDB, no LeetCode or Redis involved
export async function getRandomProblem(topic, difficulty, excludedIds = []) {
  const lcTag = getTopicTag(topic);
  const dbDiff = (difficulty || 'medium').charAt(0).toUpperCase() + (difficulty || 'medium').slice(1).toLowerCase();

  const excludedSet = new Set(excludedIds.map(id => id?.toString()));

  // Step 1: Match topic + difficulty, prefer problems with test case outputs
  try {
    const query = { difficulty: dbDiff };
    if (lcTag) {
      query.tags = { $regex: lcTag, $options: 'i' };
    }
    
    const problem = await fetchFromMongoDB(query, excludedSet);
    if (problem) {
      const hasOutput = problem.testCases?.some(t => t.output && t.output.trim() !== '');
      if (hasOutput) return problem;
    }
  } catch (err) {
    console.error('[problemService] Topic+difficulty query failed:', err.message);
  }

  // Step 2: Relax topic — any problem with this difficulty
  try {
    const problem = await fetchFromMongoDB({ difficulty: dbDiff }, excludedSet);
    if (problem) return problem;
  } catch (err) {
    console.error('[problemService] Difficulty-only query failed:', err.message);
  }

  // Step 3: Ultimate fallback — any problem in the DB
  try {
    const problem = await fetchFromMongoDB({}, excludedSet);
    if (problem) return problem;
  } catch (err) {
    console.error('[problemService] Ultimate fallback failed:', err.message);
  }

  const err = new Error('No problems found.');
  err.status = 400;
  throw err;
}
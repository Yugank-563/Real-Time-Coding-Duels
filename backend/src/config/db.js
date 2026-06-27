import mongoose from 'mongoose';
import axios from 'axios';
import { Problem } from '../models/index.js';
import redis from './redis.js';

const clearProblemsCache = async () => {
  try {
    const keys = await redis.keys('problems:*');
    if (keys && keys.length > 0) {
      await redis.del(keys);
      console.log(`[db] Cleared ${keys.length} cached problems page keys from Redis.`);
    }
  } catch (err) {
    console.warn('[db] Failed to clear problems cache in Redis:', err.message);
  }
};

const seedProblems = async () => {
  try {
    // Heal existing database problems in the background (non-blocking, using fast bulk update)
    const healDBProblems = async () => {
      try {
        const lock = await redis.set('lock:heal_problems', 'locked', { NX: true, EX: 60 });
        if (!lock) return;

        // Step 1: Fix missing titleSlug using the title
        const noSlug = await Problem.find({ titleSlug: { $exists: false } }, { title: 1 });
        for (const p of noSlug) {
          const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await Problem.updateOne({ _id: p._id }, { $set: { titleSlug: slug } });
        }

        console.log('[db] Healed database problems (titleSlug) successfully.');
      } catch (err) {
        console.error('[db] Error healing database problems:', err.message);
      }
    };

    // Trigger healing in the background
    healDBProblems();

    // Sync LeetCode problems in the background (non-blocking)
    const syncLeetCode = async () => {
      try {
        // Distributed lock to prevent race conditions across multiple instances
        const lock = await redis.set('lock:sync_leetcode', 'locked', { NX: true, EX: 600 });
        if (!lock) {
          console.log('[db] Background LeetCode sync is already running on another instance. Skipping.');
          return;
        }

        const problemsCount = await Problem.countDocuments({});
        if (problemsCount < 500) {
          console.log('[db] Under 500 problems in DB. Background syncing 1000 problems from LeetCode API...');
          const LEETCODE_BASE = process.env.LEETCODE_API_URL || 'https://alfa-leetcode-api.onrender.com';
          
          let allFreeProblems = [];
          for (let skip = 0; skip < 1000; skip += 100) {
            try {
              const resLc = await axios.get(`${LEETCODE_BASE}/problems?limit=100&skip=${skip}`, { timeout: 8000 });
              const pageProblems = resLc.data?.problemsetQuestionList || [];
              const freePageProblems = pageProblems.filter(p => !p.isPaidOnly);
              allFreeProblems.push(...freePageProblems);
              if (pageProblems.length < 100) break;
            } catch (pageErr) {
              console.error(`[db] Failed to fetch LeetCode page skip=${skip}:`, pageErr.message);
            }
          }

          console.log(`[db] Found ${allFreeProblems.length} free problems to seed.`);

          const bulkOps = allFreeProblems.map(p => {
            const dbDiff = p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1).toLowerCase();
            const tags = p.topicTags?.map(t => t.name) || [];
            return {
              updateOne: {
                filter: { titleSlug: p.titleSlug },
                update: {
                  $setOnInsert: {
                    title: p.title,
                    titleSlug: p.titleSlug,
                    difficulty: dbDiff,
                    tags,
                  }
                },
                upsert: true
              }
            };
          });

          if (bulkOps.length > 0) {
            await Problem.bulkWrite(bulkOps, { ordered: false });
          }

          console.log('[db] Background LeetCode sync completed successfully.');
          await clearProblemsCache();
        }
      } catch (syncErr) {
        console.error('[db] Background LeetCode sync failed:', syncErr.message);
      }
    };

    // Trigger background sync
    // syncLeetCode();

    // Auto-fill missing problem descriptions in the background
    const autoFillMissingDescriptions = async () => {
      try {
        const lock = await redis.set('lock:sync_missing_details', 'locked', { NX: true, EX: 3600 });
        if (!lock) return;

        // Find problems missing content, cpp boilerplate, testcases, or flagged as fallback
        const problemsToSync = await Problem.find({
          $or: [
            { content: { $exists: false } },
            { content: "" },
            { boilerplates: { $exists: false } },
            { 'boilerplates.cpp': { $exists: false } },
            { testCases: { $exists: false } },
            { testCases: { $size: 0 } }
          ]
        }, { titleSlug: 1 });

        if (problemsToSync.length === 0) return;

        console.log(`[db] Found ${problemsToSync.length} problems missing details. Starting background sync...`);
        const { fetchAndStoreProblemDetails } = await import('../services/problemService.js');

        for (let i = 0; i < problemsToSync.length; i++) {
          const slug = problemsToSync[i].titleSlug;
          console.log(`[db] Syncing details for ${slug} (${i + 1}/${problemsToSync.length})...`);
          
          try {
            await fetchAndStoreProblemDetails(slug);
            // Wait 8 seconds between requests to avoid LeetCode 429
            await new Promise(resolve => setTimeout(resolve, 8000));
          } catch (err) {
            if (err.message && err.message.includes('429')) {
              console.warn(`[db] Rate limited (429) while syncing ${slug}. Pausing background sync for 2 minutes...`);
              await new Promise(resolve => setTimeout(resolve, 120000)); // 2 min wait
              try {
                await fetchAndStoreProblemDetails(slug); // Retry once
              } catch (retryErr) {
                console.error(`[db] Retry failed for ${slug}. Skipping.`);
              }
            } else {
              console.error(`[db] Error syncing ${slug}:`, err.message);
            }
          }
        }
        console.log(`[db] Background sync of missing details completed.`);
      } catch (err) {
        console.error('[db] Error in autoFillMissingDescriptions:', err.message);
      }
    };

    // Trigger auto-fill missing details
    autoFillMissingDescriptions();

    // Clear problems cache on server startup/restart
    clearProblemsCache();
  } catch (err) {
    console.error('Error seeding database:', err);
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
    await seedProblems();
    return conn;
  } catch (err) {
    throw err;
  }
};

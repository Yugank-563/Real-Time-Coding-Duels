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
        // Step 1: Fix missing titleSlug using the title
        const noSlug = await Problem.find({ titleSlug: { $exists: false } }, { title: 1 });
        for (const p of noSlug) {
          const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await Problem.updateOne({ _id: p._id }, { $set: { titleSlug: slug } });
        }

        // Step 2: Single-pass bulk update — set source and sourceUrl on every problem that's missing them
        const db = Problem.db.db;
        const col = db.collection('problems');

        // Set source = 'leetcode' where source is not yet set and titleSlug does NOT start with 'cf-'
        await col.updateMany(
          { source: { $exists: false }, titleSlug: { $not: /^cf-/ } },
          [{
            $set: {
              source: 'leetcode',
              sourceUrl: { $concat: ['https://leetcode.com/problems/', '$titleSlug', '/'] }
            }
          }]
        );

        // Set source = 'codeforces' where source is not yet set and titleSlug starts with 'cf-'
        await col.updateMany(
          { source: { $exists: false }, titleSlug: /^cf-/ },
          { $set: { source: 'codeforces', sourceUrl: 'https://codeforces.com/' } }
        );

        // Set sourceUrl on leetcode problems that already have source but still missing sourceUrl
        await col.updateMany(
          { source: 'leetcode', sourceUrl: { $exists: false } },
          [{
            $set: {
              sourceUrl: { $concat: ['https://leetcode.com/problems/', '$titleSlug', '/'] }
            }
          }]
        );

        console.log('[db] Healed database problems (source/sourceUrl) successfully.');
      } catch (err) {
        console.error('[db] Error healing database problems:', err.message);
      }
    };

    // Trigger healing in the background
    healDBProblems();

    // Sync LeetCode problems in the background (non-blocking)
    const syncLeetCode = async () => {
      try {
        const leetcodeCount = await Problem.countDocuments({ source: 'leetcode' });
        if (leetcodeCount < 500) {
          console.log('[db] Under 500 LeetCode problems in DB. Background syncing 1000 problems from LeetCode API...');
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
                    source: 'leetcode',
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
    syncLeetCode();

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

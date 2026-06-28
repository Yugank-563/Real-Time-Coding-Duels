import { User, Battle } from '../models/index.js';

// Constants
const LEADERBOARD_USER_SELECT = 'username name email rank xp level streaks badges country createdAt';


// Find
export const getUserById = (userId) => 
  User.findById(userId)
    .select(LEADERBOARD_USER_SELECT)
    .lean();

export const getDistinctCountries = () => 
  User.distinct('country', { country: { $exists: true, $ne: '' } });


// Search
export const getUsers = (filter, sortField, sortOrder, skip, limitNum) => 
  User.find(filter)
    .select(LEADERBOARD_USER_SELECT)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limitNum)
    .lean();

export const countUsers = (filter) => User.countDocuments(filter);

export const getUserGlobalRank = (rank) => User.countDocuments({ rank: { $gt: rank } });


// Aggregate
export const getBattleStatsForUsers = (userIds) => 
  Battle.aggregate([
    {
      $match: {
        status: 'ended',
        'players.user': { $in: userIds },
      },
    },
    { $unwind: '$players' },
    {
      $match: { 'players.user': { $in: userIds } },
    },
    {
      $group: {
        _id: '$players.user',
        battlesPlayed: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [{ $eq: ['$winner', '$players.user'] }, 1, 0],
          },
        },
      },
    },
  ]);

export const getGlobalRankCounts = async (uniqueRanks) => {
  const rankCountsMap = {};
  if (!uniqueRanks || uniqueRanks.length === 0) return rankCountsMap;

  // Dynamically build a $facet stage to execute all counts in a single DB query
  const facetStage = {};
  uniqueRanks.forEach(r => {
    facetStage[`rank_${r}`] = [
      { $match: { rank: { $gt: r } } },
      { $count: 'count' }
    ];
  });

  const results = await User.aggregate([{ $facet: facetStage }]);
  const facetResults = results[0];

  uniqueRanks.forEach(r => {
    const countArr = facetResults[`rank_${r}`];
    rankCountsMap[r] = countArr.length > 0 ? countArr[0].count : 0;
  });

  return rankCountsMap;
};

export const getUserBattleStats = async (userId) => {
  const statsArr = await Battle.aggregate([
    { $match: { status: 'ended', 'players.user': userId } },
    { $unwind: '$players' },
    { $match: { 'players.user': userId } },
    {
      $group: {
        _id: '$players.user',
        battlesPlayed: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$winner', '$players.user'] }, 1, 0] } },
      },
    },
  ]);
  return statsArr[0] || { battlesPlayed: 0, wins: 0 };
};


// Backward Compatibility Aliases
export const getLeaderboardUsers = getUsers;
export const countLeaderboardUsers = countUsers;
export const getLeaderboardUserById = getUserById;

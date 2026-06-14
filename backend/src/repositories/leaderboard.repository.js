import { User, Battle } from '../models/index.js';

export const getLeaderboardUsers = async (filter, sortField, sortOrder, skip, limitNum) => {
  return await User.find(filter)
    .select('username name email rank xp level streaks badges country createdAt')
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limitNum)
    .lean();
};

export const countLeaderboardUsers = async (filter) => {
  return await User.countDocuments(filter);
};

export const getBattleStatsForUsers = async (userIds) => {
  return await Battle.aggregate([
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
};

export const getDistinctCountries = async () => {
  return await User.distinct('country', { country: { $exists: true, $ne: '' } });
};

export const getGlobalRankCounts = async (uniqueRanks) => {
  const rankCountsMap = {};
  if (!uniqueRanks || uniqueRanks.length === 0) return rankCountsMap;

  // Dynamically build a $facet stage to execute all counts in a single DB query
  const facetStage = {};
  uniqueRanks.forEach(r => {
    facetStage[`rank_${r}`] = [
      { $match: { rank: { $gt: r } } },
      { $count: "count" }
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

export const getUserGlobalRank = async (rank) => {
  return await User.countDocuments({ rank: { $gt: rank } });
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

export const getLeaderboardUserById = async (userId) => {
  return await User.findById(userId)
    .select('username name email rank xp level streaks badges country createdAt')
    .lean();
};

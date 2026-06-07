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
  await Promise.all(
    uniqueRanks.map(async (r) => {
      rankCountsMap[r] = await User.countDocuments({ rank: { $gt: r } });
    })
  );
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

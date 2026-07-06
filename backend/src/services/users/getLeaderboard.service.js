import {
  getLeaderboardUsers,
  countLeaderboardUsers,
  getBattleStatsForUsers,
  getDistinctCountries,
  getGlobalRankCounts,
  getUserGlobalRank,
  getUserBattleStats,
  getLeaderboardUserById
} from '../../repositories/index.js';
import { escapeRegex } from '../../utils/regexUtils.js';

export const getLeaderboardDataService = async ({ page, limit, search, sort, order, country, currentUserId }) => {
  const pageNum  = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip     = (pageNum - 1) * limitNum;

  // Build base filter
  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { username: { $regex: safeSearch, $options: 'i' } },
      { name:     { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (country && country !== 'ALL') {
    const safeCountry = escapeRegex(country);
    filter.country = { $regex: `^${safeCountry}$`, $options: 'i' };
  }

  // Sort config — hardcoded to 'rank' to prevent prototype pollution via user-supplied sort key
  const sortField = 'rating';
  const sortOrder = order === 'asc' ? 1 : -1;

  // Fetch paginated users & total count
  const [users, total] = await Promise.all([
    getLeaderboardUsers(filter, sortField, sortOrder, skip, limitNum),
    countLeaderboardUsers(filter),
  ]);

  if (!users.length) {
    return {
      users: [], total: 0, page: pageNum,
      totalPages: 0, hasNext: false, hasPrev: false, countries: [],
    };
  }

  // Aggregate battle stats for these users in one query
  const userIds = users.map((u) => u._id);
  const battleStats = await getBattleStatsForUsers(userIds);

  // Map stats by user id
  const statsMap = {};
  for (const s of battleStats) {
    statsMap[s._id.toString()] = {
      battlesPlayed: s.battlesPlayed,
      wins:          s.wins,
      losses:        s.battlesPlayed - s.wins,
      winRate:       s.battlesPlayed > 0 ? Math.round((s.wins / s.battlesPlayed) * 100) : 0,
    };
  }

  // Get distinct countries for filter dropdown
  const countries = await getDistinctCountries();

  // Compute ACTUAL global rank for every returned user
  const uniqueRanks = [...new Set(users.map((u) => u.rating))];
  const rankCountsMap = await getGlobalRankCounts(uniqueRanks);
  const globalRankCounts = users.map((u) => rankCountsMap[u.rating]);

  // Fetch current user stats if logged in
  let currentUserData = null;
  if (currentUserId) {
    const cu = await getLeaderboardUserById(currentUserId);
    if (cu) {
      const cStats = await getUserBattleStats(cu._id);
      const cuBattles = cStats.battlesPlayed;
      const cuWins = cStats.wins;
      const cuLosses = cuBattles - cuWins;
      const cuWinRate = cuBattles > 0 ? Math.round((cuWins / cuBattles) * 100) : 0;
      
      const cuRankCount = await getUserGlobalRank(cu.rating);
      
      const cuDisplay = cu.username || cu.name || cu.email?.split('@')[0] || 'Anonymous';
      currentUserData = {
        _id:           cu._id,
        displayName:   cuDisplay,
        name:          cu.name,
        username:      cu.username,
        country:       cu.country || '',
        rating:        cu.rating,
        globalRank:    cuRankCount + 1,
        createdAt:     cu.createdAt,
        battlesPlayed: cuBattles,
        wins:          cuWins,
        losses:        cuLosses,
        winRate:       cuWinRate,
      };
    }
  }

  // Enrich and return
  const totalPages = Math.ceil(total / limitNum);

  const userList = users.map((u, idx) => {
    const stats   = statsMap[u._id.toString()] || { battlesPlayed: 0, wins: 0, losses: 0, winRate: 0 };
    const display = u.username || u.name || u.email?.split('@')[0] || 'Anonymous';
    return {
      _id:           u._id,
      displayName:   display,
      name:          u.name,
      username:      u.username,
      country:       u.country || '',
      rating:          u.rating,
      globalRank:    globalRankCounts[idx] + 1,
      createdAt:     u.createdAt,
      battlesPlayed: stats.battlesPlayed,
      wins:          stats.wins,
      losses:        stats.losses,
      winRate:       stats.winRate,
    };
  });

  return {
    users: userList,
    total,
    page: pageNum,
    totalPages,
    hasNext:  pageNum < totalPages,
    hasPrev:  pageNum > 1,
    countries: countries.filter(Boolean).sort(),
    currentUser: currentUserData,
  };
};

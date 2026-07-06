import { findUserByUsernameExcludingPassword, getProfileBattleStats, getProfileActivityHeatmap, countUsers, getRecentRankedBattles } from '../../repositories/index.js';

export const getProfileService = async (username) => {
  // 1. Fetch main user details
  const user = await findUserByUsernameExcludingPassword(username);

  if (!user) {
    { const err = new Error('User not found.'); err.status = 404; throw err; }
  }

  const userId = user._id;

  // 2. Battle stats aggregation
  const battleStats = await getProfileBattleStats(userId);

  const stats = battleStats[0] || { totalBattles: 0, wins: 0, battles: [] };
  const winRate = stats.totalBattles > 0
    ? Math.round((stats.wins / stats.totalBattles) * 1000) / 10
    : 0;

  // 5. Activity Heatmap
  const activityData = await getProfileActivityHeatmap(userId);
  
  // 6. Recent Ranked Battles
  const rawRecentBattles = await getRecentRankedBattles(userId, 10);
  const recentBattlesFormatted = rawRecentBattles.map(battle => {
    // Find opponent from players array
    const opponentData = battle.players.find(p => p.user._id.toString() !== userId.toString())?.user || {};
    
    // Determine battle type label
    let typeLabel = 'Classic Battle';
    if (battle.battleType === 'timed-sprint') typeLabel = 'Timed Sprint';
    else if (battle.battleType === 'random-duel') typeLabel = 'Random Duel';
    else if (battle.battleType === 'topic-duel') typeLabel = 'Topic Duel';

    // Determine result
    const isWinner = battle.winner?.toString() === userId.toString();

    const myData = battle.players.find(p => p.user._id.toString() === userId.toString()) || {};

    return {
      id: battle._id.toString(),
      date: battle.createdAt,
      type: typeLabel,
      result: isWinner ? 'Victory' : 'Defeat',
      opponent: opponentData.username || 'unknown',
      opponentName: opponentData.name || '',
      ratingChange: myData.ratingChange !== undefined ? myData.ratingChange : 0,
    };
  });
  
  const activityMapData = {};
  activityData.forEach(item => {
    activityMapData[item._id] = item.count;
  });

  const activityMap = [];
  let totalSubmissions = 0;
  let activeDays = 0;
  let currentStreak = 0;
  let maxStreak = 0;

  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const count = activityMapData[dateStr] || 0;
    
    activityMap.push({ date: dateStr, count });
    
    totalSubmissions += count;
    if (count > 0) {
      activeDays++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  const activityStats = {
    totalSubmissions,
    activeDays,
    maxStreak
  };

  const actualRating = user.rating || 1200;

  const globalRank = await countUsers({ rating: { $gt: actualRating } }) + 1;

  return {
    user: {
      id: user._id,
      username: user.username || user.email.split('@')[0],
      name: user.name || '',
      email: user.email,
      bio: user.bio || '',
      country: user.country || '',
      rating: actualRating,
      globalRank: globalRank,
      joinDate: user.createdAt
    },
    battleStats: {
      totalBattles: stats.totalBattles,
      winRate,
    },
    activityStats,
    activityMap,
    recentBattles: recentBattlesFormatted
  };
};

import { findUserByUsernameExcludingPassword } from '../../repositories/index.js';
import { getProfileBattleStats, getRatingHistoryBattles } from '../../repositories/index.js';
import { getProfileSubmissionStats, getProfileDifficultyBreakdown } from '../../repositories/index.js';

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
  const losses = stats.totalBattles - stats.wins;
  const winRate = stats.totalBattles > 0
    ? Math.round((stats.wins / stats.totalBattles) * 1000) / 10
    : 0;

  // 3. Submission stats aggregation
  const submissionStats = await getProfileSubmissionStats(userId);

  const subStats = submissionStats[0] || {
    totalSubmissions: 0,
    accepted: 0,
    uniqueProblems: [],
  };

  const acceptanceRate = subStats.totalSubmissions > 0
    ? Math.round((subStats.accepted / subStats.totalSubmissions) * 1000) / 10
    : 0;

  // 4. Problem difficulty breakdown
  const difficultyBreakdown = await getProfileDifficultyBreakdown(userId);

  const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
  difficultyBreakdown.forEach((d) => {
    if (d._id && difficulties.hasOwnProperty(d._id)) {
      difficulties[d._id] = d.count;
    }
  });

  // 6. Rating history from battles (chronological ELO progression)
  const ratingBattles = await getRatingHistoryBattles(userId);

  const ratingHistory = [];
  ratingHistory.push({
    date: user.createdAt || new Date(),
    rating: 1200,
    name: 'Joined Platform',
    rank: '-',
    solved: '-',
  }); // Join baseline

  let elo = 1200;
  ratingBattles.forEach((b) => {
    const isWin = b.winner && b.winner.toString() === userId.toString();
    elo += isWin ? 15 : -10;

    const playerRec = b.players.find((p) => p.user.toString() === userId.toString());
    const totalPlayers = b.players.length;
    const rankVal = isWin ? 1 : 2;

    const solvedVal =
      isWin || (playerRec && playerRec.status === 'submitted') ? '1 / 1' : '0 / 1';

    const battleTypeName = b.battleType
      ? b.battleType.charAt(0).toUpperCase() + b.battleType.slice(1) + ' Battle'
      : 'Battle';

    ratingHistory.push({
      date: b.createdAt,
      rating: elo,
      name: battleTypeName,
      rank: `${rankVal} / ${totalPlayers}`,
      solved: solvedVal,
    });
  });

  if (ratingBattles.length > 0) {
    const actualRating = user.rank || 1200;
    const drift = actualRating - elo;
    const driftPerBattle = drift / ratingBattles.length;

    for (let i = 1; i < ratingHistory.length; i++) {
      ratingHistory[i].rating = Math.round(
        ratingHistory[i].rating + driftPerBattle * i
      );
    }
  }

  return {
    user: {
      id: user._id,
      username: user.username || user.email.split('@')[0],
      name: user.name || '',
      email: user.email,
      bio: user.bio || '',
      country: user.country || '',
      rating: user.rank || 1200,
      xp: user.xp || 0,
      level: user.level || 1,
      streaks: user.streaks || 0,
      badges: user.badges || [],
      joinDate: user.createdAt,
      casualStats: user.casualStats || {
        totalBattles: 0,
        wins: 0,
        losses: 0,
        draws: 0
      }
    },
    battleStats: {
      totalBattles: stats.totalBattles,
      winRate,
    },
    submissionStats: {
      totalSubmissions: subStats.totalSubmissions,
      accepted: subStats.accepted,
      acceptanceRate,
      problemsSolved: subStats.uniqueProblems.length,
    },
    difficulties,
    ratingHistory,
  };
};

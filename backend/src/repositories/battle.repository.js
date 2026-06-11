import { Battle } from '../models/index.js';

export const createBattle = async (data) => {
  return await Battle.create(data);
};

export const findBattleById = async (id) => {
  return await Battle.findById(id);
};

export const findBattleByIdWithPopulated = async (id, populations = []) => {
  let query = Battle.findById(id);
  populations.forEach(p => {
    query = query.populate(p);
  });
  return await query;
};

export const findBattleByRoomCode = async (roomCode) => {
  return await Battle.findOne({ roomCode });
};

export const countBattles = async (query) => {
  return await Battle.countDocuments(query);
};

export const updateBattleById = async (id, updateData) => {
  return await Battle.findByIdAndUpdate(id, updateData, { new: true });
};

export const getProfileBattleStats = async (userId) => {
  return await Battle.aggregate([
    {
      $match: {
        'players.user': userId,
        status: { $in: ['active', 'ended'] },
      },
    },
    {
      $project: {
        winner: 1,
        startTime: 1,
        endTime: 1,
        problem: 1,
        battleType: 1,
        players: 1,
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalBattles: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [{ $eq: ['$winner', userId] }, 1, 0],
          },
        },
        battles: { $push: '$$ROOT' },
      },
    },
  ]);
};

export const getRatingHistoryBattles = async (userId) => {
  return await Battle.find({
    'players.user': userId,
    status: 'ended',
  })
    .select('winner players createdAt battleType')
    .sort({ createdAt: 1 })
    .lean();
};

import { Battle } from '../models/index.js';


// Create
export const create = (data) => Battle.create(data);


// Find
export const findById = (id) => Battle.findById(id);

export const findByIdWithPopulated = (id, populations = []) => {
  let query = Battle.findById(id);
  populations.forEach(p => {
    query = query.populate(p);
  });
  return query;
};

export const findByRoomCode = (roomCode) => Battle.findOne({ roomCode });

export const getRatingHistory = (userId) => 
  Battle.find({
    'players.user': userId,
    status: 'ended',
  })
    .select('winner players createdAt battleType')
    .sort({ createdAt: 1 })
    .lean();


// Search
export const count = (query) => Battle.countDocuments(query);


// Update
export const updateById = (id, updateData) => 
  Battle.findByIdAndUpdate(id, updateData, { new: true });


// Aggregate
export const getProfileStats = (userId) => 
  Battle.aggregate([
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


// Backward Compatibility Aliases
export const createBattle = create;
export const findBattleById = findById;
export const findBattleByIdWithPopulated = findByIdWithPopulated;
export const findBattleByRoomCode = findByRoomCode;
export const countBattles = count;
export const updateBattleById = updateById;
export const getProfileBattleStats = getProfileStats;
export const getRatingHistoryBattles = getRatingHistory;

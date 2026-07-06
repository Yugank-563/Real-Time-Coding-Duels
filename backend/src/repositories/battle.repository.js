import { Battle } from '../models/index.js';


// Create
const create = (data) => Battle.create(data);


// Find
const findById = (id) => Battle.findById(id);

const findByIdWithPopulated = (id, populations = []) => {
  let query = Battle.findById(id);
  populations.forEach(p => {
    query = query.populate(p);
  });
  return query;
};

const findBattleByRoomCode = (roomCode) => 
  Battle.findOne({ roomCode });


const findActiveBattleByUserId = (userId) => 
  Battle.findOne({
    'players.user': userId,
    status: { $in: ['active', 'waiting'] },
  });


// Search
const count = (query) => Battle.countDocuments(query);


// Update
const updateById = (id, updateData) => 
  Battle.findByIdAndUpdate(id, updateData, { new: true });


// Aggregate
const getProfileStats = (userId) => 
  Battle.aggregate([
    {
      $match: {
        'players.user': userId,
        status: { $in: ['active', 'ended'] },
        mode: { $ne: 'casual' }
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

export const getRecentRankedBattles = (userId, limitNum = 10) => 
  Battle.find({
    'players.user': userId,
    mode: 'ranked',
    status: 'ended'
  })
  .sort({ createdAt: -1 })
  .limit(limitNum)
  .populate('players.user', 'username name email')
  .populate('problem', 'difficulty titleSlug')
  .lean();


// Backward Compatibility Aliases
export const createBattle = create;
export const findBattleById = findById;
export const findBattleByIdWithPopulated = findByIdWithPopulated;
export const countBattles = count;
export const updateBattleById = updateById;
export const getProfileBattleStats = getProfileStats;
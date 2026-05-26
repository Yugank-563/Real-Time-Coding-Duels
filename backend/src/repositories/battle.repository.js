import Battle from '../models/Battle.js';

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

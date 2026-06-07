import { searchUsersByNameOrEmail } from '../../repositories/index.js';

export const searchUsersService = async (queryTerm, excludeUserId) => {
  if (!queryTerm || !queryTerm.trim()) {
    return [];
  }

  // Match by name or email, excluding the active user challenge creator
  const matchedUsers = await searchUsersByNameOrEmail(queryTerm, excludeUserId);

  return matchedUsers.map(u => ({
    _id: u._id,
    username: u.username || u.email.split('@')[0],
    name: u.name || '',
    elo: u.rank || 1200,
    level: u.level || 1
  }));
};

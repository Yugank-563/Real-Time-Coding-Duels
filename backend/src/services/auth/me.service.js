import { findUserById } from '../../repositories/index.js';

export const getMeService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    const err = new Error('User profile not found.');
    err.status = 404;
    throw err;
  }

  return user;
};

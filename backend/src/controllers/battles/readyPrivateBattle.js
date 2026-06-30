import { readyPrivateBattleService } from '../../services/index.js';

export const readyPrivateBattle = async (req, res, next) => {
  try {
    const result = await readyPrivateBattleService(req.params.id, req.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

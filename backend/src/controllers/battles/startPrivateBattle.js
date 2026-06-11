import { startPrivateBattleService } from '../../services/index.js';

export const startPrivateBattle = async (req, res, next) => {
  try {
    const result = await startPrivateBattleService(req.params.id, req.userId);
    res.status(200).json({
      message: 'Battle started successfully.',
      ...result
    });
  } catch (error) {
    next(error);
}
};

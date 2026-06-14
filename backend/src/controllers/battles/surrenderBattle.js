import { surrenderBattleService } from '../../services/index.js';

export const surrenderBattle = async (req, res, next) => {
  try {
    const result = await surrenderBattleService(req.params.id, req.userId);
    res.status(200).json({
      message: 'Successfully surrendered battle.',
      ...result
    });
  } catch (error) {
    next(error);
}
};

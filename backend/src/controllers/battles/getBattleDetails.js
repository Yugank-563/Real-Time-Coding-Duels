import { getBattleDetailsService } from '../../services/index.js';

export const getBattleDetails = async (req, res, next) => {
  try {
    const details = await getBattleDetailsService(req.params.id, req.userId);
    res.status(200).json(details);
  } catch (error) {
    next(error);
}
};

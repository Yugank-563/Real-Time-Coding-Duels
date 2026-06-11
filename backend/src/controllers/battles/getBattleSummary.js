import { getBattleSummaryService } from '../../services/index.js';

export const getBattleSummary = async (req, res, next) => {
  try {
    const summary = await getBattleSummaryService(req.params.id);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
}
};

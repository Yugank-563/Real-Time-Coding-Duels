import { getAiReviewService } from '../../services/index.js';

export const getAiReview = async (req, res) => {
  try {
    const battleId = req.params.id;
    const userId = req.user._id || req.user.id;

    const reviewData = await getAiReviewService(battleId, userId);
    res.json(reviewData);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

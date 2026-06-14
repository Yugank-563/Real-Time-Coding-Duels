import { getTopicsService } from '../../services/index.js';

export const getTopics = async (req, res, next) => {
  try {
    const result = await getTopicsService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
}
};

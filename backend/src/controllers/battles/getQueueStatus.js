import { getQueuePosition } from '../../services/index.js';

export const getQueueStatus = async (req, res, next) => {
  try {
    const { battleType, mode = 'ranked' } = req.query;
    if (!battleType) {
      return res.status(400).json({ message: 'battleType query parameter is required.' });
    }

    const status = await getQueuePosition(req.userId, battleType, mode);
    res.status(200).json(status);
  } catch (error) {
    next(error);
}
};

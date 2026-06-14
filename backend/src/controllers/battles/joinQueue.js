import { joinQueueService } from '../../services/index.js';

export const joinQueue = async (req, res, next) => {
  try {
    const { battleType, topic } = req.body;
    
    const result = await joinQueueService(req.userId, battleType, topic);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

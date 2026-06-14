import { createPrivateRoomService } from '../../services/index.js';

export const createPrivateRoom = async (req, res, next) => {
  try {
    const { name, password, difficulty, timeLimit } = req.body;
    const originHeader = req.headers.origin;

    const result = await createPrivateRoomService(name, password, difficulty, timeLimit, req.userId, originHeader);
    res.status(201).json(result);
  } catch (error) {
    next(error);
}
};

import { createPrivateRoomService } from '../../services/index.js';

export const createPrivateRoom = async (req, res) => {
  try {
    const { name, password, difficulty, timeLimit } = req.body;
    const originHeader = req.headers.origin;

    const result = await createPrivateRoomService(name, password, difficulty, timeLimit, req.userId, originHeader);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Room Name is required.') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'No coding challenges exist in system.') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

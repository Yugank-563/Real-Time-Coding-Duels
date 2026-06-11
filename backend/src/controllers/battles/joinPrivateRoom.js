import { joinPrivateRoomService } from '../../services/index.js';

export const joinPrivateRoom = async (req, res, next) => {
  try {
    const { roomCode, password } = req.body;
    const result = await joinPrivateRoomService(roomCode, password, req.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
}
};

import { joinPrivateRoomService } from '../../services/battles/index.js';

export const joinPrivateRoom = async (req, res) => {
  try {
    const { roomCode, password } = req.body;
    const result = await joinPrivateRoomService(roomCode, password, req.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Room Code is required.' || error.message === 'Lobby is no longer accepting players.' || error.message === 'Lobby is already full.') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Private custom room not found.') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Incorrect password.') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

import { startPrivateBattleService } from '../../services/index.js';

export const startPrivateBattle = async (req, res) => {
  try {
    const result = await startPrivateBattleService(req.params.roomId, req.userId);
    res.status(200).json({
      message: 'Battle started successfully.',
      ...result
    });
  } catch (error) {
    if (error.message === 'Custom room not found.') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Only the lobby host can start the battle.') {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === 'Waiting for an opponent to join.') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

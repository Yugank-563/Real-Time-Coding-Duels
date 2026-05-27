import { surrenderBattleService } from '../../services/battles/index.js';

export const surrenderBattle = async (req, res) => {
  try {
    const result = await surrenderBattleService(req.params.id, req.userId);
    res.status(200).json({
      message: 'Successfully surrendered battle.',
      ...result
    });
  } catch (error) {
    if (error.message === 'Battle room not found.') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Battle is not active.' || error.message === 'Lobby is no longer accepting players.') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'You are not a participant in this battle.') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

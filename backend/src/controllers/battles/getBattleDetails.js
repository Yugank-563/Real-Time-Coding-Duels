import { getBattleDetailsService } from '../../services/index.js';

export const getBattleDetails = async (req, res) => {
  try {
    const details = await getBattleDetailsService(req.params.id, req.userId);
    res.status(200).json(details);
  } catch (error) {
    if (error.message === 'Battle room not found.') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'You are not a participant in this battle.') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

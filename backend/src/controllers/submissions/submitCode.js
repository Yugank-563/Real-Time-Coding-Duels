import { submitCodeService } from '../../services/index.js';

export const submitBattleCode = async (req, res) => {
  try {
    const { battleId, code, language, problemId } = req.body;
    const result = await submitCodeService(battleId, code, language, problemId, req.userId);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.startsWith('Missing required parameter') || error.message === 'You are not a participant in this battle.') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Target problem not found.' || error.message === 'Battle room not found.') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

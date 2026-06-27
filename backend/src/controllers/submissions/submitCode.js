import { submitCodeService } from '../../services/index.js';

export const submitBattleCode = async (req, res, next) => {
  try {
    const { battleId, code, language, problemId } = req.body;
    const result = await submitCodeService(battleId, code, language, problemId, req.userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
}
};

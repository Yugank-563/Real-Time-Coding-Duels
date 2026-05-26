import { getBattleSummaryService } from '../../services/battles/index.js';

export const getBattleSummary = async (req, res) => {
  try {
    const summary = await getBattleSummaryService(req.params.id);
    res.status(200).json(summary);
  } catch (error) {
    if (error.message === 'Battle room not found.') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

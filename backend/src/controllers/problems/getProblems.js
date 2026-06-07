import { getProblemsService } from '../../services/index.js';

export const getProblems = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = '', difficulty = 'ALL', tag = 'ALL' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;

    const responsePayload = await getProblemsService({
      pageNum,
      limitNum,
      search,
      difficulty,
      tag
    });

    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

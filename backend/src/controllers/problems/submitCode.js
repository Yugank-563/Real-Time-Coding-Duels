import { executeCodeService } from '../../services/index.js';

export const submitProblemCode = async (req, res) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body;
    const userId = req.userId;

    const result = await executeCodeService({
      userId,
      slug,
      code,
      language,
      isSubmit: true
    });

    res.json(result);
  } catch (err) {
    console.error('[Submit] Error:', err);
    if (err.message === 'Problem not found' || err.message === 'No test cases available for this problem.') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

import { executeCodeService } from '../../services/index.js';

export const submitProblemCode = async (req, res, next) => {
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
    next(err);
}
};

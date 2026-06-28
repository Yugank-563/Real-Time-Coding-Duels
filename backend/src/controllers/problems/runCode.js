import { executeCodeService } from '../../services/index.js';

export const runCode = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { code, language, customInputs = [] } = req.body;
    const userId = req.userId;

    const result = await executeCodeService({
      userId,
      slug,
      code,
      language,
      customInputs,
      isSubmit: false
    });

    res.json(result);
  } catch (err) {
    next(err);
}
};

import { getProblemDetailsService } from '../../services/index.js';

export const getProblemDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await getProblemDetailsService(slug);
    res.json(problem);
  } catch (err) {
    if (err.message.includes('Problem not found')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

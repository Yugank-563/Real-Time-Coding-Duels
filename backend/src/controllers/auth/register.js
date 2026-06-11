import { registerService } from '../../services/index.js';

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await registerService(email, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
}
};

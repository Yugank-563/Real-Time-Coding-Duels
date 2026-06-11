import { forgotPasswordService } from '../../services/index.js';

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await forgotPasswordService(email);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

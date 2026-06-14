import { getMeService } from '../../services/index.js';
import { formatUserDTO } from '../../utils/userDto.js';

export const getMe = async (req, res, next) => {
  try {
    const user = await getMeService(req.userId);

    res.status(200).json(formatUserDTO(user));
  } catch (error) {
    next(error);
  }
};

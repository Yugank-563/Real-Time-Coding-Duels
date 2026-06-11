import { loginService } from '../../services/index.js';
import { formatUserDTO } from '../../utils/userDto.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken, user } = await loginService(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      user: formatUserDTO(user),
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

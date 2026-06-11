import { logoutService } from '../../services/index.js';
import { getCookie } from '../../utils/cookieUtils.js';

export const logout = async (req, res, next) => {
  try {
    const token = getCookie(req, 'refreshToken') || req.body?.refreshToken;
    await logoutService(token);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
}
};

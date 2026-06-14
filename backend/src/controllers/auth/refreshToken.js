import { refreshTokenService } from '../../services/index.js';
import { getCookie } from '../../utils/cookieUtils.js';

export const refreshToken = async (req, res, next) => {
  try {
    const token = getCookie(req, 'refreshToken') || req.body?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } = await refreshTokenService(token);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ token: accessToken });
  } catch (error) {
    next(error);
}
};

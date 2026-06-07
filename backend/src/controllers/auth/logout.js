import { logoutService } from '../../services/index.js';

const getCookie = (req, name) => {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list[name];
};

export const logout = async (req, res) => {
  try {
    const token = getCookie(req, 'refreshToken') || req.body?.refreshToken;
    await logoutService(token);

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

import { refreshTokenService } from '../../services/auth/index.js';

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

export const refreshToken = async (req, res) => {
  try {
    const token = getCookie(req, 'refreshToken') || req.body?.refreshToken;
    const { accessToken } = await refreshTokenService(token);
    res.json({ token: accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

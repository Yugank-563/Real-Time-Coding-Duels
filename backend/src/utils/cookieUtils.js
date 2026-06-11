// Parses a cookie value from the request headers by name.
// Used across auth controllers (logout, refreshToken) to read httpOnly cookies.
export const getCookie = (req, name) => {
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

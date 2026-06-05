import api from '../utils/api';

export const fetchProfile = async (username) => {
  const res = await api.get(`/api/users/profile/${username}`);
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/api/users/profile', data);
  return res.data;
};

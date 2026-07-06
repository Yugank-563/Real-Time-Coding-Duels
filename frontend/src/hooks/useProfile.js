import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, setUser } from '../features/index';
import { useToast } from './useToast';
import { api } from '../utils/index';

const fetchProfile = async (username) => {
  const res = await api.get(`/api/users/profile/${username}`);
  return res.data;
};

const updateProfile = async (data) => {
  const res = await api.put('/api/users/profile', data);
  return res.data;
};

export const useProfile = (username) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetchProfile(username)
      .then(data => setProfile(data))
      .catch(err => {
        toast.error(err.response?.data?.message || 'Could not load profile.');
      })
      .finally(() => setLoading(false));
  }, [username]);

  const handleSave = useCallback(async (data) => {
    try {
      const result = await updateProfile(data);
      if (result.user) {
        dispatch(setUser({ ...currentUser, ...result.user }));
      }
      if (result.user?.username && result.user.username !== username) {
        toast.success('Profile updated.');
        navigate(`/profile/${result.user.username}`);
        return { success: true, newUsername: result.user.username };
      }
      setProfile(prev => ({ ...prev, user: { ...prev.user, ...result.user } }));
      toast.success('Profile updated.');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile.');
      return { success: false, error: err };
    }
  }, [currentUser, dispatch, navigate, toast, username]);

  return {
    profile,
    loading,
    isOwn,
    handleSave,
  };
};

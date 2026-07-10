export const formatUserDTO = (user) => {
  return {
    id: user._id,
    email: user.email,
    username: user.username || user.email.split('@')[0],
    name: user.name || '',
    rating: user.rating || 1200,
    bio: user.bio || '',
    country: user.country || '',
    joinDate: user.createdAt,
  };
};

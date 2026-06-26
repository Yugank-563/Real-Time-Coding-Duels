// Returns Tailwind CSS class strings for difficulty levels
export const getDifficultyConfig = (difficulty) => {
  if (difficulty === 'Easy')   return { color: 'text-emerald', bg: 'bg-emerald/10', border: 'border-emerald/30' };
  if (difficulty === 'Medium') return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' };
  if (difficulty === 'Hard')   return { color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/30' };
  return                              { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
};



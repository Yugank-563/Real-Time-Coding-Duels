/**
 * Shared difficulty configuration utility.
 * Returns consistent color/style tokens for any difficulty level.
 *
 * Used by:
 *  - workspace/ProblemPanel/ProblemPanel.jsx (practice mode)
 *  - components/battle/ProblemPanel.jsx (battle mode)
 */

/**
 * Returns Tailwind CSS class strings for a given difficulty level.
 * Works for both dark-mode battle panels and the auth-themed practice panels.
 *
 * @param {'Easy'|'Medium'|'Hard'|string} difficulty
 * @returns {{ color: string, bg: string, border: string }}
 */
export const getDifficultyConfig = (difficulty) => {
  if (difficulty === 'Easy')   return { color: 'text-emerald', bg: 'bg-emerald/10', border: 'border-emerald/30' };
  if (difficulty === 'Medium') return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' };
  if (difficulty === 'Hard')   return { color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/30' };
  return                              { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
};

/**
 * Returns Tailwind class string for difficulty badge in battle dark-mode panels.
 * Combined into a single string for convenience.
 *
 * @param {'Easy'|'Medium'|'Hard'|string} difficulty
 * @returns {string}
 */
export const getBattleDifficultyClass = (difficulty) => {
  if (difficulty === 'Easy')   return 'text-emerald border-emerald/20 bg-emerald/10';
  if (difficulty === 'Medium') return 'text-warning border-warning/20 bg-warning/10';
  if (difficulty === 'Hard')   return 'text-danger border-danger/20 bg-danger/10';
  return                              'text-primary border-primary/20 bg-primary/10';
};

/**
 * Format a time duration (in seconds or milliseconds) into a mm:ss string.
 * @param {number} time - The time duration.
 * @param {boolean} [isMilliseconds=false] - Whether the time is in milliseconds.
 * @returns {string} Formatted string like "1m 30s" or "45s".
 */
export const formatDuration = (time, isMilliseconds = false) => {
  if (time == null || isNaN(time)) return '--';
  const totalSeconds = Math.floor(isMilliseconds ? time / 1000 : time);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/**
 * Format a time duration (in seconds) into a digital mm:ss string for timers.
 * @param {number} secs - The time in seconds.
 * @returns {string} Formatted string like "02:05" or "15:30".
 */
export const formatTimer = (secs) => {
  if (secs == null || isNaN(secs)) return '--:--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  
  return h > 0 
    ? `${h.toString().padStart(2, '0')}:${mStr}:${sStr}`
    : `${mStr}:${sStr}`;
};

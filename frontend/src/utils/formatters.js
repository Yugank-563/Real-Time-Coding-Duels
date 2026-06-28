// Formats seconds into mm:ss or hh:mm:ss string
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

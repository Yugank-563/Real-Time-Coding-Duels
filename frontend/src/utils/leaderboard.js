export const getTierColors = (elo = 1200) => {
  if (elo >= 2400) return { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)'   };
  if (elo >= 2000) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)'  };
  if (elo >= 1700) return { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.25)'  };
  if (elo >= 1400) return { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)'  };
  return { color: 'var(--auth-heading)', bg: 'transparent', border: 'transparent' };
};

export const getInitials = (name = '') => (name || '??').slice(0, 2).toUpperCase();

export const winRateColor = (pct) => {
  if (pct >= 40) return '#22c55e';
  return '#ef4444';
};

export const MEDAL_STYLE = {
  1: { label: '1st', color: '#F6C90E', bg: 'rgba(246,201,14,0.12)', border: 'rgba(246,201,14,0.35)' },
  2: { label: '2nd', color: '#B0B8C1', bg: 'rgba(176,184,193,0.12)', border: 'rgba(176,184,193,0.35)' },
  3: { label: '3rd', color: '#CD7C4B', bg: 'rgba(205,124,75,0.12)', border: 'rgba(205,124,75,0.35)' },
};

import { useState, useEffect } from 'react';
import { api } from '../../utils/index';

export const useLobbyStats = () => {
  const [lobbyStats, setLobbyStats] = useState(null);

  useEffect(() => {
    const fetchLobbyStats = async () => {
      try {
        const res = await api.get('/api/battles/lobby-stats');
        setLobbyStats(res.data);
      } catch { }
    };
    fetchLobbyStats();
    const interval = setInterval(fetchLobbyStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { lobbyStats };
};

import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title 
      ? `${title} | BattleCode` 
      : 'BattleCode - Real-Time Multiplayer Coding Platform';
  }, [title]);
};

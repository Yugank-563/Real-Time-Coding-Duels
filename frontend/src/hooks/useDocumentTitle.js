import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title 
      ? `${title} | Coduelo` 
      : 'Coduelo | Code. Duel. Conquer.';
  }, [title]);
};

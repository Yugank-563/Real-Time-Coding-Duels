import { useState, useEffect, useCallback } from 'react';

export const useTestcaseManager = (initialVars = ['input'], initialCases = [['']]) => {
  const [vars, setVars] = useState(initialVars);
  const [cases, setCases] = useState(initialCases);
  const [activeCase, setActiveCase] = useState(0);

  // Sync variables and cases if initial values change
  useEffect(() => {
    if (initialVars && initialVars.length > 0) {
      setVars(initialVars);
    }
  }, [initialVars]);

  useEffect(() => {
    if (initialCases && initialCases.length > 0) {
      setCases(initialCases);
      setActiveCase(0);
    }
  }, [initialCases]);

  const handleAddCase = useCallback(() => {
    setCases(prevCases => {
      if (prevCases.length >= 10) return prevCases;
      // Copy last case or fill with empty strings
      const current = prevCases[activeCase] || Array(vars.length).fill('');
      const updated = [...prevCases, [...current]];
      setActiveCase(updated.length - 1);
      return updated;
    });
  }, [activeCase, vars.length]);

  const handleDeleteCase = useCallback((idx, e) => {
    if (e) e.stopPropagation();
    setCases(prevCases => {
      if (prevCases.length <= 1) return prevCases;
      const updated = prevCases.filter((_, i) => i !== idx);
      
      setActiveCase(prevActive => {
        if (prevActive >= updated.length) {
          return updated.length - 1;
        } else if (prevActive === idx) {
          return Math.max(0, idx - 1);
        }
        return prevActive;
      });
      
      return updated;
    });
  }, []);

  const handleCaseInputChange = useCallback((caseIdx, varIdx, value) => {
    setCases(prevCases => {
      const updated = [...prevCases];
      if (!updated[caseIdx]) updated[caseIdx] = Array(vars.length).fill('');
      updated[caseIdx] = [...updated[caseIdx]];
      updated[caseIdx][varIdx] = value;
      return updated;
    });
  }, [vars.length]);

  return {
    vars,
    setVars,
    cases,
    setCases,
    activeCase,
    setActiveCase,
    handleAddCase,
    handleDeleteCase,
    handleCaseInputChange,
  };
};
export default useTestcaseManager;

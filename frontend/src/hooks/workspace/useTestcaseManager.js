import { useState, useEffect, useCallback } from 'react';

export const useTestcaseManager = (initialVars = ['input'], initialCases = [['']]) => {
  const [vars, setVars] = useState(initialVars);
  const [cases, setCases] = useState(initialCases);
  const [activeCase, setActiveCase] = useState(0);

  const initialVarsStr = JSON.stringify(initialVars);
  const initialCasesStr = JSON.stringify(initialCases);

  // Sync variables and cases if initial values change (deep compare)
  useEffect(() => {
    if (initialVars && initialVars.length > 0) {
      setVars(initialVars);
    }
  }, [initialVarsStr]);

  useEffect(() => {
    if (initialCases && initialCases.length > 0) {
      setCases(initialCases);
      setActiveCase(0);
    }
  }, [initialCasesStr]);

  const handleAddCase = useCallback(() => {
    if (cases.length >= 10) return;
    const current = cases[activeCase] || Array(vars.length).fill('');
    setCases([...cases, [...current]]);
    setActiveCase(cases.length);
  }, [activeCase, cases, vars.length]);

  const handleDeleteCase = useCallback((idx, e) => {
    if (e) e.stopPropagation();
    if (cases.length <= 1) return;
    
    const updated = cases.filter((_, i) => i !== idx);
    setCases(updated);
    
    setActiveCase(prevActive => {
      if (prevActive >= updated.length) {
        return updated.length - 1;
      } else if (prevActive === idx) {
        return Math.max(0, idx - 1);
      }
      return prevActive;
    });
  }, [cases]);

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
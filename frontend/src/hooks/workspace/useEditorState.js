import { useState, useEffect, useRef } from 'react';

export const useEditorState = (problem, initialLanguage = 'cpp') => {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [codeMap, setCodeMap] = useState({});

  const problemId = problem?._id || problem?.titleSlug || 'default';

  // Use ref to avoid trigger loops on saving
  const codeMapRef = useRef({});

  // Sync ref with state
  useEffect(() => {
    codeMapRef.current = codeMap;
  }, [codeMap]);

  // Load code template / cache when problem changes
  useEffect(() => {
    if (!problem) return;
    const cacheKey = `bc-code-${problemId}`;
    const saved = localStorage.getItem(cacheKey);
    let initialMap = {};
    if (saved) {
      try {
        initialMap = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved code:', e);
      }
    }

    const mergedMap = {};
    const languages = ['cpp', 'py', 'js'];
    languages.forEach(lang => {
      mergedMap[lang] = initialMap[lang] || problem.boilerplates?.[lang] || '';
    });

    // Make sure we fallback to a sensible template if empty
    if (!mergedMap.cpp && problem.boilerplates?.cpp) {
      mergedMap.cpp = problem.boilerplates.cpp;
    }

    setCodeMap(mergedMap);
  }, [problemId, problem]);

  const updateCode = (lang, newCode) => {
    setCodeMap(prev => {
      const updated = { ...prev, [lang]: newCode };
      const cacheKey = `bc-code-${problemId}`;
      localStorage.setItem(cacheKey, JSON.stringify(updated));
      return updated;
    });
  };

  const resetCode = () => {
    if (!problem) return;
    const defaultTemplate = problem.boilerplates?.[selectedLanguage] || '';
    updateCode(selectedLanguage, defaultTemplate);
  };

  return {
    selectedLanguage,
    setSelectedLanguage,
    code: codeMap[selectedLanguage] || '',
    setCode: (newCode) => updateCode(selectedLanguage, newCode),
    codeMap,
    resetCode,
  };
};

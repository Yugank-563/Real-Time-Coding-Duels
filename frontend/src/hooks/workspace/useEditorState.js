import { useState, useEffect, useRef } from 'react';

export const useEditorState = (problem, initialLanguage = 'cpp', mode = 'practice') => {
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
    const cacheKey = `bc-code-${mode}-${problemId}`;
    let saved = localStorage.getItem(cacheKey);
    
    // Legacy migration: If new mode cache is empty but an old generic cache exists, migrate it to Practice mode
    if (!saved && mode === 'practice') {
      const legacyKey = `bc-code-${problemId}`;
      const legacySaved = localStorage.getItem(legacyKey);
      if (legacySaved) {
        saved = legacySaved;
        localStorage.setItem(cacheKey, legacySaved); // migrate it to the new key
        localStorage.removeItem(legacyKey); // clean up the old one
      }
    }
    
    let initialMap = {};
    if (saved) {
      try {
        initialMap = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved code:', e);
      }
    }

    const mergedMap = {};
    const languages = ['cpp'];
    languages.forEach(lang => {
      const cachedCode = initialMap[lang];
      const boilerplate = problem.boilerplates?.[lang] || '';
      
      // If there's no cached code OR it's just empty spaces/newlines, use the boilerplate
      if (!cachedCode || cachedCode.trim() === '') {
        mergedMap[lang] = boilerplate;
      } else {
        mergedMap[lang] = cachedCode;
      }
    });

    setCodeMap(mergedMap);
  }, [problemId, problem]);

  const updateCode = (lang, newCode) => {
    setCodeMap(prev => {
      const updated = { ...prev, [lang]: newCode };
      const cacheKey = `bc-code-${mode}-${problemId}`;
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

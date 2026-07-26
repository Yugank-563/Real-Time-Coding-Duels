import { useState, useEffect } from 'react';
import { api } from '../../utils/index';

// Robust helper to extract parameter variable names
export const getVariableNames = (problem) => {
  if (!problem) return [];

  // 0. Use explicit inputVars if defined in the problem document
  //    (set for problems whose driver needs inputs not in the function signature,
  //     e.g. Linked List Cycle needs 'pos' even though hasCycle(head) has only 'head')
  if (Array.isArray(problem.inputVars) && problem.inputVars.length > 0) {
    return problem.inputVars;
  }

  // 1. Try parsing C++ boilerplate signature

  if (problem.boilerplates?.cpp) {
    const match = problem.boilerplates.cpp.match(/class\s+Solution\s*\{[\s\S]*?\b\w+\s+\w+\s*\(([^)]*)\)/);
    if (match && match[1]) {
      const vars = match[1].split(',').map(param => {
        const parts = param.trim().replace(/[&*]/g, '').split(/\s+/);
        return parts[parts.length - 1];
      }).filter(Boolean);
      if (vars.length > 0) return vars;
    }
  }

  // 2. Fallback: Parse from HTML problem description
  const text = problem.content || problem.description || '';
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  const match = cleanText.match(/Input:\s*([^\n]+)/i);
  if (match) {
    const inputParts = [];
    let currentPart = '';
    let bracketDepth = 0;
    for (let i = 0; i < match[1].length; i++) {
      const char = match[1][i];
      if (char === '[' || char === '{') bracketDepth++;
      else if (char === ']' || char === '}') bracketDepth--;
      if (char === ',' && bracketDepth === 0) {
        inputParts.push(currentPart);
        currentPart = '';
      } else {
        currentPart += char;
      }
    }
    if (currentPart) inputParts.push(currentPart);

    const vars = [];
    inputParts.forEach(part => {
      const eqIdx = part.indexOf('=');
      if (eqIdx !== -1) {
        const varName = part.substring(0, eqIdx).trim();
        if (varName && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          vars.push(varName);
        }
      }
    });
    if (vars.length > 0) return vars;
  }

  return ['input'];
};

export const getInitialCases = (problem, vars = []) => {
  if (!problem) return [];

  let casesList = [];

  const numVars = Array.isArray(vars) && vars.length > 0 ? vars.length : 1;

  // Parse from problem.testCases array
  if (problem.testCases && problem.testCases.length > 0) {
    casesList = problem.testCases.map(tc => {
      const rawInput = (tc.input !== undefined && tc.input !== null) ? String(tc.input) : '';

      // If function only has 1 input parameter (e.g. isPalindrome(string s)), don't split by commas!
      if (numVars === 1) {
        return [rawInput];
      }

      if (rawInput.includes('\n')) {
        return rawInput.split('\n');
      } else if (rawInput.includes(',')) {
        const parts = [];
        let current = '';
        let bracketDepth = 0;
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < rawInput.length; i++) {
          const char = rawInput[i];
          if ((char === '"' || char === "'") && (i === 0 || rawInput[i - 1] !== '\\')) {
            if (!inString) {
              inString = true;
              stringChar = char;
            } else if (char === stringChar) {
              inString = false;
            }
          }
          if (!inString) {
            if (char === '[' || char === '{') bracketDepth++;
            else if (char === ']' || char === '}') bracketDepth--;
          }
          if (char === ',' && bracketDepth === 0 && !inString) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        if (current) parts.push(current.trim());
        return parts;
      } else {
        return [rawInput];
      }
    });
  }

  if (!casesList || casesList.length === 0) {
    return [['']];
  }

  // Deduplicate array cases
  const seen = new Set();
  const uniqueCases = [];
  for (const c of casesList) {
    const key = c.join('|||');
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCases.push(c);
    }
  }
  return uniqueCases.length > 0 ? uniqueCases : [['']];
};

export const useProblemFetch = (slug) => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variables, setVariables] = useState(['input']);
  const [initialTestcases, setInitialTestcases] = useState([]);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    
    const fetchProblem = async (retryCount = 0) => {
      try {
        const res = await api.get(`/api/problems/${slug}`);
        
        if (!isMounted) return;
        const prob = res.data;
        setProblem(prob);
        
        const vars = getVariableNames(prob);
        setVariables(vars);
        
        const initial = getInitialCases(prob, vars);
        setInitialTestcases(initial);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load problem details:', err);
        if (retryCount < 2) {
          setTimeout(() => fetchProblem(retryCount + 1), 1000);
        } else {
          if (isMounted) {
            setError(err);
            setLoading(false);
          }
        }
      }
    };

    fetchProblem();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return {
    problem,
    loading,
    error,
    variables,
    initialTestcases,
  };
};
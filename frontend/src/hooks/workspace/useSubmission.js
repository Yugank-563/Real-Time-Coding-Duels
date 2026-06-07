import { useState, useCallback, useRef } from 'react';
import { api } from '../../utils/index';
import { useToast } from '../ui/useToast';


// Shared helper to build a normalized result object from API response
const buildResultObj = (data) => ({
  state: data.verdict ? (data.verdict === 'AC' ? 'success' : 'error') : 'idle',
  verdict: data.verdict,
  executionTime: data.executionTime,
  memory: data.memory,
  errorMessage: data.errorMessage,
  testCasesPassed: data.testCasesPassed,
  totalTestCases: data.totalTestCases,
  results: data.results || [],
  runProgress: { done: data.testCasesPassed || 0, total: data.totalTestCases || 0 }
});

export const useSubmission = (initialOutput = null) => {
  const toast = useToast();
  const [localOutput, setLocalOutput] = useState({
    state: 'idle',
    results: [],
    errorMessage: '',
    verdict: null,
    executionTime: 0,
    memory: 0,
    testCasesPassed: 0,
    totalTestCases: 0,
    runProgress: { done: 0, total: 0 }
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const isExecutingRef = useRef(false);

  const output = initialOutput || localOutput;

  const setOutput = useCallback((val) => {
    if (initialOutput) {
      // If output is managed externally (e.g. Redux), let the parent call its state updater
      // But we still support updating the local state if needed.
    } else {
      setLocalOutput(val);
    }
  }, [initialOutput]);

  const runCode = useCallback(async (slug, code, language, cases) => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsExecuting(true);
    
    // Switch state to running
    if (!initialOutput) {
      setLocalOutput(prev => ({
        ...prev,
        state: 'running',
        runProgress: { done: 0, total: cases.length || 10 }
      }));
    }

    try {
      const customInputs = cases.map(c => Array.isArray(c) ? c.join('\n') : c);

      const res = await api.post(
        `/api/problems/${slug}/run`,
        { code, language, customInputs },
      );

      const data = res.data;
      const resultObj = buildResultObj(data);

      if (!initialOutput) {
        setLocalOutput(resultObj);
      }

      if (data.verdict === 'AC') {
        toast.success('Accepted ✓', 'Your custom case passed!');
      } else {
        toast.warning('Run Failed: ' + data.verdict);
      }
      return resultObj;
    } catch (err) {
      console.error('Run failed:', err);
      toast.error('Execution Failed', err.response?.data?.message || 'Compiler offline or sandbox timeout.');
      if (!initialOutput) {
        setLocalOutput(prev => ({ ...prev, state: 'idle' }));
      }
    } finally {
      isExecutingRef.current = false;
      setIsExecuting(false);
    }
  }, [isExecuting, initialOutput, toast]);

  const submitPractice = useCallback(async (slug, code, language) => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsExecuting(true);

    if (!initialOutput) {
      setLocalOutput(prev => ({
        ...prev,
        state: 'running',
        runProgress: { done: 0, total: 50 }
      }));
    }

    try {
      const res = await api.post(
        `/api/problems/${slug}/submit`,
        { code, language },
      );

      const data = res.data;
      const resultObj = buildResultObj(data);

      if (!initialOutput) {
        setLocalOutput(resultObj);
      }

      if (data.verdict === 'AC') {
        toast.success('ACCEPTED! 🎉', 'All constraints verified successfully.');
      } else {
        toast.warning('WRONG ANSWER ✗', `Passed: ${data.testCasesPassed} / ${data.totalTestCases}`);
      }
      return resultObj;
    } catch (err) {
      console.error('Submit failed:', err);
      toast.error('Submission Failed', err.response?.data?.message || 'Compiler offline or sandbox timeout.');
      if (!initialOutput) {
        setLocalOutput(prev => ({ ...prev, state: 'idle' }));
      }
    } finally {
      isExecutingRef.current = false;
      setIsExecuting(false);
    }
  }, [isExecuting, initialOutput, toast]);

  return {
    output,
    setOutput,
    isExecuting,
    setIsExecuting,
    runCode,
    submitPractice,
  };
};
export default useSubmission;

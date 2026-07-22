import { useState, useCallback, useRef } from 'react';
import { api } from '../../utils/index';
import { useToast } from '../useToast';


// Shared helper to build a normalized result object from API response
const buildResultObj = (data, isSubmitAction = false) => ({
  state: data.verdict ? (data.verdict === 'AC' ? 'success' : 'error') : 'idle',
  verdict: data.verdict,
  executionTime: data.executionTime,
  memory: data.memory,
  errorMessage: data.errorMessage,
  testCasesPassed: data.testCasesPassed,
  totalTestCases: data.totalTestCases,
  results: data.results || [],
  runProgress: { done: data.testCasesPassed || 0, total: data.totalTestCases || 0, isSubmit: isSubmitAction },
  originalCode: data.originalCode,
  submissionId: data.submissionId
});

export const useSubmission = (initialOutput = null, slug = '') => {
  const toast = useToast();
  
  const getInitialState = () => {
    if (slug) {
      const saved = localStorage.getItem(`coduelo_result_${slug}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse cached output');
        }
      }
    }
    return {
      state: 'idle',
      results: [],
      errorMessage: '',
      verdict: null,
      executionTime: 0,
      memory: 0,
      testCasesPassed: 0,
      totalTestCases: 0,
      runProgress: { done: 0, total: 0 }
    };
  };

  const [localOutput, setLocalOutput] = useState(getInitialState);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isExecutingRef = useRef(false);

  const output = initialOutput || localOutput;

  const setOutput = useCallback((val) => {
    if (initialOutput) {
      // If output is managed externally (e.g. Redux), let the parent call its state updater
      // But we still support updating the local state if needed.
    } else {
      setLocalOutput(prev => {
        const nextState = typeof val === 'function' ? val(prev) : val;
        if (slug) {
          localStorage.setItem(`coduelo_result_${slug}`, JSON.stringify(nextState));
        }
        return nextState;
      });
    }
  }, [initialOutput, slug]);

  const runCode = useCallback(async (slug, code, language, cases) => {
    if (isExecutingRef.current) return;
    if (!slug) { toast.error('Cannot run code without a valid problem.'); return; }

    isExecutingRef.current = true;
    setIsRunning(true);
    
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

      const { submissionId } = res.data;
      
      let data = { verdict: 'pending' };
      let attempts = 0;
      while (data.verdict === 'pending' && attempts < 30) {
        await new Promise(r => setTimeout(r, 500));
        const statusRes = await api.get(`/api/submissions/${submissionId}/status`);
        data = statusRes.data;
        attempts++;
      }

      if (data.verdict === 'pending') {
        throw new Error('Execution timed out — please try again.');
      }

      const resultObj = buildResultObj(data);

      setOutput(resultObj);

      return resultObj;
      
    } catch (err) {
      console.error('Run failed:', err);
      toast.error(err.message || err.response?.data?.message || 'Sandbox timeout or internal error.');
      if (!initialOutput) {
        setLocalOutput(prev => ({ ...prev, state: 'idle' }));
      }
    } finally {
      isExecutingRef.current = false;
      setIsRunning(false);
    }
  }, [isRunning, isSubmitting, initialOutput, toast]);

  const submitPractice = useCallback(async (slug, code, language, totalCases = 50) => {
    if (isExecutingRef.current) return;
    if (!slug) { toast.error('Cannot submit without a valid problem.'); return; }

    isExecutingRef.current = true;
    setIsSubmitting(true);

    if (!initialOutput) {
      setLocalOutput(prev => ({
        ...prev,
        state: 'running',
        runProgress: { done: 0, total: totalCases, isSubmit: true }
      }));
    }

    try {
      const res = await api.post(
        `/api/problems/${slug}/submit`,
        { code, language },
      );

      const { submissionId } = res.data;
      
      let data = { verdict: 'pending' };
      let attempts = 0;
      while (data.verdict === 'pending' && attempts < 40) {
        await new Promise(r => setTimeout(r, 500));
        const statusRes = await api.get(`/api/submissions/${submissionId}/status`);
        data = statusRes.data;
        attempts++;
      }

      if (data.verdict === 'pending') {
        throw new Error('Execution timed out — please try again.');
      }

      const resultObj = buildResultObj(data, true);

      setOutput(resultObj);


      return resultObj;
    } catch (err) {
      console.error('Submit failed:', err);
      toast.error(err.message || err.response?.data?.message || 'Compiler offline or sandbox timeout.');
      if (!initialOutput) {
        setLocalOutput(prev => ({ ...prev, state: 'idle' }));
      }
    } finally {
      isExecutingRef.current = false;
      setIsSubmitting(false);
    }
  }, [isRunning, isSubmitting, initialOutput, toast]);

  return {
    output,
    setOutput,
    isRunning,
    isSubmitting,
    runCode,
    submitPractice,
  };
};
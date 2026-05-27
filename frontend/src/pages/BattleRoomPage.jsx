import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { CustomDropdown } from '../components/ui';


const BattleRoomPage = () => {
  const toast = useToast();
  const [lang, setLang] = useState('cpp');
  const [timeLeft, setTimeLeft] = useState(1185); // 19m 45s
  const [myProgress, setMyProgress] = useState(3);
  const [oppProgress, setOppProgress] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const langOptions = [
    { value: 'cpp', label: 'C++ (GCC 17)' },
    { value: 'py', label: 'Python (3.9)' },
    { value: 'js', label: 'JavaScript (ES6)' }
  ];

  // Simple countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      toast.success('Compilation successful!', 'All pre-compiled example test cases passed.');
      setMyProgress(4);
    }, 1200);
  };

  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('ACCEPTED! 🎉', 'You successfully solved the challenge first!');
      setMyProgress(5);
    }, 2000);
  };

  const cppCode = `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (mp.count(complement)) {
                return {mp[complement], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`;

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden font-mono pb-4">
      
      {/* ── Top Matchup & Timer Bar ── */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm font-bold">
            ⚔️
          </span>
          <div>
            <h2 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest leading-none">RANKED MATCH</h2>
            <p className="text-sm font-bold text-text-primary mt-1">@yugank (1247) vs @rahul_dev (1198)</p>
          </div>
        </div>

        {/* Timer ticking down with glow */}
        <div className="flex items-center gap-2 bg-overlay border border-border px-4 py-2 rounded-2xl shrink-0 self-center">
          <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
          <span className="text-lg font-black text-text-primary tracking-tight">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Live duel matchup state progression */}
        <div className="flex items-center gap-6 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[10px] text-text-secondary">
              <span>Your Testcases</span>
              <span className="text-emerald">{myProgress}/5</span>
            </div>
            <div className="w-28 h-1.5 bg-overlay rounded-full overflow-hidden border border-border/50">
              <div className="h-full bg-emerald rounded-full transition-all duration-300" style={{ width: `${(myProgress / 5) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[10px] text-text-secondary">
              <span>Opponent</span>
              <span className="text-warning">{oppProgress}/5</span>
            </div>
            <div className="w-28 h-1.5 bg-overlay rounded-full overflow-hidden border border-border/50">
              <div className="h-full bg-warning rounded-full transition-all duration-300" style={{ width: `${(oppProgress / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Code Split Layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* LEFT PANEL — Problem Details (5 Cols) */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 overflow-y-auto flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-warning/10 border border-warning/20 text-warning">
                MEDIUM
              </span>
              <span className="text-[10px] font-bold text-text-muted">Time Limit: 2.0s · Memory Limit: 256MB</span>
            </div>

            <h3 className="text-lg font-extrabold text-text-primary tracking-tight font-sans">
              1. Two Sum Challenge
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-text-secondary font-sans">
              <p>
                Given an array of integers <code className="bg-overlay border border-border px-1.5 py-0.5 rounded text-primary">nums</code> and an integer <code className="bg-overlay border border-border px-1.5 py-0.5 rounded text-primary">target</code>, return <em>indices of the two numbers such that they add up to target</em>.
              </p>
              <p>
                You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.
              </p>
              <p>You can return the answer in any order.</p>
            </div>

            {/* Test Case Inputs & Outputs mockup */}
            <div className="space-y-3 pt-3">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Example Test Case:</h4>
              <div className="bg-overlay border border-border rounded-xl p-3 space-y-2 text-[11px]">
                <div>
                  <span className="text-text-muted">Input: </span>
                  <span className="text-text-primary">nums = [2, 7, 11, 15], target = 9</span>
                </div>
                <div>
                  <span className="text-text-muted">Output: </span>
                  <span className="text-text-primary">[0, 1]</span>
                </div>
                <div>
                  <span className="text-text-muted">Explanation: </span>
                  <span className="text-text-secondary">Because nums[0] + nums[1] == 9, we return [0, 1].</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-text-muted border-t border-border/50 pt-3 font-sans">
            🤝 Pro tip: Check edge cases like negative integers and duplicate target elements.
          </div>
        </div>

        {/* RIGHT PANEL — Monaco Editor mockup (7 Cols) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg">
          {/* Editor Header controls */}
          <div className="bg-overlay/60 px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CustomDropdown
                value={lang}
                onChange={(val) => setLang(val)}
                options={langOptions}
                placeholder="Select Language"
                buttonClassName="bg-surface border border-border text-text-primary text-[11px] font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer flex items-center justify-between gap-1.5"
                menuClassName="bg-surface border-border backdrop-blur-md min-w-[120px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="text-[10px] font-bold text-text-muted hover:text-text-primary px-2.5 py-1 transition-colors">
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Code Text Area Container Mockup */}
          <div className="flex-1 overflow-auto bg-overlay/30 p-4 text-[11px] flex gap-3 leading-relaxed relative min-h-0 select-text">
            {/* Simulated Line numbers */}
            <div className="text-text-muted select-none text-right w-6 space-y-0.5">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Highlight representation */}
            <div className="flex-1 whitespace-pre overflow-x-auto text-text-primary">
              {cppCode}
            </div>
          </div>

          {/* Output / Console split tray */}
          <div className="bg-overlay border-t border-border shrink-0">
            <div className="px-4 py-1.5 bg-overlay/80 border-b border-border text-[9px] font-bold text-text-secondary uppercase tracking-widest flex items-center justify-between">
              <span>CONSOLE OUTPUT</span>
              <span className="text-emerald">Ready to verify</span>
            </div>
            
            <div className="p-3 text-[10px] text-text-muted min-h-[60px]">
              &gt; Compile, run, and examine standard console output here.
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="bg-overlay/60 border-t border-border px-4 py-3 flex items-center justify-end gap-2.5 shrink-0">
            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs font-bold hover:bg-elevated transition-colors disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            
            <button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-blue text-white text-xs font-bold hover:opacity-90 shadow-glow-primary transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Challenge 🚀'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BattleRoomPage;

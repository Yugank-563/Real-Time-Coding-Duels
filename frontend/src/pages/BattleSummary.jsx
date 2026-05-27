import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Trophy, ShieldAlert, Award, Star, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Link2, Layout, BookOpen, RotateCcw } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5000/api';

const BattleSummary = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // States
  const [loading, setLoading] = useState(true);
  const [battle, setBattle] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeCodeTab, setActiveCodeTab] = useState('me'); // 'me' | 'opponent'

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('bc-token');
        const res = await axios.get(`${API_BASE}/battles/${battleId}/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBattle(res.data.battle);
        setSubmissions(res.data.submissions);
      } catch (err) {
        console.error('Failed to load battle summary analytics:', err.message);
        toast.error('Summary Unavailable', 'Unable to retrieve duel outcomes.');
        navigate('/battle/lobby');
      } finally {
        setLoading(false);
      }
    };

    if (battleId) {
      fetchSummary();
    }
  }, [battleId, navigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-sans">
        <p className="text-sm text-[#7A9AB8] italic animate-pulse">Retrieving duel matrices and compiling codes...</p>
      </div>
    );
  }

  if (!battle) return null;

  // Extract participants
  const playerA = battle.players[0];
  const playerB = battle.players[1];
  const winnerId = battle.winner;

  // Extract player submissions
  const mySubmissions = submissions.filter(s => s.userId === playerA.user._id) || [];
  const oppSubmissions = submissions.filter(s => s.userId === playerB.user._id) || [];

  const myFinalSub = mySubmissions[0]; // sorted by newest
  const oppFinalSub = oppSubmissions[0];

  const getVerdictBadge = (verd) => {
    if (verd === 'AC') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (verd === 'WA') return 'text-red-400 border-red-500/20 bg-red-500/10';
    return 'text-[#7A9AB8] border-[#1E2D40] bg-[#0D1520]';
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link Copied! 📋', 'Battle summary URL successfully added to clipboard.');
  };

  return (
    <div className="w-full bg-base text-text-primary p-6 relative overflow-hidden font-sans select-none pb-4 pt-2 transition-colors duration-300 animate-[fadeIn_0.4s_ease-out]">

      {/* ──── DOT GRID BACKGROUND ──── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-accent-primary/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">

        {/* Header Hero banner */}
        <div className="text-center space-y-2 border-b border-border/40 pb-6">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full border border-accent-primary/20">
            📊 Post-Battle Summary
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Duel Clashes Analytics
          </h1>
          <p className="text-text-secondary text-xs">
            Review detailed metrics, execution comparisons, and refactor algorithmic methodologies.
          </p>
        </div>

        {/* ── PLAYER OUTCOME SUMMARY CARD ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Player A Card */}
          <div className={`bg-surface border rounded-2xl p-6 flex flex-col items-center text-center justify-between min-h-[190px] relative overflow-hidden ${winnerId === playerA.user._id
              ? 'border-emerald-500/30 shadow-[0_0_24px_rgba(34,197,94,0.06)]'
              : 'border-border'
            }`}>
            {winnerId === playerA.user._id && (
              <div className="absolute top-3 right-3 text-[10px] uppercase font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Winner
              </div>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-primary to-accent-blue mx-auto flex items-center justify-center text-sm font-bold text-white shadow-md">
                {playerA.user.name?.slice(0, 2).toUpperCase() || 'P1'}
              </div>
              <div>
                <h3 className="font-extrabold text-text-primary text-base">@{playerA.user.name || playerA.user.email.split('@')[0]}</h3>
                <span className="text-[10px] text-text-secondary block mt-0.5">Rating Elo: {playerA.user.rank}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-[10px] font-mono">
              <span className={`px-2 py-0.5 border rounded uppercase tracking-wider ${getVerdictBadge(myFinalSub?.verdict)}`}>
                Verdict: {myFinalSub?.verdict || 'WA'}
              </span>
              <span className="text-text-secondary">Solve: {myFinalSub?.executionTime || 45}ms</span>
            </div>
          </div>

          {/* Player B Card */}
          <div className={`bg-surface border rounded-2xl p-6 flex flex-col items-center text-center justify-between min-h-[190px] relative overflow-hidden ${winnerId === playerB.user._id
              ? 'border-accent-primary/30 shadow-[0_0_24px_rgba(108,99,255,0.06)]'
              : 'border-border'
            }`}>
            {winnerId === playerB.user._id && (
              <div className="absolute top-3 right-3 text-[10px] uppercase font-black text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Winner
              </div>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-red to-accent-primary mx-auto flex items-center justify-center text-sm font-bold text-white shadow-md">
                {playerB.user.name?.slice(0, 2).toUpperCase() || 'P2'}
              </div>
              <div>
                <h3 className="font-extrabold text-text-primary text-base">@{playerB.user.name || playerB.user.email.split('@')[0]}</h3>
                <span className="text-[10px] text-text-secondary block mt-0.5">Rating Elo: {playerB.user.rank}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-[10px] font-mono">
              <span className={`px-2 py-0.5 border rounded uppercase tracking-wider ${getVerdictBadge(oppFinalSub?.verdict)}`}>
                Verdict: {oppFinalSub?.verdict || 'WA'}
              </span>
              <span className="text-text-secondary">Solve: {oppFinalSub?.executionTime || 62}ms</span>
            </div>
          </div>

        </div>

        {/* ── CODE DUAL COMPARISON TAB PANELS ── */}
        <div className="bg-surface border border-border rounded-2xl flex flex-col overflow-hidden h-[360px] shadow-lg">

          <div className="bg-elevated px-4 py-2 border-b border-border flex items-center justify-between shrink-0 font-mono text-[11px]">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-primary" /> Submissions Code Comparisons
            </span>

            {/* Selector tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCodeTab('me')}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all duration-200 active:scale-[0.98] ${activeCodeTab === 'me'
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-border bg-surface text-text-secondary hover:text-text-primary'
                  }`}
              >
                Your Submission
              </button>
              <button
                onClick={() => setActiveCodeTab('opponent')}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all duration-200 active:scale-[0.98] ${activeCodeTab === 'opponent'
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-border bg-surface text-text-secondary hover:text-text-primary'
                  }`}
              >
                Opponent Code
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              language={activeCodeTab === 'me' ? (myFinalSub?.language === 'py' ? 'python' : myFinalSub?.language === 'js' ? 'javascript' : 'cpp') : (oppFinalSub?.language === 'py' ? 'python' : oppFinalSub?.language === 'js' ? 'javascript' : 'cpp')}
              value={activeCodeTab === 'me' ? (myFinalSub?.code || '// No code submitted.') : (oppFinalSub?.code || '// Opponent did not submit code.')}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollbar: {
                  vertical: 'visible',
                  useShadows: false,
                  verticalScrollbarSize: 6,
                },
                lineNumbers: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>

        {/* ── WHAT TO IMPROVE ADVICES ── */}
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-3 shadow-sm">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-text-primary flex items-center gap-1.5">
            🧠 Arena Tactical Advice
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {myFinalSub?.verdict === 'AC'
              ? 'Excellent modular construction. Code compiled in sub-100ms. Optimization metrics indicate O(N) linear time hash processing, matching optimal constraints perfectly.'
              : 'Review standard syntax edge-cases. Ensure duplicate complements are evaluated correctly without nesting arrays. Try optimizing solution loops to avoid time threshold locks.'}
          </p>
        </div>

        {/* ── BOTTOM ACTIONS ── */}
        <div className="flex flex-col sm:flex-row gap-4 font-mono select-none">
          <button
            onClick={() => navigate('/battle/lobby')}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase transition-all duration-200 active:scale-[0.98] tracking-wider shadow-md flex items-center justify-center gap-1.5 ${isDark
                ? 'bg-[#00F5C4] text-[#0D0F14] hover:brightness-105 shadow-[#00F5C4]/15'
                : 'bg-[#4F6EF7] text-white hover:brightness-105 shadow-[#4F6EF7]/15'
              }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Back to Lobby
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-3.5 rounded-xl bg-elevated border border-border hover:border-accent-primary text-text-secondary hover:text-text-primary text-xs font-black uppercase transition-all duration-200 active:scale-[0.98] tracking-wider flex items-center justify-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" /> Share Duel Results
          </button>
        </div>

      </div>
    </div>
  );
};

export default BattleSummary;

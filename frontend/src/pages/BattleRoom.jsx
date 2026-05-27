import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useToast } from '../hooks/useToast';
import { useBattleSocket } from '../sockets/useBattleSocket';
import { selectUser } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import {
  initBattle,
  tickTimer,
  setOutputState,
  setOutputResults,
  updateMyCode,
  cycleBattleLanguage,
  toggleChat,
  resetBattleState,
  selectBattle,
} from '../features/battle/battleSlice';

// Sub-components imports
import BattleCountdown from '../components/battle/BattleCountdown';
import BattleTopBar from '../components/battle/BattleTopBar';
import ProblemPanel from '../components/battle/ProblemPanel';
import CodeEditor from '../components/battle/CodeEditor';
import OutputPanel from '../components/battle/OutputPanel';
import BattleChat from '../components/battle/BattleChat';
import VerdictDisplay from '../components/battle/VerdictDisplay';

const API_BASE = 'http://localhost:5000/api';

const BattleRoom = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const myUser = useSelector(selectUser);
  const battleState = useSelector(selectBattle);
  const { problem, players, opponent, myCode, selectedLanguage, timer, output, chat, status, eloDetails, topic } = battleState;

  // States
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownFinished, setCountdownFinished] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Hook into active WebSockets gateway connection
  const socketHelpers = useBattleSocket(battleId);
  const { sendCodeChange, surrenderBattle, sendChatMessage, sendTimeout } = socketHelpers;

  // 1. Fetch Battle details on startup
  useEffect(() => {
    const fetchBattleDetails = async () => {
      try {
        const token = localStorage.getItem('bc-token');
        const res = await axios.get(`${API_BASE}/battles/${battleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const battleData = res.data;
        dispatch(
          initBattle({
            battleId: battleData._id,
            battleType: battleData.battleType,
            problem: battleData.problem,
            players: battleData.players,
            myUserId: myUser?._id || myUser?.id,
            teammate: battleData.teammate,
            opponents: battleData.opponents,
            topic: battleData.topic,
            timeLimit: battleData.timeLimit,
            teamId: battleData.teamId,
          })
        );
      } catch (err) {
        console.error('Failed to load battle coordinates:', err.message);
        toast.error('Access Denied', 'Unable to retrieve battle room configuration.');
        navigate('/battle/lobby');
      }
    };

    const myUserId = myUser?._id || myUser?.id;
    if (battleId && myUserId) {
      fetchBattleDetails();
    }

    return () => {
      // Clear battle state on unmount
      dispatch(resetBattleState());
    };
  }, [battleId, myUser?._id, myUser?.id, dispatch, navigate]);

  // 2. Countdown countdown timer ticking
  useEffect(() => {
    if (status !== 'active' || showCountdown) return;

    const timerInterval = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [status, showCountdown, dispatch]);

  // ── CODE MODIFICATION HANDLERS ──
  const handleCodeChange = (newCode) => {
    dispatch(updateMyCode(newCode));
    // Send debounced/throttled "Typing..." notifications to opponent
    sendCodeChange(selectedLanguage);
  };

  const handleLanguageChange = (newLang) => {
    dispatch(cycleBattleLanguage(newLang));
    sendCodeChange(newLang);
  };

  // ── RUN CODE (SAMPLE CASE ONLY) ──
  const handleRun = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    dispatch(setOutputState('running'));

    try {
      const token = localStorage.getItem('bc-token');
      
      // Submit code execution job without battleId to run against sample testcases only
      const res = await axios.post(
        `${API_BASE}/submissions/battle`,
        {
          code: myCode,
          language: selectedLanguage,
          problemId: problem._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { submissionId } = res.data;
      
      // Poll execution status
      let verdict = 'pending';
      let pollAttempts = 0;
      let statusDetails = null;

      while (verdict === 'pending' && pollAttempts < 30) {
        await new Promise((r) => setTimeout(r, 600));
        const statusRes = await axios.get(`${API_BASE}/submissions/${submissionId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        statusDetails = statusRes.data;
        verdict = statusDetails.verdict;
        pollAttempts++;
      }

      dispatch(
        setOutputResults({
          verdict: statusDetails.verdict,
          errorMessage: statusDetails.errorMessage,
          executionTime: statusDetails.executionTime,
          memory: statusDetails.memory,
          results: Array.from({ length: statusDetails.testCasesPassed }).map(() => ({ passed: true })),
        })
      );

      if (statusDetails.verdict === 'AC') {
        toast.success('Run successful!', 'All pre-compiled example cases passed.');
      } else {
        toast.warning('Run Failed: ' + statusDetails.verdict);
      }

    } catch (err) {
      console.error('Run failed:', err.message);
      toast.error('Execution Failed', err.response?.data?.message || 'Internal sandbox compiler error.');
      dispatch(setOutputState('idle'));
    } finally {
      setIsExecuting(false);
    }
  };

  // ── SUBMIT CODE (HIDDEN CASES AND ELO QUEUE) ──
  const handleSubmit = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    dispatch(setOutputState('running'));

    try {
      const token = localStorage.getItem('bc-token');
      
      // Submit code execution job with battleId to trigger progress/win evaluations
      await axios.post(
        `${API_BASE}/submissions/battle`,
        {
          battleId,
          code: myCode,
          language: selectedLanguage,
          problemId: problem._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.info('Submitted 🚀', 'Evaluating code against hidden test cases inside secure Docker sandbox...');
      
      // Note: We don't poll here, as compiler publishes results to Redis, 
      // which the WebSocket listener picks up and dispatches via 'submission:result' to Redux!
      
    } catch (err) {
      console.error('Submission failed:', err.message);
      toast.error('Submission Failed', err.response?.data?.message || 'Internal sandbox compiler error.');
      dispatch(setOutputState('idle'));
    } finally {
      // The socket listener handles turning off loading state upon receiving verdicts
      setIsExecuting(false);
    }
  };
 
  // Auto-submit and notify server when client countdown reaches 0
  useEffect(() => {
    if (status === 'active' && timer.remaining === 0 && !showCountdown) {
      toast.warning('Time limit exceeded!', 'Auto-submitting your current progress...');
      handleSubmit();
      if (sendTimeout) {
        sendTimeout();
      }
    }
  }, [timer.remaining, status, showCountdown]);

  const handleSurrender = () => {
    const confirm = window.confirm('Are you sure you want to surrender this battle? This will deduct ELO rating points.');
    if (confirm) {
      surrenderBattle();
    }
  };

  const countdownData = {
    username: myUser?.username,
    elo: myUser?.rank || 1200,
    level: myUser?.level || 1,
  };

  return (
    <div className="w-full bg-base text-text-primary flex flex-col h-[calc(100vh-80px)] overflow-hidden pb-4 pt-2 transition-colors duration-300 animate-[fadeIn_0.4s_ease-out] select-none">
      
      {/* ──── DOT GRID BACKGROUND ──── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── COUNTDOWN MATCHUP SCREEN ── */}
      {showCountdown && problem && (
        <BattleCountdown
          myUser={countdownData}
          opponent={opponent}
          problemTitle={problem.title}
          onComplete={() => setShowCountdown(false)}
        />
      )}

      {/* ── BATTLE OUTCOMES VERDICT SCREEN ── */}
      {status === 'ended' && eloDetails && (
        <VerdictDisplay
          battleId={battleId}
          myUserId={myUser?._id || myUser?.id}
          eloDetails={eloDetails}
        />
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 flex flex-col gap-4 min-h-0 relative z-10">
        
        {/* Top Header Match Bar */}
        <BattleTopBar
          battleType={battleState.battleType}
          problemDifficulty={problem?.difficulty}
          timer={timer}
          opponent={opponent}
          topic={topic}
        />

        {/* ── Main Workspace Panels ── */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left panel: problem workspace */}
          <div className="flex-1 lg:flex-[5] min-h-[300px] lg:min-h-0">
            <ProblemPanel
              problem={problem}
              hasSubmitted={output.verdict !== null}
            />
          </div>

          {/* Right panel: Monaco code editor */}
          <div className="flex-1 lg:flex-[7] flex flex-col gap-4 min-h-[400px] lg:min-h-0">
            <div className="flex-1 min-h-0">
              <CodeEditor
                code={myCode}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                onCodeChange={handleCodeChange}
                onRun={handleRun}
                onSubmit={handleSubmit}
                isExecuting={isExecuting}
                problem={problem}
              />
            </div>
            
            <div className="shrink-0">
              <OutputPanel output={output} />
            </div>
          </div>

          {/* Sliding Chat Panel */}
          <BattleChat
            messages={chat.messages}
            isOpen={chat.isOpen}
            onClose={() => dispatch(toggleChat())}
            onSendMessage={sendChatMessage}
            myUserId={myUser?._id || myUser?.id}
            battleType={battleState.battleType}
            teamId={battleState.teamId}
          />
        </div>

        {/* ── BOTTOM CONTROL TOGGLES ── */}
        <div className="bg-surface border border-border shadow-md px-4 py-3 rounded-2xl flex items-center justify-between shrink-0 font-mono text-[11px] transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleChat())}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 active:scale-[0.98] font-extrabold ${
                chat.isOpen
                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                  : 'border-border bg-elevated text-text-secondary hover:text-text-primary hover:border-accent-primary/40'
              }`}
            >
              💬 Chat Room {chat.messages.length > 0 && `(${chat.messages.length})`}
            </button>
          </div>

          <button
            onClick={handleSurrender}
            className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-[0.98] font-extrabold"
          >
            🏳️ Surrender Battle
          </button>
        </div>

      </div>


    </div>
  );
};

export default BattleRoom;

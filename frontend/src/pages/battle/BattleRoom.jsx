import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../utils/index';
import { useToast } from '../../hooks/useToast';
import { useBattleSocket, useEditorState, useTestcaseManager, getVariableNames, getInitialCases, useBattleTimer, useDocumentTitle } from '../../hooks/index';
import { selectUser } from '../../features/index';
import {
  initBattle,
  resumeBattle,
  setOutputState,
  setOutputResults,
  resetBattleState,
  selectBattle,
} from '../../features/index';

// Sub-overlays
import { BattleCountdown, VerdictDisplay, BattleHeader, ExitBattleModal } from '../../components/index';
import { CodingWorkspace } from '../../workspace/index';

export const BattleRoom = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const myUser = useSelector(selectUser);
  const battleState = useSelector(selectBattle);
  const { problem, opponent, timer, output, status, eloDetails, topic } = battleState;
  
  useDocumentTitle(problem ? `Battle: ${problem.title}` : 'Battle Room');

  // Overlays — starts as null so we don't flash countdown before knowing battle state
  const [showCountdown, setShowCountdown] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const isExecutingRef = useRef(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Sockets gateway connection
  const socketHelpers = useBattleSocket(battleId);
  const { sendCodeChange, surrenderBattle, sendTimeout } = socketHelpers;

  // Initialize and fetch battle details
  useEffect(() => {
    const fetchBattleDetails = async () => {
      try {
        const res = await api.get(`/api/battles/${battleId}`);
        const battleData = res.data;
        
        // Critical validation: do not allow re-entry to finished battles
        if (battleData.status === 'ended') {
          toast.info('Battle Finished', 'This battle has already concluded.');
          navigate(`/battle/${battleId}/summary`, { replace: true });
          return;
        }

        const myUserId = myUser?._id || myUser?.id;

        // Determine if this is a mid-battle page refresh or a first entry.
        // The battle is always created with status='active' and startTime set,
        // so we use elapsed time as the discriminator.
        // Countdown total duration ≈ 9.5s — use 15s as a safe threshold.
        const COUNTDOWN_WINDOW_MS = 15000;
        const elapsedMs = battleData.startTime
          ? Date.now() - new Date(battleData.startTime).getTime()
          : 0;
        const isRefresh = elapsedMs >= COUNTDOWN_WINDOW_MS;

        if (isRefresh) {
          // PAGE REFRESH: battle already underway, skip countdown, restore real timer
          dispatch(resumeBattle({
            battleId: battleData._id,
            battleType: battleData.battleType,
            problem: battleData.problem,
            players: battleData.players,
            myUserId,
            startTime: battleData.startTime,
            timeLimit: battleData.timeLimit,
            teammate: battleData.teammate,
            opponents: battleData.opponents,
            topic: battleData.topic,
            teamId: battleData.teamId,
          }));
          setShowCountdown(false);
        } else {
          // FIRST ENTRY: show full matchup → problem reveal → 3,2,1 → GO! countdown
          dispatch(initBattle({
            battleId: battleData._id,
            battleType: battleData.battleType,
            problem: battleData.problem,
            players: battleData.players,
            myUserId,
            startTime: battleData.startTime,
            teammate: battleData.teammate,
            opponents: battleData.opponents,
            topic: battleData.topic,
            timeLimit: battleData.timeLimit,
            teamId: battleData.teamId,
          }));
          setShowCountdown(true);
        }
      } catch (err) {
        console.error('Failed to load battle coordinates:', err.message);
        toast.error('Access Denied', 'Unable to retrieve battle room configuration.');
        navigate('/battle/lobby', { replace: true });
      }
    };

    const myUserId = myUser?._id || myUser?.id;
    if (battleId && myUserId) {
      fetchBattleDetails();
    }

    return () => {
      dispatch(resetBattleState());
    };
  }, [battleId, myUser?._id, myUser?.id, dispatch, navigate]);

  // Derived variables & initial cases
  const vars = problem ? getVariableNames(problem) : ['input'];
  const initialCases = problem ? getInitialCases(problem, vars) : [['']];

  // Editor and testcase state hooks
  const editor = useEditorState(problem);
  const testcase = useTestcaseManager(vars, initialCases);

  // Server-authoritative timer — both users compute from the same startTime
  useBattleTimer(status, showCountdown, timer.startTime, timer.timeLimit);

  // Sync editor buffer updates over WebSockets
  const handleCodeChange = (newCode) => {
    editor.setCode(newCode);
    sendCodeChange(editor.selectedLanguage);
  };

  // Run user code (REST run endpoint)
  const handleRun = async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsExecuting(true);
    dispatch(setOutputState('running'));

    try {
      const customInputs = testcase.cases.map(c => c.join('\n'));
      
      const res = await api.post(
        `/api/problems/${problem.titleSlug || 'two-sum'}/run`,
        {
          code: editor.code,
          language: editor.selectedLanguage,
          customInputs,
        }
      );

      const { submissionId } = res.data;
      
      let runResult = { verdict: 'pending' };
      let attempts = 0;
      while (runResult.verdict === 'pending' && attempts < 30) {
        await new Promise(r => setTimeout(r, 500));
        const statusRes = await api.get(`/api/submissions/${submissionId}/status`);
        runResult = statusRes.data;
        attempts++;
      }

      if (runResult.verdict === 'pending') {
        throw new Error('Execution timed out — please try again.');
      }

      // Map output state from API format to Battle output format
      const mappedResult = {
        state: runResult.verdict === 'AC' ? 'success' : 'error',
        verdict: runResult.verdict,
        executionTime: runResult.executionTime,
        memory: runResult.memory,
        errorMessage: runResult.errorMessage,
        testCasesPassed: runResult.testCasesPassed,
        totalTestCases: runResult.totalTestCases,
        results: runResult.results || [],
        runProgress: { done: runResult.testCasesPassed || 0, total: runResult.totalTestCases || 0 }
      };

      dispatch(setOutputResults(mappedResult));

      if (runResult.verdict === 'AC') {
        toast.success('Accepted ✓', 'Your custom case passed!');
      } else {
        toast.warning('Run Failed: ' + runResult.verdict);
      }
    } catch (err) {
      console.error('Run failed:', err.message);
      toast.error('Execution Failed', err.message || err.response?.data?.message || 'Internal sandbox compiler error.');
      dispatch(setOutputState('idle'));
    } finally {
      isExecutingRef.current = false;
      setIsExecuting(false);
    }
  };

  // Submit code (REST submit endpoint triggers worker queue + Socket feedback)
  const handleSubmit = async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsExecuting(true);
    dispatch(setOutputState('running'));

    try {
      await api.post(
        `/api/submissions/battle`,
        {
          battleId,
          code: editor.code,
          language: editor.selectedLanguage,
          problemId: problem._id,
        }
      );

      toast.info('Submitted 🚀', 'Evaluating code against hidden test cases inside secure Docker sandbox...');
    } catch (err) {
      console.error('Submission failed:', err.message);
      toast.error('Submission Failed', err.response?.data?.message || 'Internal sandbox compiler error.');
      dispatch(setOutputState('idle'));
    } finally {
      isExecutingRef.current = false;
      setIsExecuting(false);
    }
  };

  // Time-out auto submit
  useEffect(() => {
    if (status === 'active' && timer.remaining === 0 && showCountdown === false) {
      toast.warning('Time limit exceeded!', 'Auto-submitting your current progress...');
      handleSubmit();
      if (sendTimeout) {
        sendTimeout();
      }
    }
  }, [timer.remaining, status, showCountdown]);

  const handleSurrender = () => {
    setShowExitConfirm(true);
  };

  const countdownData = {
    username: myUser?.username,
    elo: myUser?.rank || 1200,
  };

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-base text-text-primary relative select-none">

      {/* ── LOADING GUARD: hide everything until server state is fetched ── */}
      {showCountdown === null && (
        <div className="fixed inset-0 z-50 bg-[#0B0F1A] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF]/30 border-t-[#00E5FF] animate-spin" />
            <p className="text-[#7A9AB8] text-sm font-mono tracking-widest">Restoring battle...</p>
          </div>
        </div>
      )}

      {/* ── COUNTDOWN MATCHUP SCREEN (only shown on first entry, never on refresh) ── */}
      {showCountdown === true && problem && (
        <BattleCountdown
          myUser={countdownData}
          opponent={opponent}
          problemTitle={problem.title}
          onComplete={handleCountdownComplete}
        />
      )}

      {/* ── BATTLE OUTCOMES VERDICT SCREEN ── */}
      {status === 'ended' && (
        <VerdictDisplay
          battleId={battleId}
          myUserId={myUser?._id || myUser?.id}
          winnerId={battleState.winnerId}
          eloDetails={eloDetails}
        />
      )}

      {/* ── Master CodingWorkspace ── */}
      <CodingWorkspace
        headerComponent={
          <BattleHeader
            battleType={battleState.battleType}
            problemDifficulty={problem?.difficulty}
            timer={timer}
            opponent={opponent}
            topic={topic}
            onExitBattle={handleSurrender}
          />
        }
        mode="battle"
        problem={problem}
        code={editor.code}
        onCodeChange={handleCodeChange}
        language={editor.selectedLanguage}
        onRun={handleRun}
        onSubmit={handleSubmit}
        isRunning={isExecuting}
        isSubmitting={isExecuting}
        cases={testcase.cases}
        vars={testcase.vars}
        activeCase={testcase.activeCase}
        setActiveCase={testcase.setActiveCase}
        onCaseInputChange={testcase.handleCaseInputChange}
        onAddCase={testcase.handleAddCase}
        onDeleteCase={testcase.handleDeleteCase}
        output={{ ...output, aiAnalysis: battleState.aiAnalysis }}
        showRunButton={true}
        showSubmitButton={true}
      />

      {/* ── BATTLE EXIT CONFIRMATION MODAL ── */}
      <ExitBattleModal
        show={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false);
          surrenderBattle();
        }}
      />
    </div>
  );
};

export default BattleRoom;

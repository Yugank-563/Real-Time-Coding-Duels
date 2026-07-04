import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../useToast';
import { getSocket } from '../../utils/index';
import {
  updateOpponentStatus,
  endBattle,
  setLobbyStatus,
  setSuggestedTopic,
  setOutputResults,
  setOutputProgress,
  setAiAnalysis,
  selectUser
} from '../../features/index';



export const useBattleSocket = (battleId = null, queueType = null) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector(selectUser);
  const socketRef = useRef(null);

  const teammate = useSelector(state => state.battle.teammate);
  const teammateRef = useRef(teammate);
  useEffect(() => {
    teammateRef.current = teammate;
  }, [teammate]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('bc-token');
    if (!token || token === 'undefined' || token === 'null') {
      console.warn('Socket connection deferred: No valid JWT token found in localStorage.');
      return;
    }

    // Establish WebSocket gateway connection via singleton
    const socket = getSocket();
    socketRef.current = socket;

    // We shouldn't rely on the 'connect' event here if the socket is already connected.
    // Instead, we immediately execute join logic if connected, OR wait for connect if it's not.
    const handleJoin = () => {
      if (battleId) {
        socket.emit('battle:join', { battleId });
      }
      if (queueType) {
        console.log('Auto-joining matchmaking queue for format:', queueType);
        const searchParams = new URLSearchParams(window.location.search);
        const topic = searchParams.get('topic') || '';
        const teamId = searchParams.get('teamId') || '';
        const mode = searchParams.get('mode') || 'ranked';
        socket.emit('matchmaking:join', { battleType: queueType, topic, teamId, mode });
        dispatch(setLobbyStatus('queuing'));
      }
    };

    if (socket.connected) {
      handleJoin();
    } else {
      socket.on('connect', handleJoin);
    }

    // ── MATCHMAKING EVENTS ──
    socket.on('matchmaking:found', (data) => {
      console.log('Match paired successfully!', data);
      const oppName = data.opponents
        ? data.opponents.map(o => `@${o.username}`).join(' & ')
        : `@${data.opponent?.username || 'Opponent'}`;
      toast.success('MATCH FOUND! ⚔️', `You are paired against ${oppName}. Starting duel...`);
      // Initialize battle in store (Note: BattleRoom component will trigger countdown)
      dispatch(setLobbyStatus({ status: 'matched', battleId: data.battleId }));
    });

    socket.on('matchmaking:topic_timeout', (data) => {
      toast.warning('Queue taking longer', `No opponents found in topic "${data.topic}" yet.`);
      dispatch(setSuggestedTopic(data.suggestedTopic || 'Dynamic Programming'));
    });

    socket.on('matchmaking:position', (data) => {
      dispatch(setLobbyStatus('queuing'));
    });

    socket.on('matchmaking:left', () => {
      dispatch(setLobbyStatus('idle'));
      toast.info('Left matchmaking queue.');
    });

    // ── BATTLE LIFE-CYCLE EVENTS ──
    socket.on('battle:start', () => {
      console.log('Pre-battle countdown completed. Coding starts!');
    });

    socket.on('battle:opponent_coding', (data) => {
      // Opponent is typing
      dispatch(updateOpponentStatus({
        userId: data.userId,
        status: 'coding',
        language: data.language,
      }));
    });

    socket.on('battle:update', (data) => {
      // Progress / test cases passed updates
      if (data.players && Array.isArray(data.players)) {
        data.players.forEach(p => {
          if (p.user !== (user?._id || user?.id)) {
            dispatch(updateOpponentStatus({
              userId: p.user._id || p.user,
              status: p.status,
              progress: p.progress,
              language: p.language,
            }));
          }
        });
      }
    });

    socket.on('battle:end', (data) => {
      const activeUser = userRef.current;
      const activeTeammate = teammateRef.current;

      const isMeWinner = data.winnerId === activeUser?.id || data.winnerId === activeUser?._id;
      const isTeammateWinner = activeTeammate && data.winnerId === activeTeammate.id;
      const isWinner = isMeWinner || isTeammateWinner;

      const eloDiff = data.ratingDetails?.eloChange !== undefined ? data.ratingDetails.eloChange : 0;
      const eloText = eloDiff >= 0 ? `+${eloDiff}` : `${eloDiff}`;

      if (isWinner) {
        if (isTeammateWinner) {
          toast.success('VICTORY! 🎉', `Teammate solved it! You win! (${eloText} ELO)`);
        } else {
          toast.success('VICTORY! 🎉', `Congratulations, you won the battle! (${eloText} ELO)`);
        }
      } else {
        toast.error('DEFEATED 😤', `Duel lost. Better luck next time! (${eloText} ELO)`);
      }
      dispatch(endBattle(data));
    });

    socket.on('battle:submission_result', (data) => {
      const activeTeammate = teammateRef.current;
      if (activeTeammate && data.userId === activeTeammate.id) {
        if (data.verdict === 'WA') {
          toast.warning('Teammate got WA ✗', `Passed: ${data.testCasesPassed}/${data.totalTestCases}`);
        } else if (data.verdict === 'AC') {
          toast.success('Teammate got AC! 🎉', `All ${data.testCasesPassed}/${data.totalTestCases} test cases passed.`);
        } else {
          toast.info(`Teammate verdict: ${data.verdict}`, `Passed: ${data.testCasesPassed}/${data.totalTestCases}`);
        }
      }
    });

    // ── SUBMISSION PROGRESS EVENT ──
    socket.on('submission:progress', (data) => {
      console.log('Received submission progress:', data.done, '/', data.total);
      dispatch(setOutputProgress({ done: data.done, total: data.total }));
    });

    // ── SUBMISSION RESULT EVENT ──
    socket.on('submission:result', (data) => {
      console.log('Received submission verdict:', data.verdict);

      // Update output screen console
      if (data.verdict === 'AC') {
        toast.success('COMPILATION ACCEPTED! ✓', `All ${data.testCasesPassed}/${data.totalTestCases} test cases passed.`);
      } else {
        toast.warning('VERDICT: ' + data.verdict, `Passed: ${data.testCasesPassed}/${data.totalTestCases}`);
      }

      dispatch(setOutputResults({
        verdict: data.verdict,
        results: data.results || [],
        testCasesPassed: data.testCasesPassed,
        totalTestCases: data.totalTestCases,
        isSubmit: true
      }));
    });

    socket.on('ai:analysis_ready', (data) => {
      console.log('AI Analysis Ready:', data);
      if (data.aiAnalysis) {
        dispatch(setAiAnalysis(data.aiAnalysis));
        toast.info('AI Code Review is ready! ✨', 'Click to view insights and optimizations.');
      }
    });

    socket.on('battle:problem_error', (data) => {
      toast.error('API Offline ⚠️', data.message || 'LeetCode problem service is currently down. Requeuing...');
      dispatch(setLobbyStatus('queuing'));
      window.location.href = '/battle/lobby';
    });

    socket.on('error', (err) => {
      toast.error('Connection Error', err.message || 'WebSocket gateway error occurred.');
    });

    socket.on('battle:error', (data) => {
      toast.error('Battle Error', data.message || 'Unable to join battle room.');
      if (data.redirect) {
        window.location.replace(data.redirect);
      }
    });

    return () => {
      if (socket) {
        if (queueType) {
          console.log('Auto-leaving queue on unmount for format:', queueType);
          const searchParams = new URLSearchParams(window.location.search);
          const mode = searchParams.get('mode') || 'ranked';
          const topic = searchParams.get('topic');
          const payload = { battleType: queueType, mode };
          if (topic) payload.topic = topic;
          socket.emit('matchmaking:leave', payload);
        }
        
        socket.off('connect', handleJoin);
        socket.off('matchmaking:found');
        socket.off('matchmaking:topic_timeout');
        socket.off('matchmaking:position');
        socket.off('matchmaking:left');
        socket.off('battle:start');
        socket.off('battle:opponent_coding');
        socket.off('battle:update');
        socket.off('battle:end');
        socket.off('battle:submission_result');
        socket.off('submission:progress');
        socket.off('submission:result');
        socket.off('ai:analysis_ready');
        socket.off('battle:problem_error');
        socket.off('error');
        socket.off('battle:error');
        
        console.log('Unmounted socket listeners.');
      }
    };
  }, [battleId, queueType, user?.id, dispatch]);

  // ── TRIGGER EMIT FUNCTIONS ──
  const joinQueue = (battleType, options = {}) => {
    if (socketRef.current) {
      const payload = { battleType, mode: options.mode || 'ranked' };
      if (options.topic) payload.topic = options.topic;
      if (options.teamId) payload.teamId = options.teamId;
      
      socketRef.current.emit('matchmaking:join', payload);
      dispatch(setLobbyStatus('queuing'));
    }
  };

  const leaveQueue = (battleType, options = {}) => {
    if (socketRef.current) {
      const payload = { battleType, mode: options.mode || 'ranked' };
      if (options.topic) payload.topic = options.topic;
      if (options.teamId) payload.teamId = options.teamId;
      
      socketRef.current.emit('matchmaking:leave', payload);
    }
  };

  const sendCodeChange = (lang) => {
    if (socketRef.current && battleId) {
      socketRef.current.emit('battle:code_change', { battleId, language: lang });
    }
  };

  const startCountdown = () => {
    if (socketRef.current && battleId) {
      socketRef.current.emit('battle:start_countdown', { battleId });
    }
  };

  const surrenderBattle = () => {
    if (socketRef.current && battleId) {
      socketRef.current.emit('battle:surrender', { battleId });
    }
  };

  const sendTimeout = () => {
    if (socketRef.current && battleId) {
      socketRef.current.emit('battle:timeout', { battleId });
    }
  };

  return {
    socket: socketRef.current,
    joinQueue,
    leaveQueue,
    sendCodeChange,
    startCountdown,
    surrenderBattle,
    sendTimeout,
  };
};

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../useToast';
import { getSocket } from '../../utils/index';
import {
  endBattle,
  setLobbyStatus,
  setOutputResults,
  setOutputProgress,
  setAiAnalysis,
  setTimerStart,
  selectUser
} from '../../features/index';

let strictModeLeaveTimeout = null;

export const useBattleSocket = (battleId = null, queueType = null) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector(selectUser);
  const socketRef = useRef(null);

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
      if (strictModeLeaveTimeout) {
        clearTimeout(strictModeLeaveTimeout);
        strictModeLeaveTimeout = null;
      }
      
      if (battleId) {
        socket.emit('battle:join', { battleId });
      }
      if (queueType) {
        const searchParams = new URLSearchParams(window.location.search);
        const topic = searchParams.get('topic') || '';
        const mode = searchParams.get('mode') || 'ranked';
        socket.emit('matchmaking:join', { battleType: queueType, topic, mode });
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
      // Initialize battle in store (Note: BattleRoom component will trigger countdown)
      dispatch(setLobbyStatus({ status: 'matched', battleId: data.battleId }));
    });

    socket.on('matchmaking:timeout', (data) => {
      toast.error(data.message || 'No user found with your criteria. Please try again later.');
      dispatch(setLobbyStatus('idle'));
      navigate('/');
    });

    socket.on('matchmaking:position', (data) => {
      dispatch(setLobbyStatus('queuing'));
    });

    socket.on('matchmaking:left', () => {
      dispatch(setLobbyStatus('idle'));
      toast.info('You have left the matchmaking queue.');
    });

    // ── BATTLE LIFE-CYCLE EVENTS ──
    socket.on('battle:start', (data) => {
      if (data && data.startTime) {
        dispatch(setTimerStart(data.startTime));
      }
    });


    socket.on('battle:end', (data) => {
      dispatch(endBattle(data));
    });



    // ── SUBMISSION PROGRESS EVENT ──
    socket.on('submission:progress', (data) => {
      dispatch(setOutputProgress({ done: data.done, total: data.total }));
    });

    // ── SUBMISSION RESULT EVENT ──
    socket.on('submission:result', (data) => {

      // Update output screen console
      if (data.verdict === 'AC') {
        toast.success(`All ${data.testCasesPassed}/${data.totalTestCases} test cases passed.`);
      } else {
        toast.warning(`Passed: ${data.testCasesPassed}/${data.totalTestCases}`);
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
      if (data.aiAnalysis) {
        dispatch(setAiAnalysis(data.aiAnalysis));
      }
    });

    socket.on('battle:problem_error', (data) => {
      dispatch(setLobbyStatus('queuing'));
      window.location.href = '/';
    });

    socket.on('error', (err) => {
      toast.error(err.message || 'WebSocket gateway error occurred.');
    });

    socket.on('battle:error', (data) => {
      toast.error(data.message || 'Unable to join battle room.');
      if (data.redirect) {
        window.location.replace(data.redirect);
      }
    });

    return () => {
      if (socket) {
        if (queueType) {
          const searchParams = new URLSearchParams(window.location.search);
          const mode = searchParams.get('mode') || 'ranked';
          const topic = searchParams.get('topic');
          const payload = { battleType: queueType, mode };
          if (topic) payload.topic = topic;
          
          // Debounce the leave event to prevent React StrictMode spam in development
          strictModeLeaveTimeout = setTimeout(() => {
            socket.emit('matchmaking:leave', payload);
          }, 300);
        }
        
        socket.off('connect', handleJoin);
        socket.off('matchmaking:found');
        socket.off('matchmaking:timeout');
        socket.off('matchmaking:position');
        socket.off('matchmaking:left');
        socket.off('battle:start');

        socket.off('battle:end');
        socket.off('battle:submission_result');
        socket.off('submission:progress');
        socket.off('submission:result');
        socket.off('ai:analysis_ready');
        socket.off('battle:problem_error');
        socket.off('error');
        socket.off('battle:error');
        
      }
    };
  }, [battleId, queueType, user?.id, dispatch]);

  // ── TRIGGER EMIT FUNCTIONS ──
  const joinQueue = (battleType, options = {}) => {
    if (socketRef.current) {
      const payload = { battleType, mode: options.mode || 'ranked' };
      if (options.topic) payload.topic = options.topic;
      
      socketRef.current.emit('matchmaking:join', payload);
      dispatch(setLobbyStatus('queuing'));
    }
  };

  const leaveQueue = (battleType, options = {}) => {
    if (socketRef.current) {
      const payload = { battleType, mode: options.mode || 'ranked' };
      if (options.topic) payload.topic = options.topic;
      
      socketRef.current.emit('matchmaking:leave', payload);
      dispatch(setLobbyStatus('idle'));
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

    startCountdown,
    surrenderBattle,
    sendTimeout,
  };
};